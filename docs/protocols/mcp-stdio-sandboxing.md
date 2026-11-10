---
title: "MCP Stdio Process Sandboxing"
sidebar_position: 4
description: "Process isolation, environment variable scrubbing, execution timeouts, and binary allowlists for local command-line MCP tools."
---

# MCP Stdio Process Sandboxing

Local command-line MCP tools (such as CLI database clients, git helpers, file system scanners, and Python analysis scripts) communicate over standard input and output streams (`stdin` / `stdout`).

Executing untrusted or arbitrary binaries on a production host presents critical security risks:
- **Environment Leakage**: Malicious child processes could inspect parent environment variables and exfiltrate database credentials, cloud access keys, or the gateway's AES-256 master keys.
- **Resource Exhaustion**: Hung or runaway scripts could consume 100% CPU, leak file descriptors, or flood stdout to exhaust system memory.
- **Arbitrary Code Execution**: Attackers attempting command injection could spawn unauthorized shells (`/bin/sh`, `/bin/bash`, `nc`).

GoRoute AI Gateway embeds a secure **Process Supervisor** (`internal/mcp/transport_stdio.go`) that isolates Stdio tools inside strict execution sandboxes with fail-closed access controls.

```mermaid
flowchart TD
    Req["Gateway Tool Invocation"] --> CheckAllow{"Binary in AllowedBinaries?"}
    
    CheckAllow -->|No| Reject["403 ErrBinaryNotAllowed<br/>(Fail-Closed)"]
    CheckAllow -->|Yes| Sandbox["Spawn Subprocess Sandbox"]
    
    subgraph Subprocess["Isolated Child Process"]
        Env["Purged Environment<br/>PATH, HOME, GOROUTE_SANDBOX=1<br/>(Master keys stripped)"]
        Timeout["Context Deadline (30s)<br/>(Auto SIGKILL on timeout)"]
        Buffer["Output Buffer Limit (10MB)<br/>(io.LimitReader)"]
        Stderr["Background Stderr Drain"]
    end
    
    Sandbox --> Subprocess
    Subprocess --> Res["Parse Line-Delimited JSON-RPC Response"]
```

---

## 1. Security Architecture & Invariants

### 1. Fail-Closed Binary Allowlists

The supervisor will refuse to spawn any binary unless it explicitly appears in `StdioSecurityPolicy.AllowedBinaries`.

```go
// StdioSecurityPolicy defines the sandboxing rules for subprocess execution.
type StdioSecurityPolicy struct {
	AllowedBinaries []string      `json:"allowed_binaries"`
	DefaultTimeout  time.Duration `json:"default_timeout"`
	MaxOutputBytes  int64         `json:"max_output_bytes"`
}
```

The gateway checks both the absolute filesystem path and the executable base name (`filepath.Base`):
```go
func (t *StdioTransport) isBinaryAllowed(binaryPath string) bool {
	if len(t.policy.AllowedBinaries) == 0 {
		return false // Fail closed if allowlist is empty
	}
	base := filepath.Base(binaryPath)
	for _, allowed := range t.policy.AllowedBinaries {
		if allowed == "*" || allowed == binaryPath || allowed == base {
			return true
		}
	}
	return false
}
```

If an unauthorized binary is requested, execution halts immediately with `ErrBinaryNotAllowed`:
```text
mcp: stdio binary is not in approved allowlist: "/bin/sh"
```

### 2. Strict Environment Variable Scrubbing

When launching child processes, the gateway completely purges the host process environment. Secrets such as `GATEWAY_MASTER_ADMIN_KEY`, `GATEWAY_MASTER_ENCRYPTION_KEY`, and `GATEWAY_POSTGRES_DSN` are never inherited by child processes:

```go
// Scrub environment variables: strictly isolate process from gateway secrets
cmd.Env = []string{
    "PATH=" + os.Getenv("PATH"),
    "HOME=" + os.Getenv("HOME"),
    "LANG=en_US.UTF-8",
    "GOROUTE_SANDBOX=1",
}

// Inject only explicitly declared static headers as environment variables
for k, v := range server.StaticHeaders {
    safeKey := strings.ToUpper(strings.ReplaceAll(k, "-", "_"))
    cmd.Env = append(cmd.Env, safeKey+"="+v)
}
```

### 3. Execution Deadlines & Resource Quotas

- **Default Timeout (30s)**: Every tool invocation is governed by `context.WithTimeout(ctx, policy.DefaultTimeout)`. If a process hangs, enters an infinite loop, or waits for user input, the supervisor terminates it immediately with `SIGKILL`.
- **Output Buffer Clamping (10 MB)**: Stdout streams are bounded via `io.LimitReader(stdout, policy.MaxOutputBytes)`. A runaway process attempting to flood the output buffer is truncated, preventing out-of-memory panics.
- **Background Stderr Diagnostics**: Stderr is drained in an independent background goroutine. If a subprocess crashes with a non-zero exit code, its stderr diagnostics are captured in gateway logs to assist operators without polluting JSON-RPC stdout channels.

---

## 2. Configuration (`configs/config.yaml`)

To enable and configure Stdio execution in your deployment:

```yaml
mcp:
  enabled: true
  # Explicitly enable local subprocess execution (defaults to false)
  allow_stdio_servers: true
  execution_timeout_seconds: 30
  max_payload_bytes: 10485760 # 10 MB

  # Permitted executable allowlist
  allowed_binaries:
    - "/usr/local/bin/git"
    - "sqlite3"
    - "node"
    - "python3"
```

---

## 3. Registering a Stdio MCP Server via Admin API

Register a local CLI tool using the `stdio://` URL scheme:

```bash
curl -X POST "http://localhost:8080/admin/v1/mcp-servers" \
  -H "Authorization: Bearer sk-gw-master-admin-default-key-change-me" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "local-sqlite",
    "name": "Local SQLite Query Tool",
    "transport_type": "stdio",
    "protocol_version": "2026-07-28",
    "endpoint_url": "stdio://sqlite3 /data/production.db",
    "is_active": true,
    "static_headers": {
      "SQLITE_ENABLE_JSON1": "1"
    }
  }'
```

### Argument Parsing & Quotes
The gateway's command parser (`parseCommandLine`) handles quoted arguments and backslash escapes cleanly:
```text
stdio://python3 /opt/tools/analyzer.py --mode="read-only" --db="sales report.db"
```

---

## 4. Operational Best Practices

> [!NOTE]
> In containerized Kubernetes deployments, ensure that any binaries referenced by Stdio servers are pre-installed in the container image or mounted via read-only volumes.

> [!CAUTION]
> Never add general-purpose command interpreters (such as `bash`, `sh`, `zsh`, `sudo`, or `eval`) to `allowed_binaries`. Restrict the allowlist strictly to dedicated CLI utilities with known, bounded execution profiles.

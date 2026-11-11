---
title: "Complete Configuration and Environment Reference"
sidebar_position: 2
description: "Comprehensive configuration reference detailing 70+ YAML parameters, environment variable overrides, and model routing policies."
---

# Complete Configuration and Environment Reference

GoRoute AI Gateway supports a layered configuration architecture:
1. **Built-in Defaults**: Hardcoded, zero-dependency defaults optimized for instant developer startup.
2. **Declarative YAML (`configs/config.yaml`)**: Structured configuration defining storage backends, security boundaries, rate limits, model groups, and routing topologies.
3. **Environment Variable Overrides (`GATEWAY_*` / `os.environ/VAR`)**: Production overrides for Kubernetes ConfigMaps, container runtime secrets, and 12-factor cloud deployments.
4. **Go SDK Options (`pkg/gateway`)**: In-process configuration primitives for embedded architectures.

---

## 1. Quickstart Configuration Modes

### Mode A: Zero-Config Environment Variables (Fastest)

Set your upstream provider API keys directly in your shell or container definition. The gateway automatically spins up an in-memory repository, provisions an AES-256-GCM vault, and configures default model aliases:

```bash
# Frontier LLM Providers
export OPENAI_API_KEY="sk-proj-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIzaSy..."
export MISTRAL_API_KEY="mis_..."

# Enterprise Cloud Hyperscalers
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
export GCP_PROJECT_ID="my-gcp-project"
export GCP_REGION="us-central1"

# Gateway Master Secrets
export GATEWAY_MASTER_ADMIN_KEY="sk-gw-master-secret-passphrase-change-me"
export GATEWAY_MASTER_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Launch Gateway
./ai-gateway
```

### Mode B: Production Declarative YAML

Supply the path to your YAML configuration file via the `-config` CLI argument:

```bash
./ai-gateway -config /etc/goroute/config.yaml
```

The gateway resolves environment variable secret placeholders matching `os.environ/VARIABLE_NAME` inside strings dynamically during YAML parsing:

```yaml
model_params:
  model: "openai/gpt-4o"
  api_key: "os.environ/OPENAI_API_KEY"
```

---

## 2. Complete 70+ Configuration Options Matrix

The table below documents every configurable parameter across all gateway subsystems.

| YAML Path | Environment Variable Override | Default | Subsystem & Description |
| :--- | :--- | :--- | :--- |
| `server.host` | — | `"0.0.0.0"` | **Server**: HTTP network bind address. |
| `server.port` | `GATEWAY_PORT` | `8080` | **Server**: HTTP listen port (`1`–`65535`). |
| `server.read_timeout` | — | `30s` | **Server**: Maximum duration for reading the entire request body. |
| `server.write_timeout` | — | `300s` | **Server**: Maximum duration before timing out writes (sized for reasoning streams). |
| `server.idle_timeout` | — | `120s` | **Server**: Maximum time to wait for the next request when keep-alives are enabled. |
| `server.shutdown_timeout` | — | `15s` | **Server**: Graceful shutdown deadline before force-closing active HTTP streams. |
| `logging.level` | `GATEWAY_LOG_LEVEL` | `"info"` | **Logging**: Log verbosity: `"debug"`, `"info"`, `"warn"`, `"error"`. |
| `logging.format` | `GATEWAY_LOG_FORMAT` | `"text"` | **Logging**: `"json"` (cloud structured) or `"text"` (CLI). Auto-selects `"json"` if `ENV=production`. |
| `logging.add_source` | `GATEWAY_LOG_ADD_SOURCE` | `false` | **Logging**: Annotates log lines with source `file:line` for developer debugging. |
| `storage.mode` | `GATEWAY_STORAGE_MODE` | `"memory"` | **Storage**: Repository backend: `"memory"` or `"postgres"`. |
| `storage.postgres_dsn` | `GATEWAY_POSTGRES_DSN` | `""` | **Storage**: PostgreSQL connection DSN (`postgres://user:pass@host:5432/db`). |
| `storage.redis_addr` | `GATEWAY_REDIS_ADDR` | `"localhost:6379"` | **Storage**: Redis host:port for L2 auth caching, Lua rate limits, and pub/sub. |
| `storage.redis_pass` | `GATEWAY_REDIS_PASS` | `""` | **Storage**: Optional Redis authentication password. |
| `storage.redis_db` | — | `0` | **Storage**: Redis logical database index (`0`–`15`). |
| `auth.master_admin_key` | `GATEWAY_MASTER_ADMIN_KEY` | *(auto-generated)* | **Auth**: Master Bearer token for `/admin/v1/*` control plane APIs. |
| `auth.master_encryption_key` | `GATEWAY_MASTER_ENCRYPTION_KEY` | *(auto-generated)* | **Auth**: 64-character hex string (32-byte key) for AES-256-GCM vault encryption. |
| `auth.jwt_secret` | `GATEWAY_JWT_SECRET` | *(random)* | **Auth**: HMAC secret used for signing internal short-lived JWT tokens. |
| `auth.default_org_id` | — | `"org_default"` | **Auth**: Primary root organization identifier seeded on initial startup. |
| `auth.default_virtual_key` | `GATEWAY_DEFAULT_KEY` | `""` | **Auth**: Optional pre-seeded client virtual key for automated integration testing. |
| `auth.l1_cache_ttl` | — | `15s` | **Auth**: In-memory L1 cache TTL for virtual key validation and identity contexts. |
| `auth.l2_cache_ttl` | — | `5m` | **Auth**: Redis L2 cache TTL for virtual key validation across clustered pods. |
| `router.default_fast_alias` | — | `"fast"` | **Router**: Virtual model alias routing to high-throughput, low-latency models. |
| `router.default_reasoning_alias` | — | `"reasoning"` | **Router**: Virtual model alias routing to frontier deep-reasoning models. |
| `router.default_coding_alias` | — | `"coding"` | **Router**: Virtual model alias routing to specialized code-generation models. |
| `router.complexity_threshold` | — | `0.40` | **Router**: Prompt complexity heuristic score `[0.0, 1.0]` triggering `"auto"` $\rightarrow$ `"reasoning"`. |
| `router.long_context_tokens` | — | `32000` | **Router**: Input token threshold triggering automatic routing to long-context engines. |
| `router.default_max_retries` | — | `2` | **Router**: Maximum intra-deployment retries before failing over to fallback chain. |
| `router.base_retry_delay` | `GATEWAY_ROUTER_BASE_RETRY_DELAY` | `50ms` | **Router**: Base backoff delay for full-jitter exponential retry calculations. |
| `router.max_retry_delay` | `GATEWAY_ROUTER_MAX_RETRY_DELAY` | `2s` | **Router**: Maximum ceiling delay between retry attempts. |
| `router.default_cooldown` | `GATEWAY_ROUTER_DEFAULT_COOLDOWN` | `60s` | **Router**: Duration a tripped deployment remains isolated in `OPEN` circuit breaker state. |
| `router.failure_window` | — | `30s` | **Router**: Sliding time window for tracking consecutive upstream provider errors. |
| `router.failure_threshold` | — | `3` | **Router**: Number of consecutive errors required to trip deployment circuit breaker. |
| `rate_limit.enabled` | — | `true` | **Rate Limit**: Enables distributed sliding-window rate limiting via Redis Lua scripts. |
| `rate_limit.window_seconds` | — | `60` | **Rate Limit**: Window duration in seconds for RPM and TPM rate tracking. |
| `rate_limit.concurrency_ttl_sec` | — | `300` | **Rate Limit**: TTL lease in seconds for tracking concurrent in-flight requests. |
| `rate_limit.default_estimated_tpm` | — | `128` | **Rate Limit**: Heuristic token estimate reserved prior to parsing request payload. |
| `rate_limit.redis_timeout` | — | `50ms` | **Rate Limit**: Timeout for Redis rate check execution before failing closed. |
| `finops.channel_buffer_size` | — | `16384` | **FinOps**: Asynchronous ring buffer capacity for in-flight spend ledger events. |
| `finops.batch_size` | — | `250` | **FinOps**: Maximum spend records batched into a single database bulk insert. |
| `finops.flush_interval` | `GATEWAY_FINOPS_FLUSH_INTERVAL` | `500ms` | **FinOps**: Maximum interval between background spend ledger flushes. |
| `finops.max_unflushed_age` | — | `5s` | **FinOps**: Hard timeout forcing asynchronous spend ledger buffer flush. |
| `discovery.auto_approve_discovered_models` | — | `true` | **Discovery**: Automatically activates newly discovered upstream models. |
| `discovery.poll_interval_hours` | — | `24` | **Discovery**: Interval in hours between background upstream provider catalog syncs. |
| `discovery.enable_background_sync` | — | `true` | **Discovery**: Enables background discovery daemon across enabled providers. |
| `security.network.egress_proxy_url` | `GATEWAY_EGRESS_PROXY_URL` | `""` | **Network**: Corporate HTTP/HTTPS egress proxy URL for enterprise firewalls. |
| `security.network.outbound_ssrf.allow_private_networks` | `GATEWAY_SSRF_ALLOW_PRIVATE` | `false` | **SSRF**: Enables egress to private/internal IPs (must be `false` in production). |
| `security.network.outbound_ssrf.allowed_private_cidrs` | — | `[]` | **SSRF**: Explicit CIDR allowlist (e.g. `["10.240.0.0/16"]`) when egress is gated. |
| `security.network.outbound_ssrf.allow_insecure_http` | `GATEWAY_SSRF_ALLOW_INSECURE_HTTP` | `false` | **SSRF**: Permits unencrypted HTTP upstream calls (prohibited in production). |
| `security.network.outbound_ssrf.allowed_schemes` | — | `["https"]` | **SSRF**: Permitted URL schemes for provider endpoints (`https`, `http`). |
| `security.network.outbound_ssrf.blocked_ips` | — | `["169.254.169.254", ...]` | **SSRF**: Cloud instance metadata IPs blocked from outbound routing. |
| `security.network.outbound_ssrf.dial_timeout` | — | `10s` | **SSRF**: Network connect and TLS handshake timeout for outbound calls. |
| `security.network.outbound_ssrf.max_redirects` | — | `3` | **SSRF**: Maximum allowed HTTP redirect hops on outbound provider requests. |
| `security.network.inbound_caller.expose_on_public_internet` | — | `false` | **Network**: Policy flag asserting whether gateway is exposed to public web. |
| `security.network.inbound_caller.allowed_client_cidrs` | — | `[]` | **Network**: Client CIDR allowlist restricting incoming caller IP addresses. |
| `mcp.enabled` | — | `true` | **MCP**: Activates Model Context Protocol virtual hub and bridge endpoints. |
| `mcp.allow_stdio_servers` | — | `false` | **MCP**: Permits spawning local command-line subprocess MCP tool servers. |
| `mcp.session_ttl_minutes` | — | `15` | **MCP**: Inactivity timeout for stateful 2025-11-25 MCP SSE sessions. |
| `mcp.execution_timeout_seconds` | — | `30` | **MCP**: Maximum execution duration for individual MCP tool calls. |
| `mcp.max_payload_bytes` | — | `10485760` | **MCP**: Maximum allowed tool request and response payload size (10 MB). |
| `mcp.handle_ttl` | — | `1h` | **MCP**: Cache TTL for 256-bit progressive discovery tool handles (`tool_hdl_...`). |
| `a2a.enabled` | — | `true` | **A2A**: Activates Linux Foundation Agent-to-Agent v1.0 protocol router. |
| `a2a.allow_http_binding` | — | `true` | **A2A**: Enables standard REST HTTP+JSON binding on `/a2a/v1/*`. |
| `a2a.allow_jsonrpc_binding` | — | `true` | **A2A**: Enables JSON-RPC 2.0 protocol binding on `/a2a/v1/*`. |
| `a2a.allow_legacy_card_discovery` | — | `false` | **A2A**: Allows unsigned or legacy uncanonicalized agent card discovery. |
| `a2a.max_task_lifespan` | — | `24h` | **A2A**: Retention period for active and completed A2A task records. |
| `a2a.stream_buffer_capacity` | — | `256` | **A2A**: Ring buffer event capacity for SSE task streaming subscribers. |
| `a2a.stream_publish_interval` | `GATEWAY_A2A_STREAM_PUBLISH_INTERVAL` | `50ms` | **A2A**: Polling interval for background task stream publication daemon. |
| `a2a.max_push_retries` | `GATEWAY_A2A_MAX_PUSH_RETRIES` | `5` | **A2A**: Maximum webhook push notification delivery retries before Dead Lettering. |
| `a2a.signing_key_id` | `GATEWAY_A2A_SIGNING_KEY_ID` | `"gw-a2a-signer-v1"` | **A2A**: Key ID for RFC 8785 JCS canonicalization and JWS Agent Card signing. |
| `a2a.allowed_signing_algs` | — | `["ES256", "RS256", "EdDSA"]` | **A2A**: Permitted cryptographic algorithms for incoming Agent Cards. |
| `a2a.trusted_card_jwks` | — | `{}` | **A2A**: Map of upstream agent slug to JWKS URL for signature verification. |
| `files.storage_dir` | `GOROUTE_FILES_DIR` | `os.TempDir()/goroute-files` | **Files**: Local disk directory for stateful tenant assets and batch files (`0700` dir, `0600` file mode). |
| `providers.custom_openai_compatible[].id` | — | — | **Custom Provider**: Unique string identifier (e.g. `"inhouse-vllm"`). |
| `providers.custom_openai_compatible[].display_name` | — | — | **Custom Provider**: Human-readable label for logs and UI. |
| `providers.custom_openai_compatible[].base_url` | — | — | **Custom Provider**: Target endpoint base URL (e.g. `http://vllm-cluster:8000/v1`). |
| `providers.custom_openai_compatible[].supports_streaming` | — | `"true"` | **Custom Provider**: Streaming capability override (`"true"`, `"false"`, `"unknown"`). |
| `providers.custom_openai_compatible[].supports_tools` | — | `"true"` | **Custom Provider**: Function/tool calling capability override. |
| `providers.custom_openai_compatible[].supports_structured_outputs` | — | `"true"` | **Custom Provider**: Structured outputs (`response_format: json_schema`) support. |
| `providers.custom_openai_compatible[].supports_list_models` | — | `true` | **Custom Provider**: Whether upstream endpoint implements `GET /models`. |
| `providers.custom_openai_compatible[].default_headers` | — | `{}` | **Custom Provider**: HTTP headers automatically attached to outbound calls. |

---

## 3. Model List & Root-Level Fallback Nesting

The `model_list` array defines the virtual routing topology presented to clients.

### Root-Level `fallbacks: [...]` Nesting Architecture

Each entry in `model_list` defines:
1. `model_name`: The virtual alias or model identifier requested by the client (e.g., `"fast"`, `"reasoning"`, `"gpt-4o"`).
2. `routing_strategy`: The balancing algorithm across sibling deployments (`"weighted-shuffle"`, `"least-busy"`, `"latency-based"`, `"lowest-cost"`, `"usage-based-headroom"`).
3. `fallbacks`: **Explicit root-level array** of fallback model names triggered when this model group experiences an outage, exhausted retries, or rate limit rejections.
4. `model_params`: Upstream target configuration (`model`, `api_key`, `weight`, `rpm`, `tpm`, `azure_deployment_name`, etc.).

```mermaid
flowchart TD
    Client["Client Request: model: 'gpt-4o'"] --> Primary["Primary Group: gpt-4o<br/>(openai/gpt-4o)"]
    Primary -->|"HTTP 429 / 5xx & Retries Exhausted"| FB1["Fallback 1: claude-3-5-sonnet<br/>(anthropic/claude-3-5-sonnet)"]
    FB1 -->|"HTTP 429 / 5xx & Retries Exhausted"| FB2["Fallback 2: gemini-2.5-pro<br/>(gemini/gemini-2.5-pro)"]
    FB2 -->|Success| Response["200 OK (X-Gateway-Provider: gemini)"]
```

### Declarative Example: Multi-Tier Failover

```yaml
model_list:
  # Primary Tier: GPT-4o with cross-cloud fallbacks
  - model_name: "gpt-4o"
    routing_strategy: "weighted-shuffle"
    fallbacks:
      - "claude-3-5-sonnet"
      - "gemini-2.5-pro"
    model_params:
      model: "openai/gpt-4o"
      api_key: "os.environ/OPENAI_API_KEY"
      weight: 100
      rpm: 1000
      tpm: 80000

  # Fallback Tier 1: Claude 3.5 Sonnet
  - model_name: "claude-3-5-sonnet"
    routing_strategy: "latency-based"
    fallbacks:
      - "gemini-2.5-pro"
    model_params:
      model: "anthropic/claude-3-5-sonnet-20241022"
      api_key: "os.environ/ANTHROPIC_API_KEY"
      weight: 100

  # Fallback Tier 2: Gemini 2.5 Pro
  - model_name: "gemini-2.5-pro"
    routing_strategy: "weighted-shuffle"
    model_params:
      model: "gemini/gemini-2.5-pro"
      api_key: "os.environ/GEMINI_API_KEY"
      weight: 100

  # High-Throughput "fast" Group: Multi-Provider Load Balancing
  - model_name: "fast"
    routing_strategy: "least-busy"
    fallbacks:
      - "fast-backup"
    model_params:
      model: "gemini/gemini-2.5-flash"
      api_key: "os.environ/GEMINI_API_KEY"
      weight: 70

  - model_name: "fast"
    routing_strategy: "least-busy"
    model_params:
      model: "openai/gpt-4o-mini"
      api_key: "os.environ/OPENAI_API_KEY"
      weight: 30

  # Emergency Local Backup
  - model_name: "fast-backup"
    routing_strategy: "weighted-shuffle"
    model_params:
      model: "ollama/llama3.3"
      api_base: "http://localhost:11434"
      weight: 100
```

> [!IMPORTANT]
> The `fallbacks: [...]` slice is declared at the root level of each `model_list` entry alongside `model_name` and `model_params`. It must never be nested inside the `model_params` object. The router traverses fallbacks strictly in listed order, respecting circuit breaker states for each candidate before dispatching.

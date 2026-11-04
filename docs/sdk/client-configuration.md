---
title: Client Initialization & Configuration
sidebar_position: 2
---

# Client Initialization & Configuration

The `pkg/gateway` package uses functional options to configure an embedded gateway or a remote gateway client.

---

## 1. Initializing the Client

### `gateway.New(opts ...Option) (*Client, error)`

Initializes a client. If `WithRemote(...)` is provided, it connects to that remote service. Otherwise, it loads configuration and starts an embedded gateway server in the current process:

```go
gw, err := gateway.New(
    gateway.WithModelList(
        gateway.ModelEntry{ModelName: "fast", Model: "gemini/gemini-2.5-flash"},
    ),
    gateway.WithLogLevel("info"),
)
if err != nil {
    log.Fatalf("failed to initialize: %v", err)
}
defer gw.Close()
```

### `gateway.NewClient(baseURL, apiKey string) *Client`

Creates an HTTP client pointing to an already-running GoRoute server or container:

```go
client := gateway.NewClient("http://localhost:8080", "sk-gw-developer-key")
```

---

## 2. Configuration Options

### `WithModelList(entries ...ModelEntry) Option`

Configures the embedded router with declarative model aliases, fallbacks, and routing strategies.

```go
gw, err := gateway.New(
    gateway.WithModelList(
        gateway.ModelEntry{
            ModelName:       "smart-router",
            Model:           "gemini/gemini-2.5-flash",
            APIKey:          "os.environ/GEMINI_API_KEY",
            RoutingStrategy: "least-busy",
            Fallbacks:       []string{"backup-claude"},
            RPM:             1000,
            TPM:             500000,
        },
        gateway.ModelEntry{
            ModelName: "backup-claude",
            Model:     "anthropic/claude-sonnet-4-20250514",
            APIKey:    "os.environ/ANTHROPIC_API_KEY",
        },
    ),
)
```

#### `ModelEntry` Specification

| Field | Type | Description |
| :--- | :--- | :--- |
| `ModelName` | `string` | Client-facing alias (e.g. `"fast"`, `"reasoning"`, `"auto"`). |
| `Model` | `string` | Upstream provider/model identifier (e.g. `"gemini/gemini-2.5-flash"`, `"anthropic/claude-sonnet-4-20250514"`, `"openai/gpt-4.1-mini"`). |
| `APIKey` | `string` | Upstream API key string or environment reference (e.g. `"os.environ/GEMINI_API_KEY"`). |
| `APIBase` | `string` | Optional custom endpoint URL (e.g. for Ollama or private vLLM clusters: `"http://localhost:11434"`). |
| `RoutingStrategy`| `string` | Routing policy: `"weighted-shuffle"`, `"least-busy"`, `"latency-based"`, `"usage-based-headroom"`, or `"lowest-cost"`. |
| `Fallbacks` | `[]string`| Ordered list of model aliases to invoke if this model returns 429, 503, or times out. |
| `Weight` | `int` | Integer weight for `"weighted-shuffle"` distribution. |
| `RPM` | `int` | Requests Per Minute limit enforced across this model entry. |
| `TPM` | `int` | Tokens Per Minute limit enforced across this model entry. |
| `SimulateStatus` | `int` | Optional fault injection HTTP code (e.g. `503`) to test circuit breakers and fallback chains offline. |

---

### `WithConfigFile(path string) Option`

Loads model definitions, rate limits, and security policies from an external YAML file:

```go
gw, err := gateway.New(
    gateway.WithConfigFile("./config/gateway.yaml"),
)
```

**Sample YAML (`gateway.yaml`):**
```yaml
model_list:
  - model_name: "production-fast"
    model_params:
      model: "gemini/gemini-2.5-flash"
      api_key: "os.environ/GEMINI_API_KEY"
      rpm: 1000
    fallbacks: ["production-backup"]
  - model_name: "production-backup"
    model_params:
      model: "openai/gpt-4.1-mini"
      api_key: "os.environ/OPENAI_API_KEY"
```

---

### `WithDemoMocksIfEnvMissing() Option`

Enables built-in local mock HTTP servers for any `ModelEntry` whose environment variable API key is not present. This allows unit tests, integration tests, and local demos to run immediately without requiring live provider credentials or incurring costs.

```go
gw, err := gateway.New(
    gateway.WithModelList(
        gateway.ModelEntry{ModelName: "test-model", Model: "gemini/gemini-2.5-flash"},
    ),
    gateway.WithDemoMocksIfEnvMissing(), // Mock provider handles requests locally
)
```

---

### Logging Options

Control internal gateway logging using Go standard library's `log/slog`:

- **`WithLogger(l *slog.Logger) Option`**: Provide a custom `slog.Logger` instance.
- **`WithSilentLogs() Option`**: Suppress all stdout/stderr logs (ideal for CLI tools or clean terminal outputs).
- **`WithLogLevel(level string) Option`**: Set minimum log level (`"debug"`, `"info"`, `"warn"`, `"error"`).

```go
customLogger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

gw, err := gateway.New(
    gateway.WithLogger(customLogger),
)
```

---

### `WithRemote(baseURL, apiKey string) Option`

Redirects `gateway.New` to connect to a remote gateway daemon instead of starting an embedded router:

```go
gw, err := gateway.New(
    gateway.WithRemote("https://ai-gateway.company.com", "sk-gw-production"),
)
```

---

## 3. Client Lifecycle & Scoping

### Dynamic Key Switching with `WithKey`

In multi-tenant backend services, create a shallow copy of the client with a tenant's specific Virtual API Key. The base connection and connection pooling are shared:

```go
// Base client initialized once at service startup
masterClient, _ := gateway.New(...)

// HTTP handler for tenant A
func TenantAHandler(w http.ResponseWriter, r *http.Request) {
    tenantKey := r.Header.Get("X-Tenant-Key")
    tenantClient := masterClient.WithKey(tenantKey)

    // Chat requests are now governed by tenantKey's budget, rate limits, and model allowances
    res, err := tenantClient.Chat(r.Context(), "fast", "Process tenant query")
    ...
}
```

### Teardown with `Close`

For embedded instances, `Close()` cleanly shuts down background workers, flushes remaining telemetry events, and terminates local mock servers:

```go
defer gw.Close()
```

*(For remote clients created via `NewClient`, `Close()` is a safe no-op).*

### Endpoint Inspection with `BaseURL`

Inspect the loopback HTTP URL generated for the in-process server (e.g. `http://127.0.0.1:54321`):

```go
fmt.Printf("Embedded gateway listening internally on: %s\n", gw.BaseURL())
```

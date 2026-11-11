---
title: "MCP Progressive Tool Discovery"
sidebar_position: 3
description: "Manage hundreds of enterprise tools without context window bloat using 256-bit opaque handles, registry feeds, schema hydration meta-tools, and governed OpenAPI transport."
---

# MCP Progressive Tool Discovery

In enterprise AI deployments, organizations frequently integrate dozens of Model Context Protocol (MCP) servers and external APIs, resulting in catalogs spanning hundreds or thousands of callable tools.

Directly serializing every tool's complete JSON Schema into an LLM's system prompt introduces severe operational bottlenecks:
- **Massive Context Consumption**: 100+ complete tool definitions consume between 20,000 to 50,000 input tokens per inference request.
- **FinOps Inefficiencies**: Sending massive schemas on every chat turn exponentially inflates API costs.
- **Model Attention Degradation**: Overly long system prompts impair the model's ability to focus on user instructions and reasoning steps.
- **Security & Poisoning Risks**: Exposing internal database structures and schemas upfront increases exposure to indirect prompt injection attacks.

GoRoute AI Gateway solves this challenge through **MCP Progressive Tool Discovery**, a token-efficient architecture using compact 256-bit opaque handles (`tool_hdl_...`), an enterprise registry feed (`GET /v1/goroute/mcp/registry`), schema hydration meta-tools, and governed OpenAPI 3.0/3.1 transport.

---

## 1. Architectural Overview

```mermaid
sequenceDiagram
    participant User as Client / Agent
    participant GW as GoRoute AI Gateway
    participant Redis as Redis Fabric (L2)
    participant Upstream as Upstream MCP Server

    User->>GW: 1. GET /v1/goroute/mcp/registry
    GW-->>User: 2. Lightweight Feed (Name & tool_hdl)
    Note over User: Agent selects required tool
    User->>GW: 3. POST /v1/chat/completions (search_tools)
    GW-->>User: 4. Compact Matches with Opaque Handles
    User->>GW: 5. POST /mcp (get_tool_schema)
    GW->>Redis: 6. Resolve Handle & Verify Hash
    Redis-->>GW: 7. Verified Handle Record
    GW-->>User: 8. Full Input JSON Schema
    User->>GW: 9. POST /mcp (Execute tool call)
    GW->>Upstream: 10. Forward Tool Invocation
    Upstream-->>GW: 11. Tool Result Payload
    GW-->>User: 12. Execution Response
```

Instead of sending full schemas upfront, the gateway supplies the LLM with two lightweight meta-tools (`search_tools` and `get_tool_schema`), allowing the agent to discover and hydrate only the exact schemas required for the immediate task.

---

## 2. 256-Bit Opaque Tool Handles (`tool_hdl_...`)

When tools are indexed by the gateway, the `ProgressiveDiscoveryManager` generates a cryptographically random 256-bit handle with the `tool_hdl_` prefix.

### Handle Generation (`internal/mcp/progressive_discovery.go`)

```go
const (
	HandlePrefix   = "tool_hdl_"
	HandleTTL      = 1 * time.Hour
	RedisHdlPrefix = "gw:mcp:hdl:"
)

// ToolHandleRecord stores the binding between a 256-bit opaque handle and a verified tool.
type ToolHandleRecord struct {
	Handle     string    `json:"handle"`
	ToolID     string    `json:"tool_id"`
	ServerID   string    `json:"server_id"`
	ServerSlug string    `json:"server_slug"`
	ToolName   string    `json:"tool_name"`
	SchemaHash string    `json:"schema_hash"`
	OrgID      string    `json:"org_id"`
	CreatedAt  time.Time `json:"created_at"`
	ExpiresAt  time.Time `json:"expires_at"`
}
```

Each handle is backed by 32 bytes (256 bits) of cryptographically secure random entropy (`crypto/rand`), yielding a 64-character hex string:
```text
tool_hdl_a4f91c0e38b29d47c6e11894a3bc76d892015fa43d67bc1e89e02345fa6712bc
```

### Fail-Closed Freshness Verification

Handles have a 1-hour TTL (`HandleTTL = 1 * time.Hour`) and are cached in Redis under `gw:mcp:hdl:{handle}`.

When an agent presents a handle to hydrate a schema, the gateway performs strict cryptographic freshness verification:
1. The gateway looks up the `ToolHandleRecord` in Redis or in-memory fallback.
2. The gateway retrieves the current tool definition from the repository database.
3. The gateway compares the tool's SHA-256 schema hash (`tool.ToolDefHash`) with the recorded hash in the handle (`record.SchemaHash`).
4. If an upstream administrator has updated or modified the tool schema during the session, the gateway rejects the request with `ErrStaleToolHandle`:

```go
if tool.ToolDefHash != record.SchemaHash {
    return nil, nil, fmt.Errorf("%w: handle schema hash %s does not match repository hash %s", 
        ErrStaleToolHandle, record.SchemaHash, tool.ToolDefHash)
}
```

> [!IMPORTANT]
> Fail-closed freshness verification prevents race conditions and schema injection: an agent cannot execute a cached tool if the underlying schema or permissions have been altered while the handle was in flight.

---

## 3. Catalog Registry Feed (`GET /v1/goroute/mcp/registry`)

Client applications and autonomous frameworks can retrieve the entire registered tool catalog without schemas using the registry feed endpoint:

```bash
curl -X GET "http://localhost:8080/v1/goroute/mcp/registry" \
  -H "Authorization: Bearer sk-gw-client-key-production"
```

### Response Format

```json
[
  {
    "server_slug": "postgres-service",
    "server_name": "Production Read-Replica DB",
    "transport_type": "streamable_http",
    "protocol_version": "2026-07-28",
    "endpoint_url": "https://mcp-pg.internal.acme.com/mcp",
    "tool_count": 2,
    "tools": [
      {
        "name": "run_read_query",
        "server_slug": "postgres-service",
        "description": "Executes read-only SQL queries against the analytics database.",
        "tool_handle": "tool_hdl_8f93a1c0d45b7e82910fa32456bc718293041fa982345bc78129034fa9812bc4"
      },
      {
        "name": "explain_query_plan",
        "server_slug": "postgres-service",
        "description": "Generates query execution plans without running mutations.",
        "tool_handle": "tool_hdl_1029384756afbecd0192837465fabcde0192837465afbecd0192837465afbecd"
      }
    ]
  },
  {
    "server_slug": "github-actions",
    "server_name": "CI/CD Pipeline Automation",
    "transport_type": "openapi",
    "protocol_version": "2026-07-28",
    "endpoint_url": "https://api.github.com",
    "tool_count": 1,
    "tools": [
      {
        "name": "trigger_workflow",
        "server_slug": "github-actions",
        "description": "Triggers automated test and deployment workflow runs.",
        "tool_handle": "tool_hdl_778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566"
      }
    ]
  }
]
```

---

## 4. Schema Hydration Meta-Tools

When connecting an LLM to the gateway via progressive discovery, the gateway exposes two core meta-tools:

### Meta-Tool 1: `search_tools`

Allows the agent to search for tools based on intent or query terms:

```json
{
  "name": "search_tools",
  "description": "Searches the enterprise tool catalog for matching capabilities and returns lightweight tool summaries with opaque handles.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Keyword search query (e.g. 'postgres', 'sql', 'deploy', 'analytics')"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of results to return (default 10, max 50)"
      }
    },
    "required": ["query"]
  }
}
```

### Meta-Tool 2: `get_tool_schema`

Fetches the complete JSON Schema definition for a specific tool using its opaque handle:

```json
{
  "name": "get_tool_schema",
  "description": "Hydrates and returns the authoritative JSON inputSchema for a specific tool using its 256-bit opaque handle.",
  "parameters": {
    "type": "object",
    "properties": {
      "tool_handle": {
        "type": "string",
        "description": "The opaque handle starting with 'tool_hdl_' obtained from search_tools or the registry feed."
      }
    },
    "required": ["tool_handle"]
  }
}
```

### Schema Hydration Response Example

When the LLM invokes `get_tool_schema` with handle `tool_hdl_8f93a1c0d45b7e82910fa32456bc718293041fa982345bc78129034fa9812bc4`, the gateway responds:

```json
{
  "name": "run_read_query",
  "server_slug": "postgres-service",
  "description": "Executes read-only SQL queries against the analytics database.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": {
        "type": "string",
        "description": "The SQL SELECT statement to execute."
      },
      "max_rows": {
        "type": "integer",
        "description": "Maximum rows to return.",
        "default": 100
      }
    },
    "required": ["sql"]
  }
}
```

Now, the agent holds only the single schema it actually needs, preserving thousands of context tokens.

---

## 5. Governed OpenAPI 3.0 / 3.1 Transport

GoRoute AI Gateway can ingest any standard OpenAPI 3.0 or 3.1 REST API specification and automatically project it as an MCP tool server.

### Automatic Tool Synthesis (`internal/mcp/transport_openapi.go`)

The gateway's `OpenAPITransport` parses operations (`paths`), extracts input schemas from `parameters` and `requestBody`, and synthesizes native MCP tool schemas:

```go
type OpenAPIOperation struct {
	OperationID string         `json:"operation_id"`
	Method      string         `json:"method"`
	PathPattern string         `json:"path_pattern"`
	Summary     string         `json:"summary"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"input_schema"`
	PathParams  []string       `json:"path_params"`
	QueryParams []string       `json:"query_params"`
}
```

### Features of Governed OpenAPI Transport:
- **Path Parameter Interpolation**: Automatically maps tool arguments to URL path variables (e.g. `/v1/users/{userId}` $\rightarrow$ substituted with `args["userId"]`).
- **Query Parameter Mapping**: Arguments designated as query parameters are encoded into the URL query string.
- **JSON Request Body Encoding**: Body parameters are validated against the OpenAPI schema and posted as `application/json`.
- **SSRF Hardening**: Outbound HTTP calls use the gateway's centralized `network.Policy` with IP pinning, loopback filtering, and cloud metadata blocking.
- **Arbitrary Decimal Handling**: Monetary amounts and high-precision IDs in API responses are preserved using `json.Number` without IEEE-754 precision loss.

---

## 6. Token Savings Comparison

| Architecture | 50 Tools | 200 Tools | 500 Tools |
| :--- | :--- | :--- | :--- |
| **Traditional Upfront Ingestion** | ~15,000 tokens | ~60,000 tokens | Exceeds context limits / ~150,000 tokens |
| **Progressive Tool Discovery** | ~450 tokens *(meta-tools + handles)* | ~500 tokens | ~550 tokens |
| **Net Token Reduction** | **97.0%** | **99.1%** | **99.6%** |

> [!TIP]
> Use progressive discovery for multi-agent workflows (such as LangChain, AutoGen, or Claude Code) that interact with corporate microservice meshes. The agent retains full visibility into available tools while avoiding token exhaustion.

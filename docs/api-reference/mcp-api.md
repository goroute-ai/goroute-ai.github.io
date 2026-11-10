---
title: Model Context Protocol (MCP) API Reference
sidebar_position: 4
description: Complete specification of GoRoute MCP Virtual Hub, scoped server execution, curated toolsets, plain REST bridge, and progressive tool discovery.
---

# Model Context Protocol (MCP) API Reference

GoRoute AI Gateway implements the official **MCP 2026-07-28** stateless Streamable HTTP specification with backward compatibility for **MCP 2025-11-25**. It functions as an enterprise Virtual Hub aggregating distributed tool servers, validating schemas, enforcing Virtual Key scopes, and eliminating prompt token overhead with progressive discovery.

> [!NOTE]
> All MCP routes authenticate using the standard Bearer header with a tenant-scoped Virtual API Key:
> ```http
> Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e
> ```

---

## MCP Route Topology

| Protocol Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/mcp` | Virtual Hub multi-server aggregator (`tools/list`, `tools/call`) |
| `POST` | `/mcp/{serverSlug}` | Scoped execution targeted at a single upstream MCP server |
| `POST` | `/mcp/toolsets/{toolsetSlug}` | Execution routed through a curated, vetted toolset |
| `GET` | `/mcp/subscriptions/listen` | Client SSE stream for dynamic catalog invalidation events |
| `GET` | `/mcp-rest/tools/list` | Plain REST list of aggregated tools without JSON-RPC framing |
| `POST` | `/mcp-rest/tools/call` | Plain REST tool execution with direct JSON payloads |
| `GET` | `/v1/goroute/mcp/registry` | Progressive discovery feed issuing 256-bit tool handles |

---

## 1. Virtual Hub Multi-Server Aggregator (`POST /mcp`)

Aggregates all registered, active, and tenant-authorized MCP servers into a single unified JSON-RPC 2.0 endpoint. Tool names are automatically namespaced (`<server-slug>__<tool-name>`) to prevent collisions.

### Headers Required
```http
Content-Type: application/json
Accept: application/json, text/event-stream
Origin: http://localhost:8080
Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e
```

### Tool Discovery (`tools/list`)

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "github__create_issue",
        "description": "Create an issue in a GitHub repository",
        "inputSchema": {
          "type": "object",
          "properties": {
            "owner": { "type": "string" },
            "repo": { "type": "string" },
            "title": { "type": "string" },
            "body": { "type": "string" }
          },
          "required": ["owner", "repo", "title"]
        }
      },
      {
        "name": "fin_tools__calculate_dcf",
        "description": "Calculate discounted cash flow with high precision",
        "inputSchema": {
          "type": "object",
          "properties": {
            "discount_rate": { "type": "number" },
            "cash_flows": { "type": "array", "items": { "type": "number" } }
          },
          "required": ["discount_rate", "cash_flows"]
        }
      }
    ],
    "_meta": {
      "goroute.ai/server_outcomes": {
        "github": "success",
        "fin-tools": "success"
      }
    }
  }
}
```

### Tool Execution via Virtual Hub (`tools/call`)

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "github__create_issue",
      "arguments": {
        "owner": "goroute-ai",
        "repo": "ai-gateway-go",
        "title": "Bug: fix connection pooling",
        "body": "Detailed description of the issue."
      }
    }
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Issue #42 created successfully at https://github.com/goroute-ai/ai-gateway-go/issues/42"
      }
    ],
    "isError": false
  }
}
```

---

## 2. Scoped Server Execution (`POST /mcp/{serverSlug}`)

Routes JSON-RPC 2.0 requests exclusively to the upstream server matching `{serverSlug}`. Tool names do not require namespace prefixes in scoped mode.

GoRoute preserves arbitrary decimal precision for financial and scientific tools using Go's `big.Rat` and `json.Number` without IEEE-754 floating point distortion.

```bash
curl -X POST http://localhost:8080/mcp/fin-tools \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 10,
    "method": "tools/call",
    "params": {
      "name": "calculate_dcf",
      "arguments": {
        "discount_rate": 0.08251294819284719,
        "cash_flows": [1000000, 1500000, 2000000]
      }
    }
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Net Present Value: 3824192.48291048192"
      }
    ],
    "isError": false
  }
}
```

---

## 3. Curated Toolset Execution (`POST /mcp/toolsets/{toolsetSlug}`)

Executes tool calls through a predefined, vetted subset of pinned tools spanning multiple backend servers. Useful for creating role-restricted environments (e.g. `read-only-analyst`, `devops-tier-1`).

```bash
curl -X POST http://localhost:8080/mcp/toolsets/analyst-tools \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 20,
    "method": "tools/list",
    "params": {}
  }'
```

---

## 4. Plain MCP REST Bridge (`/mcp-rest/*`)

Standard RESTful endpoints designed for traditional HTTP clients, SDKs, and webhooks that interact without JSON-RPC 2.0 framing.

### List Accessible Tools (`GET /mcp-rest/tools/list`)

#### Query Parameters
- `server_slug` *(optional)*: Filter tools registered under a specific upstream server.

```bash
curl "http://localhost:8080/mcp-rest/tools/list?server_slug=fin-tools" \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

#### Response (`HTTP 200 OK`)
```json
{
  "tools": [
    {
      "id": "tool_019248ab-3c4d-5e6f",
      "server_id": "mcp_srv_771829a",
      "server_slug": "fin-tools",
      "name": "calculate_dcf",
      "description": "Calculate discounted cash flow with high precision",
      "input_schema": {
        "type": "object",
        "properties": {
          "discount_rate": { "type": "number" },
          "cash_flows": { "type": "array" }
        },
        "required": ["discount_rate", "cash_flows"]
      },
      "cost_per_call_micros": 500,
      "is_active": true
    }
  ]
}
```

### Execute Tool Call (`POST /mcp-rest/tools/call`)

```bash
curl -X POST http://localhost:8080/mcp-rest/tools/call \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "server_slug": "fin-tools",
    "tool_name": "calculate_dcf",
    "arguments": {
      "discount_rate": 0.08,
      "cash_flows": [500000, 750000, 1000000]
    }
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "content": [
    {
      "type": "text",
      "text": "Net Present Value: 1851240.22"
    }
  ],
  "is_error": false
}
```

#### Error Handling
- `HTTP 400 AmbiguousToolName`: Returned when `tool_name` matches multiple active servers and `server_slug` was omitted. Contains a `matching_servers` array.
- `HTTP 403 mcp_server_forbidden`: Caller's Virtual API Key is not authorized for the requested server or toolset.

---

## 5. Progressive Tool Discovery & Public Registry (`GET /v1/goroute/mcp/registry`)

To prevent token exhaustion when exposing hundreds of tools to LLM agent loops, GoRoute issues compact 256-bit cryptographic tool handles (`tool_hdl_<64 hex chars>`).

### Registry Catalog Feed

```bash
curl http://localhost:8080/v1/goroute/mcp/registry \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

#### Response (`HTTP 200 OK`)
```json
{
  "servers": [
    {
      "server_slug": "fin-tools",
      "tools": [
        {
          "name": "calculate_dcf",
          "description": "Calculates discounted cash flow valuation",
          "tool_handle": "tool_hdl_a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
        }
      ]
    }
  ]
}
```

### Dynamic Schema Hydration Meta-Tools

When progressive discovery is active in an agent loop, models only receive tool handles and descriptions. When a model decides to invoke a tool, it calls built-in meta-tools:

1. **`search_tools`**: Keyword search over registered tool definitions:
   ```json
   { "query": "discounted cash flow", "limit": 5 }
   ```
2. **`get_tool_schema`**: Resolves full JSON Schema by handle:
   ```json
   { "tool_handle": "tool_hdl_a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0" }
   ```
3. **Execution via Handle**: Directly call `POST /mcp-rest/tools/call` using `tool_name: "tool_hdl_..."`. If an upstream schema mutates, stale handles fail-closed with HTTP 404/410.

---

## Next Steps

- Consult the [Agent-to-Agent (A2A) API Reference](/docs/api-reference/a2a-api).
- Learn about [MCP Stdio Sandboxing](/docs/protocols/mcp-stdio-sandboxing).
- Manage servers in the [Operator Web UI](/docs/operations/operator-ui).

---
title: "MCP Virtual Hub & Plain REST Bridge"
sidebar_position: 2
description: "Enterprise routing guide for Virtual Hub aggregation (POST /mcp), scoped server routing, curated toolsets, and the plain REST bridge (/mcp-rest/*)."
---

# MCP Virtual Hub & Plain REST Bridge

GoRoute AI Gateway provides multiple architectural execution paths for Model Context Protocol (MCP) tools:
1. **Virtual Hub Aggregation (`POST /mcp`)**: Aggregates all registered tools in an organization behind a single JSON-RPC 2.0 endpoint with automatic namespace prefixing.
2. **Scoped Server Execution (`POST /mcp/{slug}`)**: Direct JSON-RPC 2.0 execution routed to a specific registered server without prefix requirements.
3. **Curated Toolsets (`POST /mcp/toolsets/{slug}`)**: Scoped execution across pre-approved, team-specific subsets of tools.
4. **Plain REST Bridge (`/mcp-rest/*`)**: High-performance HTTP REST endpoints (`GET /mcp-rest/tools/list` and `POST /mcp-rest/tools/call`) designed for standard REST clients, completely decoupling applications from JSON-RPC protocol boilerplate.

```mermaid
graph TD
    Client["Client / Agent"] --> HubRouter{"Gateway Ingress"}
    
    HubRouter -->|POST /mcp| VHub["Virtual Hub (All Servers Aggregated)"]
    HubRouter -->|POST /mcp/{slug}| Scoped["Scoped Server Route"]
    HubRouter -->|POST /mcp/toolsets/{slug}| Toolset["Curated Toolset Route"]
    HubRouter -->|GET / POST /mcp-rest/*| RESTBridge["Plain REST Bridge"]
    
    VHub --> Dispatcher["Transport Dispatcher"]
    Scoped --> Dispatcher
    Toolset --> Dispatcher
    RESTBridge --> Dispatcher
    
    Dispatcher --> SrvA["MCP Server A"]
    Dispatcher --> SrvB["MCP Server B"]
    Dispatcher --> SrvC["OpenAPI REST Target"]
```

---

## 1. Virtual Hub Aggregation (`POST /mcp`)

The Virtual Hub merges tools from all active MCP servers in the caller's organization.

### Aggregated Tool Discovery (`tools/list`)

To discover all callable tools across all connected servers:

```bash
curl -X POST "http://localhost:8080/mcp" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

#### Response with Namespaced Prefixes
The gateway prefixes each tool name with its server slug (`{serverSlug}__{toolName}`) to prevent collisions:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "postgres-db__run_query",
        "description": "Execute read-only SQL queries on the replica database.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "sql": { "type": "string" }
          },
          "required": ["sql"]
        }
      },
      {
        "name": "github-ops__create_pull_request",
        "description": "Create a new pull request in repository.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "branch": { "type": "string" }
          },
          "required": ["title", "branch"]
        }
      }
    ]
  }
}
```

### Aggregated Tool Execution (`tools/call`)

Execute an aggregated tool by referencing its prefixed name:

```bash
curl -X POST "http://localhost:8080/mcp" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "postgres-db__run_query",
      "arguments": {
        "sql": "SELECT id, email, created_at FROM users LIMIT 5;"
      }
    }
  }'
```

The gateway extracts the prefix `postgres-db`, resolves the server credentials and network transport, and dispatches the call to the target server.

---

## 2. Scoped Server Routing (`POST /mcp/{slug}`)

When an agent needs to communicate exclusively with one server (such as an internal Jira or Kubernetes MCP server), use the scoped endpoint:

```bash
curl -X POST "http://localhost:8080/mcp/github-ops" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

In scoped mode:
- Tool names are presented **unprefixed** (e.g., `create_pull_request` rather than `github-ops__create_pull_request`).
- Execution is isolated strictly to the target server, reducing fan-out overhead.

---

## 3. Curated Toolsets (`POST /mcp/toolsets/{slug}`)

A **Toolset** is a curated collection of specific tools drawn from one or more MCP servers. Toolsets allow organizations to enforce principle-of-least-privilege access:
- Example: An `analyst-toolset` might expose `postgres-db__run_query` and `slack__post_message`, but hide `postgres-db__drop_table` and `aws__terminate_instance`.

```bash
curl -X POST "http://localhost:8080/mcp/toolsets/analyst-toolset" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

---

## 4. Plain REST Bridge (`/mcp-rest/*`)

For client applications, web frontends, or microservices that prefer standard HTTP REST semantics over JSON-RPC 2.0 envelopes, the gateway provides the **Plain REST Bridge**.

### List Tools (`GET /mcp-rest/tools/list`)

Retrieve available tools as a clean JSON array:

```bash
# List all tools in organization
curl -X GET "http://localhost:8080/mcp-rest/tools/list" \
  -H "Authorization: Bearer sk-gw-client-key"

# Filter tools to a specific server
curl -X GET "http://localhost:8080/mcp-rest/tools/list?server_slug=postgres-db" \
  -H "Authorization: Bearer sk-gw-client-key"
```

#### Response
```json
{
  "tools": [
    {
      "id": "tool_019283",
      "server_id": "srv_pg_prod",
      "name": "run_query",
      "description": "Execute read-only SQL queries on the replica database.",
      "input_schema": {
        "type": "object",
        "properties": {
          "sql": { "type": "string" }
        },
        "required": ["sql"]
      }
    }
  ]
}
```

### Call Tool (`POST /mcp-rest/tools/call`)

Invoke a tool with a standard JSON body without JSON-RPC version headers or ID matching:

```bash
curl -X POST "http://localhost:8080/mcp-rest/tools/call" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "server_slug": "postgres-db",
    "tool_name": "run_query",
    "arguments": {
      "sql": "SELECT COUNT(*) FROM orders WHERE status = 'pending';"
    }
  }'
```

#### Successful Execution Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"count\": 42}"
    }
  ],
  "is_error": false
}
```

### Ambiguous Tool Name Protection

If a caller provides `tool_name` without specifying `server_slug`, and that tool name exists across multiple connected MCP servers, the REST bridge safely rejects the call with HTTP 400 (`AmbiguousToolName`) rather than executing unpredictably:

```json
{
  "error": {
    "code": "AmbiguousToolName",
    "message": "Tool name \"run_query\" exists on multiple servers; server_slug is required.",
    "tool_name": "run_query",
    "matching_servers": ["postgres-db", "snowflake-warehouse"]
  }
}
```

> [!TIP]
> Use the Plain REST Bridge when building internal tools, web dashboards, or microservices that need to call MCP tools via standard `fetch()`, Axios, or Go `http.Client` without pulling in complex JSON-RPC dependencies.

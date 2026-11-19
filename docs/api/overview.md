---
title: API Reference Index
sidebar_position: 1
description: Master API index for GoRoute AI Gateway /v1 data plane routes, admin control plane endpoints, MCP Virtual Hub, and A2A v1.0 specifications.
keywords: [GoRoute API reference, AI gateway endpoints, OpenAI compatible API, admin API, MCP API, A2A API]
---

import EndpointCatalog from '@site/src/components/EndpointCatalog';

# API Reference Index

Use this page when you already know which kind of connection you need. The API reference is grouped by request handling, administration, MCP tools, and A2A agents. If you are new to GoRoute, begin with the [overview](/docs/start/overview) before choosing an API.

GoRoute exposes these capabilities through HTTP, WebSocket, and gRPC interfaces. The catalog below lets you search routes and narrow them by API surface.

> [!NOTE]
> All data plane, MCP, and A2A routes require a tenant-scoped Virtual API Key passed via `Authorization: Bearer sk-gw-...`.  
> All administrative control plane routes require the Master Admin Key passed via `Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY`.

---

## Interactive Endpoint Catalog

Search and filter every HTTP and WebSocket route exposed by GoRoute AI Gateway across `/v1/*`, `/openai/v1/*`, `/anthropic/v1/*`, `/mcp*`, `/a2a/v1/*`, and `/admin/v1/*`. The interactive catalog documents **112 endpoints across 7 API surfaces**, while the unified OpenAPI specification (`gateway.openapi.yaml`) covers **73 paths** (`24` `/v1` + `49` `/admin/v1`) with automated parity enforced by `cmd/specgen`.

<EndpointCatalog />

---

## API Reference Guides

```mermaid
flowchart TD
    Index["GoRoute API Surface"] --> DP["Data Plane API<br/>(/v1/*)"]
    Index --> Admin["Admin Control Plane<br/>(/admin/v1/*)"]
    Index --> MCP["MCP Virtual Hub<br/>(/mcp, /mcp-rest)"]
    Index --> A2A["A2A Protocol Service<br/>(/a2a/v1/*, gRPC)"]

    DP --> DP1["Chat, Completions and Reasoning"]
    DP --> DP2["Audio, Images, Embeddings and Rerank"]
    DP --> DP3["Stateful Files, Batches and Realtime"]

    Admin --> AD1["Orgs, Teams, Users and Virtual Keys"]
    Admin --> AD2["Credentials Vault, Deployments and Pricing"]
    Admin --> AD3["FinOps Ledgers, Guardrails and Health Probes"]

    MCP --> M1["tools/list Aggregator and tools/call"]
    MCP --> M2["Plain REST Bridge and Progressive Handles"]

    A2A --> A1["Signed Agent Cards and Message Dispatch"]
    A2A --> A2["SSE Task Streams, Native gRPC and Bridge"]
```

| Specification Guide | Endpoints Base | Core Coverage |
| :--- | :--- | :--- |
| **[Gateway Data Plane API](/docs/api/gateway-api)** | `/v1/*` | All 24 primary `/v1/*` paths: Chat Completions, Text Completions, Embeddings, Models, Rerank, Moderations, Anthropic Messages, Tokenization, Standalone Guardrails (`/v1/guardrails/apply`), Audio (STT & TTS), Images, Files, Batches, Responses, and Realtime WebSockets. |
| **[Admin Control Plane API](/docs/api/admin-api)** | `/admin/v1/*` | All management groups: Organizations, Provider Subscriptions, Model Policies, Guardrails & Simulator, Teams, Users, Virtual Keys, Credentials Vault, Model Groups, Deployments, Catalogue/Pricing, Health/Cache, and FinOps Ledgers. |
| **[Model Context Protocol (MCP) API](/docs/api/mcp-api)** | `/mcp/*`, `/mcp-rest/*` | Virtual Hub aggregator, Scoped server execution, Curated toolsets, Plain REST tool bridge, and Progressive Tool Discovery catalog feed. |
| **[Agent-to-Agent (A2A) API](/docs/api/a2a-api)** | `/a2a/v1/*`, `gRPC` | Signed Agent Cards (`/.well-known/agent-card.json`), dual-binding message dispatch, Subscribe-First SSE task streaming, native gRPC service, and OpenAI SDK compatibility bridge. |

---

## Authentication Schemes

```http
# Data Plane, MCP, and A2A requests (Virtual API Key)
Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e

# Admin Control Plane requests (Master Admin Key)
Authorization: Bearer sk-gw-master-admin-secret-key
```

### Key Lifecycle Rules
1. **Virtual API Keys (`sk-gw-...`)**: Scoped to specific Organizations and Teams, enforce sliding-window RPM/TPM rate limits, adhere to model allowlists, and cap monthly micro-dollar expenditure.
2. **Master Admin Key**: Bypasses rate limits and tenant isolation; used exclusively by automated control planes, CI/CD provisioning pipelines, and administrative operators.
3. **Provider Credentials**: Kept strictly inside GoRoute's AES-256-GCM encrypted vault; never exposed to callers or sent across client network boundaries.

---

## Standard Response Telemetry Headers

Every inference request executed by GoRoute returns real-time tracing, routing, and FinOps attribution headers:

| Header | Description | Example |
| :--- | :--- | :--- |
| `X-Gateway-Request-Id` | Unique UUID assigned to the request lifecycle | `req_991efda4-7fab-4b03` |
| `X-Trace-Id` | W3C / OpenTelemetry distributed trace identifier | `bad98e7deea34d7c810a963d9ed2c4ef` |
| `X-Gateway-Provider` | The winning upstream provider selected for execution | `gemini`, `anthropic`, `openai` |
| `X-Gateway-Model` | The physical upstream model that executed the inference | `gemini-2.5-flash`, `claude-3-5-sonnet-20241022` |
| `X-Gateway-Cost-Micros` | Exact micro-dollar spend incurred ($0.000001 USD) | `45` ($0.000045 USD) |
| `X-Gateway-Routing-Time` | Total Stage 1 + Stage 2 routing overhead | `14 µs` |
| `X-Gateway-Cache` | Exact-match cache evaluation status | `HIT` or `MISS` |
| `Retry-After` | Cooldown period sent on HTTP 429 rate limit errors | `45` (seconds) |

---

## Interactive Management via Operator Web UI

In addition to programmatic REST and gRPC interfaces, GoRoute serves an embedded single-page visual administration console directly from the binary at:

```text
http://localhost:8080/ui/
```

Use the Operator UI to issue virtual keys, inspect live deployment latencies, simulate security guardrails, test streaming chat completions, and monitor real-time FinOps ledgers.

---

## Next Steps

- [Gateway Data Plane API Reference](/docs/api/gateway-api)
- [Admin Control Plane API Reference](/docs/api/admin-api)
- [Model Context Protocol (MCP) API Reference](/docs/api/mcp-api)
- [Agent-to-Agent (A2A) Protocol API Reference](/docs/api/a2a-api)
- [Operator UI Administration Guide](/docs/deploy/operator-ui)

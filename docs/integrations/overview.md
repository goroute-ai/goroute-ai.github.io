---
id: overview
title: Integrations Overview
sidebar_position: 1
description: Connect OpenAI- and Anthropic-compatible SDKs, coding agents, IDEs, agent frameworks, and observability backends to GoRoute AI Gateway.
---

# Integrations Overview

GoRoute AI Gateway exposes drop-in **OpenAI-compatible** (`/v1/*`, `/openai/v1/*`) and **Anthropic-compatible** (`/anthropic/v1/*`, `/v1/messages`) wire endpoints, alongside **MCP** (`/mcp*`) and **A2A** (`/a2a/v1/*`) protocol planes. Any client, IDE, CLI agent, or SDK that accepts a custom base URL and API key can route through GoRoute with zero code rewrites.

---

## Base URLs by Protocol

| Client Ecosystem | Base URL | Supported Endpoints | Reference |
| :--- | :--- | :--- | :--- |
| **OpenAI-Compatible** | `http://localhost:8080/v1` | `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/responses`, `/v1/realtime`, `/v1/models`, `/v1/audio/*`, `/v1/images/*`, `/v1/files`, `/v1/batches`, `/v1/rerank`, `/v1/moderations` | [Gateway API](/docs/api-reference/gateway-api) |
| **OpenAI Direct Alias** | `http://localhost:8080/openai/v1` | `/openai/v1/responses`, `/openai/v1/realtime` | [Responses API](/docs/data-plane/responses) |
| **Anthropic-Compatible** | `http://localhost:8080/anthropic` | `/anthropic/v1/messages`, `/anthropic/v1/messages/count_tokens` (also mounted at `/v1/messages` and `/v1/messages/count_tokens`) | [Anthropic Messages](/docs/data-plane/messages) |
| **Model Context Protocol (MCP)** | `http://localhost:8080/mcp` | `/mcp`, `/mcp/{serverSlug}`, `/mcp/toolsets/{toolsetSlug}`, `/mcp-rest/tools/*` | [MCP Overview](/docs/protocols/mcp-overview) |
| **Agent-to-Agent (A2A)** | `http://localhost:8080/a2a/v1` | `/.well-known/agent-card.json`, `/a2a/v1/agents/{agentSlug}/`, `/a2a/v1/agents/{agentSlug}/tasks*` | [A2A Overview](/docs/protocols/a2a-overview) |

---

## Authentication with Virtual Keys (`sk-gw-...`)

Data-plane routes authenticate callers using **Virtual Keys** prefixed with `sk-gw-` (issued via the Operator UI at `/ui/` or `POST /admin/v1/keys`). See [Virtual Keys](/docs/finops-and-security/virtual-keys) for key creation, RBAC scoping, and budget caps.

GoRoute accepts either standard credential header:

- `Authorization: Bearer sk-gw-...` (OpenAI-compatible clients)
- `x-api-key: sk-gw-...` (Anthropic-compatible clients)

> [!NOTE]
> If a client sends **both** `Authorization: Bearer ...` and `x-api-key: ...` with different values, GoRoute rejects the request with `400 Bad Request` (`ambiguous_gateway_credentials`). Identical values in both headers are accepted.

---

## Integration Guides

### Coding Agents & IDEs
- [**Claude Code**](/docs/integrations/claude-code) — Route Claude Code through `/anthropic` using `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_API_KEY`.
- [**Cursor, Continue & Cline**](/docs/integrations/cursor-and-ides) — Configure IDE extensions against `/v1` with Virtual Keys and unified model aliases.
- [**Codex CLI, Gemini CLI & OpenWebUI**](/docs/integrations/codex-and-cli-agents) — Connect terminal coding agents and self-hosted chat UIs via `/v1`.

### Official Language SDKs & Agent Frameworks
- [**OpenAI SDKs (Python & TypeScript)**](/docs/integrations/openai-sdks) — Chat completions, SSE streaming, embeddings, Responses API, and Realtime WebSockets.
- [**Anthropic SDKs (Python & TypeScript)**](/docs/integrations/anthropic-sdks) — Native `/anthropic/v1/messages` and `/anthropic/v1/messages/count_tokens`.
- [**Agent Frameworks**](/docs/integrations/agent-frameworks) — LangChain, OpenAI Agents SDK, and Google ADK with GoRoute MCP and A2A endpoints.

### Observability & Telemetry
- [**OpenTelemetry & Prometheus**](/docs/integrations/otel-and-prometheus) — OTLP/HTTP span export (`tracing.otlp_endpoint`, `gen_ai.*` attributes, W3C `traceparent`) and Prometheus `/metrics` scraping.

---
id: overview
title: Cookbook Overview
sidebar_position: 1
description: Task-based cookbook indexing GoRoute AI Gateway guides and all 26 runnable Go demos by user goal.
---

# GoRoute Cookbook

Find the exact guide or runnable Go demo for what you want to build. All 26 demos live under `examples/` in the GoRoute repository and automatically fall back to the built-in mock provider when upstream API keys are not set.

```bash
cd examples
go run ./hello_gateway
```

---

## 1. AI Gateway — Traffic Management & Model Routing

See the [AI Gateway Module](/docs/modules/ai-gateway) for architecture and configuration details.

| Goal | Guide / Demo |
| :--- | :--- |
| Connect OpenAI- & Anthropic-compatible clients via `/v1` and `/anthropic` | [Integrations Overview](/docs/integrations/overview) |
| Use Python or TypeScript `openai` SDKs (chat, streaming, embeddings, responses, realtime) | [OpenAI SDKs](/docs/integrations/openai-sdks) |
| Use Python `anthropic` or TypeScript `@anthropic-ai/sdk` | [Anthropic SDKs](/docs/integrations/anthropic-sdks) |
| Embed GoRoute directly in a Go service | [Go SDK Quickstart](/docs/getting-started/quickstart-sdk) · [Hello Gateway Demo](/docs/demos/hello-gateway) · [Embedded Microservice Demo](/docs/demos/embedded-http-microservice) |
| Set system prompts, sampling, JSON mode, streaming, or multi-turn memory | [System Prompts](/docs/demos/system-prompt) · [Streaming Tokens](/docs/demos/streaming-tokens) · [Sampling & Limits](/docs/demos/temperature-and-sampling) · [Structured JSON](/docs/demos/json-mode-structured-output) · [Multi-Turn Memory](/docs/demos/multi-turn-conversation) |
| Route to OpenAI, Anthropic, Gemini, Ollama, or unified model aliases | [OpenAI Direct](/docs/demos/openai-direct) · [Anthropic Direct](/docs/demos/anthropic-direct) · [Google Gemini Direct](/docs/demos/gemini-direct) · [Local Ollama](/docs/demos/local-ollama) · [Unified Model Aliases](/docs/demos/unified-model-alias) |
| Configure failover chains, load balancing, and circuit breakers | [Fallbacks & Retries](/docs/routing-resiliency/fallbacks-and-retries) · [Outage Fallback Demo](/docs/demos/failover-fallback-chain) · [Round-Robin](/docs/demos/round-robin-balancer) · [Weighted Shuffle](/docs/demos/weighted-shuffle-routing) · [Least-Latency EWMA](/docs/demos/least-latency-ewma) · [Circuit Breakers Demo](/docs/demos/circuit-breaker) |
| Cache identical prompts in L1 memory / Redis | [Exact-Match Cache](/docs/finops-and-security/exact-match-cache) · [Cache Demo](/docs/demos/exact-match-cache) |

---

## 2. AI Governance — Security, Policies & Compliance

See the [AI Governance Module](/docs/modules/ai-governance) for the 4-layer policy model and security controls.

| Goal | Guide / Demo |
| :--- | :--- |
| Issue scoped `sk-gw-...` Virtual Keys | [Virtual Keys](/docs/finops-and-security/virtual-keys) · [Virtual Keys & Budgets Demo](/docs/demos/virtual-keys-and-budgets) |
| Enforce 4-tier RBAC (Org → Team → User → Key) and AES-256-GCM credential vault | [RBAC & Credential Vault](/docs/finops-and-security/rbac-and-vault) |
| Enforce PII redaction, prompt-injection detection, and `logging_only` guardrails | [Guardrails Engine](/docs/finops-and-security/guardrails) |
| Lock down outbound provider egress against SSRF | [SSRF & Network Security](/docs/finops-and-security/ssrf-and-network) |
| Validate production readiness and security posture | [Production Checklist](/docs/operations/production-checklist) |

---

## 3. AI FinOps — Cost Management & Optimization

See the [AI FinOps Module](/docs/modules/ai-finops) for micro-dollar accounting and budget enforcement.

| Goal | Guide / Demo |
| :--- | :--- |
| Track spend in integer micro-dollars (including cache-write & modality pricing) | [Micro-Dollar Ledger](/docs/finops-and-security/micro-dollar-ledger) |
| Enforce sliding-window RPM and TPM quotas via Redis Lua | [Sliding-Window Rate Limits](/docs/finops-and-security/sliding-window-ratelimit) · [Rate Limits Demo](/docs/demos/sliding-window-rate-limiting) |
| Count tokens locally before upstream dispatch | [Pre-Flight Tokenizer](/docs/finops-and-security/preflight-tokenizer) · [Tokenize API](/docs/data-plane/tokenize) |

---

## 4. AI Observability — Monitoring, Tracing & Evaluation

See the [AI Observability Module](/docs/modules/ai-observability) for telemetry, Operator UI, and evaluation workflows.

| Goal | Guide / Demo |
| :--- | :--- |
| Export OTLP/HTTP traces (`gen_ai.*`, `traceparent`) and scrape `/metrics` | [OpenTelemetry & Prometheus](/docs/integrations/otel-and-prometheus) · [Observability Guide](/docs/operations/observability) |
| Inspect live traffic, simulate guardrails, and manage deployments | [Operator Web UI](/docs/operations/operator-ui) |
| Diagnose configuration, auth, routing, and deployment errors | [Troubleshooting](/docs/operations/troubleshooting) |
| Browse all 26 runnable Go examples | [Interactive Demos Overview](/docs/demos/overview) |

---

## 5. AI Agent Management — MCP, Tools & Agent Access

See the [AI Agent Management Module](/docs/modules/ai-agent-management) for MCP, A2A, and coding-agent governance.

| Goal | Guide / Demo |
| :--- | :--- |
| Route Claude Code through GoRoute | [Claude Code Integration](/docs/integrations/claude-code) |
| Connect Cursor, Continue, or Cline | [Cursor, Continue & Cline](/docs/integrations/cursor-and-ides) |
| Connect Codex CLI, Gemini CLI, or OpenWebUI | [Codex CLI, Gemini CLI & OpenWebUI](/docs/integrations/codex-and-cli-agents) |
| Use LangChain, OpenAI Agents SDK, or Google ADK | [Agent Frameworks](/docs/integrations/agent-frameworks) |
| Register tools, execute callbacks, and run autonomous tool loops | [Tool Definition](/docs/demos/single-tool-definition) · [Tool Execution](/docs/demos/tool-execution-callback) · [Multi-Tool Inventory](/docs/demos/multi-tool-selection) · [Autonomous Agent Loop](/docs/demos/autonomous-tool-loop) |
| Expose an MCP Virtual Hub, scoped servers, and REST tool bridge | [MCP Overview](/docs/protocols/mcp-overview) · [MCP Virtual Hub Demo](/docs/demos/mcp-virtual-hub) |
| Discover and dispatch tasks across A2A agents | [A2A Overview](/docs/protocols/a2a-overview) · [A2A Agent Network Demo](/docs/demos/a2a-agent-network) |

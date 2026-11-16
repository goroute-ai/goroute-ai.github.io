---
id: overview
title: Go Examples & Task Cookbook
sidebar_position: 1
description: Browse 26 runnable GoRoute Go examples and task-based cookbook recipes for routing, providers, FinOps, guardrails, MCP, and A2A.
keywords: [goroute go examples, task cookbook, runnable go demos, ai gateway recipes, sdk cookbook]
---

# Go Examples & Task Cookbook

These 26 runnable Go programs under `examples/` demonstrate the gateway's SDK, provider integrations, routing, MCP, A2A, and service embedding, paired with task-based links across the documentation.

---

## Find a Guide by Task

| Goal | Guide / Demo |
| :--- | :--- |
| **Start building** | [Go SDK Quickstart](/docs/start/quickstart-sdk) · [Standalone Gateway Quickstart](/docs/start/quickstart-gateway) · [Docker Compose](/docs/start/quickstart-docker) |
| **Connect Python/TS SDKs & Coding IDEs** | [Integrations Overview](/docs/integrations/overview) · [OpenAI SDKs](/docs/integrations/openai-sdks) · [Anthropic SDKs](/docs/integrations/anthropic-sdks) · [Claude Code](/docs/integrations/claude-code) · [Cursor & IDEs](/docs/integrations/cursor-and-ides) |
| **Configure routing, fallbacks & caching** | [Routing & Load Balancing](/docs/gateway/routing-and-load-balancing) · [Resiliency & Fallbacks](/docs/gateway/resiliency-and-fallbacks) · [Exact-Match Cache](/docs/gateway/caching) |
| **Enforce Virtual Keys, RBAC & Guardrails** | [Virtual Keys](/docs/governance/virtual-keys) · [RBAC & Vault](/docs/governance/rbac-and-vault) · [Guardrails](/docs/governance/guardrails) · [SSRF & Network Security](/docs/governance/network-and-ssrf) |
| **Track FinOps spend & rate limits** | [Micro-Dollar Ledger](/docs/finops/micro-dollar-ledger) · [Sliding-Window Rate Limits](/docs/finops/rate-limiting) · [Pre-Flight Tokenization](/docs/finops/preflight-tokenization) |
| **Monitor telemetry & troubleshoot** | [Observability & Health Probes](/docs/deploy/observability) · [OpenTelemetry & Prometheus](/docs/integrations/otel-and-prometheus) · [Operator Web UI](/docs/deploy/operator-ui) · [Troubleshooting](/docs/deploy/troubleshooting) |
| **Run MCP tool hubs & A2A agent networks** | [MCP Overview](/docs/agents/mcp-overview) · [A2A Overview](/docs/agents/a2a-overview) · [Autonomous Tool Loop](/docs/gateway/endpoints/autonomous-tool-loop) |
| **Deploy to production** | [Configuration](/docs/deploy/configuration) · [Deployment & Storage](/docs/deploy/deployment-and-storage) · [Kubernetes & Kustomize](/docs/deploy/kubernetes-kustomize) · [Production Checklist](/docs/deploy/production-checklist) |

---

## Running Any Demo

Run an example from the `examples/` module after its Go dependencies are available:

```bash
cd examples
go run ./hello_gateway
```

Most examples enable the built-in mock provider when credentials are missing, so they can demonstrate the request flow without contacting a model provider. Examples that require a local service, such as Ollama or an HTTP server, still need that service running. To test a live provider, export the matching key before running its example:

```bash
export OPENAI_API_KEY="sk-proj-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIzaSy... or AQ.Ab8..."
```

The examples module declares its Go toolchain version in `examples/go.mod`. See each example's source for the provider, local service, or environment variables it needs.

---

## Examples by task

### Fundamentals
- [**Hello Gateway**](/docs/examples/hello-gateway): Minimal in-process gateway setup and synchronous chat.
- [**System Prompts**](/docs/examples/system-prompt): Persona steering using `gateway.WithSystem(...)`.
- [**Streaming Tokens**](/docs/examples/streaming-tokens): Zero-buffer SSE token streaming via `StreamChat`.
- [**Sampling & Limits**](/docs/examples/temperature-and-sampling): Deterministic outputs and minimal token capping.
- [**Structured JSON**](/docs/examples/json-mode-structured-output): Guaranteed machine-readable JSON object output.
- [**Multi-Turn Memory**](/docs/examples/multi-turn-conversation): Maintaining conversation history across multiple turns.

### Multi-Provider Integrations
- [**OpenAI Direct**](/docs/examples/openai-direct): Connecting to OpenAI with `openai/gpt-4o-mini`.
- [**Anthropic Direct**](/docs/examples/anthropic-direct): Connecting to Anthropic with `anthropic/claude-haiku-4-5-20251001`.
- [**Google Gemini Direct**](/docs/examples/gemini-direct): Connecting to Gemini with `gemini/gemini-2.5-flash-lite`.
- [**Local Ollama**](/docs/examples/local-ollama): Self-hosted offline inference on port 11434.
- [**Unified Model Aliases**](/docs/examples/unified-model-alias): Logical aliases decoupling callers from specific vendors.

### Tool Calling & Autonomous Agents
- [**Tool Definition**](/docs/examples/single-tool-definition): Registering tool schemas via Model Context Protocol (MCP).
- [**Tool Execution**](/docs/examples/tool-execution-callback): In-process tool execution and result returning.
- [**Multi-Tool Inventory**](/docs/examples/multi-tool-selection): Aggregating multiple tool servers into a single schema.
- [**Autonomous Agent Loop**](/docs/examples/autonomous-tool-loop): Multi-turn self-orchestrating loop with zero human intervention.

### Traffic Routing & Outage Resiliency
- [**Outage Fallback Chains**](/docs/examples/failover-fallback-chain): Automatic 503 outage recovery with secondary models.
- [**Round-Robin Balancer**](/docs/examples/round-robin-balancer): Uniform stateless load balancing.
- [**Weighted Shuffle Routing**](/docs/examples/weighted-shuffle-routing): Proportionate canary and cost-steered traffic splitting.
- [**Least-Latency EWMA**](/docs/examples/least-latency-ewma): Peak-EWMA routing favoring lowest latency endpoints.
- [**Circuit Breakers**](/docs/examples/circuit-breaker): Fast-failing broken backends to protect caller latency.

### Enterprise FinOps, Protocols & Microservices
- [**Exact-Match Cache**](/docs/examples/exact-match-cache): Sub-millisecond SHA-256 caching for identical prompts.
- [**Sliding-Window Rate Limits**](/docs/examples/sliding-window-rate-limiting): Strict RPM and TPM quota enforcement.
- [**Virtual Keys & Budgets**](/docs/examples/virtual-keys-and-budgets): Department keys, micro-dollar tracking, and revocation.
- [**MCP Virtual Hub**](/docs/examples/mcp-virtual-hub): Model Context Protocol Virtual Hub & REST bridge.
- [**A2A Agent Network**](/docs/examples/a2a-agent-network): Cryptographic Agent-to-Agent discovery and dispatch.
- [**Embedded Microservice**](/docs/examples/embedded-http-microservice): Production HTTP server with Kubernetes probes.

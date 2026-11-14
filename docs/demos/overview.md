---
title: Interactive Demos & Curriculum Overview
sidebar_position: 1
description: Browse runnable GoRoute Go examples for AI gateway setup, provider integrations, streaming, load balancing, MCP tools, and A2A agents.
---

# Go Examples

These small Go programs demonstrate the gateway's SDK, provider integrations, routing, MCP, A2A, and service embedding. Each example lives in its own directory under `examples/`.

---

## 🏃 Running Any Demo

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
- [**Hello Gateway**](/docs/demos/hello-gateway) — Minimal in-process gateway setup and synchronous chat.
- [**System Prompts**](/docs/demos/system-prompt) — Persona steering using `gateway.WithSystem(...)`.
- [**Streaming Tokens**](/docs/demos/streaming-tokens) — Zero-buffer SSE token streaming via `StreamChat`.
- [**Sampling & Limits**](/docs/demos/temperature-and-sampling) — Deterministic outputs and minimal token capping.
- [**Structured JSON**](/docs/demos/json-mode-structured-output) — Guaranteed machine-readable JSON object output.
- [**Multi-Turn Memory**](/docs/demos/multi-turn-conversation) — Maintaining conversation history across multiple turns.

### Multi-Provider Integrations
- [**OpenAI Direct**](/docs/demos/openai-direct) — Connecting to OpenAI with `openai/gpt-4o-mini`.
- [**Anthropic Direct**](/docs/demos/anthropic-direct) — Connecting to Anthropic with `anthropic/claude-haiku-4-5-20251001`.
- [**Google Gemini Direct**](/docs/demos/gemini-direct) — Connecting to Gemini with `gemini/gemini-2.5-flash-lite`.
- [**Local Ollama**](/docs/demos/local-ollama) — Self-hosted offline inference on port 11434.
- [**Unified Model Aliases**](/docs/demos/unified-model-alias) — Logical aliases decoupling callers from specific vendors.

### Tool Calling & Autonomous Agents
- [**Tool Definition**](/docs/demos/single-tool-definition) — Registering tool schemas via Model Context Protocol (MCP).
- [**Tool Execution**](/docs/demos/tool-execution-callback) — In-process tool execution and result returning.
- [**Multi-Tool Inventory**](/docs/demos/multi-tool-selection) — Aggregating multiple tool servers into a single schema.
- [**Autonomous Agent Loop**](/docs/demos/autonomous-tool-loop) — Multi-turn self-orchestrating loop with zero human intervention.

### Traffic Routing & Outage Resiliency
- [**Outage Fallback Chains**](/docs/demos/failover-fallback-chain) — Automatic 503 outage recovery with secondary models.
- [**Round-Robin Balancer**](/docs/demos/round-robin-balancer) — Uniform stateless load balancing.
- [**Weighted Shuffle Routing**](/docs/demos/weighted-shuffle-routing) — Proportionate canary and cost-steered traffic splitting.
- [**Least-Latency EWMA**](/docs/demos/least-latency-ewma) — Peak-EWMA routing favoring lowest latency endpoints.
- [**Circuit Breakers**](/docs/demos/circuit-breaker) — Fast-failing broken backends to protect caller latency.

### Enterprise FinOps, Protocols & Microservices
- [**Exact-Match Cache**](/docs/demos/exact-match-cache) — Sub-millisecond SHA-256 caching for identical prompts.
- [**Sliding-Window Rate Limits**](/docs/demos/sliding-window-rate-limiting) — Strict RPM and TPM quota enforcement.
- [**Virtual Keys & Budgets**](/docs/demos/virtual-keys-and-budgets) — Department keys, micro-dollar tracking, and revocation.
- [**MCP Virtual Hub**](/docs/demos/mcp-virtual-hub) — Model Context Protocol Virtual Hub & REST bridge.
- [**A2A Agent Network**](/docs/demos/a2a-agent-network) — Cryptographic Agent-to-Agent discovery and dispatch.
- [**Embedded Microservice**](/docs/demos/embedded-http-microservice) — Production HTTP server with Kubernetes probes.

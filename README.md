# GoRoute Enterprise AI Control Plane Documentation Portal & Runnable Demos

> Production documentation portal and progressive developer curriculum for [GoRoute AI Gateway (`ai-gateway-go`)](https://github.com/goroute-ai/ai-gateway-go) — the **Enterprise AI Control Plane** written in 100% Pure Go, unifying **AI Gateway**, **AI Governance**, **AI FinOps**, **AI Observability**, and **AI Agent Management**.

[![Go Report Card](https://goreportcard.com/badge/github.com/goroute-ai/ai-gateway-go)](https://goreportcard.com/report/github.com/goroute-ai/ai-gateway-go)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-6d28d9.svg)](https://goroute-ai.github.io/)

---

## 🌟 Overview

This repository hosts:
1. **The Enterprise AI Control Plane Documentation Portal**: Powered by Docusaurus 3, featuring full-text search, written API guides, Mermaid architecture diagrams, a dual light/dark theme (Royal Violet `#6d28d9` / Lavender `#b39aff`), and guides organized around GoRoute's **5 Core Control Plane Modules**:
   - **1. AI Gateway**: Traffic management, 23 `/v1` data plane paths (26 HTTP ops), 73 `ProviderType` profiles, EWMA load balancing, and circuit breakers.
   - **2. AI Governance**: 4-layer policy model, Operator RBAC/OIDC, AES-256-GCM Credentials Vault, Virtual Keys, streaming guardrails, and SSRF firewall.
   - **3. AI FinOps**: 64-bit integer micro-dollar ledger, cache-write & modality pricing, durable spend/budget-reset outboxes, and Redis Lua rate limits.
   - **4. AI Observability**: OTLP/HTTP distributed tracing (`gen_ai.*`), Prometheus `/metrics`, Vitter Algorithm R latency reservoirs, and Embedded Operator Console (`/ui/`).
   - **5. AI Agent Management**: MCP 2026-07-28 Virtual Hub, A2A v1.0 signed Agent Cards & gRPC, autonomous tool loops, and coding-agent/framework access control.
2. **Runnable Progressive Demos Suite (`examples/`)**: 26 runnable Go examples using only public release package types (`github.com/goroute-ai/ai-gateway-go/pkg/gateway`) with zero external dependencies.

---

## 🚀 Quickstart: Running the Documentation Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

```bash
# Clone the repository
git clone https://github.com/goroute-ai/goroute-ai.github.io.git
cd goroute-ai.github.io

# Install dependencies
npm install

# Start local development server with hot-reload
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building & Verifying Locally
```bash
# TypeScript typecheck
npm run typecheck

# Docs QA checks (sidebar coverage, code fences, URL & brand rules)
npm run check:docs

# Production build (runs generate:llms automatically via prebuild)
npm run build
```
The static HTML, JavaScript, and CSS bundle will be output to `./build`. You can test the production build locally with:
```bash
npm run serve
```

---

## 🧪 Progressive Go Demos Suite (`examples/`)

All demos are self-contained, compile immediately, and demonstrate real enterprise patterns using the embedded `pkg/gateway` engine:

```bash
cd examples

# Run Hello Gateway
go run ./hello_gateway

# Run Dynamic EWMA Load Balancer
go run ./least_latency_ewma

# Run Embedded HTTP Microservice
go run ./embedded_http_microservice
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for documentation style guidelines and PR requirements. AI coding agents should follow [AGENTS.md](AGENTS.md) and can use [`static/llms.txt`](static/llms.txt) as a structured documentation index.

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

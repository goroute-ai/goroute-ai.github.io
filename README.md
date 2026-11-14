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
3. **100% Free Zero-Cost Hosting Configs**: Fully automated deployment workflow for **GitHub Pages** (`.github/workflows/deploy.yml`), plus turnkey configs for Cloudflare Pages, Vercel, and Netlify.

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

### Building for Production
```bash
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

## 📂 Repository Structure

```
goroute-ai.github.io/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 100% Free Deploy to GitHub Pages
├── docs/                       # Comprehensive MDX Documentation
│   ├── getting-started/        # Overview, Benchmarks, Quickstarts (SDK, CLI, Docker)
│   ├── data-plane/             # Chat, Embeddings, Models, Tools & Autonomous Agent Loop
│   ├── routing-resiliency/     # Complexity Classifier, EWMA Balancer, Circuit Breakers
│   ├── finops-and-security/    # Micro-Dollar Ledger, Virtual Keys, RBAC, SSRF, Cache & Rate Limiting
│   ├── demos/                  # Step-by-step guides for the 26 progressive Go examples
│   ├── providers/              # Integration guides (Gemini, Claude, OpenAI, Mistral, Ollama)
│   ├── protocols/              # MCP Virtual Hub & Agent-to-Agent (A2A v1.0) specs
│   ├── sdk/                    # Pure Go SDK pkg/gateway API reference
│   └── api-reference/          # Gateway, admin, MCP, and A2A HTTP endpoint guides
├── examples/                   # Progressive Go Demos Suite
│   ├── hello_gateway/          # Minimal in-process engine
│   ├── system_prompt/          # Persona steering
│   ├── streaming_tokens/       # Zero-buffer SSE
│   ├── ...                     # 26 atomic Go demonstrations
│   └── demoutil/               # Pretty terminal banners & presenters
├── src/
│   ├── css/custom.css          # Dual light/dark Royal Violet (#6d28d9) & Lavender (#b39aff) theme tokens
│   └── pages/index.tsx         # Modern interactive landing page with benchmarks
├── static/
│   ├── img/                    # Official GoRoute logos and icons
│   └── llms.txt                # Curated context file for AI agents & LLMs
├── docusaurus.config.ts        # Docusaurus configuration
├── sidebars.ts                 # Sidebar navigation trees
├── vercel.json                 # Turnkey free deployment for Vercel
└── netlify.toml                # Turnkey free deployment for Netlify
```

---

## 🚢 100% Free Hosting on GitHub Pages

This repo is configured out of the box to deploy seamlessly to **GitHub Pages** with GitHub Actions:

1. Push this repository to GitHub (`main` branch).
2. Go to repository **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will automatically build and publish the site to `https://<org>.github.io/<repo>/`!

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

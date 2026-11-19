---
title: GoRoute overview
sidebar_position: 1
description: Learn what GoRoute does, where it fits in an AI application, and how to choose a way to get started.
keywords: [GoRoute overview, AI gateway, Go SDK, model providers, getting started]
faq:
  - q: "What deployment modes does GoRoute support?"
    a: "GoRoute runs as a standalone CLI binary, a Docker Compose stack with PostgreSQL and Redis, a Kubernetes deployment via Helm or Kustomize, or embedded in-process via the pkg/gateway Go SDK."
  - q: "How many LLM providers does GoRoute support?"
    a: "GoRoute unifies 73 ProviderType profiles (including OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock, Azure OpenAI, Google Vertex AI, Cohere, Mistral, Ollama, and 60+ OpenAI-compatible dialects) plus CustomOpenAICompatible."
  - q: "Which routing and load-balancing strategies are built in?"
    a: "Stage 1 applies a sub-millisecond zero-LLM complexity classifier, and Stage 2 supports 6 load-balancing strategies (weighted-shuffle, least-busy, latency-based, usage-based-headroom, lowest-cost, and round-robin) with 3-state circuit breakers and fallbacks."
  - q: "How do Virtual Keys and FinOps cost tracking work?"
    a: "Scoped Virtual Keys (sk-gw-...) enforce 4-layer RBAC, model allowlists, and sliding-window RPM/TPM rate limits, while the FinOps ledger tracks spend in 64-bit integer micro-dollars ($1 = 1,000,000 micro-dollars) via durable PostgreSQL outboxes."
---

# GoRoute overview

GoRoute sits between an application and the AI services it uses. It gives an application a consistent way to send AI requests, while giving its team a place to choose providers, set access rules, and understand usage.

```mermaid
flowchart LR
    app["Your application"] --> setup["Choose a GoRoute setup"] --> gateway["GoRoute gateway"] --> provider["AI provider"]
    classDef appStyle fill:#153451,stroke:#60A5FA,color:#EFF6FF
    classDef gatewayStyle fill:#0B5668,stroke:#22D3EE,color:#ECFEFF
    classDef serviceStyle fill:#382F6B,stroke:#A78BFA,color:#F5F3FF
    class app appStyle
    class setup gatewayStyle
    class gateway gatewayStyle
    class provider serviceStyle
```

You can run GoRoute as a shared gateway or embed it directly in a Go application. The same product also includes tools for routing requests, protecting sensitive workflows, and connecting agents to approved tools.

## Choose a way to work

| What you want to do | Start here |
| :--- | :--- |
| Add the gateway inside a Go application | [Go SDK quickstart](/docs/start/quickstart-sdk) |
| Run a gateway that other applications can use | [Standalone gateway quickstart](/docs/start/quickstart-gateway) |
| Run the gateway with its database and cache | [Docker Compose quickstart](/docs/start/quickstart-docker) |
| Understand how requests move through the system | [Architecture and request flow](/docs/start/architecture) |
| Connect a coding tool or existing SDK | [Integrations overview](/docs/integrations/overview) |

## What happens to a request?

Your application sends a request to GoRoute. GoRoute checks the caller's access, applies the configured policies, chooses an available provider, and returns the provider's response. It can also record usage and trace information so your team can inspect what happened.

```mermaid
flowchart LR
    App["Your application"] --> Access["Check access and policies"]
    Access --> Route["Choose an available provider"]
    Route --> Provider["AI provider"]
    Provider --> Response["Return the response"]
    Route --> Usage["Record usage and traces"]
```

## Choose a deployment style

| Deployment style | When it fits | Guide |
| :--- | :--- | :--- |
| **Standalone gateway** | Run GoRoute as a service that different applications can call. | [Gateway quickstart](/docs/start/quickstart-gateway) |
| **Docker Compose** | Try a local stack or run the gateway with PostgreSQL and Redis. | [Docker quickstart](/docs/start/quickstart-docker) |
| **Kubernetes** | Operate the gateway in a Kubernetes environment. | [Helm chart](/docs/deploy/helm-chart) · [Kustomize](/docs/deploy/kubernetes-kustomize) |
| **Embedded Go SDK** | Run gateway behavior in the same process as a Go application. | [Go SDK quickstart](/docs/start/quickstart-sdk) |

## Explore by goal

- [Choose and route model providers](/docs/gateway)
- [Protect requests and control access](/docs/governance)
- [Manage cost and request limits](/docs/finops)
- [Connect agents and tools](/docs/agents)
- [Deploy and operate GoRoute](/docs/deploy/configuration)

## Next steps

- [Run a gateway locally](/docs/start/quickstart-gateway)
- [Build with the Go SDK](/docs/start/quickstart-sdk)
- [Browse practical examples](/docs/examples/overview)

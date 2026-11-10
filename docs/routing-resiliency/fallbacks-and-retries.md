---
title: Retries & Fallback Cascades
sidebar_position: 4
---

# Retries & Cross-Provider Fallback Cascades

When cloud AI providers experience regional outages, rate limits (HTTP 429), or internal server errors (HTTP 500, 502, 503), GoRoute AI Gateway automatically executes intra-group retries and cross-provider fallback cascades.

```mermaid
sequenceDiagram
    autonumber
    Client ->> Gateway: POST /v1/chat/completions (model: "prod-chat")
    Note over Gateway: Attempt 1: Target Primary (OpenAI GPT-4o)
    Gateway ->> OpenAI: Forward Request
    OpenAI -->> Gateway: HTTP 503 Service Unavailable
    Note over Gateway: Jittered Exponential Backoff (50ms)
    Gateway ->> OpenAI: Intra-Group Retry #2
    OpenAI -->> Gateway: HTTP 503 Service Unavailable
    Note over Gateway: Trip Circuit Breaker & Activate Fallback: "backup-claude"
    Gateway ->> Anthropic: Forward Request to Claude Sonnet 4
    Anthropic -->> Gateway: HTTP 200 OK (Content Stream)
    Gateway -->> Client: HTTP 200 OK (X-Gateway-Fallback: true)
```

---

## 1. Intra-Group Retries with Full Jitter

Before abandoning a model deployment, GoRoute executes automated retries with exponential backoff and randomized decorrelated jitter to prevent thundering herd spikes on recovered upstreams:

```text
Delay = min(max_retry_delay, base_retry_delay * 2^attempt) * Uniform(0.5, 1.5)
```

```yaml
router:
  default_max_retries: 2
  base_retry_delay: 50ms
  max_retry_delay: 2s
```

---

## 2. Declarative Cross-Provider Fallback Chains

Configure fallback cascades in `configs/config.yaml`:

```yaml
model_list:
  # Primary Group: OpenAI GPT-4o
  - model_name: prod-chat
    routing_strategy: weighted-shuffle
    model_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
      fallbacks: ["backup-claude", "backup-gemini"]

  # Secondary Fallback: Anthropic Claude Sonnet
  - model_name: backup-claude
    model_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY

  # Tertiary Emergency Fallback: Google Gemini Flash
  - model_name: backup-gemini
    model_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
```

If OpenAI experiences an outage, GoRoute seamlessly falls back to Anthropic Claude. If Anthropic also fails, traffic transparently cascades to Google Gemini Flash.

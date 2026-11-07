---
title: Model Management & Access Control
sidebar_position: 14
description: The 4-layer model access control hierarchy, tri-state capability verification, pricing provenance, and declarative model routing groups.
---

# Model Management & Access Control

GoRoute AI Gateway separates physical upstream models from logical application endpoints. Through a **4-layer access control hierarchy**, organizations can govern vendor entitlements, enforce approval policies, and restrict client keys with zero-latency hot-path verification.

---

## 4-Layer Model Access Control Hierarchy

Every inference request passes through four defensive evaluation boundaries:

```mermaid
flowchart TD
    Req["Incoming Request (model: 'cerebras/llama-3.3-70b')"] --> L1
    
    subgraph L1["Layer 1: Global Model Catalogue"]
        L1Check["Verify model exists, active lifecycle status,<br/>tri-state capabilities & pricing provenance"]
    end
    
    L1 -->|Valid| L2
    L1 -->|Unknown Model| Fail404["HTTP 404 Model Not Found"]
    
    subgraph L2["Layer 2: Org Provider Subscriptions"]
        L2Check["Check if Organization has enabled provider<br/>(OrgProviderSubscription.IsEnabled = true)"]
    end
    
    L2 -->|Subscribed| L3
    L2 -->|Provider Disabled| Fail403A["HTTP 403 Provider Not Subscribed"]
    
    subgraph L3["Layer 3: Org Model Policy Overrides"]
        L3Check["Check if model is approved for the org<br/>(OrgModelPolicy.IsEnabled = true)"]
    end
    
    L3 -->|Approved| L4
    L3 -->|Model Blocked| Fail403B["HTTP 403 Model Policy Blocked"]
    
    subgraph L4["Layer 4: Virtual Key Allowlist"]
        L4Check["Verify key allowed_models list<br/>(VirtualKey.AllowedModels)"]
    end
    
    L4 -->|Authorized| Exec["Stage 2 Load Balancer & Dispatch"]
    L4 -->|Key Restricted| Fail403C["HTTP 403 Key Not Authorized"]
```

### Layer Breakdown

1. **Layer 1: Global Model Catalogue (`GlobalModel`)**:
   Tracks the platform-wide catalog of all discovered, preview, active, and deprecated models across all supported providers. Validates token limits, supported modalities, and pricing provenance.
2. **Layer 2: Organization Provider Subscriptions (`OrgProviderSubscription`)**:
   Enterprise vendor gating. An organization controls which upstream providers (`openai`, `anthropic`, `gemini`, `cohere`) are permitted for use by its developers and teams. Supports `auto_enable_new` to automatically adopt new models discovered from an approved vendor.
3. **Layer 3: Organization Model Policy Overrides (`OrgModelPolicy`)**:
   Tenant model approval. Even if a provider is subscribed, security teams can explicitly approve or ban specific models (e.g. banning preview models, approving only HIPAA-compliant models). Records `approved_by` and `approved_at` audit timestamps.
4. **Layer 4: Virtual Key Allowlist (`VirtualKey.AllowedModels`)**:
   Application-level restriction. Each virtual API key can define a scoped `allowed_models` array (e.g. `["fast", "text-embedding-3-small"]`). If set, callers using that key are restricted exclusively to those models.

---

## Tri-State Capability Verification

Model capabilities are notoriously prone to drift between vendor documentation and actual API support. To prevent runtime runtime errors, GoRoute replaces fragile boolean flags with an explicit **Tri-State Capability Model** (`internal/domain/capabilities.go`):

```go
type CapabilityState string

const (
    CapabilitySupported   CapabilityState = "supported"   // Verified functional
    CapabilityUnsupported CapabilityState = "unsupported" // Verified lack of support
    CapabilityUnknown     CapabilityState = "unknown"     // Unverified / experimental
)
```

The gateway tracks 13 distinct capability dimensions per model:

| Capability Field | Description |
| :--- | :--- |
| `tools` | Function and tool calling support |
| `streaming` | Server-Sent Events (SSE) streaming tokens |
| `vision` | Multimodal image and diagram understanding |
| `reasoning` | Extended thinking / reasoning effort parameters |
| `structured_outputs`| Strict JSON Schema enforcement (`response_format`) |
| `embeddings` | Vector embedding generation |
| `rerank` | Document cross-encoder reranking |
| `moderation` | Safety and policy classification |
| `image_gen` | Text-to-image synthesis |
| `audio_stt` | Audio transcription / speech-to-text |
| `audio_tts` | Text-to-speech audio synthesis |
| `batches` | 24-hour asynchronous batch processing |
| `realtime` | Full-duplex WebSocket sessions |

> [!IMPORTANT]
> If a client requests a feature (e.g. `stream: true` or `tools`) for a model whose capability state is `unsupported`, the gateway immediately rejects the request with `HTTP 400 Bad Request` prior to upstream dispatch, preventing wasted vendor charges.

---

## Pricing Provenance & Fail-Closed Safety

To guarantee financial integrity across billing cycles, model pricing in GoRoute includes full cryptographic and audit provenance (`internal/domain/modelmgmt.go`):

- **Pricing Status**:
  - `verified`: Confirmed against official provider contracts (e.g. `global-model-catalog-v1.0`).
  - `custom`: Overridden by organization enterprise discount agreements.
  - `unknown`: Unverified pricing tier. Triggers fail-closed budget checks.
  - `unrecorded`: Free or internal local models (e.g. Ollama).
- **Pricing Provenance Source**: Explicit reference tag indicating source documentation (e.g. `"global-model-catalog-v1.0"`, `"enterprise-agreement-2026-q1"`).
- **Versioned History (`ModelPricingHistory`)**: Every rate change increments `pricing_version` and stores the previous rates with effective timestamps and changing principal.

Responses echo provenance headers:
```http
X-Gateway-Cost-Micros: 42
X-Gateway-Pricing-Status: verified
X-Gateway-Pricing-Version: 1
```

---

## Declarative Model Groups (`configs/config.yaml`)

Define load-balancing tiers, weights, and cross-provider fallbacks:

```yaml
model_list:
  # Fast tier: Load-balanced between Gemini 2.5 Flash and GPT-4o-mini
  - model_name: fast
    routing_strategy: weighted-shuffle
    model_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
      weight: 75

  - model_name: fast
    routing_strategy: weighted-shuffle
    model_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
      weight: 25

  # Reasoning tier: High-complexity models with automatic fallback
  - model_name: reasoning
    routing_strategy: least-busy
    model_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
      fallbacks: ["backup-reasoning"]

  # Local tier: Private local LLM (Ollama)
  - model_name: local
    model_params:
      model: ollama/llama3.2:1b
      api_base: http://localhost:11434
```

---

## Listing Available Models (`GET /v1/models`)

Clients can dynamically inspect all configured aliases and permitted models:

```bash
curl http://localhost:8080/v1/models \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

Response:
```json
{
  "object": "list",
  "data": [
    {"id": "fast", "object": "model", "owned_by": "goroute-gateway"},
    {"id": "reasoning", "object": "model", "owned_by": "goroute-gateway"},
    {"id": "auto", "object": "model", "owned_by": "goroute-gateway"},
    {"id": "gemini-2.5-flash", "object": "model", "owned_by": "gemini"},
    {"id": "claude-sonnet-4-20250514", "object": "model", "owned_by": "anthropic"}
  ]
}
```

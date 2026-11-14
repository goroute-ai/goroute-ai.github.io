---
title: Gateway Data Plane API Reference
sidebar_position: 2
description: Reference for all 23 GoRoute AI Gateway /v1 data plane routes (26 operations), request/response schemas, reasoning normalization, and telemetry headers.
---

# Gateway Data Plane API Reference

GoRoute AI Gateway exposes an OpenAI-compatible data plane supporting **23 primary `/v1` paths (26 HTTP operations)** across **73 `ProviderType` profiles** (plus `CustomOpenAICompatible`). All routes execute with sub-2ms gateway overhead, automated circuit breaking, cross-provider fallbacks, and real-time micro-dollar accounting.

> [!NOTE]
> All data plane routes accept standard OpenAI SDKs (Python, TypeScript, Go) and raw HTTP clients. Set your client `base_url` to `http://localhost:8080/v1` and supply a Virtual API Key (`sk-gw-...`) via the `Authorization` header.

---

## Authentication & Standard Telemetry Headers

Every data plane request requires a tenant-scoped Virtual API Key:

```http
Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e
```

### Standard Gateway Response Headers
Every response returned by GoRoute includes rich tracing, routing, and FinOps telemetry:

| Header | Description | Example |
| :--- | :--- | :--- |
| `X-Gateway-Request-Id` | Unique UUID assigned to the request lifecycle | `req_991efda4-7fab-4b03` |
| `X-Trace-Id` | W3C / OpenTelemetry distributed trace identifier | `bad98e7deea34d7c810a963d9ed2c4ef` |
| `X-Gateway-Provider` | The winning upstream provider selected for execution | `gemini`, `anthropic`, `openai` |
| `X-Gateway-Model` | The physical upstream model that processed the request | `gemini-2.5-flash`, `claude-3-5-sonnet-20241022` |
| `X-Gateway-Cost-Micros` | Exact micro-dollar spend incurred ($0.000001 USD) | `45` ($0.000045 USD) |
| `X-Gateway-Routing-Time` | Gateway Stage 1 + Stage 2 routing overhead | `14 µs` |
| `X-Gateway-Cache` | Exact-match cache evaluation status | `HIT` or `MISS` |
| `Retry-After` | Cooldown period sent on HTTP 429 rate limit errors | `45` (seconds) |

---

## Direct Dynamic `provider/model` Routing

In addition to logical aliases (`fast`, `reasoning`), GoRoute allows clients to bypass model groups and target upstream models directly using `provider/model` syntax (e.g., `anthropic/claude-3-5-sonnet-20241022`, `cerebras/llama-3.3-70b`, `bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0`, `vertex/gemini-2.5-pro`):

- **Layer 2 Provider Subscription Check**: The caller's organization must have an active subscription for the target provider.
- **Layer 3 Model Policy Check**: The requested model must not be disabled by the organization's model availability policy.
- **Tenant Credential Isolation**: The organization must have an active credential for the target provider stored in the vault. Host environment variables are never leaked across tenant boundaries.
- **Catalog Provisioning**: The gateway may provision model records from its catalog when needed. Catalog contents and discovery behavior depend on the gateway build and configuration; a provider-side model ID is not automatically available to every tenant or key.
- **Fail-Closed Boundary**: If repository queries fail or the model is unconfigured/unauthorized, GoRoute fails closed and returns `HTTP 404 model_group_not_found` (explicit model requests never silently fall back to unrelated tenant model groups).

---

## Summary of All 23 Primary `/v1` Data Plane Paths (26 HTTP Operations)

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/chat/completions` | Multi-provider synchronous & SSE streaming chat inference |
| `POST` | `/v1/completions` | Legacy prompt text completions |
| `POST` | `/v1/embeddings` | Dense vector embeddings generation |
| `GET` | `/v1/models` | Tenant-filtered model catalogue and pricing inventory |
| `POST` | `/v1/rerank` | Document semantic reranking via Cohere v2 / Jina AI |
| `POST` | `/v1/moderations` | Automated content moderation and safety scoring |
| `POST` | `/v1/messages` | Native Anthropic Messages API ingress |
| `POST` | `/v1/messages/count_tokens` | Anthropic-compatible preflight token counting |
| `POST` | `/v1/tokenize` | In-process fast heuristic token estimation |
| `POST` | `/v1/audio/transcriptions` | Speech-to-text transcription with Whisper disk spooling |
| `POST` | `/v1/audio/translations` | Speech-to-text translation to English |
| `POST` | `/v1/audio/speech` | Text-to-speech synthesis (TTS) |
| `POST` | `/v1/images/generations` | Image generation (DALL-E 2/3, Imagen) |
| `POST` | `/v1/images/edits` | Image inpainting with mask uploads |
| `POST` | `/v1/images/variations` | Image variation generation |
| `POST` | `/v1/files` | Multipart file upload with SHA-256 deduplication |
| `GET` | `/v1/files` | List tenant files |
| `GET` | `/v1/files/{file_id}` | Retrieve file metadata |
| `GET` | `/v1/files/{file_id}/content`| Download file stream |
| `DELETE`| `/v1/files/{file_id}` | Delete stateful tenant file |
| `POST` | `/v1/batches` | Create asynchronous 24-hr batch job (50% discount) |
| `GET` | `/v1/batches` | List tenant batch jobs |
| `GET` | `/v1/batches/{batch_id}` | Inspect batch processing state and item counts |
| `POST` | `/v1/batches/{batch_id}/cancel` | Abort in-flight batch execution |
| `POST` | `/v1/responses` | OpenAI Responses API translation bridge |
| `GET` | `/v1/realtime` | Full-duplex OpenAI Realtime WebSocket session |

---

## 1. Chat Completions (`POST /v1/chat/completions`)

Standardized endpoint supporting Google Gemini, Anthropic Claude, OpenAI, Mistral, and local Ollama models in synchronous JSON or real-time Server-Sent Events (SSE) streaming mode.

### Synchronous Request

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fast",
    "messages": [
      {"role": "system", "content": "You are a concise Go systems engineer."},
      {"role": "user", "content": "How do goroutines manage stack growth?"}
    ],
    "temperature": 0.7,
    "max_tokens": 512,
    "stream": false
  }'
```

### Synchronous Response (`HTTP 200 OK`)

```json
{
  "id": "chatcmpl-req_991efda4-7fab-4b03",
  "object": "chat.completion",
  "created": 1731081600,
  "model": "gemini-2.5-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Goroutines start with a small stack (typically 2KB in modern Go). When stack space is exhausted, the runtime allocates a contiguous block twice the size and copies the existing stack over."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 42,
    "total_tokens": 66
  }
}
```

### Real-Time SSE Stream (`stream: true`)

When `stream: true` is set, GoRoute initiates a zero-buffer Server-Sent Events stream:

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"id":"chatcmpl-req_1","object":"chat.completion.chunk","created":1731081600,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"Goroutines"},"finish_reason":null}]}

data: {"id":"chatcmpl-req_1","object":"chat.completion.chunk","created":1731081600,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":" start"},"finish_reason":null}]}

data: {"id":"chatcmpl-req_1","object":"chat.completion.chunk","created":1731081600,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### Extended Reasoning & Parameter Normalization

GoRoute transparently normalizes requests targeting frontier reasoning models:
- **Reasoning Effort (`reasoning_effort`: "low" | "medium" | "high")**:
  - **OpenAI Reasoning (`o1`, `o3`, `o3-mini`)**: Converts `role: "system"` to `role: "developer"`, translates `max_tokens` to `max_completion_tokens`, and automatically strips unsupported sampling parameters (`temperature`, `top_p`).
  - **Anthropic Claude**: Enables extended thinking with token budgets (`1024`, `4096`, `16384`) and omits `temperature`/`top_p` as mandated by Anthropic.
  - **Google Gemini**: Sets `thinkingConfig.thinkingBudget` for Gemini 2.5 thinking models.
- **Anthropic Role Alternation on Tools**: When returning multiple parallel tool outputs (`role: "tool"`), GoRoute automatically consolidates consecutive tool results into a single `user` message with multiple `tool_result` content blocks to satisfy Anthropic's strict alternating turn protocol.

---

## 2. Legacy Text Completions (`POST /v1/completions`)

OpenAI-compatible prompt completion endpoint supporting single string prompts or string arrays.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo-instruct",
    "prompt": "Write a haiku about Go channels",
    "max_tokens": 64,
    "temperature": 0.5
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "id": "cmpl-req_7721a9c4",
  "object": "text_completion",
  "created": 1731081600,
  "model": "gpt-3.5-turbo-instruct",
  "choices": [
    {
      "text": "\nMessages flow like streams,\nGoroutines pass without lock,\nSync in harmony.",
      "index": 0,
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 7,
    "completion_tokens": 19,
    "total_tokens": 26
  }
}
```

---

## 3. Vector Embeddings (`POST /v1/embeddings`)

Generates dense vector embeddings across single strings or string arrays, with optional encoding formats (`float` or `base64`) and dimension truncation.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": ["GoRoute AI Gateway is ultra-fast", "Pure Go architecture"],
    "encoding_format": "float"
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0123, -0.0456, 0.0891, -0.0012]
    },
    {
      "object": "embedding",
      "index": 1,
      "embedding": [0.0341, -0.0128, 0.0712, 0.0054]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 14,
    "total_tokens": 14
  }
}
```

---

## 4. Model Catalogue Inventory (`GET /v1/models`)

Returns the tenant-filtered inventory of models accessible to the caller's Virtual API Key, evaluated against the 4-layer model access control hierarchy. Use this endpoint to check which model IDs are exposed to your caller. Provider catalogs change over time, and this response is deployment-specific; it is not a universal list of all models offered by upstream providers. The response may include capability and pricing metadata where available.

### cURL Request

```bash
curl -X GET http://localhost:8080/v1/models \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

### Illustrative response (`HTTP 200 OK`)

The model and pricing values below are sample data, not a current provider catalog or an availability guarantee.

```json
{
  "object": "list",
  "data": [
    {
      "id": "openai/gpt-4o",
      "object": "model",
      "created": 1731081600,
      "owned_by": "openai",
      "display_name": "OpenAI GPT-4o",
      "max_input_tokens": 128000,
      "max_output_tokens": 16384,
      "capabilities": {
        "tools": "supported",
        "streaming": "supported",
        "vision": "supported",
        "reasoning": "unsupported",
        "structured_outputs": "supported",
        "embeddings": "unsupported"
      },
      "supports_streaming": true,
      "supports_tools": true,
      "supports_vision": true,
      "supports_reasoning": false,
      "supports_embeddings": false,
      "input_cost_micros_per_1m": 2500000,
      "output_cost_micros_per_1m": 10000000,
      "cached_input_cost_micros_per_1m": 1250000,
      "pricing_status": "verified",
      "pricing_provenance_source": "official-vendor-pricing-2025",
      "pricing_effective_date": "2025-05-01",
      "lifecycle_status": "active"
    }
  ]
}
```

---

## 5. Document Reranking (`POST /v1/rerank`)

Calculates semantic relevance scores between a search query and a list of text documents. Integrates with Cohere v2 API and Jina AI rerankers. Aliased at `/rerank` and `/v2/rerank`.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/rerank \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-v3.5",
    "query": "What is the capital of France?",
    "documents": [
      "Carson City is the capital city of Nevada.",
      "The capital of France is Paris.",
      "Tokyo is the capital of Japan."
    ],
    "top_n": 2,
    "return_documents": true
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "id": "rerank-req_4ebe7b01",
  "model": "rerank-v3.5",
  "provider": "cohere",
  "results": [
    {
      "index": 1,
      "relevance_score": 0.9984,
      "document": { "text": "The capital of France is Paris." }
    },
    {
      "index": 0,
      "relevance_score": 0.1245,
      "document": { "text": "Carson City is the capital city of Nevada." }
    }
  ],
  "usage": {
    "search_units": 1,
    "total_tokens": 42
  }
}
```

---

## 6. Content Moderation (`POST /v1/moderations`)

Evaluates text against safety categories using upstream moderation models (e.g. OpenAI `omni-moderation-latest`). Aliased at `/moderations`.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/moderations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "omni-moderation-latest",
    "input": ["GoRoute AI Gateway is safe and reliable."]
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "id": "modr-req_865bcf43",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": false,
      "categories": {
        "hate": false,
        "violence": false,
        "self-harm": false,
        "sexual": false
      },
      "category_scores": {
        "hate": 0.00001,
        "violence": 0.00002,
        "self-harm": 0.00001,
        "sexual": 0.00003
      }
    }
  ]
}
```

---

## 7. Anthropic Messages & Token Counting

Native Anthropic ingress bridges allowing Anthropic SDKs to route directly through GoRoute.

### Anthropic Messages (`POST /v1/messages`)

```bash
curl -X POST http://localhost:8080/v1/messages \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "system": "You are a concise assistant.",
    "messages": [
      {"role": "user", "content": "Explain goroutines in 2 sentences."}
    ]
  }'
```

### Anthropic Token Counting (`POST /v1/messages/count_tokens`)

Preflight token calculation conforming to Anthropic's count tokens schema:

```bash
curl -X POST http://localhost:8080/v1/messages/count_tokens \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "Explain goroutines in 2 sentences."}
    ]
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "input_tokens": 16
}
```

---

## 8. Fast Heuristic Tokenization (`POST /v1/tokenize`)

Zero-latency, in-process token counter approximating BPE without network calls. Aliased at `/tokenize`.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/tokenize \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "prompt": "GoRoute AI Gateway provides ultra-fast routing and FinOps accounting."
  }'
```

### Response (`HTTP 200 OK`)

```json
{
  "count": 13,
  "model": "gpt-4o",
  "profile": "cl100k_base",
  "total_tokens": 13
}
```

---

## 9. Audio STT & TTS (`/v1/audio/*`)

Supports multipart audio uploads spooled to disk for zero-memory retryability, with micro-dollar FinOps billing based on integer duration seconds and character count.

### Audio Transcription (`POST /v1/audio/transcriptions`)

```bash
curl -X POST http://localhost:8080/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@meeting_audio.mp3" \
  -F "model=whisper-1" \
  -F "language=en"
```

### Audio Translation (`POST /v1/audio/translations`)

Translates foreign audio files into English text:

```bash
curl -X POST http://localhost:8080/v1/audio/translations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@french_speech.mp3" \
  -F "model=whisper-1"
```

### Audio Speech Synthesis (`POST /v1/audio/speech`)

Synthesizes text into streaming audio (formats: `mp3`, `opus`, `aac`, `flac`, `wav`):

```bash
curl -X POST http://localhost:8080/v1/audio/speech \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "GoRoute AI Gateway deployed in production.",
    "voice": "alloy",
    "response_format": "mp3"
  }' --output speech.mp3
```

---

## 10. Image Generation, Edits & Variations (`/v1/images/*`)

Supports DALL-E 2, DALL-E 3, and Imagen models, returning `url` or `b64_json` payloads with exact micro-dollar pricing matrices keyed to quality (`standard` vs `hd`) and dimensions (`1024x1024`, `1024x1792`, `1792x1024`).

### Image Generation (`POST /v1/images/generations`)

```bash
curl -X POST http://localhost:8080/v1/images/generations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "Futuristic cloud architecture diagram rendered in neon blue",
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }'
```

### Image Edits / Inpainting (`POST /v1/images/edits`)

```bash
curl -X POST http://localhost:8080/v1/images/edits \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "image=@base_image.png" \
  -F "mask=@mask.png" \
  -F "prompt": "Add a glowing golden trophy on the table" \
  -F "model=dall-e-2"
```

### Image Variations (`POST /v1/images/variations`)

```bash
curl -X POST http://localhost:8080/v1/images/variations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "image=@logo.png" \
  -F "model=dall-e-2" \
  -F "n=2"
```

---

## 11. Stateful Tenant Files (`/v1/files/*`)

Multi-tenant secure file storage with `0700` directory and `0600` file modes, automatic streaming SHA-256 deduplication indexing, and PostgreSQL metadata.

### Upload File (`POST /v1/files`)

```bash
curl -X POST http://localhost:8080/v1/files \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -F "file=@batch_requests.jsonl" \
  -F "purpose=batch"
```

Response (`HTTP 201 Created`):
```json
{
  "id": "file-8f91a2bc-3d4e",
  "object": "file",
  "bytes": 1048576,
  "created_at": 1731081600,
  "filename": "batch_requests.jsonl",
  "purpose": "batch",
  "status": "uploaded"
}
```

### List Files (`GET /v1/files`)

```bash
curl http://localhost:8080/v1/files?purpose=batch \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

### Retrieve File Metadata (`GET /v1/files/{file_id}`)

```bash
curl http://localhost:8080/v1/files/file-8f91a2bc-3d4e \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

### Download File Stream (`GET /v1/files/{file_id}/content`)

```bash
curl http://localhost:8080/v1/files/file-8f91a2bc-3d4e/content \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  --output downloaded_batch.jsonl
```

### Delete File (`DELETE /v1/files/{file_id}`)

```bash
curl -X DELETE http://localhost:8080/v1/files/file-8f91a2bc-3d4e \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

---

## 12. Asynchronous Batches (`/v1/batches/*`)

Processes JSONL line items asynchronously within a 24-hour completion window for a 50% discount. State transitions: `validating` → `in_progress` → `completed` | `failed` | `cancelled`.

### Create Batch (`POST /v1/batches`)

```bash
curl -X POST http://localhost:8080/v1/batches \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-8f91a2bc-3d4e",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h",
    "metadata": { "job": "nightly_summaries" }
  }'
```

Response (`HTTP 201 Created`):
```json
{
  "id": "batch-3c91a0b1-4f2e",
  "object": "batch",
  "endpoint": "/v1/chat/completions",
  "input_file_id": "file-8f91a2bc-3d4e",
  "completion_window": "24h",
  "status": "validating",
  "created_at": 1731081600,
  "request_counts": {
    "total": 0,
    "completed": 0,
    "failed": 0
  }
}
```

### Inspect Batch (`GET /v1/batches/{batch_id}`)

```bash
curl http://localhost:8080/v1/batches/batch-3c91a0b1-4f2e \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

### Cancel Batch (`POST /v1/batches/{batch_id}/cancel`)

```bash
curl -X POST http://localhost:8080/v1/batches/batch-3c91a0b1-4f2e/cancel \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

---

## 13. OpenAI Responses API (`POST /v1/responses`)

Stateless translation bridge conforming to the OpenAI Responses API schema (`input`, `instructions`), routing through GoRoute's 7-stage reliability pipeline.

### cURL Request

```bash
curl -X POST http://localhost:8080/v1/responses \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "input": "Summarize quantum computing principles",
    "instructions": "Be concise, use bullet points",
    "stream": true
  }'
```

### SSE Stream Format

Emits Responses events (`response.created`, `response.output_item.added`, `response.output_text.delta`, `response.output_text.done`, `response.output_item.done`, `response.completed`, `response.done`):

```http
event: response.created
data: {"response":{"id":"resp_0192a","status":"in_progress","model":"gpt-4o"}}

event: response.output_text.delta
data: {"output_index":0,"delta":"Quantum computing utilizes superposition and entanglement."}

event: response.completed
data: {"response":{"id":"resp_0192a","status":"completed"}}

event: response.done
data: {}
```

---

## 14. OpenAI Realtime WebSocket (`GET /v1/realtime`)

Full-duplex bidirectional WebSocket session handler supporting real-time speech and text streaming. Backed by `nhooyr.io/websocket` connection hijacking.

### Connecting via WebSocket

Clients connect to `ws://localhost:8080/v1/realtime?model=gpt-4o-realtime-preview` passing authentication via Bearer header or subprotocol:

```javascript
const ws = new WebSocket(
  'ws://localhost:8080/v1/realtime?model=gpt-4o-realtime-preview',
  ['realtime', 'openai-insecure-api-key.sk-gw-prod-7f9a2b8c4d1e']
);

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'response.create',
    response: {
      modalities: ['text'],
      instructions: 'You are a real-time speech assistant.'
    }
  }));
};
```

---

## Next Steps

- Explore the [Admin Control Plane API](/docs/api-reference/admin-api) for key provisioning and guardrails.
- Set up tool execution with the [MCP API](/docs/api-reference/mcp-api).
- Connect multi-agent networks via the [A2A API](/docs/api-reference/a2a-api).

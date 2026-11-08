---
title: OpenAI-Compatible Dialects
sidebar_position: 11
description: Comprehensive guide to the certified OpenAI-compatible dialect profiles and domain providers.
---

# OpenAI-Compatible Dialects

The modern AI ecosystem standardizes heavily on the OpenAI REST protocol (`POST /v1/chat/completions`, `POST /v1/embeddings`, `GET /v1/models`). However, individual vendors exhibit subtle dialect variations: differences in parameter naming (`max_completion_tokens` vs `max_tokens`), reasoning stream extraction (`delta.reasoning_content`), strict temperature limits, and custom HTTP authentication headers.

GoRoute includes a dedicated, certified **OpenAI-Compatible Dialect Engine** (`internal/adapter/openaicompat/`) containing 30+ pre-certified dialect profiles covering all 42 domain providers registered in `AllProviders()` (`internal/domain/inference.go`).

---

## Dialect Engine Architecture

The dialect engine is built around the `DialectProfile` and `ProfileRegistry` structs (`internal/adapter/openaicompat/profile.go` and `registry.go`):

```mermaid
flowchart TD
    Client["Client / SDK"] -->|Standard OpenAI Chat Request| Router["GoRoute Routing Engine"]
    Router --> Dialect["Dialect Profile Engine\n(internal/adapter/openaicompat)"]
    
    subgraph DialectEngine["Dialect Profile Pipeline"]
        direction TB
        ParamMap["Parameter Translation\n(max_completion_tokens → max_tokens)"]
        ConstraintCheck["Constraint Enforcement\n(Temperature range, TopP rejection)"]
        AuthInjection["Authentication Strategy\n(Bearer / Header)"]
        StreamAdapter["Streaming Adapter\n(ExtractReasoningDelta)"]
    end
    
    Dialect --> DialectEngine
    DialectEngine --> Upstream["Certified Upstream Provider\n(Groq, Cerebras, Together, vLLM, etc.)"]
```

### Core Dialect Capabilities

1. **Parameter Translation**: Maps non-standard parameters dynamically (e.g. converting `max_completion_tokens` to `max_tokens` for providers that reject the newer OpenAI property).
2. **Reasoning Content Extraction (`ExtractReasoningDelta`)**: Intercepts streaming chunks containing extended thinking tokens (e.g., DeepSeek R1, Grok, SambaNova) and exposes them uniformly via `delta.reasoning_content`.
3. **Dialect Constraints**: Automatically clamps or removes invalid parameters based on model family (e.g., stripping `temperature` and `top_p` for reasoning models like DeepSeek-R1 or Groq distill).
4. **Zero-Latency Model Discovery**: Handles `GET /models` probes dynamically when `SupportsListModels: true`.

---

## Certified Provider Catalog

The 42 domain providers supported across GoRoute are grouped into 8 specialized categories:

### 1. Ultra-Fast Wafer-Scale & Hardware Acceleration

Engineered for extreme token generation speeds (hundreds to thousands of tokens per second):

| Provider | ID | Default Base URL | Reasoning Delta | Tools | Key Models |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Cerebras** | `cerebras` | `https://api.cerebras.ai/v1` | No | Yes | `llama3.3-70b`, `llama3.1-8b` |
| **Groq** | `groq` | `https://api.groq.com/openai/v1` | Distill | Yes | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` |
| **SambaNova** | `sambanova` | `https://api.sambanova.ai/v1` | Yes | Yes | `Meta-Llama-3.3-70B-Instruct`, `DeepSeek-R1` |

### 2. High-Performance Serverless Inference

Low-latency, cost-effective serverless inference providers:

| Provider | ID | Default Base URL | Reasoning Delta | Embeddings | Key Models |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Fireworks AI** | `fireworks` | `https://api.fireworks.ai/inference/v1` | No | Yes | `llama-v3p3-70b-instruct`, `qwen2p5-coder-32b-instruct` |
| **Together AI** | `together` | `https://api.together.xyz/v1` | No | Yes | `meta-llama/Llama-3.3-70B-Instruct-Turbo` |
| **DeepInfra** | `deepinfra` | `https://api.deepinfra.com/v1/openai` | No | Yes | `meta-llama/Meta-Llama-3.1-70B-Instruct` |
| **Hyperbolic** | `hyperbolic` | `https://api.hyperbolic.xyz/v1` | Yes | No | `deepseek-ai/DeepSeek-V3`, `DeepSeek-R1` |
| **Novita AI** | `novita` | `https://api.novita.ai/v3/openai` | Yes | Yes | `deepseek/deepseek-r1`, `llama-3.3-70b` |
| **Friendli AI** | `friendli` | `https://inference.friendli.ai/v1` | No | No | `meta-llama-3.1-70b-instruct` |
| **Nebius AI Studio** | `nebius` | `https://api.studio.nebius.ai/v1` | Yes | No | `deepseek-ai/DeepSeek-R1`, `meta-llama/Meta-Llama-3.1-70B` |
| **Scaleway** | `scaleway` | `https://api.scaleway.ai/v1` | No | No | `llama-3.3-70b-instruct` |
| **Lambda Labs** | `lambda` | `https://api.lambdalabs.com/v1` | No | No | `hermes-3-llama-3.1-405b` |

### 3. Search & Reasoning

Engines featuring integrated web search or deep multi-step reasoning capabilities:

| Provider | ID | Default Base URL | Reasoning Delta | Special Capabilities |
| :--- | :--- | :--- | :---: | :--- |
| **xAI (Grok)** | `xai` | `https://api.x.ai/v1` | Yes | Grok 2, Grok 2 Vision, reasoning output |
| **Perplexity AI**| `perplexity` | `https://api.perplexity.ai` | No | Live citation generation (`sonar-pro`, `sonar`) |
| **SiliconFlow** | `siliconflow` | `https://api.siliconflow.cn/v1` | Yes | DeepSeek R1/V3, Qwen 2.5, BGE reranker & embeddings |
| **DeepSeek** | `deepseek` | `https://api.deepseek.com/v1` | Yes | DeepSeek-V3, DeepSeek-R1 reasoning models |

### 4. Multi-Model Aggregators

Dynamic routing across hundreds of upstream endpoints:

| Provider | ID | Default Base URL | Reasoning Delta | Description |
| :--- | :--- | :--- | :---: | :--- |
| **OpenRouter** | `openrouter` | `https://openrouter.ai/api/v1` | Yes | Universal aggregator with auto-failover and model routing |
| **Anyscale** | `anyscale` | `https://api.endpoints.anyscale.com/v1` | No | Scalable foundation model hosting powered by Ray |

### 5. Self-Hosted & Local Inference Engines

Run models on internal GPU clusters or local developer workstations:

| Provider | ID | Default Base URL | Supported Frameworks |
| :--- | :--- | :--- | :--- |
| **vLLM** | `vllm` | `http://localhost:8000/v1` | PagedAttention, Tensor Parallelism, Guided Decoding |
| **SGLang** | `vllm` (compatible) | Custom URL | RadixAttention for fast prefix caching |
| **TensorRT-LLM** | `vllm` (compatible) | Custom URL | NVIDIA optimized execution engine |
| **Baseten** | `baseten` | `https://bridge.baseten.co/v1` | Truss-packaged custom model deployments |
| **LMStudio / Jan / LocalAI** | `ollama` or `custom` | Local port | Desktop developer sandboxes |

### 6. Specialized Embeddings & Reranking

Optimized exclusively for dense retrieval and ranking:

| Provider | ID | Default Base URL | Modality | Top Models |
| :--- | :--- | :--- | :--- | :--- |
| **Voyage AI** | `voyage` | `https://api.voyageai.com/v1` | Embeddings | `voyage-3`, `voyage-3-large`, `voyage-code-2` |
| **Jina AI** | `jina` | `https://api.jina.ai/v1` | Embeddings & Rerank | `jina-embeddings-v3`, `jina-reranker-v2-base-multilingual` |

### 7. Enterprise Foundation Model Platforms

Enterprise AI platforms with custom SLAs and hardware governance:

| Provider | ID | Default Base URL | Modality | Top Models |
| :--- | :--- | :--- | :--- | :--- |
| **NVIDIA NIM** | `nvidia` | `https://integrate.api.nvidia.com/v1` | Chat, Vision | `meta/llama-3.3-70b-instruct`, `mistralai/mistral-large-2` |
| **Replicate** | `replicate` | `https://api.replicate.com/v1` | Chat, Multi | Hosted open-source model deployments |
| **AI21 Labs** | `ai21` | `https://api.ai21.com/studio/v1` | Chat | `jamba-1.5-large`, `jamba-1.5-mini` |

### 8. Global Enterprise & Regional Providers

Tier-1 cloud platforms across Asia, Europe, and North America:

| Provider | ID | Default Base URL | Features |
| :--- | :--- | :--- | :--- |
| **Cloudflare Workers AI** | `cloudflare` | `https://api.cloudflare.com/client/v4/ai/v1` | Serverless edge inference across 300+ PoPs |
| **Databricks Model Serving** | `databricks` | Configured per workspace | Unity Catalog governance and Mosaic AI |
| **Snowflake Cortex** | `snowflake` | Configured per account | In-database LLM inference and search |
| **Alibaba DashScope** | `dashscope` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | Qwen 2.5 series (`qwen-max`, `qwen-plus`) |
| **ByteDance Volcengine** | `volcengine` | `https://ark.cn-beijing.volces.com/api/v3` | Doubao models, temperature clamped `[0.0, 1.0]` |
| **Zhipu AI BigModel** | `bigmodel` | `https://open.bigmodel.cn/api/paas/v4` | GLM-4 series with web search |
| **Moonshot AI (Kimi)** | `moonshot` | `https://api.moonshot.cn/v1` | Long-context Kimi models (up to 2M tokens) |
| **MiniMax** | `minimax` | `https://api.minimax.chat/v1` | MiniMax-Text-01 with reasoning extraction |

---

## Configuration Examples

### Dialect Configuration in `configs/config.yaml`

```yaml
model_list:
  # 1. Cerebras Ultra-Fast Wafer-Scale
  - model_name: ultra-fast
    model_params:
      model: cerebras/llama3.3-70b
      api_key: os.environ/CEREBRAS_API_KEY
      weight: 100

  # 2. xAI Grok with Reasoning
  - model_name: grok-chat
    model_params:
      model: xai/grok-2-1212
      api_key: os.environ/XAI_API_KEY

  # 3. Together AI with Temperature Clamping
  - model_name: together-llama
    model_params:
      model: together/meta-llama/Llama-3.3-70B-Instruct-Turbo
      api_key: os.environ/TOGETHER_API_KEY

  # 4. DeepSeek R1 with Reasoning Delta Extraction
  - model_name: deepseek-reasoner
    model_params:
      model: deepseek/deepseek-reasoner
      api_key: os.environ/DEEPSEEK_API_KEY

  # 5. NVIDIA NIM API
  - model_name: nim-llama
    model_params:
      model: nvidia/meta/llama-3.3-70b-instruct
      api_key: os.environ/NVIDIA_API_KEY

  # 6. Voyage AI Dedicated Embeddings
  - model_name: voyage-embed
    model_params:
      model: voyage/voyage-3
      api_key: os.environ/VOYAGE_API_KEY
```

---

## Reasoning Delta Extraction (`ExtractReasoningDelta`)

When calling reasoning-oriented models (such as `DeepSeek-R1`, `Grok-2`, or SambaNova's R1 endpoint) via streaming, the provider returns reasoning thoughts in a non-standard JSON delta field:

```json
{"choices": [{"delta": {"reasoning_content": "Let's first decompose the algorithm into three phases..."}}]}
```

GoRoute's dialect adapter automatically detects `ExtractReasoningDelta: true`, preserves the field, and streams it to the client:

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role": "user", "content": "Solve the 8-queens problem with backtracking."}],
    "stream": true
  }'
```

```text
data: {"id":"chatcmpl-912","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"reasoning_content":"Phase 1: Board representation..."}}]}
...
data: {"id":"chatcmpl-912","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Here is the Python implementation:"}}]}
```

---

## Dialect Parameter Clamping & Overrides

Certain providers enforce strict constraints on parameters:
- **Together AI**: Restricts `temperature` strictly between `0.0` and `1.0`. Any request with `temperature: 1.5` is clamped to `1.0` before transmission.
- **DeepSeek R1 / Grok Distill**: Rejects requests that pass custom `temperature` or `top_p`. The dialect adapter strips these parameters cleanly to prevent upstream HTTP 400 errors.
- **Standard Param Map**: Translates `max_completion_tokens` to `max_tokens` for providers that have not adopted OpenAI's August 2024 spec changes.

> [!TIP]
> If you run a custom internal model that exhibits idiosyncratic parameter requirements, configure a profile in `providers.custom_openai_compatible` in `configs/config.yaml`. See the [Custom Provider Guide](/docs/providers/custom-provider) for syntax details.

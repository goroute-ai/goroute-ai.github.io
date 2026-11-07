---
title: Mistral AI
sidebar_position: 9
description: Native Mistral AI provider adapter for Mistral Large, Codestral, Pixtral, and Embeddings.
---

# Mistral AI

GoRoute provides a native adapter for **Mistral AI** (`internal/adapter/mistral/`), providing unified access to European frontier models including **Mistral Large**, **Codestral** (dedicated coding model), **Pixtral** (multimodal vision), and **Mistral Embeddings**.

The adapter handles complete protocol translation, streaming SSE token accumulation, automatic model discovery, and tool calling normalization.

---

## Supported Models

| Model | Identifier | Modality | Max Context | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Mistral Large** | `mistral-large-latest` | Chat, Code, Tools | 128,000 tokens | Flagship frontier model for complex reasoning |
| **Mistral Small** | `mistral-small-latest` | Fast Chat, Tools | 128,000 tokens | Low-latency, cost-effective inference |
| **Codestral** | `codestral-latest` | Code Generation, FIM | 256,000 tokens | Specialized programming and code completion |
| **Pixtral 12B** | `pixtral-12b-2409` | Vision, Multimodal | 128,000 tokens | Multimodal document and image understanding |
| **Mistral Embed**| `mistral-embed` | Embeddings | 8,192 tokens | High-performance 1024-dimensional dense embeddings |

---

## Capabilities & Protocol Translation

### Role Normalization
Mistral's chat completion endpoints require standard `system`, `user`, `assistant`, and `tool` roles. When clients send requests with OpenAI's newer `developer` role, GoRoute automatically normalizes it to `system` before dispatching to Mistral.

### Model Auto-Discovery
The Mistral adapter implements `ListModels` (`internal/adapter/mistral/adapter.go:ListModels`), querying `GET /v1/models` using your configured credential. When model discovery is enabled in GoRoute (`discovery.enabled: true`), new models released by Mistral are automatically cataloged into the gateway's registry.

### Function & Tool Calling
Mistral supports native tool calling identical to OpenAI function calling specifications. Tool calls, tool results, and `tool_choice` parameters are forwarded transparently.

---

## Gateway Configuration

Configure Mistral deployments in `configs/config.yaml`:

```yaml
model_list:
  # Primary: Mistral Large
  - model_name: mistral-large
    routing_strategy: weighted-shuffle
    fallbacks: ["mistral-small"]
    model_params:
      model: mistral/mistral-large-latest
      api_key: os.environ/MISTRAL_API_KEY
      rpm: 1000
      tpm: 500000

  # Dedicated Code Assistant: Codestral
  - model_name: codestral
    model_params:
      model: mistral/codestral-latest
      api_key: os.environ/MISTRAL_API_KEY

  # Multimodal: Pixtral 12B
  - model_name: pixtral
    model_params:
      model: mistral/pixtral-12b-2409
      api_key: os.environ/MISTRAL_API_KEY

  # Dense Vector Embeddings
  - model_name: mistral-embed
    model_params:
      model: mistral/mistral-embed
      api_key: os.environ/MISTRAL_API_KEY
```

Set the API key in your environment:

```bash
export MISTRAL_API_KEY="your-mistral-api-key"
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-large",
    "messages": [
      {"role": "system", "content": "You are a senior systems engineer."},
      {"role": "user", "content": "Compare eBPF and kernel modules for network observability."}
    ],
    "temperature": 0.2,
    "max_tokens": 500
  }'
```

### 2. Code Generation with Codestral

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "codestral",
    "messages": [
      {"role": "user", "content": "Write an efficient LRU Cache in Go using sync.Mutex and container/list."}
    ],
    "temperature": 0.1
  }'
```

### 3. Embeddings via Mistral Embed

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-embed",
    "input": ["Mistral Embed provides 1024-dimensional semantic representations."]
  }'
```

### 4. Calling Mistral via the Go SDK

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "mistral-chat",
				Model:     "mistral/mistral-large-latest",
				APIKey:    "os.environ/MISTRAL_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Failed to initialize gateway: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "mistral-chat", "What makes European data privacy regulations unique?")
	if err != nil {
		log.Fatalf("Mistral chat error: %v", err)
	}

	fmt.Println("Mistral Large Response:\n", response)
}
```

> [!NOTE]
> Mistral endpoints deployed in your own VPC or hosted on Azure AI Model Catalog can be targeted by specifying a custom `api_base` within `model_params`.

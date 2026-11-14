---
title: Google Gemini
sidebar_position: 4
description: Google Gemini provider integration for chat, embeddings, multimodal inputs, image generation, audio, and thinking budgets.
---

# Google Gemini

GoRoute provides a native provider adapter for **Google Gemini** (`internal/adapter/gemini/`), translating standard OpenAI chat completion, streaming, embeddings, and tool calling requests into Google's **Gemini REST API** (`generateContent`, `streamGenerateContent`).

The adapter supports Google AI Studio API keys, multimodal audio and image inputs, structured JSON outputs, image generation, and reasoning-budget handling. The model IDs shown here are provider-side examples, not an exhaustive or guaranteed-current list of models supported by every GoRoute deployment. Check [Google's current Gemini model list](https://ai.google.dev/gemini-api/docs/models), then confirm which models your key can use with [`GET /v1/models`](/docs/api-reference/gateway-api#4-model-catalogue-inventory-get-v1models).

---

## Representative model IDs

| Model family / task | Example Gemini API identifier |
| :--- | :--- |
| Gemini Flash | `gemini-3.8-flash` |
| Gemini Flash (previous generation) | `gemini-2.5-flash` |
| Text embeddings | `gemini-embedding-001` |
| Image generation | `gemini-3.1-flash-image` |

These examples refer to the Gemini API catalog. Google AI Studio and Vertex AI can expose different model IDs and availability. An ID listed by Google does not confirm that it is enabled for your GoRoute deployment or compatible with every gateway route; check the gateway inventory and the relevant Google endpoint documentation.

---

## Thinking Budget Controls (Gemini 2.5 Flash)

Gemini 2.5 Flash includes integrated chain-of-thought thinking capabilities. However, when a client requests a very short completion (for example, classification or sentiment analysis with `max_tokens <= 16`), an unconstrained thinking process can consume the entire token budget on internal thoughts, resulting in an empty response string.

GoRoute implements an automated guardrail in `internal/adapter/gemini/adapter.go`:

```go
// When max_tokens is small (<= 16) on Gemini 2.5 Flash without explicit reasoning effort,
// set thinkingBudget: 0 so all output tokens go to visible response text rather than internal thought tokens.
if req.MaxTokens != nil && *req.MaxTokens <= 16 && req.ReasoningEffort == "" && model == "gemini-2.5-flash" {
    genCfg.ThinkingConfig = &providers.GeminiThinkingConfig{ThinkingBudget: 0}
}
```

This guarantees that compact responses (such as "YES", "NO", or category codes) are immediately returned without being starved by internal thought generation.

When deeper reasoning is needed, specify `reasoning_effort` (`"low"`, `"medium"`, or `"high"`) in your request to configure proportional token budgets.

---

## Multimodal Audio & Vision Ingress

Gemini models feature native multimodal processing. Clients can pass high-resolution images or audio files directly within the OpenAI message content array:

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Describe the architecture diagram in this image:"},
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            }
          }
        ]
      }
    ]
  }'
```

---

## Schema Translation: OpenAI to Gemini

The Gemini adapter executes bidirectional transformation between OpenAI REST schemas and Gemini's content object model:

| OpenAI Schema | Gemini REST Mapping |
| :--- | :--- |
| `role: "system"` or `"developer"` | Top-level `systemInstruction` with `role: "user"` |
| `role: "assistant"` | `role: "model"` |
| `role: "user"` | `role: "user"` |
| `role: "tool"` | `role: "function"` with `functionResponse` |
| `tools[].function` | `tools[].functionDeclarations[]` |
| `response_format: {"type": "json_object"}` | `generationConfig.responseMimeType: "application/json"` |
| `response_format: {"type": "json_schema"}` | `generationConfig.responseSchema` |

---

## Gateway Configuration

Add Gemini deployments to `configs/config.yaml`:

```yaml
model_list:
  # Primary: Gemini Flash example; verify this ID in your gateway inventory first
  - model_name: gemini-fast
    routing_strategy: weighted-shuffle
    fallbacks: ["gemini-pro"]
    model_params:
      model: gemini/gemini-3.8-flash
      api_key: os.environ/GEMINI_API_KEY
      rpm: 1000
      tpm: 1000000

  # Previous-generation Pro example
  - model_name: gemini-pro
    model_params:
      model: gemini/gemini-2.5-pro
      api_key: os.environ/GEMINI_API_KEY

  # Gemini Embeddings
  - model_name: gemini-embedding
    model_params:
      model: gemini/gemini-embedding-001
      api_key: os.environ/GEMINI_API_KEY
```

Set the API key in your environment:

```bash
export GEMINI_API_KEY="AIzaSy..."
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-fast",
    "messages": [
      {"role": "system", "content": "You are a concise technical writer."},
      {"role": "user", "content": "What is the function of an L4 load balancer?"}
    ],
    "temperature": 0.2,
    "max_tokens": 300
  }'
```

### 2. Streaming Responses

The Gemini adapter parses upstream Server-Sent Events (`streamGenerateContent?alt=sse`) and converts candidate content chunks into standard OpenAI SSE frames:

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-fast",
    "messages": [{"role": "user", "content": "Explain how Go channels are implemented."}],
    "stream": true
  }'
```

### 3. Calling Gemini via the Go SDK

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
				ModelName: "gemini-fast",
				Model:     "gemini/gemini-2.5-flash",
				APIKey:    "os.environ/GEMINI_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway initialization failed: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "gemini-fast", "Summarize why vector embeddings are critical for RAG systems.")
	if err != nil {
		log.Fatalf("Gemini chat error: %v", err)
	}

	fmt.Println("Gemini Reply:\n", response)
}
```

> [!TIP]
> If your enterprise agreement requires routing Gemini traffic through Google Cloud IAM, VPC Service Controls, or specific European regions, use the native [Google Cloud Vertex AI adapter](/docs/providers/google-vertex) instead of the Gemini API Studio adapter.

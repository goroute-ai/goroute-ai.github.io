---
title: Ollama
sidebar_position: 10
description: Native Ollama provider adapter for local inference, model auto-discovery, and streaming NDJSON translation.
---

# Ollama

GoRoute provides a native adapter for **Ollama** (`internal/adapter/ollama/`), allowing development teams and edge deployments to route requests to local or self-hosted open-source models with zero egress cost and complete data privacy.

The adapter connects to Ollama's native HTTP API (`/api/chat`, `/api/embed`, `/api/tags`), automatically converting between OpenAI's request/response formats and Ollama's schema while handling newline-delimited JSON (NDJSON) streaming translation.

---

## Architecture & Stream Translation

Ollama streams response tokens as newline-delimited JSON (NDJSON) rather than the standard SSE (`text/event-stream`) format expected by OpenAI clients.

GoRoute implements native stream transcoding in `internal/adapter/ollama/adapter.go:StreamChatCompletion` using `sse.ReadNDJSON`:

```mermaid
flowchart LR
    Client["Client / Application"] -->|"POST /v1/chat/completions (SSE)"| GW["GoRoute AI Gateway"]
    GW -->|"POST /api/chat (stream)"| Ollama["Ollama Daemon (:11434)"]
    Ollama -->|"NDJSON Lines"| GW
    GW -->|"Standard OpenAI SSE"| Client
```

When Ollama indicates stream completion (`done: true`), GoRoute captures `prompt_eval_count` and `eval_count` and attaches a final standard `usage` object to the SSE stream before emitting `data: [DONE]`.

---

## Local Model Auto-Discovery

The Ollama adapter implements `ListModels` by querying Ollama's local catalog endpoint:
```text
GET /api/tags
```

When background model synchronization is enabled in GoRoute (`discovery.enabled: true`), any model pulled to your local daemon (e.g., `ollama run deepseek-r1:14b` or `ollama pull llama3.2:3b`) is automatically discovered and registered with the gateway.

---

## Network Security & SSRF Configuration

Because Ollama typically runs over plaintext HTTP on `http://localhost:11434` or internal private IP addresses, GoRoute's SSRF protection policies must be configured accordingly in `configs/config.yaml`:

> [!IMPORTANT]
> In production environments, GoRoute blocks private IP ranges and unencrypted HTTP by default. To connect to a local or internal Ollama server, explicitly permit private networks and HTTP in the security configuration:

```yaml
security:
  network:
    outbound_ssrf:
      allow_private_networks: true
      allow_insecure_http: true # Required for http:// endpoints
      allowed_schemes: ["http", "https"]
      allowed_private_cidrs:
        - "127.0.0.1/32"
        - "10.0.0.0/8"
        - "172.16.0.0/12"
```

If GoRoute runs inside Docker or Kubernetes:
- `http://localhost:11434` points to the container itself.
- Use `http://host.docker.internal:11434` (macOS/Windows Docker) or your cluster DNS service (e.g. `http://ollama.ollama.svc.cluster.local:11434`).

---

## Gateway Configuration

Configure local Ollama models in `configs/config.yaml`:

```yaml
model_list:
  # Local Llama 3.2 3B for offline/edge development
  - model_name: local-llama
    model_params:
      model: ollama/llama3.2:3b
      api_base: "http://localhost:11434"

  # Local DeepSeek R1 14B for offline reasoning
  - model_name: local-deepseek
    model_params:
      model: ollama/deepseek-r1:14b
      api_base: "http://localhost:11434"

  # Local Nomic Embeddings
  - model_name: local-embed
    model_params:
      model: ollama/nomic-embed-text
      api_base: "http://localhost:11434"
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-llama",
    "messages": [
      {"role": "user", "content": "Explain the difference between TCP and UDP in one sentence."}
    ],
    "temperature": 0.2
  }'
```

### 2. Streaming Chat with Token Generation

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-llama",
    "messages": [{"role": "user", "content": "Write a quicksort implementation in Python."}],
    "stream": true
  }'
```

### 3. Local Embeddings via Ollama

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-embed",
    "input": ["Self-hosted vector embeddings for private search."]
  }'
```

### 4. Calling Ollama via the Go SDK

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
				ModelName: "local-llama",
				Model:     "ollama/llama3.2:3b",
				APIBase:   "http://localhost:11434",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway initialization failed: %v", err)
	}
	defer gw.Close()

	reply, err := gw.Chat(ctx, "local-llama", "Why are local LLMs important for data security?")
	if err != nil {
		log.Fatalf("Ollama chat failed: %v", err)
	}

	fmt.Println("Local Model Output:\n", reply)
}
```

> [!TIP]
> Ollama models can participate directly in high-availability fallback chains. You can configure cloud models (such as GPT-4o or Claude 3.5 Sonnet) to fail over automatically to an on-premises Ollama instance when WAN connectivity is severed.

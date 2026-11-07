---
title: Anthropic Claude
sidebar_position: 3
description: Native Anthropic adapter for Claude 3.5 Sonnet, Haiku, Opus with Messages API, extended thinking budgets, and role alternation tool consolidation.
---

# Anthropic Claude

GoRoute provides a native high-performance adapter for **Anthropic** (`internal/adapter/anthropic/`), translating standard OpenAI chat completion and tool calling requests into Anthropic's **Messages API** (`POST /v1/messages`).

The adapter natively implements Anthropic-specific protocol requirements—such as extended thinking budgets, strict user/assistant turn alternation, tool use consolidation, and Server-Sent Events (SSE) stream translation.

---

## Supported Models

| Model | Anthropic Identifier | Context Window | Max Output Tokens | Modalities |
| :--- | :--- | :--- | :--- | :--- |
| **Claude 3.5 Sonnet v2** | `claude-3-5-sonnet-20241022` | 200,000 tokens | 8,192 tokens | Chat, Code, Vision, Tools, Thinking |
| **Claude 3.5 Haiku** | `claude-3-5-haiku-20241022` | 200,000 tokens | 8,192 tokens | Fast Chat, Code, Tools |
| **Claude 3 Opus** | `claude-3-opus-20240229` | 200,000 tokens | 4,096 tokens | Deep Analysis, Complex Reasoning |

---

## Alternating Turn Tool Consolidation

Anthropic's Messages API enforces a strict architectural rule: **every conversation must alternate strictly between `user` and `assistant` turns**. 

In the OpenAI protocol, when a model executes parallel function calls, the client sends back separate consecutive messages with `role: "tool"`. If sent verbatim to Anthropic, this would trigger an immediate `400 invalid_request_error` (`consecutive messages with the same role are disallowed`).

```mermaid
flowchart TD
    subgraph OpenAIClient["OpenAI Client Ingress"]
        direction TB
        M1["assistant: tool_calls [tool_1, tool_2]"]
        M2["tool: result_1 (call_id: tool_1)"]
        M3["tool: result_2 (call_id: tool_2)"]
    end

    subgraph GoRouteConsolidation["GoRoute Turn Consolidation Engine"]
        M1 --> A1["assistant turn: content_blocks [tool_use_1, tool_use_2]"]
        M2 & M3 --> U1["Single user turn: content_blocks [tool_result_1, tool_result_2]"]
    end

    subgraph AnthropicUpstream["Anthropic Messages API"]
        A1 --> Upstream["Validated Strict Alternation"]
        U1 --> Upstream
    end
```

GoRoute's adapter (`internal/adapter/anthropic/adapter.go`) automatically intercepts consecutive `role: "tool"` entries and consolidates them into a single `user` turn containing multiple `tool_result` content blocks:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A...",
      "content": "{\"temperature\": 72, \"condition\": \"Sunny\"}"
    },
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01B...",
      "content": "{\"humidity\": 45}"
    }
  ]
}
```

---

## Extended Thinking Budgets

Anthropic Claude 3.7 and 3.5 Sonnet support extended thinking, allowing the model to perform chain-of-thought reasoning before outputting its response.

GoRoute normalizes reasoning across providers. When you supply `reasoning_effort` (`"low"`, `"medium"`, `"high"`), GoRoute automatically configures Anthropic's `thinking` block:

| `reasoning_effort` | Budget Tokens | Behavior |
| :--- | :--- | :--- |
| `"high"` | 8,192 tokens | Deep problem decomposition and exhaustive code verification |
| `"medium"` | 4,096 tokens | Balanced reasoning for analytical questions |
| `"low"` | 2,048 tokens | Targeted reasoning step verification |

### Automatic Max Tokens Elevation
Anthropic requires that `max_tokens > thinking.budget_tokens`. If a client specifies `max_tokens: 4096` with `reasoning_effort: "high"` (budget: 8192), GoRoute automatically elevates `max_tokens` to `10240` (`budget + 2048`) to ensure the request is accepted and there is sufficient room for the final response.

Furthermore, because Anthropic strictly forbids setting custom `temperature` or `top_p` when thinking is enabled, GoRoute automatically nils out those parameters before dispatch.

---

## System Prompt Extraction

Anthropic does not allow `role: "system"` messages in its `messages` array. GoRoute automatically filters all messages with `role: "system"` or `role: "developer"`, concatenates their text with double newlines (`\n\n`), and places the result in the top-level Anthropic `system` property.

---

## Gateway Configuration

Add Anthropic models to `configs/config.yaml`:

```yaml
model_list:
  # Primary: Claude 3.5 Sonnet
  - model_name: claude-3-5-sonnet
    routing_strategy: least-busy
    fallbacks: ["claude-3-5-haiku", "gpt-4o"]
    model_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
      rpm: 2000
      tpm: 400000

  # High-throughput: Claude 3.5 Haiku
  - model_name: claude-3-5-haiku
    model_params:
      model: anthropic/claude-3-5-haiku-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  # Deep Reasoning: Claude 3 Opus
  - model_name: claude-3-opus
    model_params:
      model: anthropic/claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY
```

Set the API key in your environment:

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

---

## Usage Examples

### 1. Chat Completion with Thinking Enabled

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet",
    "reasoning_effort": "high",
    "messages": [
      {"role": "system", "content": "You are a distributed systems architect."},
      {"role": "user", "content": "Formulate a formal proof that Raft leader election guarantees election safety."}
    ]
  }'
```

### 2. Streaming Chat with Tool Calls

GoRoute parses Anthropic's Server-Sent Events stream (`content_block_start`, `content_block_delta`, `message_delta`, `message_stop`) and emits standard OpenAI SSE chunks:

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "Explain how epoll scales differently than select."}],
    "stream": true
  }'
```

### 3. Calling Anthropic via the Go SDK

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
				ModelName: "claude-chat",
				Model:     "anthropic/claude-3-5-sonnet-20241022",
				APIKey:    "os.environ/ANTHROPIC_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Failed to initialize gateway: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "claude-chat", "What are the trade-offs of LSM-trees vs B-Trees in write-heavy workloads?")
	if err != nil {
		log.Fatalf("Claude chat error: %v", err)
	}

	fmt.Println("Claude Response:\n", response)
}
```

> [!TIP]
> Anthropic Messages ingress is also available on direct Anthropic routes: `POST /v1/messages` and `POST /anthropic/v1/messages`. Anthropic SDK callers can point their base URL directly to GoRoute without modifying request code.

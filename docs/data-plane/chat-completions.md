---
title: Chat Completions API
sidebar_position: 1
description: 100% OpenAI-compatible Chat Completions endpoint standardizing reasoning effort, role alternation, dynamic provider routing, and telemetry headers.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chat Completions API (`POST /v1/chat/completions`)

The GoRoute Data Plane provides a 100% OpenAI-compatible Chat Completions endpoint standardizing request parameters, tool calls, and real-time SSE streaming across all upstream providers (OpenAI, Anthropic Claude, Google Gemini, Mistral, Cerebras, Groq, DeepSeek, and local Ollama models).

---

## Endpoint Specification

- **Method**: `POST`
- **Path**: `/v1/chat/completions` (also supports unversioned `/chat/completions`)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Key Capabilities & Enterprise Extensions

### 1. Dynamic Provider & Model Routing

Beyond predefined logical aliases (`fast`, `reasoning`, `coding`), GoRoute supports direct dynamic wildcard dispatch via `provider/model` syntax:

```json
{
  "model": "cerebras/llama-3.3-70b",
  "messages": [{"role": "user", "content": "Explain kernel bypass networking."}]
}
```

Other direct provider routing examples:
- `anthropic/claude-3-5-sonnet`
- `gemini/gemini-2.5-flash`
- `groq/llama-3.3-70b-versatile`
- `deepseek/deepseek-chat`

> [!NOTE]
> Direct provider routing evaluates your organization's Layer 2 Provider Subscriptions, Layer 3 Org Model Policies, and Virtual Key allowlists before dynamically provisioning or dispatching to the target provider.

### 2. Reasoning Effort & Thinking Budgets

For reasoning models (OpenAI o1/o3/o4, Anthropic Claude 3.7 Sonnet, Google Gemini 2.5), GoRoute accepts standard `reasoning_effort`:

```json
{
  "model": "reasoning",
  "messages": [{"role": "user", "content": "Solve this distributed systems puzzle."}],
  "reasoning_effort": "high"
}
```

The gateway standardizes reasoning across providers:
- **Anthropic Claude**: Maps `"low"`, `"medium"`, and `"high"` to explicit `thinking: {"type": "enabled", "budget_tokens": N}` (`1024`, `4096`, or `16384` tokens).
- **Google Gemini 2.5**: Injects `thinkingConfig.thinkingBudget` accordingly.
- **OpenAI o1/o3**: Passes native `reasoning_effort`.
- **Pre-Flight Estimation**: Reserves an additional 1,024 tokens during pre-flight rate limiting when `reasoning_effort` is detected.

### 3. Strict Role Alternation & Tool Consolidation

Anthropic and Google Gemini mandate strict turn alternation between `user` and `assistant`. In multi-tool calling flows, OpenAI returns multiple consecutive `role: "tool"` messages for parallel calls.

When routing to Anthropic or Gemini, GoRoute automatically **consolidates consecutive tool results** into a single `user` turn with multiple `tool_result` content blocks. You never need to hand-craft vendor-specific turn structures.

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Synchronous Chat Completion with direct provider routing
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cerebras/llama-3.3-70b",
    "messages": [
      {"role": "system", "content": "You are a concise systems architect."},
      {"role": "user", "content": "Why is DPDK faster than traditional kernel socket I/O?"}
    ],
    "temperature": 0.2,
    "max_tokens": 256
  }'

# 2. Hybrid Reasoning with thinking effort on Claude 3.7
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet",
    "messages": [
      {"role": "user", "content": "Prove that Raft election safety holds in asynchronous networks."}
    ],
    "reasoning_effort": "high"
  }'

# 3. Server-Sent Events (SSE) Streaming
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fast",
    "messages": [{"role": "user", "content": "Stream a haiku about distributed consensus."}],
    "stream": true
  }'
```

</TabItem>
<TabItem value="python" label="Python (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080/v1"
)

# Synchronous with reasoning effort
response = client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Explain zero-copy buffer pooling in Go."}],
    extra_body={"reasoning_effort": "medium"}
)
print(response.choices[0].message.content)

# Zero-buffer streaming
stream = client.chat.completions.create(
    model="cerebras/llama-3.3-70b",
    messages=[{"role": "user", "content": "Stream me the steps of TLS 1.3 handshake."}],
    stream=True
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")
```

</TabItem>
<TabItem value="go" label="Go SDK">

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
			gateway.ModelEntry{ModelName: "fast", Model: "gemini/gemini-2.5-flash"},
			gateway.ModelEntry{ModelName: "reasoning", Model: "anthropic/claude-3-5-sonnet"},
		),
		gateway.WithDemoMocksIfEnvMissing(),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer gw.Close()

	// Synchronous completion
	res, err := gw.Chat(ctx, "fast", "Explain zero-allocation design in Go.")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("[%s] %s (cost: %d µ$)\n", res.Model, res.Content, res.CostMicros)

	// Zero-buffer SSE streaming
	_, err = gw.StreamChat(ctx, "fast", "Stream a 1-sentence haiku.", func(delta string) error {
		fmt.Print(delta)
		return nil
	})
}
```

</TabItem>
<TabItem value="ts" label="TypeScript / Node">

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-gw-prod-7f9a2b8c4d1e",
  baseURL: "http://localhost:8080/v1",
});

async function run() {
  const stream = await client.chat.completions.create({
    model: "cerebras/llama-3.3-70b",
    messages: [{ role: "user", content: "Stream me a summary of Raft consensus." }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}
run();
```

</TabItem>
</Tabs>

---

## Gateway Telemetry Response Headers

Every chat completion response includes detailed telemetry headers for end-to-end tracing and auditing:

| Header | Description | Example |
| :--- | :--- | :--- |
| `X-Gateway-Request-Id` | Unique UUID assigned to the request lifecycle | `req_fb502e5e-b39a-4d9a` |
| `X-Trace-Id` | W3C / OpenTelemetry distributed trace ID | `8d380107e03c29fd8d979bbc660a10e9` |
| `X-Gateway-Provider` | The winning upstream provider selected | `cerebras`, `anthropic`, `gemini` |
| `X-Gateway-Model` | The physical upstream model executed | `llama-3.3-70b`, `claude-3-5-sonnet` |
| `X-Gateway-Cost-Micros` | Micro-dollar spend incurred ($0.000001 USD) | `13` ($0.000013 USD) |
| `X-Gateway-Routing-Time` | Gateway Stage 1 + Stage 2 routing overhead | `12 µs` |
| `X-Gateway-Cache` | Cache evaluation result | `HIT` or `MISS` |
| `Retry-After` | Cooldown period sent on HTTP 429 rate limit | `45` (seconds) |

> [!TIP]
> When `X-Gateway-Cache: HIT` is returned, `X-Gateway-Cost-Micros` is `0`, confirming that the response was served from cache without upstream provider token charges.

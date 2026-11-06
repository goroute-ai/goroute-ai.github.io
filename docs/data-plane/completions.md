---
title: Legacy Text Completions API
sidebar_position: 4
description: OpenAI-compatible text completions endpoint supporting raw prompt text, prompt arrays, parameter controls, and token usage accounting.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Legacy Text Completions API (`POST /v1/completions`)

While modern generative LLM architectures predominantly utilize the conversational `/v1/chat/completions` schema, GoRoute AI Gateway maintains first-class support for the classic **Text Completions API** (`POST /v1/completions`). This endpoint is essential for base foundation models, instruction-following base models (such as `gpt-3.5-turbo-instruct`), code-infilling engines, and legacy pipelines.

---

## Endpoint Specification

- **HTTP Method**: `POST`
- **Supported Paths**:
  - `/v1/completions`
  - `/completions` (Unversioned alias)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Request & Response Schemas

### Request Schema (`CanonicalCompletionRequest`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | **Yes** | Target model (e.g. `gpt-3.5-turbo-instruct`, `mistral-tiny`). |
| `prompt` | string \| string[] | **Yes** | The prompt(s) to generate completions for. Can be a single string or an array of strings. |
| `max_tokens` | integer | No | Maximum number of tokens to generate. |
| `temperature` | float | No | Sampling temperature between `0.0` and `2.0`. |
| `top_p` | float | No | Nucleus sampling probability cutoff (alternative to temperature). |
| `stream` | boolean | No | Whether to stream back partial progress via Server-Sent Events (SSE). |
| `stop` | string[] | No | Up to 4 sequences where the model will cease generating further tokens. |
| `user` | string | No | A unique identifier representing your end-user for abuse monitoring. |

> [!NOTE]
> GoRoute's JSON parser uses an internal polymorphic unmarshaler (`CompletionPrompt`), transparently accepting either `"prompt": "Write a poem"` or `"prompt": ["First prompt", "Second prompt"]`.

### Response Schema (`CanonicalCompletionResponse`)

```json
{
  "id": "cmpl-8a19b3d0-994c-4e89-9fa2-5813f02e6a12",
  "model": "gpt-3.5-turbo-instruct",
  "provider": "openai",
  "choices": [
    {
      "index": 0,
      "text": "\n\nConcurrency in Go is built on goroutines and channels.",
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 12,
    "total_tokens": 20
  }
}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# Single string prompt
curl -X POST http://localhost:8080/v1/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo-instruct",
    "prompt": "Complete the sentence: In computer science, an idempotent operation is",
    "max_tokens": 64,
    "temperature": 0.2
  }'

# Array prompt batching
curl -X POST http://localhost:8080/v1/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo-instruct",
    "prompt": [
      "def fibonacci(n):",
      "def quicksort(arr):"
    ],
    "max_tokens": 128,
    "temperature": 0.0
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

# Single completion
completion = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Explain CAP theorem in one sentence:",
    max_tokens=50,
    temperature=0.3
)
print(completion.choices[0].text.strip())

# Streaming completion
stream = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt="Count from 1 to 5:",
    max_tokens=20,
    stream=True
)
for chunk in stream:
    print(chunk.choices[0].text or "", end="")
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type CompletionRequest struct {
	Model       string   `json:"model"`
	Prompt      any      `json:"prompt"`
	MaxTokens   int      `json:"max_tokens,omitempty"`
	Temperature float64  `json:"temperature,omitempty"`
	Stop        []string `json:"stop,omitempty"`
}

type CompletionResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int    `json:"index"`
		Text         string `json:"text"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

func main() {
	reqPayload := CompletionRequest{
		Model:       "gpt-3.5-turbo-instruct",
		Prompt:      "The primary distinction between TCP and UDP is",
		MaxTokens:   60,
		Temperature: 0.1,
	}

	data, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/completions",
		bytes.NewReader(data),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var compResp CompletionResponse
	_ = json.Unmarshal(body, &compResp)

	fmt.Printf("Model: %s | Tokens: %d\n", compResp.Model, compResp.Usage.TotalTokens)
	if len(compResp.Choices) > 0 {
		fmt.Printf("Completion: %s\n", compResp.Choices[0].Text)
	}
}
```

</TabItem>
</Tabs>

---

## Token Quota & FinOps Ledger Integration

Requests entering `/v1/completions` follow the identical multi-layer FinOps lifecycle as chat completions:

1. **Pre-Flight Estimation**: Tokens are estimated as `PromptChars / 4` (minimum 10 tokens) and reserved via the sliding-window rate limiter.
2. **Post-Flight Reconciliation**: When upstream execution finishes, exact prompt and completion token counts from `Usage` are reconciled with the rate limiter.
3. **Micro-Dollar Ledger**: An immutable `SpendEvent` is committed asynchronously with cost calculated using 64-bit ceiling integer arithmetic:

```text
Cost (µ$) = ⌈ (PromptTokens * InputRate + CompletionTokens * OutputRate) / 1,000,000 ⌉
```

> [!TIP]
> If your application is migrating from legacy base models to instruction-tuned chat models, consider switching to [`/v1/chat/completions`](/docs/data-plane/chat-completions) for broader multi-provider routing and structured tool calling.

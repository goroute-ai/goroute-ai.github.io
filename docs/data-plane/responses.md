---
title: OpenAI Responses API
sidebar_position: 12
description: OpenAI Responses API specification supporting instructions, polymorphic input, synchronous JSON, and multi-event SSE streaming.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI Responses API (`POST /v1/responses`)

GoRoute AI Gateway supports OpenAI's next-generation **Responses API** (`POST /v1/responses`). Designed as the structural successor to chat completions, the Responses API consolidates instructions, multimodal conversation context, and progressive output items under an object-oriented event paradigm.

---

## Endpoint Specification

- **HTTP Method**: `POST`
- **Supported Paths**:
  - `/v1/responses`
  - `/responses` (Unversioned alias)
  - `/openai/v1/responses` (OpenAI wire compatibility alias)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Request & Response Schemas

### Request Schema (`CanonicalResponseRequest`)

```json
{
  "model": "gpt-4.1",
  "instructions": "You are a concise infrastructure assistant.",
  "input": "Explain the role of an intelligent proxy in LLM gateways.",
  "temperature": 0.5,
  "max_output_tokens": 300,
  "stream": false
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | **Yes** | Target model (e.g. `gpt-4.1`, `fast`, `gemini/gemini-2.5-flash`). |
| `instructions`| string | No | Top-level system directives governing the assistant's behavior. |
| `input` | string \| object[] | **Yes** | User input string or array of prior conversation message objects. |
| `temperature` | float | No | Sampling temperature between `0.0` and `2.0`. |
| `max_output_tokens` | integer | No | Maximum token ceiling for generated output items. |
| `tools` | array | No | Function/tool definitions forwarded to the selected upstream provider. |
| `extra_body` | object | No | Provider-specific parameters merged without clobbering core request fields. |
| `stream` | boolean | No | When `true`, streams incremental lifecycle events via SSE. |

### Synchronous Response Schema (`CanonicalResponseOutput`)

```json
{
  "id": "resp_98a7bc12-f049-411a-8c9e-28491a0123fe",
  "object": "response",
  "created_at": 1740000000,
  "model": "gpt-4.1",
  "status": "completed",
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 48,
    "total_tokens": 72
  },
  "output": [
    {
      "id": "msg_89f1a23c_0",
      "type": "message",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "An intelligent proxy acts as an abstraction layer between client applications and heterogeneous upstream model providers..."
        }
      ]
    }
  ]
}
```

---

## Streaming Event Lifecycle

When `"stream": true` is enabled, the Responses API delivers granular lifecycle events over Server-Sent Events (`text/event-stream`):

```http
event: response.created
data: {"response":{"id":"resp_...","object":"response","status":"in_progress","model":"gpt-4.1","created_at":1740000000}}

event: response.output_item.added
data: {"output_index":0,"item":{"id":"msg_...","type":"message","status":"in_progress","role":"assistant"}}

event: response.content_part.added
data: {"output_index":0,"content_index":0,"part":{"type":"output_text","text":""}}

event: response.text.delta
data: {"output_index":0,"content_index":0,"delta":"An intelligent"}

event: response.text.delta
data: {"output_index":0,"content_index":0,"delta":" proxy manages..."}

event: response.output_text.done
data: {"output_index":0,"content_index":0,"text":"An intelligent proxy manages..."}

event: response.output_item.done
data: {"output_index":0,"item":{"id":"msg_...","type":"message","status":"completed","role":"assistant","content":[{"type":"output_text","text":"An intelligent proxy manages..."}]}}

event: response.completed
data: {"response":{"id":"resp_...","object":"response","status":"completed","model":"gpt-4.1","created_at":1740000000,"output":[...]}}

event: response.done
data: {}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. Non-streaming call
curl -X POST http://localhost:8080/v1/responses \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "instructions": "Be strictly factual and brief.",
    "input": "What is the capital of Australia?",
    "stream": false
  }'

# 2. SSE Streaming call via /openai/v1/responses
curl -X POST http://localhost:8080/openai/v1/responses \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "instructions": "Count from 1 to 5.",
    "input": "Begin counting.",
    "stream": true
  }'
```

</TabItem>
<TabItem value="python" label="Python (HTTPX)">

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:8080",
    headers={"Authorization": "Bearer sk-gw-prod-7f9a2b8c4d1e"}
)

response = client.post("/v1/responses", json={
    "model": "fast",
    "instructions": "You are an assistant specializing in Go concurrency.",
    "input": "Describe channel buffering in 15 words or less."
})

data = response.json()
print("Status:", data["status"])
print("Output:", data["output"][0]["content"][0]["text"])
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

type ResponseRequest struct {
	Model        string `json:"model"`
	Instructions string `json:"instructions,omitempty"`
	Input        string `json:"input"`
	Stream       bool   `json:"stream"`
}

type ResponseOutput struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	Output []struct {
		Role    string `json:"role"`
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	} `json:"output"`
}

func main() {
	payload, _ := json.Marshal(ResponseRequest{
		Model:        "gpt-4.1",
		Instructions: "Answer concisely.",
		Input:        "What is mutual TLS?",
		Stream:       false,
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/responses",
		bytes.NewReader(payload),
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
	var out ResponseOutput
	_ = json.Unmarshal(body, &out)

	if len(out.Output) > 0 && len(out.Output[0].Content) > 0 {
		fmt.Printf("Response (%s): %s\n", out.ID, out.Output[0].Content[0].Text)
	}
}
```

</TabItem>
</Tabs>

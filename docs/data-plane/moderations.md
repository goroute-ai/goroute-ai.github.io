---
title: Content Moderation API
sidebar_position: 3
description: Fail-closed content moderation via OpenAI omni-moderation-latest with category flags, granular confidence scores, and virtual key security boundaries.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Content Moderation API (`POST /v1/moderations`)

GoRoute AI Gateway provides automated content moderation powered by OpenAI's `omni-moderation-latest` model. The Moderation endpoint analyzes input text for potentially harmful content across a broad taxonomy of safety categories, returning both boolean flags and granular confidence scores.

---

## Endpoint Specification

- **HTTP Method**: `POST`
- **Supported Paths**:
  - `/v1/moderations`
  - `/moderations` (Unversioned alias)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`
- **Default Model**: `omni-moderation-latest`

---

## Safety & Fail-Closed Semantics

The moderation pipeline enforces strict enterprise safety guarantees:

1. **Fail-Closed Policy**: If moderation fails (network timeout, upstream error, or token budget exhaustion), the gateway does not silently permit the traffic to bypass inspection. Downstream applications can rely on explicit verdicts before presenting user input to generative models.
2. **RBAC Model Authorization**: The virtual key identity context is verified against org policy to ensure the caller has permissions to invoke moderation models.
3. **Multi-Input Batching**: Accepts either a single string or an array of strings in a single HTTP request for high-throughput ingress screening.

> [!IMPORTANT]
> Because safety classification occurs prior to expensive LLM reasoning passes, GoRoute allocates minimal rate limiter quota (`len(inputs) * 10` tokens) to ensure moderation calls are never throttled ahead of inference traffic.

---

## Request & Response Schemas

### Request Schema (`CanonicalModerationRequest`)

```json
{
  "model": "omni-moderation-latest",
  "input": [
    "Here is an ordinary engineering question about distributed consensus.",
    "Text to be evaluated for safety policy compliance."
  ]
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | No | The moderation model to use. Defaults to `omni-moderation-latest` if omitted. |
| `input` | string \| string[] | **Yes** | The input string or array of strings to classify for safety violations. |

### Response Schema (`CanonicalModerationResponse`)

```json
{
  "id": "modr_34a9b2c8-89f1-419b-b9d2-9723ec0110fa",
  "model": "omni-moderation-latest",
  "provider": "openai",
  "results": [
    {
      "flagged": false,
      "categories": {
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "illicit": false,
        "illicit/violent": false,
        "self-harm": false,
        "self-harm/instructions": false,
        "self-harm/intent": false,
        "sexual": false,
        "sexual/minors": false,
        "violence": false,
        "violence/graphic": false
      },
      "category_scores": {
        "harassment": 0.00018,
        "harassment/threatening": 0.00004,
        "hate": 0.00008,
        "hate/threatening": 0.00001,
        "illicit": 0.00032,
        "illicit/violent": 0.00002,
        "self-harm": 0.00001,
        "self-harm/instructions": 0.00001,
        "self-harm/intent": 0.00001,
        "sexual": 0.00012,
        "sexual/minors": 0.00001,
        "violence": 0.00045,
        "violence/graphic": 0.00006
      }
    }
  ]
}
```

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# Single string input
curl -X POST http://localhost:8080/v1/moderations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Explain how to secure a Kubernetes cluster with mTLS."
  }'

# Batch multi-string input with explicit model
curl -X POST http://localhost:8080/v1/moderations \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "omni-moderation-latest",
    "input": [
      "Hello world, checking input moderation.",
      "Another piece of candidate text."
    ]
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

response = client.moderations.create(
    model="omni-moderation-latest",
    input=[
        "Building resilient microservices using Go and Chi router.",
        "A second candidate text for pre-flight validation."
    ]
)

for idx, result in enumerate(response.results):
    print(f"Item {idx}: Flagged = {result.flagged}")
    if result.flagged:
        for category, is_violation in result.categories:
            if is_violation:
                score = getattr(result.category_scores, category, 0.0)
                print(f"  - Violated {category} (score: {score:.4f})")
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

type ModerationRequest struct {
	Model string   `json:"model,omitempty"`
	Input []string `json:"input"`
}

type ModerationResponse struct {
	ID       string `json:"id"`
	Model    string `json:"model"`
	Provider string `json:"provider"`
	Results  []struct {
		Flagged        bool               `json:"flagged"`
		Categories     map[string]bool    `json:"categories"`
		CategoryScores map[string]float64 `json:"category_scores"`
	} `json:"results"`
}

func main() {
	payload, _ := json.Marshal(ModerationRequest{
		Model: "omni-moderation-latest",
		Input: []string{
			"Architectural guidelines for GoRoute AI Gateway.",
		},
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/moderations",
		bytes.NewReader(payload),
	)
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var modResp ModerationResponse
	_ = json.Unmarshal(body, &modResp)

	fmt.Printf("Moderation ID: %s | Provider: %s\n", modResp.ID, modResp.Provider)
	for i, r := range modResp.Results {
		fmt.Printf("  Item %d: Flagged = %t\n", i, r.Flagged)
	}
}
```

</TabItem>
</Tabs>

---

## Response Headers

| Header | Description |
| :--- | :--- |
| `X-Gateway-Request-Id` | Unique UUID tracking the moderation lifecycle (`req_...`) |
| `X-Gateway-Provider` | Upstream provider executing classification (`openai`) |
| `X-Gateway-Cost-Micros` | FinOps charge incurred (omni-moderation is zero-cost upstream, billed at 0 micro-dollars) |
| `X-Gateway-Pricing-Status` | Provenance status (`verified`) |

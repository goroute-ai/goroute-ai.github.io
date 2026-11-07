---
title: Embeddings API
sidebar_position: 9
description: Dense vector embeddings across OpenAI, Google Gemini, Mistral, Cohere Embed v3, and Voyage AI with base64 encoding and dimension reduction.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Embeddings API (`POST /v1/embeddings`)

Generate dense vector embeddings across OpenAI, Google Gemini, Mistral, **Cohere Embed v3**, and **Voyage AI** using a single unified schema. Vector embeddings transform text into high-dimensional numerical vectors for semantic search, retrieval-augmented generation (RAG), clustering, and classification.

---

## Endpoint Specification

- **Method**: `POST`
- **Path**: `/v1/embeddings` (also supports unversioned `/embeddings`)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Supported Providers & Model Families

GoRoute standardizes embedding generation across leading model providers:

| Provider | Notable Models | Dimensions | Features |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `text-embedding-3-small`, `text-embedding-3-large` | 1536 / 3072 | Matryoshka dimension truncation, float & base64. |
| **Cohere** | `cohere/embed-english-v3.0`, `cohere/embed-multilingual-v3.0` | 1024 | Task-specific optimization (`search_document`, `search_query`). |
| **Voyage AI** | `voyage/voyage-3`, `voyage/voyage-3-large`, `voyage/voyage-code-3` | 1024 / 1536 | Optimized for code search, legal, and enterprise RAG. |
| **Google** | `gemini/text-embedding-004` | 768 | High-throughput low-latency multilingual embeddings. |
| **Mistral** | `mistral/mistral-embed` | 1024 | European data locality and multi-language support. |

---

## Request & Response Schemas

### Request Schema (`CanonicalEmbeddingRequest`)

```json
{
  "model": "text-embedding-3-small",
  "input": [
    "GoRoute AI Gateway provides sub-millisecond routing.",
    "Pure Go compiles to native machine code without Cgo."
  ],
  "encoding_format": "float",
  "dimensions": 512
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | **Yes** | Model identifier or provider alias (e.g. `text-embedding-3-small`, `voyage/voyage-3`). |
| `input` | string \| string[] | **Yes** | Input text or array of input texts to vectorize. |
| `encoding_format` | string | No | `float` (default) or `base64`. Base64 yields smaller HTTP payload sizes. |
| `dimensions` | integer | No | Truncate dimensions on models supporting Matryoshka embeddings (e.g. OpenAI v3). |
| `user` | string | No | Optional end-user identifier for abuse monitoring. |

### Response Schema (`CanonicalEmbeddingResponse`)

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0123, -0.0456, 0.0789, "..."]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 16,
    "total_tokens": 16
  }
}
```

> [!NOTE]
> When `encoding_format: "base64"` is requested, each item's `embedding` contains a base64-encoded string representing the Little-Endian IEEE 754 binary floating-point array, dramatically shrinking response payload size over HTTP.

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# 1. OpenAI Embeddings with Matryoshka dimension reduction
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": [
      "GoRoute AI Gateway provides sub-millisecond routing.",
      "Pure Go compiles to native machine code without Cgo."
    ],
    "dimensions": 512
  }'

# 2. Voyage AI Code Embeddings
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voyage/voyage-code-3",
    "input": "func ServeHTTP(w http.ResponseWriter, r *http.Request)"
  }'

# 3. Cohere Embed v3
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere/embed-english-v3.0",
    "input": ["Document text to index in vector database"]
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

# Standard embeddings with dimension customization
response = client.embeddings.create(
    model="text-embedding-3-large",
    input=["Vector search with GoRoute AI Gateway", "Distributed embeddings cache"],
    dimensions=1024
)

for item in response.data:
    print(f"Index {item.index}: Vector length = {len(item.embedding)}")

# Voyage AI model via same client
voyage_resp = client.embeddings.create(
    model="voyage/voyage-3",
    input=["Retrieval augmented generation in finance"]
)
print("Voyage embedding dimension:", len(voyage_resp.data[0].embedding))
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

type EmbeddingRequest struct {
	Model      string   `json:"model"`
	Input      []string `json:"input"`
	Dimensions int      `json:"dimensions,omitempty"`
}

type EmbeddingResponse struct {
	Model string `json:"model"`
	Data  []struct {
		Index     int       `json:"index"`
		Embedding []float64 `json:"embedding"`
	} `json:"data"`
	Usage struct {
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

func main() {
	payload, _ := json.Marshal(EmbeddingRequest{
		Model:      "text-embedding-3-small",
		Input:      []string{"Zero allocation networking in Go."},
		Dimensions: 256,
	})

	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/embeddings",
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
	var embResp EmbeddingResponse
	_ = json.Unmarshal(body, &embResp)

	fmt.Printf("Model: %s | Total Tokens: %d\n", embResp.Model, embResp.Usage.TotalTokens)
	if len(embResp.Data) > 0 {
		fmt.Printf("Vector dimension: %d\n", len(embResp.Data[0].Embedding))
	}
}
```

</TabItem>
</Tabs>

---

## Response Telemetry & FinOps Ledger

Every embeddings request returns:
- `X-Gateway-Request-Id`: Unique request UUID (`req_...`)
- `X-Gateway-Provider`: Provider used (`openai`, `voyage`, `cohere`)
- `X-Gateway-Cost-Micros`: Exact micro-dollar cost based on input tokens
- `X-Gateway-Pricing-Status`: `verified`, `custom`, or `unknown`

> [!TIP]
> Use [`POST /v1/tokenize`](/docs/data-plane/tokenize) to pre-calculate embedding batch sizes and stay within upstream token limits without running extra network calls.

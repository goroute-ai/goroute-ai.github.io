---
title: Document Reranking API
sidebar_position: 2
description: Unified document reranking across Cohere v2 and Jina AI with structured rank fields, top_n filtering, and micro-dollar search unit accounting.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Document Reranking API (`POST /v1/rerank`)

The GoRoute Data Plane provides a unified semantic reranking API compatible with **Cohere v2** (`/v2/rerank`) and **Jina AI**. Reranking takes an initial set of candidate documents retrieved via lexical or vector search and reorders them using cross-encoder deep neural models for optimal relevance against a search query.

---

## Endpoint Specification

- **HTTP Methods**: `POST`
- **Supported Paths**:
  - `/v1/rerank` (Standardized gateway endpoint)
  - `/rerank` (Unversioned compatibility alias)
  - `/v2/rerank` (Cohere v2 wire specification alias)
- **Authentication**: `Bearer sk-gw-...` (Virtual Key or Master Admin Key)
- **Content-Type**: `application/json`

---

## Request & Response Schemas

### Request Schema (`CanonicalRerankRequest`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | **Yes** | Target reranker model or provider/model (e.g. `cohere/rerank-v3.5`, `jina/jina-reranker-v2-base-multilingual`). |
| `query` | string | **Yes** | The search query against which candidate documents are scored. |
| `documents` | array | **Yes** | Candidate documents. Accepts either an array of plain strings (`string[]`) or an array of arbitrary JSON objects (`object[]`). |
| `top_n` | integer | No | Maximum number of top-ranked results to return. If omitted, all documents are returned in ranked order. |
| `rank_fields` | string[] | No | When `documents` contains structured objects, specifies which JSON keys to consider for relevance ranking (e.g. `["title", "content"]`). |
| `return_documents` | boolean | No | Whether to return the document payload inside each result item. Default: `false`. |
| `max_tokens_per_doc` | integer | No | Maximum tokens per document to evaluate. Documents exceeding this length will be truncated by the upstream cross-encoder. |

### Response Schema (`CanonicalRerankResponse`)

```json
{
  "id": "rerank_c7b5f90a-1123-4f9e-8c3b-280145c2ee01",
  "model": "rerank-v3.5",
  "provider": "cohere",
  "results": [
    {
      "index": 1,
      "relevance_score": 0.9842,
      "document": {
        "text": "GoRoute AI Gateway is built with pure Go 1.24 and avoids Cgo overhead."
      }
    },
    {
      "index": 0,
      "relevance_score": 0.3129,
      "document": {
        "text": "The solar system contains eight major planets orbiting the Sun."
      }
    }
  ],
  "meta": {
    "api_version": {
      "version": "2"
    },
    "billed_units": {
      "search_units": 1
    }
  },
  "usage": {
    "search_units": 1,
    "total_tokens": 84
  }
}
```

> [!NOTE]
> The `index` field in each result item corresponds to the original 0-based position of the document in the input `documents` array, allowing zero-copy mapping back to your local candidate cache.

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
# Plain string documents
curl -X POST http://localhost:8080/v1/rerank \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere/rerank-v3.5",
    "query": "high performance zero allocation proxy",
    "documents": [
      "Traditional Python proxies incur GIL locking and GC latency pauses.",
      "GoRoute AI Gateway achieves sub-millisecond p99 latency with pure Go zero-allocation buffers.",
      "PostgreSQL stores virtual key credentials with AES-256-GCM envelope encryption."
    ],
    "top_n": 2,
    "return_documents": true
  }'

# Structured object documents with rank_fields via /v2/rerank alias
curl -X POST http://localhost:8080/v2/rerank \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jina/jina-reranker-v2-base-multilingual",
    "query": "how to configure upstream fallbacks",
    "documents": [
      {
        "title": "Reliability & Fallbacks",
        "section": "configuration",
        "content": "Configure fallback_group_ids in configs/config.yaml for seamless provider failover."
      },
      {
        "title": "Audio Speech Synthesis",
        "section": "audio",
        "content": "Speech synthesis maps characters using integer ceiling division to micro-dollars."
      }
    ],
    "rank_fields": ["title", "content"],
    "top_n": 1,
    "return_documents": true
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:8080",
    headers={"Authorization": "Bearer sk-gw-prod-7f9a2b8c4d1e"}
)

response = client.post("/v1/rerank", json={
    "model": "cohere/rerank-v3.5",
    "query": "zero allocation memory buffers",
    "documents": [
        "GoRoute streaming uses zero-allocation sync.Pool buffers.",
        "Node.js event loops can block on large string concatenations.",
        "Redis provides distributed sliding window rate limiting."
    ],
    "top_n": 2,
    "return_documents": True
})

data = response.json()
print(f"Provider: {response.headers.get('X-Gateway-Provider')}")
print(f"Cost: {response.headers.get('X-Gateway-Cost-Micros')} micro-dollars")
for item in data["results"]:
    print(f"Rank score: {item['relevance_score']:.4f} (Original index: {item['index']})")
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

type RerankRequest struct {
	Model           string   `json:"model"`
	Query           string   `json:"query"`
	Documents       []string `json:"documents"`
	TopN            int      `json:"top_n,omitempty"`
	ReturnDocuments bool     `json:"return_documents"`
}

type RerankResult struct {
	Index          int                    `json:"index"`
	RelevanceScore float64                `json:"relevance_score"`
	Document       map[string]interface{} `json:"document,omitempty"`
}

type RerankResponse struct {
	ID       string         `json:"id"`
	Model    string         `json:"model"`
	Provider string         `json:"provider"`
	Results  []RerankResult `json:"results"`
	Usage    struct {
		SearchUnits int `json:"search_units"`
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

func main() {
	reqBody := RerankRequest{
		Model: "cohere/rerank-v3.5",
		Query: "sub-millisecond gateway latency",
		Documents: []string{
			"High latency Python backends suffer from interpreter overhead.",
			"GoRoute provides sub-millisecond p99 latency using pure Go and Chi router.",
			"Docusaurus produces static developer documentation portals.",
		},
		TopN:            2,
		ReturnDocuments: true,
	}

	payload, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "http://localhost:8080/v1/rerank", bytes.NewReader(payload))
	req.Header.Set("Authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var rerankResp RerankResponse
	_ = json.Unmarshal(body, &rerankResp)

	fmt.Printf("Status: %d | Provider: %s | Search Units: %d\n",
		resp.StatusCode, rerankResp.Provider, rerankResp.Usage.SearchUnits)
	for _, r := range rerankResp.Results {
		fmt.Printf("  [Score: %.4f] Index %d: %v\n", r.RelevanceScore, r.Index, r.Document["text"])
	}
}
```

</TabItem>
</Tabs>

---

## FinOps Accounting & Micro-Dollar Ledger

Rerank workloads do not consume standard prompt/completion tokens; upstream providers (like Cohere) bill based on **Search Units** (where 1 Search Unit typically represents up to 100 candidate documents processed in a query).

GoRoute AI Gateway enforces micro-dollar integer accounting:

```text
Cost (µ$) = search_units * RerankCostMicrosPerSearchUnit
```

> [!IMPORTANT]
> If a provider catalog record does not have a verified `RerankCostMicrosPerSearchUnit`, the gateway tags the request with `X-Gateway-Pricing-Status: unknown` and falls back defensively, preventing ledger divergence.

### Telemetry Headers

Each rerank response carries telemetry headers for observability:
- `X-Gateway-Request-Id`: Unique tracking ID (`req_...`)
- `X-Gateway-Provider`: Winning upstream provider (`cohere` or `jina`)
- `X-Gateway-Cost-Micros`: Exact micro-dollar charge deducted from the virtual key's budget
- `X-Gateway-Pricing-Status`: `verified`, `custom`, or `unknown`

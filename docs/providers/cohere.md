---
title: Cohere
sidebar_position: 8
description: Native Cohere v2 adapter for Command R/R+, Embed v3, Rerank v3.5, and micro-dollar search unit FinOps accounting.
---

# Cohere

GoRoute provides a native provider adapter for **Cohere** (`internal/adapter/cohere/`), delivering full enterprise support for Cohere's **v2 API** suite. This includes conversational generation with **Command R** and **Command R+**, multilingual dense vector embeddings with **Cohere Embed v3**, state-of-the-art document reranking with **Cohere Rerank v3.5**, and exact micro-dollar accounting for Rerank search units.

---

## Supported Modalities & Endpoints

| Modality | Gateway Route | Upstream Cohere Endpoint | Primary Models |
| :--- | :--- | :--- | :--- |
| **Chat & Tools** | `POST /v1/chat/completions` | `POST /v2/chat` | `command-r-plus-08-2024`, `command-r-08-2024` |
| **Embeddings** | `POST /v1/embeddings` | `POST /v2/embed` | `embed-english-v3.0`, `embed-multilingual-v3.0` |
| **Document Rerank** | `POST /v1/rerank`, `/rerank`, `/v2/rerank` | `POST /v2/rerank` | `rerank-v3.5`, `rerank-english-v3.0` |

---

## High-Precision Document Reranking

Cohere's Rerank API dramatically improves the accuracy of Retrieval-Augmented Generation (RAG) pipelines by scoring candidate documents against a search query using cross-encoders.

GoRoute implements native rerank handling in `internal/server/handlers_rerank.go` and `internal/adapter/cohere/adapter.go`:

```mermaid
sequenceDiagram
    autonumber
    participant App as RAG Application
    participant GW as GoRoute AI Gateway
    participant Cohere as Cohere API (/v2/rerank)

    App->>GW: POST /v1/rerank (query, documents[], top_n)
    GW->>Cohere: POST /v2/rerank (Bearer COHERE_API_KEY)
    Cohere-->>GW: Results (relevance_score, index, meta.billed_units.search_units)
    Note over GW: FinOps Ledger records micro-dollars per search unit
    GW-->>App: 200 OK (X-Gateway-Cost-Micros header + ranked results)
```

### Request & Response Schema

#### Request (`POST /v1/rerank`, `POST /rerank`, or `POST /v2/rerank`)
```json
{
  "model": "rerank-v3.5",
  "query": "What are the latency advantages of wafer-scale engines?",
  "documents": [
    "Wafer-scale engines integrate an entire wafer onto a single chip, cutting off-chip interconnect bottlenecks.",
    "Traditional GPU clusters rely on InfiniBand networks with microsecond scale hops.",
    "Solar panel production utilizes silicon wafers cut from cylindrical ingots."
  ],
  "top_n": 2,
  "return_documents": true,
  "max_tokens_per_doc": 4096
}
```

#### Response
```json
{
  "id": "rerank-080b06b9-e137-4f6c-859b-14d23253b27b",
  "results": [
    {
      "index": 0,
      "relevance_score": 0.9842,
      "document": {
        "text": "Wafer-scale engines integrate an entire wafer onto a single chip, cutting off-chip interconnect bottlenecks."
      }
    },
    {
      "index": 1,
      "relevance_score": 0.6518,
      "document": {
        "text": "Traditional GPU clusters rely on InfiniBand networks with microsecond scale hops."
      }
    }
  ],
  "meta": {
    "billed_units": {
      "search_units": 1
    }
  }
}
```

---

## FinOps Search Unit Accounting

Unlike token-based generation models, Cohere Rerank is billed per **Search Unit** (typically 1 search unit per query and up to 100 documents, subject to token length).

GoRoute tracks rerank usage directly in the FinOps ledger (`internal/finops/calculator.go`):
- Reads `meta.billed_units.search_units` from the upstream response.
- Multiplies by the configured model rate (`RerankCostMicrosPerSearchUnit`).
- Emits cost telemetry in the `X-Gateway-Cost-Micros` response header.
- Enforces real-time organization spending quotas before request dispatch.

> [!NOTE]
> 1 Search Unit at Cohere standard pricing is $0.002 (2,000 micro-dollars). GoRoute accounts for this with 64-bit integer micro-dollar precision without floating-point drift.

---

## Gateway Configuration

Add Cohere models to `configs/config.yaml`:

```yaml
model_list:
  # Cohere Command R+ (Chat & Tools)
  - model_name: cohere-command-r-plus
    model_params:
      model: cohere/command-r-plus-08-2024
      api_key: os.environ/COHERE_API_KEY

  # Cohere Command R (Fast Chat)
  - model_name: cohere-command-r
    model_params:
      model: cohere/command-r-08-2024
      api_key: os.environ/COHERE_API_KEY

  # Cohere Embed English v3
  - model_name: cohere-embed
    model_params:
      model: cohere/embed-english-v3.0
      api_key: os.environ/COHERE_API_KEY

  # Cohere Rerank v3.5
  - model_name: rerank-v3.5
    model_params:
      model: cohere/rerank-v3.5
      api_key: os.environ/COHERE_API_KEY
```

Set your Cohere API key:

```bash
export COHERE_API_KEY="your-cohere-api-key"
```

---

## Usage Examples

### 1. Document Reranking via cURL

```bash
curl -X POST http://localhost:8080/v1/rerank \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-v3.5",
    "query": "How does vector database index caching work?",
    "documents": [
      "Vector indexes like HNSW build proximity graphs in memory to accelerate nearest neighbor queries.",
      "Relational databases use B-Trees for structured range indexing.",
      "Redis is an in-memory key-value cache used for session persistence."
    ],
    "top_n": 1,
    "return_documents": true
  }'
```

Response includes telemetry headers:
```http
HTTP/1.1 200 OK
X-Gateway-Provider: cohere
X-Gateway-Model: rerank-v3.5
X-Gateway-Cost-Micros: 2000
Content-Type: application/json
```

### 2. Conversational Generation (Command R+)

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere-command-r-plus",
    "messages": [
      {"role": "user", "content": "What is the difference between dense and sparse embeddings?"}
    ],
    "temperature": 0.3
  }'
```

### 3. Embeddings via Cohere Embed v3

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere-embed",
    "input": ["Cohere Embed v3 produces high-quality document embeddings."]
  }'
```

### 4. Calling Cohere via the Go SDK

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
				ModelName: "cohere-chat",
				Model:     "cohere/command-r-plus-08-2024",
				APIKey:    "os.environ/COHERE_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway initialization failed: %v", err)
	}
	defer gw.Close()

	reply, err := gw.Chat(ctx, "cohere-chat", "Explain the concept of semantic search.")
	if err != nil {
		log.Fatalf("Chat failed: %v", err)
	}

	fmt.Println("Cohere Command R+ Reply:\n", reply)
}
```

> [!TIP]
> Cohere supports structured documents in rerank requests. You can pass objects with `rank_fields` (e.g. `["title", "body"]`) to evaluate multi-field records accurately without string flattening.

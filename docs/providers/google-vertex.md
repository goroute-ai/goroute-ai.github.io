---
title: Google Cloud Vertex AI
sidebar_position: 6
description: Native Google Cloud Vertex AI adapter with Service Account auth, OAuth2 token caching, and Gemini models.
---

# Google Cloud Vertex AI

GoRoute provides a native enterprise adapter for **Google Cloud Vertex AI** (`internal/adapter/vertex/`), enabling organizations to consume Google's Gemini models through their existing Google Cloud Platform (GCP) enterprise agreements, VPC Service Controls, and IAM role hierarchies.

The Vertex AI adapter directly communicates with the Vertex AI Platform REST endpoints:
```text
https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/{model}:generateContent
```

---

## Authentication & Token Exchange

Vertex AI requires an **OAuth2 Bearer access token** scoped to `https://www.googleapis.com/auth/cloud-platform`. GoRoute implements a built-in cryptographic token exchange pipeline (`internal/adapter/vertex/auth.go`) that eliminates the need for sidecars or local `gcloud` installations.

```mermaid
sequenceDiagram
    participant GW as GoRoute AI Gateway
    participant OAuth as Google OAuth2
    participant Vertex as Vertex AI Endpoint

    GW->>GW: 1. Load GCP Service Account JSON
    GW->>OAuth: 2. POST /token (Signed Assertion JWT)
    OAuth-->>GW: 3. Access Token (Bearer ya29... expires 3600s)
    GW->>GW: 4. Cache Token (sync.RWMutex)
    GW->>Vertex: 5. POST :generateContent (Bearer ya29...)
    Vertex-->>GW: 6. Model Response / SSE Stream
```

### Supported Credential Formats

#### 1. GCP Service Account JSON Key (Recommended)
Supply your complete Google Cloud Service Account JSON key as the credential value (or point to an environment variable containing it):

```json
{
  "type": "service_account",
  "project_id": "production-data-platform",
  "private_key_id": "b1a2c3d4e5f6...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "ai-gateway@production-data-platform.iam.gserviceaccount.com",
  "client_id": "109876543210987654321",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

GoRoute:
1. Parses either PKCS#8 or PKCS#1 RSA private keys.
2. Constructs a signed RFC 7515 RS256 JWT assertion with claims (`iss`, `scope`, `aud`, `exp`, `iat`).
3. Dispatches a grant type request (`urn:ietf:params:oauth:grant-type:jwt-bearer`) to `https://oauth2.googleapis.com/token`.
4. Caches the token with thread-safe `sync.RWMutex` locking and automatically refreshes it prior to expiry.

#### 2. Direct Bearer Token
If your workload already runs within Google Kubernetes Engine (GKE) with Workload Identity or Google Compute Engine with metadata tokens, pass the raw Bearer token directly (`ya29.c...`).

---

## Regional Configuration & Endpoints

Vertex AI is regionally distributed. By default, GoRoute routes to `us-central1`. You can customize the region and GCP project ID via configuration or environment variables:

| Setting | Configuration Field | Environment Variable | Default |
| :--- | :--- | :--- | :--- |
| **GCP Region** | Derived from `api_base` or env | `VERTEX_LOCATION` or `GCP_REGION` | `us-central1` |
| **GCP Project** | Extracted from SA JSON or env | `VERTEX_PROJECT_ID` or `GCP_PROJECT_ID` | SA `project_id` |
| **Base URL** | `model_params.api_base` | `VERTEX_BASE_URL` | `https://{region}-aiplatform.googleapis.com` |

Supported regional endpoints include `us-central1`, `us-east4`, `us-west1`, `europe-west1`, `europe-west4`, `asia-northeast1`, and more.

---

## Supported Models

| Model Name | Vertex AI Model Identifier | Modality | Max Context |
| :--- | :--- | :--- | :--- |
| **Gemini 2.5 Flash** | `gemini-2.5-flash` | Text, Code, Vision, Audio, Tools | 1,048,576 tokens |
| **Gemini 1.5 Pro** | `gemini-1.5-pro` | Text, Code, Vision, Audio, Reasoning | 2,097,152 tokens |
| **Gemini 1.5 Flash** | `gemini-1.5-flash` | Fast Multimodal, Vision, Audio | 1,048,576 tokens |
| **Gemini 1.5 Flash-8B**| `gemini-1.5-flash-8b` | High-frequency, cost-sensitive | 1,048,576 tokens |
| **Text Embedding 004**| `text-embedding-004` | Dense vector embeddings (768d) | 2,048 tokens |

---

## Gateway Configuration

Add your Vertex AI deployments to `configs/config.yaml`:

```yaml
model_list:
  # Gemini 2.5 Flash on Vertex AI (us-central1)
  - model_name: vertex-gemini-flash
    model_params:
      model: vertex/gemini-2.5-flash
      api_key: os.environ/GCP_VERTEX_SA_KEY
      # Optional explicit base URL override:
      # api_base: "https://us-central1-aiplatform.googleapis.com"

  # Gemini 1.5 Pro on Vertex AI (europe-west4)
  - model_name: vertex-gemini-pro-eu
    model_params:
      model: vertex/gemini-1.5-pro
      api_key: os.environ/GCP_VERTEX_SA_KEY
      api_base: "https://europe-west4-aiplatform.googleapis.com"

  # Vertex AI Text Embeddings
  - model_name: vertex-embed
    model_params:
      model: vertex/text-embedding-004
      api_key: os.environ/GCP_VERTEX_SA_KEY
```

Set the Service Account JSON in your environment:

```bash
export GCP_VERTEX_SA_KEY=$(cat /path/to/vertex-sa-key.json)
export VERTEX_LOCATION="us-central1"
export VERTEX_PROJECT_ID="production-data-platform"
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-gemini-flash",
    "messages": [
      {"role": "system", "content": "You are an enterprise GCP security consultant."},
      {"role": "user", "content": "How do VPC Service Controls mitigate data exfiltration in BigQuery?"}
    ],
    "temperature": 0.2,
    "max_tokens": 1000
  }'
```

### 2. Streaming Chat with Server-Sent Events

The Vertex AI adapter streams chunks using Vertex AI's `:streamGenerateContent?alt=sse` endpoint and translates candidate parts into standard OpenAI SSE chunks:

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-gemini-flash",
    "messages": [{"role": "user", "content": "Explain Kubernetes pod disruption budgets."}],
    "stream": true
  }'
```

### 3. Embeddings via Vertex AI

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-embed",
    "input": ["Enterprise governance and model routing with GoRoute."]
  }'
```

### 4. Go SDK Integration

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
				ModelName: "vertex-gemini",
				Model:     "vertex/gemini-2.5-flash",
				APIKey:    "os.environ/GCP_VERTEX_SA_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway initialization failed: %v", err)
	}
	defer gw.Close()

	reply, err := gw.Chat(ctx, "vertex-gemini", "What are the three pillars of zero-trust architecture?")
	if err != nil {
		log.Fatalf("Vertex chat error: %v", err)
	}

	fmt.Println("Gemini Reply:\n", reply)
}
```

---

## Role Translation & Tool Calling

The Vertex AI adapter handles all dialect translations between OpenAI's message format and Google's Content schema:

- **System Messages**: OpenAI `role: "system"` or `role: "developer"` is extracted and sent as Vertex's top-level `systemInstruction` with `role: "user"`.
- **Assistant Messages**: OpenAI `role: "assistant"` maps to Vertex `role: "model"`.
- **Tool Invocations**: OpenAI tool calls map to `functionCall` objects; tool return values map to `role: "function"` with `functionResponse`.
- **Structured Outputs**: Specifying `response_format: {"type": "json_object"}` sets `responseMimeType: "application/json"` in the Vertex generation config.

> [!TIP]
> Ensure the Service Account has the **Vertex AI User** (`roles/aiplatform.user`) IAM role on your GCP project. If you are using custom regional endpoints, also ensure network egress allows outbound connections to `*-aiplatform.googleapis.com:443`.

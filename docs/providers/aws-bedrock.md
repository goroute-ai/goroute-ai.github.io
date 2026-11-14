---
title: AWS Bedrock
sidebar_position: 5
description: Native AWS Bedrock adapter with SigV4 signing, IAM auth, and Converse API.
---

# AWS Bedrock

GoRoute provides a native adapter for Amazon Web Services (AWS) Bedrock (`internal/adapter/bedrock/`), enabling unified access to foundation models through AWS's runtime APIs. Model families, IDs, and regional availability change; consult AWS's current catalog and the representative-ID guidance below.

Rather than relying on legacy invocation endpoints, GoRoute leverages the AWS Bedrock **Converse API** (`/model/{model}/converse` and `/model/{model}/converse-stream`). This guarantees uniform multi-turn message structures, standardized tool use schemas, native system prompt injection, and binary AWS EventStream chunk decoding.

---

## Architecture & Authentication

AWS Bedrock requires cryptographic request signing via **AWS Signature Version 4 (SigV4)**. Every HTTP request dispatched to the Bedrock runtime includes canonical header hashes, HMAC-SHA256 signatures, and timestamps.

```mermaid
flowchart LR
    Client["Client / SDK"] -->|Standard OpenAI Request| GW["GoRoute AI Gateway"]
    GW --> SigV4["AWS SigV4 Signer\n(internal/adapter/bedrock/sigv4.go)"]
    SigV4 -->|HMAC-SHA256 Auth\nBedrock Converse API| Bedrock["AWS Bedrock Runtime\n(bedrock-runtime.{region}.amazonaws.com)"]
    Bedrock -->|Binary EventStream| GW
    GW -->|Standard OpenAI SSE| Client
```

### Authentication Strategies

GoRoute supports three flexible authentication methods for AWS Bedrock credentials:

#### 1. Structured JSON Credential (Recommended)
Store the full IAM configuration within a single encrypted credential string or environment variable:

```json
{
  "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",
  "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "aws_region": "us-east-1",
  "aws_session_token": "AQoDYXdzEJr1...EXAMPLE"
}
```

> [!NOTE]
> `aws_session_token` is optional and only required when authenticating with temporary credentials from AWS STS (e.g., cross-account IAM role assumption).

#### 2. Colon-Delimited Credential
Pass access keys using the standard colon-separated format:
- `access_key_id:secret_access_key`
- `access_key_id:secret_access_key:region`
- `access_key_id:secret_access_key:region:session_token`

#### 3. Ambient Environment Variables
If only the Access Key ID is supplied in the credential, GoRoute falls back to ambient AWS environment variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (defaults to `us-east-1` if unset)
- `AWS_SESSION_TOKEN` (optional)

---

## Representative model IDs

This table is illustrative and may lag behind AWS releases. See [AWS Bedrock's current supported model list](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html) for provider-side IDs, then check [`GET /v1/models`](/docs/api-reference/gateway-api#4-model-catalogue-inventory-get-v1models) to confirm which models are exposed to your gateway key. AWS account access, region, gateway catalog state, and model policies affect availability.

| Foundation Family | Example Bedrock Model ID |
| :--- | :--- |
| **Claude Haiku 5.5** | `anthropic.claude-haiku-5-5` |
| **Claude Sonnet 5.5** | `anthropic.claude-sonnet-5-5` |
| **Claude Opus 5.5** | `anthropic.claude-opus-5-5` |
| **Other available model families** | See AWS's live model catalog for current IDs, regions, modalities, and endpoint support. |

> [!IMPORTANT]
> Make sure your AWS Account has requested and been granted model access in the AWS Bedrock Console for the specific region you target (e.g., `us-east-1` or `us-west-2`).

---

## Gateway Configuration

Add your Bedrock deployments to `configs/config.yaml`:

```yaml
model_list:
  # Claude Sonnet 5.5 on AWS Bedrock; confirm region and account access
  - model_name: bedrock-claude
    model_params:
      model: bedrock/anthropic.claude-sonnet-5-5
      api_key: os.environ/AWS_BEDROCK_JSON_CREDENTIALS
      # Alternatively, specify custom endpoint or VPC endpoint:
      # api_base: "https://vpce-0123456789abcdef0.bedrock-runtime.us-east-1.vpce.amazonaws.com"

  # Replace this placeholder with an available Bedrock model ID
  - model_name: bedrock-llama
    model_params:
      model: bedrock/<model-id-from-bedrock-catalog>
      api_key: os.environ/AWS_BEDROCK_KEY_PAIR # e.g. "AKIA...:SECRET..."

  # Replace this placeholder with an available Bedrock embedding model ID
  - model_name: bedrock-titan-embed
    model_params:
      model: bedrock/<embedding-model-id-from-bedrock-catalog>
      api_key: os.environ/AWS_BEDROCK_JSON_CREDENTIALS
```

### Environment Configuration

Export the credentials in your environment:

```bash
# JSON Credential option
export AWS_BEDROCK_JSON_CREDENTIALS='{"aws_access_key_id":"AKIA...","aws_secret_access_key":"...","aws_region":"us-east-1"}'

# Or standard AWS environment variables
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bedrock-claude",
    "messages": [
      {"role": "system", "content": "You are a cloud architecture assistant."},
      {"role": "user", "content": "Explain AWS VPC peering vs Transit Gateway in 3 bullet points."}
    ],
    "temperature": 0.2,
    "max_tokens": 500
  }'
```

### 2. Streaming with EventStream Decoding

Bedrock delivers streaming tokens over a binary AWS EventStream protocol. GoRoute automatically parses binary EventStream frames, handles exception blocks, and maps `contentBlockDelta` events into standard OpenAI Server-Sent Events (SSE):

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bedrock-claude",
    "messages": [{"role": "user", "content": "Write a Go function to verify an AWS SigV4 signature."}],
    "stream": true
  }'
```

```text
data: {"id":"bedrock-1731336492","object":"chat.completion.chunk","created":1731336492,"model":"anthropic.claude-sonnet-5-5","choices":[{"index":0,"delta":{"content":"package"},"finish_reason":null}]}
...
data: {"id":"bedrock-1731336492","object":"chat.completion.chunk","created":1731336492,"model":"anthropic.claude-sonnet-5-5","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
data: [DONE]
```

### 3. Embeddings via Amazon Bedrock

Embedding models available to your AWS account can be invoked through the unified `/v1/embeddings` endpoint. Use an ID from the current Bedrock catalog and gateway inventory:

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bedrock-titan-embed",
    "input": ["Enterprise Retrieval-Augmented Generation at scale."]
  }'
```

### 4. Calling Bedrock via the Go SDK

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
				ModelName: "bedrock-claude",
				Model:     "bedrock/anthropic.claude-sonnet-5-5",
				APIKey:    "os.environ/AWS_BEDROCK_JSON_CREDENTIALS",
			},
		),
	)
	if err != nil {
		log.Fatalf("Failed to initialize gateway: %v", err)
	}
	defer gw.Close()

	resp, err := gw.Chat(ctx, "bedrock-claude", "List three benefits of running LLMs in your own VPC.")
	if err != nil {
		log.Fatalf("Chat error: %v", err)
	}

	fmt.Println("Response:\n", resp)
}
```

---

## Tool Calling & Structured Outputs

The Bedrock adapter maps OpenAI function tool specifications directly to Bedrock Converse tool specifications:

```json
{
  "toolConfig": {
    "tools": [
      {
        "toolSpec": {
          "name": "lookup_customer",
          "description": "Retrieve customer subscription data",
          "inputSchema": {
            "json": {
              "type": "object",
              "properties": {
                "customer_id": {"type": "string"}
              },
              "required": ["customer_id"]
            }
          }
        }
      }
    ]
  }
}
```

When the upstream model initiates a tool call, GoRoute converts Bedrock's `toolUse` block into an OpenAI-compatible tool call with an ID and JSON string arguments.

> [!TIP]
> When integrating AWS Bedrock with VPC endpoints (`com.amazonaws.{region}.bedrock-runtime`), specify the private endpoint in `model_params.api_base`. GoRoute's SSRF policy validates the custom URL against allowed private CIDRs.

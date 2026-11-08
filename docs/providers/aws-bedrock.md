---
title: AWS Bedrock
sidebar_position: 5
description: Native AWS Bedrock adapter with SigV4 signing, IAM auth, and Converse API.
---

# AWS Bedrock

GoRoute provides a native high-performance adapter for Amazon Web Services (AWS) Bedrock (`internal/adapter/bedrock/`), enabling unified access to leading foundation models—including Anthropic Claude 3.5 Sonnet, Amazon Titan, Amazon Nova, and Meta Llama 3—over AWS's global infrastructure.

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

## Supported Models

| Foundation Family | Bedrock Model ID | Modality | Max Output |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude 3.5 Sonnet v2** | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Chat, Tools, Vision | 8,192 tokens |
| **Anthropic Claude 3.5 Haiku** | `anthropic.claude-3-5-haiku-20241022-v1:0` | Chat, Tools, Vision | 8,192 tokens |
| **Anthropic Claude 3 Opus** | `anthropic.claude-3-opus-20240229-v1:0` | Chat, Tools, Vision | 4,096 tokens |
| **Meta Llama 3.3 70B Instruct** | `meta.llama3-3-70b-instruct-v1:0` | Chat, Tools | 2,048 tokens |
| **Meta Llama 3.1 405B Instruct** | `meta.llama3-1-405b-instruct-v1:0` | Chat, Tools | 4,096 tokens |
| **Amazon Nova Pro** | `amazon.nova-pro-v1:0` | Chat, Tools, Multimodal | 5,000 tokens |
| **Amazon Nova Lite** | `amazon.nova-lite-v1:0` | Chat, Tools, Multimodal | 5,000 tokens |
| **Amazon Titan Text G1 - Express** | `amazon.titan-text-express-v1` | Text, Chat | 8,192 tokens |
| **Amazon Titan Embeddings G1 - Text** | `amazon.titan-embed-text-v1` | Embeddings (1536d) | N/A |
| **Amazon Titan Text Embeddings V2** | `amazon.titan-embed-text-v2:0` | Embeddings (1024d/512d/256d) | N/A |

> [!IMPORTANT]
> Make sure your AWS Account has requested and been granted model access in the AWS Bedrock Console for the specific region you target (e.g., `us-east-1` or `us-west-2`).

---

## Gateway Configuration

Add your Bedrock deployments to `configs/config.yaml`:

```yaml
model_list:
  # Anthropic Claude 3.5 Sonnet on AWS Bedrock
  - model_name: bedrock-claude
    model_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      api_key: os.environ/AWS_BEDROCK_JSON_CREDENTIALS
      # Alternatively, specify custom endpoint or VPC endpoint:
      # api_base: "https://vpce-0123456789abcdef0.bedrock-runtime.us-east-1.vpce.amazonaws.com"

  # Meta Llama 3.3 70B on AWS Bedrock
  - model_name: bedrock-llama
    model_params:
      model: bedrock/meta.llama3-3-70b-instruct-v1:0
      api_key: os.environ/AWS_BEDROCK_KEY_PAIR # e.g. "AKIA...:SECRET..."

  # Amazon Titan Embeddings
  - model_name: bedrock-titan-embed
    model_params:
      model: bedrock/amazon.titan-embed-text-v2:0
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
data: {"id":"bedrock-1731336492","object":"chat.completion.chunk","created":1731336492,"model":"anthropic.claude-3-5-sonnet-20241022-v2:0","choices":[{"index":0,"delta":{"content":"package"},"finish_reason":null}]}
...
data: {"id":"bedrock-1731336492","object":"chat.completion.chunk","created":1731336492,"model":"anthropic.claude-3-5-sonnet-20241022-v2:0","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
data: [DONE]
```

### 3. Embeddings via Amazon Titan

Amazon Titan Text Embeddings can be invoked through the unified `/v1/embeddings` endpoint:

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
				Model:     "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
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

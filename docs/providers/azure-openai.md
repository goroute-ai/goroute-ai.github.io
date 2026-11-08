---
title: Azure OpenAI Service
sidebar_position: 7
description: Native Azure OpenAI Service adapter with API key, Entra ID token auth, custom deployment mapping, and version pinning.
---

# Azure OpenAI Service

GoRoute provides comprehensive support for Microsoft **Azure OpenAI Service** through its dedicated Azure adapter strategy (`internal/adapter/azure/`). Organizations with dedicated Azure enterprise commitments, compliance boundaries, and private network endpoints can integrate Azure OpenAI models seamlessly into the GoRoute routing topology.

---

## Architecture & Endpoint Modes

Azure OpenAI Service supports two distinct routing architectures. GoRoute automatically inspects your endpoint configuration to select the optimal strategy:

```mermaid
flowchart TD
    Client["Client / Application"] -->|Standard OpenAI POST /v1/chat/completions| GW["GoRoute AI Gateway"]
    GW --> ModeCheck{"Check Base URL & Headers"}
    ModeCheck -->|BaseURL ends with /openai/v1 or /v1| StandardV1["Modern Standard v1 Mode\n{base_url}/openai/v1/chat/completions"]
    ModeCheck -->|Legacy deployment path| Legacy["Legacy Deployment Mode\n{base_url}/openai/deployments/{azure_deployment_name}/chat/completions?api-version={api_version}"]
    StandardV1 --> Azure["Azure OpenAI Resource Endpoint"]
    Legacy --> Azure
```

### 1. Modern Standard v1 Mode (`AzureEndpointModeStandardV1`)
Used when `api_base` ends in `/openai/v1` or `/v1`. This mode matches the standard OpenAI API layout while maintaining Azure authentication:
```text
https://my-resource.openai.azure.com/openai/v1/chat/completions
https://my-resource.openai.azure.com/openai/v1/embeddings
https://my-resource.openai.azure.com/openai/v1/models
```

### 2. Legacy Deployment Mode (`AzureEndpointModeLegacyDeployment`)
Used when targeting specific Azure deployment names and pinned API versions:
```text
https://my-resource.openai.azure.com/openai/deployments/{azure_deployment_name}/chat/completions?api-version=2024-08-01-preview
```

---

## Authentication Strategies

GoRoute's `AzureAuthStrategy` (`internal/adapter/azure/strategies.go`) supports both primary authentication schemes:

### 1. Azure API Key Auth
Pass your standard 32-character Azure resource API key. GoRoute injects the required `api-key` header:
```http
api-key: 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
```

### 2. Microsoft Entra ID (Azure AD) OAuth2 Token Auth
For zero-trust environments where shared API keys are prohibited, supply a Microsoft Entra ID Bearer token (prefixed with `Bearer `). GoRoute automatically detects the prefix and sets the standard Authorization header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...
```

> [!TIP]
> You can acquire Entra ID tokens via Azure Managed Identity, Azure CLI (`az account get-access-token --resource https://cognitiveservices.azure.com`), or your enterprise token broker.

---

## Deployment Parameters & Version Pinning

In Azure OpenAI, models are accessed via customized **Deployment Names** rather than canonical model IDs. GoRoute maps these parameters cleanly:

| Parameter | YAML Configuration | Description | Example |
| :--- | :--- | :--- | :--- |
| **Endpoint Base** | `api_base` | The root HTTPS endpoint of your Azure OpenAI resource | `https://my-enterprise.openai.azure.com` |
| **Deployment Name** | `azure_deployment_name` | The custom name chosen during deployment in Azure AI Foundry | `gpt-4o-prod-eastus` |
| **API Version** | `api_version` | The pinned Azure REST API version | `2024-08-01-preview` or `2024-10-21` |
| **Endpoint Mode** | `headers.azure_endpoint_mode` | Optional override: `"v1"` or `"legacy_deployment"` | `legacy_deployment` |

GoRoute also automatically handles Azure parameter translation:
- Translates legacy `max_tokens` to `max_completion_tokens` when required.
- Preserves all custom enterprise headers while filtering out control directives (`api-version`, `azure_deployment_name`).

---

## Gateway Configuration

Configure Azure OpenAI deployments in `configs/config.yaml`:

```yaml
model_list:
  # Primary: Production Azure OpenAI GPT-4o
  - model_name: enterprise-gpt4o
    routing_strategy: least-busy
    fallbacks: ["azure-gpt4o-dr", "openai-direct-fallback"]
    model_params:
      model: azure/gpt-4o
      api_key: os.environ/AZURE_OPENAI_API_KEY
      api_base: "https://enterprise-eastus.openai.azure.com"
      azure_deployment_name: "gpt-4o-prod"
      api_version: "2024-08-01-preview"
      headers:
        X-Enterprise-Cost-Center: "CC-90210"

  # Disaster Recovery: Secondary Azure Region (West US 3)
  - model_name: azure-gpt4o-dr
    model_params:
      model: azure/gpt-4o
      api_key: os.environ/AZURE_OPENAI_WESTUS_KEY
      api_base: "https://enterprise-westus3.openai.azure.com"
      azure_deployment_name: "gpt-4o-westus-backup"
      api_version: "2024-08-01-preview"

  # Entra ID Authenticated Deployment
  - model_name: azure-entraid-chat
    model_params:
      model: azure/gpt-4o-mini
      api_key: os.environ/AZURE_ENTRA_BEARER_TOKEN # "Bearer eyJhbGci..."
      api_base: "https://enterprise-gov.openai.azure.com"
      azure_deployment_name: "gpt-4o-mini-secure"
      api_version: "2024-10-21"

  # Azure Embeddings
  - model_name: azure-embeddings
    model_params:
      model: azure/text-embedding-3-large
      api_key: os.environ/AZURE_OPENAI_API_KEY
      api_base: "https://enterprise-eastus.openai.azure.com"
      azure_deployment_name: "text-embed-3-large"
      api_version: "2024-08-01-preview"
```

---

## Usage Examples

### 1. Chat Completion via cURL

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "enterprise-gpt4o",
    "messages": [
      {"role": "system", "content": "You are a corporate financial analyst."},
      {"role": "user", "content": "Summarize Q3 operating margin trends."}
    ],
    "temperature": 0.3,
    "max_tokens": 600
  }'
```

### 2. Streaming Responses

GoRoute parses Azure's Server-Sent Events stream, ensuring identical response shape to direct OpenAI endpoints:

```bash
curl -N -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "enterprise-gpt4o",
    "messages": [{"role": "user", "content": "Draft an executive summary for a cloud migration RFP."}],
    "stream": true
  }'
```

### 3. Embeddings via Azure OpenAI

```bash
curl -X POST http://localhost:8080/v1/embeddings \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-embeddings",
    "input": ["Azure Private Link endpoint connection validation."]
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
				ModelName: "azure-chat",
				Model:     "azure/gpt-4o",
				APIKey:    "os.environ/AZURE_OPENAI_API_KEY",
				APIBase:   "https://enterprise-eastus.openai.azure.com",
			},
		),
	)
	if err != nil {
		log.Fatalf("Gateway init failed: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "azure-chat", "What are the core components of Azure Landing Zones?")
	if err != nil {
		log.Fatalf("Azure chat failed: %v", err)
	}

	fmt.Println("Azure OpenAI Response:\n", response)
}
```

> [!IMPORTANT]
> If your Azure OpenAI Service is locked down via **Azure Private Endpoints (Private Link)**, configure GoRoute's network egress in `configs/config.yaml` to allow private CIDRs (`security.network.outbound_ssrf.allow_private_networks: true` and specify `allowed_private_cidrs: ["10.0.0.0/16"]`).

---
title: Custom In-House Providers
sidebar_position: 12
description: Register and configure custom in-house OpenAI-compatible deployments in configs/config.yaml.
---

# Custom In-House Providers

GoRoute enables enterprises to onboard custom in-house inference clusters, private endpoints, and self-hosted model engines (such as **vLLM**, **SGLang**, **TensorRT-LLM**, **TGI**, and internal gateways) without writing custom Go code or recompiling the binary.

Custom providers are registered declaratively in `configs/config.yaml` through the certified OpenAI-compatible dialect subsystem (`internal/adapter/openaicompat/registry.go:RegisterCustom`).

---

## Declarative Provider Registration (`providers.custom_openai_compatible`)

To register a custom provider, declare it under the `providers.custom_openai_compatible` section of your configuration file:

```yaml
providers:
  custom_openai_compatible:
    # 1. In-House vLLM GPU Cluster
    - id: "internal-vllm"
      display_name: "Internal vLLM H100 Cluster"
      base_url: "https://vllm.internal.corp.net/v1"
      supports_streaming: "true"
      supports_tools: "true"
      supports_structured_outputs: "true"
      supports_list_models: true
      default_headers:
        X-Gateway-Identity: "goroute-prod"
        X-Internal-Tenant: "engineering"

    # 2. On-Premises TensorRT-LLM Engine
    - id: "tensorrt-cluster"
      display_name: "On-Premises TensorRT-LLM"
      base_url: "http://10.200.4.15:8000/v1"
      supports_streaming: "true"
      supports_tools: "false"
      supports_structured_outputs: "true"
      supports_list_models: false
      default_headers:
        X-Acceleration-Engine: "TensorRT-LLM"
```

### Configuration Attributes Reference

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Yes** | Unique identifier (must match `^[a-z0-9_\-]+$`). Used as the model prefix (e.g. `internal-vllm/llama-3.3-70b`). |
| `display_name` | `string` | No | Human-readable description displayed in the Operator Web UI. |
| `base_url` | `string` | **Yes** | Root HTTP/HTTPS endpoint of the inference server (including `/v1`). |
| `supports_streaming` | `string` / `bool` | No | Whether the upstream supports Server-Sent Events (SSE). Defaults to `true`. |
| `supports_tools` | `string` / `bool` | No | Whether the upstream supports function and tool calling. |
| `supports_structured_outputs` | `string` / `bool` | No | Whether the upstream supports `response_format: {type: "json_object"}`. |
| `supports_list_models` | `bool` | No | Whether GoRoute can query `GET /models` for auto-discovery. |
| `default_headers` | `map[string]string` | No | Custom HTTP headers injected into every request sent to this provider. |

---

## Registration Lifecycle & SSRF Validation

When GoRoute parses custom provider entries during startup, it passes each profile through the `ProfileRegistry.RegisterCustom` validator:

```mermaid
flowchart TD
    Config["configs/config.yaml\nproviders.custom_openai_compatible"] --> Parser["Configuration Parser"]
    Parser --> IDCheck{"Validate ID\n^[a-z0-9_\\-]+$"}
    IDCheck -->|Invalid| Err1["Fatal: Invalid ID"]
    IDCheck -->|Valid| URLCheck{"Validate Base URL & Scheme"}
    URLCheck -->|Not HTTP/HTTPS| Err2["Fatal: Invalid Scheme"]
    URLCheck -->|Valid| SSRF{"SSRF Policy Verification\n(r.ssrfPolicy.ValidateURL)"}
    SSRF -->|Private IP / Prohibited CIDR| Err3["Fatal: Rejected by Outbound SSRF Policy"]
    SSRF -->|Passed| Registry["Register into Dialect Profile Engine\n(New DialectProfile + Standard Strategies)"]
    Registry --> Ready["Ready for Model List & Invocations"]
```

### SSRF & Network Hardening for Internal Endpoints

Because custom in-house clusters often reside on private corporate subnets (e.g., `10.0.0.0/8`, `172.16.0.0/12`), you must update GoRoute's outbound network policy:

```yaml
security:
  network:
    outbound_ssrf:
      allow_private_networks: true
      allow_insecure_http: true # Required if internal cluster uses http:// instead of https://
      allowed_schemes: ["http", "https"]
      allowed_private_cidrs:
        - "10.0.0.0/8"
        - "172.16.0.0/12"
      blocked_ips:
        - "169.254.169.254"     # Always block AWS/GCP cloud metadata IP
        - "fd00:ec2::254"
```

> [!CAUTION]
> Never disable cloud metadata blocking (`169.254.169.254`). GoRoute protects against SSRF vulnerabilities that could leak host credentials or cloud IAM tokens to unauthorized callers.

---

## Configuring Models for Custom Providers

Once registered, models from your custom provider can be referenced directly in `model_list`:

```yaml
model_list:
  # Using the registered custom provider ID as a prefix
  - model_name: inhouse-llama
    routing_strategy: weighted-shuffle
    fallbacks: ["cloud-fallback"]
    model_params:
      model: internal-vllm/meta-llama/Llama-3.3-70B-Instruct
      api_key: os.environ/INTERNAL_VLLM_API_KEY # Optional if cluster requires auth
      weight: 100

  # Direct ad-hoc override via api_base (without registering a custom provider)
  - model_name: adhoc-sglang
    model_params:
      model: openai/meta-llama/Llama-3.1-8B-Instruct
      api_base: "http://sglang-service.internal:30000/v1"
      api_key: "dummy-key"

  # Cloud backup fallback
  - model_name: cloud-fallback
    model_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
```

---

## Usage Examples

### 1. Invocations via cURL

Send standard OpenAI requests referencing your custom model alias:

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "inhouse-llama",
    "messages": [
      {"role": "system", "content": "You are a private corporate coding assistant."},
      {"role": "user", "content": "Explain our internal microservice authentication flow."}
    ],
    "temperature": 0.2
  }'
```

### 2. Direct Dynamic Prefix Invocations

If callers have permissions to direct-route, they can prefix the registered provider ID dynamically:

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer your-gateway-virtual-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "internal-vllm/meta-llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Perform sanity check."}]
  }'
```

### 3. Calling Custom In-House Providers via the Go SDK

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
				ModelName: "inhouse-llama",
				Model:     "openai/meta-llama/Llama-3.3-70B-Instruct",
				APIBase:   "https://vllm.internal.corp.net/v1",
				APIKey:    "os.environ/INTERNAL_VLLM_API_KEY",
			},
		),
	)
	if err != nil {
		log.Fatalf("Failed to initialize gateway: %v", err)
	}
	defer gw.Close()

	response, err := gw.Chat(ctx, "inhouse-llama", "Draft an internal architectural decision record (ADR).")
	if err != nil {
		log.Fatalf("Custom model chat error: %v", err)
	}

	fmt.Println("Custom Model Response:\n", response)
}
```

> [!TIP]
> If your internal model engine serves streaming responses, GoRoute translates the stream into standard SSE without buffering, maintaining real-time Time-to-First-Token (TTFT) metrics for internal applications.

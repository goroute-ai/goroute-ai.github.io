---
title: Function & Tool Calling
sidebar_position: 15
description: Standardized tool calling across OpenAI, Anthropic, and Gemini with strict schema enforcement and Model Context Protocol (MCP) alignment.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# HTTP Tool Calling & MCP Alignment

GoRoute AI Gateway standardizes OpenAI-format tool calling across all supported providers. It automatically translates tool definitions and execution arguments between OpenAI, Anthropic Claude, and Google Gemini, while seamlessly integrating with the **Model Context Protocol (MCP)**.

---

## Tool Definition Schema

Pass tool definitions in the `tools` array using standard JSON Schema definitions:

```json
{
  "model": "fast",
  "messages": [
    {"role": "user", "content": "What is the stock price of AAPL and MSFT?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_stock_quote",
        "description": "Returns current real-time stock price and trading volume.",
        "strict": true,
        "parameters": {
          "type": "object",
          "properties": {
            "ticker": {
              "type": "string",
              "description": "Stock ticker symbol (e.g. AAPL, MSFT)"
            },
            "currency": {
              "type": "string",
              "enum": ["USD", "EUR", "GBP"],
              "description": "Currency for quotation"
            }
          },
          "required": ["ticker", "currency"],
          "additionalProperties": false
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

---

## Strict Parameter Schemas (`strict: true`)

When `strict: true` is configured:
1. **Schema Constraints**: The schema must explicitly define `"additionalProperties": false` and include every property in the `"required"` array.
2. **Deterministic Output**: Downstream providers that support Structured Outputs (OpenAI, Gemini) enforce a constrained decoding grammar, guaranteeing 100% schema conformance.
3. **Gateway Pre-Flight Check**: GoRoute inspects tool parameter schemas during pre-flight admission, returning an immediate `400 Bad Request` if schema syntax is invalid.

---

## Model Context Protocol (MCP) Alignment

GoRoute natively aligns HTTP tool definitions with the Model Context Protocol:

- **Namespace Prefixing**: Tools registered on connected MCP servers can be invoked directly over standard HTTP chat completions by referencing the tool name or using the scoped format:
  ```
  mcp__<server_slug>__<tool_name>
  ```
- **Autonomous Execution**: If a tool call matches a registered server-side MCP tool, the gateway's [Autonomous Tool Loop](/docs/data-plane/autonomous-tool-loop) can intercept and execute it server-side, eliminating client roundtrips.
- **Bi-Directional Translation**: MCP tool schemas (`inputSchema`) map cleanly into OpenAPI parameters without manual bridging.

---

## Cross-Provider Translation Matrix

| Gateway Schema (OpenAI Format) | Anthropic Claude Wire Format | Google Gemini Wire Format |
| :--- | :--- | :--- |
| `type: "function"` | Inferred function | `functionDeclarations` |
| `function.parameters` | `input_schema` | `parameters` |
| `tool_calls[].id` | `tool_use.id` | Inferred function call call ID |
| `role: "tool"` | `role: "user"` with `type: "tool_result"` | `role: "user"` with `functionResponse` |

> [!NOTE]
> When models emit parallel tool calls, GoRoute automatically consolidates consecutive `role: "tool"` turns into a single alternating turn when routing to Anthropic or Gemini.

---

## Code Examples

<Tabs>
<TabItem value="curl" label="cURL" default>

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fast",
    "messages": [
      {"role": "user", "content": "What is the weather in Tokyo?"}
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_weather",
          "description": "Get the current weather for a given city",
          "strict": true,
          "parameters": {
            "type": "object",
            "properties": {
              "city": {"type": "string"},
              "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city", "unit"],
            "additionalProperties": false
          }
        }
      }
    ],
    "tool_choice": "auto"
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

tools = [
    {
        "type": "function",
        "function": {
            "name": "calculate_tax",
            "description": "Calculates sales tax based on state code.",
            "strict": True,
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "state": {"type": "string"}
                },
                "required": ["amount", "state"],
                "additionalProperties": False
            }
        }
    }
]

response = client.chat.completions.create(
    model="fast",
    messages=[{"role": "user", "content": "Calculate tax for $250 in California."}],
    tools=tools,
    tool_choice="auto"
)

choice = response.choices[0]
if choice.message.tool_calls:
    for tc in choice.message.tool_calls:
        print(f"Tool to invoke: {tc.function.name}")
        print(f"Arguments: {tc.function.arguments}")
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

func main() {
	requestBody := map[string]interface{}{
		"model": "fast",
		"messages": []map[string]string{
			{"role": "user", "content": "Look up database metrics for cluster prod-db-1."},
		},
		"tools": []map[string]interface{}{
			{
				"type": "function",
				"function": map[string]interface{}{
					"name":        "mcp__metrics__get_cluster_load",
					"description": "Retrieves CPU and connection metrics from MCP server",
					"parameters": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"cluster_id": map[string]string{"type": "string"},
						},
						"required": []string{"cluster_id"},
					},
				},
			},
		},
	}

	payload, _ := json.Marshal(requestBody)
	req, _ := http.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"http://localhost:8080/v1/chat/completions",
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
	fmt.Printf("Status: %d | Body:\n%s\n", resp.StatusCode, string(body))
}
```

</TabItem>
</Tabs>

---

## Related Documentation

- [Server-Side Autonomous Tool Loop](/docs/data-plane/autonomous-tool-loop)
- [MCP Hub & REST Bridge](/docs/protocols/mcp-hub-and-rest)
- [Go SDK MCP & A2A](/docs/sdk/mcp-and-a2a)

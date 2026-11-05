---
title: Structured JSON
sidebar_position: 6
---

# Guaranteed JSON Mode Structured Outputs

In this guide, you will configure system extraction schemas to guarantee that the model outputs strictly valid, machine-parsable JSON payloads.

---

## Runnable Go Code

```go title="examples/json_mode_structured_output/main.go"
package main

import (
	"context"
	"encoding/json"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

type WeatherOutput struct {
	City        string  `json:"city"`
	Temperature float64 `json:"temperature_c"`
	Condition   string  `json:"condition"`
}

func main() {
	ctx := context.Background()
	demoutil.Banner("Guaranteed JSON Mode Structured Outputs")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "json-chat",
				Model:     "openai/gpt-4o-mini",
				APIKey:    "os.environ/OPENAI_API_KEY",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Enforce valid JSON object output via system instructions
	res, err := gw.Chat(ctx, "json-chat", "Extract: Paris is currently 19.5C and sunny.",
		gateway.WithSystem("You are a structured data extractor. You MUST respond with ONLY a valid JSON object matching: {\"city\": string, \"temperature_c\": number, \"condition\": string}."),
	)
	if err != nil {
		demoutil.Fail("Request failed", err)
	}

	var parsed WeatherOutput
	_ = json.Unmarshal([]byte(res.Content), &parsed)

	demoutil.Info("Schema Validation", "JSON Object Validated")
	demoutil.Success("Structured Output", res.Content)
	demoutil.Done()
}
```

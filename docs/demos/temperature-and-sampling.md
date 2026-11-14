---
title: Temperature & Limits
sidebar_position: 5
description: Control model sampling and cap generated tokens with GoRoute Go SDK options for predictable output and bounded response costs.
---

# Temperature and Minimal Output Caps

Learn how to control model randomness and protect your budget with strict generation limits. Setting `WithTemperature(0.0)` guarantees deterministic outputs, while `WithMaxTokens(5)` prevents runaway output billing.

---

## Runnable Go Code

```go title="examples/temperature_and_sampling/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Temperature and Minimal Output Caps")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "sampling-chat",
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

	// Strict determinism: Temperature 0.0, MaxTokens capped to 5
	res, err := gw.Chat(ctx, "sampling-chat", "Pick a single letter.",
		gateway.WithTemperature(0.0),
		gateway.WithMaxTokens(5),
	)
	if err != nil {
		demoutil.Fail("Request failed", err)
	}

	demoutil.Info("Temperature", "0.0 (Deterministic)")
	demoutil.Info("Max Tokens Cap", "5")
	demoutil.Info("Tokens Consumed", fmt.Sprintf("%d", res.Usage.CompletionTokens))
	demoutil.Success("Deterministic Output", res.Content)
	demoutil.Done()
}
```

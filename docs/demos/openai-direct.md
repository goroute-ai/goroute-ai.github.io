---
title: OpenAI Direct
sidebar_position: 8
description: Connect the GoRoute Go SDK directly to OpenAI and send chat requests through its unified provider interface.
---

# OpenAI Direct Provider Integration

Learn how to connect directly to OpenAI endpoints using the verified low-cost `openai/gpt-4o-mini` tier (\$0.15/1M input tokens).

---

## Runnable Go Code

```go title="examples/openai_direct/main.go"
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("OpenAI Direct Provider Integration (Live Test Capable)")

	hasKey := os.Getenv("OPENAI_API_KEY") != ""
	if hasKey {
		demoutil.Info("Environment", "Using live OPENAI_API_KEY")
	} else {
		demoutil.Info("Environment", "No OPENAI_API_KEY found; running with zero-config mock")
	}

	// Uses verified lowest-cost model: openai/gpt-4o-mini ($0.15/1M input)
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "openai-mini",
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

	// Execute with minimal token cap (max 2 tokens) for sub-cent live testing
	res, err := gw.Chat(ctx, "openai-mini", "ping",
		gateway.WithMaxTokens(2),
	)
	if err != nil {
		demoutil.Fail("OpenAI request failed", err)
	}

	demoutil.Info("Provider", res.Provider)
	demoutil.Info("Model", res.Model)
	demoutil.Info("Cost (Micro-Dollars)", fmt.Sprintf("%d micros ($%.6f USD)", res.CostMicros, float64(res.CostMicros)/1e6))
	demoutil.Success("Response", res.Content)
	demoutil.Done()
}
```

---
title: Anthropic Direct
sidebar_position: 9
---

# Anthropic Claude Provider Integration

Connect to Anthropic Claude using the verified low-cost `anthropic/claude-haiku-4-5-20251001` model.

---

## Runnable Go Code

```go title="examples/anthropic_direct/main.go"
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
	demoutil.Banner("Anthropic Claude Provider Integration (Live Test Capable)")

	hasKey := os.Getenv("ANTHROPIC_API_KEY") != ""
	if hasKey {
		demoutil.Info("Environment", "Using live ANTHROPIC_API_KEY")
	} else {
		demoutil.Info("Environment", "No ANTHROPIC_API_KEY found; running with zero-config mock")
	}

	// Uses verified lowest-cost model: anthropic/claude-haiku-4-5-20251001 ($0.80/1M input)
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "claude-haiku",
				Model:     "anthropic/claude-haiku-4-5-20251001",
				APIKey:    "os.environ/ANTHROPIC_API_KEY",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Execute with minimal token cap (max 3 tokens)
	res, err := gw.Chat(ctx, "claude-haiku", "ping",
		gateway.WithMaxTokens(3),
	)
	if err != nil {
		demoutil.Fail("Anthropic request failed", err)
	}

	demoutil.Info("Provider", res.Provider)
	demoutil.Info("Model", res.Model)
	demoutil.Info("Cost (Micro-Dollars)", fmt.Sprintf("%d micros ($%.6f USD)", res.CostMicros, float64(res.CostMicros)/1e6))
	demoutil.Success("Response", res.Content)
	demoutil.Done()
}
```

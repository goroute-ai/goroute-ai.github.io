---
title: Google Gemini Direct
sidebar_position: 10
---

# Google Gemini Provider Integration

Connect directly to Google Gemini endpoints using the verified ultra-low-cost `gemini/gemini-2.5-flash-lite` tier (\$0.075/1M input tokens).

---

## Runnable Go Code

```go title="examples/gemini_direct/main.go"
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
	demoutil.Banner("Google Gemini Provider Integration (Live Test Capable)")

	hasKey := os.Getenv("GEMINI_API_KEY") != ""
	if hasKey {
		demoutil.Info("Environment", "Using live GEMINI_API_KEY")
	} else {
		demoutil.Info("Environment", "No GEMINI_API_KEY found; running with zero-config mock")
	}

	// Uses verified lowest-cost model: gemini/gemini-2.5-flash-lite ($0.075/1M input)
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "gemini-lite",
				Model:     "gemini/gemini-2.5-flash-lite",
				APIKey:    "os.environ/GEMINI_API_KEY",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Execute with minimal token cap (max 2 tokens)
	res, err := gw.Chat(ctx, "gemini-lite", "ping",
		gateway.WithMaxTokens(2),
	)
	if err != nil {
		demoutil.Fail("Gemini request failed", err)
	}

	demoutil.Info("Provider", res.Provider)
	demoutil.Info("Model", res.Model)
	demoutil.Info("Cost (Micro-Dollars)", fmt.Sprintf("%d micros ($%.6f USD)", res.CostMicros, float64(res.CostMicros)/1e6))
	demoutil.Success("Response", res.Content)
	demoutil.Done()
}
```

---
title: Unified Model Aliases
sidebar_position: 12
description: Configure a logical model alias in GoRoute so applications can switch upstream AI providers without changing their model request code.
---

# Decoupling Applications with Unified Model Aliases

In this guide, you will configure a logical model alias (`"production-primary"`). Calling applications request this alias without needing to know which upstream vendor is currently fulfilling the inference.

---

## Runnable Go Code

```go title="examples/unified_model_alias/main.go"
package main

import (
	"context"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Decoupling Applications with Unified Model Aliases")

	// Clients call "production-primary" without knowing if it's OpenAI, Gemini, or Claude
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "production-primary",
				Model:     "gemini/gemini-2.5-flash-lite", // Can be swapped to any provider with 0 client changes
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

	// Client requests logical alias "production-primary"
	res, err := gw.Chat(ctx, "production-primary", "What is an architectural abstraction layer?")
	if err != nil {
		demoutil.Fail("Request failed", err)
	}

	demoutil.Info("Logical Requested Model", "production-primary")
	demoutil.Info("Actual Upstream Provider", res.Provider)
	demoutil.Info("Actual Upstream Model", res.Model)
	demoutil.Success("Response", res.Content)
	demoutil.Done()
}
```

---
title: Round-Robin Balancer
sidebar_position: 18
---

# Stateless Round-Robin Load Balancing

In this guide, you will configure a multi-backend model cluster with `RoutingStrategy: "round-robin"` to distribute inference load evenly across multiple instances.

---

## Runnable Go Code

```go title="examples/round_robin_balancer/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Stateless Round-Robin Load Balancing")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName:       "balanced-cluster",
				Model:           "gemini/gemini-2.5-flash-lite",
				RoutingStrategy: "round-robin",
			},
			gateway.ModelEntry{
				ModelName:       "balanced-cluster",
				Model:           "openai/gpt-4o-mini",
				RoutingStrategy: "round-robin",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	demoutil.Info("Strategy", "Round-Robin across 2 backend instances")
	for i := 1; i <= 4; i++ {
		res, err := gw.Chat(ctx, "balanced-cluster", "ping", gateway.WithMaxTokens(1))
		if err != nil {
			demoutil.Fail("Request failed", err)
		}
		demoutil.Info(fmt.Sprintf("Request #%d", i), fmt.Sprintf("Handled by: %s (%s)", res.Model, res.Provider))
	}

	demoutil.Success("Load Distribution", "Evenly alternated across available backends")
	demoutil.Done()
}
```

---
title: Outage Fallbacks
sidebar_position: 17
description: Configure a GoRoute fallback target and run a Go example that sends requests to a backup model when the primary provider is unavailable.
---

# Upstream Outage Fallback & Failover Cascades

Learn how to configure fallback targets (`Fallbacks: []string{"backup-target"}`). When a primary provider experiences an outage (HTTP 503/500), GoRoute automatically rescues the request using the secondary target.

---

## Runnable Go Code

```go title="examples/failover_fallback_chain/main.go"
package main

import (
	"context"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Upstream Outage Fallback & Failover Cascades")

	// Primary model simulates 503 Service Unavailable, cascading to backup-model
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName:      "primary-failing",
				Model:          "openai/gpt-4o",
				Fallbacks:      []string{"backup-target"},
				SimulateStatus: 503, // Simulates an upstream outage
			},
			gateway.ModelEntry{
				ModelName: "backup-target",
				Model:     "gemini/gemini-2.5-flash-lite",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	demoutil.Info("Simulated Event", "Primary upstream returns HTTP 503 Service Unavailable")
	res, err := gw.Chat(ctx, "primary-failing", "Explain high availability.")
	if err != nil {
		demoutil.Fail("Failover failed", err)
	}

	demoutil.Info("Requested Model", "primary-failing")
	demoutil.Info("Resolved Model", res.Model)
	demoutil.Info("Fallback Activated", "true")
	demoutil.Success("Resilience Result", "Traffic automatically rescued by backup-target without client error")
	demoutil.Done()
}
```

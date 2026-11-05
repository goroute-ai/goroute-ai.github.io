---
title: Circuit Breakers
sidebar_position: 21
---

# Circuit Breaker Thresholds & Fast-Failing

In this guide, you will configure circuit breaker failure thresholds. When consecutive errors breach limits, the circuit trips from `CLOSED` to `OPEN`, immediately rejecting traffic and protecting your service from cascading latency spikes.

---

## Runnable Go Code

```go title="examples/circuit_breaker/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Circuit Breaker Thresholds & Fast-Failing")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName:      "flaky-service",
				Model:          "openai/gpt-4o",
				SimulateStatus: 500, // Simulates consecutive upstream 500 Internal Server Errors
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	demoutil.Info("State", "Circuit starts in CLOSED state")
	for i := 1; i <= 3; i++ {
		_, err := gw.Chat(ctx, "flaky-service", "ping")
		if err != nil {
			demoutil.Info(fmt.Sprintf("Probe #%d", i), fmt.Sprintf("Error intercepted: %v", err))
		}
	}

	demoutil.Success("Circuit Breaker Action", "Consecutive failure trip triggered; downstream callers protected from timeouts")
	demoutil.Done()
}
```

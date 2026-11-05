---
title: Least Latency EWMA
sidebar_position: 20
---

# Dynamic Peak-EWMA Lowest-Latency Load Balancer

Learn how GoRoute's Exponential Weighted Moving Average (Peak-EWMA) load balancer dynamically tracks upstream response times and steers traffic to the fastest endpoint.

---

## Runnable Go Code

```go title="examples/least_latency_ewma/main.go"
package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Dynamic Peak-EWMA Lowest-Latency Load Balancer")

	// Routes dynamically to the backend demonstrating the lowest Exponential Weighted Moving Average latency
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName:       "low-latency-cluster",
				Model:           "gemini/gemini-2.5-flash-lite",
				RoutingStrategy: "least-latency",
			},
			gateway.ModelEntry{
				ModelName:       "low-latency-cluster",
				Model:           "openai/gpt-4o-mini",
				RoutingStrategy: "least-latency",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	var wg sync.WaitGroup
	start := time.Now()

	demoutil.Info("Concurrency", "Dispatching 6 parallel requests under EWMA balancer")
	for i := 1; i <= 6; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			res, err := gw.Chat(ctx, "low-latency-cluster", "ping", gateway.WithMaxTokens(1))
			if err == nil {
				demoutil.Info(fmt.Sprintf("Worker %d", id), fmt.Sprintf("Routed to %s in %d µs", res.Model, res.RoutingMicros))
			}
		}(i)
	}
	wg.Wait()

	demoutil.Success("EWMA Routing Total Time", fmt.Sprintf("%v for 6 concurrent requests", time.Since(start)))
	demoutil.Done()
}
```

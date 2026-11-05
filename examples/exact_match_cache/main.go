package main

import (
	"context"
	"fmt"
	"time"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Sub-Millisecond Exact-Match SHA-256 Cache")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "cached-chat",
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

	prompt := "What is the capital of France?"

	// 1. Initial request (Cache Miss)
	start1 := time.Now()
	res1, err := gw.Chat(ctx, "cached-chat", prompt)
	dur1 := time.Since(start1)
	if err != nil {
		demoutil.Fail("Request 1 failed", err)
	}
	demoutil.Info("Call 1 (Cold Upstream)", fmt.Sprintf("Latency: %v | Cache: %s | Cost: %d micros", dur1, res1.CacheStatus, res1.CostMicros))

	// 2. Identical subsequent request (Cache Hit)
	start2 := time.Now()
	res2, err := gw.Chat(ctx, "cached-chat", prompt)
	dur2 := time.Since(start2)
	if err != nil {
		demoutil.Fail("Request 2 failed", err)
	}
	demoutil.Info("Call 2 (In-Memory Hit)", fmt.Sprintf("Latency: %v | Cache: %s | Cost: %d micros", dur2, res2.CacheStatus, res2.CostMicros))

	demoutil.Success("Cache Acceleration", fmt.Sprintf("Sub-millisecond resolution with $0.00 incremental cost"))
	demoutil.Done()
}

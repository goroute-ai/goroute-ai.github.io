package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Weighted Shuffle Traffic Splitting (Canary / Cost Steering)")

	// 80% traffic to Gemini Flash Lite (cost-effective), 20% to Claude Haiku
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName:       "canary-group",
				Model:           "gemini/gemini-2.5-flash-lite",
				Weight:          80,
				RoutingStrategy: "weighted-shuffle",
			},
			gateway.ModelEntry{
				ModelName:       "canary-group",
				Model:           "anthropic/claude-haiku-4-5-20251001",
				Weight:          20,
				RoutingStrategy: "weighted-shuffle",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	counts := make(map[string]int)
	for i := 1; i <= 10; i++ {
		res, err := gw.Chat(ctx, "canary-group", "ping", gateway.WithMaxTokens(1))
		if err != nil {
			demoutil.Fail("Request failed", err)
		}
		counts[res.Provider]++
	}

	demoutil.Info("Configured Weights", "gemini: 80%, anthropic: 20%")
	for prov, count := range counts {
		demoutil.Info(fmt.Sprintf("Traffic Handled by %s", prov), fmt.Sprintf("%d / 10 requests (%d%%)", count, count*10))
	}
	demoutil.Success("Canary Routing", "Traffic proportionally partitioned according to enterprise weights")
	demoutil.Done()
}

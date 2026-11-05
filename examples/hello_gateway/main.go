package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Hello Gateway (Minimal 20-Line In-Process Engine)")

	// 1. Initialize embedded gateway with one model entry
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "gpt-4o-mini",
				Model:     "openai/gpt-4o-mini",
				APIKey:    "os.environ/OPENAI_API_KEY",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(), // Transparent zero-config offline fallback
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// 2. Execute chat completion
	res, err := gw.Chat(ctx, "gpt-4o-mini", "Hello! What are you?")
	if err != nil {
		demoutil.Fail("Chat request failed", err)
	}

	demoutil.Info("Model", res.Model)
	demoutil.Info("Provider", res.Provider)
	demoutil.Info("Routing Latency (µs)", fmt.Sprintf("%d µs", res.RoutingMicros))
	demoutil.Info("Cost (Micro-Dollars)", fmt.Sprintf("%d micros ($%.6f USD)", res.CostMicros, float64(res.CostMicros)/1e6))
	demoutil.Success("Response", res.Content)
	demoutil.Done()
}

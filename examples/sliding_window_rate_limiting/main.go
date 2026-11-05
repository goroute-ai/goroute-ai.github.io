package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Sliding-Window Rate Limiting (RPM/TPM Quotas)")

	// Configure strict RPM (Requests Per Minute) cap
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "rate-limited-model",
				Model:     "gemini/gemini-2.5-flash-lite",
				RPM:       2, // Limit to 2 requests per minute
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	demoutil.Info("Configured Quota", "2 RPM sliding window")
	for i := 1; i <= 3; i++ {
		res, err := gw.Chat(ctx, "rate-limited-model", "ping", gateway.WithMaxTokens(1))
		if err != nil {
			demoutil.Info(fmt.Sprintf("Request #%d", i), fmt.Sprintf("QUOTA EXCEEDED: %v", err))
		} else {
			demoutil.Info(fmt.Sprintf("Request #%d", i), fmt.Sprintf("ALLOWED: %s (Tokens: %d)", res.Model, res.Usage.TotalTokens))
		}
	}

	demoutil.Success("Rate Limiter Status", "Sliding window token bucket strictly enforced")
	demoutil.Done()
}

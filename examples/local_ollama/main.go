package main

import (
	"context"
	"strings"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Local Offline LLM with Ollama Integration")

	// Connect to local Ollama server running on default port 11434
	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "local-llama",
				Model:     "ollama/llama3.2",
				APIBase:   "http://localhost:11434",
			},
		),
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	demoutil.Info("Provider", "Ollama (Local / On-Premises)")
	demoutil.Info("Model", "ollama/llama3.2")
	demoutil.Info("Endpoint", "http://localhost:11434")

	res, err := gw.Chat(ctx, "local-llama", "Hello from local inference!",
		gateway.WithMaxTokens(16),
	)
	if err != nil {
		if strings.Contains(err.Error(), "connection refused") || strings.Contains(err.Error(), "502") {
			demoutil.Info("Daemon Status", "No active Ollama daemon on :11434 (start with 'ollama serve')")
			demoutil.Success("Gateway Verification", "Local endpoint configured cleanly; ready when Ollama daemon starts")
			demoutil.Done()
			return
		}
		demoutil.Fail("Ollama request failed", err)
	}

	demoutil.Info("Cost", "$0.00 (Self-hosted on-premises)")
	demoutil.Success("Local Response", res.Content)
	demoutil.Done()
}

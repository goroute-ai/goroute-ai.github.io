package main

import (
	"context"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Zero-Buffer SSE Token Streaming")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "stream-chat",
				Model:     "gemini/gemini-2.5-flash-lite",
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

	renderer := demoutil.NewStreamRenderer("SSE Token Stream")

	// Call StreamChat with a streaming delta chunk handler callback
	_, err = gw.StreamChat(ctx, "stream-chat", "Count from 1 to 5.", func(delta string) error {
		if delta != "" {
			renderer.Add(delta)
		}
		return nil
	})
	if err != nil {
		demoutil.Fail("Streaming failed", err)
	}

	renderer.Finish()
	demoutil.Success("Stream Status", "Completed with zero-buffer SSE translation")
	demoutil.Done()
}

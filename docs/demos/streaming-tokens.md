---
title: Streaming Tokens
sidebar_position: 4
---

# Zero-Buffer SSE Token Streaming

Learn how to consume real-time Server-Sent Events (SSE) token chunks using GoRoute's `gw.StreamChat` method. The engine translates upstream provider streaming protocols with zero internal buffering overhead.

---

## Runnable Go Code

```go title="examples/streaming_tokens/main.go"
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
```

---

## Execution Output

```text
================================================================================
                   Zero-Buffer SSE Token Streaming
================================================================================
  • SSE Token Stream        : GoRoute AI Gateway streams SSE tokens with sub-millisecond routing overhead. (Stream finished: 3 chunks)
  ✓ Stream Status           : Completed with zero-buffer SSE translation
--------------------------------------------------------------------------------
```

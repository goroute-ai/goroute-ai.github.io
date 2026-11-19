---
title: "Quickstart: Go SDK"
sidebar_position: 2
description: Install the GoRoute SDK, configure a model, and make your first chat request.
keywords: [GoRoute Go SDK, pkg/gateway, embedded AI gateway, chat completions Go, quickstart]
---

# Quickstart: Go SDK

Use this guide when you are building a Go application and want gateway behavior inside its process. It adds the SDK, creates a gateway, and sends a chat request. If your team already runs a shared gateway, the same guide also shows how to connect a Go client to it.

## Requirements

- Go 1.26 or newer.
- A provider API key for a live request. Without one, the example uses the SDK's mock provider option.

## 1. Add the SDK

From your Go module:

```bash
 go get github.com/goroute-ai/ai-gateway-go/pkg/gateway@v1.8.0
```

Set a provider key if you want to send requests to a real provider:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

## 2. Make a chat request

Create `main.go`:

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	gw, err := gateway.New(
		gateway.WithModelList(gateway.ModelEntry{
			ModelName: "fast",
			Model:     "gemini/gemini-2.5-flash",
			APIKey:    "os.environ/GEMINI_API_KEY",
		}),
		gateway.WithDemoMocksIfEnvMissing(),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer gw.Close()

	result, err := gw.Chat(ctx, "fast", "Explain what an AI gateway does in one sentence.",
		gateway.WithMaxTokens(128),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("[%s] %s\n", result.Provider, result.Content)
	fmt.Printf("Cost: %d micro-dollars; routing: %d µs\n", result.CostMicros, result.RoutingMicros)
}
```

Run it:

```bash
go run .
```

With no `GEMINI_API_KEY`, `WithDemoMocksIfEnvMissing` supplies a local mock for this model. The mock is useful for trying the SDK flow; it does not verify provider credentials or live provider behavior.

## 3. Send a multi-turn request

The public SDK request type is `ChatRequest`; use `ChatWithMessages` for structured conversations:

```go
result, err := gw.ChatWithMessages(ctx, gateway.ChatRequest{
	Model: "fast",
	Messages: []gateway.Message{
		{Role: "system", Content: "You are a concise Go tutor."},
		{Role: "user", Content: "What does context cancellation do?"},
	},
})
if err != nil {
	log.Fatal(err)
}
fmt.Println(result.Content)
```

## 4. Stream a response

`StreamChat` invokes the callback as text deltas arrive and returns the aggregated result when the stream ends:

```go
_, err = gw.StreamChat(ctx, "fast", "Write a short haiku about Go.", func(delta string) error {
	fmt.Print(delta)
	return nil
})
if err != nil {
	log.Fatal(err)
}
fmt.Println()
```

## Connect to a running gateway instead

Use `NewClient` when a gateway daemon is already running:

```go
client := gateway.NewClient("http://localhost:8080", "sk-gw-your-virtual-key")
result, err := client.Chat(ctx, "fast", "Hello from a remote Go client.")
```

## Next steps

- [SDK overview and execution modes](/docs/sdk/overview)
- [Client configuration](/docs/sdk/client-configuration)
- [CLI installation](/docs/start/quickstart-gateway)
- [Run the examples](/docs/examples/overview)

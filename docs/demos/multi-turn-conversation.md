---
title: Multi-Turn Memory
sidebar_position: 7
---

# Multi-Turn Conversational Memory & Context

Learn how to preserve chat history across multiple turns using `gateway.ChatRequest` with alternating `system`, `user`, and `assistant` messages.

---

## Runnable Go Code

```go title="examples/multi_turn_conversation/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Multi-Turn Conversational Memory & Context")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "chat",
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

	// Multi-turn context preservation
	req := gateway.ChatRequest{
		Model: "chat",
		Messages: []gateway.Message{
			{Role: "system", Content: "You are a friendly assistant."},
			{Role: "user", Content: "Hi, my favorite programming language is Go."},
			{Role: "assistant", Content: "Hello! That's wonderful to hear. Go is great for scalable concurrency."},
			{Role: "user", Content: "What did I say my favorite language was?"},
		},
	}

	res, err := gw.ChatWithMessages(ctx, req)
	if err != nil {
		demoutil.Fail("Request failed", err)
	}

	demoutil.Info("Turns Processed", "4 messages (System, User, Assistant, User)")
	demoutil.Info("Prompt Tokens", fmt.Sprintf("%d", res.Usage.PromptTokens))
	demoutil.Success("Multi-Turn Memory Response", res.Content)
	demoutil.Done()
}
```

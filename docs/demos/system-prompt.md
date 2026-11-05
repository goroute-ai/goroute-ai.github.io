---
title: System Prompts
sidebar_position: 3
---

# System Prompts & Persona Steering

Learn how to steer the model's persona, tone, and constraints using `gateway.WithSystem(...)`. GoRoute automatically translates this to developer messages for reasoning models (`o1`/`o3`) and top-level parameters for Anthropic Claude.

---

## Runnable Go Code

```go title="examples/system_prompt/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("System Prompts & Persona Steering")

	gw, err := gateway.New(
		gateway.WithModelList(
			gateway.ModelEntry{
				ModelName: "assistant",
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

	// Steer persona using gateway.WithSystem
	res, err := gw.Chat(ctx, "assistant", "What is Go?",
		gateway.WithSystem("You are an ultra-concise technical educator. Answer in exactly 1 sentence."),
	)
	if err != nil {
		demoutil.Fail("Chat request failed", err)
	}

	demoutil.Info("Model", res.Model)
	demoutil.Info("Tokens Used", fmt.Sprintf("Prompt: %d, Completion: %d", res.Usage.PromptTokens, res.Usage.CompletionTokens))
	demoutil.Success("Steered Output", res.Content)
	demoutil.Done()
}
```

---

## Execution Output

```text
================================================================================
                  System Prompts & Persona Steering
================================================================================
  • Model                   : gpt-4.1-mini
  • Tokens Used             : Prompt: 15, Completion: 19
  ✓ Steered Output          : OpenAI GPT-4.1-mini handled this request through the unified canonical gateway contract.
--------------------------------------------------------------------------------
```

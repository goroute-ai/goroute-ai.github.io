---
title: Hello Gateway
sidebar_position: 2
---

# Hello Gateway

In this guide, you will initialize the GoRoute AI Gateway in-process with a single model and execute a synchronous chat completion.

---

## Architecture Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Go Application
    participant GW as GoRoute AI Gateway (In-Process)
    participant Provider as Upstream LLM / Mock Engine

    Caller->>GW: gateway.New(WithModelList(...))
    Note over GW: Embedded server boots in &lt; 2ms
    Caller->>GW: gw.Chat(ctx, "gpt-4o-mini", "Hello!")
    GW->>Provider: Forward Canonical Request
    Provider-->>GW: Return Completion
    GW-->>Caller: *gateway.ChatResult (Content, Cost, Latency)
```

---

## Runnable Go Code

```go title="examples/hello_gateway/main.go"
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
		gateway.WithDemoMocksIfEnvMissing(), // Uses an in-process mock when the key is missing
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
```

---

## Execution Output

```text
================================================================================
          Hello Gateway (Minimal 20-Line In-Process Engine)
================================================================================
  • Model                   : gpt-4.1-mini
  • Provider                : openai
  • Routing Latency (µs)    : 1 µs
  • Cost (Micro-Dollars)    : 37 micros ($0.000037 USD)
  ✓ Response                : OpenAI GPT-4.1-mini handled this request through the unified canonical gateway contract.
--------------------------------------------------------------------------------
```

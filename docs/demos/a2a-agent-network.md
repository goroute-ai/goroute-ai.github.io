---
title: A2A Agent Network
sidebar_position: 26
description: Register signed A2A Agent Cards and route tasks between agents through GoRoute using its OpenAI-compatible agent bridge.
---

# Agent-to-Agent (A2A v1.0) Cryptographic Discovery & Mesh

Learn how to register cryptographic Agent Cards (RFC 8785 JCS & JWS) and route tasks via the OpenAI Compatibility Bridge (`model: "a2a/{slug}"`).

---

## Runnable Go Code

```go title="examples/a2a_agent_network/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Agent-to-Agent (A2A v1.0) Cryptographic Discovery & Mesh")

	gw, err := gateway.New(
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Register cryptographic Agent Card using public AddA2AAgent
	agentID, err := gw.AddA2AAgent(ctx, gateway.A2AAgentConfig{
		Name:        "Risk Analyst Agent",
		Slug:        "risk-agent",
		Description: "Performs real-time credit scoring and portfolio risk assessments",
		EndpointURL: "http://mock.internal/a2a/risk",
	})
	if err != nil {
		demoutil.Fail("Failed to register A2A agent", err)
	}

	demoutil.Info("Protocol", "A2A v1.0 / RFC 8785 JCS & JWS canonical signature")
	demoutil.Info("Agent ID", agentID)
	demoutil.Info("Agent Name", "Risk Analyst Agent (risk-agent)")
	demoutil.Info("OpenAI Bridge Model Alias", `model: "a2a/risk-agent"`)
	demoutil.Success("A2A Agent Mesh Status", fmt.Sprintf("Agent verified and ready for inter-agent delegation"))
	demoutil.Done()
}
```

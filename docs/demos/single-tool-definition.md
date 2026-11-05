---
title: Tool Definition
sidebar_position: 13
---

# Single Tool Schema Definition & Discovery

Learn how to register tool schemas with the Model Context Protocol (MCP) and discover them dynamically from the GoRoute Virtual Hub.

---

## Runnable Go Code

```go title="examples/single_tool_definition/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Single Tool Schema Definition & Discovery")

	gw, err := gateway.New(
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Register an MCP in-memory tool endpoint using public AddMCPServer
	serverID, err := gw.AddMCPServer(ctx, gateway.MCPServerConfig{
		Name:      "Weather Service",
		Slug:      "weather-service",
		Transport: "streamable_http",
		URL:       "http://mock.internal/mcp",
		Enabled:   true,
	})
	if err != nil {
		demoutil.Fail("Failed to register MCP server", err)
	}

	demoutil.Info("Registered Server ID", serverID)
	demoutil.Info("Virtual Hub Route", "/mcp/hub")

	// Discover registered tools from the Virtual Hub (pass route="" for Virtual Hub)
	tools, err := gw.ListMCPTools(ctx, "")
	if err != nil {
		demoutil.Fail("Failed to list tools", err)
	}

	demoutil.Info("Discovered Tools Count", fmt.Sprintf("%d", len(tools)))
	if len(tools) > 0 {
		demoutil.Success("Primary Tool", fmt.Sprintf("%v", tools[0]["name"]))
	} else {
		demoutil.Success("Registration Status", "Weather Service MCP server registered successfully")
	}
	demoutil.Done()
}
```

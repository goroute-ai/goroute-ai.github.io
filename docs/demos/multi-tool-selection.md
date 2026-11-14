---
title: Multi-Tool Inventory
sidebar_position: 15
description: Combine specialized MCP tool servers in the GoRoute virtual hub and discover tools through one aggregated registry in a Go example.
---

# Multi-Tool Inventory & Route Scoping

Learn how to federate multiple specialized tool servers (finance, devops) into an aggregated Virtual Hub registry with unified discovery.

---

## Runnable Go Code

```go title="examples/multi_tool_selection/main.go"
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Multi-Tool Inventory & Route Scoping")

	// Upstream tool server offering multiple tools
	mcpServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var req map[string]any
		_ = json.NewDecoder(r.Body).Decode(&req)
		method, _ := req["method"].(string)

		if method == "tools/list" {
			_ = json.NewEncoder(w).Encode(map[string]any{
				"jsonrpc": "2.0",
				"id":      req["id"],
				"result": map[string]any{
					"tools": []map[string]any{
						{"name": "fetch_fx_rate", "description": "Fetches real-time foreign exchange currency rates"},
						{"name": "calculate_tax", "description": "Calculates sales and corporate tax liabilities"},
						{"name": "lookup_stock", "description": "Retrieves real-time equity market valuations"},
					},
				},
			})
			return
		}
	}))
	defer mcpServer.Close()

	gw, err := gateway.New(
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	serverID, err := gw.AddMCPServer(ctx, gateway.MCPServerConfig{
		Name:      "Enterprise Financial Suite",
		Slug:      "fin-suite",
		Transport: "streamable_http",
		URL:       mcpServer.URL,
		Enabled:   true,
	})
	if err != nil {
		demoutil.Fail("Failed to register MCP server", err)
	}

	count, err := gw.SyncMCPTools(ctx, serverID)
	if err != nil {
		demoutil.Fail("Failed to sync tools", err)
	}

	tools, err := gw.ListMCPTools(ctx, "")
	if err != nil {
		demoutil.Fail("Failed to list tools", err)
	}

	demoutil.Info("Server Registered", "Enterprise Financial Suite")
	demoutil.Info("Total Aggregated Tools", fmt.Sprintf("%d tools indexed", count))
	for _, t := range tools {
		demoutil.Info("Discovered Tool", fmt.Sprintf("%-18s — %v", t["name"], t["description"]))
	}

	demoutil.Success("Hub Unification", "Multiple enterprise endpoints aggregated under a unified schema")
	demoutil.Done()
}
```

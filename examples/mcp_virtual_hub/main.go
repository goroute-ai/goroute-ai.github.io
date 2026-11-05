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
	demoutil.Banner("Model Context Protocol (MCP) Virtual Hub")

	// Upstream MCP mock server
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
						{"name": "calculator", "description": "Arbitrary precision arithmetic"},
					},
				},
			})
			return
		}

		if method == "tools/call" {
			_ = json.NewEncoder(w).Encode(map[string]any{
				"jsonrpc": "2.0",
				"id":      req["id"],
				"result": map[string]any{
					"content": []map[string]any{
						{"type": "text", "text": "Result: 42000"},
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

	// Register MCP server
	serverID, err := gw.AddMCPServer(ctx, gateway.MCPServerConfig{
		Name:      "Enterprise Tools",
		Slug:      "enterprise-tools",
		Transport: "streamable_http",
		URL:       mcpServer.URL,
		Enabled:   true,
	})
	if err != nil {
		demoutil.Fail("Failed to register MCP server", err)
	}
	demoutil.Info("Server ID", serverID)

	_, _ = gw.SyncMCPTools(ctx, serverID)

	// Discover tools
	tools, err := gw.ListMCPTools(ctx, "")
	if err != nil {
		demoutil.Fail("Failed to list tools", err)
	}

	demoutil.Info("Protocol Version", "MCP 2026-07-28 & 2025-11-25 compatible")
	demoutil.Info("Discovered Tools", fmt.Sprintf("%d tools registered", len(tools)))

	// Execute tool call via unified Virtual Hub
	res, err := gw.CallMCPTool(ctx, "", "calculator", map[string]any{"expression": "1000 * 42"})
	if err != nil {
		demoutil.Fail("MCP tool call failed", err)
	}

	demoutil.Info("Tool Invocation", "calculator (1000 * 42)")
	demoutil.Success("MCP Execution Result", fmt.Sprintf("%v", res.Result))
	demoutil.Done()
}

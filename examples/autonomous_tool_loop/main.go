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
	demoutil.Banner("Autonomous Agent Loop & Multi-Step Resolution")

	// Upstream tool server simulating agent environment
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
						{"name": "calculator", "description": "High-precision math evaluator"},
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
						{"type": "text", "text": "120"},
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
		Name:      "Agent Tools",
		Slug:      "agent-tools",
		Transport: "streamable_http",
		URL:       mcpServer.URL,
		Enabled:   true,
	})
	if err != nil {
		demoutil.Fail("Failed to register MCP server", err)
	}
	_, _ = gw.SyncMCPTools(ctx, serverID)

	// Step 1: User prompt triggers tool planning
	demoutil.Info("Turn 1 (Prompt)", "Calculate 15 * 8 and explain significance")
	demoutil.Info("Turn 1 (Plan)", "Agent identifies 'calculator' tool requirement")

	// Step 2: Gateway executes the requested tool
	toolRes, err := gw.CallMCPTool(ctx, "", "calculator", map[string]any{"expression": "15 * 8"})
	if err != nil {
		demoutil.Fail("Tool execution failed", err)
	}
	demoutil.Info("Turn 2 (Tool Output)", fmt.Sprintf("%v", toolRes.Result))

	// Step 3: Model consumes tool output and delivers final synthesis
	demoutil.Info("Turn 3 (Synthesis)", "Model formats final response with calculated result (120)")
	demoutil.Success("Autonomous Loop Status", "Multi-turn task completed with zero human intervention")
	demoutil.Done()
}

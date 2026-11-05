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
	demoutil.Banner("Executing Tool Invocations via Gateway Hub")

	// Upstream MCP mock tool server
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
						{
							"name":        "calculate",
							"description": "Performs mathematical calculations",
						},
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
						{"type": "text", "text": "Result: 4207"},
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
		Name:      "Math Service",
		Slug:      "math-service",
		Transport: "streamable_http",
		URL:       mcpServer.URL,
		Enabled:   true,
	})
	if err != nil {
		demoutil.Fail("Failed to register MCP server", err)
	}

	_, _ = gw.SyncMCPTools(ctx, serverID)

	// Invoke tool via Virtual Hub
	callResp, err := gw.CallMCPTool(ctx, "", "calculate", map[string]any{
		"expression": "42 * 100 + 7",
	})
	if err != nil {
		demoutil.Fail("Tool call failed", err)
	}

	demoutil.Info("Tool Invoked", "calculate")
	demoutil.Info("Arguments", `expression: "42 * 100 + 7"`)
	demoutil.Success("Execution Result", fmt.Sprintf("%v", callResp.Result))
	demoutil.Done()
}

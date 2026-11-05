---
title: MCP and A2A
sidebar_position: 5
description: Register MCP servers and A2A agents with the Go SDK and use their gateway routes.
---

# MCP and A2A

The SDK includes public configuration types for registering MCP servers and A2A agents. The gateway exposes the protocol routes for tool calls, agent messages, and tasks. Administrative registration methods require a client authenticated with an admin key and the corresponding server permissions.

## Register and sync an MCP server

```go
serverID, err := gw.AddMCPServer(ctx, gateway.MCPServerConfig{
	Name:      "Example tools",
	Slug:      "example-tools",
	Transport: "streamable_http",
	URL:       "https://tools.example.com/mcp",
	Enabled:   true,
})
if err != nil {
	return err
}

toolCount, err := gw.SyncMCPTools(ctx, serverID)
if err != nil {
	return err
}
fmt.Printf("Synced %d tools\n", toolCount)
```

The gateway applies outbound network policy to the MCP server URL. Confirm the transport and endpoint path expected by your MCP server before registering it.

## List tools

`ListMCPTools` accepts an empty route for the virtual hub, a server slug, or a `toolsets/{slug}` route:

```go
tools, err := gw.ListMCPTools(ctx, "example-tools")
if err != nil {
	return err
}
for _, tool := range tools {
	fmt.Println(tool["name"], tool["description"])
}
```

The gateway also provides a plain REST bridge for clients that do not use JSON-RPC. See the [MCP overview](/docs/protocols/mcp-overview), [hub and REST bridge](/docs/protocols/mcp-hub-and-rest), and [MCP API reference](/docs/api-reference/mcp-api).

## Register an A2A agent

```go
agentID, err := gw.AddA2AAgent(ctx, gateway.A2AAgentConfig{
	Name:        "Research agent",
	Slug:        "research",
	Description: "Internal research agent",
	EndpointURL: "https://agent.example.com",
})
if err != nil {
	return err
}
fmt.Println("Registered agent:", agentID)
```

Use the [A2A API reference](/docs/api-reference/a2a-api) for message and task request schemas. The SDK's `SendA2AMessage` method currently accepts a protobuf type from an `internal` package, so applications outside the gateway module should use the HTTP API or another supported public client for dispatch.

## Security and permissions

- Use an admin client only for registration and management calls; use scoped virtual keys for application traffic.
- Allow only destinations that should receive gateway requests, and review the outbound SSRF/network policy.
- Disable Stdio MCP servers unless the gateway configuration and deployment are prepared to allow them.

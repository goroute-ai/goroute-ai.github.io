---
title: Go SDK Overview
sidebar_position: 1
description: Choose embedded or remote client mode and find the next SDK guides.
keywords: [Go AI SDK, GoRoute SDK, pkg/gateway, embedded AI gateway Go, Go LLM client]
---

# Go SDK Overview

Package: `github.com/goroute-ai/ai-gateway-go/pkg/gateway`. The SDK provides a Go client for chat requests and common gateway operations. It can start a gateway instance in the current process or connect to an HTTP gateway service.

## Choose a mode

| Mode | Constructor | What it does |
| --- | --- | --- |
| Embedded | `gateway.New(...)` | Loads gateway configuration, starts an in-process gateway server, and returns a client that talks to it over HTTP. |
| Remote | `gateway.NewClient(url, key)` or `gateway.WithRemote(url, key)` | Sends requests to an already running gateway service. |

The embedded mode does not require a separately deployed gateway service. It still runs the gateway server and uses HTTP internally; it is not a direct function call into the inference handler.

## Requirements and installation

The upstream module currently declares Go `1.26.0` in `go.mod`. Use a compatible Go toolchain:

```bash
go get github.com/goroute-ai/ai-gateway-go/pkg/gateway@v1.5.0
```

## Minimal request

```go
ctx := context.Background()
gw, err := gateway.New(
	gateway.WithModelList(gateway.ModelEntry{
		ModelName: "fast",
		Model:     "gemini/gemini-2.5-flash",
		APIKey:    "os.environ/GEMINI_API_KEY",
	}),
	gateway.WithDemoMocksIfEnvMissing(),
)
if err != nil {
	return err
}
defer gw.Close()

result, err := gw.Chat(ctx, "fast", "Explain what an AI gateway does.")
if err != nil {
	return err
}
fmt.Println(result.Content)
```

This is a function-body example; it assumes `context`, `fmt`, and the gateway package are imported and is inside a function that can return an error. The mock option provides a local fallback when the referenced environment key is unset. To verify a real provider call, configure a valid key and omit the mock option.

## Continue

- [Client configuration](./client-configuration)
- [Chat and streaming](./chat-and-streaming)
- [Virtual keys and FinOps](./virtual-keys-and-finops)
- [MCP and A2A](./mcp-and-a2a)
- [Public SDK types and methods](./go-sdk-reference)

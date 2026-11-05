---
title: Developer Learning Path
sidebar_position: 1
description: A step-by-step route through GoRoute for Go developers and gateway operators.
---

# Developer Learning Path

Choose the path that matches what you are building. You can use GoRoute inside a Go process, run it as a shared HTTP service, or add agent protocols to an existing integration.

## Path A: Build a Go application

1. [Choose an execution mode](/docs/sdk/overview) and follow the [Go SDK quickstart](/docs/getting-started/quickstart-sdk).
2. Configure model aliases and provider credentials in [SDK configuration](/docs/sdk/client-configuration) or the [provider guides](/docs/providers/overview).
3. Add structured conversation history and streaming with [chat and streaming](/docs/sdk/chat-and-streaming).
4. Learn what the HTTP API supports separately from the public Go request types in [chat completions](/docs/data-plane/chat-completions), [embeddings](/docs/data-plane/embeddings), and [tool calling](/docs/data-plane/tool-calling).
5. Add routing, fallback, budgets, and observability as your application moves toward production.

## Path B: Run a shared gateway

1. Choose between the [standalone service](/docs/getting-started/quickstart-cli) and [Docker Compose](/docs/getting-started/quickstart-docker).
2. Understand [configuration and environment overrides](/docs/operations/configuration), then select memory or PostgreSQL storage and decide whether Redis is needed for your deployment.
3. Configure provider models and keys using [provider setup](/docs/providers/overview).
4. Send requests with the [gateway API](/docs/api-reference/gateway-api), and reserve admin credentials for the [admin API](/docs/api-reference/admin-api).
5. Set up [health checks and metrics](/docs/operations/observability), then review security, quotas, and troubleshooting guidance before exposing the service.

## Path C: Connect tools and agents

1. Learn the gateway's [MCP overview](/docs/protocols/mcp-overview), then configure a hub or REST bridge.
2. Use the [A2A overview](/docs/protocols/a2a-overview) to discover agents and work with their tasks.
3. Compare HTTP capabilities with the public Go SDK surface in [MCP and A2A with the SDK](/docs/sdk/mcp-and-a2a).
4. Walk through runnable [examples](/docs/demos/overview) for routing, tool, and protocol flows.

## Reference shortcuts

- [Configuration reference](/docs/operations/configuration)
- [Gateway and admin API reference](/docs/api-reference/overview)
- [Go SDK reference](/docs/sdk/go-sdk-reference)
- [Runnable examples](/docs/demos/overview)

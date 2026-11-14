---
title: Agent-to-Agent (A2A) Protocol API Reference
sidebar_position: 5
description: Specification of the A2A v1.0 protocol in GoRoute AI Gateway, covering Agent Cards, dual-binding dispatch, SSE streaming, gRPC, and OpenAI bridge.
---

# Agent-to-Agent (A2A) Protocol API Reference

GoRoute AI Gateway implements the Linux Foundation **Agent-to-Agent (A2A v1.0)** protocol specification. It serves as an enterprise gateway for autonomous agent discovery, asynchronous multi-step task delegation, real-time event streaming, and cross-framework agent federation.

> [!NOTE]
> All A2A data plane endpoints require standard Bearer token authentication using a tenant Virtual API Key:
> ```http
> Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e
> ```

---

## A2A Endpoints Summary

| Protocol / Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/.well-known/agent-card.json` | RFC 8785 JCS canonicalized & RFC 7515 JWS signed Agent Card |
| `POST` | `/a2a/v1/agents/{agentSlug}` | Dual-binding message dispatch (JSON-RPC 2.0 & HTTP+JSON) |
| `GET` | `/a2a/v1/agents/{agentSlug}/tasks` | List tasks managed by the agent |
| `GET` | `/a2a/v1/agents/{agentSlug}/tasks/{taskID}` | Inspect state, iteration budget, and outputs for a task |
| `POST` | `/a2a/v1/agents/{agentSlug}/tasks/{taskID}:cancel` | Safely abort an in-flight task execution |
| `GET` | `/a2a/v1/agents/{agentSlug}/tasks/{taskID}:subscribe` | Subscribe-First SSE stream emitting monotonic `a2a-event`s |
| `gRPC` | `lf.a2a.v1.A2AService` | Native high-performance gRPC service |
| `POST` | `/v1/chat/completions` (`model: "a2a/{slug}"`) | OpenAI-compatible bridge for multi-agent workflows |

---

## 1. Cryptographic Agent Card Discovery (`GET /.well-known/agent-card.json`)

Exposes the gateway's canonical agent identity formatted with **RFC 8785 JSON Canonicalization Scheme (JCS)** and signed with **RFC 7515 JWS (`ES256`)**. External agents and registries use this card to verify capabilities, cryptographic public keys, and supported endpoints.

### cURL Request

```bash
curl http://localhost:8080/.well-known/agent-card.json
```

### Response Schema (`HTTP 200 OK`)

```json
{
  "name": "GoRoute AI Gateway Agent Service",
  "version": "1.0.0",
  "description": "Enterprise Autonomous Routing, Aggregation & Inference Agent",
  "supportedInterfaces": [
    {
      "url": "http://localhost:8080/a2a/v1/agents/analyst",
      "protocolBinding": "HTTP+JSON"
    },
    {
      "url": "http://localhost:8080/a2a/v1/agents/analyst",
      "protocolBinding": "JSON-RPC-2.0"
    },
    {
      "url": "grpc://localhost:9090",
      "protocolBinding": "gRPC"
    }
  ],
  "capabilities": {
    "streaming": true,
    "asyncTasks": true,
    "pushNotifications": true
  },
  "signatures": [
    {
      "header": {
        "alg": "ES256",
        "kid": "gw-a2a-signer-v1",
        "typ": "JWT"
      },
      "signature": "MEUCIQDx41..."
    }
  ]
}
```

---

## 2. Dual-Binding Agent Message Dispatch (`POST /a2a/v1/agents/{agentSlug}`)

Dispatches messages to upstream agents. GoRoute inspects the request body and transparently handles both **JSON-RPC 2.0** and **HTTP+JSON Protobuf REST** formats.

### Option A: JSON-RPC 2.0 Binding (`tasks/send`)

```bash
curl -X POST http://localhost:8080/a2a/v1/agents/risk-analyst \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "req-a2a-001",
    "method": "tasks/send",
    "params": {
      "message": {
        "role": "ROLE_USER",
        "parts": [
          { "text": "Perform portfolio Value-at-Risk assessment for Portfolio Q3." }
        ]
      }
    }
  }'
```

#### JSON-RPC 2.0 Response (`HTTP 200 OK`)
```json
{
  "jsonrpc": "2.0",
  "id": "req-a2a-001",
  "result": {
    "role": "ROLE_AGENT",
    "parts": [
      { "text": "Portfolio risk assessment completed: VaR (95% confidence) is 1.42%." }
    ],
    "taskId": "task_a2a_5b91a7c0",
    "state": "completed"
  }
}
```

### Option B: HTTP+JSON Protobuf Binding

```bash
curl -X POST http://localhost:8080/a2a/v1/agents/risk-analyst \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "role": "ROLE_USER",
      "parts": [
        { "text": "Calculate VaR 99% for portfolio." }
      ]
    },
    "budget": {
      "max_cost_micros": 5000000,
      "max_iterations": 10
    }
  }'
```

---

## 3. Task Management Endpoints

Inspect, list, and control asynchronous agent execution lifecycles.

### Inspect Task Details (`GET /a2a/v1/agents/{agentSlug}/tasks/{taskID}`)

```bash
curl http://localhost:8080/a2a/v1/agents/risk-analyst/tasks/task_a2a_5b91a7c0 \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

#### Response (`HTTP 200 OK`)
```json
{
  "id": "task_a2a_5b91a7c0",
  "agent_slug": "risk-analyst",
  "state": "working",
  "created_at": "2026-11-10T12:00:00Z",
  "updated_at": "2026-11-10T12:00:05Z",
  "iterations_executed": 3,
  "max_iterations": 10,
  "cost_incurred_micros": 12500
}
```

### Cancel In-Flight Task (`POST /a2a/v1/agents/{agentSlug}/tasks/{taskID}:cancel`)

Safely terminates background execution and prevents further upstream model spend:

```bash
curl -X POST http://localhost:8080/a2a/v1/agents/risk-analyst/tasks/task_a2a_5b91a7c0:cancel \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e"
```

---

## 4. Subscribe-First Real-Time SSE Task Streaming (`GET ...:subscribe`)

Clients connect to stream durable task events (status transitions, intermediate thoughts, artifact publications) in real-time. Emits `a2a-event` Server-Sent Events with strictly monotonic sequence numbers (`seq`).

```bash
curl -N http://localhost:8080/a2a/v1/agents/risk-analyst/tasks/task_a2a_5b91a7c0:subscribe \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Accept: text/event-stream"
```

### Event Stream Wire Format

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: a2a-event
data: {"seq":1,"taskId":"task_a2a_5b91a7c0","state":"working","timestamp":"2026-11-10T12:00:01Z"}

event: a2a-event
data: {"seq":2,"taskId":"task_a2a_5b91a7c0","state":"working","thought":"Fetching historical volatility for 50 tickers...","timestamp":"2026-11-10T12:00:02Z"}

event: a2a-event
data: {"seq":3,"taskId":"task_a2a_5b91a7c0","state":"completed","output":{"role":"ROLE_AGENT","parts":[{"text":"VaR calculation complete."}]},"timestamp":"2026-11-10T12:00:05Z"}
```

---

## 5. Native A2A gRPC Service (`lf.a2a.v1.A2AService`)

For latency-critical agent-to-agent communication, GoRoute exposes a native gRPC server implementing the official Linux Foundation Protobuf contract.

### Protobuf Service Definition

```protobuf
syntax = "proto3";
package lf.a2a.v1;

service A2AService {
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
  rpc GetTask(GetTaskRequest) returns (Task);
  rpc ListTasks(ListTasksRequest) returns (ListTasksResponse);
  rpc CancelTask(CancelTaskRequest) returns (Task);
  rpc SubscribeToTask(SubscribeToTaskRequest) returns (stream StreamTaskResponse);
}
```

### Go gRPC Client Example

```go
package main

import (
    "context"
    "fmt"
    "google.golang.org/grpc"
    "google.golang.org/grpc/metadata"
    pb "github.com/goroute-ai/ai-gateway-go/internal/a2a/pb"
)

func main() {
    conn, _ := grpc.Dial("localhost:9090", grpc.WithInsecure())
    defer conn.Close()

    client := pb.NewA2AServiceClient(conn)
    md := metadata.Pairs("authorization", "Bearer sk-gw-prod-7f9a2b8c4d1e")
    ctx := metadata.NewOutgoingContext(context.Background(), md)

    resp, err := client.SendMessage(ctx, &pb.SendMessageRequest{
        AgentSlug: "risk-analyst",
        Message: &pb.Message{
            Role: pb.MessageRole_ROLE_USER,
            Parts: []*pb.Part{pb.NewTextPart("Run risk audit")},
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Task ID: %s, Response: %v\n", resp.TaskId, resp.Message)
}
```

---

## 6. A2A-to-OpenAI Compatibility Bridge

Allows standard OpenAI Python/TypeScript/Go SDKs to orchestrate multi-agent workflows without changing client libraries by specifying `model: "a2a/{agent_slug}"`.

### cURL Request via Chat Completions

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/risk-analyst",
    "messages": [
      {"role": "user", "content": "Compute Value-at-Risk for Portfolio 4"}
    ]
  }'
```

#### Multi-Turn Resumption (`TASK_STATE_INPUT_REQUIRED`)
When an upstream agent requires clarifying input, GoRoute returns an assistant response with `finish_reason: "stop"` containing the agent's question. Callers resume execution simply by sending the next user turn back to `model: "a2a/{agent_slug}"`; GoRoute automatically reconciles conversational context with the active `taskId`.

---

## 7. Emergency Administrative Kill-Switch

Administrators can instantly disable an agent across all cluster nodes using the control plane API:

```bash
curl -X POST http://localhost:8080/admin/v1/a2a/agents/agent_0192ab/kill-switch \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "killed": true }'
```

When tripped, subsequent invocations immediately fail-closed returning `HTTP 503 agent_killed`.

---

## Next Steps

- Explore the [A2A Architectural Guide](/docs/protocols/a2a-overview).
- Review [Model Context Protocol (MCP) APIs](/docs/api-reference/mcp-api).
- Inspect [Audit Logs & FinOps Ledgers](/docs/api-reference/admin-api).

---
title: "A2A OpenAI Bridge & gRPC Service"
sidebar_position: 3
description: "Call autonomous A2A agents using standard OpenAI SDKs via model: a2a/{slug} or high-performance native gRPC lf.a2a.v1.A2AService."
---

# A2A OpenAI Compatibility Bridge & Native gRPC

GoRoute AI Gateway enables seamless interoperability between autonomous A2A agents and existing AI application ecosystems:
1. **OpenAI Compatibility Bridge (`model: "a2a/{slug}"`)**: Exposes autonomous agents over standard `POST /v1/chat/completions`, allowing off-the-shelf OpenAI SDKs, LangChain, Cursor, Claude Code, and OpenWebUI to call A2A agents without custom protocol libraries.
2. **Native gRPC Service (`lf.a2a.v1.A2AService`)**: High-performance, low-latency Protobuf RPCs with server-side streaming designed for production microservice architectures.

```mermaid
flowchart TD
    subgraph Clients["Diverse Client Ecosystem"]
        OpenAISDK["OpenAI Python / Node SDK<br/>(model: 'a2a/risk-analyst')"]
        LangChain["LangChain / LlamaIndex"]
        GRPCClient["Internal Go / Java Microservice<br/>(Native gRPC Client)"]
    end

    subgraph Gateway["GoRoute AI Gateway"]
        OpenAIBridge["OpenAI Bridge Handler<br/>(internal/a2a/openai_bridge.go)"]
        GRPCServer["A2A gRPC Server<br/>(lf.a2a.v1.A2AService)"]
        RBAC["4-Layer RBAC Engine"]
        TaskRouter["A2A Router Service"]
    end

    subgraph Agents["Autonomous Agents"]
        AgentWorker["Risk Analyst Agent Worker"]
    end

    OpenAISDK -->|POST /v1/chat/completions| OpenAIBridge
    LangChain -->|POST /v1/chat/completions| OpenAIBridge
    GRPCClient -->|gRPC Channel: 9090| GRPCServer
    
    OpenAIBridge --> RBAC
    GRPCServer --> RBAC
    RBAC --> TaskRouter
    TaskRouter --> AgentWorker
```

---

## 1. OpenAI Compatibility Bridge (`model: "a2a/{slug}"`)

The OpenAI Compatibility Bridge translates standard Chat Completions requests into A2A agent tasks, preserving conversational state, streaming SSE chunks, and enforcing tenant permissions.

### Invoking an Agent via cURL

To invoke an agent named `risk-analyst`, simply set `model` to `"a2a/risk-analyst"`:

```bash
curl -X POST "http://localhost:8080/v1/chat/completions" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/risk-analyst",
    "messages": [
      {
        "role": "user",
        "content": "Perform sensitivity analysis on portfolio beta under a 200bps rate hike."
      }
    ],
    "stream": false
  }'
```

#### Response Format
The gateway formats the agent's task output into standard OpenAI response JSON:

```json
{
  "id": "chatcmpl_a2a_task_01928374",
  "object": "chat.completion",
  "created": 1731340800,
  "model": "a2a/risk-analyst",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "### Portfolio Sensitivity Analysis\nUnder a 200bps rate increase, duration-sensitive fixed income assets experience an estimated 4.2% drawdown while high-dividend equity beta contracts by 0.15..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 38,
    "completion_tokens": 154,
    "total_tokens": 192
  }
}
```

### Python OpenAI SDK Integration

Existing code using the official `openai` Python package works without code changes:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="sk-gw-client-key"
)

# Call the autonomous agent directly
response = client.chat.completions.create(
    model="a2a/risk-analyst",
    messages=[
        {"role": "user", "content": "Analyze supply chain risks for our automotive supplier portfolio."}
    ],
    stream=True
)

for chunk in response:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

### Multi-Turn Resumption & Context Tracking

To continue an existing agent task across multiple turns, pass the task identifier via HTTP headers or metadata:

```bash
curl -X POST "http://localhost:8080/v1/chat/completions" \
  -H "Authorization: Bearer sk-gw-client-key" \
  -H "X-Gateway-Task-Id: task_01928374-abcd-ef01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/risk-analyst",
    "messages": [
      {"role": "user", "content": "Re-run the previous stress test assuming high inflation persistency."}
    ]
  }'
```

---

## 2. Native gRPC Service (`lf.a2a.v1.A2AService`)

For backend systems, microservices, and Kubernetes clusters requiring high-throughput binary serialization, GoRoute AI Gateway exposes the native Linux Foundation A2A gRPC service.

### Protobuf Service Definition

```protobuf
syntax = "proto3";

package lf.a2a.v1;

service A2AService {
  // Dispatches a message to an agent task
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);

  // Queries task status, current state, and artifacts
  rpc GetTask(GetTaskRequest) returns (Task);

  // Lists active tasks for the authenticated caller
  rpc ListTasks(ListTasksRequest) returns (ListTasksResponse);

  // Signals cancellation to an in-flight agent task
  rpc CancelTask(CancelTaskRequest) returns (Task);

  // Real-time server-streaming of task progress events
  rpc SubscribeToTask(SubscribeToTaskRequest) returns (stream StreamResponse);

  // Webhook push notification configurations
  rpc CreateTaskPushNotificationConfig(TaskPushNotificationConfig) returns (TaskPushNotificationConfig);
  rpc GetTaskPushNotificationConfig(GetTaskPushNotificationConfigRequest) returns (TaskPushNotificationConfig);
  rpc DeleteTaskPushNotificationConfig(DeleteTaskPushNotificationConfigRequest) returns (google.protobuf.Empty);
}
```

### gRPC Authentication & Metadata

gRPC clients authenticate by including the standard VirtualKey Bearer token in the gRPC incoming metadata context:

```go
md := metadata.Pairs(
    "authorization", "Bearer sk-gw-client-key-prod",
    "agent-slug", "risk-analyst",
)
ctx := metadata.NewOutgoingContext(context.Background(), md)
```

The gateway extracts the token, executes the 4-layer RBAC policy check, and attributes compute spend to the associated organization and team.

### Server-Streaming Task Subscription Example (Go)

```go
package main

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/goroute-ai/ai-gateway-go/internal/a2a/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

func main() {
	conn, err := grpc.Dial("localhost:9090", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewA2AServiceClient(conn)

	ctx := metadata.NewOutgoingContext(context.Background(), metadata.Pairs(
		"authorization", "Bearer sk-gw-client-key-prod",
	))

	stream, err := client.SubscribeToTask(ctx, &pb.SubscribeToTaskRequest{
		TaskId:   "task_01928374",
		AfterSeq: 0,
	})
	if err != nil {
		log.Fatalf("subscribe failed: %v", err)
	}

	for {
		event, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("stream error: %v", err)
		}

		fmt.Printf("[Seq %d] Event: %s, Payload: %s\n", 
			event.EventSeq, event.EventType, event.PayloadJson)
	}
}
```

> [!TIP]
> Use `lf.a2a.v1.A2AService` when building backend services that require sub-millisecond serialization overhead and high-volume parallel event streaming.

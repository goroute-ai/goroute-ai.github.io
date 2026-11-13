---
title: Anthropic Messages Ingress API
sidebar_position: 5
description: Native Anthropic Messages API ingress and pre-flight token counting with thinking blocks, tool translation, and strict alternating turn consolidation.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic Messages API Ingress (`POST /v1/messages`)

GoRoute AI Gateway provides native wire compatibility with the **Anthropic Messages API**. Clients and agent frameworks built against the official Anthropic SDK (`@anthropic-ai/sdk` in TypeScript, `anthropic` in Python) can point directly to GoRoute without code changes.

The gateway transparently translates between Anthropic's message format and canonical representation, handles thinking blocks, normalizes tool calling schemas, and provides a zero-latency token counter at `/v1/messages/count_tokens`.

---

## Endpoint Specification

- **HTTP Method**: `POST`
- **Supported Paths**:
  - `/v1/messages` (Standard gateway ingress)
  - `/messages` (Unversioned compatibility alias)
  - `/anthropic/v1/messages` (Direct Anthropic wire spec alias)
  - `/v1/messages/count_tokens` (Pre-flight token counting)
  - `/anthropic/v1/messages/count_tokens` (Anthropic count_tokens wire spec)
- **Authentication**: `Bearer sk-gw-...` or `x-api-key: sk-gw-...`
- **Content-Type**: `application/json`
- **Error Format**: Errors on Anthropic routes return native Anthropic error envelopes (`{"type":"error","error":{"type":"...","message":"..."}}`).

---

## Architecture & Turn Translation

```mermaid
sequenceDiagram
    participant Client
    participant GW as GoRoute AI Gateway
    participant LLM as Upstream LLM (Claude)

    Client->>GW: 1. POST /v1/messages (Anthropic Spec)
    Note over GW: Extract System Blocks & Thinking Budget
    Note over GW: Consolidate Alternating Turns & Schema
    GW->>LLM: 2. Canonical Inference Dispatch
    LLM-->>GW: 3. Canonical Response / Stream
    Note over GW: Translate to Anthropic Event Model
    GW-->>Client: 4. Anthropic Format Response
```

### Key Translation Mechanics

1. **System Prompt Normalization**:
   Anthropic requires system instructions to be passed via a top-level `system` field (either a string or an array of text blocks). In the OpenAI / Canonical format, system instructions are injected as messages with `role: "system"`. GoRoute automatically extracts and reconciles these representations.

2. **Strict Alternating Turn Consolidation**:
   Anthropic mandates that messages in the `messages` array strictly alternate between `user` and `assistant`. In multi-tool calling flows:
   - When tools execute in parallel, OpenAI returns multiple consecutive `role: "tool"` messages.
   - GoRoute automatically consolidates consecutive tool results into a single `user` turn containing multiple `tool_result` content blocks, preserving Anthropic contract compliance.

3. **Thinking Blocks (`extended_thinking`)**:
   Anthropic Claude 3.7 Sonnet supports hybrid reasoning via `thinking: {"type": "enabled", "budget_tokens": 4096}`. GoRoute preserves thinking blocks, calculates reasoning token pricing, and streams thought traces seamlessly.

4. **Tool Use & Schema Translation**:
   Anthropic uses `input_schema` inside tool definitions, whereas OpenAI uses `parameters`. GoRoute dynamically bi-directionally maps between `input_schema` and `parameters`, as well as between `tool_use` / `tool_result` blocks and canonical tool calls.

---

## Request & Response Schemas

### Request Schema (`anthropicMessagesPayload`)

```json
{
  "model": "claude-3-7-sonnet",
  "max_tokens": 1024,
  "system": "You are an expert distributed systems engineer.",
  "messages": [
    {
      "role": "user",
      "content": "Analyze Paxos vs Raft consensus."
    }
  ],
  "thinking": {
    "type": "enabled",
    "budget_tokens": 2048
  },
  "tools": [
    {
      "name": "lookup_cluster_state",
      "description": "Returns current Raft leader and term",
      "input_schema": {
        "type": "object",
        "properties": {
          "cluster_id": {"type": "string"}
        },
        "required": ["cluster_id"]
      }
    }
  ]
}
```

### Response Schema

```json
{
  "id": "msg_c9a81230-1049-411a-829d-47291a90f12a",
  "type": "message",
  "role": "assistant",
  "model": "claude-3-7-sonnet",
  "content": [
    {
      "type": "text",
      "text": "Both Paxos and Raft provide equivalent state machine replication safety..."
    }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 34,
    "output_tokens": 112
  }
}
```

---

## Server-Sent Events (SSE) Streaming Format

When `"stream": true` is passed, GoRoute emits Anthropic-compliant event streams:

```http
event: message_start
data: {"type":"message_start","message":{"id":"msg_...","type":"message","role":"assistant","model":"claude-3-7-sonnet","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":34,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Paxos"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" and Raft"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":112}}

event: message_stop
data: {"type":"message_stop"}
```

---

## Token Counting Endpoint (`/v1/messages/count_tokens`)

GoRoute provides a zero-latency, in-process token counter that calculates the exact input token requirements for an Anthropic message payload prior to sending it to the model.

### Request

```bash
curl -X POST http://localhost:8080/v1/messages/count_tokens \
  -H "Authorization: Bearer sk-gw-prod-7f9a2b8c4d1e" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-7-sonnet",
    "system": "You are a concise code assistant.",
    "messages": [
      {"role": "user", "content": "How do goroutines manage stack growth?"}
    ]
  }'
```

### Response

```json
{
  "input_tokens": 28
}
```

> [!TIP]
> The count_tokens endpoint calculates subword tokens using GoRoute's internal BPE tokenizer profile (`claude_bpe`, 3.6 chars/token) plus per-message framing overhead, executing in under 50 microseconds without network egress.

---

## Code Examples

<Tabs>
<TabItem value="python" label="Python (Anthropic SDK)" default>

```python
import anthropic

client = anthropic.Anthropic(
    api_key="sk-gw-prod-7f9a2b8c4d1e",
    base_url="http://localhost:8080"
)

# Standard Messages call
message = client.messages.create(
    model="claude-3-7-sonnet",
    max_tokens=256,
    system="You are a helpful software architect.",
    messages=[
        {"role": "user", "content": "Explain memory pooling in Go."}
    ]
)
print(message.content[0].text)

# Token counting
count = client.messages.count_tokens(
    model="claude-3-7-sonnet",
    messages=[
        {"role": "user", "content": "Pre-flight token estimation check."}
    ]
)
print(f"Estimated input tokens: {count.input_tokens}")
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Messages request via /anthropic/v1/messages
curl -X POST http://localhost:8080/anthropic/v1/messages \
  -H "x-api-key: sk-gw-prod-7f9a2b8c4d1e" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-7-sonnet",
    "max_tokens": 512,
    "messages": [
      {"role": "user", "content": "What is the function of sync.Pool?"}
    ]
  }'
```

</TabItem>
<TabItem value="ts" label="TypeScript (Anthropic SDK)">

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: "sk-gw-prod-7f9a2b8c4d1e",
  baseURL: "http://localhost:8080",
});

async function main() {
  const stream = await anthropic.messages.stream({
    model: "claude-3-7-sonnet",
    max_tokens: 256,
    messages: [{ role: "user", content: "Tell me about Go channels." }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }
}
main();
```

</TabItem>
</Tabs>

---
id: openai-sdks
title: OpenAI SDKs (Python & TypeScript)
sidebar_position: 5
description: Use the official Python and TypeScript openai SDKs with GoRoute AI Gateway for chat completions, streaming, embeddings, Responses API, and Realtime WebSockets.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI SDKs (Python & TypeScript)

The official `openai` SDKs for Python and TypeScript work with GoRoute AI Gateway by overriding `base_url` / `baseURL` to `http://localhost:8080/v1` and passing a GoRoute Virtual Key (`sk-gw-...`) as `api_key` / `apiKey`.

---

## 1. Client Initialization

<Tabs>
  <TabItem value="python" label="Python (openai)" default>

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="sk-gw-your-virtual-key",
)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript (openai)">

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:8080/v1",
  apiKey: "sk-gw-your-virtual-key",
});
```

  </TabItem>
</Tabs>

---

## 2. Chat Completions (`POST /v1/chat/completions`)

<Tabs>
  <TabItem value="python" label="Python" default>

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "Explain circuit breakers in one sentence."},
    ],
)
print(response.choices[0].message.content)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a concise assistant." },
    { role: "user", content: "Explain circuit breakers in one sentence." },
  ],
});
console.log(response.choices[0].message.content);
```

  </TabItem>
</Tabs>

---

## 3. Streaming (`stream: true`)

<Tabs>
  <TabItem value="python" label="Python" default>

```python
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Count from 1 to 5."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const stream = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Count from 1 to 5." }],
  stream: true,
});
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

  </TabItem>
</Tabs>

---

## 4. Embeddings (`POST /v1/embeddings`)

<Tabs>
  <TabItem value="python" label="Python" default>

```python
emb = client.embeddings.create(
    model="text-embedding-3-small",
    input="GoRoute AI Gateway",
)
print(len(emb.data[0].embedding))
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const emb = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: "GoRoute AI Gateway",
});
console.log(emb.data[0].embedding.length);
```

  </TabItem>
</Tabs>

---

## 5. Responses API (`POST /v1/responses` & `/openai/v1/responses`)

GoRoute implements the stateful/agentic Responses API at both `/v1/responses` and `/openai/v1/responses`:

<Tabs>
  <TabItem value="python" label="Python" default>

```python
resp = client.responses.create(
    model="gpt-4.1-mini",
    input="Summarize the benefits of micro-dollar accounting.",
)
print(resp.output_text)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const resp = await client.responses.create({
  model: "gpt-4.1-mini",
  input: "Summarize the benefits of micro-dollar accounting.",
});
console.log(resp.output_text);
```

  </TabItem>
</Tabs>

---

## 6. Realtime WebSocket (`GET /v1/realtime` & `/openai/v1/realtime`)

For bidirectional audio/text streaming over WebSockets, connect to `ws://localhost:8080/v1/realtime?model=gpt-4o-realtime-preview` (or `wss://...` in production) with `Authorization: Bearer sk-gw-your-virtual-key`:

```typescript
import WebSocket from "ws";

const ws = new WebSocket(
  "ws://localhost:8080/v1/realtime?model=gpt-4o-realtime-preview",
  {
    headers: {
      Authorization: "Bearer sk-gw-your-virtual-key",
    },
  }
);

ws.on("open", () => {
  ws.send(JSON.stringify({ type: "response.create" }));
});
```

See [Realtime WebSocket API](/docs/data-plane/realtime) and [Gateway API Reference](/docs/api-reference/gateway-api) for the full list of supported OpenAI-compatible endpoints.

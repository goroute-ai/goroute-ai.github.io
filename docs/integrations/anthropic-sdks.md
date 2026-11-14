---
id: anthropic-sdks
title: Anthropic SDKs (Python & TypeScript)
sidebar_position: 6
description: Use the official Python anthropic and TypeScript @anthropic-ai/sdk packages with GoRoute AI Gateway via /anthropic/v1/messages and count_tokens.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic SDKs (Python & TypeScript)

The official Anthropic SDKs (`anthropic` in Python and `@anthropic-ai/sdk` in TypeScript) append `/v1/messages` and `/v1/messages/count_tokens` to their configured base URL. Pointing `base_url` / `baseURL` to `http://localhost:8080/anthropic` routes requests directly to GoRoute's `/anthropic/v1/messages` and `/anthropic/v1/messages/count_tokens` endpoints.

---

## 1. Client Initialization

Pass your GoRoute Virtual Key (`sk-gw-...`) as `api_key` / `apiKey` (sent via `x-api-key`) or `auth_token` / `authToken` (sent via `Authorization: Bearer`).

<Tabs>
  <TabItem value="python" label="Python (anthropic)" default>

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:8080/anthropic",
    api_key="sk-gw-your-virtual-key",
)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript (@anthropic-ai/sdk)">

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://localhost:8080/anthropic",
  apiKey: "sk-gw-your-virtual-key",
});
```

  </TabItem>
</Tabs>

> [!NOTE]
> Avoid setting both `api_key` (`x-api-key`) and `auth_token` (`Authorization: Bearer`) to different values. GoRoute rejects conflicting credential headers with `400 ambiguous_gateway_credentials`.

---

## 2. Messages (`POST /anthropic/v1/messages`)

<Tabs>
  <TabItem value="python" label="Python" default>

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=256,
    system="You are a concise systems engineer.",
    messages=[
        {"role": "user", "content": "What is a sliding-window rate limiter?"}
    ],
)
print(message.content[0].text)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 256,
  system: "You are a concise systems engineer.",
  messages: [
    { role: "user", content: "What is a sliding-window rate limiter?" },
  ],
});
console.log(message.content[0]);
```

  </TabItem>
</Tabs>

---

## 3. Streaming Messages (`stream: true`)

<Tabs>
  <TabItem value="python" label="Python" default>

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=256,
    messages=[{"role": "user", "content": "List three Go concurrency primitives."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 256,
  messages: [{ role: "user", content: "List three Go concurrency primitives." }],
});

stream.on("text", (text) => process.stdout.write(text));
await stream.finalMessage();
```

  </TabItem>
</Tabs>

---

## 4. Token Counting (`POST /anthropic/v1/messages/count_tokens`)

GoRoute computes pre-flight token counts locally without forwarding to the upstream provider:

<Tabs>
  <TabItem value="python" label="Python" default>

```python
count = client.messages.count_tokens(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Estimate tokens for this prompt."}],
)
print(count.input_tokens)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
const count = await client.messages.countTokens({
  model: "claude-sonnet-4-20250514",
  messages: [{ role: "user", content: "Estimate tokens for this prompt." }],
});
console.log(count.input_tokens);
```

  </TabItem>
</Tabs>

See [Anthropic Messages Ingress API](/docs/data-plane/messages) for details on extended thinking blocks, tool schema translation, and alternating turn consolidation.

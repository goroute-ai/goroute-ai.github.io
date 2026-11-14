---
id: agent-frameworks
title: Agent Frameworks (LangChain, OpenAI Agents SDK & Google ADK)
sidebar_position: 7
description: Connect LangChain, OpenAI Agents SDK, and Google ADK to GoRoute AI Gateway for unified model routing, MCP tool hubs, and A2A agent dispatch.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Agent Frameworks

Agentic frameworks can route both **LLM inference** (`/v1` or `/anthropic`) and **tool/agent protocols** ([MCP](/docs/protocols/mcp-overview) and [A2A](/docs/protocols/a2a-overview)) through GoRoute AI Gateway.

---

## 1. LangChain (Python & TypeScript)

Point `ChatOpenAI` or `ChatAnthropic` at GoRoute using your Virtual Key (`sk-gw-...`):

<Tabs>
  <TabItem value="python" label="Python (langchain-openai)" default>

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="reasoning",
    base_url="http://localhost:8080/v1",
    api_key="sk-gw-your-virtual-key",
)

resp = llm.invoke("Design a fallback chain for 503 outages.")
print(resp.content)
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript (@langchain/openai)">

```typescript
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "reasoning",
  apiKey: "sk-gw-your-virtual-key",
  configuration: {
    baseURL: "http://localhost:8080/v1",
  },
});

const resp = await llm.invoke("Design a fallback chain for 503 outages.");
console.log(resp.content);
```

  </TabItem>
</Tabs>

---

## 2. OpenAI Agents SDK

The [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) works with GoRoute by passing a custom `AsyncOpenAI` client configured with `base_url="http://localhost:8080/v1"` and your Virtual Key:

```python
from openai import AsyncOpenAI
from agents import Agent, Runner, set_default_openai_client

client = AsyncOpenAI(
    base_url="http://localhost:8080/v1",
    api_key="sk-gw-your-virtual-key",
)
set_default_openai_client(client)

agent = Agent(
    name="TriageAgent",
    model="gpt-4.1-mini",
    instructions="Route infrastructure questions concisely.",
)

result = await Runner.run(agent, "How does GoRoute enforce SSRF protection?")
print(result.final_output)
```

---

## 3. Google ADK (Agent Development Kit)

In Google ADK, you can either route model calls through GoRoute's OpenAI-compatible `/v1` endpoint or expose/consume remote agents over GoRoute's **A2A v1.0** plane:

1. **Model Routing via `/v1`**:
   Set `OPENAI_BASE_URL="http://localhost:8080/v1"` and `OPENAI_API_KEY="sk-gw-your-virtual-key"` for OpenAI-compatible model wrappers, with Gemini models declared in GoRoute's `model_list` (e.g., `gemini/gemini-2.5-flash`).
2. **A2A Agent Discovery & Dispatch**:
   GoRoute serves A2A agent cards at `GET /.well-known/agent-card.json` and task endpoints under `/a2a/v1/agents/{agentSlug}/` (`POST /`, `GET /tasks`, `GET /tasks/{taskID}`, `POST /tasks/{taskID}:cancel`, `GET|POST /tasks/{taskID}:subscribe`). See [A2A Agent Cards](/docs/protocols/a2a-agent-cards).

---

## 4. Connecting Frameworks to GoRoute MCP

Any framework supporting **Streamable HTTP MCP** or **REST tool calls** can consume tools governed by GoRoute's MCP Virtual Hub:

| Protocol | Endpoint | Auth Header | Guide |
| :--- | :--- | :--- | :--- |
| **MCP Virtual Hub (All Allowed Tools)** | `POST http://localhost:8080/mcp` | `Authorization: Bearer sk-gw-...` | [MCP Hub & REST](/docs/protocols/mcp-hub-and-rest) |
| **Scoped MCP Server** | `POST http://localhost:8080/mcp/{serverSlug}` | `Authorization: Bearer sk-gw-...` | [MCP Overview](/docs/protocols/mcp-overview) |
| **Curated MCP Toolset** | `POST http://localhost:8080/mcp/toolsets/{toolsetSlug}` | `Authorization: Bearer sk-gw-...` | [Progressive Discovery](/docs/protocols/mcp-progressive-discovery) |
| **MCP REST Bridge** | `GET /mcp-rest/tools/list`, `POST /mcp-rest/tools/call` | `Authorization: Bearer sk-gw-...` | [MCP Hub & REST](/docs/protocols/mcp-hub-and-rest) |

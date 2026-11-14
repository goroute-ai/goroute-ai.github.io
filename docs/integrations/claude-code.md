---
id: claude-code
title: Claude Code
sidebar_position: 2
description: Configure Anthropic Claude Code to route inference, token counting, and MCP tool calls through GoRoute AI Gateway.
---

# Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) uses the Anthropic Messages API (`/v1/messages`) and token counting (`/v1/messages/count_tokens`). GoRoute exposes both endpoints under `/anthropic/v1/*`, so setting `ANTHROPIC_BASE_URL` to `<GATEWAY_URL>/anthropic` routes all Claude Code traffic through your gateway with full Virtual Key budgets, RBAC, guardrails, and observability.

---

## 1. Prerequisites

1. A running GoRoute AI Gateway instance (for example, `http://localhost:8080`).
2. At least one Anthropic model (or alias such as `claude-sonnet-4-20250514` or `reasoning`) configured in `model_list` or via `/admin/v1/models`.
3. A Virtual Key (`sk-gw-...`) with permission to access the configured model(s).

---

## 2. Environment Configuration

Export `ANTHROPIC_BASE_URL` and your GoRoute Virtual Key before launching `claude`:

```bash
export ANTHROPIC_BASE_URL="http://localhost:8080/anthropic"
export ANTHROPIC_AUTH_TOKEN="sk-gw-your-virtual-key"
```

Alternatively, if you use `ANTHROPIC_API_KEY` (which Claude Code sends via `x-api-key`), set:

```bash
export ANTHROPIC_BASE_URL="http://localhost:8080/anthropic"
export ANTHROPIC_API_KEY="sk-gw-your-virtual-key"
```

> [!WARNING]
> Do not set **both** `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_API_KEY` to different values in the same shell. GoRoute validates both `Authorization: Bearer` and `x-api-key` and returns `400 ambiguous_gateway_credentials` if they conflict.

Launch Claude Code:

```bash
claude
```

---

## 3. Model Mapping & Aliases

If your organization uses GoRoute unified aliases (e.g., `fast`, `reasoning`) or routes Claude Code requests to non-Anthropic backends via GoRoute's Anthropic-to-canonical translator, pass `--model` or set `ANTHROPIC_MODEL`:

```bash
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"
claude --model reasoning
```

GoRoute's `/anthropic/v1/messages` handler normalizes system blocks, `extended_thinking` budgets, and parallel `tool_result` turns automatically. See [Anthropic Messages Ingress API](/docs/data-plane/messages) for translation details.

---

## 4. Connecting Claude Code to GoRoute MCP

You can also point Claude Code at GoRoute's [MCP Virtual Hub](/docs/protocols/mcp-hub-and-rest) so MCP tool calls inherit your Virtual Key RBAC and sandboxing:

```json
{
  "mcpServers": {
    "goroute-hub": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": {
        "Authorization": "Bearer sk-gw-your-virtual-key"
      }
    }
  }
}
```

---

## 5. Verification

Confirm the `/anthropic/v1/messages` route responds with your Virtual Key before starting a session:

```bash
curl -sS http://localhost:8080/anthropic/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-gw-your-virtual-key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "Say hello in one word."}]
  }'
```

For repository-level agent workflow patterns (`CLAUDE.md`, `.claude/rules/`, and `AGENTS.md`), see [Engineering Guide for Coding Agents](/docs/operations/claude-code-and-agents).

---
id: cursor-and-ides
title: Cursor, Continue & Cline
sidebar_position: 3
description: Connect Cursor, Continue.dev, and Cline IDE extensions to GoRoute AI Gateway over /v1 with Virtual Keys.
---

# Cursor, Continue & Cline

AI-native editors and IDE extensions connect to GoRoute AI Gateway through its OpenAI-compatible `/v1` data plane (`POST /v1/chat/completions`, `GET /v1/models`). Centralizing IDE traffic through GoRoute gives engineering teams unified model aliases, per-developer Virtual Keys, spend caps, and zero-leakage log scrubbing.

---

## Cursor

Cursor supports custom OpenAI-compatible base URLs in **Settings → Models**:

1. Open **Cursor Settings** (`Cmd+,` / `Ctrl+,`) → **Models**.
2. Expand **OpenAI API Key** and enable **Override OpenAI Base URL**.
3. Set the base URL to your GoRoute `/v1` endpoint:
   ```text
   https://gateway.example.com/v1
   ```
   *(For local development without TLS, use `http://localhost:8080/v1`; note that Cursor's cloud-proxied features require a publicly reachable HTTPS endpoint such as a tunnel or ingress.)*
4. Paste your GoRoute Virtual Key (`sk-gw-...`) into **OpenAI API Key** and click **Verify**.
5. Add the model names or aliases configured in your GoRoute `model_list` (for example `gpt-4o`, `claude-sonnet-4-20250514`, or `reasoning`).

---

## Continue (`config.yaml` / `config.json`)

[Continue](https://docs.continue.dev/) supports GoRoute directly via its `openai` provider with `apiBase`.

```yaml title="~/.continue/config.yaml"
name: GoRoute Workspace
version: 1.0.0
schema: v1
models:
  - name: GoRoute Reasoning
    provider: openai
    model: reasoning
    apiBase: http://localhost:8080/v1
    apiKey: sk-gw-your-virtual-key
  - name: GoRoute Fast Autocomplete
    provider: openai
    model: fast
    apiBase: http://localhost:8080/v1
    apiKey: sk-gw-your-virtual-key
    roles:
      - autocomplete
```

---

## Cline (VS Code / Cursor Extension)

[Cline](https://github.com/cline/cline) supports both OpenAI-compatible and Anthropic-compatible providers:

### Option A: OpenAI Compatible (Recommended for Multi-Provider Aliases)

1. Open Cline **Settings** (gear icon).
2. Set **API Provider** to **OpenAI Compatible**.
3. Set **Base URL** to `http://localhost:8080/v1`.
4. Set **API Key** to your Virtual Key (`sk-gw-...`).
5. Set **Model ID** to any model or alias configured in GoRoute (e.g., `claude-sonnet-4-20250514` or `gpt-4o`).

### Option B: Anthropic Native Mode

1. Set **API Provider** to **Anthropic**.
2. Enable **Use custom base URL** and set it to `http://localhost:8080/anthropic`.
3. Set **Anthropic API Key** to your Virtual Key (`sk-gw-...`).

---

## Verifying IDE Connectivity

Confirm your Virtual Key can list models and complete a chat request against `/v1`:

```bash
curl -sS http://localhost:8080/v1/models \
  -H "Authorization: Bearer sk-gw-your-virtual-key"
```

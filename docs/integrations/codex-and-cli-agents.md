---
id: codex-and-cli-agents
title: Codex CLI, Gemini CLI & OpenWebUI
sidebar_position: 4
description: Route OpenAI Codex CLI, Gemini CLI, and OpenWebUI through GoRoute AI Gateway via /v1 and /v1/responses.
---

# Codex CLI, Gemini CLI & OpenWebUI

Terminal coding agents and self-hosted chat frontends can point directly at GoRoute's `/v1` endpoints using standard OpenAI-compatible environment variables and Virtual Keys (`sk-gw-...`).

---

## OpenAI Codex CLI

[Codex CLI](https://github.com/openai/codex) uses the OpenAI Responses API (`/v1/responses`) and Chat Completions (`/v1/chat/completions`), both of which GoRoute serves under `/v1` and `/openai/v1`.

### Environment Variables

```bash
export OPENAI_BASE_URL="http://localhost:8080/v1"
export OPENAI_API_KEY="sk-gw-your-virtual-key"
codex --model gpt-4.1
```

### TOML Configuration (`~/.codex/config.toml`)

```toml title="~/.codex/config.toml"
model = "gpt-4.1"
model_provider = "goroute"

[model_providers.goroute]
name = "GoRoute AI Gateway"
base_url = "http://localhost:8080/v1"
env_key = "GOROUTE_API_KEY"
wire_api = "responses"
```

Then export your Virtual Key and run `codex`:

```bash
export GOROUTE_API_KEY="sk-gw-your-virtual-key"
codex
```

---

## Gemini CLI

When using Gemini models configured in GoRoute (such as `gemini/gemini-2.5-flash`), you can route OpenAI-compatible CLI workflows through `/v1`:

```bash
export OPENAI_BASE_URL="http://localhost:8080/v1"
export OPENAI_API_KEY="sk-gw-your-virtual-key"
```

If you are calling GoRoute directly from scripts or tools expecting a Gemini model alias, configure the model in `config.yaml`:

```yaml
model_list:
  - model_name: gemini-2.5-flash
    model_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
```

GoRoute's Gemini adapter translates `/v1/chat/completions` and `/v1/embeddings` requests into native Gemini API calls while enforcing Virtual Key budgets and SSRF egress policies.

---

## OpenWebUI

[OpenWebUI](https://docs.openwebui.com/) connects to GoRoute as an OpenAI-compatible backend, automatically discovering available models via `GET /v1/models`.

### Docker Environment Variables

```bash
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL="http://host.docker.internal:8080/v1" \
  -e OPENAI_API_KEY="sk-gw-your-virtual-key" \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### Admin Panel Configuration

1. Sign in to OpenWebUI as an administrator and go to **Admin Panel → Settings → Connections**.
2. Under **OpenAI API**, set:
   - **URL**: `http://localhost:8080/v1` (or your cluster service URL, e.g., `http://ai-gateway:8080/v1`)
   - **API Key**: `sk-gw-your-virtual-key`
3. Click **Verify Connection** to load your GoRoute model catalog.

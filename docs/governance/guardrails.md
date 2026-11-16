---
title: Organization Guardrails
sidebar_position: 4
description: Configure request blocking, secret and PII handling, and output redaction for an organization.
keywords: [organization guardrails, PII redaction, secret scanning, streaming guardrails, logging_only mode]
---

# Organization Guardrails

The gateway supports organization-scoped checks for prompt-injection signatures, blocked keywords, credential-like strings, and selected PII patterns. Policies are managed through the admin API and applied to chat requests. These checks are pattern based; they are not a replacement for application validation, provider safety controls, or a comprehensive DLP system.

## Configure a policy

Use the master admin key to set a policy for an organization:

```bash
curl -X POST http://localhost:8080/admin/v1/organizations/org_default/guardrails \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "enforce",
    "enable_prompt_injection": true,
    "prompt_injection_action": "block",
    "enable_pii_detection": true,
    "pii_action": "redact",
    "enable_secret_detection": true,
    "secret_action": "redact",
    "blocked_keywords": ["restricted-project"],
    "redact_output_pii": true
  }'
```

Read the saved policy with `GET /admin/v1/organizations/{orgID}/guardrails`.

## Actions, Modes, and Coverage

- **Policy Modes**: Set `"mode": "enforce"` (default) to block or redact violations, or `"mode": "logging_only"` to audit violations in structured logs without blocking or mutating payloads.
- **Actions**: Prompt-injection, secret, and PII checks support `block`, `redact`, or `audit` actions. Blocked keywords block matching content across all scanned roles.
- **Input & Output Coverage**: The engine scans **all message roles** (`system`, `developer`, `user`, `assistant`, `tool`) on supported inference endpoints, blocks or redacts non-streaming outputs, inspects and redacts **streaming SSE chunks** (`internal/guardrails/stream_filter.go`), and enforces inbound/outbound guardrails on **A2A** and **MCP** traffic.
- **Fail-Closed Policy Lookups**: If guardrail policy retrieval fails, the gateway fails closed rather than bypassing safety checks.
- **Provider-Neutral Scanner Hooks**: Embedders using the Go SDK or server can register custom external scanners via `ConfigureGuardrailScanners(timeout, failClosed, scanners...)`.

Guardrail violations are recorded in logs and organization policy changes are written to the audit log. See the [admin API reference](/docs/api/admin-api) and [virtual-key security guide](/docs/governance/virtual-keys).

---

## Two-Layer Guardrails Engine (`v1.8.0`)

In `v1.8.0`, GoRoute expands baseline org policies into a full **Two-Layer Guardrails Engine** supporting tenant-scoped `guardrail_definitions` (AES-256-GCM Vault encrypted) and hierarchical `guardrail_bindings` (`Org` → `Team` → `VirtualKey` → `EndUser` → `ModelGroup` → `Tag`, with `default_on` and anti-bypass `is_locked`):

- **19 Built-In Drivers**: `openai_moderation`, `bedrock` (SigV4), `azure/prompt_shield`, `azure/text_moderations`, `model_armor`, `presidio`, `lakera_v2`, `guardrails_ai`, `pangea`, `local_content_filter`, `generic_http` webhooks, sandboxed Starlark `custom_code` (`50,000`-step cap, zero filesystem/import access, SSRF-checked `http_get`/`http_post`), `tool_permission`, `tool_policy` (cross-turn taint tracking), `block_code_execution`, `mcp_security`, `mcp_end_user_permission`, `llm_as_a_judge`, and `decision_model`.
- **7 Execution Hooks**: `pre_call`, concurrent canceling `during_call`, `post_call`, async `logging_only`, `pre_mcp_call`, `during_mcp_call`, and `post_mcp_call`, plus cross-chunk `StreamWindowEvaluator` masking and streamed `delta.tool_calls` scanning.
- **Standalone Evaluation Endpoint**: `POST /v1/guardrails/apply` evaluates inputs, outputs, or tool calls directly against Pipeline v2 without dispatching to an upstream LLM.
- **Public Go SDK Extensibility**: Register custom in-process scanners via `gateway.WithGuardrailScanner(name, scanner, opts...)` (`allow` / `block` / `flag` / `modify`).
- **Operator Console & Telemetry**: Manage named registries, Starlark rules, tool trust policies, and micro-dollar usage rollups in the 4-Tab Guardrails Console at `/ui/`, backed by `guardrail.evaluate` OpenTelemetry spans and `gateway_guardrail_*` Prometheus metrics.

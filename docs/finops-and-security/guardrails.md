---
title: Organization Guardrails
description: Configure request blocking, secret and PII handling, and output redaction for an organization.
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

Guardrail violations are recorded in logs and organization policy changes are written to the audit log. See the [admin API reference](/docs/api-reference/admin-api) and [virtual-key security guide](/docs/finops-and-security/virtual-keys).

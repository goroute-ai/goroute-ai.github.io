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

## Actions and coverage

Prompt-injection, secret, and PII checks support `block`, `redact`, or `audit` actions. Blocked keywords currently block matching user-message content. Output sanitization can redact recognized PII and secret patterns when enabled.

The implementation scans user-role messages. It detects a defined set of prompt-injection phrases, configured blocked keywords, supported API-key patterns, email addresses, SSNs, and payment-card-like numbers. It does not establish whether arbitrary text is sensitive or whether a prompt is malicious. Test the policy with representative content before relying on it in a workflow.

Guardrail violations are recorded in logs and organization policy changes are written to the audit log. See the [admin API reference](/docs/api-reference/admin-api) and [virtual-key security guide](/docs/finops-and-security/virtual-keys).

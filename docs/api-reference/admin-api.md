---
title: Admin Control Plane API Reference
sidebar_position: 3
description: Comprehensive reference for all 12 GoRoute AI Gateway admin control plane endpoint groups with full cURL examples and JSON schemas.
---

# Admin Control Plane API Reference

The GoRoute Admin Control Plane (`/admin/v1/*`) provides unified APIs for tenant organization onboarding, multi-tenant RBAC, virtual key issuance, encrypted credential vault management, dynamic model routing, security guardrails, FinOps ledgers, and health probing.

> [!NOTE]
> All admin routes require authentication using the Master Admin Key (`GATEWAY_MASTER_ADMIN_KEY`):
> ```http
> Authorization: Bearer sk-gw-master-admin-secret-key
> ```

---

## Control Plane Groups Summary

| # | Group | Primary Endpoints | Core Function |
| :--- | :--- | :--- | :--- |
| 1 | **Organizations** | `POST/GET /admin/v1/organizations` | Tenant org creation and budget caps |
| 2 | **Subscriptions** | `POST/GET /admin/v1/organizations/{orgID}/subscriptions` | Layer 2 provider enablement |
| 3 | **Model Policies** | `POST/GET /admin/v1/organizations/{orgID}/models` | Layer 3 org model overrides and token ceilings |
| 4 | **Guardrails & Simulator** | `POST/GET /admin/v1/organizations/{orgID}/guardrails`, `/simulate` | PII redaction, secret scanning, stateless testing |
| 5 | **Teams** | `POST/GET /admin/v1/teams` | Departmental team isolation and model scopes |
| 6 | **Users** | `POST/GET /admin/v1/users` | User directory and role-based permissions |
| 7 | **Virtual API Keys** | `POST/GET /admin/v1/keys`, `POST .../revoke`, `DELETE` | Scoped API key issuance and instant revocation |
| 8 | **Credentials Vault** | `POST/GET /admin/v1/credentials`, `/validate`, `.../rotate` | AES-256-GCM encrypted provider secrets vault |
| 9 | **Model Groups & Deployments** | `POST/GET /admin/v1/model-groups`, `/deployments` | Virtual aliases, EWMA balancers, weight matrices |
| 10 | **Model Catalogue & Pricing** | `GET/POST /admin/v1/catalogue`, `/sync`, `/pricing` | 4,627+ model dataset and verified pricing audits |
| 11 | **Telemetry & Health Probes** | `GET /admin/v1/observability/metrics`, `/health/deployments`, `/cache/invalidate` | EWMA latencies, synthetic probes, cache purges |
| 12 | **FinOps & Audit Logs** | `GET /admin/v1/spend/summary`, `/spend/logs`, `/audit/logs` | Micro-dollar accounting ledgers and governance trails |

---

## 1. Organizations

Manages enterprise tenants, baseline micro-dollar budgets, and spend reset intervals.

### Create Organization (`POST /admin/v1/organizations`)

```bash
curl -X POST http://localhost:8080/admin/v1/organizations \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "org_acme",
    "name": "Acme Corporation",
    "max_budget_micros": 500000000,
    "budget_reset_period": "monthly"
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "org_acme",
  "name": "Acme Corporation",
  "max_budget_micros": 500000000,
  "budget_reset_period": "monthly",
  "is_active": true,
  "created_at": "2026-11-10T12:00:00Z"
}
```

### List Organizations (`GET /admin/v1/organizations`)

```bash
curl http://localhost:8080/admin/v1/organizations \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "id": "org_acme",
      "name": "Acme Corporation",
      "max_budget_micros": 500000000,
      "budget_reset_period": "monthly",
      "is_active": true
    }
  ]
}
```

---

## 2. Organization Subscriptions (Layer 2 Access Control)

Controls which upstream cloud providers (OpenAI, Anthropic, Gemini, Mistral, Cohere) a tenant is authorized to invoke.

### Configure Provider Subscription (`POST /admin/v1/organizations/{orgID}/subscriptions`)

```bash
curl -X POST http://localhost:8080/admin/v1/organizations/org_acme/subscriptions \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "is_enabled": true
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "org_id": "org_acme",
  "provider": "anthropic",
  "is_enabled": true,
  "updated_at": "2026-11-10T12:05:00Z"
}
```

### Get Organization Subscriptions (`GET /admin/v1/organizations/{orgID}/subscriptions`)

```bash
curl http://localhost:8080/admin/v1/organizations/org_acme/subscriptions \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "data": [
    { "provider": "anthropic", "is_enabled": true },
    { "provider": "gemini", "is_enabled": true },
    { "provider": "openai", "is_enabled": false }
  ]
}
```

---

## 3. Organization Model Policies (Layer 3 Access Control)

Defines org-level model availability overrides and hard caps on output token generation.

### Set Model Policy (`POST /admin/v1/organizations/{orgID}/models`)

```bash
curl -X POST http://localhost:8080/admin/v1/organizations/org_acme/models \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "global_model_id": "anthropic/claude-3-5-sonnet-20241022",
    "is_enabled": true,
    "max_tokens_override": 4096
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "org_id": "org_acme",
  "global_model_id": "anthropic/claude-3-5-sonnet-20241022",
  "is_enabled": true,
  "max_tokens_override": 4096,
  "updated_at": "2026-11-10T12:10:00Z"
}
```

### List Model Policies (`GET /admin/v1/organizations/{orgID}/models`)

```bash
curl http://localhost:8080/admin/v1/organizations/org_acme/models \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 4. Security Guardrails & Simulator

Configures regex-based Personally Identifiable Information (PII) redaction, secret scanning (e.g. AWS secrets, GitHub tokens, OpenAI keys), and prompt injection filters.

### Set Guardrail Policy (`POST /admin/v1/organizations/{orgID}/guardrails`)

```bash
curl -X POST http://localhost:8080/admin/v1/organizations/org_acme/guardrails \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "enable_secret_detection": true,
    "secret_action": "redact",
    "enable_pii_detection": true,
    "pii_action": "redact",
    "custom_regex_patterns": ["ACME-[0-9]{6}"]
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "org_id": "org_acme",
  "enable_secret_detection": true,
  "secret_action": "redact",
  "enable_pii_detection": true,
  "pii_action": "redact",
  "custom_regex_patterns": ["ACME-[0-9]{6}"]
}
```

### Retrieve Guardrail Policy (`GET /admin/v1/organizations/{orgID}/guardrails`)

```bash
curl http://localhost:8080/admin/v1/organizations/org_acme/guardrails \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Stateless Guardrails Simulator (`POST /admin/v1/organizations/{orgID}/guardrails/simulate`)

Tests safety rules against sample prompts without saving records or incurring upstream LLM token costs:

```bash
curl -X POST http://localhost:8080/admin/v1/organizations/org_acme/guardrails/simulate \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Here is my secret sk-proj-1234567890abcdef and SSN 000-11-2222 for ticket ACME-102938",
    "policy": {
      "enable_secret_detection": true,
      "secret_action": "redact",
      "enable_pii_detection": true,
      "pii_action": "redact",
      "custom_regex_patterns": ["ACME-[0-9]{6}"]
    }
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "allowed": true,
  "applied_action": "redact",
  "violations": ["secret_detected", "pii_detected", "custom_pattern_matched"],
  "redacted": true,
  "redacted_prompt": "Here is my secret [REDACTED_SECRET] and SSN [REDACTED_SSN] for ticket [REDACTED_CUSTOM]"
}
```

---

## 5. Teams

Isolates departments or project teams within an organization, assigning dedicated budgets and model subsets.

### Create Team (`POST /admin/v1/teams`)

```bash
curl -X POST http://localhost:8080/admin/v1/teams \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_acme",
    "name": "core-platform",
    "max_budget_micros": 100000000,
    "allowed_models": ["fast", "reasoning", "anthropic/claude-3-5-sonnet-20241022"]
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "team_core_plat",
  "org_id": "org_acme",
  "name": "core-platform",
  "max_budget_micros": 100000000,
  "allowed_models": ["fast", "reasoning", "anthropic/claude-3-5-sonnet-20241022"],
  "created_at": "2026-11-10T12:15:00Z"
}
```

### List Teams (`GET /admin/v1/teams?org_id={orgID}`)

```bash
curl "http://localhost:8080/admin/v1/teams?org_id=org_acme" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 6. Users

Manages human developers, service accounts, and enterprise roles (`admin`, `developer`, `finance_auditor`).

### Create User (`POST /admin/v1/users`)

```bash
curl -X POST http://localhost:8080/admin/v1/users \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_acme",
    "team_id": "team_core_plat",
    "email": "engineer@acme.com",
    "role": "developer"
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "usr_99182ab",
  "org_id": "org_acme",
  "team_id": "team_core_plat",
  "email": "engineer@acme.com",
  "role": "developer",
  "created_at": "2026-11-10T12:20:00Z"
}
```

### List Users (`GET /admin/v1/users?org_id={orgID}`)

```bash
curl "http://localhost:8080/admin/v1/users?org_id=org_acme" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 7. Virtual API Keys (Layer 4 Access Control)

Issues high-entropy virtual keys (`sk-gw-...`) with budget caps, RPM/TPM sliding windows, and granular model allowlists.

### Issue Virtual Key (`POST /admin/v1/keys`)

```bash
curl -X POST http://localhost:8080/admin/v1/keys \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_acme",
    "team_id": "team_core_plat",
    "name": "orders-service-prod",
    "role": "service_account",
    "max_budget_micros": 50000000,
    "rate_limit_rpm": 1200,
    "rate_limit_tpm": 600000,
    "allowed_models": ["fast", "gemini-2.5-flash"],
    "allowed_mcp_servers": ["github-tools"],
    "allowed_a2a_agents": ["analyst-agent"]
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "key_0192ab4f",
  "org_id": "org_acme",
  "team_id": "team_core_plat",
  "name": "orders-service-prod",
  "key": "sk-gw-prod-7f9a2b8c4d1e2f3a",
  "key_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "max_budget_micros": 50000000,
  "rate_limit_rpm": 1200,
  "rate_limit_tpm": 600000,
  "allowed_models": ["fast", "gemini-2.5-flash"],
  "created_at": "2026-11-10T12:25:00Z"
}
```

> [!CAUTION]
> The plain-text key `key` is returned only once at creation time. GoRoute stores only the SHA-256 digest `key_hash`.

### List Virtual Keys (`GET /admin/v1/keys?org_id={orgID}`)

```bash
curl "http://localhost:8080/admin/v1/keys?org_id=org_acme" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Revoke Virtual Key (`POST /admin/v1/keys/{keyID}/revoke` or `DELETE`)

Instantly purges key permissions from L1 in-memory caches and Redis keyspace:

```bash
curl -X POST http://localhost:8080/admin/v1/keys/key_0192ab4f/revoke \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "id": "key_0192ab4f",
  "status": "revoked"
}
```

---

## 8. Provider Credentials Vault

Manages upstream provider API keys encrypted at rest with AES-256-GCM. Provides live preflight validation and zero-downtime key rotation.

### Create Credential (`POST /admin/v1/credentials`)

```bash
curl -X POST http://localhost:8080/admin/v1/credentials \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_acme",
    "provider": "openai",
    "api_key": "sk-proj-prod-secret-api-key",
    "base_url": "https://api.openai.com/v1"
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "cred_0198aa2b",
  "org_id": "org_acme",
  "provider": "openai",
  "base_url": "https://api.openai.com/v1",
  "is_valid": true,
  "created_at": "2026-11-10T12:30:00Z"
}
```

### List Credentials (`GET /admin/v1/credentials`)

```bash
curl http://localhost:8080/admin/v1/credentials \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

> [!NOTE]
> All returned credentials mask secrets (e.g. `sk-proj-***`).

### Preflight Credential Validation (`POST /admin/v1/credentials/validate`)

Validates raw credentials against the upstream vendor API *before* storing them in the vault:

```bash
curl -X POST http://localhost:8080/admin/v1/credentials/validate \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "api_key": "sk-proj-prod-secret-api-key",
    "base_url": "https://api.openai.com/v1"
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "valid": true,
  "validation_status": "success",
  "discovered_models": 34,
  "latency_ms": 118
}
```

### Rotate Credential (`POST /admin/v1/credentials/{credID}/rotate`)

Atomically updates the secret key with zero connection interruption:

```bash
curl -X POST http://localhost:8080/admin/v1/credentials/cred_0198aa2b/rotate \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk-proj-new-rotated-secret-key"
  }'
```

### Validate Stored Credential (`POST /admin/v1/credentials/{credID}/validate`)

Tests an already-persisted vault credential:

```bash
curl -X POST http://localhost:8080/admin/v1/credentials/cred_0198aa2b/validate \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 9. Model Groups & Deployments

Configures logical routing groups (aliases) and physical model deployment matrices.

### Create Model Group (`POST /admin/v1/model-groups`)

```bash
curl -X POST http://localhost:8080/admin/v1/model-groups \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fast",
    "routing_strategy": "weighted-shuffle",
    "fallback_group_ids": ["reasoning"]
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "mg_fast_019",
  "name": "fast",
  "routing_strategy": "weighted-shuffle",
  "fallback_group_ids": ["reasoning"]
}
```

### Create Deployment (`POST /admin/v1/deployments`)

Adds a model deployment to a group with priority, weight, and rate limit capacities:

```bash
curl -X POST http://localhost:8080/admin/v1/deployments \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model_group_id": "mg_fast_019",
    "global_model_id": "gemini/gemini-2.5-flash",
    "credential_id": "cred_gemini_vault",
    "priority": 1,
    "weight": 70,
    "rpm_capacity": 2000,
    "tpm_capacity": 2000000
  }'
```

#### Response (`HTTP 201 Created`)
```json
{
  "id": "dep_0192cd",
  "model_group_id": "mg_fast_019",
  "global_model_id": "gemini/gemini-2.5-flash",
  "priority": 1,
  "weight": 70,
  "health_state": "CLOSED"
}
```

### List Deployments (`GET /admin/v1/deployments?model_group_id={groupID}`)

```bash
curl "http://localhost:8080/admin/v1/deployments?model_group_id=mg_fast_019" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 10. Model Catalogue & Pricing Provenance

Explores the embedded 4,627-model database, synchronizes upstream models, and updates verified pricing rates.

### Query Catalogue (`GET /admin/v1/catalogue?provider={provider}&search={query}`)

```bash
curl "http://localhost:8080/admin/v1/catalogue?provider=anthropic&search=claude-3-5" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Import Embedded Models (`POST /admin/v1/catalogue/import?provider={provider}`)

```bash
curl -X POST "http://localhost:8080/admin/v1/catalogue/import?provider=gemini" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Update Model Pricing (`POST /admin/v1/catalogue/pricing`)

Promotes pricing status to `"verified"` with contract provenance:

```bash
curl -X POST http://localhost:8080/admin/v1/catalogue/pricing \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "global_model_id": "gemini/gemini-2.5-flash",
    "input_cost_micros_per_1m": 150000,
    "output_cost_micros_per_1m": 600000,
    "cached_input_cost_micros_per_1m": 37500,
    "pricing_status": "verified",
    "pricing_provenance_source": "official-vendor-pricing-2025",
    "pricing_effective_date": "2025-11-01"
  }'
```

### Pricing Revision Audit Trail (`GET /admin/v1/catalogue/pricing?global_model_id={modelID}`)

```bash
curl "http://localhost:8080/admin/v1/catalogue/pricing?global_model_id=gemini/gemini-2.5-flash" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

---

## 11. Telemetry, Health Probes & Cache Invalidation

Monitors runtime latency, executes synthetic probes across deployments, and purges response or virtual key caches.

### Metrics Snapshot (`GET /admin/v1/observability/metrics`)

Returns real-time JSON metrics with latency percentiles and cache hit ratios:

```bash
curl http://localhost:8080/admin/v1/observability/metrics \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "total_requests": 142850,
  "latency_p50_ms": 1.45,
  "latency_p95_ms": 3.12,
  "latency_p99_ms": 4.88,
  "cache_hit_ratio": 0.428,
  "active_circuit_breakers": {
    "closed": 12,
    "half_open": 1,
    "open": 0
  }
}
```

### Deployment Health States (`GET /admin/v1/health/deployments`)

```bash
curl http://localhost:8080/admin/v1/health/deployments \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Trigger Synthetic Health Probes (`POST /admin/v1/health/probe`)

```bash
curl -X POST http://localhost:8080/admin/v1/health/probe \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

### Cache Invalidation (`POST /admin/v1/cache/invalidate`)

Purges cached virtual keys or exact-match response cache keys:

```bash
curl -X POST http://localhost:8080/admin/v1/cache/invalidate \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_acme",
    "key_id": "key_0192ab4f"
  }'
```

#### Response (`HTTP 200 OK`)
```json
{
  "status": "cache_invalidated",
  "purged_entries": 1
}
```

---

## 12. FinOps Spend & Governance Audit Logs

Access real-time spend analytics and immutable regulatory audit logs.

### Spend Summary (`GET /admin/v1/spend/summary?org_id={orgID}&team_id={teamID}`)

```bash
curl "http://localhost:8080/admin/v1/spend/summary?org_id=org_acme" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "org_id": "org_acme",
  "total_spend_micros": 48291000,
  "budget_max_micros": 500000000,
  "budget_remaining_micros": 451709000,
  "spend_by_model": {
    "gemini/gemini-2.5-flash": 12450000,
    "anthropic/claude-3-5-sonnet-20241022": 35841000
  }
}
```

### Spend Logs (`GET /admin/v1/spend/logs?org_id={orgID}&limit={limit}&offset={offset}`)

```bash
curl "http://localhost:8080/admin/v1/spend/logs?org_id=org_acme&limit=10" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "request_id": "req_991efda4-7fab-4b03",
      "trace_id": "bad98e7deea34d7c810a963d9ed2c4ef",
      "model": "gemini-2.5-flash",
      "provider": "gemini",
      "cost_micros": 45,
      "prompt_tokens": 24,
      "completion_tokens": 42,
      "cached_tokens": 0,
      "created_at": "2026-11-10T12:40:00Z"
    }
  ],
  "total": 1
}
```

### Governance Audit Logs (`GET /admin/v1/audit/logs?org_id={orgID}&limit={limit}`)

```bash
curl "http://localhost:8080/admin/v1/audit/logs?org_id=org_acme&limit=10" \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

#### Response (`HTTP 200 OK`)
```json
{
  "data": [
    {
      "actor_id": "admin",
      "action": "virtual_key.issued",
      "resource": "virtual_key",
      "resource_id": "key_0192ab4f",
      "details": { "name": "orders-service-prod", "rpm_limit": 1200 },
      "created_at": "2026-11-10T12:25:00Z"
    }
  ]
}
```

---

## Next Steps

- Explore the [Operator Web UI Guide](/docs/operations/operator-ui) to manage these resources visually.
- Review [Virtual Keys & FinOps](/docs/finops-and-security/virtual-keys) for enterprise governance patterns.
- Read [Exact-Match Caching](/docs/caching-and-limits/exact-match-cache) to optimize gateway hit ratios.

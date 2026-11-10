---
title: Scoped Virtual Keys & Quotas
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Scoped Virtual Keys & Quota Enforcement

GoRoute AI Gateway allows you to issue scoped **Virtual API Keys (`sk-gw-...`)** to applications, teams, or external clients. Virtual keys act as fine-grained policy boundaries that enforce:
- Organization & Team multi-tenancy
- Role-based permissions (Org Admin, Team Admin, Developer, Service Account)
- Strict model allowlists
- Maximum micro-dollar budget caps
- Atomic sliding-window rate limits (RPM and TPM)
- Instant multi-pod key revocation

---

## 1. Issuing a Scoped Virtual Key

<Tabs>
<TabItem value="curl" label="cURL / Admin API" default>

```bash
curl -X POST http://localhost:8080/admin/v1/keys \
  -H "Authorization: Bearer sk-gw-master-admin-default-key-change-me" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mobile-checkout-prod",
    "org_id": "org_default",
    "team_id": "team_mobile",
    "role": "developer",
    "max_budget_micros": 50000000,
    "allowed_models": ["fast", "gemini-2.5-flash"],
    "rpm_limit": 600,
    "tpm_limit": 1000000
  }'
```

</TabItem>
<TabItem value="go" label="Go SDK">

```go
vk, err := gw.CreateVirtualKey(ctx, gateway.VirtualKeyRequest{
	Name:            "mobile-checkout-prod",
	OrgID:           "org_default",
	TeamID:          "team_mobile",
	Role:            "developer",
	AllowedModels:   []string{"fast", "gemini-2.5-flash"},
	MaxBudgetMicros: 50000000, // 50,000,000 µ$ ($50.00 USD)
	RPMLimit:        600,
	TPMLimit:        1000000,
})
if err != nil {
	log.Fatal(err)
}
fmt.Println("Issued Token:", vk.Key) // Only visible upon creation!
```

</TabItem>
</Tabs>

### Creation Response (HTTP 201 Created)
```json
{
  "id": "21fc8b10-e633-477d-a3a1-32aa7f325507",
  "key": "sk-gw-45ddf8c87e91a2b3c4d5e6f708192a3b",
  "key_prefix": "sk-gw-45ddf8c8",
  "name": "mobile-checkout-prod",
  "role": "developer",
  "org_id": "org_default",
  "team_id": "team_mobile",
  "max_budget_micros": 50000000,
  "rpm_limit": 600,
  "tpm_limit": 1000000,
  "allowed_models": ["fast", "gemini-2.5-flash"],
  "is_active": true
}
```

> **Security Note**: The raw token (`sk-gw-...`) is returned **only once** upon generation. GoRoute computes a SHA-256 hash and stores only the digest in the database.

---

## 2. Instant Key Revocation (`POST /admin/v1/keys/{id}/revoke`)

To immediately terminate access for a compromised or deprecated key:

```bash
curl -X POST http://localhost:8080/admin/v1/keys/21fc8b10-e633-477d-a3a1-32aa7f325507/revoke \
  -H "Authorization: Bearer sk-gw-master-admin-default-key-change-me"
```

The gateway instantly evicts the key from in-memory L1 cache and Redis L2 cache across all cluster nodes. Any subsequent requests using that key are rejected with HTTP 401 Unauthorized within microseconds.

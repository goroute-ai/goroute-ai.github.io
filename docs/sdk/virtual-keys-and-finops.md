---
title: Virtual Keys and FinOps
sidebar_position: 4
description: Create and revoke virtual keys and query spend through the Go SDK.
keywords: [go sdk virtual keys, finops spend summary, createvirtualkey, revoke key go, budget management]
---

# Virtual Keys and FinOps

The SDK provides methods for creating and revoking virtual keys and reading the spend summary. These are administrative operations: use a client configured with the gateway admin credential and protect it as a privileged object.

## Create a virtual key

```go
key, err := adminClient.CreateVirtualKey(ctx, gateway.VirtualKeyRequest{
	Name:            "payments-service",
	OrgID:           "org_default",
	Role:            "service_account",
	MaxBudgetMicros: 25_000_000, // 25 USD
	RPMLimit:        120,
	TPMLimit:        100_000,
	AllowedModels:   []string{"fast"},
})
if err != nil {
	return err
}

// Store key.Key in an approved secret store; do not log or commit it.
fmt.Println("Created key ID:", key.ID)
```

`MaxBudgetMicros` uses micro-dollars (`1 USD = 1,000,000 µ$`). The returned `key.Key` contains the new secret and is only available in the creation response. Store it securely.

## Use a scoped key

For server-controlled application code, create a request client using the virtual key:

```go
tenantClient := gateway.NewClient(gatewayURL, key.Key)
result, err := tenantClient.Chat(ctx, "fast", "Summarize the supplied text.")
```

`WithKey` can also copy a client with a different inference key. Keep any client carrying an admin credential inside trusted server code: the copy retains the original admin key for administrative methods.

## Revoke a key

```go
if err := adminClient.RevokeVirtualKey(ctx, key.ID); err != nil {
	return err
}
```

The SDK calls the gateway's revoke endpoint. Subsequent authentication behavior depends on the gateway version and cache propagation; check the response and logs if a key still appears active.

## Read the spend summary

Use `GetSpendSummary` (added in `v1.7.0`) for a pure-SDK `*gateway.SpendSummaryResponse` with zero `internal/` package dependencies:

```go
summary, err := adminClient.GetSpendSummary(ctx)
if err != nil {
	return err
}
fmt.Printf("Requests: %d; tokens: %d; cost: %d µ$ ($%.4f; unpriced: %d)\n",
	summary.TotalRequests, summary.TotalTokens, summary.TotalCostMicros,
	summary.TotalCostUSD, summary.UnpricedRequests)
fmt.Println("Spend by provider:", summary.SpendByProvider)
```

The SDK also exposes `UpdateVirtualKey`, `RotateVirtualKey`, `UpdateTeam`, `DeleteTeam`, `UpdateUser`, `DeleteUser`, and `GetConfig` using public SDK types, plus the legacy `SpendSummary` method (which returns an internal storage type). The stable JSON API is available at `GET /admin/v1/spend/summary`; see the [cost accounting guide](/docs/finops/micro-dollar-ledger) and [Admin API reference](/docs/api/admin-api).

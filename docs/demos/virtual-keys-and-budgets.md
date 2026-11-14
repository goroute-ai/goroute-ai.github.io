---
title: Virtual Keys & Budgets
sidebar_position: 24
description: Create scoped GoRoute virtual API keys, set spend budgets, track usage in micro-dollars, and revoke keys from a runnable Go example.
---

# Virtual Keys, Budgets & FinOps Micro-Dollar Ledger

In this guide, you will issue department-scoped virtual API keys with spending caps (`MaxBudgetMicros: 10000000` = \$10.00 USD), track usage through the atomic micro-dollar ledger, and perform instant key revocation.

---

## Runnable Go Code

```go title="examples/virtual_keys_and_budgets/main.go"
package main

import (
	"context"
	"fmt"

	"github.com/goroute-ai/ai-gateway-go-docs/examples/demoutil"
	"github.com/goroute-ai/ai-gateway-go/pkg/gateway"
)

func main() {
	ctx := context.Background()
	demoutil.Banner("Virtual Keys, Budgets & FinOps Micro-Dollar Ledger")

	gw, err := gateway.New(
		gateway.WithDemoMocksIfEnvMissing(),
		gateway.WithSilentLogs(),
	)
	if err != nil {
		demoutil.Fail("Gateway initialization failed", err)
	}
	defer gw.Close()

	// Provision a department virtual key with a 10-dollar budget limit ($10.00 = 10,000,000 micros)
	keyInfo, err := gw.CreateVirtualKey(ctx, gateway.VirtualKeyRequest{
		Name:            "Engineering-Team-Key",
		Role:            "developer",
		OrgID:           "org_default",
		MaxBudgetMicros: 10000000, // 10 USD
		RPMLimit:        600,
		AllowedModels:   []string{"gemini-2.5-flash-lite", "gpt-4o-mini"},
	})
	if err != nil {
		demoutil.Fail("Failed to issue virtual key", err)
	}

	demoutil.Info("Virtual Key ID", keyInfo.ID)
	demoutil.Info("Virtual Token Prefix", keyInfo.KeyPrefix)
	demoutil.Info("Max Budget", fmt.Sprintf("$%.2f USD (%d micros)", float64(keyInfo.MaxBudgetMicros)/1e6, keyInfo.MaxBudgetMicros))
	demoutil.Info("Role Access Level", keyInfo.Role)
	demoutil.Info("Allowed Models", fmt.Sprintf("%v", keyInfo.AllowedModels))

	// Instant key revocation
	err = gw.RevokeVirtualKey(ctx, keyInfo.ID)
	if err != nil {
		demoutil.Fail("Failed to revoke virtual key", err)
	}
	demoutil.Success("FinOps Security", "Key revoked immediately; atomic ledger preserves audit trails")
	demoutil.Done()
}
```

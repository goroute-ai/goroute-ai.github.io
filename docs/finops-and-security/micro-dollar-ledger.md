---
title: Cost Accounting and Spend Records
sidebar_position: 1
description: Understand integer micro-dollar cost calculation and asynchronous spend persistence.
---

# Cost Accounting and Spend Records

The gateway represents calculated cost as integer micro-dollars: `1 USD = 1,000,000 µ$`. The calculator uses integer arithmetic and pricing values from the configured model catalogue. This avoids floating-point rounding in the gateway's accounting calculation; it does not guarantee that provider pricing metadata or reported token usage is complete or current.

## Cost calculation

For a model with pricing metadata, `CalculateCostMicros` (`internal/finops/calculator.go`) accounts for:
- **Non-cached prompt tokens** (`input_cost_micros_per_1m`)
- **Cached prompt read tokens** (`cached_input_cost_micros_per_1m`)
- **Cache-write tokens** (`CacheCreationTokens` billed at `cache_write_cost_micros_per_1m` added in migration `0012`, falling back to `input_cost_micros_per_1m` if unset)
- **Regular completion tokens** (`output_cost_micros_per_1m`)
- **Reasoning tokens** (`reasoning_cost_micros_per_1m`, falling back to `output_cost_micros_per_1m` if unset)
- **Modality-specific units** (migrations `0007` and `0012`): rerank search units (`rerank_cost_micros_per_search_unit`), image generation base/HD (`image_cost_micros_base`, `image_cost_micros_hd`), audio STT per second (`audio_stt_cost_micros_per_second`), audio TTS per 1k characters (`audio_tts_cost_micros_per_1k_chars`), and extensible `modality_pricing_json`, recorded with `modality` and `modality_units` on `spend_logs`.

Each token rate is expressed in micro-dollars per million tokens, and the total numerator is divided by one million with ceiling division so a non-zero priced request does not round down to zero. Upper-bound pre-dispatch budget reservations (`EstimateUpperBoundCostMicros`) also factor in `cache_write_cost_micros_per_1m`.

The gateway returns cost telemetry on inference responses and records spend events for later queries. If a model has no pricing record (or unverified rates), the calculator returns zero cost and increments `unpriced_requests` and `unpriced_tokens` in spend summaries (`/admin/v1/spend/summary`) so unpriced usage is never silently hidden.

## Durable Outbox, Budget Reservations & Period Rollover

- **Pre-Dispatch Upper-Bound Reservations & Lease Renewal**: Before dispatching upstream, the gateway reserves an upper-bound micro-dollar budget in Redis and renews the reservation lease for long-running or streaming requests.
- **Durable Postgres Spend Event Outbox**: Spend events are persisted through a retryable PostgreSQL outbox (`0008_add_spend_event_outbox.up.sql`) and reconciled idempotently in Redis by event ID (`gw:spend:applied:{org}`), preventing double-counting on retries.
- **Unified Modality Budget Gating**: Chat, embeddings, audio, and image requests share unified budget gating with request-sized modality estimates.
- **Automatic Budget Period Rollover**: `ResetExpiredBudgets` advances expired budget windows, synchronizes entity `spent_micros` in PostgreSQL (`0011_budget_reset_outbox.up.sql`), and clears corresponding Redis spend counters.

## Spend persistence

Spend events are queued to a buffered Go channel and processed by a background worker. The worker updates spend counters and batches durable writes to the configured repository. If the queue is full, the worker attempts a synchronous write for that event, so storage backpressure can affect a request in that exceptional case.

Batch size, flush interval, and channel size are configurable. The default values are in the gateway configuration; they are not a throughput guarantee.

## Query spend data

The admin API provides spend summary and spend log endpoints under `/admin/v1/spend`. Authenticate with an admin key:

```bash
curl http://localhost:8080/admin/v1/spend/summary \
  -H "Authorization: Bearer $GATEWAY_MASTER_ADMIN_KEY"
```

The exact summary fields follow the API response and storage implementation for the gateway version you run. See the [admin API reference](https://github.com/goroute-ai/ai-gateway-go/blob/main/docs/API_REFERENCE.md) and [virtual keys guide](/docs/finops-and-security/virtual-keys).

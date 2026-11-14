---
title: Deterministic Exact-Match Cache
sidebar_position: 3
description: Configure GoRoute's tenant-isolated exact-match response cache for deterministic requests, using SHA-256 cache keys and memory or Redis storage.
---

# Deterministic Exact-Match Response Caching

GoRoute AI Gateway embeds a tenant-isolated, deterministic exact-match response cache that serves identical queries in **0.05 milliseconds** with **zero upstream token spend**.

```mermaid
graph TD
    Request["Incoming Chat Request"] --> CheckTemp{"temperature == 0.0?"}
    CheckTemp -- "No (stochastic)" --> Upstream["Direct Upstream Inference"]
    CheckTemp -- "Yes (deterministic)" --> KeyGen["Compute SHA-256 Digest:<br/>SHA256(OrgID + Model + System + Messages + Tools)"]
    KeyGen --> Redis{"Cache HIT in Redis / Memory?"}
    Redis -- "HIT" --> FastResponse["Return Cached Response<br/>(0.05ms, $0.00 Cost, X-Gateway-Cache: HIT)"]
    Redis -- "MISS" --> Upstream
    Upstream --> Store["Store Response in Cache (TTL: 1h)"]
```

---

## 1. Deterministic Hashing Key

To guarantee tenant isolation and output correctness, the cache key is constructed using a cryptographic SHA-256 digest over all canonical output-affecting request fields (organization, model, messages, system prompt, tools, sampling/output parameters, and `extra_body`):

```text
CacheKey = SHA256(OrgID || Epoch || CanonicalRequestFields)
```

- **Tenant Isolation**: An identical prompt submitted by Org A will never be returned to Org B.
- **Cross-Replica Invalidation Epochs**: Calling `POST /admin/v1/cache/invalidate` increments a Redis-backed organization invalidation epoch (`{org:<org_id>}` hash-tagged) so cached entries are invalidated immediately across all gateway replicas.
- **Deterministic Only**: Requests with `temperature > 0.0` or non-zero randomness bypass the cache to preserve LLM creativity and variance.

---

## 2. Benchmark Comparison

| Metric | Upstream Model Call | GoRoute Cached Hit |
| :--- | :--- | :--- |
| **Response Latency** | 450 ms – 1,800 ms | **0.05 ms (50 µs)** |
| **Cost Incurred** | Full token billing ($0.001 – $0.05) | **$0.00 (Zero tokens)** |
| **Upstream Network I/O** | 100% | **0% (Bypassed)** |
| **Telemetry Header** | `X-Gateway-Cache: MISS` | `X-Gateway-Cache: HIT` |

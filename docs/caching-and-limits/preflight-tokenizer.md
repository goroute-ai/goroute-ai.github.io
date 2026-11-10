---
title: Pre-Flight Tokenizer
sidebar_position: 2
---

# Pre-Flight Tokenizer & TPM Estimation

To enforce **Tokens Per Minute (TPM)** quotas *before* dispatching expensive upstream requests, GoRoute AI Gateway runs a fast pre-flight tokenizer.

---

## 1. Why Pre-Flight Tokenization Matters

Without pre-flight token estimation, a client could submit a massive prompt (e.g. 100k tokens) that consumes your entire upstream quota before the gateway can register the spend. By estimating token volume before sending the request upstream, GoRoute reserves tokens in Redis and rejects oversized requests with HTTP 429 before incurring upstream billing.

---

## 2. Token Estimation Heuristics

The pre-flight tokenizer balances speed and accuracy using a zero-allocation scanner:

1. **Exact BPE Encoding**: For OpenAI and Mistral models, uses Byte-Pair Encoding token tables.
2. **Sub-Word Heuristic Fast Path**: For high-throughput scenarios (&lt; 5 µs target overhead), computes token approximations based on character classes, punctuation density, and whitespace boundaries:

```text
Estimated Tokens = (Byte Count / 4) * Complexity Multiplier
```

If the estimated prompt tokens + requested `max_tokens` exceeds the virtual key's available TPM quota, the request is throttled immediately.

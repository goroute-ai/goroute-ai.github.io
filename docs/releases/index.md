---
id: index
title: "Release Notes"
sidebar_position: 1
description: "GoRoute AI Gateway release history, upgrade instructions, and database migration guidance."
keywords: [goroute release notes, changelog history, upgrade guide, database migrations, semantic versioning]
---

# Release Notes

GoRoute AI Gateway follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Each release includes automated SQL schema migrations, OpenAPI contract validation, and multi-replica Kubernetes verification.

---

## Release History

| Version | Release Date | Highlights |
| :--- | :--- | :--- |
| **[v1.8.0](./v1.8.0.md)** | 2026-11-16 | Two-Layer Guardrails Engine (`19` built-in drivers, `7` hooks, Starlark `custom_code`, `WithGuardrailScanner`), `POST /v1/guardrails/apply`, tool/MCP taint tracking, Light/Dark Operator UI with 4-Tab Guardrails Console, Helm chart (`0.3.0`), and migrations `0016`–`0019`. |
| **[v1.7.0](./v1.7.0.md)** | 2026-11-14 | SSRF & media fetch hardening, pure-SDK parity (`ConnectRealtime`, `WithHTTPClient`), 63-path `specgen` parity, `round-robin` routing, Helm chart (`0.2.0`), and migrations `0013`–`0015`. |
| **[v1.6.0](./v1.6.0.md)** | 2026-11-13 | Maximum provider & model compatibility, modality FinOps, `0012` migration, hardened Kustomize manifests (`deployments/k8s/`), and containerized production test suite. |
| **[v1.5.0](./v1.5.0.md)** | 2026-11-13 | Operator RBAC & inbound JWT/OIDC, Redis Cluster/Sentinel support, durable spend outbox, shared circuit breakers, streaming guardrail redaction, and OTLP tracing. |

---

## Upgrade Guide

### 1. Review Breaking & Security Changes
Before upgrading across minor versions:
- Check the target release notes for any new required environment variables or production validation rules (for example, `v1.5.0` introduced `GATEWAY_ENV=production` default-secret rejection and disabled master-key data-plane fallback).
- Review `configs/config.example.yaml` for newly added configuration blocks.

### 2. Database Migrations
GoRoute embeds all PostgreSQL migrations (`migrations/0001_*.sql` through `0019_*.sql`) directly in the gateway binary and applies pending up-migrations atomically at startup (or via `-migrate-only` / the Helm `migration` pre-upgrade hook job).

For zero-downtime rolling upgrades in Kubernetes:
1. Ensure your PostgreSQL user has DDL permissions (`CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`) or run a pre-upgrade migration job.
2. Take a PostgreSQL snapshot before applying major schema changes (such as `0008` spend outbox, `0012` cache-write and operations columns, `0013`–`0015` user/team/org concurrency and budget limits, or `0016`–`0019` guardrails registry, tool policies, and usage metrics).
3. Upgrade the gateway image tag and monitor `/readyz` before draining old pods:

```bash
kubectl -n goroute-prod set image deployment/gateway gateway=ghcr.io/goroute-ai/ai-gateway-go:v1.8.0
kubectl -n goroute-prod rollout status deployment/gateway --timeout=120s
```

### 3. Verify Post-Upgrade Health
After rollout completes:
- Confirm `GET /healthz` and `GET /readyz` return `200 OK`.
- Run `make test-canary` against a staging environment to validate live provider routing and modality endpoints.

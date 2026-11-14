---
id: index
title: "Release Notes"
sidebar_position: 1
description: "GoRoute AI Gateway release history, upgrade instructions, and database migration guidance."
---

# Release Notes

GoRoute AI Gateway follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Each release includes automated SQL schema migrations, OpenAPI contract validation, and multi-replica Kubernetes verification.

---

## Release History

| Version | Release Date | Highlights |
| :--- | :--- | :--- |
| **[v1.6.0](./v1.6.0.md)** | 2026-11-13 | Maximum provider & model compatibility, modality FinOps, `0012` migration, hardened Kustomize manifests (`deployments/k8s/`), and containerized production test suite. |
| **[v1.5.0](./v1.5.0.md)** | 2026-11-13 | Operator RBAC & inbound JWT/OIDC, Redis Cluster/Sentinel support, durable spend outbox, shared circuit breakers, streaming guardrail redaction, and OTLP tracing. |

---

## Upgrade Guide

### 1. Review Breaking & Security Changes
Before upgrading across minor versions:
- Check the target release notes for any new required environment variables or production validation rules (for example, `v1.5.0` introduced `GATEWAY_ENV=production` default-secret rejection and disabled master-key data-plane fallback).
- Review `configs/config.example.yaml` for newly added configuration blocks.

### 2. Database Migrations
GoRoute embeds all PostgreSQL migrations (`migrations/0001_*.sql` through `0012_*.sql`) directly in the gateway binary and applies pending up-migrations atomically at startup.

For zero-downtime rolling upgrades in Kubernetes:
1. Ensure your PostgreSQL user has DDL permissions (`CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`) or run a pre-upgrade migration job.
2. Take a PostgreSQL snapshot before applying major schema changes (such as `0008` spend outbox or `0012` cache-write and operations columns).
3. Upgrade the gateway image tag and monitor `/readyz` before draining old pods:

```bash
kubectl -n goroute-prod set image deployment/gateway gateway=goroute/ai-gateway:v1.6.0
kubectl -n goroute-prod rollout status deployment/gateway --timeout=120s
```

### 3. Verify Post-Upgrade Health
After rollout completes:
- Confirm `GET /healthz` and `GET /readyz` return `200 OK`.
- Run `make test-canary` against a staging environment to validate live provider routing and modality endpoints.

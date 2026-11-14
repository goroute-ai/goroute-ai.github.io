---
id: production-checklist
title: "Production Readiness Checklist"
sidebar_position: 8
description: "Production checklist for GoRoute AI Gateway: SSRF firewall, secret validation, RBAC/OIDC, fail-closed rate limits, circuit breakers, and load testing."
---

# Production Readiness Checklist

Before promoting GoRoute AI Gateway to production traffic, verify each control below against your environment variables, `config.yaml`, and Kubernetes or container deployment manifests.

---

## 1. Environment & Secret Validation

Setting `ENV=production` or `GATEWAY_ENV=production` (or `server.environment: production`) activates strict startup validation in `Config.Validate()`:

- [ ] **Enable production mode**: Set `GATEWAY_ENV=production`.
- [ ] **Replace default Master Admin Key**: Set `GATEWAY_MASTER_ADMIN_KEY` to a high-entropy secret (must not equal `sk-gw-master-admin-default-key-change-me`).
- [ ] **Replace default Encryption Key**: Set `GATEWAY_MASTER_ENCRYPTION_KEY` to a unique 32-byte hex (64 hex characters) AES-256-GCM Key Encryption Key (must not equal `0123456789abcdef...`).
- [ ] **Replace default JWT Secret**: Set `GATEWAY_JWT_SECRET` to a strong HMAC secret (must not equal `gateway-jwt-hmac-secret-change-me`), or configure OIDC JWKS verification.
- [ ] **Enable PostgreSQL persistence**: Configure `GATEWAY_POSTGRES_DSN` with TLS (`sslmode=require` or `sslmode=verify-full`) so `storage.mode` resolves to `postgres` rather than ephemeral `memory`.

---

## 2. Outbound SSRF Firewall & Network Policy

GoRoute routes all provider, MCP, A2A, and OTLP HTTP egress through `internal/security/network`:

- [ ] **Block private networks**: Verify `security.network.outbound_ssrf.allow_private_networks` is `false` (default) and `GATEWAY_SECURITY_SSRF_ALLOW_PRIVATE` is unset or `false`.
- [ ] **Require HTTPS upstreams**: Verify `security.network.outbound_ssrf.allow_insecure_http` is `false` (default) and `GATEWAY_SECURITY_SSRF_ALLOW_INSECURE_HTTP` is unset or `false`.
- [ ] **Explicit CIDR allowlist (if needed)**: If routing to private VPC inference endpoints (e.g., internal vLLM), use `security.network.outbound_ssrf.allowed_private_cidrs` rather than opening all private networks.
- [ ] **Block cloud metadata IPs**: Ensure `169.254.169.254` remains blocked via `security.network.outbound_ssrf.blocked_ips`.
- [ ] **Restrict ingress callers**: Set `security.network.inbound_caller.allowed_client_cidrs` if the gateway sits behind a known load balancer or API gateway CIDR.

---

## 3. Operator RBAC, OIDC & HTTP Security Headers

- [ ] **Disable master-key data-plane fallback**: Confirm `auth.allow_master_key_data_plane` (`GATEWAY_ALLOW_MASTER_KEY_DATA_PLANE`) is `false` (default). Data-plane inference calls must authenticate with tenant Virtual Keys (`Authorization: Bearer sk-gw-...`).
- [ ] **Configure Inbound OIDC / JWT**: Set `auth.oidc_jwks_url` (`GATEWAY_OIDC_JWKS_URL`), `auth.jwt_issuer` (`GATEWAY_JWT_ISSUER`), and `auth.jwt_audience` (`GATEWAY_JWT_AUDIENCE`) for operator control-plane SSO.
- [ ] **Verify RBAC roles**: Assign least-privilege operator roles (`platform_admin`, `org_admin`, `org_viewer`) to users; `org_admin` and `org_viewer` are strictly scoped to their organization.
- [ ] **Enable HSTS & CORS allowlists**: Set `server.enable_hsts: true` when terminating TLS at the edge, and restrict `server.cors_allowed_origins` to your Operator UI origin instead of `*`.
- [ ] **Disable MCP stdio in production**: Keep `mcp.allow_stdio_servers: false` (enforced fail-closed by `Config.Validate()`).

---

## 4. Fail-Closed Rate Limits & Budget Enforcement

- [ ] **Enable Redis-backed rate limiting**: Confirm `rate_limit.enabled: true` (default) with `rate_limit.redis_timeout` tuned (default `50ms`) and Redis Cluster or Sentinel configured via `GATEWAY_REDIS_ADDRS`.
- [ ] **Confirm fail-closed behavior**: When Redis is unreachable or team lookups fail, GoRoute fails closed (`HTTP 429` / `503`) rather than allowing unmetered traffic.
- [ ] **Monitor unpriced usage**: Audit `unpriced_requests` and `unpriced_tokens` in FinOps spend summaries; inferred catalog rates are never treated as verified for budgeted traffic.

---

## 5. Circuit Breakers & Reliability

- [ ] **Configure shared Redis circuit breakers**: In multi-replica deployments, ensure all pods share the same Redis cluster/instance so circuit-breaker failure counts and half-open probe leases synchronize across replicas.
- [ ] **Tune breaker thresholds**: Review `router.failure_threshold` (default `3`), `router.failure_window` (default `30s`), and `router.default_cooldown` (default `60s`, or `GATEWAY_ROUTER_DEFAULT_COOLDOWN`).
- [ ] **Verify retry & fallback bounds**: Confirm `router.default_max_retries` (default `2`), `router.base_retry_delay` (`50ms`), and `router.max_retry_delay` (`2s`) match your upstream SLA budgets.

---

## 6. File Storage Quotas & Upload Concurrency

- [ ] **Enforce per-org storage quota**: Verify `server.max_file_storage_bytes_per_org` (`GATEWAY_MAX_FILE_STORAGE_BYTES_PER_ORG`, default `5 GiB`) matches your disk capacity. Requests exceeding quota return `413 storage_quota_exceeded`.
- [ ] **Bound concurrent uploads**: Keep `server.max_concurrent_file_uploads` (`GATEWAY_MAX_CONCURRENT_FILE_UPLOADS`, default `8`) bounded to protect pod memory and disk I/O (`429 upload_concurrency_limit`).
- [ ] **Mount writable temp volume**: If running with `readOnlyRootFilesystem: true` in Kubernetes, mount an `emptyDir` or PVC for multipart upload spill files.

---

## 7. Pre-Flight Load, Security & Canary Verification

Run the built-in verification suites before cutting over production traffic:

```bash
# 1. Containerized security, vulnerability, and k6 load suite
#    (gitleaks, trivy, govulncheck, k6, pgbench, redis-benchmark)
make test-prod-containers

# 2. Go load benchmarks & optional 5-minute soak test
GATEWAY_RUN_SOAK=1 make test-load

# 3. Security boundary & auth test suite
make test-security

# 4. Key-gated live provider canary checks (requires provider API keys)
make test-canary
```

:::info
See [Kubernetes & Kustomize Deployment](./kubernetes-kustomize.md) for container hardening and health probe configuration, and [Observability, Metrics & Health Probes](./observability.md) for Prometheus alerting thresholds.
:::

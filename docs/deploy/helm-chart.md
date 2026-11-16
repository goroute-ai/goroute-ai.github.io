---
id: helm-chart
title: "Helm Chart Deployment"
sidebar_position: 8
description: "Deploy GoRoute AI Gateway on Kubernetes using the official Helm chart (v0.3.0 / v1.8.0) with HPA, PDB, NetworkPolicy, and migration hooks."
keywords: [goroute helm chart, kubernetes deployment, helm values, hpa autoscaling, networkpolicy]
---

# Helm Chart Deployment

GoRoute AI Gateway ships an official Kubernetes Helm chart (`goroute`, chart version `0.3.0`, app version `1.8.0`) under [`deployments/helm/goroute/`](https://github.com/goroute-ai/ai-gateway-go/tree/main/deployments/helm/goroute) and as a packaged `.tgz` archive on the GitHub Releases page.

For raw manifests without Helm, see [Kubernetes & Kustomize Deployment](./kubernetes-kustomize.md).

---

## 1. Chart Overview & Optional Dependencies

`Chart.yaml` defines `apiVersion: v2` (`type: application`) with two optional Bitnami subchart dependencies:

| Dependency | Version Constraint | Condition Key | Default |
| :--- | :--- | :--- | :--- |
| `postgresql` | `16.x.x` (`https://charts.bitnami.com/bitnami`) | `postgresql.enabled` | `false` |
| `redis` | `20.x.x` (`https://charts.bitnami.com/bitnami`) | `redis.enabled` | `false` |

In production, keep `postgresql.enabled: false` and `redis.enabled: false` when pointing to managed PostgreSQL 16+ and Redis 7 / Cluster / Sentinel services. For single-cluster evaluations, enable both subcharts via `--set postgresql.enabled=true --set redis.enabled=true` after updating dependencies.

---

## 2. Quick Install & Upgrade

### Install from Local Chart or Release Archive

```bash
# Option A: Install directly from a release .tgz archive
helm upgrade --install goroute ./goroute-0.3.0.tgz \
  --namespace goroute-prod --create-namespace \
  --set secrets.existingSecret="goroute-prod-secrets" \
  --set migration.enabled=true

# Option B: Install from the cloned repository
helm dependency update deployments/helm/goroute
helm upgrade --install goroute deployments/helm/goroute \
  --namespace goroute-prod --create-namespace \
  -f prod-values.yaml
```

> [!WARNING]
> Default values in `values.yaml` include placeholder secrets (`changeme-master-admin-key`, sample `postgresDSN`, and sample `masterEncryptionKey`). Always set `secrets.existingSecret` (recommended) or override every `secrets.*` value via an external secret manager before deploying to production.

---

## 3. Production Security, Scaling & Networking Templates

| Template | Kind / API | Default Behavior |
| :--- | :--- | :--- |
| `templates/deployment.yaml` | `apps/v1` `Deployment` | Non-root `podSecurityContext` (`runAsNonRoot: true`, UID/GID/fsGroup `65532`), `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: ["ALL"]`, writable `/tmp` `emptyDir`, `/healthz` & `/readyz` probes, `terminationGracePeriodSeconds: 30`. |
| `templates/service.yaml` | `v1` `Service` | `ClusterIP` on port `8080` (`http`). Exposes `grpc` port on both `Service` and `Deployment` when `service.grpcPort > 0`. |
| `templates/hpa.yaml` | `autoscaling/v2` `HorizontalPodAutoscaler` | Enabled by default (`minReplicas: 2`, `maxReplicas: 10`, CPU `75%`, Memory `80%`). When enabled, static `replicaCount` is omitted from `Deployment`. |
| `templates/pdb.yaml` | `policy/v1` `PodDisruptionBudget` | Enabled by default (`minAvailable: 1`; also supports `maxUnavailable` when `minAvailable` is removed). |
| `templates/networkpolicy.yaml` | `networking.k8s.io/v1` `NetworkPolicy` | Enabled by default; restricts ingress to `service.port` (and `service.grpcPort` when `&gt; 0`, optionally scoped via `networkPolicy.ingressFrom`) and egress to DNS (`53` UDP/TCP), PostgreSQL (`5432`), Redis (`6379`), and HTTPS (`443`). |
| `templates/ingress.yaml` | `networking.k8s.io/v1` `Ingress` | Disabled by default (`ingress.enabled: false`); supports `className`, `annotations`, `hosts`, and `tls`. |
| `templates/migration-job.yaml` | `batch/v1` `Job` | Disabled by default (`migration.enabled: false`). Runs as a `pre-install,pre-upgrade` Helm hook (`hook-weight: "-5"`) executing `/app/ai-gateway -config /app/configs/config.yaml -migrate-only`. |
| `templates/secret.yaml` | `v1` `Secret` | Created only when `secrets.create: true` and `secrets.existingSecret` is empty. Injects `GATEWAY_POSTGRES_DSN`, `GATEWAY_MASTER_ADMIN_KEY`, `GATEWAY_MASTER_ENCRYPTION_KEY`, and optional `GATEWAY_JWT_SECRET` / `GATEWAY_REDIS_PASSWORD`. |

---

## 4. `values.yaml` Reference

| Key | Default | Description |
| :--- | :--- | :--- |
| `replicaCount` | `2` | Static pod count (used only when `autoscaling.enabled: false`). |
| `image.repository` | `ghcr.io/goroute-ai/ai-gateway-go` | Container image repository. |
| `image.tag` | `""` | Overrides `Chart.AppVersion` (`1.8.0`) when non-empty. |
| `image.pullPolicy` | `IfNotPresent` | Kubernetes image pull policy. |
| `service.type` | `ClusterIP` | Kubernetes Service type. |
| `service.port` | `8080` | HTTP data plane, `/admin/v1`, `/ui/`, and `/metrics` port. |
| `service.grpcPort` | `0` | Optional A2A gRPC port (`0` disables gRPC Service/container port). |
| `ingress.enabled` | `false` | Enables the `Ingress` manifest. |
| `env` | `GATEWAY_PORT: "8080"`, `GATEWAY_ENV: "production"`, `GATEWAY_STORAGE_MODE: "postgres"`, `GATEWAY_REDIS_ADDR: "redis:6379"` | Non-secret environment variables injected into the gateway and migration job pods. |
| `secrets.create` | `true` | Creates the Kubernetes `Secret` when `secrets.existingSecret` is empty. |
| `secrets.existingSecret` | `""` | Name of a pre-existing Secret containing `GATEWAY_POSTGRES_DSN`, `GATEWAY_MASTER_ADMIN_KEY`, `GATEWAY_MASTER_ENCRYPTION_KEY`, etc. |
| `resources` | `requests: 100m / 128Mi`, `limits: 1000m / 512Mi` | Gateway pod CPU and memory requests/limits. |
| `livenessProbe` | `GET /healthz` (`:8080`, `initialDelaySeconds: 5`, `periodSeconds: 10`) | Container liveness probe configuration. |
| `readinessProbe` | `GET /readyz` (`:8080`, `initialDelaySeconds: 3`, `periodSeconds: 5`) | Container readiness probe checking PostgreSQL and Redis connectivity. |
| `autoscaling.enabled` | `true` | Enables HPA (`minReplicas: 2`, `maxReplicas: 10`, CPU `75%`, Mem `80%`). |
| `podDisruptionBudget.enabled` | `true` | Enables PDB (`minAvailable: 1`). |
| `networkPolicy.enabled` | `true` | Enables Pod `NetworkPolicy` with `egressPorts: {postgres: 5432, redis: 6379, https: 443}`. |
| `migration.enabled` | `false` | Enables the `pre-install,pre-upgrade` `-migrate-only` Job (`backoffLimit: 3`, `activeDeadlineSeconds: 300`). |

---

## 5. Related Guides

- [Kubernetes & Kustomize Deployment](./kubernetes-kustomize.md)
- [Deployment and Storage Architecture](./deployment-and-storage.md)
- [Production Readiness Checklist](./production-checklist.md)

---
title: "Observability, Metrics & Health Probes"
sidebar_position: 4
description: "Production guide for Prometheus metrics scraping, W3C distributed traceparent propagation, and active deployment health probes."
---

# Observability, Metrics & Health Probes

GoRoute AI Gateway features enterprise-grade observability tailored for high-volume inference infrastructure:
1. **Prometheus Metrics Engine (`GET /metrics`)**: In-process reservoir sampling of latencies, Time-To-First-Token (TTFT), routing overheads, cache-hit ratios, and provider spend.
2. **W3C Distributed Tracing**: Strict `traceparent` and `X-Trace-Id` propagation from incoming clients through to upstream hyperscalers.
3. **Multi-Tier Health Probes**: Kubernetes liveness (`/healthz`), readiness (`/readyz`), and active upstream deployment probing (`/admin/v1/health/*`).

```mermaid
flowchart TD
    subgraph K8s["Orchestration & Scrapers"]
        Prom["Prometheus Scraper"]
        K8sProbe["K8s Kubelet Probes"]
        Telemetry["OpenTelemetry Collector"]
    end

    subgraph Gateway["GoRoute AI Gateway"]
        MetricsEndpoint["GET /metrics<br/>(Text Format 0.0.4)"]
        Liveness["GET /healthz"]
        Readiness["GET /readyz"]
        AdminHealth["GET /admin/v1/health/deployments<br/>POST /admin/v1/health/probe"]
        TraceMiddleware["W3C Trace Middleware<br/>(00-{trace}-{span}-01)"]
    end

    subgraph Upstream["Upstream Providers"]
        OpenAI["OpenAI API"]
        Anthropic["Anthropic API"]
    end

    Prom -->|Scrape 15s| MetricsEndpoint
    K8sProbe -->|Liveness Check| Liveness
    K8sProbe -->|Readiness Check| Readiness
    Telemetry -->|Trace Logs| TraceMiddleware
    TraceMiddleware -->|Outbound Traceparent| OpenAI
    TraceMiddleware -->|Outbound Traceparent| Anthropic
```

---

## 1. Prometheus Metrics Scraper (`GET /metrics`)

The gateway exposes a dedicated, unauthenticated Prometheus scraper endpoint at `GET /metrics` formatted according to Prometheus exposition specification 0.0.4.

Metrics are maintained in-memory using an efficient fixed-size reservoir sampler (1,024 samples) with zero lock contention on the hot path.

### Exported Metrics Catalog

| Metric Name | Type | Labels | Description |
| :--- | :--- | :--- | :--- |
| `gateway_requests_total` | Counter | — | Total inference requests processed across all endpoints. |
| `gateway_errors_total` | Counter | — | Total failed inference requests (HTTP 4xx/5xx). |
| `gateway_latency_ms` | Gauge | `quantile="0.5"`, `"0.95"`, `"0.99"` | End-to-end request duration percentiles in milliseconds. |
| `gateway_ttft_ms` | Gauge | `quantile="0.95"` | P95 Time-To-First-Token for streaming responses in milliseconds. |
| `gateway_routing_overhead_micros` | Gauge | `quantile="0.95"` | P95 Stage 1 (heuristic) + Stage 2 (load balancer) routing decision time in microseconds. |
| `gateway_fallbacks_total` | Counter | — | Total failover executions to secondary or tertiary model groups. |
| `gateway_retries_total` | Counter | — | Total intra-group exponential retry attempts. |
| `gateway_cache_hits_total` | Counter | — | Total exact-match responses served directly from Redis/L1 cache. |
| `gateway_ratelimit_rejections_total` | Counter | — | Total requests rejected by RPM/TPM rate limits or financial spend ceilings. |
| `gateway_guardrail_blocks_total` | Counter | — | Total requests intercepted and blocked by security guardrail rules. |
| `gateway_provider_requests_total` | Counter | `provider` | Request volume segmented by upstream provider (`openai`, `anthropic`, etc.). |
| `gateway_provider_errors_total` | Counter | `provider` | Upstream failure count segmented by provider. |
| `gateway_provider_latency_p95_ms` | Gauge | `provider` | P95 upstream round-trip latency segmented by provider. |
| `gateway_provider_spend_micros_total`| Counter | `provider` | Cumulative spend in integer micro-dollars (10^-6 USD) per provider. |
| `gateway_deployment_requests_total` | Counter | `deployment_id`, `name`, `provider` | Requests routed to specific provider model deployments. |
| `gateway_deployment_errors_total` | Counter | `deployment_id`, `name`, `provider` | Upstream failures per individual deployment. |

### Sample Scraper Output

```text
# HELP gateway_requests_total Total inference requests processed by the AI Gateway.
# TYPE gateway_requests_total counter
gateway_requests_total 42180

# HELP gateway_errors_total Total failed requests.
# TYPE gateway_errors_total counter
gateway_errors_total 12

# HELP gateway_latency_ms Request latency percentiles in milliseconds.
# TYPE gateway_latency_ms gauge
gateway_latency_ms{quantile="0.5"} 342
gateway_latency_ms{quantile="0.95"} 890
gateway_latency_ms{quantile="0.99"} 1420

# HELP gateway_ttft_ms Time-To-First-Token in milliseconds.
# TYPE gateway_ttft_ms gauge
gateway_ttft_ms{quantile="0.95"} 184

# HELP gateway_routing_overhead_micros Stage 1 + Stage 2 routing decision overhead in microseconds.
# TYPE gateway_routing_overhead_micros gauge
gateway_routing_overhead_micros{quantile="0.95"} 42

# HELP gateway_cache_hits_total Total exact-match response cache hits.
# TYPE gateway_cache_hits_total counter
gateway_cache_hits_total 8520

# HELP gateway_provider_requests_total Total requests by provider.
# TYPE gateway_provider_requests_total counter
gateway_provider_requests_total{provider="anthropic"} 21040
gateway_provider_requests_total{provider="gemini"} 15300
gateway_provider_requests_total{provider="openai"} 5840
```

### Scraping via Prometheus (`prometheus.yml`)

Add the following scrape configuration to your Prometheus server:

```yaml
scrape_configs:
  - job_name: "goroute-ai-gateway"
    scrape_interval: 15s
    static_configs:
      - targets: ["gateway-service.default.svc.cluster.local:8080"]
    metrics_path: "/metrics"
```

---

## 2. W3C Distributed Tracing & Header Propagation

To ensure transparent traceability across distributed microservice topologies, the gateway natively implements the **W3C Trace Context** specification (`traceparent`).

### Trace Identifier Generation (`internal/observability/tracing.go`)

Every incoming HTTP request is evaluated by `TraceMiddleware`:
1. **Trace ID Ingestion**: Checks for an existing W3C `traceparent` header (format: `00-{trace_id}-{span_id}-{flags}`). If absent, checks `X-Trace-Id`. If neither is provided, generates a fresh 128-bit random Trace ID (32 hex characters).
2. **Span ID Generation**: Generates a new 64-bit random Span ID (16 hex characters) representing the gateway's processing span.
3. **Outbound Header Injection**: Automatically injects `traceparent` and `X-Trace-Id` into:
   - Client response headers.
   - Outbound HTTP requests sent to upstream cloud providers (OpenAI, Anthropic, Bedrock, Vertex).
   - Webhook push notifications (A2A transactional outbox).

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
X-Trace-Id: 4bf92f3577b34da6a3ce929d0e0e4736
X-Gateway-Request-Id: req_8f12a39b4c0e
```

### Upstream Attribution Telemetry Headers

Every data plane response includes standard gateway telemetry headers:

| Header Name | Value Format | Description |
| :--- | :--- | :--- |
| `X-Trace-Id` | `32-char hex` | W3C 128-bit distributed trace correlation ID. |
| `X-Gateway-Request-Id` | `req_<uuid>` | Unique per-request gateway tracking ID. |
| `X-Gateway-Provider` | `string` | Resolved upstream provider (e.g. `anthropic`, `gemini`). |
| `X-Gateway-Model` | `string` | Physical upstream model invoked (e.g. `claude-3-5-sonnet-20241022`). |
| `X-Gateway-Cost-Micros`| `integer` | Micro-dollars (10^-6 USD) charged for the operation. |
| `X-Gateway-Routing-Time`| `duration` | Microseconds elapsed making Stage 1 + 2 routing decisions. |
| `X-Gateway-Cache` | `HIT` / `MISS` | Indicates whether the response was served from cache. |

---

## 3. Deployment Health Probes

The gateway provides three distinct health check interfaces designed for load balancers, orchestrators, and automated site reliability tooling.

### Liveness Probe (`GET /healthz`)

A lightweight probe returning HTTP 200 as long as the Go HTTP process is running:

```bash
curl -i http://localhost:8080/healthz
```

Response:
```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
X-Trace-Id: c8901f43a0e14cb789123456789abcde

OK
```

### Readiness Probe (`GET /readyz`)

Verifies that all configured stateful storage dependencies are operational. When running in `postgres` mode, the probe executes an active database ping and verifies Redis connectivity.

```bash
curl -i http://localhost:8080/readyz
```

- If both PostgreSQL and Redis respond: returns `HTTP 200 OK`.
- If either dependency is unreachable or times out: returns `HTTP 503 Service Unavailable`.

### Active Deployment Health Inspector (`GET /admin/v1/health/deployments`)

Provides the active health status across all configured upstream model deployments:

```bash
curl -X GET "http://localhost:8080/admin/v1/health/deployments" \
  -H "Authorization: Bearer sk-gw-master-admin-default-key-change-me"
```

Response:
```json
{
  "data": [
    {
      "deployment_id": "dep_openai_gpt4o",
      "deployment_name": "OpenAI US-East Production",
      "provider": "openai",
      "model": "gpt-4o",
      "status": "healthy",
      "consecutive_failures": 0,
      "probe_latency_ms": 142,
      "last_checked_at": "2026-11-11T16:00:00Z"
    },
    {
      "deployment_id": "dep_anthropic_sonnet",
      "deployment_name": "Anthropic Direct",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet",
      "status": "degraded",
      "consecutive_failures": 1,
      "probe_latency_ms": 1250,
      "last_error": "rate_limit: 429 Too Many Requests",
      "last_checked_at": "2026-11-11T16:00:00Z"
    }
  ]
}
```

### Triggering Instant Active Sweep (`POST /admin/v1/health/probe`)

Operators can force an immediate, non-blocking health probe sweep across all registered deployments (testing credentials and upstream connectivity via `ListModels` or ping):

```bash
curl -X POST "http://localhost:8080/admin/v1/health/probe" \
  -H "Authorization: Bearer sk-gw-master-admin-default-key-change-me"
```

The gateway audits the trigger action in `audit_logs` under action `health.deployments.probed` and updates all deployment circuit breaker states accordingly.

---

## 4. Kubernetes Production Manifest Example

Configure your Kubernetes deployment pod spec with tailored probes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goroute-ai-gateway
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: gateway
          image: ghcr.io/goroute-ai/ai-gateway:v1.3.0
          ports:
            - containerPort: 8080
              name: http
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 2
```

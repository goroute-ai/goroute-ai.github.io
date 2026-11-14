---
id: otel-and-prometheus
title: OpenTelemetry & Prometheus
sidebar_position: 8
description: Configure OTLP/HTTP tracing with W3C traceparent and gen_ai.* attributes for OTel Collector, Jaeger, and Grafana Tempo, plus Prometheus /metrics.
---

# OpenTelemetry & Prometheus

GoRoute AI Gateway provides built-in **OTLP/HTTP distributed tracing** (`internal/observability/tracing_otlp.go`) and **Prometheus 0.0.4 metrics** (`GET /metrics`). All outbound OTLP exports pass through GoRoute's outbound SSRF `network.Policy`.

---

## 1. OpenTelemetry (OTLP/HTTP) Configuration

Configure `tracing` in `config.yaml`:

```yaml title="config.yaml"
tracing:
  otlp_endpoint: "https://otel-collector.monitoring.svc.cluster.local:4318/v1/traces"
  service_name: "ai-gateway-go"
  headers:
    Authorization: "Bearer ${OTEL_EXPORTER_TOKEN}"
```

### Configuration Fields

| Field | Default | Behavior |
| :--- | :--- | :--- |
| `tracing.otlp_endpoint` | `""` (disabled / no-op tracer) | OTLP/HTTP collector URL. If the path is empty or `/`, GoRoute automatically appends `/v1/traces`. Validated against the outbound `network.Policy` at startup. |
| `tracing.service_name` | `"ai-gateway-go"` | Sets the OpenTelemetry `service.name` resource attribute. |
| `tracing.headers` | `{}` | Optional key-value headers attached to OTLP/HTTP export requests (e.g., `Authorization`, `x-scope-orgid`). |

> [!IMPORTANT]
> Because `tracing.otlp_endpoint` is validated by `internal/security/network`, loopback or private collector addresses (such as `http://localhost:4318` or cluster-internal services) require the collector host/CIDR to be permitted in your `network` security policy if private-IP blocking is enabled.

---

## 2. W3C `traceparent` & `gen_ai.*` Span Attributes

GoRoute's `TraceMiddleware` extracts incoming W3C `traceparent` (or `X-Trace-Id`) headers, generates a 128-bit TraceID + 64-bit SpanID when absent, echoes `traceparent` and `X-Trace-Id` on responses, and propagates `traceparent` to upstream providers.

Upstream inference spans are emitted as `gen_ai.client` with OpenTelemetry GenAI semantic conventions:

| Attribute | Description |
| :--- | :--- |
| `gen_ai.operation.name` | Operation name (e.g., `chat`, `embeddings`). |
| `gen_ai.system` | Upstream provider identifier (e.g., `openai`, `anthropic`, `gemini`). |
| `gen_ai.request.model` | Target model name dispatched to the provider. |
| `gen_ai.usage.input_tokens` | Prompt / input token count. |
| `gen_ai.usage.output_tokens` | Completion / output token count. |
| `gen_ai.usage.total_tokens` | Total tokens consumed. |

---

## 3. OTel Collector, Jaeger & Grafana Tempo

Point `tracing.otlp_endpoint` to your OpenTelemetry Collector HTTP receiver (port `4318`), then fan out to Jaeger or Grafana Tempo:

```yaml title="otel-collector-config.yaml"
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/tempo:
    endpoint: tempo.monitoring.svc.cluster.local:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/tempo]
```

- **Jaeger (v1.35+ native OTLP)**: Point `tracing.otlp_endpoint` directly to `http://<jaeger-host>:4318/v1/traces`.
- **Grafana Tempo**: Point `tracing.otlp_endpoint` to `http://<tempo-host>:4318/v1/traces` (or route via OTel Collector above).

---

## 4. Prometheus Scraping (`GET /metrics`)

GoRoute exposes Prometheus text exposition format `0.0.4` at `GET /metrics`. The endpoint is protected by `metricsAuthMiddleware` and requires the **Master Admin Key** in `Authorization: Bearer <MASTER_ADMIN_KEY>` or `x-api-key: <MASTER_ADMIN_KEY>`.

```yaml title="deployments/prometheus/prometheus.yml"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "ai-gateway-cluster"
    authorization:
      type: Bearer
      credentials_file: /etc/prometheus/secrets/master_admin_key
    static_configs:
      - targets: ["ai-gateway-1:8080", "ai-gateway-2:8080"]
        labels:
          cluster: "prod-verification"
```

For the full catalog of exported `gateway_*` metrics, health probes (`/healthz`, `/readyz`), and structured log scrubbing, see [Observability, Metrics & Health Probes](/docs/operations/observability).

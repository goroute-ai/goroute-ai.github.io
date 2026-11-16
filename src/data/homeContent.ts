import { GATEWAY_ENDPOINTS } from './endpoints';
import { PROVIDER_PROFILES } from './providers';

export const GATEWAY_VERSION = 'v1.8.0';
export const PROVIDER_PROFILE_COUNT = PROVIDER_PROFILES.length;
export const ENDPOINT_CATALOG_COUNT = GATEWAY_ENDPOINTS.length;

export interface HeroCodeTab {
  id: 'go-sdk' | 'cli-http' | 'drop-in';
  label: string;
  language: 'go' | 'bash' | 'yaml';
  title: string;
  code: string;
  docPath: string;
  docLabel: string;
}

export interface InstallCommand {
  id: 'shell' | 'go' | 'docker';
  label: string;
  command: string;
}

export interface PlatformStat {
  value: string;
  label: string;
  detail: string;
  to: string;
}

export interface PillarSubtopic {
  title: string;
  detail: string;
  to: string;
}

export interface PillarSpecRow {
  label: string;
  value: string;
}

export interface PillarBand {
  id: 'gateway' | 'governance' | 'finops' | 'observability' | 'agents';
  number: string;
  eyebrow: string;
  title: string;
  summary: string;
  to: string;
  ctaLabel: string;
  subtopics: PillarSubtopic[];
  panelTitle: string;
  panelType: 'code' | 'specs';
  codeLanguage?: 'yaml' | 'go' | 'bash';
  code?: string;
  specIntro?: string;
  specRows?: PillarSpecRow[];
  tags: string[];
}

export interface DeveloperPath {
  number: string;
  badge: string;
  title: string;
  summary: string;
  items: string[];
  to: string;
  ctaLabel: string;
}

export const HERO_CODE_TABS: HeroCodeTab[] = [
  {
    id: 'go-sdk',
    label: 'Go SDK (pkg/gateway)',
    language: 'go',
    title: 'main.go',
    docPath: '/docs/start/quickstart-sdk',
    docLabel: 'Go SDK Quickstart',
    code: `gw, err := gateway.New(
	gateway.WithModelList(gateway.ModelEntry{
		ModelName: "fast",
		Model:     "gemini/gemini-2.5-flash",
		APIKey:    "os.environ/GEMINI_API_KEY",
		Fallbacks: []string{"backup-claude"},
	}),
	gateway.WithGuardrailScanner("pii-check", myScanner),
)
if err != nil {
	return err
}
defer gw.Close()

res, err := gw.Chat(ctx, "fast", "Summarize this diff.")`,
  },
  {
    id: 'cli-http',
    label: 'Gateway CLI & HTTP',
    language: 'bash',
    title: 'terminal',
    docPath: '/docs/start/quickstart-gateway',
    docLabel: 'Standalone CLI Quickstart',
    code: `ai-gateway -config config.yaml

curl -X POST http://localhost:8080/v1/chat/completions \\
  -H "Authorization: Bearer $GATEWAY_VIRTUAL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Explain circuit breakers."}]
  }'`,
  },
  {
    id: 'drop-in',
    label: 'Drop-in Base URLs',
    language: 'bash',
    title: '.env / client config',
    docPath: '/docs/integrations/overview',
    docLabel: 'Integrations Overview',
    code: `# OpenAI Python / TypeScript SDKs, Cursor, Codex CLI
export OPENAI_BASE_URL="http://localhost:8080/v1"
export OPENAI_API_KEY="sk-gw-your-virtual-key"

# Anthropic SDKs & Claude Code
export ANTHROPIC_BASE_URL="http://localhost:8080/anthropic"
export ANTHROPIC_AUTH_TOKEN="sk-gw-your-virtual-key"`,
  },
];

export const INSTALL_COMMANDS: InstallCommand[] = [
  {
    id: 'shell',
    label: 'Shell',
    command: 'curl -fsSL https://raw.githubusercontent.com/goroute-ai/ai-gateway-go/main/install.sh | bash',
  },
  {
    id: 'go',
    label: 'Go SDK',
    command: `go get github.com/goroute-ai/ai-gateway-go/pkg/gateway@${GATEWAY_VERSION}`,
  },
  {
    id: 'docker',
    label: 'Docker',
    command: `docker pull ghcr.io/goroute-ai/ai-gateway-go:${GATEWAY_VERSION}`,
  },
];

export const PLATFORM_STATS: PlatformStat[] = [
  {
    value: `${PROVIDER_PROFILE_COUNT}`,
    label: 'Provider Catalog Profiles',
    detail: '73 ProviderType profiles + CustomOpenAICompatible',
    to: '/docs/providers/overview',
  },
  {
    value: `${ENDPOINT_CATALOG_COUNT}`,
    label: 'Documented Endpoints',
    detail: '73 Unified OpenAPI paths across 7 API surfaces',
    to: '/docs/api/overview',
  },
  {
    value: '19',
    label: 'Guardrail Drivers',
    detail: '7 lifecycle hooks, Starlark sandbox & SDK scanners',
    to: '/docs/governance/guardrails',
  },
  {
    value: '64-bit',
    label: 'Micro-Dollar FinOps',
    detail: '1 USD = 1,000,000 µ$ integer ledger & Redis Lua',
    to: '/docs/finops/micro-dollar-ledger',
  },
];

export const PILLAR_BANDS: PillarBand[] = [
  {
    id: 'gateway',
    number: '01',
    eyebrow: 'MODULE 01 · DATA PLANE & ROUTING',
    title: 'AI Gateway: Traffic Management & Model Routing',
    summary:
      'Route inference traffic across 73 ProviderType profiles and CustomOpenAICompatible endpoints through unified /v1/* and /anthropic/v1/* APIs with zero-LLM complexity classification, six load-balancing strategies, shared Redis circuit breakers, and two-tier exact-match caching.',
    to: '/docs/gateway',
    ctaLabel: 'Explore AI Gateway',
    subtopics: [
      {
        title: 'Unified /v1 & /anthropic/v1 Data Plane',
        detail: '24 primary /v1 paths covering Chat, Messages, Responses, Realtime WS, Audio, Images, Embeddings, Rerank, Files, Batches, and Guardrails Apply.',
        to: '/docs/gateway/endpoints/chat-completions',
      },
      {
        title: '73 Provider Profiles & SupportedOperations',
        detail: 'Native adapters for OpenAI, Anthropic, Gemini, Bedrock, Vertex, Azure, Cohere, Mistral, and Ollama plus 60+ OpenAI-compatible dialects and 4,627 cataloged models.',
        to: '/docs/providers/overview',
      },
      {
        title: 'Stage 1 Complexity Classifier & 6 Load Balancers',
        detail: 'Zero-LLM heuristic routing for model: "auto" paired with weighted-shuffle, least-busy, latency-based (EWMA), usage-based-headroom, lowest-cost, and round-robin.',
        to: '/docs/gateway/routing-and-load-balancing',
      },
      {
        title: '3-State Redis Circuit Breakers & Bounded Fallbacks',
        detail: 'Shared Closed, Open, and Half-Open state across gateway replicas with atomic probe leases, intra-group exponential retries, and ordered failover chains.',
        to: '/docs/gateway/resiliency-and-fallbacks',
      },
      {
        title: '2-Tier Exact-Match Response Cache',
        detail: 'L1 in-process memory and L2 Redis SHA-256 caching for deterministic prompts with epoch-based cluster invalidation.',
        to: '/docs/gateway/caching',
      },
    ],
    panelTitle: 'configs/config.yaml',
    panelType: 'code',
    codeLanguage: 'yaml',
    code: `router:
  default_fast_alias: "fast"
  default_reasoning_alias: "reasoning"
  complexity_threshold: 0.40
  long_context_tokens: 32000

model_list:
  - model_name: fast
    routing_strategy: latency-based
    fallbacks: ["fast-backup"]
    model_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
  - model_name: fast-backup
    model_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY`,
    tags: [
      '/v1/chat/completions',
      '/anthropic/v1/messages',
      '/v1/responses',
      '/v1/realtime',
      'round-robin',
      'latency-based',
    ],
  },
  {
    id: 'governance',
    number: '02',
    eyebrow: 'MODULE 02 · SECURITY & POLICY',
    title: 'AI Governance: Security, Policies & Compliance',
    summary:
      'Enforce fail-closed identity, encrypted credential isolation, outbound SSRF network boundaries, and the v1.8.0 Two-Layer Guardrails Engine across every inference, tool, and control-plane call.',
    to: '/docs/governance',
    ctaLabel: 'Explore AI Governance',
    subtopics: [
      {
        title: '4-Layer Access Hierarchy & Operator RBAC',
        detail: 'Fail-closed policy scoping across Organization, Team, User, and Virtual Key with OIDC/JWT identity mapping and role-scoped /admin/v1/* endpoints.',
        to: '/docs/governance/rbac-and-vault',
      },
      {
        title: 'Scoped Virtual Keys (sk-gw-...)',
        detail: 'Revocable data-plane tokens with model allowlists, micro-dollar spend caps, RPM/TPM quotas, and mismatched dual-header rejection.',
        to: '/docs/governance/virtual-keys',
      },
      {
        title: 'AES-256-GCM Credentials Vault & DEK Rotation',
        detail: 'Encrypts upstream provider keys, MCP secrets, and guardrail credentials at rest and in transit inside internal/storage/vault.go.',
        to: '/docs/governance/rbac-and-vault',
      },
      {
        title: 'Two-Layer Guardrails Engine (19 Drivers, 7 Hooks)',
        detail: 'Hierarchical bindings (Org to Tag), Starlark custom_code sandbox, rich generic_http webhooks, StreamWindowEvaluator, POST /v1/guardrails/apply, and WithGuardrailScanner.',
        to: '/docs/governance/guardrails',
      },
      {
        title: 'Outbound SSRF Firewall (SafeTransport)',
        detail: 'DNS pinning and private-IP, loopback, and cloud metadata CIDR blocklists across all provider, OTLP, webhook, and MCP egress.',
        to: '/docs/governance/network-and-ssrf',
      },
    ],
    panelTitle: 'Pipeline v2 Guardrails & SDK Hook (v1.8.0)',
    panelType: 'code',
    codeLanguage: 'go',
    code: `gw, err := gateway.New(
	gateway.WithConfigFile("./configs/config.yaml"),
	gateway.WithGuardrailScanner(
		"org-dlp-scanner",
		gateway.GuardrailScannerFunc(func(ctx context.Context, req gateway.GuardrailScanRequest) (gateway.GuardrailScanResult, error) {
			return gateway.GuardrailScanResult{Decision: gateway.GuardrailDecisionAllow}, nil
		}),
		gateway.WithGuardrailHooks(gateway.GuardrailHookPreCall, gateway.GuardrailHookPostCall),
		gateway.WithGuardrailFailOpen(false),
	),
)`,
    tags: [
      'POST /v1/guardrails/apply',
      'Starlark custom_code',
      'AES-256-GCM Vault',
      'SafeTransport SSRF',
      'OIDC / JWT',
    ],
  },
  {
    id: 'finops',
    number: '03',
    eyebrow: 'MODULE 03 · COST & QUOTAS',
    title: 'AI FinOps: Cost Management & Optimization',
    summary:
      'Eliminate floating-point billing drift and concurrent budget race conditions with 64-bit integer micro-dollar arithmetic, pre-flight upper-bound budget leases, durable PostgreSQL outboxes, and atomic Redis Lua rate limits.',
    to: '/docs/finops',
    ctaLabel: 'Explore AI FinOps',
    subtopics: [
      {
        title: '64-Bit Integer Micro-Dollar Ledger',
        detail: 'All spend is computed in integer micro-dollars (1 USD = 1,000,000 µ$) with intermediate pico-dollar precision and ceiling division in CalculateCostMicros.',
        to: '/docs/finops/micro-dollar-ledger',
      },
      {
        title: 'Cache-Write, Reasoning & Modality Pricing',
        detail: 'Tracks prompt, cached input, cache-write (0012), completion, reasoning, and audio/image/rerank modality units plus explicit unpriced_requests visibility.',
        to: '/docs/finops/micro-dollar-ledger',
      },
      {
        title: 'Pre-Flight Reservations & Durable Outboxes',
        detail: 'Upper-bound Redis budget leases renew across long streams and reconcile idempotently against PostgreSQL spend (0008) and budget-reset (0011/0014) outboxes.',
        to: '/docs/deploy/deployment-and-storage',
      },
      {
        title: 'Single-Roundtrip Redis Lua Sliding Windows',
        detail: 'Atomic RPM, TPM, and concurrency enforcement with {org:<id>} hash-tag compatibility for Redis Cluster and Sentinel.',
        to: '/docs/finops/rate-limiting',
      },
      {
        title: 'Pre-Flight Tokenization',
        detail: 'Local zero-network token estimation via POST /v1/tokenize and POST /anthropic/v1/messages/count_tokens before upstream dispatch.',
        to: '/docs/finops/preflight-tokenization',
      },
    ],
    panelTitle: 'FinOps Accounting & Quota Specification',
    panelType: 'specs',
    specIntro: 'Integer accounting units, durable outbox tables, and rate-limit enforcement primitives:',
    specRows: [
      { label: 'Accounting Unit', value: '1 USD = 1,000,000 µ$ (int64, zero float32/float64)' },
      { label: 'Cost Dimensions', value: 'input, cached_input, cache_write, output, reasoning, modality' },
      { label: 'Budget Safety', value: 'Redis upper-bound lease + streaming renewal + idempotent reconcile' },
      { label: 'PostgreSQL Outboxes', value: '0008 spend_outbox, 0011/0014 budget_reset_outbox, 0019 guardrail_usage' },
      { label: 'Rate Limiter', value: 'Atomic Redis Lua sliding window (RPM, TPM, concurrency)' },
      { label: 'Endpoints', value: 'POST /v1/tokenize, GET /admin/v1/spend/summary, /guardrail-usage' },
    ],
    tags: [
      'int64 µ$ Ledger',
      'Redis Lua',
      'PostgreSQL Outbox',
      'POST /v1/tokenize',
      'unpriced_requests',
    ],
  },
  {
    id: 'observability',
    number: '04',
    eyebrow: 'MODULE 04 · TELEMETRY & CONSOLE',
    title: 'AI Observability: Monitoring, Tracing & Evaluation',
    summary:
      'Inspect every inference, routing decision, and guardrail evaluation with OpenTelemetry OTLP/HTTP spans, Vitter Algorithm R Prometheus metrics, secret-scrubbed structured logs, and the Light/Dark Embedded Operator Web UI.',
    to: '/docs/deploy/observability',
    ctaLabel: 'Explore AI Observability',
    subtopics: [
      {
        title: 'OTLP/HTTP Tracing & W3C traceparent',
        detail: 'Exports gen_ai.client and scrubbed guardrail.evaluate spans via tracing.otlp_endpoint while propagating traceparent and X-Trace-Id headers.',
        to: '/docs/integrations/otel-and-prometheus',
      },
      {
        title: 'Prometheus /metrics & Vitter Algorithm R',
        detail: 'Bounded-cardinality metrics including gateway_latency_ms, gateway_ttft_ms, gateway_routing_overhead_micros, and v1.8.0 gateway_guardrail_* series.',
        to: '/docs/deploy/observability',
      },
      {
        title: 'Embedded Operator Web UI (/ui/)',
        detail: 'Single-binary React 19 SPA with Light Blue Dark/Light theme, Streaming Playground, FinOps Ledger, Vault, and 4-Tab Guardrails Operator Console.',
        to: '/docs/deploy/operator-ui',
      },
      {
        title: 'Secret-Scrubbed slog & Health Probes',
        detail: 'internal/logger/scrub.go masks credentials before log emission alongside Kubernetes /healthz, /readyz, and /admin/v1/health/probe checks.',
        to: '/docs/deploy/production-checklist',
      },
    ],
    panelTitle: 'Telemetry Headers, Metrics & Console Surfaces',
    panelType: 'specs',
    specIntro: 'Standardized response headers, Prometheus endpoints, and embedded Operator Console views:',
    specRows: [
      { label: 'Response Headers', value: 'X-Gateway-Request-Id, X-Trace-Id, X-Gateway-Provider, X-Gateway-Model' },
      { label: 'FinOps Headers', value: 'X-Gateway-Cost-Micros, X-Gateway-Routing-Time, X-Gateway-Cache' },
      { label: 'Prometheus Core', value: 'gateway_requests_total, gateway_latency_ms, gateway_ttft_ms' },
      { label: 'Guardrail Metrics', value: 'gateway_guardrail_evaluations_total, _errors_total, _duration_ms' },
      { label: 'Kubernetes Probes', value: 'GET /healthz (liveness), GET /readyz (Postgres + Redis)' },
      { label: 'Operator Console', value: 'http://localhost:8080/ui/ (Playground, FinOps, Guardrails Console)' },
    ],
    tags: [
      'OTLP gen_ai.*',
      'W3C traceparent',
      'GET /metrics',
      'Embedded /ui/',
      'ScrubSecrets',
    ],
  },
  {
    id: 'agents',
    number: '05',
    eyebrow: 'MODULE 05 · MCP, A2A & TOOLS',
    title: 'AI Agent Management: MCP, Tools & Agent Access',
    summary:
      'Turn GoRoute into a governed execution plane for tools, multi-agent networks, and coding IDEs with a multi-version MCP Virtual Hub, zero-trust tool taint tracking, A2A v1.0 signed Agent Cards, and autonomous tool loops.',
    to: '/docs/agents',
    ctaLabel: 'Explore Agent Management',
    subtopics: [
      {
        title: 'MCP 2026-07-28 Virtual Hub & REST Bridge',
        detail: 'Aggregates Streamable HTTP, stateful SSE, and local Stdio servers behind /mcp, /mcp/{serverSlug}, /mcp/toolsets/{slug}, and /mcp-rest/tools/*.',
        to: '/docs/agents/mcp-hub-and-rest',
      },
      {
        title: 'Progressive Tool Discovery & Stdio Sandboxing',
        detail: 'Serves /v1/goroute/mcp/registry to prevent context bloat, isolates local Stdio subprocesses, and pins schemas via SHA-256.',
        to: '/docs/agents/mcp-progressive-discovery',
      },
      {
        title: 'Zero-Trust Tool & MCP Governance (v1.8.0)',
        detail: 'Enforces tool_permission, cross-turn tool_policy taint tracking inside ToolLoopOrchestrator, block_code_execution, mcp_security, and mcp_jwt_signer.',
        to: '/docs/agents/mcp-stdio-sandboxing',
      },
      {
        title: 'A2A v1.0 Signed Agent Cards & Native gRPC',
        detail: 'Publishes JCS/JWS-signed /.well-known/agent-card.json, HTTP+JSON and JSON-RPC 2.0 task APIs, SSE streams, gRPC, and model: "a2a/{slug}".',
        to: '/docs/agents/a2a-overview',
      },
      {
        title: 'Autonomous Tool Loops & Coding Agents',
        detail: 'Bounded server-side tool loops plus Virtual Key governance for Claude Code, Cursor, Codex CLI, LangChain, OpenAI Agents SDK, and Google ADK.',
        to: '/docs/integrations/overview',
      },
    ],
    panelTitle: 'Agent & Tool Protocol Endpoints',
    panelType: 'specs',
    specIntro: 'Protocol transports, cryptographic identity, and governance hooks exposed by the Agent Plane:',
    specRows: [
      { label: 'MCP Virtual Hub', value: 'POST /mcp, /mcp/{serverSlug}, /mcp/toolsets/{toolsetSlug}' },
      { label: 'MCP REST & Discovery', value: 'GET /mcp-rest/tools/list, POST /mcp-rest/tools/call, /v1/goroute/mcp/registry' },
      { label: 'MCP Guardrail Hooks', value: 'pre_mcp_call, during_mcp_call, post_mcp_call, mcp_jwt_signer' },
      { label: 'A2A Discovery', value: 'GET /.well-known/agent-card.json (RFC 8785 JCS / JWS)' },
      { label: 'A2A Task Plane', value: '/a2a/v1/agents/{slug}/tasks* (HTTP, JSON-RPC 2.0, gRPC, SSE)' },
      { label: 'Coding Agents & SDKs', value: 'Claude Code (/anthropic), Cursor, Codex CLI, LangChain, Google ADK' },
    ],
    tags: [
      'MCP 2026-07-28',
      'A2A v1.0',
      'tool_policy Taint',
      'SHA-256 Pinning',
      'Claude Code / Cursor',
    ],
  },
];

export const DEVELOPER_PATHS: DeveloperPath[] = [
  {
    number: '01',
    badge: 'DEPLOY & OPERATE',
    title: 'Run the Control Plane Anywhere',
    summary:
      'Deploy as a single static binary, Docker Compose stack with PostgreSQL 16+ and Redis 7+, or Kubernetes via Helm chart 0.3.0 and Kustomize.',
    items: [
      'Standalone CLI & install.sh binary',
      'Docker Compose (Postgres + Redis)',
      'Helm chart 0.3.0 & Kustomize manifests',
      'Embedded migrations 0001 to 0019',
    ],
    to: '/docs/start/quickstart-gateway',
    ctaLabel: 'Start Deploying',
  },
  {
    number: '02',
    badge: 'GO SDK (PKG/GATEWAY)',
    title: 'Embed Directly in Go Services',
    summary:
      'Run the gateway inside your Go application with gateway.New(...) or connect to a shared deployment via gateway.NewClient(...).',
    items: [
      'Chat, StreamChat & Responses API',
      'WebSocket ConnectRealtime sessions',
      'Embeddings, Rerank, Audio & Images',
      'WithGuardrailScanner in-process hooks',
    ],
    to: '/docs/sdk/overview',
    ctaLabel: 'Read Go SDK Handbook',
  },
  {
    number: '03',
    badge: '26 RUNNABLE EXAMPLES',
    title: 'Explore Working Go Recipes',
    summary:
      'Learn every gateway capability through 26 self-contained Go programs under examples/ covering routing, FinOps, MCP, and A2A.',
    items: [
      'Fundamentals & structured JSON output',
      'EWMA, round-robin & circuit breakers',
      'Virtual keys & micro-dollar budgets',
      'MCP Virtual Hub & A2A agent networks',
    ],
    to: '/docs/examples/overview',
    ctaLabel: 'Browse 26 Examples',
  },
  {
    number: '04',
    badge: 'INTERACTIVE CATALOGS',
    title: 'Inspect Providers & Endpoints',
    summary:
      'Filter all 74 provider profiles and 112 documented endpoints across 7 API surfaces, or review the v1.8.0 changelog.',
    items: [
      'Interactive 74-Profile Provider Catalog',
      'Interactive 112-Endpoint API Catalog',
      '73 Unified OpenAPI 3.x paths',
      'Release Notes (v1.8.0)',
    ],
    to: '/docs/api/overview',
    ctaLabel: 'Open API Reference',
  },
];

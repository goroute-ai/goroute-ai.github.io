import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Start Here',
      collapsed: false,
      items: [
        'start/overview',
        'start/quickstart-gateway',
        'start/quickstart-docker',
        'start/quickstart-sdk',
        'start/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Gateway & Routing',
      collapsed: true,
      items: [
        'gateway/index',
        'gateway/routing-and-load-balancing',
        'gateway/resiliency-and-fallbacks',
        'gateway/caching',
      ],
    },
    {
      type: 'category',
      label: 'Endpoint Guides',
      collapsed: true,
      items: [
        'gateway/endpoints/chat-completions',
        'gateway/endpoints/messages',
        'gateway/endpoints/completions',
        'gateway/endpoints/responses',
        'gateway/endpoints/tool-calling',
        'gateway/endpoints/autonomous-tool-loop',
        'gateway/endpoints/model-management',
        'gateway/endpoints/embeddings',
        'gateway/endpoints/rerank',
        'gateway/endpoints/audio',
        'gateway/endpoints/images',
        'gateway/endpoints/realtime',
        'gateway/endpoints/files',
        'gateway/endpoints/batches',
        'gateway/endpoints/moderations',
        'gateway/endpoints/tokenize',
      ],
    },
    {
      type: 'category',
      label: 'Providers',
      collapsed: true,
      items: [
        'providers/overview',
        'providers/openai',
        'providers/anthropic-claude',
        'providers/google-gemini',
        'providers/aws-bedrock',
        'providers/google-vertex',
        'providers/azure-openai',
        'providers/cohere',
        'providers/mistral',
        'providers/ollama',
        'providers/openai-compatible',
        'providers/custom-provider',
      ],
    },
    {
      type: 'category',
      label: 'Governance & Security',
      collapsed: true,
      items: [
        'governance/index',
        'governance/virtual-keys',
        'governance/rbac-and-vault',
        'governance/guardrails',
        'governance/network-and-ssrf',
      ],
    },
    {
      type: 'category',
      label: 'FinOps & Rate Limits',
      collapsed: true,
      items: [
        'finops/index',
        'finops/micro-dollar-ledger',
        'finops/rate-limiting',
        'finops/preflight-tokenization',
      ],
    },
    {
      type: 'category',
      label: 'Agents (MCP & A2A)',
      collapsed: true,
      items: [
        'agents/index',
        'agents/mcp-overview',
        'agents/mcp-hub-and-rest',
        'agents/mcp-progressive-discovery',
        'agents/mcp-stdio-sandboxing',
        'agents/a2a-overview',
        'agents/a2a-agent-cards',
        'agents/a2a-bridge-and-grpc',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      collapsed: true,
      items: [
        'integrations/overview',
        {
          type: 'category',
          label: 'Coding Agents & IDEs',
          collapsed: false,
          items: [
            'integrations/claude-code',
            'integrations/cursor-and-ides',
            'integrations/codex-and-cli-agents',
          ],
        },
        {
          type: 'category',
          label: 'SDKs & Agent Frameworks',
          collapsed: false,
          items: [
            'integrations/openai-sdks',
            'integrations/anthropic-sdks',
            'integrations/agent-frameworks',
          ],
        },
        {
          type: 'category',
          label: 'Observability & Telemetry',
          collapsed: false,
          items: [
            'integrations/otel-and-prometheus',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Deploy & Operate',
      collapsed: true,
      items: [
        'deploy/configuration',
        'deploy/deployment-and-storage',
        'deploy/kubernetes-kustomize',
        'deploy/helm-chart',
        'deploy/operator-ui',
        'deploy/observability',
        {
          type: 'link',
          label: 'OpenTelemetry & Prometheus',
          href: '/docs/integrations/otel-and-prometheus',
        },
        'deploy/production-checklist',
        'deploy/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      collapsed: true,
      items: [
        'contributing/claude-code-and-agents',
      ],
    },
    {
      type: 'category',
      label: 'Release Notes',
      collapsed: true,
      items: [
        'releases/index',
        'releases/v1.7.0',
        'releases/v1.6.0',
        'releases/v1.5.0',
      ],
    },
    {
      type: 'link',
      label: 'llms.txt (AI Index)',
      href: 'pathname:///llms.txt',
    },
  ],

  sdkSidebar: [
    {
      type: 'category',
      label: 'Go SDK Handbook',
      collapsed: false,
      items: [
        'sdk/overview',
        'sdk/client-configuration',
        'sdk/chat-and-streaming',
        'sdk/virtual-keys-and-finops',
        'sdk/mcp-and-a2a',
        'sdk/go-sdk-reference',
      ],
    },
  ],

  demosSidebar: [
    'examples/overview',
    {
      type: 'category',
      label: 'Fundamentals',
      collapsed: false,
      items: [
        'examples/hello-gateway',
        'examples/system-prompt',
        'examples/streaming-tokens',
        'examples/temperature-and-sampling',
        'examples/json-mode-structured-output',
        'examples/multi-turn-conversation',
      ],
    },
    {
      type: 'category',
      label: 'Multi-Provider',
      collapsed: false,
      items: [
        'examples/openai-direct',
        'examples/anthropic-direct',
        'examples/gemini-direct',
        'examples/local-ollama',
        'examples/unified-model-alias',
      ],
    },
    {
      type: 'category',
      label: 'Tools & Agents',
      collapsed: false,
      items: [
        'examples/single-tool-definition',
        'examples/tool-execution-callback',
        'examples/multi-tool-selection',
        'examples/autonomous-tool-loop',
      ],
    },
    {
      type: 'category',
      label: 'Routing & Resiliency',
      collapsed: false,
      items: [
        'examples/failover-fallback-chain',
        'examples/round-robin-balancer',
        'examples/weighted-shuffle-routing',
        'examples/least-latency-ewma',
        'examples/circuit-breaker',
      ],
    },
    {
      type: 'category',
      label: 'FinOps, Protocols & Services',
      collapsed: false,
      items: [
        'examples/exact-match-cache',
        'examples/sliding-window-rate-limiting',
        'examples/virtual-keys-and-budgets',
        'examples/mcp-virtual-hub',
        'examples/a2a-agent-network',
        'examples/embedded-http-microservice',
      ],
    },
  ],

  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/overview',
        'api/gateway-api',
        'api/admin-api',
        'api/mcp-api',
        'api/a2a-api',
      ],
    },
  ],
};

export default sidebars;

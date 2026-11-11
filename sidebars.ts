import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Start here',
      collapsed: false,
      items: [
        'getting-started/learning-path',
        'getting-started/overview',
        'getting-started/quickstart-sdk',
        'getting-started/quickstart-cli',
        'getting-started/quickstart-docker',
        'getting-started/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Operator Console',
      collapsed: false,
      items: [
        'operations/operator-ui',
      ],
    },
    {
      type: 'category',
      label: 'Multi-Modal Data Plane',
      collapsed: true,
      items: [
        'data-plane/chat-completions',
        'data-plane/rerank',
        'data-plane/moderations',
        'data-plane/completions',
        'data-plane/messages',
        'data-plane/tokenize',
        'data-plane/audio',
        'data-plane/images',
        'data-plane/embeddings',
        'data-plane/files',
        'data-plane/batches',
        'data-plane/responses',
        'data-plane/realtime',
        'data-plane/model-management',
        'data-plane/tool-calling',
        'data-plane/autonomous-tool-loop',
      ],
    },
    {
      type: 'category',
      label: 'Provider Integrations',
      collapsed: true,
      items: [
        'providers/overview',
        {
          type: 'category',
          label: 'Dedicated Cloud Providers',
          collapsed: false,
          items: [
            'providers/openai',
            'providers/anthropic-claude',
            'providers/google-gemini',
            'providers/aws-bedrock',
            'providers/google-vertex',
            'providers/azure-openai',
            'providers/cohere',
            'providers/mistral',
            'providers/ollama',
          ],
        },
        {
          type: 'category',
          label: 'Certified Dialect Profiles',
          collapsed: false,
          items: [
            'providers/openai-compatible',
          ],
        },
        'providers/custom-provider',
      ],
    },
    {
      type: 'category',
      label: 'Go SDK',
      collapsed: true,
      items: [
        'sdk/overview',
        'sdk/client-configuration',
        'sdk/chat-and-streaming',
        'sdk/virtual-keys-and-finops',
        'sdk/mcp-and-a2a',
        'sdk/go-sdk-reference',
      ],
    },
    {
      type: 'category',
      label: 'Agentic Protocols',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'MCP',
          collapsed: false,
          items: [
            'protocols/mcp-overview',
            'protocols/mcp-hub-and-rest',
            'protocols/mcp-progressive-discovery',
            'protocols/mcp-stdio-sandboxing',
          ],
        },
        {
          type: 'category',
          label: 'A2A',
          collapsed: false,
          items: [
            'protocols/a2a-overview',
            'protocols/a2a-agent-cards',
            'protocols/a2a-bridge-and-grpc',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Routing & Resiliency',
      collapsed: true,
      items: [
        'routing-resiliency/complexity-classifier',
        'routing-resiliency/load-balancing',
        'routing-resiliency/circuit-breakers',
        'routing-resiliency/fallbacks-and-retries',
      ],
    },
    {
      type: 'category',
      label: 'FinOps, Security & Caching',
      collapsed: true,
      items: [
        'finops-and-security/micro-dollar-ledger',
        'finops-and-security/virtual-keys',
        'finops-and-security/rbac-and-vault',
        'finops-and-security/guardrails',
        'finops-and-security/ssrf-and-network',
        'caching-and-limits/sliding-window-ratelimit',
        'caching-and-limits/preflight-tokenizer',
        'caching-and-limits/exact-match-cache',
      ],
    },
    {
      type: 'category',
      label: 'Operations & Runbooks',
      collapsed: true,
      items: [
        'operations/configuration',
        'operations/deployment-and-storage',
        'operations/observability',
        'operations/troubleshooting',
        'operations/claude-code-and-agents',
      ],
    },
  ],

  // Interactive Progressive Demos
  demosSidebar: [
    'demos/overview',
    {
      type: 'category',
      label: 'Fundamentals',
      collapsed: false,
      items: [
        'demos/hello-gateway',
        'demos/system-prompt',
        'demos/streaming-tokens',
        'demos/temperature-and-sampling',
        'demos/json-mode-structured-output',
        'demos/multi-turn-conversation',
      ],
    },
    {
      type: 'category',
      label: 'Multi-Provider',
      collapsed: false,
      items: [
        'demos/openai-direct',
        'demos/anthropic-direct',
        'demos/gemini-direct',
        'demos/local-ollama',
        'demos/unified-model-alias',
      ],
    },
    {
      type: 'category',
      label: 'Tools & Agents',
      collapsed: false,
      items: [
        'demos/single-tool-definition',
        'demos/tool-execution-callback',
        'demos/multi-tool-selection',
        'demos/autonomous-tool-loop',
      ],
    },
    {
      type: 'category',
      label: 'Routing & Resiliency',
      collapsed: false,
      items: [
        'demos/failover-fallback-chain',
        'demos/round-robin-balancer',
        'demos/weighted-shuffle-routing',
        'demos/least-latency-ewma',
        'demos/circuit-breaker',
      ],
    },
    {
      type: 'category',
      label: 'FinOps, Protocols & Services',
      collapsed: false,
      items: [
        'demos/exact-match-cache',
        'demos/sliding-window-rate-limiting',
        'demos/virtual-keys-and-budgets',
        'demos/mcp-virtual-hub',
        'demos/a2a-agent-network',
        'demos/embedded-http-microservice',
      ],
    },
  ],

  // Written REST API guides
  apiSidebar: [
    'api-reference/overview',
    'api-reference/gateway-api',
    'api-reference/admin-api',
    'api-reference/mcp-api',
    'api-reference/a2a-api',
  ],
};

export default sidebars;

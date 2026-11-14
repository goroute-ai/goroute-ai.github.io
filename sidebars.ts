import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Main documentation guides: Architecture, Data Plane, Providers, Traffic, FinOps, Protocols, Operations
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/quickstart-sdk',
        'getting-started/quickstart-docker',
        'getting-started/quickstart-cli',
        {
          type: 'link',
          label: 'System Architecture',
          href: '/docs/getting-started/architecture',
        },
        'getting-started/learning-path',
      ],
    },
    {
      type: 'category',
      label: 'Data Plane Routes',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Text & Chat Generation',
          collapsed: false,
          items: [
            'data-plane/chat-completions',
            'data-plane/messages',
            'data-plane/completions',
            'data-plane/tool-calling',
            'data-plane/autonomous-tool-loop',
            'data-plane/model-management',
          ],
        },
        {
          type: 'category',
          label: 'Multi-Modal & Media',
          collapsed: false,
          items: [
            'data-plane/embeddings',
            'data-plane/rerank',
            'data-plane/audio',
            'data-plane/images',
          ],
        },
        {
          type: 'category',
          label: 'Streaming & Async',
          collapsed: false,
          items: [
            'data-plane/realtime',
            'data-plane/files',
            'data-plane/batches',
            'data-plane/responses',
            'data-plane/moderations',
            'data-plane/tokenize',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Providers & Dialects',
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
      label: 'Traffic & Resiliency',
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
        'finops-and-security/sliding-window-ratelimit',
        'finops-and-security/preflight-tokenizer',
        'finops-and-security/exact-match-cache',
      ],
    },
    {
      type: 'category',
      label: 'Agent Protocols',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Model Context Protocol (MCP)',
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
          label: 'Agent-to-Agent (A2A)',
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
      label: 'Operations & Web UI',
      collapsed: true,
      items: [
        'operations/operator-ui',
        'operations/configuration',
        'operations/deployment-and-storage',
        'operations/kubernetes-kustomize',
        'operations/production-checklist',
        'operations/observability',
        'operations/troubleshooting',
        'operations/claude-code-and-agents',
      ],
    },
    {
      type: 'category',
      label: 'Cookbook',
      collapsed: true,
      items: [
        'cookbook/overview',
      ],
    },
  ],

  // Dedicated Architecture Section
  architectureSidebar: [
    {
      type: 'category',
      label: 'Core Architecture',
      collapsed: false,
      items: [
        'getting-started/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Architectural Topologies',
      collapsed: false,
      items: [
        {
          type: 'link',
          label: 'Deployment & Storage Topologies',
          href: '/docs/operations/deployment-and-storage',
        },
        {
          type: 'link',
          label: 'Traffic Routing & Load Balancing',
          href: '/docs/routing-resiliency/load-balancing',
        },
        {
          type: 'link',
          label: 'FinOps & Micro-Dollar Ledger',
          href: '/docs/finops-and-security/micro-dollar-ledger',
        },
        {
          type: 'link',
          label: 'Agent Protocol Hub (MCP & A2A)',
          href: '/docs/protocols/a2a-overview',
        },
        {
          type: 'link',
          label: 'Embedded Operator UI Console',
          href: '/docs/operations/operator-ui',
        },
      ],
    },
  ],

  // Dedicated Go SDK Handbook & Reference
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

  // Interactive Progressive Demos (26 runnable Go examples)
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

  // REST & Protocol Specifications
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api-reference/overview',
        'api-reference/gateway-api',
        'api-reference/admin-api',
        'api-reference/mcp-api',
        'api-reference/a2a-api',
      ],
    },
  ],

  // Ecosystem Integrations & Observability
  integrationsSidebar: [
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

  // Release Notes & Upgrade Guides
  releaseNotesSidebar: [
    {
      type: 'category',
      label: 'Release Notes',
      collapsed: false,
      items: [
        'release-notes/index',
        'release-notes/v1.6.0',
        'release-notes/v1.5.0',
      ],
    },
  ],
};

export default sidebars;

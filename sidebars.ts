import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Main documentation guides: Enterprise AI Control Plane & its 5 Core Modules
  docsSidebar: [
    {
      type: 'category',
      label: 'Control Plane Overview',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/architecture',
        'getting-started/quickstart-sdk',
        'getting-started/quickstart-docker',
        'getting-started/quickstart-cli',
        'getting-started/learning-path',
      ],
    },
    {
      type: 'category',
      label: '1. AI Gateway',
      collapsed: true,
      items: [
        'modules/ai-gateway',
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
          label: 'Traffic Routing & Resiliency',
          collapsed: true,
          items: [
            'routing-resiliency/complexity-classifier',
            'routing-resiliency/load-balancing',
            'routing-resiliency/circuit-breakers',
            'routing-resiliency/fallbacks-and-retries',
          ],
        },
        'finops-and-security/exact-match-cache',
      ],
    },
    {
      type: 'category',
      label: '2. AI Governance',
      collapsed: true,
      items: [
        'modules/ai-governance',
        'finops-and-security/virtual-keys',
        'finops-and-security/rbac-and-vault',
        'finops-and-security/guardrails',
        'finops-and-security/ssrf-and-network',
        'operations/production-checklist',
      ],
    },
    {
      type: 'category',
      label: '3. AI FinOps',
      collapsed: true,
      items: [
        'modules/ai-finops',
        'finops-and-security/micro-dollar-ledger',
        'finops-and-security/sliding-window-ratelimit',
        'finops-and-security/preflight-tokenizer',
      ],
    },
    {
      type: 'category',
      label: '4. AI Observability',
      collapsed: true,
      items: [
        'modules/ai-observability',
        'operations/observability',
        'operations/operator-ui',
        'operations/troubleshooting',
        {
          type: 'link',
          label: 'OpenTelemetry & Prometheus',
          href: '/docs/integrations/otel-and-prometheus',
        },
      ],
    },
    {
      type: 'category',
      label: '5. AI Agent Management',
      collapsed: true,
      items: [
        'modules/ai-agent-management',
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
        'data-plane/autonomous-tool-loop',
        'operations/claude-code-and-agents',
      ],
    },
    {
      type: 'category',
      label: 'Deployment & Platform Ops',
      collapsed: true,
      items: [
        'operations/configuration',
        'operations/deployment-and-storage',
        'operations/kubernetes-kustomize',
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
      label: 'Control Plane Modules',
      collapsed: false,
      items: [
        {
          type: 'link',
          label: '1. AI Gateway — Traffic & Routing',
          href: '/docs/modules/ai-gateway',
        },
        {
          type: 'link',
          label: '2. AI Governance — Access, Vault & Guardrails',
          href: '/docs/modules/ai-governance',
        },
        {
          type: 'link',
          label: '3. AI FinOps — Micro-Dollar Ledger & Quotas',
          href: '/docs/modules/ai-finops',
        },
        {
          type: 'link',
          label: '4. AI Observability — Telemetry & Operator UI',
          href: '/docs/modules/ai-observability',
        },
        {
          type: 'link',
          label: '5. AI Agent Management — MCP, A2A & Tool Loops',
          href: '/docs/modules/ai-agent-management',
        },
        {
          type: 'link',
          label: 'Deployment & Storage Topologies',
          href: '/docs/operations/deployment-and-storage',
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

import { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const SITE_URL = process.env.DOCUSAURUS_URL || 'https://goroute-ai.github.io';

const config: Config = {
  title: 'GoRoute AI Control Plane',
  tagline: 'A clear path from AI idea to production',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: SITE_URL,
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  organizationName: 'goroute-ai',
  projectName: 'goroute-ai.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  clientModules: [
    require.resolve('./src/clientModules/d3-transition.ts'),
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/img/favicon.svg',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/favicon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'text/plain',
        title: 'llms.txt',
        href: '/llms.txt',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'text/plain',
        title: 'llms-full.txt',
        href: '/llms-full.txt',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#080f1b',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'GoRoute AI',
            description:
              'Enterprise AI Control Plane in pure Go: AI Gateway, Governance, FinOps, Observability, and Agent Management.',
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/img/logo-icon.png`,
              width: 512,
              height: 512,
            },
            sameAs: ['https://github.com/goroute-ai/ai-gateway-go'],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'GoRoute AI Control Plane',
            description:
              'Enterprise AI Control Plane in pure Go: AI Gateway, Governance, FinOps, Observability, and Agent Management.',
            publisher: {
              '@id': `${SITE_URL}/#organization`,
            },
          },
        ],
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateTime: true,
          editUrl: 'https://github.com/goroute-ai/goroute-ai.github.io/tree/main/',
        },
        blog: false,
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**', '/search'],
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items.map((item) => {
              if (item.url === `${SITE_URL}/` || item.url === SITE_URL) {
                return { ...item, priority: 1.0, changefreq: 'weekly' };
              }
              if (/\/docs\/(start|gateway|governance|finops|agents|deploy)(\/|$)/.test(item.url)) {
                return { ...item, priority: 0.9, changefreq: 'weekly' };
              }
              if (/\/docs\/(providers|sdk|api|integrations)(\/|$)/.test(item.url)) {
                return { ...item, priority: 0.8, changefreq: 'weekly' };
              }
              if (/\/docs\/(examples|releases|contributing)(\/|$)/.test(item.url)) {
                return { ...item, priority: 0.6, changefreq: 'monthly' };
              }
              return item;
            });
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // getting-started -> start
          { from: '/docs/getting-started/overview', to: '/docs/start/overview' },
          { from: '/docs/getting-started/learning-path', to: '/docs/start/overview' },
          { from: '/docs/getting-started/quickstart-cli', to: '/docs/start/quickstart-gateway' },
          { from: '/docs/getting-started/quickstart-docker', to: '/docs/start/quickstart-docker' },
          { from: '/docs/getting-started/quickstart-sdk', to: '/docs/start/quickstart-sdk' },
          { from: '/docs/getting-started/architecture', to: '/docs/start/architecture' },

          // modules -> gateway / governance / finops / deploy / agents
          { from: '/docs/modules/ai-gateway', to: '/docs/gateway' },
          { from: '/docs/modules/ai-governance', to: '/docs/governance' },
          { from: '/docs/modules/ai-finops', to: '/docs/finops' },
          { from: '/docs/modules/ai-observability', to: '/docs/deploy/observability' },
          { from: '/docs/modules/ai-agent-management', to: '/docs/agents' },

          // data-plane -> gateway/endpoints
          { from: '/docs/data-plane/audio', to: '/docs/gateway/endpoints/audio' },
          { from: '/docs/data-plane/autonomous-tool-loop', to: '/docs/gateway/endpoints/autonomous-tool-loop' },
          { from: '/docs/data-plane/batches', to: '/docs/gateway/endpoints/batches' },
          { from: '/docs/data-plane/chat-completions', to: '/docs/gateway/endpoints/chat-completions' },
          { from: '/docs/data-plane/completions', to: '/docs/gateway/endpoints/completions' },
          { from: '/docs/data-plane/embeddings', to: '/docs/gateway/endpoints/embeddings' },
          { from: '/docs/data-plane/files', to: '/docs/gateway/endpoints/files' },
          { from: '/docs/data-plane/images', to: '/docs/gateway/endpoints/images' },
          { from: '/docs/data-plane/messages', to: '/docs/gateway/endpoints/messages' },
          { from: '/docs/data-plane/model-management', to: '/docs/gateway/endpoints/model-management' },
          { from: '/docs/data-plane/moderations', to: '/docs/gateway/endpoints/moderations' },
          { from: '/docs/data-plane/realtime', to: '/docs/gateway/endpoints/realtime' },
          { from: '/docs/data-plane/rerank', to: '/docs/gateway/endpoints/rerank' },
          { from: '/docs/data-plane/responses', to: '/docs/gateway/endpoints/responses' },
          { from: '/docs/data-plane/tokenize', to: '/docs/gateway/endpoints/tokenize' },
          { from: '/docs/data-plane/tool-calling', to: '/docs/gateway/endpoints/tool-calling' },

          // routing-resiliency -> gateway
          { from: '/docs/routing-resiliency/complexity-classifier', to: '/docs/gateway/routing-and-load-balancing' },
          { from: '/docs/routing-resiliency/load-balancing', to: '/docs/gateway/routing-and-load-balancing' },
          { from: '/docs/routing-resiliency/circuit-breakers', to: '/docs/gateway/resiliency-and-fallbacks' },
          { from: '/docs/routing-resiliency/fallbacks-and-retries', to: '/docs/gateway/resiliency-and-fallbacks' },

          // finops-and-security -> gateway / governance / finops
          { from: '/docs/finops-and-security/exact-match-cache', to: '/docs/gateway/caching' },
          { from: '/docs/finops-and-security/virtual-keys', to: '/docs/governance/virtual-keys' },
          { from: '/docs/finops-and-security/rbac-and-vault', to: '/docs/governance/rbac-and-vault' },
          { from: '/docs/finops-and-security/guardrails', to: '/docs/governance/guardrails' },
          { from: '/docs/finops-and-security/ssrf-and-network', to: '/docs/governance/network-and-ssrf' },
          { from: '/docs/finops-and-security/micro-dollar-ledger', to: '/docs/finops/micro-dollar-ledger' },
          { from: '/docs/finops-and-security/sliding-window-ratelimit', to: '/docs/finops/rate-limiting' },
          { from: '/docs/finops-and-security/preflight-tokenizer', to: '/docs/finops/preflight-tokenization' },

          // protocols -> agents
          { from: '/docs/protocols/mcp-overview', to: '/docs/agents/mcp-overview' },
          { from: '/docs/protocols/mcp-hub-and-rest', to: '/docs/agents/mcp-hub-and-rest' },
          { from: '/docs/protocols/mcp-progressive-discovery', to: '/docs/agents/mcp-progressive-discovery' },
          { from: '/docs/protocols/mcp-stdio-sandboxing', to: '/docs/agents/mcp-stdio-sandboxing' },
          { from: '/docs/protocols/a2a-overview', to: '/docs/agents/a2a-overview' },
          { from: '/docs/protocols/a2a-agent-cards', to: '/docs/agents/a2a-agent-cards' },
          { from: '/docs/protocols/a2a-bridge-and-grpc', to: '/docs/agents/a2a-bridge-and-grpc' },

          // operations -> deploy / contributing
          { from: '/docs/operations/configuration', to: '/docs/deploy/configuration' },
          { from: '/docs/operations/operator-ui', to: '/docs/deploy/operator-ui' },
          { from: '/docs/operations/deployment-and-storage', to: '/docs/deploy/deployment-and-storage' },
          { from: '/docs/operations/kubernetes-kustomize', to: '/docs/deploy/kubernetes-kustomize' },
          { from: '/docs/operations/observability', to: '/docs/deploy/observability' },
          { from: '/docs/operations/production-checklist', to: '/docs/deploy/production-checklist' },
          { from: '/docs/operations/troubleshooting', to: '/docs/deploy/troubleshooting' },
          { from: '/docs/operations/claude-code-and-agents', to: '/docs/contributing/claude-code-and-agents' },

          // cookbook & demos -> examples
          { from: '/docs/cookbook/overview', to: '/docs/examples/overview' },
          { from: '/docs/demos/overview', to: '/docs/examples/overview' },
          { from: '/docs/demos/hello-gateway', to: '/docs/examples/hello-gateway' },
          { from: '/docs/demos/system-prompt', to: '/docs/examples/system-prompt' },
          { from: '/docs/demos/streaming-tokens', to: '/docs/examples/streaming-tokens' },
          { from: '/docs/demos/temperature-and-sampling', to: '/docs/examples/temperature-and-sampling' },
          { from: '/docs/demos/json-mode-structured-output', to: '/docs/examples/json-mode-structured-output' },
          { from: '/docs/demos/multi-turn-conversation', to: '/docs/examples/multi-turn-conversation' },
          { from: '/docs/demos/openai-direct', to: '/docs/examples/openai-direct' },
          { from: '/docs/demos/anthropic-direct', to: '/docs/examples/anthropic-direct' },
          { from: '/docs/demos/gemini-direct', to: '/docs/examples/gemini-direct' },
          { from: '/docs/demos/local-ollama', to: '/docs/examples/local-ollama' },
          { from: '/docs/demos/unified-model-alias', to: '/docs/examples/unified-model-alias' },
          { from: '/docs/demos/single-tool-definition', to: '/docs/examples/single-tool-definition' },
          { from: '/docs/demos/tool-execution-callback', to: '/docs/examples/tool-execution-callback' },
          { from: '/docs/demos/multi-tool-selection', to: '/docs/examples/multi-tool-selection' },
          { from: '/docs/demos/autonomous-tool-loop', to: '/docs/examples/autonomous-tool-loop' },
          { from: '/docs/demos/failover-fallback-chain', to: '/docs/examples/failover-fallback-chain' },
          { from: '/docs/demos/round-robin-balancer', to: '/docs/examples/round-robin-balancer' },
          { from: '/docs/demos/weighted-shuffle-routing', to: '/docs/examples/weighted-shuffle-routing' },
          { from: '/docs/demos/least-latency-ewma', to: '/docs/examples/least-latency-ewma' },
          { from: '/docs/demos/circuit-breaker', to: '/docs/examples/circuit-breaker' },
          { from: '/docs/demos/exact-match-cache', to: '/docs/examples/exact-match-cache' },
          { from: '/docs/demos/sliding-window-rate-limiting', to: '/docs/examples/sliding-window-rate-limiting' },
          { from: '/docs/demos/virtual-keys-and-budgets', to: '/docs/examples/virtual-keys-and-budgets' },
          { from: '/docs/demos/mcp-virtual-hub', to: '/docs/examples/mcp-virtual-hub' },
          { from: '/docs/demos/a2a-agent-network', to: '/docs/examples/a2a-agent-network' },
          { from: '/docs/demos/embedded-http-microservice', to: '/docs/examples/embedded-http-microservice' },

          // api-reference -> api
          { from: '/docs/api-reference/overview', to: '/docs/api/overview' },
          { from: '/docs/api-reference/gateway-api', to: '/docs/api/gateway-api' },
          { from: '/docs/api-reference/admin-api', to: '/docs/api/admin-api' },
          { from: '/docs/api-reference/mcp-api', to: '/docs/api/mcp-api' },
          { from: '/docs/api-reference/a2a-api', to: '/docs/api/a2a-api' },

          // release-notes -> releases
          { from: '/docs/release-notes', to: '/docs/releases' },
          { from: '/docs/release-notes/v1.6.0', to: '/docs/releases/v1.6.0' },
          { from: '/docs/release-notes/v1.5.0', to: '/docs/releases/v1.5.0' },

          // directory & legacy root redirects
          { from: '/docs', to: '/docs/start/overview' },
          { from: '/docs/start', to: '/docs/start/overview' },
          { from: '/docs/providers', to: '/docs/providers/overview' },
          { from: '/docs/deploy', to: '/docs/deploy/configuration' },
          { from: '/docs/contributing', to: '/docs/contributing/claude-code-and-agents' },
          { from: '/docs/sdk', to: '/docs/sdk/overview' },
          { from: '/docs/integrations', to: '/docs/integrations/overview' },
          { from: '/docs/examples', to: '/docs/examples/overview' },
          { from: '/docs/api', to: '/docs/api/overview' },
          { from: '/docs/getting-started', to: '/docs/start/overview' },
          { from: '/docs/modules', to: '/docs/start/overview' },
          { from: '/docs/data-plane', to: '/docs/gateway/endpoints/chat-completions' },
          { from: '/docs/routing-resiliency', to: '/docs/gateway/routing-and-load-balancing' },
          { from: '/docs/finops-and-security', to: '/docs/governance' },
          { from: '/docs/protocols', to: '/docs/agents/mcp-overview' },
          { from: '/docs/operations', to: '/docs/deploy/configuration' },
          { from: '/docs/demos', to: '/docs/examples/overview' },
          { from: '/docs/cookbook', to: '/docs/examples/overview' },
          { from: '/docs/api-reference', to: '/docs/api/overview' },
        ],
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        docsRouteBasePath: '/docs',
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/og-card.png',
    metadata: [
      {
        name: 'keywords',
        content:
          'Go AI gateway, AI control plane, LLM gateway Go, GoRoute, AI FinOps, AI governance, virtual API keys, MCP virtual hub, A2A protocol, OpenAI compatible gateway, Go SDK',
      },
      { name: 'author', content: 'GoRoute AI' },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { property: 'og:site_name', content: 'GoRoute AI Control Plane' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: 'GoRoute AI control plane for model routing, governance, and observability',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
      options: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
    navbar: {
      title: 'GoRoute AI',
      logo: {
        alt: 'GoRoute AI Control Plane Logo',
        src: 'img/logo-icon.png',
        srcDark: 'img/logo-icon.png',
        width: 36,
        height: 36,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Start here',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'Build with Go',
        },
        {
          type: 'docSidebar',
          sidebarId: 'demosSidebar',
          position: 'left',
          label: 'Examples',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API reference',
        },
        {
          href: 'https://github.com/goroute-ai/ai-gateway-go',
          label: 'GitHub',
          position: 'right',
          className: 'navbar-github-link',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'go', 'python', 'typescript', 'sql', 'protobuf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

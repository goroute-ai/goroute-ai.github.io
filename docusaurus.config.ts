import { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const SITE_URL = process.env.DOCUSAURUS_URL || 'https://goroute-ai.github.io';

const config: Config = {
  title: 'GoRoute AI Control Plane',
  tagline: 'Enterprise AI Control Plane — Gateway, Governance, FinOps, Observability & Agent Management',
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
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/favicon.png',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#0b1120',
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
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/img/logo-icon.png`,
            },
            sameAs: ['https://github.com/goroute-ai/ai-gateway-go'],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'GoRoute AI Control Plane',
            description:
              'Enterprise AI Control Plane in pure Go — AI Gateway, Governance, FinOps, Observability, and Agent Management.',
            publisher: {
              '@id': `${SITE_URL}/#organization`,
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
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
              if (/\/docs\/(getting-started|modules)\//.test(item.url)) {
                return { ...item, priority: 0.9, changefreq: 'weekly' };
              }
              if (/\/docs\/(providers|sdk|api-reference|protocols)\//.test(item.url)) {
                return { ...item, priority: 0.8, changefreq: 'weekly' };
              }
              if (/\/docs\/(demos|release-notes)\//.test(item.url)) {
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
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: 'GoRoute AI Control Plane — Enterprise AI Gateway, Governance, FinOps, Observability & Agent Management in Pure Go',
      },
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
      title: 'GoRoute AI Control Plane',
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
          label: 'Control Plane',
        },
        {
          type: 'dropdown',
          label: 'Modules',
          position: 'left',
          items: [
            { label: '1. AI Gateway', to: '/docs/modules/ai-gateway' },
            { label: '2. AI Governance', to: '/docs/modules/ai-governance' },
            { label: '3. AI FinOps', to: '/docs/modules/ai-finops' },
            { label: '4. AI Observability', to: '/docs/modules/ai-observability' },
            { label: '5. AI Agent Management', to: '/docs/modules/ai-agent-management' },
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'architectureSidebar',
          position: 'left',
          label: 'Architecture',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'Go SDK',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'integrationsSidebar',
          position: 'left',
          label: 'Integrations',
        },
        {
          type: 'docSidebar',
          sidebarId: 'demosSidebar',
          position: 'left',
          label: 'Examples',
        },
        {
          type: 'docSidebar',
          sidebarId: 'releaseNotesSidebar',
          position: 'left',
          label: 'Release Notes',
        },
        {
          href: 'https://github.com/goroute-ai/ai-gateway-go',
          label: 'GitHub',
          position: 'right',
          className: 'navbar-github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Control Plane',
          items: [
            { label: 'Overview', to: '/docs/getting-started/overview' },
            { label: '1. AI Gateway', to: '/docs/modules/ai-gateway' },
            { label: '2. AI Governance', to: '/docs/modules/ai-governance' },
            { label: '3. AI FinOps', to: '/docs/modules/ai-finops' },
            { label: '4. AI Observability', to: '/docs/modules/ai-observability' },
            { label: '5. AI Agent Management', to: '/docs/modules/ai-agent-management' },
          ],
        },
        {
          title: 'Developers',
          items: [
            { label: 'Go SDK Quickstart', to: '/docs/getting-started/quickstart-sdk' },
            { label: 'Go SDK Reference', to: '/docs/sdk/go-sdk-reference' },
            { label: 'API Reference', to: '/docs/api-reference/overview' },
            { label: '73+ Providers Matrix', to: '/docs/providers/overview' },
            { label: 'Runnable Go Demos', to: '/docs/demos/overview' },
          ],
        },
        {
          title: 'Protocols & Operations',
          items: [
            { label: 'MCP Virtual Hub', to: '/docs/protocols/mcp-overview' },
            { label: 'A2A Protocol', to: '/docs/protocols/a2a-overview' },
            { label: 'Docker Quickstart', to: '/docs/getting-started/quickstart-docker' },
            { label: 'Kubernetes & Kustomize', to: '/docs/operations/kubernetes-kustomize' },
            { label: 'Production Checklist', to: '/docs/operations/production-checklist' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'GitHub Repository', href: 'https://github.com/goroute-ai/ai-gateway-go' },
            { label: 'Release Notes', to: '/docs/release-notes' },
            { label: 'llms.txt (AI Index)', href: 'pathname:///llms.txt' },
            { label: 'llms-full.txt (Full Corpus)', href: 'pathname:///llms-full.txt' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} GoRoute AI Control Plane. Built in 100% Pure Go. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'go', 'python', 'typescript', 'sql', 'protobuf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

import { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'GoRoute AI Gateway',
  tagline: 'Go SDK and self-hosted AI Gateway documentation',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: process.env.DOCUSAURUS_URL || 'https://goroute-ai.github.io',
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  organizationName: 'goroute-ai',
  projectName: 'goroute-ai.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

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
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    mermaid: {
      theme: { light: 'dark', dark: 'dark' },
      options: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
    navbar: {
      title: 'GoRoute AI Gateway',
      logo: {
        alt: 'GoRoute AI Gateway Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.svg',
        width: 36,
        height: 36,
      },
      items: [
        {
          href: '/docs/getting-started/quickstart-sdk',
          position: 'left',
          label: 'Quickstart',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'demosSidebar',
          position: 'left',
          label: 'Examples',
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
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} GoRoute AI Gateway. Built in 100% Pure Go. Licensed under Apache 2.0.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'go', 'python', 'typescript', 'sql', 'protobuf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

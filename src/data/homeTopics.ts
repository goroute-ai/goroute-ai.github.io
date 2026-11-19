import type { LucideIcon } from 'lucide-react';
import { BookOpen, Boxes, Braces, Compass, Route, ShieldCheck, Waypoints } from 'lucide-react';

export type TopicId = 'start' | 'routing' | 'governance' | 'observability' | 'agents';

export interface TopicQuickLink {
  label: string;
  href: string;
}

export interface TopicItem {
  id: TopicId;
  number: string;
  chapterLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
  quickLinks: TopicQuickLink[];
  statusChips: string[];
}

export interface WorkflowItem {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SectionNavItem {
  id: string;
  shortLabel: string;
  label: string;
}

export const HERO_CONTENT = {
  eyebrow: 'GoRoute documentation',
  title: 'Give every AI request a clear path.',
  lead: 'GoRoute sits between your application and AI providers. It helps your team choose where requests go, protect how they are used, and understand what happens along the way.',
  primaryCta: {
    label: 'Get to know GoRoute',
    href: '/docs/start/overview',
  },
  secondaryCta: {
    label: 'Browse practical guides',
    href: '/docs/examples/overview',
  },
} as const;

export const TOPIC_ITEMS: TopicItem[] = [
  {
    id: 'start',
    number: '01',
    chapterLabel: 'Foundations',
    eyebrow: '01 · Foundations',
    title: 'Get oriented',
    description: 'Understand where GoRoute fits and choose a setup that matches your architecture.',
    href: '/docs/start/overview',
    ctaLabel: 'Explore overview',
    icon: Compass,
    quickLinks: [
      { label: 'Architecture overview', href: '/docs/start/architecture' },
      { label: 'Standalone gateway quickstart', href: '/docs/start/quickstart-gateway' },
      { label: 'Embedded Go SDK quickstart', href: '/docs/start/quickstart-sdk' },
      { label: 'Docker Compose quickstart', href: '/docs/start/quickstart-docker' },
    ],
    statusChips: ['Single Binary', 'Embedded Go SDK', 'Docker & Helm'],
  },
  {
    id: 'routing',
    number: '02',
    chapterLabel: 'AI Gateway',
    eyebrow: '02 · AI Gateway',
    title: 'Route AI requests',
    description: 'Direct inference across providers with adaptive load balancing, automatic failover, and exact-match caching.',
    href: '/docs/gateway',
    ctaLabel: 'Explore AI Gateway',
    icon: Route,
    quickLinks: [
      { label: 'Routing and load balancing', href: '/docs/gateway/routing-and-load-balancing' },
      { label: 'Resiliency and fallbacks', href: '/docs/gateway/resiliency-and-fallbacks' },
      { label: 'Two-tier response caching', href: '/docs/gateway/caching' },
      { label: 'Supported model providers', href: '/docs/providers/overview' },
    ],
    statusChips: ['Unified /v1/*', 'EWMA & Fallbacks', '2-Tier Cache'],
  },
  {
    id: 'governance',
    number: '03',
    chapterLabel: 'Security & FinOps',
    eyebrow: '03 · Security & FinOps',
    title: 'Protect your AI workflows',
    description: 'Enforce virtual key scopes, guardrails, SSRF boundaries, and deterministic micro-dollar budgets.',
    href: '/docs/governance',
    ctaLabel: 'Explore governance',
    icon: ShieldCheck,
    quickLinks: [
      { label: 'Virtual keys and scopes', href: '/docs/governance/virtual-keys' },
      { label: 'RBAC and credentials vault', href: '/docs/governance/rbac-and-vault' },
      { label: 'Two-layer guardrails engine', href: '/docs/governance/guardrails' },
      { label: 'Micro-dollar FinOps ledger', href: '/docs/finops/micro-dollar-ledger' },
    ],
    statusChips: ['Virtual Keys', '19 Guardrail Drivers', '64-bit FinOps'],
  },
  {
    id: 'observability',
    number: '04',
    chapterLabel: 'Telemetry & Console',
    eyebrow: '04 · Telemetry & Console',
    title: 'Understand what is happening',
    description: 'Track latency, spend, and guardrail evaluations with OpenTelemetry traces, Prometheus metrics, and the Operator UI.',
    href: '/docs/deploy/observability',
    ctaLabel: 'Explore observability',
    icon: Waypoints,
    quickLinks: [
      { label: 'Gateway observability', href: '/docs/deploy/observability' },
      { label: 'OpenTelemetry and Prometheus', href: '/docs/integrations/otel-and-prometheus' },
      { label: 'Embedded Operator Web UI', href: '/docs/deploy/operator-ui' },
      { label: 'Production readiness checklist', href: '/docs/deploy/production-checklist' },
    ],
    statusChips: ['OTLP Spans', 'Prometheus /metrics', 'Operator /ui/'],
  },
  {
    id: 'agents',
    number: '05',
    chapterLabel: 'MCP & A2A',
    eyebrow: '05 · MCP & A2A',
    title: 'Connect agents and tools',
    description: 'Bring MCP servers, sandboxed tool execution, and A2A agent discovery into one governed workflow.',
    href: '/docs/agents',
    ctaLabel: 'Explore agents',
    icon: Boxes,
    quickLinks: [
      { label: 'MCP Virtual Hub and REST', href: '/docs/agents/mcp-hub-and-rest' },
      { label: 'Progressive tool discovery', href: '/docs/agents/mcp-progressive-discovery' },
      { label: 'Stdio tool sandboxing', href: '/docs/agents/mcp-stdio-sandboxing' },
      { label: 'A2A protocol and Agent Cards', href: '/docs/agents/a2a-overview' },
    ],
    statusChips: ['MCP Virtual Hub', 'Tool Sandboxing', 'A2A v1.0'],
  },
];

export const WORKFLOW_ITEMS: WorkflowItem[] = [
  {
    title: 'Build inside a Go app',
    description: 'Use the Go SDK when you want the gateway to live inside your service.',
    href: '/docs/start/quickstart-sdk',
    label: 'Explore the Go SDK',
    icon: Braces,
  },
  {
    title: 'Run a shared gateway',
    description: 'Deploy a gateway that your apps and existing SDKs can connect to.',
    href: '/docs/start/quickstart-gateway',
    label: 'Set up a gateway',
    icon: Route,
  },
  {
    title: 'Find a task or endpoint',
    description: 'Browse practical examples, supported providers, and the API reference.',
    href: '/docs/examples/overview',
    label: 'Browse examples',
    icon: BookOpen,
  },
];

export const REFERENCE_LINKS: TopicQuickLink[] = [
  { label: 'Browse providers', href: '/docs/providers/overview' },
  { label: 'Open the API reference', href: '/docs/api/overview' },
  { label: 'Prepare for production', href: '/docs/deploy/production-checklist' },
];

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  { id: 'hero', shortLabel: 'Top', label: 'Overview' },
  ...TOPIC_ITEMS.map((item) => ({
    id: item.id,
    shortLabel: item.number,
    label: `${item.number} · ${item.chapterLabel}`,
  })),
  { id: 'workflows', shortLabel: '06', label: '06 · Start Building' },
];

/**
 * Builds structured SoftwareApplication JSON-LD metadata for the landing page.
 */
export function buildSoftwareAppSchema(siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GoRoute AI Control Plane',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows',
    programmingLanguage: 'Go',
    license: 'https://opensource.org/licenses/Apache-2.0',
    url: siteUrl,
    image: `${siteUrl}/img/og-card.png`,
    codeRepository: 'https://github.com/goroute-ai/ai-gateway-go',
    description:
      'A Go AI gateway that helps teams connect model providers, guide requests, protect applications, and understand AI usage.',
    featureList: [
      'Connect applications with AI model providers through a shared gateway or Go SDK',
      'Manage routing, access rules, safety checks, cost controls, and service health',
      'Connect agent workflows and tools through governed protocols',
    ],
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

import React, { ReactNode, useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const pillars = [
  {
    badge: 'MODULE 01 · TRAFFIC & ROUTING',
    title: '1. AI Gateway',
    text: '23 /v1 routes, 73+ provider profiles, adaptive load balancing, 3-state circuit breakers, and 2-tier exact-match cache.',
    link: '/docs/modules/ai-gateway',
    label: 'Explore AI Gateway',
  },
  {
    badge: 'MODULE 02 · ACCESS & POLICY',
    title: '2. AI Governance',
    text: 'Scoped Virtual API Keys, RBAC, AES-256-GCM credential vault, input/output guardrails, and SSRF protection.',
    link: '/docs/modules/ai-governance',
    label: 'Explore AI Governance',
  },
  {
    badge: 'MODULE 03 · COST & QUOTAS',
    title: '3. AI FinOps',
    text: '64-bit integer micro-dollar ledger, versioned modality pricing, sliding-window rate limits, and pre-flight tokenization.',
    link: '/docs/modules/ai-finops',
    label: 'Explore AI FinOps',
  },
  {
    badge: 'MODULE 04 · TELEMETRY & UI',
    title: '4. AI Observability',
    text: 'OpenTelemetry tracing, Prometheus metrics, embedded Operator Web UI (/ui/), and deployment health probes.',
    link: '/docs/modules/ai-observability',
    label: 'Explore Observability',
  },
  {
    badge: 'MODULE 05 · MCP & A2A',
    title: '5. AI Agent Management',
    text: 'MCP Virtual Hub with stdio sandboxing, signed A2A Agent Cards & gRPC, and autonomous multi-turn tool loops.',
    link: '/docs/modules/ai-agent-management',
    label: 'Explore Agent Management',
  },
];

const paths = [
  {
    number: '01',
    badge: 'EMBEDDED GO CONTROL PLANE',
    title: 'Embed with the Go SDK',
    summary: 'Run the full AI Control Plane in-process inside your Go services with zero proxy hop overhead.',
    topics: [
      'Installation & pkg/gateway setup',
      'Client options, routing & fallbacks',
      'Chat completions & streaming iterators',
    ],
    link: '/docs/getting-started/quickstart-sdk',
    label: 'Go SDK Quickstart',
  },
  {
    number: '02',
    badge: 'CONTAINER & KUBERNETES',
    title: 'Deploy the Control Plane',
    summary: 'Standalone binary, Docker Compose, or Kubernetes Kustomize with Operator UI and HA storage.',
    topics: [
      'Docker Compose, CLI & Kustomize overlays',
      'Operator Console (/ui/) visual management',
      'PostgreSQL & Redis Cluster/Sentinel state',
    ],
    link: '/docs/getting-started/quickstart-docker',
    label: 'Deployment Options',
  },
  {
    number: '03',
    badge: 'GOVERNANCE & FINOPS',
    title: 'Enforce Policy & Budgets',
    summary: 'Protect every model, tool, and agent call with Virtual Keys, guardrails, and micro-dollar ledgers.',
    topics: [
      'Virtual API Keys, RBAC & AES-256-GCM vault',
      'Micro-dollar spend caps & rate limiting',
      'Input/output guardrails & SSRF policy',
    ],
    link: '/docs/modules/ai-governance',
    label: 'Governance & FinOps',
  },
  {
    number: '04',
    badge: 'AGENTS & EXAMPLES',
    title: 'Agents, MCP & Runnable Demos',
    summary: 'Complete Go recipes for MCP tool hubs, A2A agent networks, and resilient multi-provider routing.',
    topics: [
      '26 runnable atomic Go demonstrations',
      'MCP Virtual Hub & A2A agent bridge',
      'Claude Code, Codex & IDE integrations',
    ],
    link: '/docs/demos/overview',
    label: 'View Code Demos',
  },
];

function CopyInstallButton(): ReactNode {
  const [copied, setCopied] = useState(false);
  const command = 'curl -fsSL https://raw.githubusercontent.com/goroute-ai/ai-gateway-go/main/install.sh | bash';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      className="home-code-hint__copy"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy install command'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/+$/, '');
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GoRoute AI Control Plane',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows',
    programmingLanguage: 'Go',
    license: 'https://opensource.org/licenses/Apache-2.0',
    url: `${siteUrl}/`,
    codeRepository: 'https://github.com/goroute-ai/ai-gateway-go',
    description:
      'Pure Go enterprise AI gateway and embeddable Go SDK with 73+ provider profiles, virtual API keys, micro-dollar FinOps, OpenTelemetry, MCP Virtual Hub, and A2A.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GoRoute AI',
      url: `${siteUrl}/`,
    },
  };

  return (
    <Layout
      title="Go AI Gateway & Enterprise Control Plane"
      description="Embeddable Go AI SDK and standalone LLM gateway with 73+ providers, virtual keys, micro-dollar FinOps, OpenTelemetry observability, MCP hub, and A2A."
    >
      <Head>
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(softwareAppSchema)}</script>
      </Head>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="home-eyebrow">GoRoute · Enterprise AI Control Plane</p>
            <h1>A Go AI Gateway and Control Plane for Production AI.</h1>
            <p className="home-hero__lead">
              Build with an embeddable Go SDK or deploy a standalone gateway to route models, govern access, manage AI costs, observe traffic, and connect agents.
            </p>
            <div className="home-actions">
              <Link className="button button--primary button--lg" to="/docs/getting-started/overview">
                Explore Product Capabilities <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/getting-started/quickstart-sdk">
                Start with the Go SDK
              </Link>
            </div>
            <div className="home-code-hint">
              <div className="home-code-hint__content">
                <span className="home-code-hint__prompt">$</span>
                <code>curl -fsSL https://raw.githubusercontent.com/goroute-ai/ai-gateway-go/main/install.sh | bash</code>
              </div>
              <CopyInstallButton />
            </div>
          </div>
          <div className="home-hero__diagram" aria-label="Request flow from Go application through GoRoute to an AI provider">
            <div className="flow-node flow-node--client">
              <span>YOUR APP / CLIENTS</span>
              <strong>Go SDK & HTTP / WS</strong>
            </div>
            <div className="flow-line"><span>inspect & route</span></div>
            <div className="flow-node flow-node--gateway">
              <span>GOROUTE AI CONTROL PLANE</span>
              <strong>Gateway · Governance · FinOps · Agents</strong>
            </div>
            <div className="flow-line"><span>upstream dialect</span></div>
            <div className="flow-node flow-node--provider">
              <span>UPSTREAM PROVIDERS</span>
              <strong>Universal Model Integrations</strong>
            </div>
          </div>
        </section>

        <section className="home-paths" aria-labelledby="home-pillars-title">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Control Plane Modules</p>
              <h2 id="home-pillars-title">Five unified modules for production AI</h2>
            </div>
            <p>Every capability required to route, govern, account for, observe, and orchestrate enterprise AI workloads.</p>
          </div>
          <div className="home-pillars">
            {pillars.map((pillar) => (
              <article className="home-pillar-card" key={pillar.title}>
                <span className="home-pillar-card__badge">{pillar.badge}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                <Link to={pillar.link}>{pillar.label} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-paths" aria-labelledby="home-paths-title" style={{ paddingTop: '1rem' }}>
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Choose your path</p>
              <h2 id="home-paths-title">Find the guide you need</h2>
            </div>
            <p>Step-by-step setup guides, deep architecture runbooks, and interactive code examples.</p>
          </div>
          <div className="home-path-grid">
            {paths.map((path) => (
              <article className="home-path-card" key={path.number}>
                <div className="home-path-card__header">
                  <span className="home-path-card__number">{path.number}</span>
                  <span className="home-path-card__badge">{path.badge}</span>
                </div>
                <h3>{path.title}</h3>
                <p className="home-path-card__summary">{path.summary}</p>
                <ul className="home-path-card__topics">
                  {path.topics.map((topic) => (
                    <li key={topic}>
                      <span className="home-path-card__bullet" aria-hidden="true">›</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
                <Link className="home-path-card__cta" to={path.link}>
                  {path.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

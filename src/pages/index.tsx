import React, { ReactNode, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const pillars = [
  {
    badge: 'GUI CONSOLE · PORT 8080',
    title: 'Operator Console',
    text: 'Zero-dependency browser dashboard for live cluster telemetry, virtual key management, and financial audits.',
    link: '/docs/operations/operator-ui',
    label: 'Explore Operator Console',
  },
  {
    badge: 'DATA PLANE · UNIFIED',
    title: 'Multi-Modal Data Plane',
    text: 'High-throughput unified routing for chat, audio transcription, image synthesis, and realtime WebSockets.',
    link: '/docs/data-plane/chat-completions',
    label: 'Browse Data Plane',
  },
  {
    badge: 'ECOSYSTEM · ADAPTERS',
    title: 'Provider Ecosystem',
    text: 'Native zero-overhead adapters for dedicated cloud providers, local Ollama, and OpenAI-compatible engines.',
    link: '/docs/providers/overview',
    label: 'View Providers',
  },
  {
    badge: 'FINOPS · SUB-CENT ACCURACY',
    title: 'Micro-Dollar FinOps',
    text: '64-bit micro-dollar accounting with tenant virtual keys, spend caps, rate limiting, and response caching.',
    link: '/docs/finops-and-security/micro-dollar-ledger',
    label: 'FinOps Architecture',
  },
];

const paths = [
  {
    number: '01',
    badge: 'EMBEDDED GO LIBRARY',
    title: 'Embed with the Go SDK',
    summary: 'Direct in-process integration for Go backend services needing zero network proxy overhead.',
    topics: [
      'Installation & pkg/gateway setup',
      'Client options, context & timeouts',
      'Chat completions & streaming iterators',
    ],
    link: '/docs/getting-started/quickstart-sdk',
    label: 'Go SDK Quickstart',
  },
  {
    number: '02',
    badge: 'CONTAINER & CLUSTER',
    title: 'Deploy Standalone Proxy',
    summary: 'Containerized deployment with the embedded Operator Console and state storage.',
    topics: [
      'Docker Compose & single binary CLI',
      'Operator Console visual management',
      'PostgreSQL & Redis state storage',
    ],
    link: '/docs/getting-started/quickstart-docker',
    label: 'Deployment Options',
  },
  {
    number: '03',
    badge: 'UNIFIED ENDPOINTS',
    title: 'Multi-Modal Data Plane',
    summary: 'Standardized HTTP and WebSocket routes across any upstream AI provider dialect.',
    topics: [
      'Chat completions & thinking blocks',
      'Speech STT/TTS & image generation',
      'Realtime WebSocket data plane',
    ],
    link: '/docs/data-plane/chat-completions',
    label: 'Explore Routes',
  },
  {
    number: '04',
    badge: 'RUNNABLE EXAMPLES',
    title: 'Interactive Demos & Protocols',
    summary: 'Complete Go code recipes for resilient traffic routing, MCP tools, and agent networks.',
    topics: [
      '26 runnable atomic Go demonstrations',
      'EWMA balancers & circuit breakers',
      'MCP Virtual Hub & A2A agent network',
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
  return (
    <Layout
      title="GoRoute AI Gateway · Go SDK, Standalone Proxy & Operator Console"
      description="Production-grade AI gateway for Go. Unified multi-modal routing, native provider adapters, embedded Operator Web UI (/ui/), and micro-dollar FinOps."
    >
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="home-eyebrow">GoRoute AI Gateway · Enterprise AI Infrastructure</p>
            <h1>Build your AI integration in Go.</h1>
            <p className="home-hero__lead">
              Embed the gateway directly in your Go services with zero external network overhead, or deploy it as a standalone high-performance proxy with real-time observability and sub-cent FinOps accounting.
            </p>
            <div className="home-actions">
              <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart-sdk">
                Start with the Go SDK <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/operations/operator-ui">
                Operator Console
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
              <span>GOROUTE AI GATEWAY</span>
              <strong>Operator Console & FinOps Engine</strong>
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
              <p className="home-eyebrow">Enterprise Architecture</p>
              <h2 id="home-pillars-title">Engineered for production scale</h2>
            </div>
            <p>From embedded microservices to multi-tenant clusters, GoRoute provides complete control over AI workloads.</p>
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

import React, { ReactNode, useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

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
    softwareVersion: '1.7.0',
    license: 'https://opensource.org/licenses/Apache-2.0',
    url: siteUrl,
    image: `${siteUrl}/img/og-card.png`,
    codeRepository: 'https://github.com/goroute-ai/ai-gateway-go',
    description:
      'Pure Go enterprise AI gateway and embeddable Go SDK with 73+ provider profiles, virtual API keys, micro-dollar FinOps, OpenTelemetry, MCP Virtual Hub, and A2A.',
    featureList: [
      '73+ LLM provider profiles and 23 /v1 data plane routes',
      'Scoped Virtual API Keys, 4-layer RBAC, AES-256-GCM vault, and SSRF firewall',
      '64-bit integer micro-dollar FinOps ledger and Redis Lua rate limits',
      'OpenTelemetry distributed tracing, Prometheus metrics, and embedded Operator Web UI',
      'MCP Virtual Hub with stdio sandboxing and A2A v1.0 protocol bridge',
      'Zero-hop embeddable Go SDK (pkg/gateway)',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@id': `${siteUrl}/#organization`,
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
            <p className="home-eyebrow">
              GoRoute · Enterprise AI Control Plane ·{' '}
              <Link className="home-eyebrow__release" to="/docs/releases">
                v1.7.0
              </Link>
            </p>
            <h1>A Go AI Gateway and Control Plane for Production AI.</h1>
            <p className="home-hero__lead">
              Build with an embeddable Go SDK or deploy a standalone gateway to route models, govern access, manage AI costs, observe traffic, and connect agents.
            </p>
            <div className="home-actions">
              <Link className="button button--primary button--lg" to="/docs/start/overview">
                Explore Product Capabilities <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/start/quickstart-sdk">
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
      </main>
    </Layout>
  );
}

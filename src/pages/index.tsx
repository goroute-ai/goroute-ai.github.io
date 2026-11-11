import React, { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const pillars = [
  {
    badge: 'GUI CONSOLE · PORT 8080',
    title: 'Operator Web UI',
    text: 'Zero-dependency browser dashboard served directly at /ui/. Live cluster telemetry, API key management, pricing catalog sync, deployment health, and ledger audits.',
    link: '/docs/operations/operator-ui',
    label: 'Explore Operator UI',
  },
  {
    badge: 'DATA PLANE · 21 ROUTES',
    title: '21 Multi-Modal Routes',
    text: 'Chat completions, rerank, moderations, messages with thinking blocks, fast tokenization, audio STT/TTS, image generation, files, batches, and realtime WebSockets.',
    link: '/docs/data-plane/chat-completions',
    label: 'Browse Data Plane',
  },
  {
    badge: 'ECOSYSTEM · 42 ADAPTERS',
    title: '42 Provider Integrations',
    text: 'Native drivers for OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock, Google Vertex AI, Azure OpenAI, Cohere, Mistral, Ollama, plus universal OpenAI-compatible engines.',
    link: '/docs/providers/overview',
    label: 'View Providers',
  },
  {
    badge: 'FINOPS · SUB-CENT ACCURACY',
    title: 'Micro-Dollar FinOps',
    text: 'High-precision 64-bit micro-dollar accounting ($0.000001). Tenant virtual keys, hard/soft budget caps, sliding-window rate limiters, exact-match cache, and SSRF guardrails.',
    link: '/docs/finops-and-security/micro-dollar-ledger',
    label: 'FinOps Architecture',
  },
];

const paths = [
  {
    number: '01',
    title: 'Embed with the Go SDK',
    text: 'Add the gateway to your Go service with zero external network overhead, unified types, and resilient streaming.',
    link: '/docs/getting-started/quickstart-sdk',
    label: 'Start with the SDK',
  },
  {
    number: '02',
    title: 'Run Standalone & Operator UI',
    text: 'Deploy the standalone Go binary or Docker Compose stack, complete with the Operator Web UI at http://localhost:8080/ui/.',
    link: '/docs/getting-started/quickstart-cli',
    label: 'Deployment options',
  },
  {
    number: '03',
    title: 'Explore Multi-Modal Routes',
    text: 'Use standardized endpoints for text completions, audio transcription, image synthesis, batch queues, and realtime audio.',
    link: '/docs/data-plane/chat-completions',
    label: 'Browse route guides',
  },
  {
    number: '04',
    title: 'Work with the API & Protocols',
    text: 'Reference specifications for inference routes, admin control plane, MCP tools, and A2A multi-agent networks.',
    link: '/docs/api-reference/overview',
    label: 'Browse API guides',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="GoRoute AI Gateway · Go SDK, Standalone Proxy & Operator Console"
      description="Production-grade AI gateway for Go. 21 multi-modal data plane routes, 42 provider dialects, embedded Operator Web UI (/ui/), and micro-dollar FinOps."
    >
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="home-eyebrow">GoRoute AI Gateway · Enterprise AI Infrastructure</p>
            <h1>Build your AI integration in Go.</h1>
            <p className="home-hero__lead">
              Embed the gateway in your Go application, or run it as a standalone high-performance proxy.
              Unify <strong>21 multi-modal data plane routes</strong> across <strong>42 provider dialects</strong>,
              inspect real-time traffic in the <strong>Operator Web UI (/ui/)</strong>, and enforce sub-cent <strong>micro-dollar FinOps</strong>.
            </p>
            <div className="home-actions">
              <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart-sdk">
                Start with the Go SDK <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/operations/operator-ui">
                Operator Console (/ui/)
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/getting-started/architecture">
                Architecture
              </Link>
            </div>
            <div className="home-code-hint">
              <span className="home-code-hint__prompt">$</span>
              <code>curl -fsSL https://raw.githubusercontent.com/goroute-ai/ai-gateway-go/main/install.sh | bash</code>
            </div>
          </div>
          <div className="home-hero__diagram" aria-label="Request flow from Go application through GoRoute to an AI provider">
            <div className="flow-node flow-node--client">
              <span>YOUR APP / CLIENTS</span>
              <strong>Go SDK & HTTP / WS</strong>
              <small>Port 8080 · 21 Multi-Modal Routes</small>
            </div>
            <div className="flow-line"><span>inspect & route</span></div>
            <div className="flow-node flow-node--gateway">
              <span>GOROUTE AI GATEWAY</span>
              <strong>Operator UI & FinOps Engine</strong>
              <small>/ui/ · Micro-Dollar Ledger · 64-bit Math</small>
            </div>
            <div className="flow-line"><span>upstream dialect</span></div>
            <div className="flow-node flow-node--provider">
              <span>UPSTREAM PROVIDERS</span>
              <strong>42 Model Integrations</strong>
              <small>OpenAI · Claude · Gemini · Bedrock · Ollama</small>
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
                <span className="home-path-card__number">{path.number}</span>
                <h3>{path.title}</h3>
                <p>{path.text}</p>
                <Link to={path.link}>{path.label} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-more" aria-label="More documentation">
          <div><span className="home-more__icon">{`{ }`}</span><span><strong>Go SDK</strong><small>Embedding, configuration, chat streaming, and types</small></span><Link to="/docs/sdk/overview" aria-label="Explore Go SDK documentation">→</Link></div>
          <div><span className="home-more__icon">◈</span><span><strong>Operator Web UI</strong><small>Cluster metrics, key vault, and catalog at /ui/</small></span><Link to="/docs/operations/operator-ui" aria-label="Explore Operator UI">→</Link></div>
          <div><span className="home-more__icon">⚡</span><span><strong>21 Data Plane Routes</strong><small>Chat, rerank, audio, images, files, and realtime</small></span><Link to="/docs/data-plane/chat-completions" aria-label="Explore Data Plane">→</Link></div>
          <div><span className="home-more__icon">↗</span><span><strong>42 Providers</strong><small>Dedicated cloud, local Ollama, and OpenAI-compatible</small></span><Link to="/docs/providers/overview" aria-label="Explore provider documentation">→</Link></div>
          <div><span className="home-more__icon">⌘</span><span><strong>Micro-Dollar FinOps</strong><small>Virtual keys, 64-bit ledger, and token caching</small></span><Link to="/docs/finops-and-security/micro-dollar-ledger" aria-label="Explore FinOps documentation">→</Link></div>
          <div><span className="home-more__icon">⌕</span><span><strong>26 Runnable Demos</strong><small>Complete Go examples for routing, MCP, and failover</small></span><Link to="/docs/demos/overview" aria-label="Explore examples">→</Link></div>
        </section>
      </main>
    </Layout>
  );
}

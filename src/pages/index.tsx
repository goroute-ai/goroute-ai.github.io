import React, { ReactNode } from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import DeveloperPathsSection from '../components/home/DeveloperPathsSection';
import HeroSection from '../components/home/HeroSection';
import PillarShowcaseBand from '../components/home/PillarShowcaseBand';
import PlatformMetricsStrip from '../components/home/PlatformMetricsStrip';
import styles from '../components/home/Home.module.css';
import { PILLAR_BANDS } from '../data/homeContent';

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
    softwareVersion: '1.8.0',
    license: 'https://opensource.org/licenses/Apache-2.0',
    url: siteUrl,
    image: `${siteUrl}/img/og-card.png`,
    codeRepository: 'https://github.com/goroute-ai/ai-gateway-go',
    description:
      'Pure Go enterprise AI gateway and embeddable Go SDK with 73+ provider profiles, Two-Layer Guardrails with 19 drivers, virtual API keys, micro-dollar FinOps, OpenTelemetry, MCP Virtual Hub, and A2A.',
    featureList: [
      '73+ LLM provider profiles and 24 primary /v1 data plane routes (73 Unified OpenAPI paths)',
      'Scoped Virtual API Keys, 4-layer RBAC, AES-256-GCM vault, and SSRF firewall',
      'Two-Layer Guardrails Engine with 19 drivers, 7 hooks, Starlark custom_code, and WithGuardrailScanner',
      '64-bit integer micro-dollar FinOps ledger and Redis Lua rate limits',
      'OpenTelemetry distributed tracing, Prometheus metrics, and Light/Dark Embedded Operator Web UI',
      'MCP Virtual Hub with zero-trust tool governance and A2A v1.0 protocol bridge',
      'Embeddable Go SDK (pkg/gateway)',
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
      description="Embeddable Go AI SDK and standalone LLM gateway with 73+ providers, Two-Layer Guardrails, micro-dollar FinOps, OpenTelemetry observability, MCP hub, and A2A."
    >
      <Head>
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(softwareAppSchema)}</script>
      </Head>
      <main className={`home-page ${styles.homeShell}`}>
        <HeroSection />
        <PlatformMetricsStrip />

        <section className={styles.pillarsWrapper} aria-labelledby="control-plane-modules-title">
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.sectionEyebrow}>Five Integrated Control Plane Modules</p>
              <h2 id="control-plane-modules-title" className={styles.sectionTitle}>
                Built top to bottom for production AI infrastructure
              </h2>
            </div>
            <p className={styles.sectionLead}>
              Every layer of the GoRoute control plane works together in a single static binary or embedded Go SDK.
            </p>
          </div>

          {PILLAR_BANDS.map((pillar) => (
            <PillarShowcaseBand key={pillar.id} pillar={pillar} />
          ))}
        </section>

        <DeveloperPathsSection />
      </main>
    </Layout>
  );
}

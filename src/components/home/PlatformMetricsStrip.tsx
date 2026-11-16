import React, { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { PILLAR_BANDS, PLATFORM_STATS } from '../../data/homeContent';
import styles from './Home.module.css';

const SHORT_PILLAR_LABELS: Record<(typeof PILLAR_BANDS)[number]['id'], string> = {
  gateway: 'AI Gateway',
  governance: 'AI Governance',
  finops: 'AI FinOps',
  observability: 'AI Observability',
  agents: 'AI Agent Management',
};

export default function PlatformMetricsStrip(): ReactNode {
  return (
    <section className={styles.metricsSection} aria-label="Verified platform capabilities">
      <div className={styles.statsGrid}>
        {PLATFORM_STATS.map((stat) => (
          <Link key={stat.label} className={styles.statCard} to={stat.to}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statDetail}>{stat.detail}</span>
          </Link>
        ))}
      </div>

      <nav className={styles.jumpBar} aria-label="Jump to control plane module">
        <span className={styles.jumpHeading}>Control Plane Architecture</span>
        <div className={styles.jumpPills}>
          {PILLAR_BANDS.map((pillar) => (
            <a key={pillar.id} className={styles.jumpPill} href={`#${pillar.id}`}>
              <span className={styles.jumpPillNum}>{pillar.number}</span>
              <span>{SHORT_PILLAR_LABELS[pillar.id]}</span>
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}

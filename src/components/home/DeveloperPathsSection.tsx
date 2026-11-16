import React, { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight } from 'lucide-react';
import { DEVELOPER_PATHS } from '../../data/homeContent';
import styles from './Home.module.css';

export default function DeveloperPathsSection(): ReactNode {
  return (
    <section className={styles.pathsSection} aria-labelledby="developer-paths-title">
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.sectionEyebrow}>Start Building</p>
          <h2 id="developer-paths-title" className={styles.sectionTitle}>
            Deploy, embed, and explore the reference guides
          </h2>
        </div>
        <p className={styles.sectionLead}>
          Choose a deployment topology, embed the Go SDK in-process, run the 26 Go examples, or browse interactive provider and endpoint catalogs.
        </p>
      </div>

      <div className={styles.pathsGrid}>
        {DEVELOPER_PATHS.map((path) => (
          <article key={path.number} className={styles.pathCard}>
            <div className={styles.pathCardHeader}>
              <span className={styles.pathNumber}>{path.number}</span>
              <span className={styles.pathBadge}>{path.badge}</span>
            </div>
            <h3 className={styles.pathTitle}>{path.title}</h3>
            <p className={styles.pathSummary}>{path.summary}</p>
            <ul className={styles.pathItems}>
              {path.items.map((item) => (
                <li key={item}>
                  <span className={styles.pathBullet} aria-hidden="true">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link className={styles.pathCta} to={path.to}>
              <span>{path.ctaLabel}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

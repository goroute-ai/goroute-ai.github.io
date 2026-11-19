import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight } from 'lucide-react';
import { HERO_CONTENT } from '../../data/homeTopics';
import HeroFlowDiagram from './diagrams/HeroFlowDiagram';
import styles from './Home.module.css';

/**
 * First-fold hero section introducing GoRoute with minimal copy, primary CTAs, and live architecture diagram.
 */
export default function HeroSection(): ReactNode {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{HERO_CONTENT.eyebrow}</p>
        <h1 id="home-title" className={styles.heroTitle}>
          {HERO_CONTENT.title}
        </h1>
        <p className={styles.heroLead}>{HERO_CONTENT.lead}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} to={HERO_CONTENT.primaryCta.href}>
            {HERO_CONTENT.primaryCta.label} <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className={styles.secondaryButton} to={HERO_CONTENT.secondaryCta.href}>
            {HERO_CONTENT.secondaryCta.label}
          </Link>
        </div>
      </div>
      <div className={styles.heroDiagram}>
        <HeroFlowDiagram />
      </div>
    </section>
  );
}

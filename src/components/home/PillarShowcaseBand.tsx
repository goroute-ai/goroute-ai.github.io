import React, { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import { Activity, ArrowRight, Bot, ChevronRight, Coins, Network, ShieldCheck } from 'lucide-react';
import type { PillarBand } from '../../data/homeContent';
import styles from './Home.module.css';

function renderPillarIcon(id: PillarBand['id']): ReactNode {
  switch (id) {
    case 'gateway':
      return <Network size={18} strokeWidth={1.8} aria-hidden="true" />;
    case 'governance':
      return <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />;
    case 'finops':
      return <Coins size={18} strokeWidth={1.8} aria-hidden="true" />;
    case 'observability':
      return <Activity size={18} strokeWidth={1.8} aria-hidden="true" />;
    case 'agents':
      return <Bot size={18} strokeWidth={1.8} aria-hidden="true" />;
  }
}

interface PillarShowcaseBandProps {
  pillar: PillarBand;
}

export default function PillarShowcaseBand({ pillar }: PillarShowcaseBandProps): ReactNode {
  return (
    <article id={pillar.id} className={styles.pillarBand} aria-labelledby={`pillar-title-${pillar.id}`}>
      <div>
        <div className={styles.pillarHeader}>
          <span className={styles.pillarIconBox}>{renderPillarIcon(pillar.id)}</span>
          <span className={styles.pillarEyebrow}>{pillar.eyebrow}</span>
        </div>

        <h2 id={`pillar-title-${pillar.id}`} className={styles.pillarTitle}>
          <Link className={styles.pillarTitleLink} to={pillar.to}>
            {pillar.title}
          </Link>
        </h2>

        <p className={styles.pillarSummary}>{pillar.summary}</p>

        <div className={styles.subtopicList}>
          {pillar.subtopics.map((sub) => (
            <Link key={sub.title} className={styles.subtopicCard} to={sub.to}>
              <div>
                <span className={styles.subtopicTitle}>{sub.title}</span>
                <span className={styles.subtopicDetail}>{sub.detail}</span>
              </div>
              <ChevronRight className={styles.subtopicArrow} size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>

        <Link className={styles.pillarCta} to={pillar.to}>
          <span>{pillar.ctaLabel}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <aside className={styles.specCard} aria-label={`${pillar.title} specification`}>
        <div className={styles.specCardHeader}>
          <span className={styles.specCardTitle}>{pillar.panelTitle}</span>
          <span className={styles.specCardBadge}>Verified Spec</span>
        </div>

        {pillar.panelType === 'code' && pillar.code ? (
          <div className={styles.specCodeWrap}>
            <CodeBlock language={pillar.codeLanguage ?? 'yaml'}>{pillar.code}</CodeBlock>
          </div>
        ) : (
          <div className={styles.specBody}>
            {pillar.specIntro && <p className={styles.specIntro}>{pillar.specIntro}</p>}
            <div className={styles.specRows}>
              {pillar.specRows?.map((row) => (
                <div key={row.label} className={styles.specRow}>
                  <span className={styles.specRowLabel}>{row.label}</span>
                  <span className={styles.specRowValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.tagRow}>
          {pillar.tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              {tag}
            </span>
          ))}
        </div>
      </aside>
    </article>
  );
}

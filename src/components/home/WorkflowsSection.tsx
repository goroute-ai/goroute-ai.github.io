import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight, Layers } from 'lucide-react';
import { REFERENCE_LINKS, WORKFLOW_ITEMS } from '../../data/homeTopics';
import ChapterBreak from './ChapterBreak';
import { useRevealOnScroll } from './useRevealOnScroll';
import styles from './Home.module.css';

/**
 * Bottom setup workflows section and reference links bar anchored with a chapter break.
 */
export default function WorkflowsSection(): ReactNode {
  const { ref, isHiddenForReveal, isRevealed } = useRevealOnScroll<HTMLElement>();
  const revealClass = isHiddenForReveal
    ? isRevealed
      ? styles.revealVisible
      : styles.revealPending
    : '';

  return (
    <section
      ref={ref}
      id="workflows"
      className={`${styles.workflowSection} ${revealClass}`}
      aria-labelledby="workflow-title"
    >
      <ChapterBreak number="06" label="Start Building" icon={Layers} />

      <div className={styles.sectionIntro}>
        <h2 id="workflow-title" className={styles.sectionTitle}>
          Start with the setup that fits your project.
        </h2>
      </div>

      <div className={styles.workflowGrid}>
        {WORKFLOW_ITEMS.map(({ title, description, href, label, icon: Icon }) => (
          <article key={title} className={styles.workflowCard}>
            <span className={styles.workflowIcon} aria-hidden="true">
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            <Link className={styles.cardLink} to={href}>
              {label} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <div className={styles.referenceBar}>
        <p>Already know what you need?</p>
        {REFERENCE_LINKS.map((link) => (
          <Link key={link.href} to={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

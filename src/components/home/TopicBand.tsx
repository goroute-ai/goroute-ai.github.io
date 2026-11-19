import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { TopicItem } from '../../data/homeTopics';
import ChapterBreak from './ChapterBreak';
import TopicFlowDiagram from './diagrams/TopicFlowDiagram';
import { useRevealOnScroll } from './useRevealOnScroll';
import styles from './Home.module.css';

interface TopicBandProps {
  item: TopicItem;
  totalChapters: string;
  reversed: boolean;
}

/**
 * Single full-window-height capability chapter with a numbered page break header,
 * concise quick-links, and its custom React + SVG flow diagram.
 */
export default function TopicBand({
  item,
  totalChapters,
  reversed,
}: TopicBandProps): ReactNode {
  const ItemIcon = item.icon;
  const { ref, isHiddenForReveal, isRevealed } = useRevealOnScroll<HTMLElement>();
  const revealClass = isHiddenForReveal
    ? isRevealed
      ? styles.revealVisible
      : styles.revealPending
    : '';

  return (
    <section
      ref={ref}
      id={item.id}
      aria-labelledby={`topic-heading-${item.id}`}
      className={`${styles.chapterSection} ${revealClass}`}
    >
      <ChapterBreak
        number={item.number}
        label={item.chapterLabel}
        total={totalChapters}
        icon={ItemIcon}
      />

      <article className={`${styles.showcasePanel} ${reversed ? styles.showcasePanelReversed : ''}`}>
        <div className={styles.showcaseCopy}>
          <div className={styles.showcaseBadgeRow}>
            <span className={styles.topicIcon} aria-hidden="true">
              <ItemIcon size={17} strokeWidth={1.85} />
            </span>
            <h2 id={`topic-heading-${item.id}`} className={styles.showcaseTitle}>
              {item.title}
            </h2>
          </div>

          <p className={styles.showcaseSummary}>{item.description}</p>

          <ul className={styles.quickLinkList}>
            {item.quickLinks.map((link) => (
              <li key={link.href}>
                <Link className={styles.quickLinkRow} to={link.href}>
                  <span className={styles.quickLinkDot} aria-hidden="true" />
                  <span className={styles.quickLinkLabel}>{link.label}</span>
                  <ChevronRight className={styles.quickLinkChevron} size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <Link className={styles.showcaseCta} to={item.href}>
            <span>{item.ctaLabel}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.showcaseDiagramWrap}>
          <TopicFlowDiagram topicId={item.id} chips={item.statusChips} />
        </div>
      </article>
    </section>
  );
}

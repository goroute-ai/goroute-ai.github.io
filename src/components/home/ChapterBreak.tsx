import React, { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './Home.module.css';

interface ChapterBreakProps {
  number: string;
  label: string;
  total?: string;
  icon?: LucideIcon;
}

/**
 * Full-width numbered chapter divider anchoring each full-window landing page section.
 */
export default function ChapterBreak({
  number,
  label,
  total,
  icon: Icon,
}: ChapterBreakProps): ReactNode {
  return (
    <div className={styles.chapterBreak}>
      <div className={styles.chapterBadge}>
        <span className={styles.chapterNum}>{number}</span>
        {Icon && (
          <span className={styles.chapterIcon} aria-hidden="true">
            <Icon size={14} strokeWidth={2} />
          </span>
        )}
        <span className={styles.chapterLabel}>{label}</span>
      </div>
      <span className={styles.chapterRule} aria-hidden="true" />
      {total && (
        <span className={styles.chapterCounter} aria-hidden="true">
          {number} / {total}
        </span>
      )}
    </div>
  );
}

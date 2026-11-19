import React, { useId, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from '../Home.module.css';

export type DiagramNodeTone = 'default' | 'primary' | 'provider' | 'policy' | 'signal';

interface DiagramCanvasProps {
  label: string;
  caption?: string;
  chips?: string[];
  compact?: boolean;
  children: ReactNode;
}

/**
 * Shared responsive dot-grid container for custom SVG/HTML architecture diagrams.
 */
export function DiagramCanvas({
  label,
  caption,
  chips,
  compact = false,
  children,
}: DiagramCanvasProps): ReactNode {
  return (
    <div
      className={`${styles.diagramCanvas} ${compact ? styles.diagramCanvasCompact : ''}`}
      role="img"
      aria-label={label}
    >
      {caption && (
        <div className={styles.diagramHeader}>
          <span className={styles.diagramDot} aria-hidden="true" />
          <span className={styles.diagramCaption}>{caption}</span>
        </div>
      )}
      <div className={styles.diagramStage}>{children}</div>
      {chips && chips.length > 0 && (
        <div className={styles.diagramChips} aria-hidden="true">
          {chips.map((chip) => (
            <span key={chip} className={styles.diagramChip}>
              <span className={styles.diagramChipDot} />
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DiagramNodeProps {
  title: string;
  subtitle?: string;
  badges?: string[];
  icon?: LucideIcon;
  tone?: DiagramNodeTone;
  highlighted?: boolean;
}

const TONE_CLASS: Record<DiagramNodeTone, string> = {
  default: '',
  primary: styles.diagramNodePrimary,
  provider: styles.diagramNodeProvider,
  policy: styles.diagramNodePolicy,
  signal: styles.diagramNodeSignal,
};

/**
 * Individual node block rendered inside a custom architecture diagram.
 */
export function DiagramNode({
  title,
  subtitle,
  badges,
  icon: Icon,
  tone = 'default',
  highlighted = false,
}: DiagramNodeProps): ReactNode {
  return (
    <div
      className={`${styles.diagramNode} ${TONE_CLASS[tone]} ${
        highlighted ? styles.diagramNodeHighlighted : ''
      }`}
    >
      <div className={styles.diagramNodeHeader}>
        {Icon && (
          <span className={styles.diagramNodeIcon} aria-hidden="true">
            <Icon size={15} strokeWidth={1.9} />
          </span>
        )}
        <span className={styles.diagramNodeTitle}>{title}</span>
      </div>
      {subtitle && <span className={styles.diagramNodeSub}>{subtitle}</span>}
      {badges && badges.length > 0 && (
        <div className={styles.diagramNodeBadges}>
          {badges.map((badge) => (
            <span key={badge} className={styles.diagramNodeBadge}>
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Responsive horizontal/vertical SVG connector arrow between sequential nodes.
 */
export function FlowArrow({ reverse = false }: { reverse?: boolean }): ReactNode {
  const markerId = useId();
  return (
    <div className={styles.flowArrowWrap} aria-hidden="true">
      <svg
        className={`${styles.flowArrowHorizontal} ${reverse ? styles.flowArrowFlip : ''}`}
        viewBox="0 0 44 20"
        fill="none"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0.5 0.75L5.25 3L0.5 5.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <line x1="2" y1="10" x2="39" y2="10" className={styles.flowTrackLine} />
        <line
          x1="2"
          y1="10"
          x2="39"
          y2="10"
          className={styles.flowPulseLine}
          markerEnd={`url(#${markerId})`}
        />
      </svg>
      <svg className={styles.flowArrowVertical} viewBox="0 0 20 30" fill="none">
        <line x1="10" y1="2" x2="10" y2="25" className={styles.flowTrackLine} />
        <line x1="10" y1="2" x2="10" y2="25" className={styles.flowPulseLine} />
        <path
          d="M6.5 21.5L10 26L13.5 21.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Smooth 1-to-2 Bezier branch SVG connector for forked target nodes.
 */
export function FlowBranchFork(): ReactNode {
  const markerId = useId();
  return (
    <div className={styles.flowForkWrap} aria-hidden="true">
      <svg className={styles.flowForkHorizontal} viewBox="0 0 48 112" fill="none" preserveAspectRatio="none">
        <defs>
          <marker
            id={markerId}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0.5 0.75L5.25 3L0.5 5.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <path d="M2 56 C 24 56, 22 24, 44 24" className={styles.flowTrackLine} />
        <path d="M2 56 C 24 56, 22 88, 44 88" className={styles.flowTrackLine} />
        <path
          d="M2 56 C 24 56, 22 24, 44 24"
          className={styles.flowPulseLine}
          markerEnd={`url(#${markerId})`}
        />
        <path
          d="M2 56 C 24 56, 22 88, 44 88"
          className={styles.flowPulseLine}
          markerEnd={`url(#${markerId})`}
        />
      </svg>
      <svg className={styles.flowArrowVertical} viewBox="0 0 20 30" fill="none">
        <line x1="10" y1="2" x2="10" y2="25" className={styles.flowTrackLine} />
        <line x1="10" y1="2" x2="10" y2="25" className={styles.flowPulseLine} />
        <path
          d="M6.5 21.5L10 26L13.5 21.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

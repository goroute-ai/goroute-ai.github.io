import React, { useEffect, useState, type ReactNode } from 'react';
import { SECTION_NAV_ITEMS } from '../../data/homeTopics';
import styles from './Home.module.css';

/**
 * Floating right-edge progress rail for wide desktop viewports, highlighting the current section
 * and smoothly scrolling to any chapter on click.
 */
export default function SectionScrollRail(): ReactNode {
  const [activeId, setActiveId] = useState<string>(SECTION_NAV_ITEMS[0].id);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elements = SECTION_NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -45% 0px',
        threshold: [0.1, 0.35, 0.6],
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const handleJump = (id: string) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <nav className={styles.scrollRail} aria-label="Landing page sections">
      {SECTION_NAV_ITEMS.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.scrollRailBtn} ${isActive ? styles.scrollRailBtnActive : ''}`}
            onClick={() => handleJump(item.id)}
            aria-label={`Jump to ${item.label}`}
            aria-current={isActive ? 'true' : undefined}
            title={item.label}
          >
            <span className={styles.scrollRailLabel}>{item.shortLabel}</span>
            <span className={styles.scrollRailDot} aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

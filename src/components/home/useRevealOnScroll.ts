import { useEffect, useRef, useState } from 'react';

export interface RevealOnScrollResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  isHiddenForReveal: boolean;
  isRevealed: boolean;
}

/**
 * Observes when a below-the-fold section enters the viewport to trigger a gentle reveal transition.
 * Keeps SSR content and reduced-motion views immediately visible with zero flash.
 */
export function useRevealOnScroll<T extends HTMLElement>(): RevealOnScrollResult<T> {
  const ref = useRef<T | null>(null);
  const [isHiddenForReveal, setIsHiddenForReveal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') {
      return;
    }

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.95) {
      return;
    }

    setIsHiddenForReveal(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -4% 0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isHiddenForReveal, isRevealed };
}

import React, { useMemo, type ReactNode } from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { ErrorBoundaryErrorMessageFallback } from '@docusaurus/theme-common';
import type { Props } from '@theme/Mermaid';
import { renderMermaidSVG } from 'beautiful-mermaid';
import styles from './styles.module.css';

const GOROUTE_THEME = {
  bg: '#000000',
  fg: '#E5E7EB',
  line: '#12C2EA',
  accent: '#7C3AED',
  muted: '#9CA3AF',
};

function BeautifulMermaidRenderer({ value }: Props): ReactNode {
  const svgHtml = useMemo(() => {
    try {
      return renderMermaidSVG(value, GOROUTE_THEME);
    } catch (err) {
      console.error('Error rendering diagram with beautiful-mermaid:', err);
      return null;
    }
  }, [value]);

  if (!svgHtml) {
    return null;
  }

  return (
    <div
      className={`docusaurus-mermaid-container ${styles.container}`}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

export default function Mermaid(props: Props): ReactNode {
  return (
    <ErrorBoundary
      fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}>
      <BeautifulMermaidRenderer {...props} />
    </ErrorBoundary>
  );
}

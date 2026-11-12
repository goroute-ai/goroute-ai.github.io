import React, { useMemo, type ReactNode } from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { ErrorBoundaryErrorMessageFallback, useColorMode } from '@docusaurus/theme-common';
import type { Props } from '@theme/Mermaid';
import { renderMermaidSVG } from 'beautiful-mermaid';
import styles from './styles.module.css';

const GOROUTE_THEME_DARK = {
  bg: '#000000',
  fg: '#E5E7EB',
  line: '#12C2EA',
  accent: '#7C3AED',
  muted: '#9CA3AF',
  surface: '#0D1117',
  border: '#30363D',
};

const GOROUTE_THEME_LIGHT = {
  bg: '#ffffff',
  fg: '#0f172a',
  line: '#0284c7',
  accent: '#7c3aed',
  muted: '#64748b',
  surface: '#f8fafc',
  border: '#cbd5e1',
};

function preprocessDiagram(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  if (!/^sequenceDiagram/i.test(trimmed)) {
    return input;
  }

  const lines = input.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    const l = line.trim();
    // Filter out autonumber directive which is unparsed by beautiful-mermaid
    if (l === 'autonumber') {
      continue;
    }
    processedLines.push(line);
  }

  return processedLines.join('\n');
}

function BeautifulMermaidRenderer({ value }: Props): ReactNode {
  const { colorMode } = useColorMode();
  const theme = colorMode === 'light' ? GOROUTE_THEME_LIGHT : GOROUTE_THEME_DARK;

  const svgHtml = useMemo(() => {
    try {
      const processed = preprocessDiagram(value);
      return renderMermaidSVG(processed, theme);
    } catch (err) {
      console.error('Error rendering diagram with beautiful-mermaid:', err);
      return null;
    }
  }, [value, theme]);

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

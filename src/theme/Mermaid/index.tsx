import React, { useMemo, type ReactNode } from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import { ErrorBoundaryErrorMessageFallback, useColorMode } from '@docusaurus/theme-common';
import type { Props } from '@theme/Mermaid';
import { renderMermaidSVG } from 'beautiful-mermaid';
import styles from './styles.module.css';

const GOROUTE_THEME_DARK = {
  bg: '#000000',
  fg: '#EAF2FB',
  line: '#22D3EE',
  accent: '#A78BFA',
  muted: '#9BB0C8',
  surface: '#0B0F13',
  border: '#263746',
};

const GOROUTE_THEME_LIGHT = {
  bg: '#F3F7FB',
  fg: '#10243A',
  line: '#087B9B',
  accent: '#6256C9',
  muted: '#5B7088',
  surface: '#FFFFFF',
  border: '#C6D7E6',
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

import React, { type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof DocItemLayoutType>;

export default function DocItemLayoutWrapper(props: Props): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const { metadata, frontMatter } = useDoc();

  const siteUrl = siteConfig.url.replace(/\/+$/, '');
  const canonicalUrl = metadata.permalink.startsWith('http')
    ? metadata.permalink
    : `${siteUrl}${metadata.permalink}`;

  const keywords = Array.isArray(frontMatter.keywords)
    ? frontMatter.keywords.join(', ')
    : typeof frontMatter.keywords === 'string'
      ? frontMatter.keywords
      : undefined;

  const techArticleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: metadata.title,
    description: metadata.description,
    url: canonicalUrl,
    inLanguage: 'en',
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@id': `${siteUrl}/#organization`,
    },
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  };

  if (typeof metadata.lastUpdatedAt === 'number' && Number.isFinite(metadata.lastUpdatedAt)) {
    techArticleSchema.dateModified = new Date(metadata.lastUpdatedAt).toISOString();
  }

  if (keywords) {
    techArticleSchema.keywords = keywords;
  }

  const rawFaq = (frontMatter as Record<string, unknown>).faq;
  const faqItems = Array.isArray(rawFaq)
    ? rawFaq.filter(
        (item): item is { q: string; a: string } =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as Record<string, unknown>).q === 'string' &&
          typeof (item as Record<string, unknown>).a === 'string' &&
          (item as { q: string }).q.trim().length > 0 &&
          (item as { a: string }).a.trim().length > 0
      )
    : [];

  const faqSchema =
    faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q.trim(),
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a.trim(),
            },
          })),
        }
      : null;

  return (
    <>
      <Head>
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(techArticleSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Head>
      <DocItemLayout {...props} />
    </>
  );
}

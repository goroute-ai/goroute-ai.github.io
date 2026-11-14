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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'GoRoute AI',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GoRoute AI',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/img/logo-icon.png`,
      },
    },
  };

  if (keywords) {
    techArticleSchema.keywords = keywords;
  }

  return (
    <>
      <Head>
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(techArticleSchema)}</script>
      </Head>
      <DocItemLayout {...props} />
    </>
  );
}

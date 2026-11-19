import React, { type ReactNode } from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HeroSection from '../components/home/HeroSection';
import SectionScrollRail from '../components/home/SectionScrollRail';
import TopicShowcase from '../components/home/TopicShowcase';
import WorkflowsSection from '../components/home/WorkflowsSection';
import { buildSoftwareAppSchema } from '../data/homeTopics';
import styles from '../components/home/Home.module.css';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/+$/, '');
  const softwareAppSchema = buildSoftwareAppSchema(siteUrl);

  return (
    <Layout
      title="Go AI Gateway Documentation"
      description="Learn how to connect AI providers, guide requests, protect your applications, and build with GoRoute."
    >
      <Head>
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(softwareAppSchema)}</script>
      </Head>
      <main className={`home-page ${styles.homeShell}`}>
        <SectionScrollRail />
        <HeroSection />
        <TopicShowcase />
        <WorkflowsSection />
      </main>
    </Layout>
  );
}

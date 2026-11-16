import React, { ReactNode, useState } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import { ArrowRight, Check, Copy } from 'lucide-react';
import {
  GATEWAY_VERSION,
  HERO_CODE_TABS,
  INSTALL_COMMANDS,
  type HeroCodeTab,
  type InstallCommand,
} from '../../data/homeContent';
import styles from './Home.module.css';

export default function HeroSection(): ReactNode {
  const [activeTabId, setActiveTabId] = useState<HeroCodeTab['id']>('go-sdk');
  const [installId, setInstallId] = useState<InstallCommand['id']>('shell');
  const [copied, setCopied] = useState(false);

  const activeTab = HERO_CODE_TABS.find((t) => t.id === activeTabId) ?? HERO_CODE_TABS[0];
  const activeInstall = INSTALL_COMMANDS.find((c) => c.id === installId) ?? INSTALL_COMMANDS[0];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeInstall.command).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <section className={styles.heroCard} aria-label="GoRoute Enterprise AI Control Plane">
      <div>
        <p className={styles.eyebrow}>
          <span>GoRoute Enterprise AI Control Plane</span>
          <Link className={styles.releaseBadge} to={`/docs/releases/${GATEWAY_VERSION}`}>
            {GATEWAY_VERSION}
          </Link>
        </p>
        <h1 className={styles.heroTitle}>A Go AI Gateway and Control Plane for Production AI.</h1>
        <p className={styles.heroLead}>
          Embed inside Go services via <code>pkg/gateway</code> or deploy a standalone gateway to route across 73+ providers, enforce Two-Layer Guardrails, track 64-bit micro-dollar FinOps, observe traffic, and govern MCP and A2A agents.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary button--lg" to="/docs/start/overview">
            Explore Documentation <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/start/quickstart-sdk">
            Go SDK Quickstart
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/api/overview">
            API Reference
          </Link>
        </div>
      </div>

      <div className={styles.codePanel}>
        <div className={styles.codePanelHeader}>
          <div className={styles.tabGroup} role="tablist" aria-label="Integration examples">
            {HERO_CODE_TABS.map((tab) => {
              const selected = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`${styles.tabBtn} ${selected ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.codePanelBody} role="tabpanel">
          <CodeBlock language={activeTab.language} title={activeTab.title}>
            {activeTab.code}
          </CodeBlock>
        </div>
        <div className={styles.codePanelFooter}>
          <span className={styles.codePanelFlow}>App / SDK -&gt; Guardrails &amp; FinOps -&gt; 73+ Providers</span>
          <Link className={styles.inlineLink} to={activeTab.docPath}>
            {activeTab.docLabel} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className={styles.installBar}>
        <div className={styles.installTabs} role="tablist" aria-label="Install commands">
          {INSTALL_COMMANDS.map((cmd) => {
            const selected = cmd.id === activeInstall.id;
            return (
              <button
                key={cmd.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`${styles.installTab} ${selected ? styles.installTabActive : ''}`}
                onClick={() => {
                  setInstallId(cmd.id);
                  setCopied(false);
                }}
              >
                {cmd.label}
              </button>
            );
          })}
        </div>
        <div className={styles.installCommandWrap}>
          <span className={styles.installPrompt} aria-hidden="true">$</span>
          <code className={styles.installCode}>{activeInstall.command}</code>
        </div>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={copied ? 'Copied command' : 'Copy command'}
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={2.4} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

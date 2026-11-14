import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  PROVIDER_PROFILES,
  type ProviderCapability,
  type ProviderCategory,
  type ProviderTier,
} from '../data/providers';
import styles from './Catalog.module.css';

const TIERS: Array<'All' | ProviderTier> = [
  'All',
  'Native Adapter',
  'Launch Set',
  'Built-in Dialect',
  'Extended Dialect',
  'Custom',
];

const CATEGORIES: Array<'All' | ProviderCategory> = [
  'All',
  'Cloud Flagship',
  'Fast Inference',
  'Regional & International',
  'Local & Self-Hosted',
  'Aggregators & Gateways',
  'Specialized & Embeddings',
];

const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
  chat: 'Chat',
  streaming: 'Streaming',
  tools: 'Tools',
  vision: 'Vision',
  reasoning: 'Reasoning',
  embeddings: 'Embeddings',
  structuredOutputs: 'JSON Schema',
  rerank: 'Rerank',
  audio: 'Audio',
  images: 'Images',
};

const FILTERABLE_CAPS: ProviderCapability[] = [
  'tools',
  'vision',
  'reasoning',
  'embeddings',
  'structuredOutputs',
  'rerank',
  'audio',
  'images',
];

export default function ProviderCatalog(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'All' | ProviderTier>('All');
  const [category, setCategory] = useState<'All' | ProviderCategory>('All');
  const [selectedCaps, setSelectedCaps] = useState<ProviderCapability[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROVIDER_PROFILES.filter((p) => {
      if (tier !== 'All' && p.tier !== tier) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (selectedCaps.length > 0 && !selectedCaps.every((c) => p.capabilities.includes(c))) {
        return false;
      }
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.defaultBaseURL.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.notes?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, tier, category, selectedCaps]);

  const toggleCap = (cap: ProviderCapability) => {
    setSelectedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const resetFilters = () => {
    setQuery('');
    setTier('All');
    setCategory('All');
    setSelectedCaps([]);
  };

  const copyId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1400);
  };

  const nativeCount = PROVIDER_PROFILES.filter((p) => p.tier === 'Native Adapter').length;
  const dialectCount = PROVIDER_PROFILES.filter(
    (p) => p.tier !== 'Native Adapter' && p.tier !== 'Custom'
  ).length;

  return (
    <div className={styles.catalogRoot}>
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{PROVIDER_PROFILES.length}</span>
          <span className={styles.statLabel}>Total Profiles</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{nativeCount}</span>
          <span className={styles.statLabel}>Native Adapters</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{dialectCount}</span>
          <span className={styles.statLabel}>Certified Dialects</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{filtered.length}</span>
          <span className={styles.statLabel}>Matching Filters</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by provider name, ID (e.g. deepseek, groq), or base URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search providers"
          />
          <select
            className={styles.selectInput}
            value={tier}
            onChange={(e) => setTier(e.target.value as 'All' | ProviderTier)}
            aria-label="Filter by adapter tier"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                Tier: {t}
              </option>
            ))}
          </select>
          <select
            className={styles.selectInput}
            value={category}
            onChange={(e) => setCategory(e.target.value as 'All' | ProviderCategory)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterPills}>
          <span className={styles.filterLabel}>Capabilities:</span>
          {FILTERABLE_CAPS.map((cap) => {
            const active = selectedCaps.includes(cap);
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCap(cap)}
                className={`${styles.pill} ${active ? styles.pillActive : ''}`}
              >
                {CAPABILITY_LABELS[cap]}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.resultCount}>
        <span>
          Showing <strong>{filtered.length}</strong> of {PROVIDER_PROFILES.length} provider profiles
        </span>
        {(query || tier !== 'All' || category !== 'All' || selectedCaps.length > 0) && (
          <button type="button" onClick={resetFilters} className={styles.resetBtn}>
            Reset filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          No providers match the active filters. Try clearing a capability or search term.
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4 className={styles.cardTitle}>
                    {p.docPath ? <Link to={p.docPath}>{p.displayName}</Link> : p.displayName}
                  </h4>
                </div>
                <span
                  className={`${styles.tierBadge} ${
                    p.tier === 'Native Adapter' ? styles.tierNative : ''
                  }`}
                >
                  {p.tier}
                </span>
              </div>

              <div className={styles.metaRow}>
                <button
                  type="button"
                  className={styles.codeId}
                  onClick={() => copyId(p.id)}
                  title="Click to copy provider ID"
                >
                  {copiedId === p.id ? 'Copied!' : p.id}
                </button>
                <span>{p.category}</span>
                <span>•</span>
                <span>{p.authType}</span>
              </div>

              {p.defaultBaseURL && (
                <div className={styles.baseUrl}>{p.defaultBaseURL}</div>
              )}

              {p.notes && <div className={styles.metaRow}>{p.notes}</div>}

              <div className={styles.capList}>
                {p.capabilities.map((cap) => (
                  <span key={cap} className={styles.capBadge}>
                    {CAPABILITY_LABELS[cap]}
                  </span>
                ))}
                {p.supportsListModels && (
                  <span className={styles.capBadge}>/models sync</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

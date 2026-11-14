import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  GATEWAY_ENDPOINTS,
  type EndpointAuth,
  type EndpointMethod,
  type EndpointSurface,
} from '../data/endpoints';
import styles from './Catalog.module.css';

const SURFACES: Array<'All' | EndpointSurface> = [
  'All',
  'Data Plane (/v1)',
  'OpenAI Direct (/openai/v1)',
  'Anthropic Native (/anthropic/v1)',
  'MCP (/mcp*)',
  'A2A (/a2a/v1)',
  'Admin Control Plane (/admin/v1)',
  'System & Telemetry',
];

const METHODS: Array<'All' | EndpointMethod> = ['All', 'GET', 'POST', 'DELETE', 'WS'];

const AUTHS: Array<'All' | EndpointAuth> = [
  'All',
  'Virtual API Key',
  'Master Admin Key',
  'Metrics Auth',
  'Public',
];

function methodBadgeClass(method: EndpointMethod): string {
  switch (method) {
    case 'GET':
      return styles.methodGET;
    case 'POST':
      return styles.methodPOST;
    case 'DELETE':
      return styles.methodDELETE;
    case 'WS':
      return styles.methodWS;
  }
}

export default function EndpointCatalog(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [surface, setSurface] = useState<'All' | EndpointSurface>('All');
  const [method, setMethod] = useState<'All' | EndpointMethod>('All');
  const [auth, setAuth] = useState<'All' | EndpointAuth>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GATEWAY_ENDPOINTS.filter((ep) => {
      if (surface !== 'All' && ep.surface !== surface) return false;
      if (method !== 'All' && ep.method !== method) return false;
      if (auth !== 'All' && ep.auth !== auth) return false;
      if (!q) return true;
      return (
        ep.path.toLowerCase().includes(q) ||
        ep.group.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.surface.toLowerCase().includes(q)
      );
    });
  }, [query, surface, method, auth]);

  const resetFilters = () => {
    setQuery('');
    setSurface('All');
    setMethod('All');
    setAuth('All');
  };

  const dataPlaneCount = GATEWAY_ENDPOINTS.filter(
    (e) =>
      e.surface === 'Data Plane (/v1)' ||
      e.surface === 'OpenAI Direct (/openai/v1)' ||
      e.surface === 'Anthropic Native (/anthropic/v1)'
  ).length;
  const adminCount = GATEWAY_ENDPOINTS.filter(
    (e) => e.surface === 'Admin Control Plane (/admin/v1)'
  ).length;
  const protocolCount = GATEWAY_ENDPOINTS.filter(
    (e) => e.surface === 'MCP (/mcp*)' || e.surface === 'A2A (/a2a/v1)'
  ).length;

  return (
    <div className={styles.catalogRoot}>
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{GATEWAY_ENDPOINTS.length}</span>
          <span className={styles.statLabel}>Total Endpoints</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{dataPlaneCount}</span>
          <span className={styles.statLabel}>Data Plane</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{adminCount}</span>
          <span className={styles.statLabel}>Admin Control</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{protocolCount}</span>
          <span className={styles.statLabel}>MCP &amp; A2A</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Filter endpoints by path (e.g. /v1/chat, /admin/v1/keys, /mcp) or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search endpoints"
          />
          <select
            className={styles.selectInput}
            value={surface}
            onChange={(e) => setSurface(e.target.value as 'All' | EndpointSurface)}
            aria-label="Filter by API surface"
          >
            {SURFACES.map((s) => (
              <option key={s} value={s}>
                Surface: {s}
              </option>
            ))}
          </select>
          <select
            className={styles.selectInput}
            value={auth}
            onChange={(e) => setAuth(e.target.value as 'All' | EndpointAuth)}
            aria-label="Filter by auth scheme"
          >
            {AUTHS.map((a) => (
              <option key={a} value={a}>
                Auth: {a}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterPills}>
          <span className={styles.filterLabel}>Method:</span>
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`${styles.pill} ${method === m ? styles.pillActive : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resultCount}>
        <span>
          Showing <strong>{filtered.length}</strong> of {GATEWAY_ENDPOINTS.length} endpoints
        </span>
        {(query || surface !== 'All' || method !== 'All' || auth !== 'All') && (
          <button type="button" onClick={resetFilters} className={styles.resetBtn}>
            Reset filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          No endpoints match the active filters.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Group</th>
                <th>Auth</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ep, idx) => (
                <tr key={`${ep.method}-${ep.path}-${idx}`}>
                  <td>
                    <span className={`${styles.methodBadge} ${methodBadgeClass(ep.method)}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td>
                    <Link to={ep.docPath} className={styles.pathCode}>
                      {ep.path}
                    </Link>
                  </td>
                  <td>{ep.group}</td>
                  <td>{ep.auth}</td>
                  <td>{ep.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

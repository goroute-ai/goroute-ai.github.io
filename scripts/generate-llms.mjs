#!/usr/bin/env node
/**
 * Generates static/llms.txt and static/llms-full.txt from sidebars.ts and docs/.
 * Also exports shared Markdown normalization helpers for scripts/postbuild-geo.mjs.
 * Uses DOCUSAURUS_URL (default: https://goroute-ai.github.io) and
 * DOCUSAURUS_BASE_URL (default: /).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT = path.resolve(__dirname, '..');
export const DOCS_DIR = path.join(ROOT, 'docs');
export const STATIC_DIR = path.join(ROOT, 'static');
export const SIDEBARS_PATH = path.join(ROOT, 'sidebars.ts');

export const SITE_URL = (process.env.DOCUSAURUS_URL || 'https://goroute-ai.github.io').replace(/\/+$/, '');
const rawBase = process.env.DOCUSAURUS_BASE_URL || '/';
export const BASE_URL = rawBase.startsWith('/')
  ? rawBase.endsWith('/')
    ? rawBase
    : `${rawBase}/`
  : `/${rawBase}/`;
export const SITE_ROOT = `${SITE_URL}${BASE_URL}`;

const OPTIONAL_DOC_CATEGORIES = new Set(['Contributing', 'Release Notes']);

export function parseSidebars(filePath = SIDEBARS_PATH) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const jsBody = raw
    .replace(/^import\s+type\s+[^;]+;\s*/gm, '')
    .replace(/^import\s+[^;]+;\s*/gm, '')
    .replace(/:\s*SidebarsConfig\b/g, '')
    .replace(/export\s+default\s+sidebars\s*;?/g, 'return sidebars;');

  const fn = new Function(jsBody);
  return fn();
}

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: content };
  }
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      let val = kv[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      meta[kv[1]] = val;
    }
  }
  return { meta, body: match[2] };
}

export function resolveDocFile(docId) {
  const candidates = [
    path.join(DOCS_DIR, `${docId}.md`),
    path.join(DOCS_DIR, `${docId}.mdx`),
    path.join(DOCS_DIR, docId, 'index.md'),
    path.join(DOCS_DIR, docId, 'index.mdx'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

export function normalizeDocId(docId, meta = {}) {
  if (meta.slug) {
    const slug = meta.slug.startsWith('/') ? meta.slug.slice(1) : meta.slug;
    return slug.replace(/\/+$/, '');
  }
  if (docId.endsWith('/index')) {
    return docId.slice(0, -'/index'.length);
  }
  if (docId === 'index') {
    return '';
  }
  return docId;
}

export function docUrl(docId, meta = {}, siteRoot = SITE_ROOT) {
  const norm = normalizeDocId(docId, meta);
  if (!norm) {
    return siteRoot;
  }
  return `${siteRoot}docs/${norm}`.replace(/\/+$/, '');
}

export function docMarkdownUrl(docId, meta = {}, siteRoot = SITE_ROOT) {
  const norm = normalizeDocId(docId, meta);
  if (!norm) {
    return `${siteRoot}docs.md`;
  }
  return `${siteRoot}docs/${norm}.md`;
}

function parseTsExportArray(filePath, exportName) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const stripped = raw
    .replace(/^export\s+type\s+[\s\S]*?;\s*$/gm, '')
    .replace(/^export\s+interface\s+[\s\S]*?\n\}\s*$/gm, '')
    .replace(new RegExp(`export\\s+const\\s+${exportName}[^=]*=`), 'return ');
  const fn = new Function(stripped);
  const result = fn();
  return Array.isArray(result) ? result : [];
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

export function loadCatalogSummaries() {
  const providers = parseTsExportArray(path.join(ROOT, 'src/data/providers.ts'), 'PROVIDER_PROFILES');
  const endpoints = parseTsExportArray(path.join(ROOT, 'src/data/endpoints.ts'), 'GATEWAY_ENDPOINTS');

  const providerLines = [
    `### Supported Provider Profiles (${providers.length} Built-in)`,
    '',
    '| ID | Provider | Tier | Category | Auth | Capabilities | Default Base URL |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
    ...providers.map((p) => {
      const caps = Array.isArray(p.capabilities) ? p.capabilities.join(', ') : '';
      return `| \`${escapeCell(p.id)}\` | ${escapeCell(p.displayName)} | ${escapeCell(p.tier)} | ${escapeCell(p.category)} | ${escapeCell(p.authType)} | ${escapeCell(caps)} | \`${escapeCell(p.defaultBaseURL)}\` |`;
    }),
  ];

  const endpointLines = [
    `### Gateway Endpoints (${endpoints.length} Documented)`,
    '',
    '| Method | Path | Surface | Auth | Summary |',
    '| :--- | :--- | :--- | :--- | :--- |',
    ...endpoints.map(
      (e) =>
        `| \`${escapeCell(e.method)}\` | \`${escapeCell(e.path)}\` | ${escapeCell(e.surface)} | ${escapeCell(e.auth)} | ${escapeCell(e.summary)} |`
    ),
  ];

  return {
    providerMarkdown: providerLines.join('\n'),
    endpointMarkdown: endpointLines.join('\n'),
  };
}

function resolveRelativeLink(target, docId, siteRoot) {
  if (/^(https?:|mailto:|#)/i.test(target)) {
    return target;
  }
  const hashIdx = target.indexOf('#');
  const rawPath = hashIdx >= 0 ? target.slice(0, hashIdx) : target;
  const hash = hashIdx >= 0 ? target.slice(hashIdx) : '';

  if (rawPath.startsWith('/docs/')) {
    return `${siteRoot}${rawPath.slice(1).replace(/\.(md|mdx)$/i, '')}${hash}`;
  }
  if (rawPath.startsWith('/img/')) {
    return `${siteRoot}${rawPath.slice(1)}${hash}`;
  }
  if (rawPath.startsWith('./') || rawPath.startsWith('../')) {
    const docDir = path.posix.dirname(docId);
    const resolved = path.posix.normalize(path.posix.join(docDir === '.' ? '' : docDir, rawPath));
    const cleaned = resolved.replace(/^\/+/, '').replace(/\.(md|mdx)$/i, '').replace(/\/index$/, '');
    return `${siteRoot}docs/${cleaned}${hash}`;
  }
  if (rawPath.startsWith('/')) {
    return `${siteRoot}${rawPath.slice(1)}${hash}`;
  }
  return target;
}

function normalizeMarkdownLinksOutsideFences(text, docId, siteRoot) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let openFence = null;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const char = fenceMatch[1][0];
      const len = fenceMatch[1].length;
      const rest = fenceMatch[2].trim();
      if (!openFence) {
        openFence = { char, len };
      } else if (openFence.char === char && len >= openFence.len && rest === '') {
        openFence = null;
      }
      out.push(line);
      continue;
    }

    if (openFence) {
      out.push(line);
      continue;
    }

    const updated = line.replace(/(!?\[[^\]]*\])\(([^)\s]+)(\s+"[^"]*")?\)/g, (full, label, href, titleAttr) => {
      const resolved = resolveRelativeLink(href, docId, siteRoot);
      return `${label}(${resolved}${titleAttr || ''})`;
    });
    out.push(updated);
  }

  return out.join('\n');
}

function transformMdxOutsideFences(text, catalogs) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let openFence = null;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const char = fenceMatch[1][0];
      const len = fenceMatch[1].length;
      const rest = fenceMatch[2].trim();
      if (!openFence) {
        openFence = { char, len };
      } else if (openFence.char === char && len >= openFence.len && rest === '') {
        openFence = null;
      }
      out.push(line);
      continue;
    }

    if (openFence) {
      out.push(line);
      continue;
    }

    if (/^import\s+[^\n]+from\s+['"][^'"]+['"];?\s*$/.test(trimmed)) {
      continue;
    }
    if (/^<\/?Tabs(\s+[^>]*)?>\s*$/.test(trimmed) || /^<\/TabItem>\s*$/.test(trimmed)) {
      continue;
    }
    const tabItemMatch = trimmed.match(/^<TabItem\b[^>]*\blabel=(?:"([^"]+)"|'([^']+)')[^>]*>\s*$/);
    if (tabItemMatch) {
      const label = tabItemMatch[1] || tabItemMatch[2];
      out.push('', `#### ${label}`, '');
      continue;
    }
    if (/^<ProviderCatalog\s*\/>\s*$/.test(trimmed)) {
      out.push('', catalogs.providerMarkdown, '');
      continue;
    }
    if (/^<EndpointCatalog\s*\/>\s*$/.test(trimmed)) {
      out.push('', catalogs.endpointMarkdown, '');
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

export function cleanBodyForMarkdown(body, { docId, siteRoot = SITE_ROOT, catalogs }) {
  const mdxNormalized = transformMdxOutsideFences(body, catalogs);
  const linksNormalized = normalizeMarkdownLinksOutsideFences(mdxNormalized, docId, siteRoot);
  return linksNormalized.replace(/\n{3,}/g, '\n\n').trim();
}

export function collectSidebarDocs(items, sectionTrail = []) {
  const results = [];
  if (!Array.isArray(items)) return results;

  for (const item of items) {
    if (typeof item === 'string') {
      results.push({ id: item, section: sectionTrail.join(' > ') });
    } else if (item && typeof item === 'object') {
      if (item.type === 'doc' && typeof item.id === 'string') {
        results.push({ id: item.id, section: sectionTrail.join(' > ') });
      } else if (item.type === 'category' && Array.isArray(item.items)) {
        const nextTrail = item.label ? [...sectionTrail, item.label] : sectionTrail;
        results.push(...collectSidebarDocs(item.items, nextTrail));
      }
    }
  }
  return results;
}

export const SIDEBAR_TITLES = {
  docsSidebar: 'Control Plane Documentation',
  sdkSidebar: 'Go SDK Handbook',
  demosSidebar: 'Runnable Go Examples',
  apiSidebar: 'API Reference',
};

function formatIndexLine(entry, seenDocs) {
  const filePath = resolveDocFile(entry.id);
  if (!filePath) return null;

  let docRecord = seenDocs.get(entry.id);
  if (!docRecord) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    docRecord = {
      id: entry.id,
      section: entry.section,
      title: meta.title || entry.id,
      description: meta.description || '',
      url: docUrl(entry.id, meta),
      mdUrl: docMarkdownUrl(entry.id, meta),
      meta,
      body,
    };
    seenDocs.set(entry.id, docRecord);
  }

  const desc = docRecord.description ? `: ${docRecord.description}` : '';
  return `- [${docRecord.title}](${docRecord.url}) ([md](${docRecord.mdUrl}))${desc}`;
}

export function main() {
  const sidebars = parseSidebars(SIDEBARS_PATH);
  const catalogs = loadCatalogSummaries();
  const seenDocs = new Map();
  const fullCorpusOrder = [];

  const indexLines = [
    '# GoRoute AI Control Plane',
    '',
    '> GoRoute AI Control Plane is a 100% pure Go Enterprise AI Control Plane and embeddable Go SDK spanning five core modules: 1. AI Gateway (23 /v1 routes, 73+ provider profiles, adaptive load balancing, circuit breakers, exact-match cache), 2. AI Governance (Virtual API Keys, RBAC, AES-256-GCM vault, guardrails, SSRF protection), 3. AI FinOps (64-bit micro-dollar accounting, sliding-window rate limits, pre-flight tokenization), 4. AI Observability (OpenTelemetry, Prometheus, Operator Web UI), and 5. AI Agent Management (MCP Virtual Hub, A2A protocol, autonomous tool loops).',
    '',
    `- Canonical Site: ${SITE_ROOT}`,
    `- Full Documentation Corpus: ${SITE_ROOT}llms-full.txt`,
    '',
  ];

  const optionalSections = [];

  // 1. Primary Control Plane Documentation (grouped by top-level docsSidebar categories)
  if (Array.isArray(sidebars.docsSidebar)) {
    indexLines.push(`## ${SIDEBAR_TITLES.docsSidebar}`, '');

    for (const topItem of sidebars.docsSidebar) {
      if (topItem && typeof topItem === 'object' && topItem.type === 'category') {
        const categoryLabel = topItem.label || 'Documentation';
        const entries = collectSidebarDocs(topItem.items, [categoryLabel]);
        if (entries.length === 0) continue;

        if (OPTIONAL_DOC_CATEGORIES.has(categoryLabel)) {
          optionalSections.push({
            heading: categoryLabel,
            sidebarHeading: SIDEBAR_TITLES.docsSidebar,
            entries,
          });
          continue;
        }

        indexLines.push(`### ${categoryLabel}`, '');
        for (const entry of entries) {
          const line = formatIndexLine(entry, seenDocs);
          if (line) {
            indexLines.push(line);
            fullCorpusOrder.push({ id: entry.id, section: `${SIDEBAR_TITLES.docsSidebar} > ${entry.section}` });
          }
        }
        indexLines.push('');
      } else if (typeof topItem === 'string' || (topItem && topItem.type === 'doc')) {
        const id = typeof topItem === 'string' ? topItem : topItem.id;
        const line = formatIndexLine({ id, section: '' }, seenDocs);
        if (line) {
          indexLines.push(line);
          fullCorpusOrder.push({ id, section: SIDEBAR_TITLES.docsSidebar });
        }
      }
    }
  }

  // 2. Remaining primary sidebars (sdkSidebar, apiSidebar)
  for (const sidebarKey of ['sdkSidebar', 'apiSidebar']) {
    const items = sidebars[sidebarKey];
    const heading = SIDEBAR_TITLES[sidebarKey] || sidebarKey;
    const entries = collectSidebarDocs(items);
    if (entries.length === 0) continue;

    indexLines.push(`## ${heading}`, '');
    for (const entry of entries) {
      const line = formatIndexLine(entry, seenDocs);
      if (line) {
        indexLines.push(line);
        const sectionLabel = entry.section ? `${heading} > ${entry.section}` : heading;
        fullCorpusOrder.push({ id: entry.id, section: sectionLabel });
      }
    }
    indexLines.push('');
  }

  // 3. Optional section (Runnable Go Examples, Contributing, Release Notes) per llmstxt.org spec
  const demoEntries = collectSidebarDocs(sidebars.demosSidebar);
  if (demoEntries.length > 0 || optionalSections.length > 0) {
    indexLines.push('## Optional', '');

    if (demoEntries.length > 0) {
      indexLines.push(`### ${SIDEBAR_TITLES.demosSidebar}`, '');
      for (const entry of demoEntries) {
        const line = formatIndexLine(entry, seenDocs);
        if (line) {
          indexLines.push(line);
          const sectionLabel = entry.section
            ? `${SIDEBAR_TITLES.demosSidebar} > ${entry.section}`
            : SIDEBAR_TITLES.demosSidebar;
          fullCorpusOrder.push({ id: entry.id, section: sectionLabel });
        }
      }
      indexLines.push('');
    }

    for (const opt of optionalSections) {
      indexLines.push(`### ${opt.heading}`, '');
      for (const entry of opt.entries) {
        const line = formatIndexLine(entry, seenDocs);
        if (line) {
          indexLines.push(line);
          fullCorpusOrder.push({ id: entry.id, section: `${opt.sidebarHeading} > ${entry.section}` });
        }
      }
      indexLines.push('');
    }
  }

  const fullParts = [
    '# GoRoute AI Control Plane: Complete Documentation Corpus',
    '',
    `Generated from ${SITE_ROOT}`,
    '',
  ];

  const emittedIds = new Set();
  for (const item of fullCorpusOrder) {
    if (emittedIds.has(item.id)) continue;
    emittedIds.add(item.id);
    const rec = seenDocs.get(item.id);
    if (!rec) continue;

    fullParts.push(
      '---',
      '',
      `## ${rec.title}`,
      `URL: ${rec.url}`,
      `Markdown: ${rec.mdUrl}`,
      `Section: ${item.section}`,
      '',
      cleanBodyForMarkdown(rec.body, { docId: rec.id, siteRoot: SITE_ROOT, catalogs }),
      ''
    );
  }

  fs.mkdirSync(STATIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATIC_DIR, 'llms.txt'), `${indexLines.join('\n').trim()}\n`, 'utf8');
  fs.writeFileSync(path.join(STATIC_DIR, 'llms-full.txt'), `${fullParts.join('\n').trim()}\n`, 'utf8');

  console.log(
    `Generated static/llms.txt and static/llms-full.txt (${emittedIds.size} unique docs, base=${SITE_ROOT})`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}

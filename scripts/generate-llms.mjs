#!/usr/bin/env node
/**
 * Generates static/llms.txt and static/llms-full.txt from sidebars.ts and docs/.
 * Uses DOCUSAURUS_URL (default: https://goroute-ai.github.io) and
 * DOCUSAURUS_BASE_URL (default: /).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const STATIC_DIR = path.join(ROOT, 'static');
const SIDEBARS_PATH = path.join(ROOT, 'sidebars.ts');

const SITE_URL = (process.env.DOCUSAURUS_URL || 'https://goroute-ai.github.io').replace(/\/+$/, '');
const rawBase = process.env.DOCUSAURUS_BASE_URL || '/';
const BASE_URL = rawBase.startsWith('/') ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`) : `/${rawBase}/`;

function parseSidebars(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const jsBody = raw
    .replace(/^import\s+type\s+[^;]+;\s*/gm, '')
    .replace(/^import\s+[^;]+;\s*/gm, '')
    .replace(/:\s*SidebarsConfig\b/g, '')
    .replace(/export\s+default\s+sidebars\s*;?/g, 'return sidebars;');

  const fn = new Function(jsBody);
  return fn();
}

function parseFrontmatter(content) {
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

function resolveDocFile(docId) {
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

function docUrl(docId, meta) {
  if (meta.slug) {
    const slug = meta.slug.startsWith('/') ? meta.slug.slice(1) : meta.slug;
    return `${SITE_URL}${BASE_URL}docs/${slug}`.replace(/\/+$/, '') || `${SITE_URL}${BASE_URL}`;
  }
  const normalizedId = docId.endsWith('/index')
    ? docId.slice(0, -'/index'.length)
    : docId === 'index'
      ? ''
      : docId;
  return `${SITE_URL}${BASE_URL}docs/${normalizedId}`.replace(/\/+$/, '');
}

function cleanBodyForFullTxt(body) {
  return body
    .replace(/^import\s+[^\n]+from\s+['"][^'"]+['"];?\s*\n?/gm, '')
    .replace(/<(ProviderCatalog|EndpointCatalog)\s*\/>\s*\n?/g, '')
    .trim();
}

function collectSidebarDocs(items, sectionTrail = []) {
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

const SIDEBAR_TITLES = {
  docsSidebar: 'Guides & Platform Documentation',
  architectureSidebar: 'System Architecture',
  sdkSidebar: 'Go SDK Handbook',
  integrationsSidebar: 'Integrations & Ecosystem',
  apiSidebar: 'API Reference',
  demosSidebar: 'Runnable Go Examples',
  releaseNotesSidebar: 'Release Notes',
};

function main() {
  const sidebars = parseSidebars(SIDEBARS_PATH);
  const seenIds = new Set();

  const indexLines = [
    '# GoRoute AI Control Plane',
    '',
    '> GoRoute AI Control Plane is a 100% pure Go Enterprise AI Control Plane and embeddable Go SDK spanning five core modules: 1. AI Gateway (23 /v1 routes, 73+ provider profiles, adaptive load balancing, circuit breakers, exact-match cache), 2. AI Governance (Virtual API Keys, RBAC, AES-256-GCM vault, guardrails, SSRF protection), 3. AI FinOps (64-bit micro-dollar accounting, sliding-window rate limits, pre-flight tokenization), 4. AI Observability (OpenTelemetry, Prometheus, Operator Web UI), and 5. AI Agent Management (MCP Virtual Hub, A2A protocol, autonomous tool loops).',
    '',
    `- Canonical Site: ${SITE_URL}${BASE_URL}`,
    `- Full Documentation Corpus: ${SITE_URL}${BASE_URL}llms-full.txt`,
    '',
  ];

  const fullParts = [
    '# GoRoute AI Control Plane — Complete Documentation Corpus',
    '',
    `Generated from ${SITE_URL}${BASE_URL}`,
    '',
  ];

  for (const [sidebarKey, items] of Object.entries(sidebars)) {
    const heading = SIDEBAR_TITLES[sidebarKey] || sidebarKey;
    const entries = collectSidebarDocs(items);
    if (entries.length === 0) continue;

    indexLines.push(`## ${heading}`, '');

    for (const entry of entries) {
      const filePath = resolveDocFile(entry.id);
      if (!filePath) continue;

      const raw = fs.readFileSync(filePath, 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const title = meta.title || entry.id;
      const desc = meta.description ? `: ${meta.description}` : '';
      const url = docUrl(entry.id, meta);

      indexLines.push(`- [${title}](${url})${desc}`);

      if (!seenIds.has(entry.id)) {
        seenIds.add(entry.id);
        fullParts.push(
          '---',
          '',
          `## ${title}`,
          `URL: ${url}`,
          entry.section ? `Section: ${heading} > ${entry.section}` : `Section: ${heading}`,
          '',
          cleanBodyForFullTxt(body),
          ''
        );
      }
    }

    indexLines.push('');
  }

  fs.mkdirSync(STATIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATIC_DIR, 'llms.txt'), `${indexLines.join('\n').trim()}\n`, 'utf8');
  fs.writeFileSync(path.join(STATIC_DIR, 'llms-full.txt'), `${fullParts.join('\n').trim()}\n`, 'utf8');

  console.log(
    `Generated static/llms.txt and static/llms-full.txt (${seenIds.size} unique docs, base=${SITE_URL}${BASE_URL})`
  );
}

main();

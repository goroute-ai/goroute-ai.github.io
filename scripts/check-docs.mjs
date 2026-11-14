#!/usr/bin/env node
/**
 * Deterministic QA checks for GoRoute AI Gateway documentation:
 *  (a) Zero occurrences of forbidden competitor brand references across docs/, src/, static/, sidebars.ts, docusaurus.config.ts, README.md
 *  (b) No unclosed fenced code blocks in docs/
 *  (c) No hardcoded /ai-gateway-go-docs/docs/ URLs
 *  (d) Every .md/.mdx file under docs/ is mapped in sidebars.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf',
]);

// Construct the forbidden pattern without writing the literal word in source.
const FORBIDDEN_PATTERN = new RegExp(['lite', 'llm'].join(''), 'i');
const HARDCODED_BASE_PATTERN = /\/ai-gateway-go-docs\/docs\//;

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

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

function collectSidebarIds(node, out = new Set()) {
  if (typeof node === 'string') {
    out.add(node);
  } else if (Array.isArray(node)) {
    for (const item of node) collectSidebarIds(item, out);
  } else if (node && typeof node === 'object') {
    if (node.type === 'doc' && typeof node.id === 'string') {
      out.add(node.id);
    } else if (Array.isArray(node.items)) {
      collectSidebarIds(node.items, out);
    } else {
      for (const val of Object.values(node)) {
        collectSidebarIds(val, out);
      }
    }
  }
  return out;
}

function checkFencedCodeBlocks(filePath, content) {
  const lines = content.split(/\r?\n/);
  let openFence = null; // { char, len, line }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    const match = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (!match) continue;

    const marker = match[1];
    const rest = match[2].trim();
    const char = marker[0];
    const len = marker.length;

    if (!openFence) {
      openFence = { char, len, line: i + 1 };
    } else if (openFence.char === char && len >= openFence.len && rest === '') {
      openFence = null;
    }
  }

  return openFence;
}

function main() {
  const errors = [];

  // Targets for text scans (a) & (c)
  const scanTargets = [
    ...walkFiles(path.join(ROOT, 'docs')),
    ...walkFiles(path.join(ROOT, 'src')),
    ...walkFiles(path.join(ROOT, 'static')),
    path.join(ROOT, 'sidebars.ts'),
    path.join(ROOT, 'docusaurus.config.ts'),
    path.join(ROOT, 'README.md'),
  ];

  for (const filePath of scanTargets) {
    if (!fs.existsSync(filePath)) continue;
    const ext = path.extname(filePath).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) continue;

    const rel = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      if (FORBIDDEN_PATTERN.test(lines[i])) {
        errors.push(`[brand-check] Forbidden reference in ${rel}:${i + 1}`);
      }
      if (HARDCODED_BASE_PATTERN.test(lines[i])) {
        errors.push(`[url-check] Hardcoded /ai-gateway-go-docs/docs/ URL in ${rel}:${i + 1}`);
      }
    }
  }

  // Check (b) unclosed fenced code blocks & (d) sidebar mapping
  const docFiles = walkFiles(DOCS_DIR).filter((f) => /\.(md|mdx)$/i.test(f));
  const sidebars = parseSidebars(path.join(ROOT, 'sidebars.ts'));
  const mappedIds = collectSidebarIds(sidebars);

  for (const filePath of docFiles) {
    const relFromDocs = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
    const docId = relFromDocs.replace(/\.(md|mdx)$/i, '');
    const relFromRoot = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    const unclosed = checkFencedCodeBlocks(filePath, content);
    if (unclosed) {
      errors.push(
        `[fence-check] Unclosed code fence starting at ${relFromRoot}:${unclosed.line}`
      );
    }

    const indexAlias = docId.endsWith('/index') ? docId.slice(0, -'/index'.length) : null;
    if (!mappedIds.has(docId) && !(indexAlias && mappedIds.has(indexAlias))) {
      errors.push(
        `[sidebar-check] Doc file ${relFromRoot} (id "${docId}") is not mapped in sidebars.ts`
      );
    }
  }

  if (errors.length > 0) {
    console.error(`QA check failed with ${errors.length} error(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `QA check passed: ${docFiles.length} docs verified (0 brand violations, 0 unclosed fences, 0 hardcoded URLs, 100% sidebar coverage).`
  );
}

main();

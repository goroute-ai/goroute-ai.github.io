#!/usr/bin/env node
/**
 * Postbuild GEO step: emits clean normalized Markdown (.md) mirrors of every
 * sidebar-mapped doc into build/docs/<normalizedId>.md for LLM/agent consumption.
 * Only writes into build/ when build/ exists so static/ and git stay clean.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  SIDEBARS_PATH,
  SITE_ROOT,
  cleanBodyForMarkdown,
  collectSidebarDocs,
  docUrl,
  loadCatalogSummaries,
  normalizeDocId,
  parseFrontmatter,
  parseSidebars,
  resolveDocFile,
} from './generate-llms.mjs';

const BUILD_DIR = path.join(ROOT, 'build');

function yamlString(value) {
  return JSON.stringify(String(value ?? ''));
}

function main() {
  if (!fs.existsSync(BUILD_DIR) || !fs.statSync(BUILD_DIR).isDirectory()) {
    console.log('Skipping postbuild-geo: build/ directory does not exist.');
    return;
  }

  const sidebars = parseSidebars(SIDEBARS_PATH);
  const catalogs = loadCatalogSummaries();
  const seenIds = new Set();
  let count = 0;

  for (const items of Object.values(sidebars)) {
    const entries = collectSidebarDocs(items);
    for (const entry of entries) {
      if (seenIds.has(entry.id)) continue;
      seenIds.add(entry.id);

      const filePath = resolveDocFile(entry.id);
      if (!filePath) continue;

      const raw = fs.readFileSync(filePath, 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const normId = normalizeDocId(entry.id, meta);
      const canonical = docUrl(entry.id, meta, SITE_ROOT);
      const normalizedBody = cleanBodyForMarkdown(body, {
        docId: entry.id,
        siteRoot: SITE_ROOT,
        catalogs,
      });

      const outPath = normId
        ? path.join(BUILD_DIR, 'docs', `${normId}.md`)
        : path.join(BUILD_DIR, 'docs.md');

      const mdContent = [
        '---',
        `title: ${yamlString(meta.title || entry.id)}`,
        ...(meta.description ? [`description: ${yamlString(meta.description)}`] : []),
        `canonical: ${canonical}`,
        '---',
        '',
        normalizedBody,
        '',
      ].join('\n');

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, mdContent, 'utf8');
      count++;
    }
  }

  console.log(`Generated ${count} clean Markdown mirrors under build/docs/*.md`);
}

main();

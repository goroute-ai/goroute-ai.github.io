const fs = require('fs');
const path = require('path');

try {
  // 1. Patch searchByWorker.js
  const workerFile = path.join(
    __dirname,
    '../node_modules/@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker.js'
  );
  if (fs.existsSync(workerFile)) {
    let content = fs.readFileSync(workerFile, 'utf8');
    if (content.includes('process.env.NODE_ENV === "production"')) {
      content = content.replace(
        /process\.env\.NODE_ENV === "production"/g,
        '(process.env.NODE_ENV === "production" || typeof window !== "undefined")'
      );
      fs.writeFileSync(workerFile, content, 'utf8');
      console.log('✓ Patched searchByWorker.js for development search activation');
    }
  }

  // 2. Patch EmptyTemplate.js
  const emptyFile = path.join(
    __dirname,
    '../node_modules/@easyops-cn/docusaurus-search-local/dist/client/client/theme/SearchBar/EmptyTemplate.js'
  );
  if (fs.existsSync(emptyFile)) {
    const cleanEmptyTemplate = `import { translate } from "@docusaurus/Translate";
import { iconNoResults } from "./icons";
import styles from "./SearchBar.module.css";
export function EmptyTemplate() {
    return \`<span class="\${styles.noResults}"><span class="\${styles.noResultsIcon}">\${iconNoResults}</span><span>\${translate({
        id: "theme.SearchBar.noResultsText",
        message: "No results",
    })}</span></span>\`;
}
`;
    fs.writeFileSync(emptyFile, cleanEmptyTemplate, 'utf8');
    console.log('✓ Patched EmptyTemplate.js for clean search state');
  }

  // 3. Sync search index to static/ if build/search-index.json exists
  const buildIndex = path.join(__dirname, '../build/search-index.json');
  const staticIndex = path.join(__dirname, '../static/search-index.json');
  if (fs.existsSync(buildIndex)) {
    fs.copyFileSync(buildIndex, staticIndex);
    console.log('✓ Synced build/search-index.json to static/search-index.json');
  }
} catch (err) {
  console.warn('Note on patch-search.js:', err.message);
}

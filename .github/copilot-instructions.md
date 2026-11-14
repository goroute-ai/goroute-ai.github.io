# Copilot Instructions

Follow the repository guidelines in [`AGENTS.md`](../AGENTS.md).

## Required Checks Before Finishing

Run these commands from the repository root after any change:

```bash
npm run typecheck
npm run check:docs
npm run build
```

## Key Rules

- Map every new `.md`/`.mdx` file under `docs/` in `sidebars.ts`.
- Include `title`, `sidebar_position`, and `description` in MDX frontmatter.
- Do not hand-edit generated files (`static/llms.txt`, `static/llms-full.txt`, `static/search-index.json`); run `npm run generate:llms` or `npm run build`.
- Never hardcode `/ai-gateway-go-docs/docs/` URLs or introduce unclosed code fences.

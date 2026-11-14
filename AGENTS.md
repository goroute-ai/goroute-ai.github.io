# AGENTS.md

Instructions for AI coding agents working in `goroute-ai.github.io` — the Docusaurus 3 documentation portal and runnable Go demos suite for [`goroute-ai/ai-gateway-go`](https://github.com/goroute-ai/ai-gateway-go).

## Setup & Verification Commands

- **Install dependencies**: `npm ci`
- **Local dev server**: `npm run start`
- **TypeScript check**: `npm run typecheck`
- **Docs QA check**: `npm run check:docs`
- **Production build** (also runs `prebuild` -> `scripts/generate-llms.mjs`): `npm run build`
- **Regenerate LLM index manually**: `npm run generate:llms`

Run `npm run typecheck`, `npm run check:docs`, and `npm run build` after making changes to verify zero TypeScript errors, zero QA violations, and zero broken links or anchors.

### Go Examples (`examples/`)

- `examples/go.mod` uses `replace github.com/goroute-ai/ai-gateway-go => ../../ai-gateway-go`.
- Run a demo from `examples/`: `go run ./hello_gateway` (defaults to offline mocks; see `examples/.env.example` for live provider keys).

## Architecture & Key Paths

- `docs/`: MDX/Markdown documentation organized by topic (`getting-started/`, `modules/`, `data-plane/`, `routing-resiliency/`, `finops-and-security/`, `providers/`, `protocols/`, `sdk/`, `api-reference/`, `operations/`, `integrations/`, `demos/`, `cookbook/`, `release-notes/`).
- `sidebars.ts`: Sidebar navigation tree. **Every `.md`/`.mdx` file under `docs/` must be mapped here.**
- `src/data/endpoints.ts` & `src/data/providers.ts`: Structured data backing `src/components/EndpointCatalog.tsx` and `src/components/ProviderCatalog.tsx`.
- `src/css/custom.css` & `src/pages/index.tsx`: Theme tokens and landing page.
- `scripts/check-docs.mjs`: Automated QA validator run in CI (`.github/workflows/verify-pr.yml`).
- `scripts/generate-llms.mjs`: Generates `static/llms.txt` and `static/llms-full.txt` from `sidebars.ts` and `docs/`.
- `static/llms.txt` & `static/llms-full.txt`: Auto-generated AI context files (read `static/llms.txt` as a doc index; do not hand-edit).

## Documentation & Code Conventions

- **Frontmatter**: Every doc in `docs/` requires YAML frontmatter with at least `title`, `sidebar_position`, and `description`.
- **Alerts**: Use GitHub-style alerts (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`). Avoid consecutive or nested alerts.
- **Code Blocks**: Always specify a language (`go`, `bash`, `json`, `yaml`, `protobuf`, `typescript`) and ensure all fenced blocks are properly closed.
- **Links**: Use relative doc links or root-relative `/docs/...` paths compatible with `docusaurus.config.ts` (`onBrokenLinks: 'throw'`, `onBrokenAnchors: 'throw'`).

## Never Do This

- **Never** invent or guess routes, payloads, headers, status codes, or Go SDK symbols—verify against `ai-gateway-go` or existing docs.
- **Never** introduce competitor brand references blocked by `scripts/check-docs.mjs`.
- **Never** hardcode `/ai-gateway-go-docs/docs/` URLs.
- **Never** hand-edit `static/llms.txt`, `static/llms-full.txt`, or `static/search-index.json`; regenerate via `npm run generate:llms` or `npm run build`.
- **Never** commit `.env` files, API keys, or credentials.

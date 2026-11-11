# Contributing to GoRoute AI Gateway Documentation

Thank you for your interest in contributing to the GoRoute AI Gateway documentation! High-quality, precise, and up-to-date documentation helps thousands of developers build resilient AI applications.

---

## 🛡️ Anti-Spam & Generative AI Policy

To maintain the highest technical rigor and documentation integrity:
- **No Unverified AI PRs**: Pull requests generated wholesale by automated bots or generative LLMs without thorough human verification against the [`ai-gateway-go`](https://github.com/goroute-ai/ai-gateway-go) codebase will be marked as spam and closed immediately.
- **Accuracy First**: Every route, payload, status code, and header documented here must match actual gateway runtime behavior.
- **Zero Broken Links Policy**: Every commit and PR must pass `npm run build` with zero broken links.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

```bash
# Clone the repository
git clone https://github.com/goroute-ai/goroute-ai.github.io.git
cd goroute-ai.github.io

# Install dependencies
npm ci

# Start local dev server with hot reload
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view changes in real time.

---

## ✅ Pull Request Requirements

Before opening a pull request, you **must** run and pass both checks locally:

```bash
# 1. TypeScript typecheck
npm run typecheck

# 2. Production build & broken-link verification
npm run build
```

If `npm run build` fails with `Broken links found`, fix the broken anchors or URLs before submitting your PR.

---

## ✍️ Documentation Style Guidelines

1. **GitHub Flavored Markdown & Alerts**:
   - Use standard alerts for callouts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
   - Avoid consecutive or nested alerts.
2. **Code Blocks**:
   - Always include the language specifier: `go`, `bash`, `json`, `yaml`, `protobuf`, `typescript`.
   - Keep cURL snippets runnable with standard placeholder variables (e.g. `$GATEWAY_DEFAULT_KEY`).
3. **Frontmatter**:
   - Every MDX file must contain frontmatter with at least `title` and `sidebar_position`:
     ```yaml
     ---
     title: Feature Name
     sidebar_position: 2
     description: Concise summary of what this guide covers.
     ---
     ```
4. **Tone & Voice**:
   - Direct, concise, and developer-focused.
   - Avoid corporate filler, subjective claims, or marketing buzzwords.

---

## 📜 Code of Conduct

All contributors are expected to uphold the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).

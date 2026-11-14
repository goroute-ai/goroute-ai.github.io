# GoRoute AI Gateway - Frontend Design System Guidelines

This document serves as the comprehensive design specification and implementation manual for the GoRoute AI Gateway frontend. It defines the exact visual tokens, component behaviors, accessibility rules, and architecture required to replicate this enterprise-grade developer documentation aesthetic in any modern web project (Docusaurus, VitePress, Next.js, Astro, Starlight, or Tailwind).

---

## 1. Design Philosophy & Visual Identity

The design system combines **high-contrast technical precision** with modern **enterprise elegance**. It is engineered specifically for developers, systems architects, and infrastructure engineers who spend hours reading technical documentation.

### Core Principles

1. **OLED Pure Black Dark Theme**: The dark mode uses pure `#000000` as the canvas rather than washed-out dark greys, minimizing eye strain on OLED displays and maximizing contrast with code blocks and diagrams.
2. **Daylight Pristine Slate Light Theme**: The light mode uses clean `#ffffff` and subtle `#f8fafc` slate surfaces with high-contrast text, eliminating harsh glare while maintaining readability.
3. **Royal Violet & Lavender Brand Identity**: All accents, active states, buttons, badges, and focal points use the signature **Royal Violet** (`#6d28d9` in light mode) and **Lavender** (`#b39aff` in dark mode) palette, paired with subtle cyan and deep indigo accents for diagrams.
4. **Ergonomic Typography & Measure**: Optimal reading measure capped at `52rem` (~75–80 characters per line) preventing eye tracking fatigue over long technical guides.
5. **Instant Spatial Feedback**: Micro-interactions use tight `150ms`–`180ms` ease transitions with subtle elevations (`translateY(-1px)` or `translateY(-2px)`) rather than distracting bouncy animations.

---

## 2. Color System & Design Tokens

### 2.1 The Royal Violet & Lavender Color Palette

| Token Role                                   | Hex Code    | Tone / Color Standard                  | WCAG Contrast (Dark / Light)          | Usage                                                |
| :------------------------------------------- | :---------- | :------------------------------------- | :------------------------------------ | :--------------------------------------------------- |
| **Dark Theme Lavender (Primary)**      | `#b39aff` | Lavender 300 / RGB `(179, 154, 255)` | **10.2:1** on `#000000` (AAA) | Dark mode primary, active states, badges             |
| **Light Theme Royal Violet (Primary)** | `#6d28d9` | Violet 700 / RGB `(109, 40, 217)`    | **7.5:1** on `#ffffff` (AAA)  | Light mode readable text, primary links, focus rings |
| **Violet Accent (Dark/Light)**         | `#7c3aed` | Violet 600 / RGB `(124, 58, 237)`    | **5.4:1** on `#ffffff` (AA)   | Diagram notes, accents, interactive glows            |
| **Lavender Tint**                      | `#d8ccff` | Lavender 200 / RGB `(216, 204, 255)` | **13.5:1** on `#000000` (AAA) | Dark mode inline code snippets                       |
| **Deep Violet**                        | `#5b21b6` | Violet 800 / RGB `(91, 33, 182)`     | **9.8:1** on `#ffffff` (AAA)  | Light mode inline code snippets                      |

---

### 2.2 Complete Token Map: Dark Theme (Default)

```css
:root,
html[data-theme='dark'],
[data-theme='dark'] {
  color-scheme: dark;
  --ifm-color-scheme: dark;

  /* Primary Violet/Lavender Scale */
  --ifm-color-primary: #b39aff;          /* Primary lavender accent */
  --ifm-color-primary-dark: #9a79ff;     /* Hover state */
  --ifm-color-primary-darker: #8059f5;   /* Active pressed */
  --ifm-color-primary-darkest: #501ee8;  /* Deep outline */
  --ifm-color-primary-light: #cbbafe;    /* Interactive glow */
  --ifm-color-primary-lighter: #dbceff;  /* Monospace badge */
  --ifm-color-primary-lightest: #f1ecfe; /* Text tint */

  /* Surface & Canvas System */
  --ifm-background-color: #000000 !important;
  --ifm-background-surface-color: #0c0c0f !important;
  --ifm-navbar-background-color: rgba(0, 0, 0, 0.88) !important;
  --ifm-footer-background-color: #000000 !important;

  /* Borders & Separation */
  --color-border: #1e1e24;
  --color-border-subtle: #141418;

  /* Typography Colors */
  --color-text-title: #f5f3ff;           /* Crisp lavender-tinted white */
  --color-text-body: #d2d0dc;            /* High-legibility neutral body */
  --color-muted: #9696a4;                /* Secondary meta & labels */

  /* Specialized Accents */
  --docs-accent-soft: rgba(124, 58, 237, 0.09);
  --docusaurus-highlighted-code-line-bg: rgba(124, 58, 237, 0.14);
}
```

---

### 2.3 Complete Token Map: Light Theme

```css
html[data-theme='light'],
[data-theme='light'] {
  color-scheme: light;
  --ifm-color-scheme: light;

  /* Primary Royal Violet Scale (AAA-Compliant 7.5:1 for Light Mode) */
  --ifm-color-primary: #6d28d9;          /* Deep Royal Violet */
  --ifm-color-primary-dark: #5b21b6;     /* Dark hover */
  --ifm-color-primary-darker: #4c1d95;   /* Active */
  --ifm-color-primary-darkest: #2e1065;  /* Deep indigo shade */
  --ifm-color-primary-light: #7c3aed;    /* Vibrant violet badge */
  --ifm-color-primary-lighter: #8b5cf6;  /* Bright tint */
  --ifm-color-primary-lightest: #a78bfa; /* Soft lavender */

  /* Surface & Canvas System */
  --ifm-background-color: #ffffff !important;
  --ifm-background-surface-color: #f8fafc !important;
  --ifm-navbar-background-color: rgba(255, 255, 255, 0.88) !important;
  --ifm-footer-background-color: #f8fafc !important;

  /* Borders & Separation */
  --color-border: #e2e8f0;
  --color-border-subtle: #f1f5f9;

  /* Typography Colors */
  --color-text-title: #0f172a;           /* Deep slate title */
  --color-text-body: #334155;            /* Slate-700 body text */
  --color-muted: #64748b;                /* Slate-500 muted text */

  /* Specialized Accents */
  --docs-accent-soft: rgba(109, 40, 217, 0.06);
  --docusaurus-highlighted-code-line-bg: rgba(109, 40, 217, 0.07);
}
```

---

## 3. Typography System & Metrics

### 3.1 Font Families

- **Interface & Prose Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `sans-serif`
- **Code & Monospace Font**: `'JetBrains Mono'`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`

```css
:root {
  --ifm-font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ifm-font-family-monospace: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --ifm-font-size-base: 15px;
  --ifm-line-height-base: 1.65;
  --ifm-code-font-size: 88%;
  --docs-reading-width: 52rem;
  --ifm-global-radius: 0.65rem;
}
```

### 3.2 Heading Hierarchy

| Level                    | Size                          | Weight  | Line Height | Tracking     | Color                                                                         |
| :----------------------- | :---------------------------- | :------ | :---------- | :----------- | :---------------------------------------------------------------------------- |
| **Doc H1**         | `clamp(2rem, 4vw, 2.65rem)` | `700` | `1.15`    | `-0.04em`  | `--color-text-title`                                                        |
| **Section H2**     | `1.45rem`                   | `650` | `1.3`     | `-0.03em`  | `--color-text-title` (with bottom border `1px solid var(--color-border)`) |
| **Sub H3**         | `1.12rem`                   | `600` | `1.4`     | `-0.02em`  | `--color-text-title`                                                        |
| **Lead Paragraph** | `1.04rem`                   | `400` | `1.75`    | `-0.01em`  | `--color-muted`                                                             |
| **Body Paragraph** | `15px`                      | `400` | `1.65`    | `-0.011em` | `--color-text-body`                                                         |

---

## 4. Navigation & Header Layout

### 4.1 Sticky Navbar Specs

- **Height**: `4.25rem` (`68px`)
- **Backdrop Blur**: `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);`
- **Border**: `1px solid var(--color-border)`
- **Isolated Doc Sidebar Navigation**:
  - `Guides` tab routes to `docSidebar: 'docsSidebar'`
  - `Architecture` tab routes to `docSidebar: 'architectureSidebar'`
  - Each item activates independently without dual-pressed active highlights.
- **Order of Right Controls**:
  1. **GitHub Link** (`order: 0`)
  2. **Theme Switcher** (`order: 1` — placed immediately to the left of the search bar)
  3. **Search Bar Container** (`order: 2` — anchored at the rightmost edge)

```css
.navbar__items--right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.navbar__items--right > .navbar-github-link { order: 0; }
.navbar__items--right > [class*='colorModeToggle'] { order: 1; }
.navbar__items--right > [class*='navbarSearchContainer'],
.navbar__items--right > .navbar__search { order: 2; }
```

### 4.2 Theme Switcher Button

- **Dimensions**: `2.35rem × 2.35rem` (`38px × 38px`)
- **Border Radius**: `0.65rem` (`10px`)
- **Background**: `var(--ifm-background-surface-color)`
- **Border**: `1px solid var(--color-border)`
- **Hover**: `border-color: var(--ifm-color-primary); background: var(--docs-accent-soft); color: var(--ifm-color-primary); transform: translateY(-1px);`
- **Icon Scale**: `svg { width: 1.2rem; height: 1.2rem; transition: transform 160ms ease; }` (scales to `1.1` on hover)

---

## 5. Search Bar System Architecture

The search system is powered by an offline Lunr.js web worker indexer (`@easyops-cn/docusaurus-search-local`) enhanced with dual-mode dev/prod serving:

### 5.1 Architecture Workflow

1. **Build Phase (`docusaurus build`)**:
   - Analyzes all rendered HTML docs.
   - Outputs full tokenized search index: `build/search-index.json`.
2. **Sync Automation (`scripts/patch-search.js`)**:
   - Copies `build/search-index.json` to `static/search-index.json`.
   - Allows the Webpack development server (`docusaurus start`) to immediately serve `http://localhost:3000/search-index.json`.
3. **Client Worker Initialization**:
   - Wrapped via Comlink Web Worker.
   - Fetches `/search-index.json` and loads the index in the background without blocking the UI thread.
   - Queries execute instantaneously with keyboard navigation (`↑`, `↓`, `Enter`, `Escape`, and `⌘K` / `Ctrl+K`).

### 5.2 Search UI Specifications

- **Input Border Radius**: `0.65rem`
- **Border**: `1px solid var(--color-border)`
- **Focus Ring**: `outline: 2px solid var(--ifm-color-primary); outline-offset: 0;`
- **Shortcut Tag (`⌘K`)**: Monospace pill with `0.72rem` font size, muted border, and `0.15rem 0.35rem` padding.
- **Result Item Active**: Background `var(--docs-accent-soft)` with violet left accent marker.

---

## 6. Sidebar & Content Navigation

### 6.1 Active Item Pill

The active sidebar menu item highlights the current documentation document:

- **Font Color**: `var(--ifm-color-primary) !important;` (`#b39aff` in Dark, `#6d28d9` in Light)
- **Background**: `var(--docs-accent-soft) !important;` (`rgba(124, 58, 237, 0.09)` in Dark, `rgba(109, 40, 217, 0.06)` in Light)
- **Font Weight**: `650`
- **Border Radius**: `0.55rem`
- **Padding**: `0.48rem 0.8rem`

```css
.menu__link--active:not(.menu__link--sublist) {
  background: var(--docs-accent-soft) !important;
  color: var(--ifm-color-primary) !important;
  font-weight: 650;
}
```

### 6.2 Collapsible Category Headers

- **Font Size**: `0.88rem`
- **Font Weight**: `650`
- **Hover**: Background `var(--ifm-background-surface-color)`, border `var(--color-border)`

---

## 7. Code Blocks & Monospace Snippets

### 7.1 Multi-line Code Block Container

- **Dark Background**: `#0d0d12 !important;`
- **Light Background**: `#f8fafc !important;`
- **Border**: `1px solid var(--color-border)`
- **Border Radius**: `0.65rem`
- **Font**: `'JetBrains Mono', monospace`, size `0.84rem`, line height `1.6`
- **Highlighted Line Background**: `rgba(124, 58, 237, 0.14)` (Dark) / `rgba(109, 40, 217, 0.07)` (Light)

### 7.2 Inline Code Snippets (`:not(pre) > code`)

Inline code inside prose uses a dedicated rounded chip:

- **Dark Theme**:
  - `border: 1px solid rgba(179, 154, 255, 0.16);`
  - `background: rgba(179, 154, 255, 0.075);`
  - `color: #d8ccff;`
  - `border-radius: 0.35rem;`
  - `padding: 0.16rem 0.38rem;`
- **Light Theme**:
  - `border: 1px solid rgba(109, 40, 217, 0.18);`
  - `background: rgba(109, 40, 217, 0.07);`
  - `color: #5b21b6;`
  - `border-radius: 0.35rem;`
  - `padding: 0.16rem 0.38rem;`

---

## 8. Mermaid Architectural Diagram Styling Engine

All Mermaid diagrams are custom-themed to maintain visual harmony with the documentation system:

### 8.1 Color Theme Matrix

- **Dark Theme Engine**:
  - Background: `#000000`
  - Lifelines: `rgba(255, 255, 255, 0.16)`
  - Outbound Messages: `#12C2EA` (Electric Cyan)
  - Dashed Return Arrows: `#a78bfa` (Lavender)
  - Architectural Notes: Polygon fill `#161824`, stroke `#7c3aed`, drop shadow `rgba(124, 58, 237, 0.18)`
  - Loop & Alternate Blocks: Stroke `#4f46e5`, header `#1e1b4b`, text `#c7d2fe`
- **Light Theme Engine**:
  - Background: `#ffffff`
  - Lifelines: `#cbd5e1`
  - Outbound Messages: `#0284c7` (Sky Blue)
  - Dashed Return Arrows: `#7c3aed` (Royal Violet)
  - Architectural Notes: Polygon fill `#faf5ff`, stroke `#7c3aed`, drop shadow `rgba(124, 58, 237, 0.12)`
  - Loop & Alternate Blocks: Stroke `#7c3aed`, header `#ede9fe`, text `#3730a3`

---

## 9. Landing Page Components & Visual Accents

### 9.1 Hero Banner

- **Dark Background**: `radial-gradient(ellipse at 90% 10%, rgba(124, 58, 237, 0.1), transparent 42%), #0c0c0f`
- **Light Background**: `radial-gradient(ellipse at 90% 10%, rgba(109, 40, 217, 0.05), transparent 42%), #ffffff`
- **Border**: `1px solid var(--color-border)`
- **Border Radius**: `1.25rem` (`20px`)

### 9.2 Gateway Flow Visualizer

- **Normal Flow Node**: `background: var(--ifm-background-surface-color); border: 1px solid var(--color-border);`
- **GoRoute AI Gateway Node**: `border-color: rgba(124, 58, 237, 0.55); background: var(--docs-accent-soft);`
- **Connecting Vector Line**: `border-left: 1px solid var(--ifm-color-primary);`

### 9.3 Interactive Path & Feature Cards

- **Normal**: `background: var(--ifm-background-surface-color); border: 1px solid var(--color-border);`
- **Hover State**: `border-color: var(--ifm-color-primary); box-shadow: 0 12px 24px rgba(124, 58, 237, 0.1); transform: translateY(-2px);`
- **Badges**: Monospace uppercase pill with `border: 1px solid rgba(124, 58, 237, 0.28); color: var(--ifm-color-primary); background: var(--docs-accent-soft);`

---

## 10. Replicating This Design in Another Project

### Quickstart: CSS Variables Template (`theme.css`)

Copy this minimal stylesheet into any project to adopt this exact visual system:

```css
/* ==========================================================================
   Royal Violet & Lavender Enterprise Documentation Theme
   ========================================================================== */

/* Universal Reset & Metrics */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --content-max-width: 52rem;
  --radius-sm: 0.35rem;
  --radius-md: 0.65rem;
  --radius-lg: 1.25rem;
}

/* Dark Mode (Default) */
[data-theme='dark'] {
  --brand-primary: #b39aff;
  --brand-primary-hover: #9a79ff;
  --brand-accent-soft: rgba(124, 58, 237, 0.09);
  --brand-code-color: #d8ccff;

  --bg-canvas: #000000;
  --bg-surface: #0c0c0f;
  --bg-code: #0d0d12;
  --border-color: #1e1e24;

  --text-title: #f5f3ff;
  --text-body: #d2d0dc;
  --text-muted: #9696a4;
}

/* Light Mode */
[data-theme='light'] {
  --brand-primary: #6d28d9;
  --brand-primary-hover: #5b21b6;
  --brand-accent-soft: rgba(109, 40, 217, 0.06);
  --brand-code-color: #5b21b6;

  --bg-canvas: #ffffff;
  --bg-surface: #f8fafc;
  --bg-code: #f8fafc;
  --border-color: #e2e8f0;

  --text-title: #0f172a;
  --text-body: #334155;
  --text-muted: #64748b;
}

/* Base Body Application */
body {
  font-family: var(--font-sans);
  background-color: var(--bg-canvas);
  color: var(--text-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* Title Legibility */
h1, h2, h3, h4 {
  color: var(--text-title);
  letter-spacing: -0.025em;
  font-weight: 650;
}

/* Active Link Pill */
.nav-link-active {
  background: var(--brand-accent-soft);
  color: var(--brand-primary);
  font-weight: 650;
  border-radius: var(--radius-md);
}

/* Inline Code Pill */
:not(pre) > code {
  font-family: var(--font-mono);
  padding: 0.16rem 0.38rem;
  border-radius: var(--radius-sm);
  background: var(--brand-accent-soft);
  color: var(--brand-code-color);
  border: 1px solid rgba(124, 58, 237, 0.2);
}
```

---

*Authored for the GoRoute AI Gateway Open Source Ecosystem. Licensed under Apache 2.0.*

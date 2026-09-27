# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (usually already running)
- `npm run build` — production build
- `npm run lint` — prettier check + eslint
- `npm run format` — auto-format with prettier
- Do **not** run `npm run check` — project does not use TypeScript

## Architecture

**Art Vandeley** — a SvelteKit 5 app fronting _Art Vandeley_, an agent that imports skills and exports well-architected components (the `/architect` → `/judge` → `/export` pipeline; nothing ships without a judge-approved verdict) and communicates in Mermaid + Markdown. `/` is Art's landing — deliberately minimal: headline, then copy-ready **Install** and **Update** commands (release notes live in `static/changelog.md`, served at `vandeley.art/changelog.md` and read by the `news` skill); **the Mermaid Studio is now a feature**, a family of standalone diagram editors (one route per diagram type). The agent ships as **one Claude Code plugin** in `plugins/art-vandeley/` — agent, `/hello-art` command, and all skills (`architect`, `judge`, `export`, `verify`, `commit`, `next-steps`, `iterate`, `opinions`, `unslopify`, `drama`, `lets-get-cracking`, `handoff`, `news`, `radar`) in a single install. Never split the skills back into separate marketplace plugins; the one-crate install is a deliberate product decision.

### Distribution

The plugin marketplace is served straight from this repo's GitHub remote — `github.com/grzlz/arquitectura`, which is Guillermo's **personal** account. That is temporary: the plan is to eventually move distribution off the personal account (dedicated org or vandeley.art-owned home). Users install via `/plugin marketplace add grzlz/arquitectura`, so moving the repo is a breaking change for installed marketplaces — coordinate the move deliberately (update README, landing page `marketplaceCommand` in `src/routes/+page.svelte`, and announce the new source).

### Routes → diagram types

| Route        | Type                                                 |
| ------------ | ---------------------------------------------------- |
| `/`          | Art Vandeley landing (brand/identity, not an editor) |
| `/flowchart` | General flowcharts (graph LR/TD/TB)                  |
| `/sequence`  | Sequence diagrams                                    |
| `/state`     | State machine diagrams                               |
| `/journey`   | User journey diagrams                                |
| `/class`     | Class diagrams                                       |
| `/swimlane`  | Swimlane (subgraph-based) diagrams                   |

### Per-page pattern (all routes follow this)

Each `+page.svelte` is self-contained and implements:

1. `$state` for `diagramCode`, `error`, `savedDiagrams`, `currentExampleIndex`
2. Mermaid loaded lazily: `onMount` + `browser` guard → `import('mermaid')`
3. `renderDiagram()` — calls `mermaid.render()`, dumps SVG into `#preview`
4. Examples carousel (hardcoded array per diagram type)
5. Save/load/delete via `localStorage` (`mermaid-diagrams` key)
6. SVG export via Blob URL

### Global state

`src/lib/diagramState.svelte.js` — a Svelte 5 rune-based store (`$state` inside a factory function). Currently minimal; intended to be shared state across routes if needed.

### Design system (editorial)

Tokens and utilities live in `src/app.css` (`@theme`); the rules are in **Design Context → Editorial parameters** below.

- Colors: `paper` (page), `surface` (code tint), `ink` (text, rules, primary buttons), `accent` (red pencil). Tints via `/opacity` — text at `ink`, `ink/85`, `ink/75`, `ink/60` (floor for small text).
- Fonts: `font-display` / `font-serif` (Newsreader), `font-sans` (Libre Franklin), `font-mono` (IBM Plex Mono).
- Sizes: `text-headline`, `text-title`, `text-deck`; measure `max-w-measure`.
- Utilities: `kicker` (uppercase sans label), `dropcap`, `rise` (page-load fade, `--d` delay).
- Mermaid theme: `src/lib/mermaidTheme.js` (`mermaidInit`) — shared by every page.

### Tech stack

- **Svelte 5** with runes (`$state`, `$props`, `$derived`, `$effect`)
- **SvelteKit 2** with `adapter-auto`
- **Tailwind CSS v4** (imported via `@import 'tailwindcss'`, configured in `@theme {}`)
- **Mermaid 11** — client-side only, never SSR'd
- Plain JavaScript (no TypeScript, despite `tsconfig.json` existing)
- ES modules throughout

### Key conventions

- Mermaid must always be imported dynamically inside `onMount` with `browser` guard
- `mermaid.initialize(mermaidInit)` (from `$lib/mermaidTheme.js`), then `await document.fonts.ready`, before rendering — mermaid sizes boxes from the loaded face
- Use `mermaid.render(id, code)` — returns `{ svg }`, inject into DOM manually
- `$lib` alias maps to `src/lib/`

---

## Design Context

### Product Identity

**Architect's Studio** — pivoted from an internal IAValua tool to a user-facing product for creating and previewing Mermaid diagrams. Broader audience: developers, architects, technical leads, and anyone who needs to communicate systems visually.

### Users

Technical professionals who think in systems. They're in flow-state when diagramming — the tool should feel invisible, getting out of their way. They expect quality; they'll notice if something feels cheap. Secondary users: stakeholders reviewing exported diagrams who never touch the editor.

### Brand Personality

**Precise. Elevated. Focused.**

- Emotional goals: confidence, clarity, and a small dose of delight when a diagram renders perfectly
- Reference feel: an architecture journal or a well-set magazine feature — the NYT Magazine's cover type, The Economist's red kicker, a colophon that names its typefaces
- Anti-references: cluttered IDEs, web-app SaaS mediocrity, anything that feels like a template (cards, shadows, gradients, glass)

### Editorial parameters

What "editorial" means here. Typography is the main character: it carries the identity; color only follows.

1. **Paper and ink.** White page, near-black text. One accent — the editor's red pencil (`accent`) — for section kickers, the approval stamp, errors, and hover. Never for body text, never as a fill behind content.
2. **Four voices, four jobs.** A display serif for headlines (Newsreader, optical size follows font-size); the same serif for reading text; a newspaper grotesque (Libre Franklin) for furniture — kickers, nav, buttons, captions, meta; mono only for code. Never mono for prose, never sans for prose.
3. **Hierarchy by scale, not boxes.** Big jumps between levels (`text-headline` ≈ 120px → `text-deck` ≈ 26px → body 18px → kicker 11px). Light weights at display sizes; tight leading (~0.95) and negative tracking as size grows; body leading ~1.6.
4. **Structure by rules and white space.** A 2px ink rule opens each section; 1px hairlines (`ink/15`) separate items and columns. No cards, shadows, rounded corners, glass, or gradients.
5. **Editorial devices.** Kicker above the headline; deck (italic standfirst) below it; byline; drop cap on the lede; pull quote; numbered figures with captions ("Fig. 1 — …"); dateline/issue line; colophon in the footer. Curly quotes and real dashes.
6. **Measure and alignment.** Body copy ≤ `max-w-measure` (60–70 characters), left-aligned, ragged right; `text-wrap: balance` on headings, `pretty` on paragraphs. Center only display type (pull quotes).
7. **Asymmetric grid.** 12 columns; section kicker in 3, title/content in 9; text columns beside sidebars (7/5, 8/4).
8. **Quiet motion.** A short fade-up on load; hover = underline or ink→accent. Nothing bounces.

### Design Principles

1. **The diagram is the hero** — UI chrome recedes; the canvas and rendered output get maximum visual weight. Diagrams are monochrome infographics.
2. **Type before decoration** — When something needs emphasis, change size, weight, style (italic), or face before reaching for color or a container.
3. **Red earns its place** — The accent is rare and intentional: kickers, the stamp, errors. If a page has red everywhere, it has red nowhere.
4. **Every interaction responds** — Buttons, inputs, and controls have perceptible (but not showy) hover/focus states.
5. **Functional elegance over novelty** — Polish comes from spacing, alignment, and typographic consistency — not from adding more effects.

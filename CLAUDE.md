# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (usually already running)
- `npm run build` — production build
- `npm run lint` — prettier check + eslint
- `npm run format` — auto-format with prettier
- Do **not** run `npm run check` — project does not use TypeScript

## Architecture

**Art Vandeley** — a SvelteKit 5 app fronting _Art Vandeley_, an agent that imports skills and exports well-architected components (the `/architect` → `/judge` → `/export` pipeline; nothing ships without a judge-approved verdict) and communicates in Mermaid + Markdown. `/` is Art's landing (his identity + doctrine); **the Mermaid Studio is now a feature**, a family of standalone diagram editors (one route per diagram type). The agent ships as **one Claude Code plugin** in `plugins/art-vandeley/` — agent, `/hello-art` command, and all skills (`architect`, `judge`, `export`, `verify`, `commit`) in a single install. Never split the skills back into separate marketplace plugins; the one-crate install is a deliberate product decision.

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

### Design system (glassmorphism)

Defined in `src/app.css`. Use these utility classes:

- `.glass-enhanced` — primary panels/cards (stronger blur, whitish border)
- `.glass-accent` — secondary panels (lighter glass)
- `.glass-gold` — gold-tinted accent panels
- Background: always `bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950`
- Primary color palette: `primary-50` through `primary-950` (blue-ish oklch scale)
- Font: `font-[family-name:var(--font-primary)]` → Roboto

### Tech stack

- **Svelte 5** with runes (`$state`, `$props`, `$derived`, `$effect`)
- **SvelteKit 2** with `adapter-auto`
- **Tailwind CSS v4** (imported via `@import 'tailwindcss'`, configured in `@theme {}`)
- **Mermaid 11** — client-side only, never SSR'd
- Plain JavaScript (no TypeScript, despite `tsconfig.json` existing)
- ES modules throughout

### Key conventions

- Mermaid must always be imported dynamically inside `onMount` with `browser` guard
- `mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' })` before rendering
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
- Reference feel: Figma's polish, Linear's density, Vercel's dark-native sophistication
- Anti-references: cluttered IDEs, web-app SaaS mediocrity, anything that feels like a template

### Aesthetic Direction

- **Dark-native**: Dark mode is the identity, not an option. The gradient background (`from-gray-900 via-gray-800 to-primary-950`) is always present.
- **Glassmorphism with restraint**: Layered depth through frosted glass panels, not color saturation. Less is more — avoid stacking too many glass layers.
- **Blue primary + gold accent**: The oklch blue scale is the workhorse. Gold (`rgba(188, 149, 92, ...)`) is reserved for moments of emphasis — active nav states, premium CTAs, or brand identity moments. Never overused.
- **Typography**: Roboto for body/UI copy. Monospace (`font-mono`) strictly for code/syntax.
- **Motion**: CSS transitions only (no Svelte animations). Hover states should feel responsive, not theatrical.

### Design Principles

1. **The diagram is the hero** — UI chrome recedes; the canvas and rendered output get maximum visual weight.
2. **Depth through restraint** — Use glass layers sparingly. One strong `glass-enhanced` panel outweighs three competing `glass-accent` layers.
3. **Gold earns its place** — The `.glass-gold` accent is rare and intentional. Use it for the most important CTA on screen, the active nav item, or branding moments. Never decorative.
4. **Every interaction responds** — Buttons, inputs, and controls should have perceptible (but not showy) hover/focus states. Users should feel the tool is alive.
5. **Functional elegance over novelty** — Polish comes from spacing, alignment, and typography consistency — not from adding more effects.

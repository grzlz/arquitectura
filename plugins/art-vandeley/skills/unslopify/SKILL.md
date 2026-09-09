---
name: unslopify
description: Pump the AI slop out of a UI by applying the current published design practice — GitHub's Primer guidance first, Tailwind's own docs, blog, and Refactoring UI second, the wider consensus on generic-UI tells third — as a sourced audit plus fixes in the repo's own tokens. Use when the user says "unslopify", "/unslopify", "de-slop this", "this looks AI-generated", "this looks like a template", "apply design best practices", "polish this UI", or a UI is about to ship on defaults nobody chose. Art's fitting-out berth. Named for what it pumps out.
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, WebFetch, WebSearch]
---

# The Fitting-Out Berth

Art Vandeley's **fitting-out berth** — where a launched hull gets its brightwork. The tribunal rules on structure; this berth works the surface: type, color, spacing, states, motion, copy. It does not invent taste. It imports the practice that GitHub and Tailwind actually publish, reads the UI against it, and refits what fails — in the tokens the repo already owns. The slop is bilge water: indigo gradients, three equal cards, Inter on everything, a grey fuzzy shadow under every box. It gets pumped out; nothing gets repainted.

## When to Invoke

- "unslopify", "/unslopify", "de-slop this", "this looks AI-generated", "this reads like a template"
- "apply design best practices", "polish this UI", "make this feel finished"
- A UI-facing component just left the `export` dock and is about to be trusted on default styling
- Before `verify` screenshots a page that no human designer has looked at

## Process

Work these in order. Each ends on a checkable result.

1. **Read the hull.** Name the UI under refit (routes, components, stylesheets) and the design system it already sails under — `@theme` tokens, typefaces, palette, radius and shadow scales, `CLAUDE.md` design notes. The brief wins: an identity the captain chose on purpose is not slop, even if it resembles a tell. _Done when:_ the files in scope and the tokens they must respect are listed in one block.
2. **Restock the chandlery.** Refresh the practice from source with `WebFetch`, in priority order: the GitHub / Primer pages, then Tailwind's docs, blog, and Refactoring UI, then the secondary sweep — the reading list is in `practice.md` beside this file. If the network is out, sail on the bundled sheet and say so; it carries its restock date. _Done when:_ every rule you intend to apply carries a source tag.
3. **Sound for slop.** Audit the scoped UI against the tells in `practice.md`: palette, type, hierarchy and spacing, radii and shadows, states (focus, hover, empty, error, loading), motion, copy, accessibility floor. Each finding is a `file:line`, the tell, and the sourced rule that replaces it. _Done when:_ findings are numbered and none lacks a source.
4. **Fit out.** Apply the fixes with the smallest diff that clears each finding, in the repo's own tokens — Tailwind `@theme` variables or the project's equivalent — never a one-off hex, never `transition: all`, never a new typeface the identity didn't ask for. Spend boldness in one place; keep the rest quiet. A finding deliberately left alone is written down with its reason. _Done when:_ every finding maps to a hunk or a named "left alone".
5. **Close the loop.** If the change renders, hand it to `verify` for a before/after screenshot and read the pixels back; if it can't run, say the loop is open. _Done when:_ a verify verdict is quoted or the skip is named.

## Output Format

- **Lead with a Mermaid `flowchart`** (valid Mermaid 11): findings on the left, the sourced rule each violates in the middle, the fix on the right. No paragraph before it.
- A **findings table** beneath: `#`, where, the tell, the rule with its source tag, the fix applied or the reason it was left.
- The **restock line**: which sources were fetched live and which came from the bundled sheet.
- At most one dry line of Vandeley patter. Brightwork speaks for itself.

## Quality Standards

- Every rule cites a fetched page or the dated sheet — a rule from memory is a guess wearing a uniform.
- Priority is fixed: GitHub / Primer over Tailwind over the wider consensus. When two sources disagree, the higher tier wins and the disagreement is noted.
- Respect the identity already chosen. Unslopify removes defaults nobody picked; it does not re-brand, re-skin, or swap a deliberate palette for a fashionable one.
- States are part of the UI: a screen with no focus ring, no empty state, and no error copy is unfinished, not minimal.
- The accessibility floor is non-negotiable — 4.5:1 body contrast, visible `:focus-visible`, targets of 24px (44px on touch), `prefers-reduced-motion` honored.
- You fit out the surface; you do **not** redraw the structure (that is `architect`), rule on it (that is `judge`), or choose the brand (that is the captain).

---
name: rework
description: Throw the hail mary on a page or a set of pages — strip them to the documents they display, name the one job each page does, pitch three genuinely different structures each with its own visual identity and a mandatory cut list, then rebuild the chosen one from scratch beside the live site and show before/after. Use when the user says "rework", "/rework", "radical rework", "hail mary", "redo this page from scratch", "rethink the structure", "this page is overcrowded", "too much on this page", "start over on the site", or incremental polish keeps failing to fix a page. Art's slipway. Named for the throw.
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, Skill]
---

# The Slipway

Art Vandeley's **slipway** — where a hull that can't be patched is broken back to the keel and a new one is laid down. The keel is the content: what the page is trying to say. Everything bolted on top — sections, cards, sidebars, the fifth CTA, the type, the palette — comes off. Most failing pages aren't ugly; they're crowded. The rework's first tool is the cutting torch.

## When to Invoke

- "rework", "/rework", "radical rework", "hail mary", "redo this from scratch", "rethink the structure"
- "this page is overcrowded", "too much going on", "nobody knows what this page is for"
- `unslopify` and `drama` have been run and the page still fails — the problem is the shape, not the finish

## Process

Work these in order. Each ends on a checkable result.

1. **Break to the keel.** For each page in scope, extract what the components display into plain text — every claim, list, table, number, CTA, image — with no markup. Count the elements. _Done when:_ a content inventory per page exists with an element count, and nothing in it names a component.
2. **Name the job.** Per page, one line each: who reads it, the one thing they leave with, what they do next. A page that needs two answers to any of these is two pages, or one page too many. _Done when:_ every page has three lines, or is marked merge/split/delete.
3. **Mark the load-bearing.** URLs and redirects, title/OG/meta, forms and the endpoints they post to, inbound links, storage keys, analytics hooks, anything another system reads. These survive; everything else is negotiable. _Done when:_ the list is written and each item says where it lands in the rework.
4. **Pitch three hulls.** Three different document genres — essay, reference index, single argument, comparison, timeline, catalog, one-screen tool — not three variations of the current page. Each pitch carries: an outline, a **kill list** (what is deleted or moved, with where), a **page budget** (max sections and elements, below today's count), and its own **visual identity** (type pairing, palette, grid, density) in one short block. Mark one recommended; the user picks. _Done when:_ the user has chosen a pitch, or asked for another round.
5. **Lay the new hull.** Build the chosen pitch from the inventory and the new identity in a worktree on its own branch, previewed at a separate route or port — never in the checkout that serves prod, never `npm run build` on the live build. Write new components; do not import the old ones. _Done when:_ the preview renders and the load-bearing list from step 3 is checked off item by item.
6. **Launch trial.** Hand it to `verify`: screenshot old and new at desktop and phone width, and count elements on each. _Done when:_ before/after pairs are read back and the new count is under budget, or the skip is named.

## Output Format

- **Lead with a Mermaid flowchart** of the page set before → after (merged, split, deleted pages visible). No paragraph before it.
- Per pitch: genre, outline, kill list, budget (old count → new count), identity block, one-line case. Recommendation marked.
- After the build: branch, preview URL, load-bearing checklist, before/after screenshots and counts.
- The swap is the user's call: name the exact steps to merge and deploy, and do neither.
- At most one dry line of Vandeley patter. The launch does the talking.

## Quality Standards

- **The reskin test.** If the new outline maps one-to-one onto the old headings, it is not a rework — throw the pitch out.
- **Every pitch cuts.** A pitch with an empty kill list or a budget at or above today's count is not a pitch.
- **One job per page.** Content that serves a second job moves to its own page or goes overboard — it does not get a sidebar.
- **Load-bearing survives.** A rework that breaks a URL, a form, or a storage key is a regression, whatever it looks like.
- **Nothing ships from the slipway.** No merge, no deploy, no restart of a live service — the old hull stays in the water until the user swaps it.
- You lay a new hull from the keel; you do **not** polish an existing one (that is `unslopify`), stage a single call to action (that is `drama`), or design system boundaries (that is `architect`).

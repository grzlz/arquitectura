# Practice Sheet — the chandlery stock

**Restocked: 2026-09-08.** Every rule below was read from the page it cites on that date. Tiers are priority: when tiers disagree, the higher one wins. Restock from the reading list at the bottom before a refit; if the network is out, this sheet is the stock.

Source tags: `[primer/...]` and `[github.blog/...]` are Tier 1. `[tw-docs/...]`, `[tw-blog/...]`, `[refactoringui]`, `[catalyst]` are Tier 2. Everything else is Tier 3.

## Slop tells — the checklist

Sound the hull for these. A tell is only slop if nobody chose it; the brief wins.

1. Indigo / purple-to-blue gradient on hero, buttons, and text at once. [prg.sh] [impeccable] [925studios]
2. Inter, Geist, or Roboto as the only typeface over a system fallback. [mania] [impeccable]
3. Centered hero, headline + subheadline, then three (or six) equal cards: icon-in-rounded-square, heading, two lines. [impeccable] [wheelsup]
4. Gradient text on headings. [impeccable]
5. Glassmorphism, glow borders, or neon on dark used as decoration rather than layering. [impeccable] [smoothui]
6. One border radius, one padding, one card height everywhere — flat hierarchy. [mania] [impeccable]
7. One fuzzy grey box-shadow at ~0.1 opacity under every card. [comeau] [prg.sh]
8. Pill badge above the headline; a display headline that fills the first screen alone. [impeccable]
9. Pulsing status dots, blinking cursor on static copy, auto-scrolling logo marquee. [impeccable]
10. Bounce or elastic easing on dialogs; every image zooms on hover; `transition: all`. [impeccable] [vercel-wig]
11. Weightless copy — "Build faster. Ship smarter.", "supercharge", "world-class", an em dash in every sentence. [925studios] [mania]
12. Cards nested in cards; a colored side stripe on something that isn't an alert. [impeccable]
13. A huge number with a tiny label and no context; numbered markers (01 / 02) where nothing is a sequence. [impeccable]
14. No empty, error, or loading state; no focus ring; contrast failures — a UI that optimises for the demo. [mania] [nng]
15. Tracked-out ALL-CAPS eyebrow labels over every heading; middle-dot meta strings; a "→" glued to every link. [consensus]
16. Disabled primary buttons standing in for validation. [primer/forms]
17. Placeholder text doing a label's job. [primer/a11y/placeholders]
18. Tooltips on non-interactive elements or carrying essential information. [primer/a11y/tooltips]

## Rules by topic

### Color and theming

- Style with semantic tokens (foreground, background, border roles: accent, success, attention, danger), never raw hex in components. [primer/primitives/color]
- Accent carries links and selected/active/focus states; success carries the primary action; danger carries destructive actions and errors. [primer/color-usage]
- Any emphasis background pairs with its on-emphasis foreground. [primer/color-usage]
- Never convey meaning by color alone — add text or an icon. [primer/a11y/color-considerations] [refactoringui]
- Ship a compliant default light and dark theme; honor `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`. [primer/responsive]
- Build the palette up front: 8–10 greys, 5–10 shades per primary hue, 3–4 accent hues — never a single brand hex. [refactoringui]
- Use the 11-step oklch scale (50…950) as the default; add hues with `@theme { --color-x-500: oklch(…) }`; retire unused ones with `--color-lime-*: initial`. [tw-docs/colors]
- Tint greys toward the brand; start dark text from a very dark grey, never true black. [refactoringui]
- Never grey text on a colored background — use a lighter shade of the same hue or an opacity modifier. [refactoringui] [tw-docs/colors]
- Make tints with `/opacity` and `--alpha()`, not new hex values. [tw-docs/colors]
- Interpolate gradients in oklch (`bg-linear-to-r/oklch`); reach for `mist`, `taupe`, `mauve`, `olive` when a neutral shouldn't be grey. [tw-blog/v4] [tw-blog/v4.3]
- Choose the hue from the product's identity in a perceptual space; test non-indigo hues on purpose. [dev.to/jaainil] [wheelsup]

### Typography

- Body 14px/1.5 default, 16px/1.5 large, 12px/1.625 small; code 13px/1.5 monospace; sizes in `rem`, unitless line-heights on a 4px grid. [primer/primitives/typography]
- Headings: display 40/500, title-large 32/600, title-medium 20/600, title-small 16/600; weights only 300–600. [primer/primitives/typography]
- Measure ≤ 80 characters (aim 60–70; Refactoring UI says 45–75); left-aligned, ragged right; never justify or center body copy. [primer/typography] [refactoringui]
- Semantic `h1`–`h6` in order, one `h1` per page; never pick a heading tag for its size. [primer/typography]
- Use the fixed scale 12/14/16/18/20/24/30/36/48/60/72 — Tailwind's `text-xs`…`text-7xl`; set size and leading together (`text-sm/6`). [refactoringui] [tw-docs/font-size]
- Line-height falls as size rises: ~1.5 at body, 1 at display. [refactoringui] [tw-docs/font-size]
- Weights 400–500 for body, 600–700 for emphasis; nothing under 400 in UI. [refactoringui]
- Carry hierarchy with weight and three text colors (dark, grey, lighter grey), not size alone. [refactoringui]
- Align mixed sizes on the baseline (`items-baseline`, `items-baseline-last`). [refactoringui] [tw-blog/v4.1]
- One display face with a point of view plus one body face, applied consistently. [mania] [925studios]
- One solid heading color; emphasize with size and weight, never gradient text. [impeccable]

### Spacing and layout

- Spacing scale 4/8/12/16/20/24/28/32/36/40/44/48/64/80/96/112/128px. [primer/primitives/size]
- Radii 3/6/12px; borders 1/2/4px; control heights 24/28/32/40/48px. [primer/primitives/size]
- Breakpoints 320/544/768/1012/1280/1400; page max-width 1280px; content padding 16px, 24px at xlarge. [primer/layout]
- Must reflow at 320×256 with no two-axis scroll; usable at 50–400% zoom. [primer/responsive]
- Start with too much white space and remove it — density is a decision. [refactoringui/free-chapter]
- Geometric spacing steps ≥ 25% apart; Tailwind's `--spacing: 0.25rem` multiples. [refactoringui] [tw-blog/v4]
- More space between groups than within them — spacing carries grouping, not equal gaps. [refactoringui] [impeccable]
- Don't fill the screen; cap content with `--container-*` widths. [refactoringui] [tw-docs/theme]
- Vary radius and padding deliberately; a child's radius never exceeds its parent's (concentric). [mania] [vercel-wig]
- Icons at 16/24px (Octicons: 1.5px stroke) or 16/20 (Heroicons in Catalyst); never upscale. [primer/octicons] [catalyst]

### Hierarchy and emphasis

- Emphasize by de-emphasizing the neighbors; labels are a last resort. [refactoringui]
- Not every button needs color: one solid primary, a soft or outline secondary, a link tertiary. [refactoringui]
- Fewer borders: separate with shadow, background contrast, or spacing. [refactoringui]
- A fixed 5-level elevation scale, each shadow two-part (large soft + tight dark) — Tailwind's `shadow-2xs`…`shadow-2xl`. [refactoringui] [tw-docs/theme]
- Shadows layered (≥ 2), one light source, tinted to the background hue, never flat black. [comeau] [vercel-wig]
- Frosted glass only for actual layering; combine border and shadow for crisp edges; cut glow so information stands out. [impeccable] [vercel-wig]
- Break the triptych: group related ideas and vary the layout per content. [impeccable] [925studios]

### States, accessibility, responsiveness

- Target WCAG 2.2 AA: 4.5:1 body text, 3:1 large text and UI parts, 7:1 in high-contrast themes. [primer/a11y/fundamentals] [primer/color-usage]
- Hit areas ≥ 24×24px; 44px on touch — supply it with `pointer-coarse:`. [primer/responsive] [tw-blog/v4.1]
- Every interactive element gets a visible 2px `:focus-visible` outline at 3:1 in every theme. [primer/primitives/size] [tw-docs/states]
- Links navigate and are underlined; buttons act and are named "verb noun"; never nest interactives. [primer/a11y/links-and-buttons]
- Don't disable the primary button — keep it enabled and validate on submit, then inline. [primer/forms] [primer/saving]
- Forms: visible label ≤ 3 words, required marked visually and in code, captions not placeholders, one message per control via `aria-describedby`; show errors with `user-invalid:` after interaction. [primer/forms] [tw-docs/states]
- Loading: < 1s nothing; 1–3s spinner or skeleton; 3–10s progress bar; > 10s background it; one `role="status"` per region. [primer/loading]
- Skeletons mirror the final layout; design empty, sparse, dense, error, and loading states. [vercel-wig] [refactoringui]
- Messaging near the action: banner for page or section, inline for field feedback, dialog for blocking errors; avoid toasts. [primer/notification-messaging]
- Mobile-first: unprefixed utilities are the phone; container queries (`@container` + `@md:`) for reusable components, viewport breakpoints for page layout only. [tw-docs/responsive]
- `hover:` fires only under `(hover: hover)`; give touch its own affordance. [tw-docs/states]
- Dark mode pairs every light value with a `dark:` value; a toggle uses `@custom-variant dark (&:where(.dark, .dark *))` set in `<head>` to avoid a flash. [tw-docs/dark-mode]
- Prefer native HTML; ARIA only when no native element fits. Tab reaches standalone controls, arrow keys move inside composites. [primer/a11y/semantic-html-and-aria] [github.blog/tree-view]
- Dialog opens: focus moves in and is trapped; on delete, focus goes to the previous interactive element. [primer/a11y/focus-management]
- Never truncate text that holds links or buttons; expose the full text via focus or an explicit expand. [primer/a11y/truncation]

### Motion

- Wrap animation in `motion-safe:` / `@media (prefers-reduced-motion: no-preference)`; keep loading indicators subtle rather than removed. [primer/a11y/motion] [tw-docs/states]
- Auto-playing motion stops within 5s and holds a static end state; anything longer gets a pause control; never flash > 3×/s. [primer/a11y/motion]
- No parallax, no auto-advancing carousels, no decorative transitions. [primer/a11y/motion]
- Interactions ≤ 200–300ms, ease-out, `transform` and `opacity` only; never `transition: all`; don't animate keyboard-repeated actions. [rauno] [emilkowalski] [vercel-wig]
- Static status stays still; motion signals real activity or cause and effect. [impeccable] [vercel-wig]
- Reduced-motion variant swaps scale, pan, and parallax for fade; keeps feedback animations. [web.dev/reduced-motion] [emilkowalski]
- Easing tokens: out `cubic-bezier(0,0,0.2,1)`, in-out `(0.4,0,0.2,1)`. [tw-docs/theme]

### Copy

- Sentence case everywhere; no terminal punctuation in headings, labels, buttons; no exclamation marks, emoji, "easy / just / quick", or "click here". [primer/content]
- Buttons open with an imperative verb ("Save preferences") or adjective + noun ("New issue"); "sign in" not "log in"; "you" not "my". [primer/content]
- Errors are specific, jargon-free, blameless, unfunny, minimally apologetic — "Enter a name", not "Oops". [primer/content] [primer/empty-states]
- Headlines say something only this product could say: what the user can do and what improves. [925studios] [impeccable]
- An action keeps its name through the flow: "Publish" produces "Published". [consensus]

### AI and agent surfaces

- Label who is speaking; announce streaming through a live region about every 5s; let users stop and undo; no unexplained focus or layout shifts. [primer/a11y/copilot-principles] [primer/a11y/copilot-practices]

## Numbers

| Scale               | Tier 1 — Primer                                                                                | Tier 2 — Tailwind / Refactoring UI                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing             | 4 8 12 16 20 24 28 32 36 40 44 48 64 80 96 112 128px                                           | `--spacing: 0.25rem` multiples; geometric 4 8 12 16 24 32 48 64 96 128                                                                                                                                                                        |
| Type size / leading | 12/1.25 caption · 12/1.625 · 13/1.5 code · 14/1.5 body · 16/1.5 · 20/1.625 · 32/1.5 · 40/1.375 | xs 12/16 · sm 14/20 · base 16/24 · lg 18/28 · xl 20/28 · 2xl 24/32 · 3xl 30/36 · 4xl 36/40 · 5xl 48/1 · 6xl 60/1 · 7xl 72/1                                                                                                                   |
| Weights             | 300 400 500 600                                                                                | 400–500 body, 600–700 emphasis                                                                                                                                                                                                                |
| Radius              | 3 6 12px                                                                                       | xs 2 · sm 4 · md 6 · lg 8 · xl 12 · 2xl 16 · 3xl 24 · 4xl 32                                                                                                                                                                                  |
| Borders             | 1 2 4px                                                                                        | —                                                                                                                                                                                                                                             |
| Control heights     | 24 28 32 40 48px                                                                               | —                                                                                                                                                                                                                                             |
| Breakpoints         | 320 544 768 1012 1280 1400                                                                     | sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536                                                                                                                                                                                                |
| Container queries   | —                                                                                              | @3xs 16rem … @7xl 80rem (16 18 20 24 28 32 36 42 48 56 64 72 80)                                                                                                                                                                              |
| Shadows             | —                                                                                              | 2xs `0 1px/.05` · xs `0 1px 2px/.05` · sm `0 1px 3px/.1 + 0 1px 2px -1px/.1` · md `0 4px 6px -1px + 0 2px 4px -2px/.1` · lg `0 10px 15px -3px + 0 4px 6px -4px/.1` · xl `0 20px 25px -5px + 0 8px 10px -6px/.1` · 2xl `0 25px 50px -12px/.25` |
| Contrast            | 4.5:1 text · 3:1 large text + UI · 7:1 high-contrast                                           | 4.5:1 body (or APCA)                                                                                                                                                                                                                          |
| Targets             | 24px min · 44px touch                                                                          | `pointer-coarse:` for the 44px case                                                                                                                                                                                                           |
| Measure             | ≤ 80 chars, aim 60–70                                                                          | 45–75 chars (20–35em)                                                                                                                                                                                                                         |
| Palette             | semantic roles: accent success attention danger done open closed sponsors                      | 11 shades/hue; 8–10 greys, 5–10 primary, 3–4 accent hues                                                                                                                                                                                      |
| Motion              | auto-play ≤ 5s · ≤ 3 flashes/s · live-region ping 5s                                           | ≤ 200–300ms, ease-out, transform/opacity only                                                                                                                                                                                                 |
| Loading             | < 1s none · 1–3s indeterminate · 3–10s determinate · > 10s background                          | —                                                                                                                                                                                                                                             |
| Zoom / reflow       | 200% required, 50–400% usable, 320×256 min                                                     | —                                                                                                                                                                                                                                             |

## Reading list — restock from here

Fetch in this order. Tier 1 first; stop each tier when the rules you need are confirmed.

**Tier 1 — GitHub / Primer**

- https://primer.style/product/primitives/typography
- https://primer.style/product/primitives/size
- https://primer.style/product/primitives/color
- https://primer.style/product/getting-started/foundations/color-usage
- https://primer.style/product/getting-started/foundations/typography
- https://primer.style/product/getting-started/foundations/layout
- https://primer.style/product/getting-started/foundations/responsive
- https://primer.style/product/getting-started/foundations/content
- https://primer.style/product/getting-started/foundations/icons
- https://primer.style/product/ui-patterns/forms · /loading · /notification-messaging · /empty-states · /saving · /progressive-disclosure
- https://primer.style/accessibility/foundations/accessibility-fundamentals
- https://primer.style/accessibility/design-guidance/color-considerations · /links-and-buttons · /focus-management · /motion-and-animation · /semantic-html-and-aria · /text-resize-and-spacing
- https://primer.style/accessibility/tools-and-resources/checklists/designer-checklist
- https://primer.style/accessibility/patterns/tooltips · /truncation · /placeholders
- https://primer.style/accessibility/foundations/copilot-principles · /patterns/copilot-accessibility-practices
- https://primer.style/octicons/design-guidelines
- https://github.blog/open-source/building-githubs-next-chapter-in-accessibility/ (2026-05-21)
- https://github.blog/engineering/user-experience/design-system-annotations-part-1-how-accessibility-gets-left-out-of-components/ (2025-05-09)
- https://github.blog/engineering/user-experience/considerations-for-making-a-tree-view-component-accessible/ (2025-01-28)
- https://github.blog/changelog/2025-06-05-control-contrast-for-all-github-themes/ (2025-06-05)

**Tier 2 — Tailwind / Refactoring UI**

- https://tailwindcss.com/blog (index; scan for releases newer than the restock date)
- https://tailwindcss.com/blog/tailwindcss-v4 (2025-01-22) · /tailwindcss-v4-1 (2025-04-03) · /tailwindcss-v4-3 (2026-05-08)
- https://tailwindcss.com/docs/theme · /colors · /font-size · /text-shadow
- https://tailwindcss.com/docs/responsive-design · /dark-mode · /hover-focus-and-other-states · /styling-with-utility-classes
- https://www.refactoringui.com and https://www.refactoringui.com/book
- https://refactoring-ui.nyc3.cdn.digitaloceanspaces.com/Refactoring%20UI%20-%20Start%20with%20too%20much%20white%20space.pdf (official free chapter)
- https://catalyst.tailwindui.com/docs

**Tier 3 — the wider consensus on slop**

- https://impeccable.style/slop/ — the fullest catalogue of tells with paired fixes
- https://vercel.com/design/guidelines — Web Interface Guidelines (changelog 2026-01-12)
- https://interfaces.rauno.me/ · https://emilkowal.ski/ui/great-animations · https://www.joshwcomeau.com/css/designing-shadows/
- https://web.dev/articles/prefers-reduced-motion
- https://www.nngroup.com/articles/ai-prototyping/ (2025-10-24, rev. 2026-08)
- https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website (2025-10-26)
- https://www.925studios.co/blog/ai-slop-design-tells (2026-09) · https://www.mania.design/blog/spot-the-slop-a-ui-designers-guide-to-fixing-ai-defaults/ (2026-07-23) · https://smoothui.dev/blog/ai-design-slop (2026-06-24)
- https://dev.to/jaainil/ai-purple-problem-make-your-ui-unmistakable-3ono (2025-10-08) · https://www.wheelsupcollective.com/post/we-dont-want-a-beige-internet (2026-05-27)

Known gaps at restock: Primer publishes no reachable motion-duration or easing tokens (motion rules come from its accessibility guidance). Primer pages show no last-updated dates. Refactoring UI's numeric scales come from the book, confirmed through third-party notes where the book itself is not online.

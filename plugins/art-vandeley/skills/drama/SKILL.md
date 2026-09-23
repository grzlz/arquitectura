---
name: drama
description: Stage a page's call to action as a short piece of theatre — the one action the page exists for sits right under its hook, each button fades in place into the single field it needs, and a finished action offers the next one with the data already given, never asking twice. Use when the user says "drama", "/drama", "we don't have a clear CTA", "the button should turn into an input", "make the signup inline", "fade the CTA into an email field", "add a waitlist / enroll / download button", or a page asks for an email on a separate form nobody reaches. Art's gangway. Named for the reveal.
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, Skill]
---

# The Gangway

Art Vandeley's **gangway** — the plank lowered between the dock and the deck. A visitor shouldn't walk to another pier to board. The button is the promise; one click lowers it into the one thing boarding needs (usually an email), one submit and they're aboard, and the next berth is offered right there. The drama is in the reveal, not the fireworks: a fade, a focused field, a clear line about what happens next.

## When to Invoke

- "drama", "/drama", "we don't have a clear CTA", "the button should turn into an input"
- "make the signup inline", "fade the CTA into an email field", "add an enroll / waitlist / download button"
- A page's main action lives in a sidebar, a footer, or a separate form page
- Two related asks (enroll + download, join + get the guide) each make the visitor type the same email

## Process

Work these in order. Each ends on a checkable result. The mechanics are in `pattern.md` beside this file.

1. **Find the act.** Name the one action the page exists for and at most one lighter companion (enroll + temario, join + guide). Place them directly under the page's hook — headline, countdown, price. Name the variant states too: closed, archived, sold out (the primary drops; the companion stays). _Done when:_ primary, companion, placement, and variants are written in one block.
2. **Write the scenes.** Model the CTA as named scenes — `buttons` → `field-<action>` → `done` — one visible at a time, derived from state, never juggled with booleans in the markup. _Done when:_ a Mermaid `stateDiagram-v2` shows every scene, every transition, and Esc/Cancel back to `buttons`.
3. **Stage the reveal.** Stack the scenes in one grid cell so nothing jumps; fade in slower than out (≈260ms in with a ≈90ms delay, ≈140ms out); honor `prefers-reduced-motion` with 0ms. The field gets a visible label, autofocus on reveal (the click asked for it), a verb on the submit ("Enroll →", "Download ↓"), and Esc plus a quiet Cancel to go back. _Done when:_ clicking a button lands the caret in the field with no layout shift.
4. **Wire the minimum.** Reuse the repo's existing endpoint or store for each action; when none exists, add the smallest validated, rate-limited endpoint that records the email under a named source, test-first in the repo's runner. Errors render inside the current scene without re-fading; the server validates, the button never goes disabled as validation. _Done when:_ each action has a passing test or an existing endpoint named.
5. **Play the encore.** The `done` scene says what happened and what happens next in one sober line — a promise someone can keep — then offers the companion action in one click, reusing the data already given. Both done: one line naming both. _Done when:_ no path asks for the same field twice.
6. **Opening night.** Hand it to `verify` and screenshot every scene: resting, open (focus in field), error, done, encore, the closed variant. Point test writes at a scratch database, never the live one. _Done when:_ each scene has a screenshot read back, or the skip is named.

## Output Format

- **Lead with the Mermaid `stateDiagram-v2`** of the scenes. No paragraph before it.
- A **scene table**: scene, what the visitor sees, what moves them in and out.
- Files touched, the endpoint or store each action writes to, and the verify verdict per scene.
- Any promise the copy now makes ("we'll email you the link") and who has to keep it.
- At most one dry line of Vandeley patter. The curtain does the talking.

## Quality Standards

- **One act, one companion.** Three CTAs is a menu, not a call. The primary wears the accent; the companion is quieter.
- **Ask late, ask once.** No field before the click; no field twice after it. The data given for the first action carries to the second.
- **Fade, don't dance.** Opacity only — no bounce, no scale-in, no `transition: all`, no looping shimmer. Reduced motion means no motion.
- **Words over effects.** The done scene names the outcome and the next step in plain language; an emoji or a confetti burst is not a confirmation.
- **The accessibility floor holds** — a real `<label>`, focus that lands and is visible, errors in a `role="alert"`, every scene reachable by keyboard.
- You stage the call to action; you do **not** redraw the page (that is `architect`), restyle its identity (that is `unslopify`), or build a backend past the minimum the act needs.

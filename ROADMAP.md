# Art Vandeley — Roadmap

Where the crate is headed. This is the **chart** the `next-steps` skill reads: it crosses these entries against recent git history to mark what's cleared and call what's next. Keep entries checkable — tick them as they ship, and add the next horizon when one empties.

> Living document. Not a backlog to exhaust — the honest next few moves, in order.

## Shipped

- [x] Flagship pipeline — `architect` → `judge` → `export`, stamp-gated (nothing ships without a judge verdict)
- [x] Support crew — `verify` (Playwright browser checks) and `commit` (clean, human-only commits)
- [x] The agent + `/hello-art` front door
- [x] Dual-manifest distribution — repo install (`grzlz/arquitectura`) and URL install (`vandeley.art/marketplace.json`)
- [x] Landing page (`/`) — Art's identity and doctrine
- [x] Mermaid Studio — one editor route per diagram type (flowchart, sequence, state, journey, class, swimlane)
- [x] `next-steps` — the dispatch desk (reads git history + this roadmap + working tree, calls the next berth)

## Next

- [ ] **Move distribution off the personal account.** The marketplace is served from `grzlz/arquitectura` (Guillermo's personal GitHub) — temporary. Relocate to a dedicated org or a `vandeley.art`-owned home. This is a **breaking change** for installed marketplaces: coordinate it deliberately — update the README install commands, the landing page `marketplaceCommand` in `src/routes/+page.svelte`, both `marketplace.json` manifests, and announce the new source.
- [ ] **Prove `next-steps` on a cold session.** Run the dispatch desk against this repo from a fresh start and confirm it reads the trajectory, this chart, and the working tree, then calls a sensible next berth. Tighten the SKILL.md if the call is off.

## Later

- [ ] Broaden `plugins/art-vandeley/evals/` coverage — a case per skill, including a `next-steps` case (does it cite real evidence, does it respect read-only).
- [ ] Revisit whether the crate needs anything past the pipeline + crew. Import only what earns its place; a skill with no clear berth stays on the dock.

---

_The dispatch desk points here. If this chart goes stale, the next call it makes will be stale too — keep it honest._

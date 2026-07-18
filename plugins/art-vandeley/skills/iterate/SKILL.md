---
name: iterate
description: Refit the art-vandeley plugin itself — add or change a skill, command, or agent under `plugins/art-vandeley/`, then walk the full release checklist so the change actually reaches installs — version bump in plugin.json, both marketplace manifests in sync, ROADMAP.md ticked, an eval case added, the installed copy refreshed. Use when the user says "lets work on a new skill", "iterate the plugin", "add a skill to art-vandeley", "update the plugin", "ship a new plugin version", or any change is about to land inside `plugins/art-vandeley/`. Art's dry dock. The one berth where the ship itself is the cargo.
allowed-tools: [Read, Grep, Glob, Bash, Write, Edit, Skill]
---

# The Dry Dock

Art Vandeley's **dry dock** — where the ship comes out of the water. Every other skill works cargo; this one refits the vessel that carries it: the skills, commands, agent, and manifests inside `plugins/art-vandeley/`. A refit is not done when the file is edited — it is done when the change is versioned, registered in both manifests, charted, tested, and visible in an actual install. An edit that never reaches `claude plugin list` never happened.

## When to Invoke

- "lets work on a new skill", "iterate the plugin", "add a skill to art-vandeley", "update the plugin", "ship a new plugin version"
- Any edit about to land under `plugins/art-vandeley/` — skill, command, agent, or manifest
- A plugin change was made but installs still serve the old behavior

## The Moving Parts

One refit can touch up to seven surfaces. Know them before cutting steel:

| Surface | File | When it moves |
| --- | --- | --- |
| The crate | `plugins/art-vandeley/` (skills/, commands/, agents/) | every refit |
| Hull number | `plugins/art-vandeley/.claude-plugin/plugin.json` (`version`, skill list in `description`) | every refit |
| Repo manifest | `.claude-plugin/marketplace.json` — **relative** source, for `/plugin marketplace add grzlz/arquitectura` | when name/description change |
| URL manifest | `static/marketplace.json` — **git-subdir** source, served at `vandeley.art/marketplace.json` | same changes, kept in sync |
| The chart | `ROADMAP.md` | every refit |
| Trial cases | `plugins/art-vandeley/evals/` | new or changed behavior |
| Distribution surfaces | `README.md`, `marketplaceCommand` in `src/routes/+page.svelte` | only when the install route itself changes |

## Process

Work these in order. Each ends on a checkable result.

1. **Survey the vessel.** Read `plugin.json` for the current version and crate contents; skim `ROADMAP.md` for where this refit was charted. _Done when:_ current version and what the refit changes are both stated in one line.
2. **Cut the steel.** Make the change. A new skill wears the crate's uniform: frontmatter description with concrete trigger phrases, third person, a station tagline; body with the station metaphor, When to Invoke, a Process whose steps each end on _Done when_, an Output Format, and Quality Standards closing on a one-line boundary ("you do X; you do **not** Y"). Lean — siblings run ~50 lines. _Done when:_ the change reads like it was always part of the crate.
3. **Renumber the hull.** Bump `version` in `plugin.json` — minor for new capability, patch for a fix to existing behavior. If the crate contents changed, update the skill list inside `plugin.json`'s `description`. _Done when:_ version and description both match what the crate now holds.
4. **Sync the papers.** If name or description moved, mirror it in **both** manifests — `.claude-plugin/marketplace.json` and `static/marketplace.json`. Never "simplify" the static manifest's `git-subdir` source to a relative path: a URL-hosted marketplace downloads only the JSON, so relative paths silently break that install route. _Done when:_ `grep` for the old description across both manifests comes back empty.
5. **Update the chart.** Tick what this refit ships in `ROADMAP.md`; add the next horizon if a section emptied. _Done when:_ `next-steps` reading the chart cold would call the state correctly.
6. **Trial run.** Add or update an eval under `evals/<name>/case.yaml` (match the existing schema: `execution.prompt`, regex + llm graders, `expected_outcome`). Run `tests/pipeline-tests.sh` if pipeline skills changed. _Done when:_ the new behavior has at least one checkable case.
7. **Ship and refresh.** Hand the commit to the `commit` skill. After push to `main`, the repo install serves immediately; the URL route needs a rebuild + restart on the host (static assets bake into `build/client/`). Then refresh the local install: `claude plugin marketplace update vandeley && claude plugin update art-vandeley@vandeley`. If a command still misbehaves, check in order: `~/.claude/commands/` shadowing → `claude plugin list` version and enabled state. _Done when:_ `claude plugin list` shows the new version, enabled.

## Output Format

- A short **refit manifest**: what changed, old → new version, and each moving part marked synced or untouched-with-reason.
- If a step was deliberately skipped (no eval, no push), say so plainly — an unlisted skip reads as done.
- At most one dry line of Vandeley patter. The dock works; it doesn't christen.

## Quality Standards

- **One crate, always.** Skills never split back into separate marketplace plugins — the single install is the product.
- **Every refit renumbers.** No plugin change ships without a version bump; installs update by version, so an unbumped change is invisible to every consumer.
- Both manifests or neither — a description that moved in one file and not the other means two install routes now disagree about the same plugin.
- A skill with no clear berth stays on the dock: import only what earns its place in the crate.
- You refit the ship; you do **not** work the cargo. Designing, judging, or exporting user components belongs to the pipeline skills — the dry dock only touches the vessel.

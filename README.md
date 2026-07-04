# Art Vandelay

> "And you want to be my latex salesman."

**Art Vandelay** is an importer/exporter for Claude Code: he imports the skills that fit your environment and exports well-architected components. He speaks in Mermaid + Markdown, and nothing ships without a judge-approved verdict.

```mermaid
flowchart LR
  PROB["A problem"] ==>|"/architect"| DESIGN{{"Map + doctrine<br/>components · seams · decisions"}}
  DESIGN ==>|"/judge"| VERDICT{"The verdict"}
  VERDICT ==>|"stamped — approved for export"| SHIP[["/export<br/>component in your stack"]]
  VERDICT -.back to the bench.-> PROB
```

This repo holds both halves of the operation:

- **The marketplace** — six Claude Code plugins under `plugins/`, published via `.claude-plugin/marketplace.json`.
- **The site** — the SvelteKit app behind [vandeley.art](https://vandeley.art): Art's landing page plus the Mermaid Studio.

## Install

Art Vandelay is distributed as a **Claude Code plugin marketplace**. Inside any Claude Code session:

```
/plugin marketplace add grzlz/arquitectura
```

Then install the plugins you want:

```
/plugin install art-vandelay@vandelay
/plugin install architect@vandelay
/plugin install judge@vandelay
/plugin install export@vandelay
/plugin install verify@vandelay
/plugin install commit@vandelay
```

Or browse interactively — run `/plugin`, pick the **vandelay** marketplace, and install from there. To pick up new releases later:

```
/plugin marketplace update vandelay
```

## The pipeline

The flagship plugins form a three-stage pipeline. Each stage does one job and refuses the others'.

| Stage        | Plugin      | Role                                                                                                                                          |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/architect` | `architect` | The drafting table. Turns a problem into a well-architected map — components, boundaries, seams, load-bearing decisions. Diagram first, doctrine second. It designs; it does not build. |
| `/judge`     | `judge`     | The tribunal. Weighs a design, diff, or module against five criteria — depth, seams, coupling, failure modes, fit — and renders a decisive verdict. The ruling is binding. It rules; it does not rewrite. |
| `/export`    | `export`    | The shipping dock. Fabricates the component from a stamped design, in your repo's own stack and idiom, papers attached. Refuses unstamped cargo. |

## The support crew

| Plugin         | What it does                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `art-vandelay` | The agent himself. Reads your environment (repo, stack, task), imports the skills that fit, answers in Mermaid + Markdown. Say `/hello-art`. |
| `verify`       | Real browser-based verification with Playwright — confirms a change actually rendered instead of just reporting it done.                     |
| `commit`       | Surveys changes with `git diff --stat` before reading hunks, groups them into logical commits, writes each with a unified template. No agent attribution. |

## Compatibility

- **Optimized for Claude Code.** Everything here ships as Claude Code plugins — skills, agents, and slash commands built and tested against Claude Code's plugin system. That is the supported path.
- **AGENTS.md only.** Outside Claude Code, the only agent-instruction format we support is the [AGENTS.md](https://agents.md) standard. If your tool reads `AGENTS.md`, Vandelay's exports will work with it. We do not maintain tool-specific instruction files for other agents.

## The site (vandeley.art)

A SvelteKit app: `/` is Art's landing page — his identity and doctrine — and the **Mermaid Studio** is a family of standalone diagram editors, one route per diagram type:

| Route        | Editor                              |
| ------------ | ----------------------------------- |
| `/flowchart` | Flowcharts (`graph LR/TD/TB`)       |
| `/sequence`  | Sequence diagrams                   |
| `/state`     | State machine diagrams              |
| `/journey`   | User journey diagrams               |
| `/class`     | Class diagrams                      |
| `/swimlane`  | Swimlane (subgraph-based) diagrams  |

Each editor renders live via Mermaid 11 (client-side only), keeps saved diagrams in `localStorage`, and exports SVG.

**Stack:** Svelte 5 (runes) · SvelteKit 2 · Tailwind CSS v4 · Mermaid 11 · plain JavaScript, ES modules throughout.

```sh
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint     # prettier check + eslint
```

## Repo layout

```
.claude-plugin/marketplace.json   # the vandelay marketplace manifest
plugins/                          # one directory per plugin
  <name>/.claude-plugin/plugin.json
  <name>/skills/<name>/SKILL.md   # architect, judge, export, verify, commit
  art-vandelay/agents/            # the Art Vandelay agent + /hello-art command
src/routes/                       # landing page + one route per diagram editor
src/lib/                          # shared components and rune-based state
docs/                             # design notes and .mmd source diagrams
```

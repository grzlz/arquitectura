# Art Vandelay

> "And you want to be my latex salesman."

**Art Vandelay** is an importer/exporter for Claude Code: he imports skills and exports well-architected components. Nothing ships without a judge-approved verdict — the pipeline is `/architect` → `/judge` → `/export` — and he communicates in Mermaid + Markdown.

## Install

Art Vandelay is distributed as a **Claude Code plugin marketplace**. Inside any Claude Code session, add the marketplace:

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

Or browse interactively — run `/plugin`, pick the **vandelay** marketplace, and install from there.

To pick up new releases later:

```
/plugin marketplace update vandelay
```

## The plugins

| Plugin         | What it does                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `art-vandelay` | The agent himself. Reads your environment, imports the skills that fit, answers in Mermaid + Markdown.               |
| `architect`    | Designs a system's architecture and exports it as a Mermaid map plus a short doctrine. The export engine.            |
| `judge`        | Evaluates an architecture, design, diff, or module and renders a decisive verdict — Mermaid risk map + scored ruling. The tribunal. |
| `export`       | Fabricates and ships a well-architected component from a judge-approved design — code, papers, stamp. The shipping dock. |
| `verify`       | Real browser-based verification with Playwright — confirms a change actually rendered instead of just reporting it done. |
| `commit`       | Surveys changes with `git diff --stat` first, groups them into logical commits, writes each with a unified template. No agent attribution. |

## Compatibility

- **Optimized for Claude Code.** Everything here ships as Claude Code plugins — skills, agents, and slash commands built and tested against Claude Code's plugin system. That is the supported path.
- **AGENTS.md only.** Outside Claude Code, the only agent-instruction format we support is the [AGENTS.md](https://agents.md) standard. If your tool reads `AGENTS.md`, Vandelay's exports will work with it. We do not maintain tool-specific instruction files for other agents.

## The site (vandeley.art)

This repo also hosts the SvelteKit app behind vandeley.art — Art's landing page plus the Mermaid Studio, a family of standalone diagram editors (`/flowchart`, `/sequence`, `/state`, `/journey`, `/class`, `/swimlane`).

```sh
npm install
npm run dev    # dev server
npm run build  # production build
```

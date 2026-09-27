---
name: news
description: Report what's new in the art-vandeley crate since the version installed here — read the installed version, fetch the published changelog from vandeley.art, list every release newer than the install, and hand over the exact update commands. Use when the user says "news", "/news", "what's new", "what's new in art", "any new skills", "is my plugin up to date", "did art ship anything", or "how do I update art-vandeley". Art's harbor bulletin. About the crate only — industry news is `radar`'s watch.
allowed-tools: [Bash, Read, WebFetch]
---

# The Harbor Bulletin

Art Vandeley's **harbor bulletin** — the board by the harbormaster's office that lists what docked since you last looked. It doesn't sell the cargo; it posts arrivals, dates them, and tells you which berth to walk to. The crate doesn't ship itself to installs: nobody gets a new skill until they pull it, so the bulletin says plainly when you're behind.

## When to Invoke

- "news", "what's new", "any new skills", "did art ship anything"
- "is my plugin up to date", "how do I update art-vandeley"
- Not for industry or agent news — that's `radar`.

## Process

1. **Read the installed version.** Run `claude plugin list`. Take the `art-vandeley@<marketplace>` entry's version, and keep its marketplace name. It's usually `vandeley`, but use whatever is actually there. Fallback: the same entry in `~/.claude/plugins/installed_plugins.json`. _Done when:_ the installed version and marketplace name are stated, or "unknown" with the reason.
2. **Fetch the bulletin.** `curl -fsSL https://vandeley.art/changelog.md`. If that fails, try `https://raw.githubusercontent.com/grzlz/arquitectura/main/static/changelog.md`. Use `WebFetch` only if curl is unavailable, since it summarizes and can drop lines. _Done when:_ you have the raw changelog text, or both sources are named as unreachable.
3. **Diff the arrivals.** Parse each `## <version> — <date>` heading. Keep the releases newer than the installed version by semver. If the version is unknown, show the latest three. _Done when:_ you have a list of newer releases, or a statement that none exist.
4. **Post it.** Output in the format below. When the install is behind, give the update commands verbatim. _Done when:_ the user can tell in one glance whether they're current, and can copy the commands if they're not.

## Output Format

- One status line: `Installed 0.9.0 · Latest 0.10.0 — 1 release behind` or `Current — 0.10.0`.
- Newer releases, newest first. Each gets a `**<version> — <date>**` line followed by its bullets exactly as published. Don't paraphrase them or add features.
- If behind, show the three steps in one fenced block, using the marketplace name from step 1: `/plugin marketplace update <marketplace>`, then `/plugin update art-vandeley@<marketplace>`, then restart Claude Code. Add one line: auto-update can be turned on under `/plugin` → Marketplaces.
- At most one dry line of Vandeley patter.

## Quality Standards

- **Published or it didn't happen.** Report only what the changelog says. Never infer releases from memory, git, or skill names.
- **Semver, not string order.** 0.10.0 is newer than 0.9.0.
- **Name the failure.** If the fetch or the version read fails, say which source failed. Never silently fall back to "you're current".
- You post the bulletin; you do **not** run the update for the user, and you do **not** cover industry news (`radar` does).

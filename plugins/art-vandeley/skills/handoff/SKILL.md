---
name: handoff
description: Finish the watch that's running, then hand the ship to a fresh agent whose sole task is to keep building — land the in-flight action (deploy, commit, test run), write a self-contained watch log (state, open items, standing orders, the building queue), launch the relief in the background, and step back. Use when the user says "handoff", "/handoff", "hand off to a new agent", "then handoff", "pass it to a fresh agent", "new agent to keep building", "spin up an agent to keep going"; or chains it after an approval ("yes, then handoff"). Art's change of watch. The bell rings; the deck stays manned.
allowed-tools: [Read, Grep, Glob, Bash, Agent, SendMessage, Skill]
---

# The Change of Watch

Art Vandeley's **change of watch** — eight bells, the officer on deck briefs the relief, and the ship never slows. A session that has shipped, deployed, and piled up context is a tired watch: it knows too much about the last job to see the next one cleanly. The relief comes aboard fresh, reads the log, and keeps building. Nothing said on the old watch reaches the new one unless it's written in the log.

## When to Invoke

- "handoff", "hand off to a new agent", "pass the baton", "fresh agent, keep building"
- Chained after an approval: "yes — then handoff to a new agent with the sole task of keep building"
- A long session just landed a milestone and the remaining work is more building, not more deciding

## Process

Work these in order. Each ends on a checkable result.

1. **Land the current watch.** A chained handoff runs _after_ the approved action, not instead of it. Finish the in-flight deploy, commit, or test run and read its outcome. Never hand over a half-applied migration or a deploy mid-flight. _Done when:_ the action succeeded or its failure is reported — and the failure goes in the log, it doesn't get buried.
2. **Survey the deck.** Gather what the relief can't see: branch and last commit (`git log --oneline -3`), working-tree status, what's deployed vs. only local, background shells still running, and every item waiting on the user (missing env vars, emails, a "go"). _Done when:_ each fact in the log came from a command or the conversation, not memory.
3. **Write the watch log.** The relief starts with zero context, so the brief must stand alone:
   - **Mission** — one line: keep building. Name the queue it builds from (the conversation's deferred items, `ROADMAP.md`, refactor reminders), in priority order.
   - **State** — repo path, branch, last commit, deployed/undeployed, uncommitted files.
   - **Waiting on the user** — listed, not guessed at; the relief routes around them.
   - **Standing orders** — the repo's rules (CLAUDE.md, test runner, backup-before-migrate), plus the boundary: build, test, commit locally; **do not deploy, push to prod, or run destructive ops without the user's explicit go.**
   - **Report back** — what finished, what's blocked, next move.

   No secrets in the log — reference `.env` keys by name, never values. _Done when:_ a stranger could start work from the log alone.

4. **Relieve.** Launch the relief with the `Agent` tool, in the background, the watch log as its prompt. If the outgoing session still holds the tree (a running shell, uncommitted work it owns), isolate the relief with `isolation: "worktree"`. No `Agent` tool on this host? Hand the user the log as a paste-ready prompt for a new session. _Done when:_ the relief's name/ID is in hand.
5. **Step off the deck.** Tell the user who has the watch and how to reach it (`SendMessage`, the agents view). The outgoing watch stops touching the tree. Never report the relief's results before its notification arrives. _Done when:_ the user knows who's building and what they're waiting on.

## Output Format

- One line on how the current watch landed (shipped / failed / skipped, with why).
- The watch log, as sent — so the user sees exactly what the relief was told.
- One line: the relief's name, its mission, how to reach it. Then the open items only the user can close.
- At most one dry line of Vandeley patter. Eight bells, not a speech.

## Quality Standards

- **Land before you leave.** An approved action is finished before the handoff, never abandoned for it.
- **The log is the only bridge.** If the relief needs it, it's written down; if it's a secret, it's named, not copied.
- **Sole task means sole task.** The relief builds; it doesn't deploy, re-plan, or re-open decided questions.
- **Faithful handover.** Failures, skips, and blockers go in the log as plainly as wins.
- You change the watch; you do **not** keep steering after it — no second-guessing the relief's work in the same session.

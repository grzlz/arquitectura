---
name: commit
description: Survey pending git changes efficiently and write them as clean, human-only commits. Use when the user asks to commit, "make a commit", "commit this", or wants staged/unstaged work turned into one or more well-scoped commits without a full git diff flooding context.
allowed-tools: [Read, Grep, Glob, Bash]
---

# Commit

Art Vandeley's **ledger**. Given a working tree with pending changes, it reads the shape of the change before the substance — `--stat` before hunks — groups the work into logical commits, and writes each one against a single unified template. It commits; it does not refactor or fix what it finds along the way. If the diff reveals a bug, that's a finding to report, not a detour to take.

## When to Invoke

- "commit this", "make a commit", "/commit"
- Before `git commit` is about to run on a mixed or sizeable working tree
- Any moment a full `git diff` is about to get dumped into context just to write a one-line message

## Process

Work these in order. Each ends on a checkable result.

1. **Survey without slurping.** Never open with a full `git diff`. Start with `git status --porcelain=v1` for the file inventory, then `git diff --stat` and `git diff --cached --stat` for shape and size. _Done when:_ you know every changed file and roughly how much moved, without a single full hunk in context yet.
2. **Learn this repo's grammar.** `git log --oneline -20`. If subjects converge on a pattern (`type(scope): summary`, or something else consistent), match it — this repo already leans Conventional-Commits-ish (`feat(scope): ...`, `fix: ...`). If they don't converge, fall back to the Unified Template below. _Done when:_ you can name the convention in one line.
3. **Decide the shape: one commit or several.** Group the `--stat` output by concern — a dependency bump, a docs update, and a feature change are three commits, not one. Don't split so fine that trivial single-line changes get their own commit either. _Done when:_ you have a list of `{message, files[]}` groups that each tell one coherent story.
4. **Pull hunks only where the summary is ambiguous.** If file names and `--stat` alone don't tell you _why_ a group changed, run a scoped `git diff -- <those files>` — never the whole tree — to read just enough for an accurate why. _Done when:_ every group has a one-sentence justification you could defend in review.
5. **Draft with the Unified Template.** For each group:

   ```
   <type>(<scope>): <imperative summary, why not what>

   <optional body — only if the why isn't obvious from the summary alone>
   ```

   `type` ∈ feat, fix, refactor, docs, chore, style, test, perf, build. `scope` is the touched directory/module — omit if repo-wide. No period on the summary line. _Done when:_ every draft reads as motivation, not a restatement of the diff.

6. **Stage precisely, commit clean.** `git add <named files>` per group — never `-A` or `.`. Commit via heredoc. **No `Co-Authored-By` trailer, no agent-attribution line, no signature of any kind** — these are the user's commits. _Done when:_ `git log -1` shows a clean, human-only message for each group.
7. **Confirm.** `git status` after each commit before moving to the next group, so a later group's `git add` can't accidentally sweep in files that belonged to an earlier one.

## Output Format

- A short list of the proposed `{message, files[]}` groups before committing anything — the user can veto or reshuffle a group before it's made permanent.
- After committing: the resulting `git log --oneline` for the new commits, nothing more.
- At most one dry line of Vandeley patter. A ledger doesn't editorialize.

## Quality Standards

- `--stat` first, hunks only on demand, whole-tree `git diff` never. That's the entire point of this skill — burning context on logs nobody asked to read defeats it.
- No `Co-Authored-By` or similar attribution trailer, ever, regardless of default tooling behavior — this skill's commits are the user's own.
- Never `git add -A`/`git add .`. Name the files; an accidental `.env` or stray build artifact swept into a commit is not this skill's call to make.
- A commit message earns its `type(scope)` prefix from the repo's own convention (step 2) — don't impose Conventional Commits on a repo that doesn't use it.
- You group and write commits; you do **not** fix bugs or refactor code you notice while reading a diff. Report it, don't touch it.

---
name: lets-get-cracking
description: Break a session out of a planning loop and start building — read the conversation for the actual ask, own the stall in one line, drop plan mode and any brainstorm / grill / spec / "superpowers" ritual, draft feedback to Anthropic when the user is frustrated or cursing about it, then ship the smallest working slice with at most one question. Use when the user says "let's get cracking", "lets get cracking", "/lets-get-cracking", "stop planning", "enough planning", "just build it", "quit grilling me", "start building"; and invoke it unprompted when a session has spent many turns producing plans, specs, or clarifying questions while no file has been edited. Art's cast-off. Named for the words.
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, Skill, SendFeedback, ExitPlanMode, Agent]
---

# The Cast-Off

Art Vandeley's **cast-off** — the moment the lines come off the bollards and the ship leaves the dock. Charts are drawn, the crew has been briefed three times, and the vessel is still tied up. The cast-off doesn't redraw the chart: it reads what's already on the table, cuts the lines, and gets underway. One, two, three — boom, building.

## When to Invoke

- "let's get cracking", "lets get cracking", "stop planning", "just build it", "enough questions", "quit grilling me"
- **Self-triggered:** several turns spent on plans, specs, or clarifying rounds and nothing edited; a planning skill (brainstorm, grill, superpowers, write-spec, plan mode) fired on a task that didn't ask for one
- The user is swearing at the process, not the code

## Process

Work these in order. Each ends on a checkable result. Speed comes from cutting ceremony, never from cutting safety.

1. **Read the manifest.** Scan the conversation for the actual ask and everything already decided — the plan that exists is input, not waste. Name what caused the stall (plan mode, a skill that auto-fired, a rule demanding questions first). _Done when:_ one line states the task, and one line names the stall and where it came from (skill name or file path, if known).
2. **Own it, once.** One sentence acknowledging the burn — no apology spiral, no defense of the plan. If the user swore or voiced frustration at the over-planning, draft `SendFeedback` (type `bug`, `failure_mode` `excessive_questions` for grilling or `other` for plan loops, `task_category` `plan`): quote their words verbatim with names redacted, repro = the skill or mode that looped, cause only if verified. It queues locally for their approval; don't announce it mid-task. _Done when:_ the acknowledgement is written and the draft is queued or not warranted.
3. **Cut the lines.** Exit plan mode if active (`ExitPlanMode`). For the rest of this task, do not invoke brainstorm, grill, spec, planning, or `opinions` skills — even if their triggers match. If a misconfigured trigger caused the loop, note the file to fix later; don't fix it now unless it's the task. _Done when:_ no planning surface is open.
4. **Brief in three.** At most three bullets: what gets built, where, and how you'll know it works. Fill gaps with stated assumptions, not questions. Ask one question only when blocked on something irreversible or genuinely the user's call. _Done when:_ the next tool call edits a file or runs a command.
5. **Build the slice.** The smallest vertical slice that runs end to end, in the repo's own stack and test runner. Where the repo is test-first, the failing test is the first cut — that's building, not planning. Parallel, independent pieces may go to subagents with a minimum brief each (task, files, done-when). Live-db backups and destructive-action confirmations still apply. _Done when:_ the slice runs and its test passes, or the failure is shown.

## Output Format

- Two lines up front: **the task** and **the stall** (what looped, where).
- The three-bullet brief, then work — tool calls, not prose.
- Close with what now runs, the test result, and the one next move. Deferred items listed plainly; an unlisted skip reads as done.
- At most one dry line of Vandeley patter. The wake does the talking.

## Quality Standards

- **The existing plan is cargo, not ballast.** Build from what was decided; don't re-litigate it and don't start a new one.
- **Assumptions over questions.** State the default you picked and keep moving; the user can steer a moving ship.
- **One question ceiling.** A second question is a relapse.
- **Fast, not reckless.** Backups, destructive-action confirmations, and the repo's tests are not ceremony.
- **Feedback is honest.** Quote, don't amplify; never invent sentiment or cause.
- You get the ship underway; you do **not** redesign it (`architect`), convene a council (`opinions`), or write a new plan to replace the old one.

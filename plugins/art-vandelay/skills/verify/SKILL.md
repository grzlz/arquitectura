---
name: verify
description: Install and drive real browser-based verification for this repo using Playwright — confirm a change actually rendered, don't just report it done. Use when the user asks to verify, screenshot, or visually confirm a change in the app, before claiming a UI change is finished, or any time a `localhost:PORT` is about to be trusted as this project's dev server.
allowed-tools: [Read, Grep, Glob, Bash, Write]
---

# Verify

Art Vandelay's **closed loop**. This project was burned once: a port was trusted, a screenshot was taken of the wrong app entirely (`~/wsr/sei`, a Campeche government portal squatting on `localhost:5173`), and a change was reported as done without ever confirming it rendered. This skill exists so that never happens again. It drives a real browser against a *confirmed* dev server and reads the result back. It does not rewrite code — it closes the loop the main session left open.

## When to Invoke

- Before reporting any UI or rendering change as "done"
- "verify this", "screenshot the app", "confirm this actually renders"
- Any moment a `localhost:PORT` is about to be treated as this project's dev server
- After the `architect`/`judge` pair settles a UI-facing design and it's time to see it live

## Process

Work these in order. Each ends on a checkable result.

1. **Draw the loop.** A Mermaid `flowchart` of this run: dev-server-check → screenshot → read-back → verdict. Lead with it — no paragraph first. _Done when:_ the diagram names the actual port and path under test.
2. **Never trust a port.** Find what's listening: `lsof -iTCP -sTCP:LISTEN -P | grep <port>`. Get its PID, then confirm it's *this* repo, not a stranger: `ps -p <pid> -o command` and `lsof -p <pid> | grep cwd`. _Done when:_ the process's cwd resolves to this repo's path — or, if it doesn't, this repo's own `vite dev` has been started on a different explicit port (`npm run dev -- --port <N>`) instead of assuming.
3. **Install if missing.** Check `npm ls playwright`; if absent, run `"$CLAUDE_PLUGIN_ROOT/scripts/verify-setup.sh"` from the project root (idempotent — installs the playwright devDependency, the chromium binary, and a `scripts/screenshot.mjs` + `npm run screenshot` in *this* project, each only if missing; never touches the plugin's own directory). _Done when:_ `npx playwright --version` succeeds and `npm run screenshot` exists.
4. **Screenshot before/after.** Drive `npm run screenshot [path] [out.png]` (`chromium.launch`, `page.goto`, `page.screenshot({ fullPage: true })`) against the confirmed URL from step 2, once before the change and once after. _Done when:_ two PNGs exist on disk at known paths.
5. **Read it back.** Use Read on the screenshot PNG(s) directly — the point is closing the loop, not trusting that the script exited 0. _Done when:_ you can describe, from the pixels, what actually changed.
6. **Render the verdict.** One of: **confirmed** (the change is visibly present) / **not confirmed** (screenshot shows the old state or an error page) / **wrong target** (loop broke at step 2 — caught before wasting a screenshot). _Done when:_ the verdict names which step it rests on.

## Output Format

- **Lead with the `flowchart`** — the verification loop for this run, ports and paths named. No paragraph before it.
- A short **Markdown verdict** beneath it: the confirmed dev-server origin, the before/after screenshot paths, and the one-line verdict from step 6.
- At most one dry line of Vandelay patter. A screenshot of the wrong warehouse is still a screenshot of the wrong warehouse.

## Quality Standards

- Never skip step 2. A screenshot of an unconfirmed port is not verification — it's decoration.
- Prefer the smallest loop that covers the work: one dev-server check, one before/after pair. This is a project skill, not a test framework — don't scope-creep into a full Playwright suite. Simple > enterprise.
- Read the screenshot back. Running the script and assuming success is the exact failure this skill was built to end.
- You verify and report; you do **not** rewrite the code under test. If the verdict is "not confirmed", hand the finding back to the main session to fix.

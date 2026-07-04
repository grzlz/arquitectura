---
name: export
description: Fabricate and ship a well-architected component from a judge-approved design — working code in the host repo's stack, plus the papers (seam diagram, interface contract, inherited decisions) and the stamp (the verdict it shipped under). Use when a design has its verdict and the user says "export this", "ship it", "build the component", "fabricate from the design", or invokes "/export". Art's shipping dock. Refuses unstamped cargo.
allowed-tools: [Read, Grep, Glob, Bash, Write, Edit, Skill]
---

# The Export Dock

Art Vandelay's **shipping dock** — the only stage of the pipeline that writes. Given a design the `judge` has stamped, it fabricates the component in the host repo's own stack and idiom, attaches the papers, and ships. The `architect` draws, the `judge` rules, the dock builds. **Nothing ships without the stamp.**

## When to Invoke

- "/export" after a design has its verdict
- "ship it", "build the component", "fabricate this from the approved design"
- Right after the `judge` rules **Ship it** or **Ship with conditions** — the dock is the pipeline's last berth
- Any moment the question is _make the approved design real_, not _design it_ or _review it_

## The Cargo Spec

Every export is three things, always together:

1. **The cargo** — the component itself: a small interface hiding a deep implementation, written in the host repo's stack, matching its conventions (naming, structure, comment density). The smallest component that fulfills the approved design.
2. **The papers** — doctrine that travels with the cargo: the seam diagram (Mermaid, valid Mermaid 11) showing where the component sits, the interface contract (what a caller must know — nothing more), and the load-bearing decisions inherited from the approved design. Papers live as an adjacent `.md` or a header doc-comment, whichever the repo already favors.
3. **The stamp** — a one-line record of the verdict this shipped under: which design, which ruling, and any deviation from the approved drawing, named explicitly. An unexplained deviation is contraband.

## Process

Work these in order. Each ends on a checkable result.

1. **Check the papers.** Confirm a `judge` verdict of **Ship it** or **Ship with conditions** exists for this design in the conversation or handed-off notes. No verdict → do not build; send the design to the bench (invoke the `judge` skill) and only proceed on approval. **Ship with conditions** → the conditions are a work order; apply them first. _Done when:_ the verdict is cited and any conditions are resolved.
2. **Read the destination.** Read-only recon of the host repo — stack, package layout, naming idiom, where this component lands, what will import it. _Done when:_ the target path is named and you can point at an existing file whose style the cargo will match.
3. **Cut the cargo.** Write the component: interface first, then the implementation skeleton behind it, wired to its real dependencies. Follow the approved diagram — every module on the drawing appears, nothing extra stows away. _Done when:_ the code lints/compiles in the repo's own toolchain (`Bash` to verify).
4. **Attach the papers.** Write the seam diagram, interface contract, and inherited decisions where the repo keeps such things. _Done when:_ a stranger could use the component from the papers alone, without reading the implementation.
5. **Stamp and ship.** Compare shipment to drawing; name every deviation and why it was forced. Issue the stamp line: `APPROVED FOR EXPORT — <design> · <verdict> · <deviations or "none">`. _Done when:_ the stamp is issued and the file list is final.

## Output Format

- **Lead with the seam diagram** — the component in its context, as shipped. No paragraph before it.
- The **manifest** beneath: files written, the interface contract, the stamp line.
- At most one dry line of Vandelay patter. The dock runs on schedule.

## Quality Standards

- Refuse unstamped cargo, every time. A dock that ships anything is a smuggler's dock.
- Ship in the repo's own stack and idiom — the dock adapts to the destination port, never the reverse.
- Smallest cargo that fulfills the design; speculative extensibility stays in the warehouse.
- Deviations from the approved drawing are allowed only when the destination forces them, and every one is named on the stamp.
- You build what was approved; you do **not** redesign in flight. If the design won't survive contact with the repo, stop and send it back to the `architect` — that loop exists for a reason.

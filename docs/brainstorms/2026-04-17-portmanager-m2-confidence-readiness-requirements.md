---
date: 2026-04-17
topic: portmanager-m2-confidence-readiness
---

# PortManager Milestone 2 Confidence Readiness Requirements

Status note on `2026-04-17`: requirements baseline is now satisfied in `main`.
The canonical confidence routine and durable history bundle already exist.
This follow-up slice narrows remaining work to one measurable gap: translate repeat-green history into an explicit readiness signal that developers can inspect without interpreting raw artifacts by hand.

## Problem Frame
The `2026-04-17` confidence-routine requirements and plan already closed proof orchestration.
`pnpm milestone:verify:confidence` now composes the standing acceptance gate with the remote-backup replay proof, writes report/history/summary artifacts, and CI persists the history bundle across `push main`, `workflow_dispatch`, and daily `schedule` runs.

That progress changes the remaining gap again.
The branch no longer lacks a routine or a bundle; it lacks an explicit definition of what kind of history actually counts toward Milestone 2 wording changes.
Right now:

- local runs and non-mainline runs can appear in the same history file as mainline confidence runs
- docs say repeated green history is required, but they do not state a measurable threshold
- developers still need to infer progress from artifact contents instead of seeing one summarized readiness state

## Comparison Against Prior Requirements and Plan

| Prior slice | Current evidence | Result | Remaining implication |
| --- | --- | --- | --- |
| `2026-04-17` confidence-routine R3/R4 | `scripts/acceptance/confidence.mjs`, `scripts/acceptance/verify-confidence.mjs`, `.github/workflows/mainline-acceptance.yml` | Canonical routine and CI collection are real | Need a promotion-readiness rule on top of collected history |
| `2026-04-17` confidence-history bundle follow-through | `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, `.portmanager/reports/milestone-confidence-summary.md` | Durable artifact set exists | Bundle still needs explicit qualified-run semantics and threshold math |
| Root + roadmap progress sync | `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, `docs/specs/portmanager-v1-product-spec.md`, `docs-site/data/roadmap.ts` | Repo narrative is aligned on the “repeat green history” story | Docs still need concrete readiness wording so “repeat green history” stops being vague |

## Requirements

**Qualified History Scope**
- R1. Confidence history must distinguish qualified promotion-evidence runs from local or non-mainline runs.
- R2. Qualified runs must stay aligned with the current CI collection boundary: `push`, `workflow_dispatch`, and `schedule` on `refs/heads/main`.

**Readiness Signal**
- R3. The persisted history bundle must compute a promotion-readiness status with explicit thresholds, qualified-run counts, qualified consecutive-pass counts, and remaining gap numbers.
- R4. The latest-run summary must show whether the current run qualifies for readiness advancement.

**Developer Visibility**
- R5. CI must expose the confidence summary directly in the GitHub Actions run page so developers can inspect progress without downloading artifacts first.
- R6. Root docs, milestone docs, product spec, and roadmap progress text must all describe the same readiness rule and the same next lane.

## Success Criteria
- A developer can inspect `.portmanager/reports/milestone-confidence-summary.md` and immediately see whether the branch is `local-only`, `building-history`, or `promotion-ready`.
- A developer can tell which runs count toward readiness and which runs are recorded only for visibility.
- GitHub Actions shows the same readiness summary inline on the workflow run page.
- Progress docs stop using only qualitative “keep it green long enough” wording and instead point at the explicit readiness rule.

## Scope Boundaries
- Do not reopen Milestone 1 parity work.
- Do not add new reliability product behavior.
- Do not treat readiness classification as automatic milestone promotion; human judgment still owns wording changes.
- Do not redefine the lighter PR gate.

## Key Decisions
- Keep qualified readiness history scoped to the same mainline triggers already collecting the heavier confidence routine.
- Use one readiness classification on top of the persisted bundle instead of inventing a second reporting channel.
- Make readiness quantitative enough for developers to act on, but keep final milestone-language changes as a human decision.

## Outstanding Questions

### Resolved During Implementation
- [Affects R2][Technical] Qualified promotion-evidence scope is now locked to `push`, `workflow_dispatch`, and `schedule` on `refs/heads/main`.
- [Affects R3][Technical] Readiness now uses one explicit threshold set: `7` qualified runs plus `3` consecutive qualified passes.
- [Affects R5][Technical] GitHub Actions now publishes the generated confidence summary straight into `$GITHUB_STEP_SUMMARY`.

## Next Steps
- Move to `docs/plans/2026-04-17-portmanager-m2-confidence-readiness-plan.md` for the implementation sequence.

---
date: 2026-04-20
topic: portmanager-m2-confidence-promotion-ready-wording
---

# PortManager Milestone 2 Confidence Promotion-Ready Wording Requirements

Status note on `2026-04-20`: after syncing completed `mainline-acceptance` bundles through run `24647442700/1`, the local readiness truth is now `promotion-ready` with `7/7` qualified runs, `7/3` qualified consecutive passes, and `0` remaining qualified runs.
The tracked public artifact still lagged at `5/7` until an explicit docs refresh.
The remaining work is public wording sync, roadmap status tightening, and review discipline rather than more readiness plumbing.

## Problem Frame
The prior Milestone 2 slices already closed the important machinery gaps:

- one canonical confidence routine exists
- one durable confidence history bundle exists
- one repo-native sync path exists for completed GitHub Actions evidence
- one repo-native review digest exists for local-versus-published comparison
- one public development-progress page already exists on the docs site

The new evidence changes the lane again.
PortManager is no longer waiting for the last countdown leg.
It is now at the point where milestone-language review is allowed, the tracked public confidence artifact must be refreshed deliberately, and the durable docs stack must stop repeating the earlier `building-history` countdown.

## Comparison Against Prior Requirements And Plan

| Prior slice | Current evidence after latest sync | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence routine | `pnpm milestone:verify:confidence`, `mainline-acceptance` run `24647442700/1` | Closed | Keep it green; do not redesign it |
| Confidence history sync | `pnpm milestone:sync:confidence-history -- --limit 20` imported 7 qualified runs | Closed | Use synced evidence as the only countdown truth |
| Confidence review digest | `pnpm milestone:review:confidence` reports `promotion-ready` and published countdown drift before refresh | Closed | Refresh the tracked public artifact deliberately and then verify alignment |
| Confidence progress page | `docs-site/data/milestone-confidence-progress.ts`, `/en/roadmap/development-progress`, `/zh/roadmap/development-progress` | Open for refresh | Republish the tracked artifact from the synced local state |
| Countdown wording sync | Root docs, specs, roadmap data, verification report still say `5/7` and `building-history` | Open | Promote durable wording to `promotion-ready` with exact latest-run evidence |

## Requirements

**Promotion-Ready Truth**
- R1. Root docs, interface docs, product spec, milestone spec, verification report, and roadmap data must state the current synced readiness truth as `promotion-ready` with `7/7` qualified runs, `7/3` qualified consecutive passes, and `0` remaining qualified runs.
- R2. The same docs must explicitly state that the promotion thresholds are now met and that milestone-language narrowing is allowed through deliberate human review rather than blocked by missing evidence.
- R3. The repo must land one new current-direction requirements document and one matching implementation plan that explain the transition from countdown governance to promotion-ready wording review.

**Public Progress Publication**
- R4. The tracked public artifact `docs-site/data/milestone-confidence-progress.ts` must be refreshed from the synced local history through the explicit refresh command, not by a normal docs build.
- R5. Roadmap home and the public development-progress page must visibly expose the new `promotion-ready` state, the latest qualified mainline run `24647442700/1`, and the fact that the remaining work is wording review plus green-history maintenance.
- R6. The verification report must record that the review digest caught countdown drift before the refresh and that the deliberate refresh republished the tracked public artifact to the new synced state.

**Direction Discipline**
- R7. Current-direction copy must make clear that the next lane is not more confidence infrastructure and not a return to countdown accumulation; it is promotion-ready wording sync plus sustained gate health.
- R8. Roadmap and developer-focus copy must keep Unit 0 and the canonical confidence routine green while human milestone-language review narrows the public wording on the same accepted live slice.

## Success Criteria
- A developer can read the root docs or the public roadmap surfaces and see the same current truth: `promotion-ready`, thresholds met, latest qualified run `24647442700/1`, and deliberate wording review now allowed.
- The public development-progress page, the tracked docs artifact, and the local review digest can be compared without any countdown mismatch remaining after refresh.
- The repo has a durable current-direction doc pair that explains why the remaining lane is promotion-ready wording sync rather than more reporting or more readiness math.

## Scope Boundaries
- Do not change the readiness thresholds.
- Do not invent a second readiness calculator, a second progress page, or a new CI workflow.
- Do not reopen Milestone 1 parity work.
- Do not claim Toward C is active just because the Milestone 2 promotion threshold is now met.

## Key Decisions
- Treat the synced local history bundle as the readiness truth source.
- Use `pnpm milestone:review:confidence` to confirm publication drift before refreshing the tracked docs artifact.
- Narrow public milestone wording to `promotion-ready`, not to a broader post-Milestone-2 narrative.

## Dependencies / Assumptions
- Authenticated `gh` access with `repo` scope remains available for `pnpm milestone:sync:confidence-history`.
- The accepted live slice, Unit 0 gate, and canonical confidence routine remain green while wording is updated.

## Next Steps
- Move to `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md` for the implementation sequence.

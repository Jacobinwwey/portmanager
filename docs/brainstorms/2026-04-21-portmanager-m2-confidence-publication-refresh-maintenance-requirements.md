---
date: 2026-04-21
topic: portmanager-m2-confidence-publication-refresh-maintenance
---

# PortManager Milestone 2 Confidence Publication Refresh And Maintenance Requirements

Status note on `2026-04-21`: the repo already closed review-pack publication, current-run review-pack fetch, synced local promotion review, wording-review guardrails, and the public development-progress page. Current controller/CLI/web/agent architecture remains on the accepted live host / rule / policy slice. The remaining gap is no longer review access or readiness math. The remaining gap is keeping the tracked public confidence snapshot and the surrounding progress docs deliberately refreshed to the latest reviewed evidence after completed mainline runs keep accumulating.

## Problem Frame
PortManager now has three trustworthy review surfaces:

- synced local review through `pnpm milestone:review:promotion-ready -- --limit 20`
- current-run CI review through `pnpm milestone:fetch:review-pack`
- public developer visibility through `docs-site/data/milestone-confidence-progress.ts` plus `/roadmap/development-progress`

The active drift moved again after those slices shipped:

- latest synced local history already advanced beyond the tracked public confidence artifact
- roadmap/progress prose still points to the fetch-helper slice as if review access were the main remaining problem
- architecture progress is now mostly stable: Milestone 1 is accepted, Milestone 2 confidence thresholds are already `promotion-ready`, and Toward C is still intentionally deferred

So current work should stop behaving like another helper-feature build.
It should behave like a deliberate publication-refresh and maintenance pass:

- republish the tracked confidence artifact from the latest reviewed evidence
- retarget progress docs to the maintenance lane
- make current architecture posture explicit for developers

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence review-pack fetch | `pnpm milestone:fetch:review-pack` stages current-run review files plus `review-pack-manifest.json` under `.portmanager/reports/current-ci-review-pack/` | Closed for CI-first access | Review-pack access is no longer the main gap |
| Promotion review helper | `pnpm milestone:review:promotion-ready` writes the digest, wording checklist, claim posture, and refresh-required status | Closed for synced local review | The main gap moved from helper behavior to deliberate publication refresh cadence |
| Public development-progress page | `docs-site/data/milestone-confidence-progress.ts` feeds roadmap home plus `/roadmap/development-progress` | Closed for public visibility | The tracked artifact still needs explicit refresh when synced local evidence moves ahead |
| Milestone architecture progression | Milestone 1 public slice is accepted; Milestone 2 confidence thresholds are met on the same live host / rule / policy slice; Toward C remains deferred | Closed for current architecture choice | Remaining work is maintenance and wording discipline, not new control-plane breadth |

## Requirements

**Tracked Public Snapshot Refresh**
- R1. The repo must deliberately refresh `docs-site/data/milestone-confidence-progress.ts` from the latest reviewed local confidence history when the helper reports publication drift and review agrees that the public snapshot should advance.
- R2. The refreshed public snapshot must carry the latest reviewed readiness counters, latest qualified run, and visibility breakdown without changing readiness math or helper semantics.

**Progress-Doc Retargeting**
- R3. `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, and `docs/operations/portmanager-real-machine-verification-report.md` must stop framing review-pack access as the main remaining gap and instead describe the next lane as promotion-ready publication refresh plus maintenance on the same accepted live slice.
- R4. Those progress docs must freeze the current architecture assessment clearly: Milestone 1 accepted, Milestone 2 promotion-ready thresholds met, Toward C still deferred, and remaining work narrowed to review discipline plus gate health.
- R5. The verification report must freeze the latest reviewed evidence bundle, including the refreshed published counters, the latest qualified mainline run, and the publication-maintenance posture.

**Roadmap And Developer-Progress Guidance**
- R6. Roadmap/home/development-progress surfaces must retarget current-direction links to one new requirements/plan pair for this publication-refresh-and-maintenance slice.
- R7. Developer guidance on those pages must explicitly treat `pnpm milestone:review:promotion-ready -- --limit 20` and `pnpm milestone:fetch:review-pack` as closed review entrypoints, with refresh only when helper posture requires it.
- R8. Those pages must describe the active lane as maintenance of the published progress surface and wording review, not another architecture-expansion milestone.

**Verification Coverage**
- R9. Docs regression coverage must lock the new requirements/plan links and the refreshed maintenance-lane guidance on the development-progress surface.
- R10. Verification must replay the local acceptance gate, refresh the tracked public artifact, rebuild docs, and keep the repo worktree clean after landing the refreshed progress docs.

## Success Criteria
- The tracked public confidence artifact now matches the latest reviewed local evidence instead of lagging behind it.
- The live roadmap and development-progress pages describe the current posture as promotion-ready maintenance on the accepted live slice, not as an unfinished helper-access story.
- Root docs, roadmap docs, and the verification report all agree on the same next direction: deliberate wording review, explicit refresh discipline, sustained gate health, and no premature Toward C broadening.

## Scope Boundaries
- Do not change controller, CLI, web, or agent runtime behavior.
- Do not change readiness thresholds, qualified-event rules, or review-digest semantics.
- Do not expand Toward C scope or introduce new distributed-platform work.
- Do not add a new review command when the existing helper pair already covers synced-local and current-run review.

## Key Decisions
- Treat the remaining gap as publication freshness plus maintenance, not as another feature-delivery slice.
- Keep exact live counters on the tracked confidence artifact and development-progress page rather than brittle root-doc prose.
- Keep human wording review deliberate even though promotion-ready thresholds are already met.
- Keep the same accepted live host / rule / policy slice as the evidence model for all remaining Milestone 2 work.

## Dependencies / Assumptions
- `.portmanager/reports/milestone-confidence-history.json` already contains the latest synced qualified history to publish.
- `pnpm milestone:review:promotion-ready` remains the single helper allowed to refresh the tracked public artifact.
- `docs-site/data/milestone-confidence-progress.ts` stays a tracked publication artifact rather than a machine-local cache.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-plan.md` for the implementation sequence.

---
date: 2026-04-21
topic: portmanager-m2-confidence-review-pack-ci
---

# PortManager Milestone 2 Confidence Review Pack CI Requirements

Status note on `2026-04-21`: the repo already has one canonical confidence routine, one synced/local review digest, one wording-review checklist, and one source-surface-status matrix. That closes the review model for local developers. It does not yet close review-pack durability for the current CI run, because `mainline-acceptance` only uploads the confidence history bundle while the promotion-review helper still assumes a remote history sync before it can emit the same review pack.

## Problem Frame
Developers can already reproduce the review pack locally.
They still lose one useful proof surface in CI:

- `mainline-acceptance` uploads `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, and `.portmanager/reports/milestone-confidence-summary.md`, but not the review digest or wording-review checklist
- `pnpm milestone:review:promotion-ready -- --limit 20` always syncs completed workflow history, so the current CI run cannot reuse the just-written local confidence artifacts without reaching back to older completed runs
- roadmap/dev-progress copy still treats the review pack as local-only, even though developers already inspect uploaded workflow bundles during promotion-ready review

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Canonical confidence routine | `pnpm milestone:verify:confidence` writes the confidence report/history/summary bundle and CI uploads that bundle | Closed | Current-run review digest + wording checklist still missing from the uploaded pack |
| Promotion-review helper | `pnpm milestone:review:promotion-ready` composes sync, review digest, and wording checklist | Closed for local review | Helper cannot reuse current local artifacts without remote sync |
| Source-surface status slice | `.portmanager/reports/milestone-wording-review.md` now exposes `Public claim class` and `Source surface status` | Closed | CI does not preserve that checklist for the current run |
| Developer review docs | Roadmap/home/dev-progress direct reviewers to the helper and local reports | Partially closed | Docs should name the uploaded CI review pack as another durable review surface |

## Requirements

**Helper Behavior**
- R1. `pnpm milestone:review:promotion-ready` must support a local-artifact mode that skips remote history sync and reuses the just-written local confidence files.
- R2. That mode must still run the same confidence review and wording-review writers, not a separate helper or digest path.

**CI Review Pack**
- R3. `mainline-acceptance` confidence job must build the promotion-review pack from current-run local artifacts after `pnpm milestone:verify:confidence` succeeds.
- R4. The uploaded `milestone-confidence-bundle-*` artifact must include `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` alongside the existing confidence report/history/summary files.
- R5. The same job must append the current-run confidence review digest and wording-review checklist to the GitHub Actions job summary when those files exist.

**Docs And Guidance**
- R6. `README.md`, `TODO.md`, `Interface Document.md`, roadmap data, and the real-machine verification report must describe the review pack as both a local helper output and a current-run CI bundle artifact.
- R7. Development-progress and roadmap current-direction links must point to one new requirements/plan pair for this CI review-pack slice.

**Verification Coverage**
- R8. Promotion-review helper tests must lock the new sync-skipping mode.
- R9. Docs or workflow regression coverage must lock the workflow command and uploaded review-pack paths.

## Success Criteria
- Developers can inspect the current CI run's confidence review digest and wording-review checklist directly from the uploaded bundle or job summary, not only by rerunning the helper locally.
- The promotion-review helper still owns one review model, but it can now consume current local artifacts when remote sync would be stale or unnecessary.
- Roadmap/development-progress guidance names both the uploaded CI review pack and the local helper without introducing a new public page or a second review helper.

## Scope Boundaries
- Do not add a new public review page.
- Do not fork readiness math, review digest logic, or wording-review logic.
- Do not auto-refresh the tracked public confidence artifact from CI review-pack publication alone.
- Do not replace the local helper flow; make the CI pack additive.

## Key Decisions
- Treat current-run CI review-pack visibility as a helper-input problem, not a new review command.
- Reuse the existing local confidence history/report files written by `pnpm milestone:verify:confidence`.
- Keep publication refresh manual and explicit even when CI can now publish the review pack.

## Dependencies / Assumptions
- `pnpm milestone:verify:confidence` continues to write the current-run confidence report/history/summary before the CI review-pack step.
- `mainline-acceptance` continues to upload a `milestone-confidence-bundle-*` artifact.
- The local helper remains the default path for deliberate wording changes before docs publication.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-ci-plan.md` for the implementation sequence.

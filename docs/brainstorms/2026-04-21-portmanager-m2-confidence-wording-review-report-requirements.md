---
date: 2026-04-21
topic: portmanager-m2-confidence-wording-review-report
---

# PortManager Milestone 2 Confidence Wording Review Report Requirements

Status note on `2026-04-21`: `pnpm milestone:review:promotion-ready -- --limit 20` now already owns the default Milestone 2 developer-review entrypoint, but developers still have to reconstruct the wording-review posture by hand from the synced summary, the review digest, the verification report, and the public development-progress page.
The new gap is not missing confidence math.
The new gap is missing repo-native review packaging for human wording decisions.

## Problem Frame
Prior slices already established:

- one canonical confidence routine
- one synced confidence-history import path
- one repo-native review digest that compares synced local truth with the tracked public artifact
- one helper that composes sync, digest generation, and optional publication refresh
- one public development-progress page plus roadmap-home preview for developer review

That closes the machine side of the lane.
It does not yet close the human review side.
The helper can tell developers whether the countdown is aligned, but it does not yet hand them one durable checklist that:

- freezes the latest readiness gate at review time
- shows whether public wording moves are currently allowed
- lists the exact surfaces that must be checked before milestone wording changes
- prevents overclaiming Milestone 2 completion or accidental Toward C activation

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence review digest | `.portmanager/reports/milestone-confidence-review.md` already records countdown alignment and drift kind | Closed | Reuse digest truth instead of inventing a second readiness model |
| Promotion review helper | `pnpm milestone:review:promotion-ready -- --limit 20` already syncs history, writes digest, and optionally refreshes publication | Closed in code | Extend the helper with one wording-review artifact instead of another command |
| Promotion-ready wording docs | Root docs and roadmap already say the lane is deliberate wording review plus gate health | Partially closed | Public docs still need one concrete artifact and one current-direction doc pair for that review lane |
| Public developer-progress page | `/en/roadmap/development-progress` and `/zh/roadmap/development-progress` already show the live confidence state | Closed in surface | The page still needs to mention the wording-review checklist artifact and point at the latest doc pair |

## Requirements

**Helper Artifact**
- R1. `pnpm milestone:review:promotion-ready -- --limit 20` must write a repo-native wording-review checklist by default at `.portmanager/reports/milestone-wording-review.md`.
- R2. That checklist must freeze the current readiness gate, latest qualified run, latest qualified SHA, publication-alignment state, and a boolean `Wording review allowed` conclusion derived from promotion readiness plus published-countdown alignment.
- R3. The same checklist must list the human review guardrails: keep Milestone 1 accepted, keep Milestone 2 wording conservative, avoid claiming automatic completion, avoid claiming Toward C activation, and revisit both the helper and the standing acceptance gate before merging wording changes.
- R4. The helper must also support an explicit `--wording-review-path` override and a `--skip-wording-review` escape hatch for dry review runs or tests.

**Current-Direction Documentation**
- R5. The repo must land one new current-direction requirements document and one matching implementation plan that explain the wording-review artifact and compare it against the prior helper/digest slices.
- R6. `README.md`, `TODO.md`, `Interface Document.md`, and `docs/operations/portmanager-real-machine-verification-report.md` must describe the wording-review checklist as part of the default promotion-ready review pack.
- R7. The public development-progress page and roadmap home must expose the wording-review artifact path and point developers at the new current-direction doc pair instead of the older helper-only docs.

**Verification Coverage**
- R8. Promotion-review helper tests must guard wording-review artifact creation, skip behavior, and render output.
- R9. Docs regression coverage must guard the new current-direction links plus the public mention of `.portmanager/reports/milestone-wording-review.md`.

## Success Criteria
- A developer can run one helper command and receive both `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md`.
- A developer can open root docs, roadmap home, or the public development-progress page and see that the active lane now uses the wording-review checklist plus the existing digest and verification report.
- The repo has one additive current-direction doc pair for this slice, and tests keep public links from drifting back to stale helper-only docs.

## Scope Boundaries
- Do not change readiness thresholds or the meaning of `promotion-ready`.
- Do not make normal docs generation republish the tracked confidence artifact.
- Do not add a second public progress page, a second digest format, or a second publication workflow.
- Do not claim Milestone 2 completion or Toward C activation from confidence evidence alone.

## Key Decisions
- Package human review around the existing helper instead of asking developers to memorize a manual checklist.
- Keep the wording-review artifact ignored under `.portmanager/` so the helper can write fresh local review state without polluting tracked source control.
- Treat the wording-review report as additive guidance layered on top of the existing digest, verification report, and public progress page.

## Dependencies / Assumptions
- `pnpm milestone:review:promotion-ready` remains the supported default review entrypoint on `main`.
- `.portmanager/reports/milestone-confidence-review.md` continues to provide the alignment truth that the wording-review checklist summarizes.
- The docs site keeps using the same roadmap and development-progress components for public developer review.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md` for the implementation sequence.

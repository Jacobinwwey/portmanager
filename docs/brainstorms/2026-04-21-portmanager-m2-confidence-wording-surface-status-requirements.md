---
date: 2026-04-21
topic: portmanager-m2-confidence-wording-surface-status
---

# PortManager Milestone 2 Confidence Wording Surface Status Requirements

Status note on `2026-04-21`: the repo already has one promotion-review helper, one confidence digest, one wording-review checklist, and one explicit claim posture. That closes claim ambiguity at the digest level. It does not yet close claim ownership across review surfaces, because root docs and roadmap prose can still carry stale exact counters while the helper only lists source surfaces without classifying what each surface is allowed to say.

## Problem Frame
The current helper tells developers whether public wording is reviewable.
It does not yet tell developers where exact counters belong, where only threshold-level wording belongs, and where a refresh-required posture must remain explicit.

That leaves one remaining source-of-truth gap:

- root docs can still freeze older latest-qualified runs or published counters even though the publication rule says exact live counters belong on the tracked confidence artifact and development-progress page
- the wording-review checklist still names source surfaces as a flat checklist, so developers must infer which surfaces own exact counters, which surfaces only carry helper guidance, and which surfaces are allowed to freeze a reviewed evidence snapshot
- roadmap home and development-progress copy still call out `Public claim class`, but they do not yet tell developers to inspect per-surface claim ownership before narrowing milestone wording

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Claim posture digest | `pnpm milestone:review:confidence` now exposes `Public claim class`, `Local evidence claim`, `Public wording claim`, and `Required next action` | Closed | Developers still need per-surface ownership guidance |
| Wording-review checklist | `.portmanager/reports/milestone-wording-review.md` now freezes guardrails and source surfaces | Partially closed | Source surfaces are still a flat list instead of a classified review matrix |
| Publication rule | Exact live counters already belong to `docs-site/data/milestone-confidence-progress.ts` and `/roadmap/development-progress` | Closed as contract | Root docs and roadmap prose still need enforcement against stale hard-coded counters |
| Public developer review copy | Roadmap home and development-progress page already expose claim posture and helper flow | Partially closed | Public copy still needs to tell developers to inspect source-surface status explicitly |

## Requirements

**Helper Output**
- R1. `.portmanager/reports/milestone-wording-review.md` must add one `Source Surface Status` section that classifies every reviewed surface with at least `Surface`, `Claim status`, and `Review instruction`.
- R2. That section must explicitly classify `docs-site/data/milestone-confidence-progress.ts` as the tracked counter source when countdown alignment holds.
- R3. When synced local promotion-ready evidence is ahead of the tracked public artifact, the same section must mark `docs-site/data/milestone-confidence-progress.ts` as refresh-required instead of pretending root docs may cite newer counters.
- R4. `README.md` and the milestone spec surfaces must be classified as wording-only surfaces whose exact counters stay on the development-progress page plus the tracked confidence artifact.

**Docs Ownership**
- R5. `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, and `docs-site/data/roadmap.ts` must stop hard-coding the latest qualified run or published qualified-run count in prose.
- R6. Those same docs must instead point developers to the development-progress page plus the tracked confidence artifact for exact counters, while keeping helper guidance and threshold-level conclusions stable.
- R7. The real-machine verification report may continue freezing reviewed evidence, but it must describe the new source-surface-status table as part of the helper pack.

**Public Developer Review Copy**
- R8. The development-progress page and roadmap home must tell developers to inspect both `Public claim class` and `Source surface status` inside `.portmanager/reports/milestone-wording-review.md`.
- R9. Current-direction links on those pages must point to one new requirements/plan pair for this source-surface-status slice.

**Verification Coverage**
- R10. Promotion-review helper tests must lock the new surface-status table for aligned and refresh-required promotion-ready states.
- R11. Docs regression tests must lock the new current-direction docs, the public mention of `Source surface status`, and the absence of hard-coded latest-qualified prose on the reviewed root surfaces.

## Success Criteria
- A developer can open `.portmanager/reports/milestone-wording-review.md` and see, surface by surface, where exact counters belong and where only wording guidance belongs.
- Root docs and roadmap prose stop drifting to stale latest-qualified runs while the tracked confidence artifact keeps exact counters authoritative.
- Public roadmap/development-progress copy now tells developers to inspect `Source surface status` before changing milestone wording.

## Scope Boundaries
- Do not add another helper, another public page, or another publication path.
- Do not move exact counters out of `docs-site/data/milestone-confidence-progress.ts` and the development-progress page.
- Do not treat source-surface status as permission to claim Milestone 2 complete or Toward C active.
- Do not rewrite readiness math, thresholds, or sync flow.

## Key Decisions
- Keep one promotion-review helper and enrich its output rather than inventing another review artifact.
- Treat exact-counter ownership as a surface-classification problem, not a new counter source.
- Keep verification reports as reviewed evidence surfaces while root docs and roadmap prose stay threshold-level and helper-first.

## Dependencies / Assumptions
- `pnpm milestone:review:promotion-ready -- --limit 20` remains the default review entrypoint on `main`.
- `docs-site/data/milestone-confidence-progress.ts` remains the only tracked source for published exact counters.
- The development-progress page remains the public page that exposes exact tracked counters.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md` for the implementation sequence.

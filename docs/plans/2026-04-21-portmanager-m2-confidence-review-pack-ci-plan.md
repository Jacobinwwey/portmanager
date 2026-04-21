---
title: PortManager Milestone 2 Confidence Review Pack CI Plan
type: docs-hardening
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-ci-requirements.md
---

# PortManager Milestone 2 Confidence Review Pack CI Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped source-surface-status slice.
Its job is not to change readiness math, artifact-refresh rules, or the public docs surface.
Its job is to make the same promotion-review pack durable for the current CI run and visible to developers without forcing a remote sync against older completed workflow runs.

## Problem Frame
The helper already owns the review model.
The remaining drift now lives in review-pack durability:

- `mainline-acceptance` uploads the confidence bundle but not the review digest or wording-review checklist
- the promotion-review helper always syncs remote history even when the current local run already wrote the needed artifacts
- roadmap/dev-progress copy still frames the review pack as local-only instead of a local-plus-CI review surface

## Requirements Trace
- R1-R2. Add local-artifact `skip sync` support to the promotion-review helper.
- R3-R5. Generate and upload the current-run review pack from `mainline-acceptance`.
- R6-R9. Update docs guidance and regression coverage around the new CI review-pack surface.

## Key Technical Decisions
- Add a single `--skip-sync` flag to `review-promotion-ready.mjs` rather than introducing a CI-only helper.
- Build the current-run review pack after `pnpm milestone:verify:confidence` succeeds, because that step already writes the local confidence history/report/summary inputs.
- Keep the uploaded review pack inside the existing `milestone-confidence-bundle-*` artifact instead of inventing another artifact family.

## Implementation Units

- [x] **Unit 35: Add Local-Artifact Review Mode**

**Goal:** Let the promotion-review helper reuse current local confidence artifacts when remote sync is stale or unnecessary.

**Files:**
- Modify: `scripts/acceptance/review-promotion-ready.mjs`
- Modify: `tests/milestone/reliability-confidence-promotion-ready.test.ts`

**Approach:**
- Add `--skip-sync` parsing and propagate it through `reviewPromotionReady`.
- Skip `syncConfidenceHistory` only when the flag is set; keep the rest of the review path unchanged.
- Surface the sync mode in rendered helper output so CI logs stay readable.

- [x] **Unit 36: Publish Current-Run Review Pack In CI**

**Goal:** Preserve the same confidence review digest and wording-review checklist in `mainline-acceptance`.

**Files:**
- Modify: `.github/workflows/mainline-acceptance.yml`
- Add: `tests/docs/mainline-acceptance-workflow.test.mjs`

**Approach:**
- Run `pnpm milestone:review:promotion-ready -- --skip-sync` after `pnpm milestone:verify:confidence` succeeds.
- Append `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` to the job summary when present.
- Upload both files inside the existing `milestone-confidence-bundle-*` artifact.

- [x] **Unit 37: Retarget Docs To Local-Plus-CI Review Pack**

**Goal:** Tell developers that the review pack now exists in both the local helper flow and the current-run CI bundle.

**Files:**
- Add: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-ci-requirements.md`
- Add: `docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-ci-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`
- Modify: `tests/docs/interface-document.test.mjs`

**Approach:**
- Update current-direction links to the new requirements/plan pair.
- Change developer guidance from `local-only review pack` to `local helper plus uploaded current-run review pack`.
- Keep exact-counter ownership unchanged: counters remain on the development-progress page plus tracked confidence artifact.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/docs/mainline-acceptance-workflow.test.mjs tests/docs/development-progress.test.mjs tests/docs/interface-document.test.mjs`
- `pnpm exec node --experimental-strip-types --test tests/docs/*.test.mjs tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| CI review pack accidentally syncs stale remote history | Add `--skip-sync` and use it only after the current confidence routine has written local artifacts |
| Developers misread CI review-pack publication as auto-refresh permission | Keep `--refresh-published-artifact` explicit in helper/docs wording |
| Docs drift between local and CI review surfaces | Update roadmap/home/dev-progress copy plus root docs to name both surfaces in one lane |

---
title: PortManager Milestone 2 Confidence Wording Surface Status Plan
type: docs-hardening
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md
---

# PortManager Milestone 2 Confidence Wording Surface Status Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped claim-matrix slice.
Its job is not to change readiness math, qualification scope, or helper entrypoints.
Its job is to classify wording surfaces so exact counters stop leaking into root prose while the helper pack tells developers which surface owns which claim.

## Problem Frame
The helper already exposes explicit claim posture.
The remaining drift now lives in source-surface ownership:

- root docs can still freeze stale latest-qualified runs
- the wording checklist still treats source surfaces as one flat list
- public developer-review copy still points to the helper pack without naming `Source surface status`

## Requirements Trace
- R1-R4. Add source-surface status classification to the wording-review artifact.
- R5-R7. Retarget root docs and roadmap prose so exact counters stay on tracked public surfaces.
- R8-R11. Update current-direction copy and docs tests to lock the new review guidance.

## Key Technical Decisions
- Keep the source-surface matrix inside `review-promotion-ready.mjs`, reusing the existing claim posture rather than creating another digest.
- Treat `docs-site/data/milestone-confidence-progress.ts` as the tracked counter source and classify it as refresh-required whenever countdown alignment is false.
- Keep root docs and roadmap prose threshold-level and helper-first; exact counters remain on the tracked artifact plus development-progress page, while the verification report may still freeze reviewed evidence.

## Implementation Units

- [x] **Unit 33: Add Source-Surface Status To Promotion Review**

**Goal:** Classify wording surfaces so helper output tells developers where exact counters and wording guidance belong.

**Files:**
- Modify: `scripts/acceptance/review-promotion-ready.mjs`
- Modify: `tests/milestone/reliability-confidence-promotion-ready.test.ts`

**Approach:**
- Replace the flat source-surface list with classified surface metadata.
- Render one `Source Surface Status` table with `Surface`, `Claim status`, and `Review instruction`.
- Mark the tracked confidence artifact as refresh-required whenever countdown drift remains open.

- [x] **Unit 34: Retarget Docs To Surface Ownership**

**Goal:** Make reviewed docs and public developer-review copy follow the new source-surface ownership model.

**Files:**
- Add: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md`
- Add: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`
- Add: `tests/docs/root-progress-ownership.test.mjs`

**Approach:**
- Replace hard-coded latest-qualified prose in reviewed root surfaces with stable helper-first wording that points to the development-progress page plus tracked confidence artifact.
- Update current-direction links to the new requirements/plan pair.
- Make roadmap home and development-progress copy tell developers to inspect `Source surface status` in the helper output.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/root-progress-ownership.test.mjs`
- `pnpm exec node --experimental-strip-types --test tests/docs/*.test.mjs tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Surface-status wording drifts from claim posture | Build the table from the same review object used for claim posture |
| Root docs reintroduce stale exact counters later | Add docs regression coverage that rejects hard-coded latest-qualified prose |
| Developers still miss the new matrix | Update roadmap home and development-progress copy to name `Source surface status` explicitly |

---
title: PortManager Milestone 2 Confidence Promotion-Ready Wording Plan
type: docs-hardening
status: completed
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md
---

# PortManager Milestone 2 Confidence Promotion-Ready Wording Plan

Updated: 2026-04-20
Version: v0.1.0

## Overview
This plan starts after the completed countdown-sync and review-digest slices.
Its job is not to add new confidence machinery.
Its job is to refresh the tracked public artifact and reconcile repo/docs wording around the new synced truth: `promotion-ready`, `7/7` qualified runs, `7/3` qualified consecutive passes, and `0` remaining qualified runs.

## Problem Frame
The repo no longer lacks milestone-confidence plumbing and no longer lacks enough qualified history.
After syncing run `24647442700/1`, the countdown gate is closed.
The current gap is promotion-ready publication drift:

- the tracked public confidence artifact still says `5/7`
- durable docs still narrate `building-history`
- roadmap/home/development-progress surfaces still frame the lane as “final two runs remain”

The implementation goal is therefore promotion-ready wording sync, not more evidence scaffolding.

## Requirements Trace
- R1-R3. Reconcile root/spec/interface/verification docs and add a new direction-doc pair for the promotion-ready lane.
- R4-R6. Refresh the tracked public artifact deliberately, surface the promotion-ready state on roadmap/development-progress, and record the digest-driven refresh in the verification report.
- R7-R8. Keep the remaining direction locked to wording review plus sustained gate health.

## Key Technical Decisions
- Use `pnpm milestone:sync:confidence-history -- --limit 20` plus `pnpm milestone:review:confidence` to freeze the synced truth before refreshing the tracked docs artifact.
- Refresh `docs-site/data/milestone-confidence-progress.ts` only through `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`.
- Promote roadmap/development-progress copy through the existing components and roadmap data instead of adding a new page class.

## Implementation Units

- [x] **Unit 24: Freeze Promotion-Ready Evidence And Refresh Public Artifact**

**Goal:** Move the tracked public progress artifact to the latest synced promotion-ready state.

**Files:**
- Refresh source: `.portmanager/reports/milestone-confidence-history.json`
- Refresh source: `.portmanager/reports/milestone-confidence-summary.md`
- Refresh source: `.portmanager/reports/milestone-confidence-review.md`
- Refresh: `docs-site/data/milestone-confidence-progress.ts`

**Approach:**
- Sync completed `mainline-acceptance` history into local review.
- Run the repo-native review digest to confirm the published countdown is behind.
- Refresh the tracked docs artifact explicitly from the synced local history.
- Re-run the strict review digest to prove the published artifact now matches the synced countdown.

- [x] **Unit 25: Reconcile Durable Docs And Land Promotion-Ready Direction Artifacts**

**Goal:** Bring repo docs and direction docs to the latest promotion-ready state.

**Files:**
- Add: `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md`
- Add: `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`

**Approach:**
- Replace earlier `5/7` countdown language in durable progress docs with the new `promotion-ready` truth where appropriate.
- Mark the prior “keep history green until promotion-ready” checkpoint as reached.
- Extend the current-direction doc chain rather than overwriting earlier slice documents.

- [x] **Unit 26: Promote Roadmap And Developer Progress Wording**

**Goal:** Make the public roadmap and development-progress pages reflect promotion-ready status instead of countdown-open status.

**Files:**
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `docs-site/data/roadmap.ts`
- Regenerate: `docs-site/en/roadmap/milestones.md`
- Regenerate: `docs-site/zh/roadmap/milestones.md`
- Regenerate: `docs-site/en/overview/product-spec.md`
- Regenerate: `docs-site/zh/overview/product-spec.md`
- Regenerate: `docs-site/en/operations/real-machine-verification-report.md`
- Regenerate: `docs-site/zh/operations/real-machine-verification-report.md`

**Approach:**
- Keep using the same live progress artifact for roadmap-home counters.
- Change developer-review guidance from “wait for two more runs” to “refresh public wording deliberately and keep the routine green.”
- Promote Milestone 2 card status from open countdown wording to promotion-ready wording without claiming Toward C has started.

## Verification Strategy
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm milestone:review:confidence`
- `pnpm milestone:review:confidence -- --require-published-countdown-match`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review.test.ts tests/docs/development-progress.test.mjs tests/docs/extract-locales.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Public artifact stays behind local synced truth again | Refresh the tracked progress artifact explicitly and prove countdown alignment with strict review mode |
| Promotion-ready wording gets mistaken for Toward C activation | Keep wording narrowly tied to Milestone 2 promotion thresholds and the accepted live slice |
| Durable docs lose continuity with earlier slices | Add a new promotion-ready requirements+plan pair instead of rewriting older slice documents |

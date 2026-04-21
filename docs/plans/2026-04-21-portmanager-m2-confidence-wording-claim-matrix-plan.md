---
title: PortManager Milestone 2 Confidence Wording Claim Matrix Plan
type: docs-hardening
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md
---

# PortManager Milestone 2 Confidence Wording Claim Matrix Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped wording-review-report slice.
Its job is not to change readiness math, qualification scope, or publication rules.
Its job is to make milestone-language posture explicit when local synced evidence outruns the tracked public artifact.

## Problem Frame
The helper already syncs history, writes the confidence digest, and emits the wording-review checklist.
The public docs already show the published confidence snapshot.
The remaining gap is claim ambiguity:

- developers still infer safe wording from counters and drift kinds
- the digest can sound permissive even when countdown drift should block public wording changes
- roadmap and developer-progress docs still point at the helper pack without telling developers which claim posture to look for

## Requirements Trace
- R1-R3. Add explicit claim posture to the confidence digest.
- R4-R6. Add claim-matrix output to the wording-review artifact while keeping the same helper/publication path.
- R7-R10. Retarget current-direction docs and public developer-review copy, then lock them down in tests.

## Key Technical Decisions
- Centralize claim posture in the confidence-review layer, then reuse it in the promotion-review helper so the digest and checklist cannot drift.
- Keep `promotion-ready-refresh-required` as the explicit public-wording blocker when local promotion-ready evidence is ahead of the tracked public artifact.
- Update roadmap/development-progress guidance by copy changes and current-direction links rather than adding new generated data fields.

## Implementation Units

- [x] **Unit 31: Add Shared Claim Posture To Confidence Review**

**Goal:** Make the confidence digest publish explicit claim posture instead of only generic recommendation text.

**Files:**
- Modify: `scripts/acceptance/review-confidence.mjs`
- Modify: `tests/milestone/reliability-confidence-review.test.ts`

**Approach:**
- Add one shared claim-posture builder on top of the existing review result.
- Emit `Public claim class`, `Human wording review allowed`, `Local evidence claim`, `Public wording claim`, and `Next required action` into the digest.
- Guard the promotion-ready countdown-drift case so refresh is required before public wording narrows.

- [x] **Unit 32: Reuse Claim Posture In Wording Review And Docs**

**Goal:** Make the wording-review checklist and public developer-review docs speak the same claim language.

**Files:**
- Modify: `scripts/acceptance/review-promotion-ready.mjs`
- Modify: `tests/milestone/reliability-confidence-promotion-ready.test.ts`
- Add: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md`
- Add: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `tests/docs/development-progress.test.mjs`
- Modify: `tests/docs/interface-document.test.mjs`

**Approach:**
- Add one claim-matrix section to `.portmanager/reports/milestone-wording-review.md`.
- Retarget current-direction links from the wording-review-report docs to the new claim-matrix docs.
- Update developer-facing copy so roadmap and development-progress pages explicitly tell reviewers to inspect `Public claim class`.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/interface-document.test.mjs`
- `pnpm milestone:review:promotion-ready -- --limit 20`
- `pnpm exec node --experimental-strip-types --test tests/docs/*.test.mjs tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Digest and checklist re-diverge after this slice | Build claim posture once in `review-confidence.mjs` and reuse it in `review-promotion-ready.mjs` |
| Developers overreact to local promotion-ready evidence and skip publication refresh | Make `promotion-ready-refresh-required` explicit and document it across roadmap, interface, and verification docs |
| Docs drift back to the older wording-review-report pair | Retarget current-direction links and pin them in docs regression tests |

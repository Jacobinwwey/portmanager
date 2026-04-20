---
title: PortManager Milestone 2 Confidence Review Digest Plan
type: hardening
status: completed
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-portmanager-m2-confidence-review-digest-requirements.md
---

# PortManager Milestone 2 Confidence Review Digest Plan

Updated: 2026-04-20
Version: v0.1.0-completed

## Overview
This plan starts after the countdown-sync slice.
Its job is to make the final Milestone 2 review loop easier for contributors by adding one repo-native review digest command that compares the synced local readiness bundle with the tracked public progress artifact.

Status note on `2026-04-20`: all units below are now completed in `main`.

## Problem Frame
The countdown state is already visible, but contributors still have to manually compare the local synced history, the local summary markdown, the tracked public progress artifact, and the verification report.
That is unnecessary friction in the active countdown lane.
The implementation should package the existing signals into one digest without creating another readiness calculator or silently republishing docs.

## Requirements Trace
- R1-R3. Add one review command that reads local synced confidence history and tracked public progress data, then reports the current countdown state.
- R4-R6. Write a durable local review digest, print a concise terminal summary, distinguish countdown alignment from local visibility-only drift, and state the milestone-language posture.
- R7-R8. Update docs to point developers at the new command and cover aligned, drifted, and strict-failure cases in tests.

## Key Technical Decisions
- Reuse `scripts/acceptance/confidence.mjs` snapshot fields as the sole readiness truth source.
- Parse `docs-site/data/milestone-confidence-progress.ts` as publication state instead of importing it through a second readiness path.
- Keep strict published-alignment enforcement behind an explicit CLI flag so routine local review stays non-destructive.

## Implementation Units

- [x] **Unit 21: Repo-Native Confidence Review Digest Command**

**Goal:** Add one local command that reads local synced history plus the tracked public progress artifact and writes a review digest.

**Files:**
- Add: `scripts/acceptance/review-confidence.mjs`
- Modify: `package.json`

**Approach:**
- Parse the local history snapshot JSON and the generated docs artifact.
- Render a markdown digest to `.portmanager/reports/milestone-confidence-review.md`.
- Print concise summary lines to stdout.
- Support an opt-in strict mode that fails when the published countdown does not match local synced countdown fields.

**Verification:**
- Targeted tests for aligned countdown data, local-only drift, and strict mismatch failure.

- [x] **Unit 22: Test Coverage For Review Digest**

**Goal:** Prove the new review command reports the right posture and mismatch behavior.

**Files:**
- Add: `tests/milestone/reliability-confidence-review.test.ts`

**Approach:**
- Use fixture history snapshots and generated-artifact fixtures.
- Verify digest output for aligned countdown fields.
- Verify local-only drift reports aligned countdown but non-identical latest visible state.
- Verify strict published-alignment mode exits with failure when countdown fields drift.

**Verification:**
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review.test.ts`

- [x] **Unit 23: Developer Review Docs Sync**

**Goal:** Point contributors at the new command in the active countdown lane.

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`

**Approach:**
- Add `pnpm milestone:review:confidence` as the default local review step after sync.
- Keep copy explicit that the command reads existing signals and does not auto-promote wording or auto-refresh docs.

**Verification:**
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/milestone/reliability-confidence-review.test.ts`

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Review command drifts from the real readiness logic | Read the persisted history snapshot instead of recalculating readiness independently |
| Contributors treat local visibility-only drift as milestone regression | Render countdown alignment separately from latest-visible-run drift |
| Strict mode becomes noisy in routine local review | Keep strict published alignment opt-in |

---
title: PortManager Milestone 2 Confidence Promotion Review Helper Plan
type: docs-hardening
status: completed
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md
---

# PortManager Milestone 2 Confidence Promotion Review Helper Plan

Updated: 2026-04-20
Version: v0.1.0

## Overview
This plan follows the shipped promotion-ready wording slice and the helper code delivery.
Its job is not to redesign review logic.
Its job is to land helper-specific direction docs and repoint developer-facing roadmap/progress links so the public review flow matches the code that now exists on `main`.

## Problem Frame
The repo already has:

- synced local confidence history
- a review digest that compares local truth against the tracked public artifact
- an explicit refresh-only publication contract
- a published development-progress page
- a helper command that composes sync, digest generation, and optional refresh

The remaining mismatch is documentation drift.
Developers reading roadmap and development-progress surfaces still land on the older wording-review plan, even though the operational review lane now starts from the helper command.

## Requirements Trace
- R1-R3. Document the helper contract, composition, and explicit refresh boundary without altering readiness math.
- R4-R6. Repoint root docs, roadmap home, development-progress surfaces, and test coverage to the helper docs as the active direction pair.
- R7-R9. Keep thresholds, artifact-publication rules, and milestone-status boundaries unchanged.

## Key Technical Decisions
- Keep the helper implementation untouched; this slice is docs-chain retarget plus guard coverage only.
- Link developer-facing surfaces directly to GitHub source paths for the new helper requirements and plan documents.
- Preserve prior wording-review docs in the historical chain while moving current-direction references to the helper docs.

## Implementation Units

- [x] **Unit 27: Land Helper Direction Documents**

**Goal:** Add one requirements doc and one plan doc for the shipped helper slice.

**Files:**
- Add: `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md`
- Add: `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md`

**Approach:**
- Compare helper behavior against prior sync, review-digest, and wording-review slices.
- Record that the helper entrypoint composes existing primitives instead of inventing new readiness logic.
- Capture the exact publication boundary and current developer-review lane.

- [x] **Unit 28: Retarget Developer-Facing Direction Links**

**Goal:** Make developer-facing docs point to the helper docs as the active direction pair.

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Append the helper docs to the current-direction chain in root docs.
- Point development-progress current-direction links and the roadmap current-direction plan link at the helper docs.
- Guard the new helper link in docs regression coverage.

## Verification Strategy
- `pnpm milestone:review:promotion-ready -- --limit 20`
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts tests/docs/development-progress.test.mjs tests/docs/extract-locales.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Docs drift back to the wording-review slice | Keep helper doc links under test and in both root docs plus public page components |
| Helper docs accidentally imply new readiness math | State composition over reinvention and keep thresholds out of implementation changes |
| Public artifact republish rule gets blurred | Repeat that only the explicit refresh command may update the tracked confidence artifact |

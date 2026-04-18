---
title: PortManager Milestone 2 Confidence Review Signal Plan
type: hardening
status: completed
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-portmanager-m2-confidence-review-signal-requirements.md
---

# PortManager Milestone 2 Confidence Review Signal Plan

Updated: 2026-04-17
Version: v0.1.0-completed

## Overview
This plan starts after the completed confidence-history sync slice.
Its job is not to change readiness math again.
Its job is to keep synced local review truthful after newer local verification runs appear.

Status note: all units below are now completed in `main`.

## Problem Frame
PortManager already exposes:

- one canonical confidence routine
- one persisted confidence bundle
- one repo-native sync path for completed CI history
- one explicit readiness threshold model

The remaining gap was developer review clarity.
`Latest Run` could become a local visibility-only entry, while the real latest qualified mainline run moved lower in the summary.

## Requirements Trace
- R1. Persist latest qualified review evidence separately from latest visible run.
- R2. Render latest qualified review evidence in markdown summary output.
- R3. Persist and render a visibility breakdown that separates qualified evidence from local and other visibility-only noise.
- R4. Keep readiness qualification and thresholds unchanged.
- R5. Sync docs and roadmap progress wording around the new review surface.

## Key Technical Decisions
- Add `latestQualifiedRun` and a visibility breakdown directly into the persisted history snapshot.
- Keep the readiness snapshot unchanged so promotion math does not drift.
- Reuse the same summary renderer for routine and sync outputs so local and imported review surfaces stay identical.

## Implementation Units

- [x] **Unit 14: Qualified Review Signal In Confidence Snapshot**

**Goal:** Keep latest mainline evidence visible even when newer local runs exist.

**Files:**
- Modify: `scripts/acceptance/confidence.mjs`
- Modify: `tests/milestone/reliability-confidence-routine.test.ts`
- Modify: `tests/milestone/reliability-confidence-sync.test.ts`

**Approach:**
- Add `latestQualifiedRun` plus visibility breakdown metadata to the persisted history snapshot.
- Extend markdown summary rendering with `Visibility Breakdown` and `Latest Qualified Run`.
- Add red-green tests for mixed history where local latest run differs from latest qualified run.

- [x] **Unit 15: Progress Surface Sync For Developer Review**

**Goal:** Keep roadmap and progress docs aligned with the new review signal.

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs-site/data/roadmap.ts`
- Regenerate: `docs-site/en/roadmap/milestones.md`
- Regenerate: `docs-site/zh/roadmap/milestones.md`
- Regenerate: `docs-site/en/overview/product-spec.md`
- Regenerate: `docs-site/zh/overview/product-spec.md`

**Approach:**
- State that the synced summary now separates latest visible run from latest qualified mainline evidence.
- Tell developers that visibility-only local runs stay recorded, but no longer hide milestone-review evidence.
- Narrow the remaining work to sustained qualified green history and milestone-language review.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-routine.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-sync.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `pnpm test`
- `pnpm milestone:verify:confidence`
- `pnpm acceptance:verify`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| New review metadata accidentally changes readiness semantics | Keep readiness snapshot logic intact and add tests for mixed local-versus-qualified history |
| Docs overstate milestone readiness after summary improvements | Keep wording explicit that this slice improves review truth, not readiness thresholds |
| Old history files lose render compatibility | Let summary rendering derive fallback review metadata from entries when fields are absent |

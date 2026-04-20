---
title: PortManager Milestone 2 Confidence Promotion Countdown Plan
type: docs-hardening
status: completed
date: 2026-04-19
origin: docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md
---

# PortManager Milestone 2 Confidence Promotion Countdown Plan

Updated: 2026-04-19
Version: v0.1.0-completed

## Overview
This plan starts after the completed confidence-routine, readiness, history-sync, review-signal, progress-page, and Node 24 workflow-trial slices.
Its job is not to add more proof infrastructure.
Its job is to reconcile the repo and public docs around the new synced countdown truth: `building-history`, `5/7` qualified runs, `5/3` qualified consecutive passes, and `2` remaining qualified runs.

Status note on `2026-04-20`: all units below are now completed in `main`.

## Problem Frame
The repo no longer lacks milestone-confidence plumbing.
After the latest `main` pull and `pnpm milestone:sync:confidence-history -- --limit 20`, the current gap became documentation drift:

- some durable docs still described the earlier `1/7` checkpoint
- roadmap and development-progress surfaces exposed live counters but not the sharper “two runs remain” direction
- current-direction docs stopped at the `2026-04-17` confidence-progress-page slice

The implementation goal is therefore countdown reconciliation, not new architecture.

## Requirements Trace
- R1. Reconcile root/spec/interface/verification docs to the latest synced countdown truth.
- R2. State explicitly that the consecutive-pass gate is already satisfied and only the qualified-run counter remains open.
- R3. Land a new requirements+plan pair for the current countdown lane.
- R4. Surface the countdown plus current-direction links on roadmap home and the development-progress page.
- R5. Keep the remaining direction locked to confidence-maintenance governance rather than new proof scaffolding.

## Key Technical Decisions
- Use `pnpm milestone:sync:confidence-history -- --limit 20` to import the latest completed `mainline-acceptance` bundles before updating public progress copy.
- Regenerate `docs-site/data/milestone-confidence-progress.ts` only through `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` so the tracked public artifact reflects the synced state deliberately.
- Surface the current direction through existing roadmap and development-progress components rather than adding a new public page class.

## Implementation Units

- [x] **Unit 18: Sync Latest Qualified Mainline Evidence And Refresh Public Snapshot**

**Goal:** Move the tracked public progress artifact to the latest synced mainline truth before reconciling docs.

**Files:**
- Refresh: `docs-site/data/milestone-confidence-progress.ts`
- Refresh source: `.portmanager/reports/milestone-confidence-history.json`
- Refresh source: `.portmanager/reports/milestone-confidence-summary.md`

**Approach:**
- Pull completed `mainline-acceptance` bundle history back into local review with `pnpm milestone:sync:confidence-history -- --limit 20`.
- Refresh the tracked docs artifact with `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`.
- Freeze the new countdown truth before editing narrative docs.

- [x] **Unit 19: Reconcile Durable Progress Docs And Land Current-Direction Artifacts**

**Goal:** Bring repo docs and direction docs up to the latest synced countdown state.

**Files:**
- Add: `docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md`
- Add: `docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`

**Approach:**
- Replace earlier `1/7` countdown language with the new synced `5/7` truth where appropriate.
- Record that the consecutive-pass gate is already satisfied and only `2` qualified runs remain.
- Extend the durable direction-doc chain instead of overwriting the earlier slice documents.

- [x] **Unit 20: Surface Countdown Direction On Public Roadmap Pages**

**Goal:** Make the public roadmap and development-progress pages show the sharper developer-review direction.

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
- Keep using the same live progress artifact for the roadmap home counters.
- Add current-direction links and countdown-specific review guidance to the development-progress page.
- Tighten roadmap-home copy so developers can see that the pass-streak gate is closed and only the qualified-run count remains open.

## Verification Strategy
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs`
- `pnpm exec node --experimental-strip-types --test tests/docs/extract-locales.test.mjs`
- `pnpm exec node --experimental-strip-types --test tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Public roadmap copy drifts from the synced confidence artifact again | Refresh the tracked progress artifact first, then derive page copy and counters from that synced state |
| Developers misread the satisfied pass streak as permission to promote Milestone 2 immediately | State explicitly in repo docs and public docs that the qualified-run threshold remains open at `5/7` |
| Direction-doc continuity gets lost because earlier slice docs are overwritten | Add a new countdown-specific requirement and plan pair instead of rewriting older slice documents |

---
title: PortManager Milestone 2 Confidence Progress Page Plan
type: hardening
status: completed
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-portmanager-m2-confidence-progress-page-requirements.md
---

# PortManager Milestone 2 Confidence Progress Page Plan

Updated: 2026-04-17
Version: v0.1.0-completed

## Overview
This plan starts after the completed confidence review-signal slice.
Its job is not to change readiness logic.
Its job is to publish the current synced review state into the docs site so roadmap readers can inspect real progress without leaving the public page set.

Status note: all units below are now completed in `main`.

## Problem Frame
PortManager already exposes:

- one canonical confidence routine
- one durable confidence history bundle
- one repo-native sync path for completed CI history
- one truthful developer-review summary with `Latest Qualified Run`

The remaining gap was publication.
Roadmap prose mentioned the review signal, but the docs site still lacked a first-class page that surfaced the actual counters and latest qualified evidence.

## Requirements Trace
- R1. Publish an EN/ZH development-progress page in the roadmap section.
- R2. Surface readiness counters, latest qualified evidence, and visibility breakdown on that page.
- R3. Add a live preview to roadmap home and link the detailed page from navigation.
- R4. Generate the public snapshot from synced confidence data and preserve clean-clone docs builds.
- R5. Sync root/spec/interface/roadmap docs around the new public surface.

## Key Technical Decisions
- Extend `scripts/docs/extract-locales.mjs` to generate `docs-site/data/milestone-confidence-progress.ts` from `.portmanager/reports/milestone-confidence-history.json`.
- Reuse the committed generated progress snapshot when `.portmanager` data is unavailable so `docs:generate` still succeeds in clean clones.
- Add one dedicated VitePress route component for the detailed page and a smaller preview block inside `RoadmapPage.vue`.

## Implementation Units

- [x] **Unit 16: Generated Confidence Progress Data And Public Route**

**Goal:** Publish the synced milestone confidence snapshot as a first-class docs-site page.

**Files:**
- Modify: `scripts/docs/extract-locales.mjs`
- Add: `docs-site/data/milestone-confidence-progress.ts`
- Add: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Add: `docs-site/en/roadmap/development-progress.md`
- Add: `docs-site/zh/roadmap/development-progress.md`
- Modify: `docs-site/.vitepress/theme/index.ts`
- Modify: `docs-site/.vitepress/config.ts`
- Add: `tests/docs/development-progress.test.mjs`

**Approach:**
- Add a red test that requires a roadmap development-progress page plus generated live data.
- Generate a committed docs-site data snapshot from synced confidence history.
- Publish the detailed EN/ZH route and wire it into roadmap navigation.

- [x] **Unit 17: Roadmap Home Preview And Progress-Docs Sync**

**Goal:** Make roadmap home visibly show the current progress and keep repo docs aligned.

**Files:**
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Regenerate: `docs-site/en/roadmap/milestones.md`
- Regenerate: `docs-site/zh/roadmap/milestones.md`
- Regenerate: `docs-site/en/overview/product-spec.md`
- Regenerate: `docs-site/zh/overview/product-spec.md`

**Approach:**
- Render a live snapshot preview on roadmap home.
- State explicitly that the docs site now publishes the synced developer-progress surface.
- Keep next-lane wording focused on sustained qualified green history rather than inventing more reporting layers.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs`
- `pnpm exec node --experimental-strip-types --test tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `pnpm test`
- `pnpm milestone:verify:confidence`
- `pnpm acceptance:verify`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Docs build starts depending on local-only `.portmanager` files | Reuse committed generated progress data when local report files are absent |
| Public page drifts from actual confidence summary | Generate from synced history data and test against current report values |
| Roadmap home becomes another prose-only surface | Render live snapshot values plus a direct link to the detailed development-progress page |

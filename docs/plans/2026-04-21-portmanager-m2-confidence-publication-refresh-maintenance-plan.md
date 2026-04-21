---
title: PortManager Milestone 2 Confidence Publication Refresh And Maintenance Plan
type: developer-experience
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-requirements.md
---

# PortManager Milestone 2 Confidence Publication Refresh And Maintenance Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped review-pack access slice.
Its job is not to add another helper command.
Its job is to refresh the tracked public confidence artifact to the latest reviewed evidence, retarget progress docs to the maintenance lane, and keep roadmap/publication guidance aligned with the accepted live host / rule / policy slice.

## Problem Frame
The repo already has:

- one canonical confidence routine
- one synced local promotion-review helper
- one current-run CI review-pack fetch helper
- one public development-progress page backed by tracked confidence data

The remaining gap is freshness and posture:

- synced local evidence can move ahead of the tracked public artifact
- progress docs can keep pointing at a closed helper-access problem instead of the real maintenance lane
- developers need the roadmap to say clearly that remaining work is deliberate wording review and refresh discipline, not Toward C expansion

## Requirements Trace
- R1-R2. Refresh the tracked public confidence artifact from the latest reviewed local evidence.
- R3-R5. Retarget root docs and the verification report to the publication-refresh-and-maintenance lane.
- R6-R8. Retarget roadmap/development-progress current-direction guidance and links.
- R9-R10. Lock the new doc links and guidance in tests, rebuild docs, rerun acceptance, and leave the repo clean.

## Key Technical Decisions
- Use `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` for the refresh pass because local `.portmanager/reports/` already contains the synced review truth and the goal here is publication refresh rather than another history import.
- Keep exact counters in `docs-site/data/milestone-confidence-progress.ts` and the generated development-progress page, while root docs summarize posture and next direction without reintroducing brittle hard-coded readiness prose.
- Retarget current-direction links to this new requirements/plan pair so roadmap/developer-progress pages show that review-pack access is closed and maintenance is the active lane.

## Implementation Units

- [x] **Unit 40: Refresh The Tracked Confidence Artifact To The Latest Reviewed Evidence**

**Goal:** Move the tracked public snapshot from the stale published state to the latest reviewed local history.

**Files:**
- Modify: `docs-site/data/milestone-confidence-progress.ts`
- Modify: `docs/operations/portmanager-real-machine-verification-report.md`

**Approach:**
- Reuse the already-synced local `.portmanager/reports/` bundle.
- Run the promotion-review helper in explicit refresh mode without another history import.
- Freeze the refreshed counters, latest qualified run, and publication-maintenance posture in the verification report.

- [x] **Unit 41: Retarget Progress Docs To The Maintenance Lane**

**Goal:** Make repo docs describe the current architecture posture and next direction truthfully.

**Files:**
- Add: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-requirements.md`
- Add: `docs/plans/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`

**Approach:**
- Update version stamps and latest progress wording.
- Replace old fetch-helper-focused “next lane” text with publication-refresh-and-maintenance language.
- Add the new requirements/plan pair to the current-direction document list in `TODO.md`.

- [x] **Unit 42: Retarget Roadmap And Developer-Progress Surfaces**

**Goal:** Make live roadmap pages point at the new direction doc pair and the right maintenance posture.

**Files:**
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Update current-direction doc links to the new requirements/plan pair.
- Refresh the maintenance-lane summary copy so developers see that review-pack access is closed and publication freshness is the active gap.
- Keep helper-first guidance and the deliberate refresh rule visible on public pages.

## Verification Strategy
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/interface-document.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Root docs drift back into hard-coded counter prose | Keep exact counters on the tracked confidence artifact and development-progress page; summarize posture elsewhere |
| Developers misread refresh-maintenance work as new feature delivery | State explicitly that review-pack access and helper plumbing are already closed |
| Public pages link to stale direction docs | Retarget links in both `MilestoneConfidencePage.vue` and `RoadmapPage.vue`, then lock them in docs tests |

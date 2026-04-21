---
title: PortManager Milestone 2 Confidence Review Pack Fetch Plan
type: developer-experience
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-fetch-requirements.md
---

# PortManager Milestone 2 Confidence Review Pack Fetch Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped review-pack CI slice.
Its job is not to change readiness truth or publication truth.
Its job is to make the uploaded current-run review pack reachable through one repo-native command, so the remaining promotion-ready wording-review lane stops depending on manual GitHub artifact browsing.

## Problem Frame
The repo already has:

- one canonical confidence routine
- one synced local promotion review helper
- one uploaded current-run review pack in `milestone-confidence-bundle-*`

The remaining gap is access:

- docs tell developers to inspect the uploaded current-run review pack
- the repo still lacks a first-class helper that fetches that pack locally
- current-run review therefore still starts with manual GitHub UI or raw `gh run download` usage

## Requirements Trace
- R1-R3. Add one repo-native command that resolves repo/run selection and downloads the artifact.
- R4-R6. Stage the fetched review pack locally with stable file paths plus a manifest.
- R7-R10. Retarget developer guidance and regression coverage to the new fetch helper.

## Key Technical Decisions
- Add a dedicated `milestone:fetch:review-pack` helper instead of overloading `milestone:sync:confidence-history`, because the goals differ: one imports readiness history; the other stages the current-run review pack.
- Default to the latest completed `mainline-acceptance` run on `main`, but keep `--run-id` available for explicit review targeting.
- Stage fetched files under `.portmanager/reports/current-ci-review-pack/`, replacing prior fetched output by default so developers always see one stable “current CI review” directory.

## Implementation Units

- [x] **Unit 38: Add Repo-Native Review-Pack Fetch Helper**

**Goal:** Download and stage the current-run review pack through one command.

**Files:**
- Add: `scripts/acceptance/fetch-review-pack.mjs`
- Modify: `package.json`
- Add: `tests/milestone/reliability-confidence-review-pack-fetch.test.mjs`

**Approach:**
- Parse repo/workflow/branch/run/output-dir options with repo inference by default.
- Resolve either one explicit run or the latest completed workflow run that matches the default review events.
- Download `milestone-confidence-bundle-*`, require the current-run review digest plus wording checklist, copy them into `.portmanager/reports/current-ci-review-pack/`, and emit a manifest with run metadata plus local file paths.

- [x] **Unit 39: Retarget Developer Review Guidance To The Fetch Helper**

**Goal:** Make current-run CI review start from the new helper instead of manual artifact browsing.

**Files:**
- Modify: `scripts/acceptance/review-promotion-ready.mjs`
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
- Modify: `tests/milestone/reliability-confidence-promotion-ready.test.ts`

**Approach:**
- Add the helper to human review checklist output so wording-review protocol captures the current-run fetch path.
- Update roadmap/home/development-progress copy to say “run `pnpm milestone:fetch:review-pack` when CI state is the first question.”
- Retarget current-direction links to this new requirements/plan pair.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-review-pack-fetch.test.mjs tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/interface-document.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `pnpm milestone:fetch:review-pack`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Developers mistake fetch-helper output for synced local review truth | Keep docs explicit that `milestone:fetch:review-pack` stages current-run bundle evidence, while `milestone:review:promotion-ready -- --limit 20` remains the synced local helper |
| Older workflow runs lack the new review-pack files | Require digest + wording checklist and fail with a clear message when the selected run predates the published review-pack slice |
| Fetched output pollutes tracked repo state | Keep default output under ignored `.portmanager/` and overwrite the stable directory each run |

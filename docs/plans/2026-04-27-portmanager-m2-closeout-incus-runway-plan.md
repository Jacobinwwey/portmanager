---
title: PortManager Milestone 2 Closeout And Incus Runway Plan
type: hardening
status: active
date: 2026-04-27
origin: docs/brainstorms/2026-04-27-portmanager-m2-closeout-incus-runway-requirements.md
---

# PortManager Milestone 2 Closeout And Incus Runway Plan

Updated: 2026-04-27
Version: v0.1.0

## Status Note
Milestone 2 readiness is already `promotion-ready`.
This plan does not reopen the confidence threshold story.
It lands a faster repo-native Debian 12 rehearsal path plus the first explicit frontend runway that keeps Milestone 2 closeout and Toward C bounded follow-up in one visible map.

## Overview
This plan treats the earlier Milestone 3 preflight work as landed baseline.
It adds one repo-native incus helper, one first-pass runway surface in Web and docs-site, and the required doc-sync trail so contributors can move faster without inventing new platform claims.

## Requirements Trace
- R1-R4. Add one bounded repo-native incus rehearsal helper.
- R5-R7. Surface the new closeout runway in Web plus docs-site frontend.
- R8-R9. Land raw-doc truth plus requirements/plan artifacts.
- R10. Add regression coverage for helper, Web runway, and docs-site copy.

## Key Technical Decisions
- Keep the incus helper under `scripts/acceptance/` because it is staging and discipline tooling, not controller runtime logic.
- Export parsing plus command-plan helpers so tests stay hermetic without a real `incus` daemon.
- Keep the Web runway inside `OverviewPage`; this is the operator shell where closeout posture and next bounded actions should already be visible.
- Treat docs-site development-progress as the canonical developer-facing frontend surface; roadmap copy should summarize the same closeout slice instead of diverging.

## Implementation Units

- [ ] **Unit 89: Repo-Native Incus Rehearsal Helper**

**Goal:** Launch one disposable Debian 12 rehearsal lane quickly and print the exact next review and preview commands.

**Requirements:** R1-R4, R10

**Files:**
- Modify: `package.json`
- Add: `scripts/acceptance/rehearse-debian12-incus.mjs`
- Add: `tests/milestone/rehearse-debian12-incus.test.ts`

**Approach:**
- Add `pnpm milestone:rehearse:debian12-incus`.
- Build and export argument parsing, command rendering, and rehearsal-plan generation.
- Launch one Debian 12 incus instance, mount the repo, install minimal inspection packages, and print cleanup plus next commands.
- Keep `--dry-run` viable so developers can inspect the plan even when `incus` is not installed locally.

**Verification:**
- `node --experimental-strip-types --test tests/milestone/rehearse-debian12-incus.test.ts`

- [ ] **Unit 90: First Frontend Runway Slice**

**Goal:** Show Milestone 2 guardrail discipline and Toward C bounded follow-up in visible frontend cards.

**Requirements:** R5-R7, R10

**Files:**
- Modify: `apps/web/src/main.ts`
- Modify: `tests/web/web-shell.test.ts`
- Modify: `tests/web/live-controller-shell.test.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Add one Milestone 2 closeout card plus one Toward C runway card to the Web overview shell.
- Teach the docs-site development-progress page to mention the new closeout slice, the repo-native incus helper, and the preview-before-capture progression.
- Keep roadmap preview wording aligned with the same bounded sequence.

**Verification:**
- `node --experimental-strip-types --test tests/web/web-shell.test.ts tests/web/live-controller-shell.test.ts`
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs`

- [ ] **Unit 91: Raw Docs And Progress Sync**

**Goal:** Keep raw docs, root summaries, and operator guidance aligned with the new helper and runway slice.

**Requirements:** R7-R9

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs/operations/portmanager-debian-12-acceptance-recipe.md`

**Approach:**
- Add the new requirements-plan pair to current-direction artifacts.
- Update current-direction summaries so Milestone 2 remains guardrail-first while the new incus helper and frontend runway accelerate bounded rehearsal.
- Promote the repo-native helper in the acceptance recipe while keeping raw `incus launch` as fallback context.

**Verification:**
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `git diff --check`

## Verification
- `node --experimental-strip-types --test tests/milestone/rehearse-debian12-incus.test.ts`
- `node --experimental-strip-types --test tests/web/web-shell.test.ts tests/web/live-controller-shell.test.ts`
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs`
- `pnpm acceptance:verify`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not let the incus helper imply support parity on its own.
- Do not let frontend runway copy drift from raw docs or review-helper posture.
- Do not let the new closeout slice erase the already-landed preflight baseline.

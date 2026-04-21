---
title: PortManager Milestone 2 Confidence Wording Review Report Plan
type: docs-hardening
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md
---

# PortManager Milestone 2 Confidence Wording Review Report Plan

Updated: 2026-04-21
Version: v0.1.0

## Overview
This plan follows the shipped promotion-review helper slice.
Its job is not to alter readiness math or publication rules.
Its job is to package the human wording-review posture into one repo-native artifact, then retarget developer-facing docs and public roadmap surfaces to that artifact.

## Problem Frame
The helper already composes sync plus digest generation.
The public docs already show the confidence state.
The remaining mismatch is review ergonomics and direction drift:

- the helper stops at the digest even though wording review is now the active human lane
- developer-facing docs still explain the helper but do not package the wording-review checklist artifact
- public roadmap and development-progress surfaces still point at the helper-only doc pair instead of the next current-direction slice

## Requirements Trace
- R1-R4. Extend the helper with a default wording-review artifact, explicit override path, and skip flag.
- R5-R7. Land one additive current-direction doc pair and retarget root/public docs to it.
- R8-R9. Guard helper behavior plus docs-site public links and wording-review artifact references in tests.

## Key Technical Decisions
- Keep the wording-review artifact local and ignored under `.portmanager/reports/`.
- Derive `Wording review allowed` from existing promotion-ready truth plus published-countdown alignment; do not fork readiness logic.
- Retarget current-direction links to the new wording-review-report docs while preserving prior helper docs in the historical chain.
- Mention the wording-review artifact explicitly in public component copy instead of changing the generated confidence-progress data schema.

## Implementation Units

- [x] **Unit 29: Extend Promotion-Review Helper With Wording-Review Artifact**

**Goal:** Make the helper emit one durable local checklist for human milestone-language review.

**Files:**
- Modify: `scripts/acceptance/review-promotion-ready.mjs`
- Modify: `tests/milestone/reliability-confidence-promotion-ready.test.ts`

**Approach:**
- Add one default output path under `.portmanager/reports/`.
- Render a checklist that captures readiness truth, publication alignment, latest qualified evidence, and human review guardrails.
- Support explicit override and skip flags so tests and dry runs stay controllable.

- [x] **Unit 30: Land Direction Docs And Public Review Guidance**

**Goal:** Make developers and public roadmap readers see the wording-review checklist as part of the active review lane.

**Files:**
- Add: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md`
- Add: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md`
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
- Extend the current-direction doc chain with the wording-review-report pair.
- Update root docs and operational guidance so the helper-generated wording-review checklist is part of the default developer review pack.
- Retarget public component links from the helper-only doc pair to the new wording-review-report pair.
- Add regression coverage for the new links and public artifact reference.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `pnpm milestone:review:promotion-ready -- --limit 20`
- `pnpm exec node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/interface-document.test.mjs tests/milestone/reliability-confidence-review.test.ts tests/milestone/reliability-confidence-promotion-ready.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `corepack pnpm acceptance:verify`
- `git diff --check`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Developers over-trust promotion-ready counters and overclaim milestone status | Keep explicit guardrail checklist items and `Wording review allowed` tied to published-countdown alignment |
| Public pages drift back to helper-only docs | Retarget links and keep them under docs regression tests |
| Local helper output starts polluting tracked diffs | Keep the wording-review artifact under ignored `.portmanager/reports/` |

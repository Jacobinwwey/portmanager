---
title: PortManager Milestone 2 Confidence Readiness Plan
type: hardening
status: completed
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-portmanager-m2-confidence-readiness-requirements.md
---

# PortManager Milestone 2 Confidence Readiness Plan

Updated: 2026-04-17
Version: v0.1.0-completed

## Overview
This plan starts after the completed confidence-routine and confidence-history bundle slices.
Its job is not to add another proof runner.
Its job is to turn the persisted history bundle into an explicit promotion-readiness signal, publish that signal for developers, and sync docs around the new measurable rule.

Status note: all units below are now completed in `main`.

## Problem Frame
PortManager already has:

- a canonical confidence routine
- mainline CI collection for that routine
- persisted report/history/summary artifacts

The remaining gap is that milestone-promotion discipline is still qualitative.
Developers can collect history, but they still need to infer what counts and how far the branch is from readiness.

## Requirements Trace
- R1. Distinguish qualified readiness runs from local or non-mainline runs.
- R2. Keep qualified scope aligned with `push`, `workflow_dispatch`, and `schedule` on `refs/heads/main`.
- R3. Compute readiness status plus explicit remaining-gap numbers inside the persisted bundle.
- R4. Show whether the latest run qualified for readiness advancement.
- R5. Publish confidence summary directly in GitHub Actions UI.
- R6. Keep docs and roadmap wording aligned with the new readiness rule.

## Key Technical Decisions
- Treat qualified readiness runs as the same mainline-trigger scope already used for CI confidence collection.
- Keep one readiness rule set in code: `7` qualified runs and `3` consecutive qualified passes.
- Record local and other non-qualified runs for visibility, but do not let them advance promotion readiness.
- Publish the generated markdown summary directly into the workflow run page instead of adding a separate custom formatter.

## Implementation Units

- [x] **Unit 9: Readiness Math In Confidence History**

**Goal:** Extend the persisted history bundle with qualified-run semantics and readiness status.

**Files:**
- Modify: `scripts/acceptance/confidence.mjs`
- Modify: `tests/milestone/reliability-confidence-routine.test.ts`

**Approach:**
- Mark each history entry as readiness-qualified or not.
- Compute top-level readiness status, qualified-run counts, qualified consecutive-pass counts, and remaining gap numbers.
- Render those values into the markdown summary and expose latest-run qualification state.

- [x] **Unit 10: Developer-Facing Confidence Progress**

**Goal:** Make readiness visible in CI without requiring artifact download.

**Files:**
- Modify: `.github/workflows/mainline-acceptance.yml`

**Approach:**
- Append the generated milestone-confidence summary into `$GITHUB_STEP_SUMMARY`.
- Keep artifact upload and cache persistence unchanged.

- [x] **Unit 11: Progress And Roadmap Sync**

**Goal:** Replace vague confidence-maintenance wording with the explicit readiness rule across repo docs.

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
- State the readiness rule explicitly: `7` qualified runs plus `3` consecutive qualified passes on mainline confidence triggers.
- Explain that local runs stay visible but do not advance milestone promotion.
- Point developers at the summary markdown and workflow job summary as the new progress surfaces.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-routine.test.ts`
- `pnpm test`
- `pnpm milestone:verify:confidence`
- `pnpm acceptance:verify`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Developers mistake readiness status for automatic milestone promotion | Keep docs explicit that readiness informs human review; it does not auto-promote milestone wording |
| Local runs distort mainline readiness | Count local and non-mainline runs separately from qualified readiness history |
| Docs drift from code thresholds | Keep the rule in code, summary output, root docs, and roadmap wording together in one slice |

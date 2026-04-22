---
title: PortManager Milestone 3 Review Delta Surface Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-review-delta-surface-requirements.md
---

# PortManager Milestone 3 Review Delta Surface Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress now moves Milestone 3 past broad review-adjudication wording.
Units 63 through 71 are landed.
`/second-target-policy-pack` already reports `review_open` with pending verdicts for `debian-12-systemd-tailscale`.
One preserved Debian 12 packet already says local Docker bridge address `172.17.0.2` replaced live Tailscale transport.
The active next move is to surface that explicit blocking delta everywhere developers already read controller truth.

## Overview
This plan covers the next post-adjudication Milestone 3 slice.
It treats review-open posture as completed history.
It does not reopen Units 63 through 71.
It adds one explicit blocking-delta surface plus the docs and roadmap sync needed so developers stop reading vague “review-found delta” wording without seeing the actual blocker.

## Problem Frame
The repo no longer lacks:

- review-open adjudication truth
- pending verdict names
- preserved packet evidence
- docs contract and operator ownership guardrails

It now lacks one public contract layer that says:

- the preserved packet is still Docker-bridge-only
- live Tailscale follow-up is still required before review can close
- support remains locked for a concrete reason, not generic caution
- roadmap and progress docs now point at the blocking delta itself instead of broad adjudication wording

## Requirements Trace
- R1-R3. Publish explicit blocking delta truth through `/second-target-policy-pack`.
- R4-R6. Sync generated contracts, CLI text, web cards, and current next-action wording.
- R7-R10. Retarget docs and regression coverage to the new review-delta-surface pair.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Review-open truth | `/second-target-policy-pack` already publishes `review_open` and pending verdicts | Stop hiding the only real blocker behind generic verdict wording |
| Preserved packet drift note | Packet README and capture summaries already say Docker bridge evidence replaced live Tailscale transport | Surface the same delta on the live controller contract |
| Support-lock posture | Docs already keep broader support locked to Ubuntu | Explain the concrete unresolved delta wherever support-lock truth is published |
| Developer progress visibility | Roadmap and progress surfaces already say review-found delta remains | Replace vague delta wording with the explicit transport-substitution blocker |

## Key Technical Decisions
- Add `blockingDeltas` under `reviewAdjudication` instead of another top-level object.
- Keep the initial delta set small: exactly one blocking delta for Docker bridge transport substitution.
- Reuse preserved packet sources rather than mutating packet artifacts.
- Keep `review_open` and pending verdicts intact while adding the explicit delta plus required follow-up.

## Implementation Units

- [x] **Unit 72: Review Delta Contract Surface**

**Goal:** Extend `/second-target-policy-pack` with explicit blocking review delta truth and expose it across generated contracts, CLI, web, and controller tests.

**Requirements:** R1-R6, R9

**Dependencies:** Units 63-71

**Files:**
- Modify: `apps/controller/src/second-target-policy-pack.ts`
- Modify: `packages/contracts/openapi/openapi.yaml`
- Modify: `packages/typescript-contracts/src/generated/*`
- Modify: `crates/portmanager-cli/src/main.rs`
- Modify: `apps/web/src/main.ts`
- Modify: `tests/controller/second-target-policy-pack.test.ts`
- Modify: `crates/portmanager-cli/tests/operation_get_cli.rs`
- Modify: `tests/web/web-shell.test.ts`
- Modify: `tests/contracts/generate-contracts.test.mjs`

**Approach:**
- Add `SecondTargetReviewDelta` types plus `reviewAdjudication.blockingDeltas`.
- Publish one blocking delta for Docker bridge transport substitution with explicit `requiredFollowUp`.
- Update review-open wording so the delta remains visible in next actions, CLI text, and web cards.

**Verification:**
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts`
- `cargo test -p portmanager-cli --test operation_get_cli`
- `node --experimental-strip-types --test tests/web/web-shell.test.ts`
- `pnpm contracts:generate`
- `node --experimental-strip-types --test tests/contracts/generate-contracts.test.mjs`

- [x] **Unit 73: Docs, Roadmap, And Progress Retargeting**

**Goal:** Land the review-delta-surface requirements/plan pair, update maintainer docs, and retarget public progress surfaces to the explicit transport blocker.

**Requirements:** R7-R10

**Dependencies:** Unit 72

**Files:**
- Create: `docs/brainstorms/2026-04-21-portmanager-m3-review-delta-surface-requirements.md`
- Create: `docs/plans/2026-04-21-portmanager-m3-review-delta-surface-plan.md`
- Modify: `docs/operations/portmanager-second-target-review-contract.md`
- Modify: `docs/operations/portmanager-debian-12-operator-ownership.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Rewrite current-direction wording so the active map points at the new review-delta-surface pair.
- Name the Docker bridge substitution explicitly, including address `172.17.0.2`, and keep the required live-Tailscale follow-up bounded.
- Keep Units 63 through 71 visible as landed history while naming the blocking delta as the current Milestone 3 queue.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Verification
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts tests/web/web-shell.test.ts`
- `cargo test -p portmanager-cli --test operation_get_cli`
- `pnpm contracts:generate`
- `node --experimental-strip-types --test tests/contracts/generate-contracts.test.mjs tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not weaken the support-lock posture while the Docker-bridge delta remains unresolved.
- Do not mutate preserved packet artifacts just to duplicate live contract wording.
- Do not let roadmap links keep pointing at the adjudication pair after the delta-surface pair lands.

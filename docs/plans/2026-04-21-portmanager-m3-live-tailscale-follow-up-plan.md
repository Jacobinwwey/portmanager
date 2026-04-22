---
title: PortManager Milestone 3 Live Tailscale Follow-Up Plan
type: architecture
status: completed
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md
---

# PortManager Milestone 3 Live Tailscale Follow-Up Plan

Updated: 2026-04-21
Version: v0.2.0

## Status Note
Late `2026-04-21` progress now marks this slice landed.
`/second-target-policy-pack` already reports top-level `liveTransportFollowUp`, `capture_complete` is structurally reachable, CLI/Web/contracts/docs expose captured packet fields, and remote `main` CI parity is repaired after the stale live-loader expectation was updated.
The active next queue now moves to `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`.

## Overview
This plan covers the post-delta Milestone 3 slice.
It keeps review-open posture and blocking-delta truth as landed history.
It does not reopen the earlier review-delta work.
It finishes the top-level `liveTransportFollowUp` contract, lands the dedicated follow-up guide, retargets roadmap/progress docs, and regenerates the public pages so developers can see the live next action on the docs site.

## Problem Frame
The repo no longer lacks:

- review-open truth
- pending verdict names
- explicit blocking delta wording
- preserved packet summaries

It now lacks one fully synced public lane that says:

- live follow-up capture is required now
- the preserved Docker-bridge packet stays immutable historical evidence
- the new packet must land under `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`
- one dedicated guide plus artifact checklist govern the next bounded packet

## Requirements Trace
- R1-R5. Publish and keep the top-level `liveTransportFollowUp` contract truthful.
- R6-R8. Sync generated contracts, CLI text, Web cards, and next-action wording.
- R9-R12. Land the new guide, retarget docs and roadmap/progress pages, regenerate docs-site outputs, and lock regressions.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Blocking delta truth | `/second-target-policy-pack.reviewAdjudication.blockingDeltas` already says Docker bridge address `172.17.0.2` replaced live Tailscale transport | Keep blocker visibility intact and add one explicit blocker-resolution lane |
| Public next action | Docs already say live-Tailscale follow-up is next | Publish one top-level contract surface and one dedicated guide instead of leaving the next move spread across prose |
| Historical packet integrity | One preserved Debian 12 packet already exists under `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` | Keep it immutable and point all new captures at a fresh root pattern |
| Developer progress page | Roadmap and development-progress pages already explain the blocker | Retarget them to the new live-follow-up requirements/plan pair and guide path so the page becomes actionable |

## Key Technical Decisions
- Keep `liveTransportFollowUp` top-level on `SecondTargetPolicyPack`.
- Keep the initial state model small: `deferred`, `capture_required`, `capture_complete`.
- Keep one fresh root pattern `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`.
- Keep the preserved packet as historical evidence instead of mutating it.
- Keep the guide path explicit in controller truth, docs, CLI, Web, and roadmap/progress copy.

## Implementation Units

- [x] **Unit 72: Live Follow-Up Contract Surface**

**Goal:** Extend `/second-target-policy-pack` with the top-level `liveTransportFollowUp` object and expose it across generated contracts, CLI text, Web, and controller tests.

**Requirements:** R1-R8, R11

**Dependencies:** Units 63-71, landed review-delta surface

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
- Add `SecondTargetLiveTransportFollowUp*` types and artifact metadata.
- Publish `capture_required` when review is open and the preserved packet still points at Docker bridge address `172.17.0.2`.
- Keep guide path, artifact root pattern, required next action, and required artifact checklist explicit everywhere developers read controller truth.

**Verification:**
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts`
- `cargo test -p portmanager-cli --test operation_get_cli`
- `node --experimental-strip-types --test tests/web/web-shell.test.ts`
- `pnpm contracts:generate`
- `node --experimental-strip-types --test tests/contracts/generate-contracts.test.mjs`

- [x] **Unit 73: Live Follow-Up Guide, Roadmap, And Docs-Site Sync**

**Goal:** Land the live follow-up guide, new requirements/plan pair, retarget root docs and roadmap/progress pages, and regenerate docs-site outputs so the public page shows the new active Milestone 3 direction.

**Requirements:** R9-R12

**Dependencies:** Unit 72

**Files:**
- Create: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Create: `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md`
- Create: `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`
- Modify: `docs/operations/portmanager-second-target-review-contract.md`
- Modify: `docs/operations/portmanager-debian-12-operator-ownership.md`
- Modify: `docs/operations/portmanager-debian-12-acceptance-recipe.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/architecture/portmanager-v1-architecture.md`
- Modify: `docs-site/content-map.js`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Retarget active-map wording from the landed review-delta pair to the new live-follow-up pair.
- Publish the new guide path and fresh artifact-root pattern on root docs, roadmap data, and development-progress UI.
- Keep the preserved Docker-bridge packet explicit as historical blocker evidence while making the next bounded live packet actionable for developers.

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
- Do not weaken the support-lock posture while live follow-up is still `capture_required`.
- Do not mutate the preserved packet in place.
- Do not let roadmap or development-progress pages keep pointing at the landed review-delta pair as if it were still the active next queue.
- Do not publish a fresh docs-site page without regenerating the generated locale pages that back it.

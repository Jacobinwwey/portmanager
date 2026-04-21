---
title: PortManager Milestone 3 Review Adjudication Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-review-adjudication-requirements.md
---

# PortManager Milestone 3 Review Adjudication Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress now moves Milestone 3 past packet capture.
Units 63 through 69 are landed.
`/second-target-policy-pack` already reports guide coverage `6/6`, artifact coverage `20/20`, readiness state `packet_ready`, and decision state `review_required` for declared candidate `debian-12-systemd-tailscale`.
One bounded Debian 12 review packet is preserved at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`.
The active next move is explicit review adjudication, stale-wording cleanup, and developer-progress retargeting while broader support stays locked to Ubuntu.

## Overview
This plan covers the first post-packet Milestone 3 slice.
It treats packet capture as completed history.
It does not reopen Units 63 through 69.
It adds one adjudication truth surface plus the docs and roadmap sync needed so developers stop reading stale “open review next” wording.

## Problem Frame
The repo no longer lacks:

- Debian 12 review-prep governance docs
- review-packet template and proof guides
- preserved packet artifacts
- readiness visibility

It now lacks one explicit adjudication layer that says:

- bounded second-target review is already open
- these verdicts are still pending
- support remains locked while review stays open
- roadmap and current-direction links now point at the adjudication slice rather than the already-completed readiness slice

## Requirements Trace
- R1-R3. Publish adjudication truth through `/second-target-policy-pack`.
- R4-R6. Replace stale pre-open and review-prep-only wording in code and maintainer docs.
- R7-R10. Retarget roadmap/development-progress and lock the new posture with regression coverage.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Review packet status | Packet root is preserved and readiness is already `packet_ready` | Stop calling packet capture the next task |
| Second-target policy contract | `/second-target-policy-pack` already exposes readiness truth across controller, CLI, web, and docs | Extend it with adjudication verdicts |
| Candidate-host runtime guardrail | Candidate hosts already allow only bounded non-support actions | Update stale user-facing guard text to bounded-review wording |
| Developer progress visibility | Progress surfaces already describe adjudication as next in prose | Retarget current-direction links and docs contracts to the adjudication pair |

## Key Technical Decisions
- Add `reviewAdjudication` to `SecondTargetPolicyPack` instead of creating a separate route.
- Keep adjudication state derived from existing `decisionState` plus `reviewPacketReadiness.state`.
- Publish pending verdicts, not completed verdicts, so broader support remains locked until a future closeout slice resolves them explicitly.
- Treat the older review-packet-readiness requirements/plan pair as completed historical context, not the active direction pair.

## Implementation Units

- [x] **Unit 70: Review Adjudication Contract Surface**

**Goal:** Extend `/second-target-policy-pack` with explicit adjudication truth and expose it across generated contracts, CLI, web, and controller tests.

**Requirements:** R1-R3, R9

**Dependencies:** Units 63-69

**Files:**
- Modify: `apps/controller/src/second-target-policy-pack.ts`
- Modify: `apps/controller/src/controller-domain-service.ts`
- Modify: `packages/contracts/openapi/openapi.yaml`
- Modify: `packages/typescript-contracts/src/generated/*`
- Modify: `crates/portmanager-cli/src/main.rs`
- Modify: `apps/web/src/main.ts`
- Modify: `tests/controller/second-target-policy-pack.test.ts`
- Modify: `tests/controller/host-rule-policy.test.ts`
- Modify: `tests/controller/agent-service.test.ts`
- Modify: `crates/portmanager-cli/tests/operation_get_cli.rs`
- Modify: `tests/web/web-shell.test.ts`
- Modify: `tests/contracts/generate-contracts.test.mjs`

**Approach:**
- Add a `reviewAdjudication` block with derived state, packet root, contract path, pending verdicts, and sources.
- Change packet-ready wording from “open review” to “adjudicate review.”
- Change candidate-host error wording from `review-prep only` to `bounded-review only`.

**Verification:**
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts tests/controller/host-rule-policy.test.ts tests/controller/agent-service.test.ts tests/web/web-shell.test.ts`
- `cargo test -p portmanager-cli operation_get_cli -- --nocapture`
- `pnpm contracts:generate`
- `node --experimental-strip-types --test tests/contracts/generate-contracts.test.mjs`

- [x] **Unit 71: Docs, Roadmap, And Progress Retargeting**

**Goal:** Land the adjudication requirements/plan pair, update maintainer docs, and retarget public progress surfaces to the new pair.

**Requirements:** R4-R8, R10

**Dependencies:** Unit 70

**Files:**
- Create: `docs/brainstorms/2026-04-21-portmanager-m3-review-adjudication-requirements.md`
- Create: `docs/plans/2026-04-21-portmanager-m3-review-adjudication-plan.md`
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
- Rewrite stale review contract and operator-ownership language to review-open truth.
- Point active-map references at the new adjudication requirements/plan pair.
- Keep the preserved packet and Units 63 through 69 visible as landed history while naming adjudication as the remaining bounded queue.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Verification
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts tests/controller/host-rule-policy.test.ts tests/controller/agent-service.test.ts tests/web/web-shell.test.ts`
- `pnpm contracts:generate`
- `node --experimental-strip-types --test tests/contracts/generate-contracts.test.mjs tests/docs/development-progress.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not weaken the locked-support posture while review is open.
- Do not let roadmap links keep pointing at the older readiness pair after the adjudication pair lands.
- Do not mutate preserved packet artifacts just to make current docs cleaner; treat packet artifacts as history.

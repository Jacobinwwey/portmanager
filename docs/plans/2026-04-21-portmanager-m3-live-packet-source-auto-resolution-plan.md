---
title: PortManager Milestone 3 Live Packet Source Auto-Resolution Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-requirements.md
---

# PortManager Milestone 3 Live Packet Source Auto-Resolution Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress already landed review-delta visibility, scaffold -> assemble -> validate tooling, and controller-plus-agent capture automation.
The remaining Milestone 3 repo-native gap is now smaller.
Operators can already write a canonical live packet in one command, but they still have to discover the latest candidate host id and bootstrap operation id manually before that command can start.

## Overview
This plan treats review adjudication, live-packet discovery, execution tooling, capture automation, and roadmap blocker retargeting as landed history.
It adds bounded controller-side source auto-resolution for the capture helper, keeps explicit ids as override escape hatches, and updates operator plus docs-site progress surfaces so they point at this narrower queue instead of the already-landed capture-automation slice.

## Problem Frame
The repo no longer lacks:

- an explicit blocking delta for Docker bridge substitution
- newest-valid live packet discovery
- canonical packet filenames and summary layout
- repo-native scaffold, assemble, validate, and capture commands

The repo still lacks:

- one preferred capture command that can resolve the candidate host and latest successful bootstrap operation without manual controller inventory lookup
- clear operator guidance for minimal capture invocation versus explicit override paths
- public roadmap/progress wording that says source auto-resolution, not capture automation, is the active implementation lane

## Requirements Trace
- R1-R7. Add controller-driven host/bootstrap auto-resolution without changing the read-only capture truth path.
- R8-R10. Retarget operator docs plus roadmap/development-progress wording.
- R11-R12. Add resolver coverage and docs verification.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Packet truth | `apps/controller/src/second-target-policy-pack.ts` already validates and discovers newest valid live packet roots | Reuse this truth after auto-resolved capture writes canonical files |
| Packet tooling | `capture` already fetches packet artifacts once ids are known | Resolve candidate host/bootstrap ids repo-natively before the same capture flow runs |
| Operator workflow | Manual id lookup still precedes capture | Promote one minimal capture command and keep explicit ids as override/fallback |
| Public progress docs | Active map still says capture automation even though that slice is landed | Move active-map wording to source auto-resolution |

## Key Technical Decisions
- Keep `capture` inside `scripts/milestone/live-transport-follow-up-packet.ts`; do not create a second wrapper or parallel resolver script.
- Make `--host-id` and `--bootstrap-operation-id` optional overrides, not required inputs.
- Add optional `--candidate-target-profile-id`, defaulting to `debian-12-systemd-tailscale`, so candidate resolution stays bounded and explicit.
- Resolve the latest successful bootstrap operation from controller `GET /hosts` plus `GET /operations`; do not add any controller write or new API contract in this slice.
- Keep scaffold plus assemble as documented fallback when operator review wants explicit hand-selected artifacts.

## Implementation Units

- [ ] **Unit 83: Capture Source Auto-Resolution**

**Goal:** Resolve the candidate host and latest successful bootstrap operation repo-natively before the existing capture flow fetches packet artifacts.

**Requirements:** R1-R7, R11

**Dependencies:** Landed Units 77-82

**Files:**
- Modify: `scripts/milestone/live-transport-follow-up-packet.ts`
- Modify: `tests/milestone/live-transport-follow-up-packet.test.ts`

**Approach:**
- Make `--host-id` and `--bootstrap-operation-id` optional for `capture`.
- Add `--candidate-target-profile-id` with default `debian-12-systemd-tailscale`.
- Resolve the latest successful bootstrap operation from controller host plus operation inventory when ids are omitted.
- Keep explicit ids as override escape hatches and fail clearly on host/bootstrap mismatch.
- Feed the resolved ids into the existing read-only capture path without forking packet-writing truth.

**Test scenarios:**
- Capture CLI parsing accepts controller-only invocation plus optional candidate target profile override.
- Capture auto-resolves the latest candidate bootstrap pair from mocked controller inventory and writes a valid packet.
- Explicit `--host-id` plus `--bootstrap-operation-id` mismatch fails clearly.

**Verification:**
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`

- [ ] **Unit 84: Preferred Minimal Capture Guidance**

**Goal:** Teach operators the new minimal capture invocation first while keeping explicit ids and scaffold/assemble helpers as bounded fallback.

**Requirements:** R8, R10

**Dependencies:** Unit 83

**Files:**
- Modify: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Modify: `docs/operations/portmanager-debian-12-review-packet-template.md`

**Approach:**
- Promote `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` as the preferred path.
- Document `--candidate-target-profile-id`, explicit ids, and `--agent-base-url` as bounded override flags.
- Keep scaffold plus assemble as lower-level fallback when controller inventory resolution or direct HTTP capture is unavailable.

**Test scenarios:**
- Guide and template both show the minimal capture command.
- Both docs still mention explicit ids plus scaffold/assemble fallback.
- Wording still says `capture_required` remains truthful until one real packet is committed.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`

- [ ] **Unit 85: Roadmap And Developer Progress Retarget**

**Goal:** Shift public and developer-facing progress surfaces from capture automation to source auto-resolution.

**Requirements:** R9-R12

**Dependencies:** Units 83-84

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Mark capture automation as landed history.
- Point the active Milestone 3 map at the new source-auto-resolution requirements/plan pair.
- Update developer-focus copy so the new preferred next step is minimal capture invocation with repo-native auto-resolution.
- Keep blocker truth explicit: `container_bridge_transport_substitution`, Docker bridge address `172.17.0.2`, and `capture_required` still remain public reality until a real packet lands.

**Test scenarios:**
- Development-progress docs now reference the source-auto-resolution requirements/plan pair.
- Docs-site roadmap and progress copy mention minimal capture invocation and explicit override paths.
- Root/docs/spec wording no longer treats capture automation as the active queue.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Verification
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `pnpm acceptance:verify`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not let auto-resolution fabricate or widen target claims; it must stay bounded to the declared candidate target profile.
- Do not let auto-resolution mutate controller or agent state; capture remains read-only.
- Do not let public roadmap/progress docs keep pointing at a landed capture-automation slice as if it were still the active queue.
- Do not narrow support-lock wording while no real committed live packet exists yet.

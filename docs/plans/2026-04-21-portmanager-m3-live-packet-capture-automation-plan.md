---
title: PortManager Milestone 3 Live Packet Capture Automation Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-live-packet-capture-automation-requirements.md
---

# PortManager Milestone 3 Live Packet Capture Automation Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress already landed review-delta visibility plus scaffold -> assemble -> validate execution tooling.
The remaining Milestone 3 gap is smaller.
Operators still have to gather five live JSON artifacts manually before the repo-native packet helpers can finish, so this slice adds one bounded capture helper and retargets roadmap/progress wording to that narrower queue.

## Overview
This plan treats review adjudication, live packet discovery, scaffold safety, and packet assembly/validation as landed history.
It adds one repo-native fetch-and-write helper for real live-packet evidence, keeps overwrite behavior conservative, and updates operator/docs-site progress surfaces so they point at the new active queue instead of the already-landed review-delta slice.

## Problem Frame
The repo no longer lacks:

- an explicit blocking delta for Docker bridge substitution
- newest-valid live packet discovery
- canonical packet filenames and summary layout
- repo-native scaffold, assemble, and validate commands

The repo still lacks:

- one preferred command that fetches the five live evidence artifacts directly from controller plus agent HTTP surfaces
- safe overwrite rules that allow scaffold-root replacement but still protect existing real packet roots
- public roadmap/progress wording that says capture automation, not review-delta visibility, is the active implementation lane

## Requirements Trace
- R1-R5. Add the repo-native capture path and bounded fetch validation.
- R6-R8. Keep packet mutation safe and reuse existing validator truth.
- R9-R11. Retarget operator docs plus roadmap/development-progress wording.
- R12-R13. Add capture coverage and docs verification.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Packet truth | `apps/controller/src/second-target-policy-pack.ts` already validates and discovers newest valid live packet roots | Reuse this truth after capture writes canonical files |
| Packet tooling | `scaffold`, `assemble`, and `validate` already exist | Add one higher-level `capture` entrypoint that feeds the same packet writer |
| Operator workflow | Manual host/operation/curl/audit collection still precedes assembly | Replace that manual collection with one preferred repo-native command |
| Public progress docs | Active map still points at review-delta visibility even though that slice is landed | Move active-map wording to capture automation |

## Key Technical Decisions
- Add `capture` to the existing `scripts/milestone/live-transport-follow-up-packet.ts` helper so one script owns scaffold, assemble, capture, and validate.
- Fetch controller evidence and agent evidence over bounded HTTP reads only; do not automate controller writes in this slice.
- Allow scaffold-root replacement without `--force`, but block non-scaffold overwrite unless `--force` is explicit.
- Keep scaffold plus assemble as documented fallback paths, but make capture the preferred operator command.

## Implementation Units

- [x] **Unit 80: Repo-Native Live Packet Capture Helper**

**Goal:** Fetch the five live follow-up artifacts directly from controller plus agent HTTP surfaces and write the canonical packet root in one command.

**Requirements:** R1-R8, R12

**Dependencies:** Landed Units 77-79

**Files:**
- Modify: `scripts/milestone/live-transport-follow-up-packet.ts`
- Modify: `package.json`
- Modify: `tests/milestone/live-transport-follow-up-packet.test.ts`

**Approach:**
- Add `capture` CLI parsing alongside `scaffold`, `assemble`, and `validate`.
- Fetch host detail, bootstrap operation, `/health`, `/runtime-state`, and host-scoped audit index from bounded HTTP reads.
- Derive the agent base URL from bootstrap transport summary when no explicit override is provided.
- Reuse shared packet-writing logic for both assemble and capture.
- Permit scaffold-root replacement without `--force`, but refuse non-scaffold overwrite unless `--force` is explicit.

**Test scenarios:**
- Capture CLI parsing accepts controller/host/bootstrap inputs and audit-limit override.
- Capture upgrades a scaffold root into a valid packet using mocked controller plus agent servers.
- Existing non-scaffold packet roots remain protected without `--force`.

**Verification:**
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`

- [x] **Unit 81: Preferred Capture Guidance**

**Goal:** Teach operators to use the new capture helper first while keeping manual/source-based fallback explicit.

**Requirements:** R9, R11

**Dependencies:** Unit 80

**Files:**
- Modify: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Modify: `docs/operations/portmanager-debian-12-review-packet-template.md`

**Approach:**
- Promote `pnpm milestone:capture:live-packet` as the preferred path in both English and Chinese guidance.
- Keep scaffold plus assemble as lower-level fallback when the helper cannot reach controller or agent URLs directly.
- Document overwrite guard behavior so operators know scaffold roots can be replaced but real packet roots stay protected.

**Test scenarios:**
- Guide and template both mention the capture helper.
- Fallback manual path still references scaffold, assemble, and validate commands.
- Wording still says `capture_required` remains truthful until one real packet is committed.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`

- [x] **Unit 82: Roadmap And Developer Progress Retarget**

**Goal:** Shift public and developer-facing progress surfaces from review-delta visibility to capture automation.

**Requirements:** R10-R13

**Dependencies:** Units 80-81

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
- Mark review-delta visibility and execution-tooling groundwork as landed history.
- Point the active Milestone 3 map at the new capture-automation requirements/plan pair.
- Update developer-focus copy so the new preferred next step is `pnpm milestone:capture:live-packet`.
- Keep blocker truth explicit: `container_bridge_transport_substitution`, Docker bridge address `172.17.0.2`, and `capture_required` still remain public reality.

**Test scenarios:**
- Development-progress docs now reference the capture-automation requirements/plan pair.
- Docs-site roadmap and progress copy mention `pnpm milestone:capture:live-packet`.
- Root/docs/spec wording no longer treats review-delta visibility as the active queue.

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
- Do not let capture mutate controller or agent state; keep it read-only.
- Do not let capture overwrite a real packet root silently.
- Do not let roadmap/progress docs keep pointing at a landed review-delta slice as if it were still the active queue.
- Do not narrow support-lock wording while no real committed live packet exists yet.

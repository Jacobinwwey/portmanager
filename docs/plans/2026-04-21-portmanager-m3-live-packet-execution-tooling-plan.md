---
title: PortManager Milestone 3 Live Packet Execution Tooling Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md
---

# PortManager Milestone 3 Live Packet Execution Tooling Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress now puts live-packet discovery into landed history.
The next Milestone 3 slice is narrower.
Public `main` still stays `capture_required` because no real live packet is committed, even though the repo now ships a safe way to scaffold, assemble, and validate the next bounded packet.
This plan keeps that execution tooling, the operator docs, and public progress wording aligned without pretending the live packet already exists.

## Overview
This plan covers the post-discovery Milestone 3 slice.
It keeps filesystem-backed discovery, repaired live-loader parity, blocker visibility, and the preserved Docker-bridge packet as landed history.
It does not fabricate live packet evidence or broaden supported-target claims.
It adds scaffold-marker safety, repo-native packet scaffold plus assembly plus validation helpers, and retargeted developer progress docs.

## Problem Frame
The repo no longer lacks:

- automatic discovery of the newest valid live packet root
- a canonical `live-transport-follow-up-summary.json` contract
- fallback behavior when newer roots are malformed or incomplete
- CLI/Web/contracts/docs parity for `capturedPacketRoot` and `capturedAddress`

It now lacks one safe operator-to-commit workflow that stays documented everywhere and says:

- how to create the canonical live packet root without hand-building files
- how to assemble real source artifacts into the canonical packet root without hand-writing the summary
- how scaffold output stays invalid by design
- how developers can validate the latest packet root before commit
- how progress docs describe the new execution-tooling queue honestly

## Requirements Trace
- R1-R4. Keep invalid-by-design live packet preparation and controller truth conservative.
- R5-R7. Add repo-native packet validation that reuses controller discovery rules.
- R8-R13. Retarget docs, roadmap, and verification around the new active queue.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Discovery truth | `apps/controller/src/second-target-policy-pack.ts` already discovers newest valid live packet roots | Reuse that truth for validator output and reject scaffold markers there too |
| Packet execution workflow | Repo-native scaffold, assemble, and validator helpers now exist | Keep docs, roadmap, and operator guidance aligned to one official workflow |
| Progress docs | Root docs and roadmap surfaces still sound like discovery is the unfinished queue | Shift active-map wording to execution tooling plus real packet capture |
| Support-lock posture | `/second-target-policy-pack` still publishes `review_open`, `capture_required`, and the Docker-bridge blocker honestly | Keep that posture until a validator-passing real packet is committed |

## Key Technical Decisions
- Keep scaffold output under the canonical live packet root and file layout, but mark it explicitly invalid.
- Reject scaffold markers in both the summary file and packet-local artifact files so placeholder content never clears the blocking delta.
- Reuse exported controller packet constants and validator logic from one module instead of duplicating rules in scripts.
- Update public docs to say discovery is landed, tooling is active, and real packet evidence is still missing.

## Implementation Units

- [x] **Unit 77: Scaffold Marker Safety In Controller Truth**

**Goal:** Make scaffold marker files invalid everywhere controller discovery reads live packet roots.

**Requirements:** R3, R6, R11

**Dependencies:** Landed Units 74-76

**Files:**
- Modify: `apps/controller/src/second-target-policy-pack.ts`
- Modify: `apps/controller/src/index.ts`
- Modify: `tests/controller/second-target-policy-pack.test.ts`

**Approach:**
- Export the canonical live packet summary filename, artifact file map, required artifact ids, and scaffold marker field from the second-target policy pack module.
- Add one exported packet validator that reuses the same discovery rules and explicitly rejects scaffold markers.
- Make discovery ignore newer scaffold-marked roots and fall back to the newest valid real packet.

**Test scenarios:**
- Newer scaffold-marked root exists beside an older valid root: older valid root still wins.
- Scaffold-marked summary file with all required fields still fails validation.
- Scaffold-marked artifact files do not clear the blocking delta.

**Verification:**
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts`

- [x] **Unit 78: Repo-Native Live Packet Scaffold, Assembly, And Validation Helpers**

**Goal:** Give developers one safe repo-native path to scaffold, assemble, and audit the next bounded live packet.

**Requirements:** R1-R7, R12

**Dependencies:** Unit 77

**Files:**
- Create: `scripts/milestone/live-transport-follow-up-packet.ts`
- Modify: `package.json`
- Create: `tests/milestone/live-transport-follow-up-packet.test.ts`

**Approach:**
- Add `pnpm milestone:scaffold:live-packet` to create the canonical packet root, README, placeholder JSON files, and invalid summary scaffold.
- Add `pnpm milestone:assemble:live-packet` to copy real source artifacts into the canonical packet filenames, derive `candidateTargetProfileId`, `capturedAt`, and `capturedAddress`, and fail on cross-source address drift.
- Add `pnpm milestone:validate:live-packet` to audit a specific packet root or the latest candidate root against the shared controller validator.
- Keep scaffold output invalid by design until real packet files replace the scaffold markers.

**Test scenarios:**
- Scaffold command creates the canonical file layout and fails validation by design.
- Assemble command writes canonical packet-local files plus a derived summary from real source artifacts.
- Validator reports scaffold-marker, captured-address, and required-artifact blockers.
- Replacing scaffold files with real packet files makes validation pass.

**Verification:**
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`

- [x] **Unit 79: Progress Retarget And Docs Closure**

**Goal:** Mark discovery as landed history, publish the new helper commands, and keep roadmap/progress truth aligned with the still-missing real packet.

**Requirements:** R8-R13

**Dependencies:** Units 77-78

**Files:**
- Modify: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Modify: `docs/operations/portmanager-debian-12-review-packet-template.md`
- Modify: `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md`
- Modify: `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`
- Create: `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md`
- Create: `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`
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
- Mark Units 74 through 76 as landed history.
- Shift the active Milestone 3 map from discovery to execution tooling.
- Teach the new scaffold, assembly, and validation commands in the operator guide and review packet template.
- Keep current-state wording explicit: discovery is landed, helpers exist, `capture_required` remains truthful until a real live packet is committed.

**Test scenarios:**
- Development-progress docs mention the new active requirements/plan pair.
- Milestone component copy mentions scaffold, assembly, and validation commands.
- Follow-up guide and review template both name the helper commands and scaffold-invalid posture.
- Docs generation and build still succeed.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

## Verification
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts`
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `pnpm acceptance:verify`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not let scaffold output or placeholder files clear the blocking delta.
- Do not duplicate controller packet-truth rules in scripts.
- Do not leave roadmap/progress docs pointing at landed discovery work as if it were unfinished.
- Do not narrow support-lock wording while the repo still lacks one committed real live packet.

---
title: PortManager Milestone 3 Live Packet Capture Preflight Plan
type: architecture
status: active
date: 2026-04-22
origin: docs/brainstorms/2026-04-22-portmanager-m3-live-packet-capture-preflight-requirements.md
---

# PortManager Milestone 3 Live Packet Capture Preflight Plan

Updated: 2026-04-22
Version: v0.1.0

## Status Note
Late `2026-04-22` progress already landed review-delta visibility, scaffold -> assemble -> validate tooling, controller-plus-agent capture automation, and controller-side source auto-resolution.
The remaining Milestone 3 repo-native gap is now smaller again.
Operators can already trigger capture with minimal inputs, but they still lack one read-only repo-native preflight that shows whether capture is ready before any packet-writing command runs.

## Overview
This plan treats review adjudication, live-packet discovery, execution tooling, capture automation, source auto-resolution, and roadmap blocker retargeting as landed history.
It adds one bounded read-only preview flow ahead of capture, keeps packet-writing truth unchanged, and updates operator plus docs-site progress surfaces so they point at this narrower queue instead of the already-landed source-auto-resolution slice.

## Problem Frame
The repo no longer lacks:

- an explicit blocking delta for Docker bridge substitution
- newest-valid live packet discovery
- canonical packet filenames and summary layout
- repo-native scaffold, assemble, validate, capture, and source auto-resolution commands

The repo still lacks:

- one read-only preflight command that shows the resolved host/bootstrap pair and whether capture will succeed before writing packet files
- clear operator guidance for preview-before-capture workflow versus direct capture and fallback helpers
- public roadmap/progress wording that says capture preflight, not source auto-resolution, is the active implementation lane

## Requirements Trace
- R1-R7. Add read-only capture preflight without changing packet-writing truth or controller/agent mutation boundaries.
- R8-R10. Retarget operator docs plus roadmap/development-progress wording.
- R11-R12. Add preview coverage and docs verification.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Packet truth | `apps/controller/src/second-target-policy-pack.ts` already validates and discovers newest valid live packet roots | Leave packet-writing truth untouched; preview stays read-only |
| Packet tooling | `capture` already resolves sources and writes canonical packet artifacts | Reuse the same controller-side selection logic in one preview mode before write |
| Operator workflow | Minimal capture command works, but preview visibility is missing | Promote one preflight command before capture and keep explicit overrides/fallback |
| Public progress docs | Active map still says source auto-resolution even though that slice is landed | Move active-map wording to capture preflight |

## Key Technical Decisions
- Keep preview inside `scripts/milestone/live-transport-follow-up-packet.ts`; do not create a second helper file.
- Add a new `preview` action plus `pnpm milestone:preview:live-packet`, not a flag hidden inside capture output.
- Reuse the same source-auto-resolution rules as capture so preview and capture never drift on selected host/bootstrap ids.
- Limit preview to controller-side reads plus derived agent URL inspection; do not query agent `/health` or `/runtime-state`, and do not write packet files.
- Use one explicit readiness verdict plus warnings so operators can see why capture is still blocked.

## Implementation Units

- [ ] **Unit 86: Read-Only Capture Preflight**

**Goal:** Show the exact controller-side capture plan and readiness blockers before packet writing begins.

**Requirements:** R1-R7, R11

**Dependencies:** Landed Units 77-85

**Files:**
- Modify: `scripts/milestone/live-transport-follow-up-packet.ts`
- Modify: `package.json`
- Modify: `tests/milestone/live-transport-follow-up-packet.test.ts`

**Approach:**
- Add `preview` action and npm script.
- Reuse source-auto-resolution plus controller host/bootstrap/audit reads.
- Return packet root, candidate target, host/bootstrap ids, captured address, derived agent URL, audit operation ids, bootstrap-in-audit-window flag, warnings, and readiness verdict.
- Keep explicit host/bootstrap mismatch failure behavior and avoid filesystem writes.

**Test scenarios:**
- Preview CLI parsing accepts minimal controller-side invocation.
- Preview resolves the latest candidate bootstrap pair and reports ready state without writing packet files.
- Preview reports blocked readiness when agent URL or audit window prerequisites are missing.
- Explicit host/bootstrap mismatch still fails clearly.

**Verification:**
- `node --experimental-strip-types --test tests/milestone/live-transport-follow-up-packet.test.ts`

- [ ] **Unit 87: Preview-First Operator Guidance**

**Goal:** Teach operators to run one preview before minimal capture while keeping direct capture and fallback helpers available.

**Requirements:** R8, R10

**Dependencies:** Unit 86

**Files:**
- Modify: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Modify: `docs/operations/portmanager-debian-12-review-packet-template.md`

**Approach:**
- Promote `pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url <url>` as the preferred read-only preflight.
- Keep `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` as the preferred packet-writing path immediately after preview.
- Document readiness blockers, `--candidate-target-profile-id`, explicit ids, `--agent-base-url`, and scaffold/assemble fallback.

**Test scenarios:**
- Guide and template both show preview before minimal capture.
- Both docs still mention explicit ids plus scaffold/assemble fallback.
- Wording still says `capture_required` remains truthful until one real packet is committed.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`

- [ ] **Unit 88: Roadmap And Developer Progress Retarget**

**Goal:** Shift public and developer-facing progress surfaces from source auto-resolution to capture preflight.

**Requirements:** R9-R12

**Dependencies:** Units 86-87

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue`
- Modify: `docs-site/.vitepress/theme/components/RoadmapPage.vue`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Mark source auto-resolution as landed history.
- Point the active Milestone 3 map at the new capture-preflight requirements/plan pair.
- Update developer-focus copy so the next repo-native step is preview first, then capture, then validate.
- Keep blocker truth explicit: `container_bridge_transport_substitution`, Docker bridge address `172.17.0.2`, and `capture_required` still remain public reality until a real packet lands.

**Test scenarios:**
- Development-progress docs now reference the capture-preflight requirements/plan pair.
- Docs-site roadmap and progress copy mention preview-first workflow and bounded overrides.
- Root/docs/spec wording no longer treats source auto-resolution as the active queue.

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
- Do not let preview mutate controller or agent state; it stays read-only.
- Do not let preview and capture drift on host/bootstrap selection logic.
- Do not let public roadmap/progress docs keep pointing at a landed source-auto-resolution slice as if it were still active.
- Do not narrow support-lock wording while no real committed live packet exists yet.

---
title: PortManager Milestone 3 Live Packet Discovery Plan
type: architecture
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md
---

# PortManager Milestone 3 Live Packet Discovery Plan

Updated: 2026-04-21
Version: v0.1.0

## Status Note
Late `2026-04-21` progress now moves Milestone 3 past “make `capture_complete` reachable.”
That reachability is already landed.
The next slice makes one real live packet root discoverable from repo artifacts so public controller truth can move without manual snapshot injection.
This same slice also hardens the live-loader acceptance path that failed remote `main` on `2026-04-22` when a stale `hold` expectation survived after the second-target policy pack moved to `review_required`.

## Overview
This plan covers the post-follow-up Milestone 3 slice.
It keeps blocker visibility, follow-up guide publication, data-driven completion semantics, CLI/Web parity, and repaired `main` CI as landed history.
It does not reopen the earlier review-delta or live-follow-up surface work.
It adds filesystem-backed live packet discovery, standardizes the live packet summary contract, and retargets developer progress docs to the new active queue.

## Problem Frame
The repo no longer lacks:

- top-level `liveTransportFollowUp`
- `capturedPacketRoot` and `capturedAddress`
- a reachable `capture_complete` state
- synced CLI/Web/roadmap wording about preserved Docker-bridge evidence

It now lacks one fully wired public truth path that says:

- where controller discovers a fresh live packet root
- which machine-readable file proves the packet is complete
- how invalid or incomplete fresh packet roots are rejected
- how progress docs describe the new discovery-dependent queue honestly

## Requirements Trace
- R1-R6. Add deterministic filesystem-backed live packet discovery and newest-valid packet selection.
- R7-R9. Clear the blocking delta automatically from discovered live packet evidence and harden live-loader parity tests.
- R10-R14. Standardize the live packet summary layout, retarget active-map docs, and keep CI green.

## Current Architecture Deep Compare

| Concern | Current verified base | Next move |
| --- | --- | --- |
| Live follow-up surface | `apps/controller/src/second-target-policy-pack.ts` already models `capturedPacketRoot`, `capturedAddress`, and completion validation helpers | Move those helpers from manual snapshot-only inputs to default artifact discovery |
| Public controller truth | `apps/controller/src/controller-server.ts` still serves `buildSecondTargetPolicyPack(createDefaultSecondTargetPolicySnapshot())` | Replace preserved-only defaults with snapshot construction that can discover fresh live packet artifacts |
| Packet artifact contract | Preserved bootstrap packet already uses stable top-level summaries like `packet-ready-policy-pack.json` and section summaries | Introduce one equally explicit live packet summary file instead of README-only discovery |
| Acceptance parity | `tests/web/live-controller-shell.test.ts` now matches `review_required` after the repaired remote CI failure | Keep that parity locked while adding discovery-backed completion coverage |
| Progress docs | Root docs and roadmap surfaces already explain data-driven `capture_complete` semantics | Retarget the active direction from “follow-up surface” to “live packet discovery” so docs stop sounding one slice behind |

## Key Technical Decisions
- Keep the preserved bounded packet immutable and separate from all live packet roots.
- Use one canonical summary file under each live packet root, rather than deriving truth from arbitrary filenames or timestamps.
- Discover live packet roots from repo artifacts at snapshot-construction time, not at render time in CLI/Web.
- Treat the newest valid live packet root as authoritative; incomplete or invalid newer roots must fall back to the newest valid root or to preserved `capture_required` truth.

## Implementation Units

- [ ] **Unit 74: Live Packet Summary Contract And Discovery Helper**

**Goal:** Teach controller default second-target truth to discover one newest valid live packet root from `docs/operations/artifacts/debian-12-live-tailscale-packet-*`.

**Requirements:** R1-R6, R13

**Dependencies:** Landed Units 72-73

**Files:**
- Modify: `apps/controller/src/second-target-policy-pack.ts`
- Modify: `apps/controller/src/controller-server.ts`
- Modify: `tests/controller/second-target-policy-pack.test.ts`
- Modify: `tests/web/live-controller-shell.test.ts`

**Approach:**
- Add one repo-relative live packet summary filename and parser near the second-target policy pack helpers.
- Build default snapshot state from preserved packet truth plus discovered newest-valid live packet evidence.
- Require all five live follow-up artifact ids, a non-Docker-bridge captured address, and referenced packet files before clearing the blocking delta.
- Keep incomplete latest packet roots from overriding the newest valid root.

**Patterns to follow:**
- `apps/controller/src/second-target-policy-pack.ts`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/packet-ready-policy-pack.json`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`

**Test scenarios:**
- No live packet roots present: state stays `capture_required`.
- One valid live packet root present: state becomes `capture_complete`, captured root/address surface, blocking delta clears.
- Newest root incomplete but older valid root exists: newest valid root still wins.
- Latest root reports `172.17.0.2`: completion stays blocked.
- Live loader acceptance path reflects `review_required` plus discovery-backed follow-up truth.

**Verification:**
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts`
- `node --experimental-strip-types --test tests/web/live-controller-shell.test.ts`

- [ ] **Unit 75: Live Packet Docs Contract And Progress Sync**

**Goal:** Standardize live packet file layout, retarget active-map docs, and keep public roadmap/progress truth aligned with discovery-backed completion.

**Requirements:** R7-R12, R14

**Dependencies:** Unit 74

**Files:**
- Modify: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
- Modify: `docs/operations/portmanager-debian-12-review-packet-template.md`
- Create: `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md`
- Create: `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs/specs/portmanager-toward-c-strategy.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs-site/data/roadmap.ts`
- Modify: `tests/docs/development-progress.test.mjs`

**Approach:**
- Define the live packet summary filename, required fields, and minimum file layout in the guide and review packet template.
- Shift active-map references from the landed live-follow-up surface pair to the new live-packet-discovery pair.
- Keep current-state wording explicit: completion semantics landed, CI parity repaired, default public truth still waits for a valid discovered live packet.

**Patterns to follow:**
- `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md`
- `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`
- `docs-site/data/roadmap.ts`

**Test scenarios:**
- Development-progress docs mention the new active requirements/plan pair.
- Roadmap copy explains data-driven completion is landed but discovery is still the queue.
- Live capture guide names the canonical summary filename.
- Publishing and locale generation still succeed after retargeting docs.

**Verification:**
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

- [ ] **Unit 76: Mainline Acceptance Verification Closure**

**Goal:** Re-run the same mainline acceptance chain that failed on remote `main` and leave branch plus docs tree clean.

**Requirements:** R9, R14

**Dependencies:** Units 74-75

**Files:**
- Modify: `tests/web/live-controller-shell.test.ts`
- Modify: any files from Units 74-75 that still drift under acceptance verification

**Approach:**
- Run the full `pnpm acceptance:verify` chain locally after targeted tests are green.
- Fix only the remaining drift revealed by the full chain.
- Keep the branch clean after docs regeneration and generated contract updates.

**Test scenarios:**
- `pnpm acceptance:verify` passes from a clean checkout.
- `git diff --check` passes after docs and contract regeneration.
- `git status --short --branch` shows a clean tree before shipping.

**Verification:**
- `pnpm acceptance:verify`
- `git diff --check`
- `git status --short --branch`

## Verification
- `node --experimental-strip-types --test tests/controller/second-target-policy-pack.test.ts tests/web/live-controller-shell.test.ts`
- `node --experimental-strip-types --test tests/docs/development-progress.test.mjs tests/docs/publishing.test.mjs`
- `pnpm acceptance:verify`
- `git diff --check`
- `git status --short --branch`

## Risks / Guards
- Do not let incomplete or malformed live packet roots clear the blocking delta.
- Do not move discovery logic into CLI/Web-only code paths that diverge from controller truth.
- Do not let the old live-follow-up pair remain marked active after this discovery pair lands.
- Do not weaken support-lock wording while the discovered packet still has not replaced the blocker on `main`.

---
date: 2026-04-21
topic: portmanager-m3-live-packet-execution-tooling
---

# PortManager Milestone 3 Live Packet Execution Tooling Requirements

Status note on `2026-04-21`: deep comparison now shows the live-packet-discovery slice is landed, and the repo now ships one scaffold -> assemble -> validate helper workflow for the next bounded packet. `/second-target-policy-pack` auto-discovers the newest valid live packet root, invalid newer roots no longer win, the canonical `live-transport-follow-up-summary.json` contract is frozen, and remote `main` CI parity is green again. Public `main` still stays `capture_required`, though, because no committed live Tailscale packet exists yet.

## Problem Frame
Current repo truth is already past “make discovery real”:

- controller default truth now inspects `docs/operations/artifacts/debian-12-live-tailscale-packet-*`
- guide and review template now freeze the canonical live packet summary layout
- CLI, Web, contracts, roadmap data, and tests already expose `capturedPacketRoot` and `capturedAddress`
- repaired live-loader parity already keeps remote `main` green after the stale `hold` expectation moved to `review_required`

That leaves one narrower but still-blocking gap.
Operators no longer need to handcraft packet roots or hand-write the packet summary, but the active Milestone 3 slice still has to freeze one official scaffold -> assemble -> validate workflow everywhere the repo describes current progress.
Without that single official path, helper tooling can drift from operator docs, roadmap copy, and public progress wording even though Units 74 through 76 are already landed history.

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Filesystem-backed discovery should drive controller truth automatically | `createDefaultSecondTargetPolicySnapshot()` now discovers the newest valid live packet root and falls back when newer roots are incomplete | Landed | Keep discovery logic as one shared truth source |
| Invalid newer roots must not clear the blocking delta | Incomplete roots, Docker-bridge addresses, and malformed packet summaries no longer win | Landed | Extend the same guard to scaffold marker files |
| Progress docs should stop pointing at older live-follow-up work | Active docs already moved from follow-up publication to discovery | Landed | Move them again so discovery stops sounding like unfinished work |
| Developers should have one safe path from empty packet root to valid packet commit | Scaffold, assemble, and validator helpers now exist; packet roots and summaries no longer need hand-built layout guesses | Landed | Keep docs and progress wording aligned to the same official workflow until a real packet is committed |

## Requirements

**Safe Packet Preparation**
- R1. PortManager must ship one repo-native scaffold helper that creates `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/` with the canonical summary filename, packet-local JSON file layout, and one packet-local README.
- R2. PortManager must ship one repo-native assembly helper that copies real source artifacts into the canonical packet-local filenames, derives summary fields from those artifacts, and rejects cross-source address drift.
- R3. Scaffold output must stay invalid by design until real evidence replaces it; scaffold markers in the summary file or packet-local JSON files must never clear `/second-target-policy-pack.liveTransportFollowUp.state`.
- R4. The preparation helpers must keep the preserved Docker-bridge packet immutable and must not overwrite an existing live packet root unless a developer deliberately forces it.

**Repo-Native Validation**
- R5. PortManager must ship one repo-native validator helper that audits either a specific live packet root or the latest candidate root and reports exact blocker reasons against the same controller truth rules.
- R6. Validation must at minimum catch missing or malformed summary files, missing required artifact ids, missing packet-local files, preserved Docker-bridge address reuse, wrong candidate target ids, remaining scaffold markers, and cross-source assembly drift.
- R7. Once all scaffold markers are replaced with real evidence and the packet satisfies the existing discovery contract, the validator must pass and controller default truth must treat that packet as eligible live evidence.

**Docs And Progress Sync**
- R8. README, TODO, `Interface Document.md`, roadmap/progress docs, product spec, Toward C strategy, milestone spec, and docs-site roadmap data must mark Units 74 through 76 as landed history and switch the active Milestone 3 map to this execution-tooling pair.
- R9. `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` must teach the scaffold, assembly, and validation commands while still stating that public `main` remains `capture_required` until a real packet is committed.
- R10. Development-progress copy must explain the exact current posture honestly: discovery is landed, helper commands are available, scaffold roots remain invalid until assembly writes real evidence, and broader support stays locked until one real live packet replaces the blocker.

**Regression Coverage**
- R11. Controller tests must prove scaffold-marked packet roots are ignored even when they are newer than a valid packet.
- R12. Milestone tooling tests must cover scaffold creation, assembly from real source artifacts, validator failure on scaffold output, and validator success after real packet replacement.
- R13. Docs regressions and acceptance verification must keep the new active-map pair, command names, and public progress wording aligned.

## Success Criteria
- A developer can run one repo-native scaffold command and get the canonical packet file layout without accidentally clearing the blocker.
- The same developer can run one repo-native assembly command to copy real source artifacts into that layout and derive the canonical summary without hand-writing it.
- The same developer can run one repo-native validation command and get precise blocker reasons before commit.
- Replacing scaffold files with real live packet evidence makes the validator pass and makes the packet eligible for controller discovery without hidden runtime flags.
- Public docs, roadmap, and development-progress pages all describe the same current truth: discovery is landed, execution tooling is now active, and support remains locked until a real live packet lands.

## Scope Boundaries
- Do not fabricate or commit fake live Tailscale evidence.
- Do not automate SSH, host capture, Tailscale enrollment, or controller execution in this slice.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.
- Do not reopen gateway split, standalone deployment, or PostgreSQL default-store debates here.

## Key Decisions
- Treat scaffold markers as explicit invalid state, not as “almost real” evidence.
- Reuse controller validation rules for the helper instead of creating a parallel packet-truth implementation.
- Keep the preserved Docker-bridge packet immutable as historical evidence.
- Keep roadmap and progress docs conservative until a real packet root is committed.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` remains the operator-facing capture guide.
- `docs/operations/portmanager-debian-12-review-packet-template.md` remains the contract source for the live packet file layout.
- Discovery in `apps/controller/src/second-target-policy-pack.ts` remains the public truth source for what counts as a valid live packet.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md` for the implementation units that keep scaffold-marker safety, the repo-native scaffold -> assemble -> validate workflow, and the next truthful roadmap retarget.

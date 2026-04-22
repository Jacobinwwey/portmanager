---
date: 2026-04-21
topic: portmanager-m3-live-packet-discovery
---

# PortManager Milestone 3 Live Packet Discovery Requirements

Status note on `2026-04-21`: this slice is now landed. `/second-target-policy-pack` auto-discovers the newest valid `docs/operations/artifacts/debian-12-live-tailscale-packet-*` root, ignores incomplete or scaffold-marked newer roots, clears the blocking delta only from real live evidence, and remote `main` CI parity stays repaired after the stale live-loader expectation was corrected. The next gap now shifts from discovery to safe execution: public `main` still stays `capture_required` because no real live packet is committed yet, and developers now rely on repo-native scaffold -> assemble -> validate helpers before bounded live capture can move honestly.

## Problem Frame
Current repo truth has already moved past “make live follow-up visible”:

- the preserved bounded Debian 12 packet remains fixed at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- `/second-target-policy-pack.liveTransportFollowUp` already publishes `capture_required` by default and can publish `capture_complete`
- `capturedPacketRoot` and `capturedAddress` now exist on the contract surface
- CLI, Web, contracts, roadmap data, and progress copy already explain that the preserved Docker-bridge packet stays historical evidence

That leaves one smaller but blocking gap.
Operators can follow `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and place artifacts under a fresh root, but controller default truth never discovers those files on its own.
As long as discovery stays manual-only, public `main` cannot become honestly `capture_complete` from real repo evidence.

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Blocking-delta visibility must be explicit | `/second-target-policy-pack.reviewAdjudication.blockingDeltas` already keeps `container_bridge_transport_substitution` explicit with Docker bridge address `172.17.0.2` | Landed | Do not reopen blocker-visibility work |
| `capture_complete` must become real rather than unreachable | `liveTransportFollowUp.state` now reaches `capture_complete` when fresh packet fields are present in the snapshot | Landed | Replace manual test-only inputs with filesystem-backed discovery |
| CLI, Web, contracts, and roadmap must show captured live packet evidence | `capturedPacketRoot` and `capturedAddress` now flow across those surfaces | Landed | Keep parity, do not regress the surfaced fields |
| One fresh live packet under `docs/operations/artifacts/debian-12-live-tailscale-packet-*` should drive controller truth automatically | No runtime path reads any fresh live packet root; `createDefaultSecondTargetPolicySnapshot()` still returns preserved-packet-only defaults and `apps/controller/src/controller-server.ts` still serves that default snapshot directly | Missing | Add one canonical live packet manifest plus discovery path |

## Requirements

**Filesystem-Backed Live Packet Discovery**
- R1. Controller default second-target truth must inspect `docs/operations/artifacts/` for candidate roots matching `debian-12-live-tailscale-packet-*`.
- R2. Each candidate live packet root must contain one canonical machine-readable summary file that controller can parse without inference from prose alone.
- R3. That summary file must name `candidateTargetProfileId`, `capturedAddress`, `requiredArtifactIds`, and packet-local source files used to prove live follow-up completion.
- R4. Discovery must mark `liveTransportFollowUp.state: capture_complete` only when all five required live follow-up artifact ids are present, `capturedAddress` is non-empty, and `capturedAddress` is not `172.17.0.2`.
- R5. Discovery must keep `capture_required` when the newest candidate root is incomplete or invalid; incomplete fresh roots must not silently mask the preserved blocking truth.
- R6. When multiple valid live packet roots exist, controller must choose the newest valid root deterministically and surface it as `capturedPacketRoot`.

**Review Adjudication And Surface Parity**
- R7. Once one valid live packet root is discovered, `/second-target-policy-pack.reviewAdjudication.blockingDeltas` must clear `container_bridge_transport_substitution` automatically while keeping preserved packet history explicit in `summary` and `sources`.
- R8. CLI text, Web live loaders, and Web shell cards must expose the discovered `capturedPacketRoot`, `capturedAddress`, and cleared blocking-delta posture without manual fixture drift.
- R9. Tests must lock the live-loader parity path that failed remote `main` CI on `2026-04-22`, so stale `hold` assumptions cannot silently return.

**Docs And Progress Sync**
- R10. `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` must specify the canonical summary filename and the minimum packet file layout for live packet discovery.
- R11. README, TODO, `Interface Document.md`, roadmap/progress docs, product spec, Toward C strategy, milestone spec, and docs-site roadmap data must point at one new live-packet-discovery requirements/plan pair as the active Milestone 3 map.
- R12. Those progress surfaces must explain the exact current state honestly: data-driven completion is landed, remote `main` CI parity is repaired, but default public truth still stays `capture_required` until one valid filesystem-backed live packet appears.

**Regression Coverage**
- R13. Controller tests must cover valid discovery, invalid latest packet fallback, incomplete packet rejection, and deterministic newest-valid selection.
- R14. Web live-loader tests, docs regressions, and acceptance verification must cover the updated discovery truth and current-direction docs so `mainline-acceptance` cannot drift again.

## Success Criteria
- A developer can drop one valid live packet under `docs/operations/artifacts/debian-12-live-tailscale-packet-*` and see `/second-target-policy-pack.liveTransportFollowUp.state` move to `capture_complete` without hand-editing snapshot fields.
- Invalid or incomplete live packet roots do not clear the blocking delta.
- CLI, Web, docs, roadmap, and progress surfaces all describe the same current truth and the same next direction.
- Broader support claims remain locked until real live packet discovery proves the blocker is replaced.

## Scope Boundaries
- Do not mutate the preserved bootstrap packet in place.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.
- Do not automate host capture, SSH orchestration, or Tailscale enrollment in this slice.
- Do not reopen gateway-split, standalone deployment, or PostgreSQL default-store discussions here.

## Key Decisions
- Keep discovery filesystem-backed and repo-local so public `main` truth comes from committed artifacts rather than hidden runtime flags.
- Add one canonical live packet summary file instead of inferring completion from arbitrary file names or README prose.
- Keep newest-valid packet selection deterministic and conservative.
- Keep the preserved Docker-bridge packet immutable as historical evidence even after live packet discovery lands.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` remains the operator-facing capture workflow.
- `apps/controller/src/controller-server.ts` still serves `buildSecondTargetPolicyPack(createDefaultSecondTargetPolicySnapshot())` for public truth.
- `liveTransportCaptureArtifactRoot`, `liveTransportCapturedAddress`, and `liveTransportCapturedArtifactIds` already exist in `apps/controller/src/second-target-policy-pack.ts`, but today they are only exercised through direct snapshot construction in tests.

## Next Steps
- Move to `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md` for the follow-on slice that adds invalid-by-design packet scaffolds, repo-native validation commands, and the next truthful progress-doc retarget.

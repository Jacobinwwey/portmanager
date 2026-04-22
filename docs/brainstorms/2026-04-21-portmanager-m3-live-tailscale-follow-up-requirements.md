---
date: 2026-04-21
topic: portmanager-m3-live-tailscale-follow-up
---

# PortManager Milestone 3 Live Tailscale Follow-Up Requirements

Status note on `2026-04-21`: deep comparison now shows the review-delta slice is already landed. `/second-target-policy-pack` already exposes `review_open`, pending adjudication verdicts, blocking delta `container_bridge_transport_substitution`, and the preserved Docker bridge address `172.17.0.2`. The remaining gap is narrower and more actionable: developers still need one first-class public lane that says exactly how to replace that preserved Docker-bridge evidence with one fresh live-Tailscale bounded packet.

## Problem Frame
Current repo truth has already moved past broad “review delta” language:

- the preserved Debian 12 packet already lives at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- `/second-target-policy-pack.reviewAdjudication` already exposes `review_open`, pending verdicts, and blocking delta `container_bridge_transport_substitution`
- docs already say broader support remains locked because the packet still uses Docker bridge address `172.17.0.2`
- CLI text and Web review surfaces already show why review remains blocked

That leaves one smaller gap.
Developers can see the blocker, but they still do not get one explicit public next-lane surface that says:

- live follow-up is now required
- the preserved packet must remain historical evidence
- the next packet must land under a fresh artifact root
- one concrete follow-up guide and artifact checklist drive the remaining work

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Review-open truth must become explicit | `/second-target-policy-pack.reviewAdjudication.state` already reports `review_open` | Landed | Do not keep calling “open review” the missing slice |
| Blocking review delta must become explicit | `container_bridge_transport_substitution` already names Docker bridge address `172.17.0.2` as the blocker | Landed | Pivot from blocker visibility to blocker resolution workflow |
| Public docs must keep support locked honestly | Docs already keep Ubuntu as the only supported target | Landed | Add one public follow-up lane that explains how the blocker can be replaced with bounded live evidence |
| Developers should know the next packet root and artifact checklist | No current top-level follow-up surface yet says where fresh live packet evidence should land | Missing | Publish one live follow-up contract plus one capture guide |

## Requirements

**Live Follow-Up Contract Surface**
- R1. `/second-target-policy-pack` must publish a top-level `liveTransportFollowUp` object with `state`, `candidateTargetProfileId`, `guidePath`, `artifactRootPattern`, `currentRecordedAddress`, `summary`, `requiredNextAction`, `requiredArtifacts`, and `sources`.
- R2. When bounded review is open and `container_bridge_transport_substitution` remains blocking, `liveTransportFollowUp.state` must be `capture_required`.
- R3. `liveTransportFollowUp.guidePath` must be `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`, and `artifactRootPattern` must be `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`.
- R4. `liveTransportFollowUp.requiredArtifacts` must explicitly list the five bounded captures needed for one fresh live packet: candidate host detail with Tailscale IP, bootstrap operation with Tailscale transport, steady-state health, steady-state runtime state, and one linked controller audit reference.
- R5. `liveTransportFollowUp` may be `deferred` only when review is not yet open, and may become `capture_complete` only after the blocking transport delta is no longer active.

**CLI, Web, And Contract Parity**
- R6. Generated OpenAPI and TypeScript contracts must include the new `liveTransportFollowUp` schema and nested artifact enums.
- R7. CLI text and Web second-target review cards must expose the same guide path, artifact root pattern, current recorded address, required next action, and required artifact checklist.
- R8. Summary wording must explain that the preserved Docker-bridge packet stays historical evidence and the new live packet must land under a fresh root instead of mutating the old packet.

**Docs And Progress Sync**
- R9. The second-target review contract, Debian 12 operator ownership note, Debian 12 acceptance recipe, README, TODO, Interface Document, roadmap docs, product spec, Toward C strategy, architecture doc, and roadmap/development-progress page must all point at one new live-Tailscale-follow-up requirements/plan pair as the active Milestone 3 map.
- R10. Those docs must also mention the new follow-up guide path and the fresh artifact root pattern so developers do not need to infer them from controller code.

**Regression Coverage**
- R11. Controller, CLI, Web, and contract-generation tests must lock the new `liveTransportFollowUp` surface.
- R12. Docs regression must lock the new requirements/plan pair, the live follow-up guide path, and the roadmap/development-progress wording so the page update cannot silently drift again.

## Success Criteria
- `/second-target-policy-pack`, generated contracts, CLI text, and Web all expose the same live follow-up truth.
- Developers can read one guide path and one fresh artifact-root pattern directly from public controller truth.
- Docs and roadmap/progress pages all agree that the preserved Docker-bridge packet stays historical evidence and the next bounded queue is live-Tailscale follow-up.
- Broader support claims remain locked until one fresh live packet replaces the blocker or review explicitly stays locked.

## Scope Boundaries
- Do not mutate the preserved packet files in place.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.
- Do not reopen already-landed review-adjudication or review-delta contract work.
- Do not invent a gateway split, standalone audit service, or PostgreSQL default-store claim inside this slice.

## Key Decisions
- Keep the new follow-up surface top-level as `liveTransportFollowUp` instead of nesting it deeper under `reviewAdjudication`.
- Keep the preserved Docker-bridge packet immutable and treat it as historical evidence.
- Publish one fresh artifact root pattern instead of overwriting the old packet root.
- Use one dedicated live follow-up guide so roadmap, docs, CLI, Web, and controller all point at the same next action.

## Dependencies / Assumptions
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md` remains the canonical historical packet summary.
- `container_bridge_transport_substitution` remains the only live blocking transport delta until new bounded evidence says otherwise.
- Milestone 2 review helpers remain the wording-truth guardrail while this Milestone 3 slice lands.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md` for the implementation units that finish docs, roadmap, generated pages, and verification around `liveTransportFollowUp`.

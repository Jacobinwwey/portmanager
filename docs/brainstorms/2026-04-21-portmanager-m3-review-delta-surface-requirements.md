---
date: 2026-04-21
topic: portmanager-m3-review-delta-surface
---

# PortManager Milestone 3 Review Delta Surface Requirements

Status note on `2026-04-21`: deep comparison now shows Units 63 through 71 are already landed, `/second-target-policy-pack` already reports `review_open`, and pending adjudication verdicts are already explicit. The remaining gap is narrower than “review adjudication” in general. The repo still lacks one truthful public surface for the only concrete review-found delta that current packet evidence already preserves: the Debian 12 packet still uses Docker bridge address `172.17.0.2` instead of live Tailscale transport.

## Problem Frame
Current repo truth has advanced again:

- the bounded Debian 12 packet is already preserved at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- `/second-target-policy-pack` already publishes `review_required`, `packet_ready`, `review_open`, and pending verdicts
- contract docs already say review-found deltas must be explicit and blocking
- the preserved packet README plus capture summaries already say local Docker bridge evidence replaced live Tailscale transport

That leaves one smaller but sharper Milestone 3 gap.
Developers can read the drift note only by opening artifact files directly.
The live controller contract, CLI text output, web cards, roadmap, and progress pages still do not expose the blocking delta itself as first-class review truth.

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Review adjudication must open once packet evidence is complete | `/second-target-policy-pack` already exposes `review_open` plus pending verdicts | Adjudication-open truth landed | Do not keep calling “open review” the missing slice |
| Review-found deltas should be explicit and blocking | Packet README plus capture summaries already preserve one concrete delta: Docker bridge address `172.17.0.2` replaced live Tailscale transport | Delta exists in artifacts | Surface the delta on the live contract instead of burying it in packet files |
| Support lock must remain honest while bounded review stays open | Ubuntu remains the only supported target, and the packet itself says broader support stays locked | Lock still works | Public surfaces must show why support still stays locked, not only that it stays locked |
| Developer progress pages should point at the actual remaining queue | Roadmap prose still says “review adjudication plus review-found delta” in broad terms | Direction is close but still fuzzy | Retarget active-map wording to the explicit delta-surface slice |

## Requirements

**Review Delta Contract Surface**
- R1. `/second-target-policy-pack.reviewAdjudication` must publish a `blockingDeltas` array with delta id, state, summary, required follow-up, and sources.
- R2. The default review-open packet must publish one blocking delta for the preserved Docker bridge transport substitution, using the existing packet evidence that shows address `172.17.0.2`.
- R3. `blockingDeltas` may be non-empty only when the packet evidence or docs contract already preserve a real review-found delta; when review is not open, the array must be empty.

**CLI, Web, And Contract Parity**
- R4. Generated OpenAPI and TypeScript contracts must include the new review-delta schema.
- R5. CLI and web review-adjudication output must show blocking deltas with required follow-up, not only pending verdicts.
- R6. Summary and next-action wording must acknowledge that bounded review remains open while the live-Tailscale follow-up delta stays unresolved.

**Docs And Progress Sync**
- R7. The second-target review contract and Debian 12 operator-ownership docs must both name the current blocking delta and keep support locked until that follow-up resolves.
- R8. Roadmap, development-progress, README, TODO, Interface Document, product spec, and Toward C strategy docs must point at one new review-delta-surface requirements/plan pair as the active Milestone 3 map.

**Regression Coverage**
- R9. Controller, CLI, web, and contract-generation tests must lock the new `blockingDeltas` surface.
- R10. Docs regression must lock the new active-map pair plus explicit container-bridge delta wording so drift cannot hide the real blocker again.

## Success Criteria
- `/second-target-policy-pack`, CLI, web, and generated contracts all expose the same blocking review delta.
- The explicit delta names Docker bridge substitution and required live-Tailscale follow-up.
- Contract docs and roadmap/progress docs agree that support remains locked because the current preserved packet is still Docker-bridge-only.
- Developers can see the concrete remaining blocker without opening packet artifact files first.

## Scope Boundaries
- Do not mutate the preserved packet files just to mirror the new contract surface.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.
- Do not invent a broader second-target abstraction, gateway deployment path, or PostgreSQL default backend path.
- Do not silently mark the current delta resolved without a new bounded packet or explicit rejection evidence.

## Key Decisions
- Treat the Docker-bridge transport substitution as the first concrete review-found delta worth surfacing.
- Keep the delta inside `reviewAdjudication` instead of adding another top-level route or pack.
- Use explicit `requiredFollowUp` wording so CLI, web, and docs share one next action.
- Retarget current-direction docs from broad adjudication language to the concrete review-delta surface.

## Dependencies / Assumptions
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md` remains the canonical packet-level drift note.
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-capture-summary.json`, `steady-state-capture-summary.json`, `diagnostics-capture-summary.json`, and `rollback-capture-summary.json` remain preserved evidence for the Docker bridge substitution.
- Milestone 2 review helpers remain the wording-truth guardrail and do not get bypassed by this slice.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-review-delta-surface-plan.md` for the implementation units that add `blockingDeltas`, sync CLI/web/contracts, and retarget roadmap/progress docs to the explicit transport delta.

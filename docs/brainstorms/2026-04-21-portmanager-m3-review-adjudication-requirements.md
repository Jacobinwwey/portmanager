---
date: 2026-04-21
topic: portmanager-m3-review-adjudication
---

# PortManager Milestone 3 Review Adjudication Requirements

Status note on `2026-04-21`: deep comparison now shows Units 63 through 69 are already landed, the preserved Debian 12 packet exposes guide coverage `6/6` and artifact coverage `20/20`, and `/second-target-policy-pack` already reports `decisionState: review_required`. The gap is no longer packet capture. The gap is stale wording plus one missing public adjudication surface that tells developers which verdicts remain before bounded review can close.

## Problem Frame
Current repo truth has narrowed again:

- controller, CLI, web, roadmap, and development-progress surfaces already expose the preserved Debian 12 packet
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` already preserves the packet root that current review must adjudicate
- broader support still stays locked to `ubuntu-24.04-systemd-tailscale`
- some code and docs still say “open review” or “review-prep only” even though bounded review is already open from the preserved packet

That drift creates a new Milestone 3 gap.
Developers need one truthful post-packet posture that does four things at once:

- keeps Milestone 2 review helpers and public counters as the guardrail bundle
- says clearly that bounded second-target review is open now because packet evidence is already complete
- publishes the pending review verdicts and source surfaces through `/second-target-policy-pack`
- keeps broader support locked until review adjudication resolves those verdicts and any review-found delta

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Milestone 3 next needs packet capture | `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` already preserves one bounded review packet and `/second-target-policy-pack` already reports `packet_ready` plus `review_required` | Packet capture complete | Do not keep pointing the active map at packet-capture work |
| Review may open only after guide and artifact coverage are real | Coverage is already real at `6/6` and `20/20` | Review gate crossed | Public wording must switch from “open review” to “adjudicate review” |
| Candidate host guardrails should stay narrow | Candidate create/probe/bootstrap plus one bounded live steady-state mutation are still the only allowed non-support actions | Guardrail still needed | Host-rule messaging must say bounded-review only, not older review-prep-only language |
| Progress docs should tell developers what remains after Units 63 through 69 | Some pages already describe adjudication as next, but current-direction links and contract docs still point at the older readiness slice | Drift detected | Land a new requirements/plan pair and retarget roadmap/progress links to it |

## Requirements

**Review Adjudication Surface**
- R1. `/second-target-policy-pack` must publish a `reviewAdjudication` block that states review state, review owner, candidate target, contract path, packet root, pending verdicts, and supporting sources.
- R2. `reviewAdjudication.state` may be `review_open` only when `decisionState` is `review_required` and review-packet readiness is `packet_ready`.
- R3. Pending verdicts must explicitly name packet integrity, drift acknowledgement, support-lock confirmation, operator sign-off, and follow-up-scope bounding.

**Wording And Guardrail Sync**
- R4. Review-required summary and next-action wording must say bounded review is already open and now needs adjudication.
- R5. Candidate-host guardrails must say bounded-review only while broader support remains locked to Ubuntu.
- R6. The second-target review contract and Debian 12 operator-ownership docs must both describe the current posture as open bounded review, not review-prep-only or pre-open review.

**Developer Progress Sync**
- R7. Roadmap, development-progress, and root progress docs must point developers at one new adjudication requirements/plan pair as the active Milestone 3 map.
- R8. Public progress surfaces must describe Units 63 through 69 as landed history and second-target review adjudication as the remaining bounded queue.

**Regression Coverage**
- R9. Generated contracts, CLI text output, web cards, and docs regression tests must all lock the new `reviewAdjudication` truth surface.
- R10. Future drift must not silently move wording back to “packet capture next,” “review not open yet,” or “candidate already supported.”

## Success Criteria
- `/second-target-policy-pack`, CLI, web, and generated contracts all expose the same adjudication block.
- Review-ready wording consistently says “adjudicate bounded second-target review” instead of “open review.”
- Contract docs and operator docs agree that support remains locked while review adjudication stays open.
- Roadmap and development-progress pages link to this adjudication slice as the active current direction.

## Scope Boundaries
- Do not claim `debian-12-systemd-tailscale` is a supported target.
- Do not remove the preserved packet or rewrite it as if it were only a draft artifact.
- Do not invent a broader second-target abstraction, standalone gateway deployment, or PostgreSQL backend path.
- Do not replace the Milestone 2 confidence and wording-review helper flow.
- Do not silently resolve review verdicts without explicit docs or evidence updates.

## Key Decisions
- Treat packet capture as completed history and move the live truth surface to review adjudication.
- Reuse `/second-target-policy-pack` as the canonical adjudication surface instead of adding another controller route.
- Keep verdicts pending by default even when review is open; broader support stays locked until humans close those verdicts deliberately.
- Retarget current-direction docs rather than leaving roadmap pages on an already completed packet-readiness slice.

## Dependencies / Assumptions
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` remains the preserved packet root for current review.
- `docs/operations/portmanager-second-target-review-contract.md` and `docs/operations/portmanager-debian-12-operator-ownership.md` remain the canonical wording guardrails.
- Existing Milestone 2 confidence helper flows remain the review-entry guardrail for public wording.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-review-adjudication-plan.md` for the implementation units that land the adjudication surface, wording sync, and roadmap retargeting.

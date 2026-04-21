---
date: 2026-04-21
topic: portmanager-m3-review-packet-readiness
---

# PortManager Milestone 3 Review-Packet Readiness Requirements

Status note on `2026-04-21`: deep comparison now shows Milestone 3 `Phase 0 enablement` is already past entry. Units 51 through 62 are landed, the Debian 12 review-prep guide set is complete, and `/second-target-policy-pack` already keeps support locked to `ubuntu-24.04-systemd-tailscale`. The gap is no longer missing guide documents. The gap is missing one public, contract-backed truth surface for review-packet execution state, artifact coverage, and the next bounded units after the guide set.

## Problem Frame
Current repo truth has changed again:

- the controller, CLI, web, docs-site, and roadmap already publish the bounded second-target policy posture
- the Debian 12 review-prep governance slice already freezes the docs contract, acceptance recipe, operator ownership note, review-packet template, and five proof-capture guides
- the candidate-host create/probe/bootstrap review-prep lane is already real, but no committed code path tells developers whether the repo is only guide-complete, partly packet-captured, or actually packet-ready
- current progress docs still talk as if the main next step is landing the guide set itself, even though that guide set is already present

That creates a new Milestone 3 gap.
Developers need one truthful post-guide posture that does four things at once:

- keeps Milestone 2 wording and confidence review helpers as the guardrail bundle
- states clearly that the review-packet guide set is complete, but execution artifact coverage is still missing
- publishes the next bounded Unit 63 through Unit 69 queue without pretending parity is already proven
- preserves the existing second-target hold posture until one real Debian 12 review packet exists

## Comparison Against Prior Milestone 3 Expectations

| Prior expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Milestone 3 first needs candidate-target docs, acceptance recipe, and proof guides | `docs/operations/portmanager-second-target-review-contract.md`, `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-operator-ownership.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and five proof guides are already landed | Guide set complete | Do not keep calling the guide set the next missing slice |
| `/second-target-policy-pack` should keep support claims locked to Ubuntu while one Debian 12 candidate stays review-prep only | Controller, CLI, web, and roadmap already publish that hold posture | Landed guardrail | Next work should deepen review-packet execution truth, not re-open target-policy wording |
| Candidate-host create/probe/bootstrap may start evidence collection without widening supported-target claims | That bounded review-prep lane is now real | Partial execution baseline landed | Next phase should show capture readiness and artifact coverage instead of acting as if the lane itself is still hypothetical |
| Public docs should tell developers what comes next after Units 51 through 62 | Root docs and roadmap still mostly frame the next lane as “land the review-packet template plus guides,” even though those files now exist | Drift detected | Progress docs must move to execution-readiness wording and a new unit map |

## Requirements

**Post-Guide Milestone 3 Truth**
- R1. Milestone 3 must now describe the Debian 12 review-prep docs set as landed baseline, not as pending deliverable.
- R2. Public and maintainer-facing progress docs must say that review-packet guide coverage is complete while execution artifact coverage is still missing.
- R3. Milestone 2 review helpers remain mandatory guardrails: `pnpm milestone:review:promotion-ready -- --limit 20`, `pnpm milestone:fetch:review-pack`, `.portmanager/reports/milestone-wording-review.md`, the verification report, and the development-progress page stay the wording-truth bundle.

**Review-Packet Readiness Surface**
- R4. `/second-target-policy-pack` must publish one review-packet readiness surface that states current readiness state, guide coverage, artifact coverage, required next action, and the next bounded execution units.
- R5. That readiness surface must keep the candidate target in hold or review-prep posture until one real Debian 12 review packet exists; no broader target-support claim may move because a guide file merely exists.
- R6. The same readiness truth must appear across controller, generated contracts, CLI, Web, roadmap, and development-progress wording so developers do not infer execution status from prose drift.
- R7. Review-packet coverage must distinguish document availability from execution evidence. “Guide set complete” and “artifact capture missing” are different truths and must not collapse into one boolean.

**Next Bounded Unit Map**
- R8. Milestone 3 must publish the next bounded queue as Units 63 through 69: readiness pack, bootstrap packet execution, steady-state packet execution, backup-and-restore packet execution, diagnostics packet execution, rollback packet execution, and second-target review closeout.
- R9. The new unit map must explicitly preserve the current platform contract: `/consumer-boundary-decision-pack`, `/deployment-boundary-decision-pack`, `/persistence-decision-pack`, `/second-target-policy-pack`, the target-profile registry, and `/api/controller` stay stable while packet execution advances.
- R10. Docs regression coverage must lock the post-guide wording so future copy cannot drift back to “guide set missing,” “candidate already supported,” or “Toward C already delivered.”

## Success Criteria
- Contributors can explain the difference between guide coverage and artifact coverage without reading multiple scattered docs.
- `/second-target-policy-pack`, CLI, web, and roadmap all agree that the guide set is complete but no real Debian 12 packet has been captured yet.
- Developers can point at one explicit Unit 63 through Unit 69 map for the post-guide Milestone 3 queue.
- Public docs show that Milestone 3 is advancing through review-packet execution readiness rather than inventing fake standalone deployment or fake second-target support claims.

## Scope Boundaries
- Do not claim that bootstrap, steady-state, backup, diagnostics, or rollback parity already passed for `debian-12-systemd-tailscale`.
- Do not broaden supported-target claims beyond `ubuntu-24.04-systemd-tailscale`.
- Do not reopen the already landed consumer-boundary, deployment-boundary, persistence-decision, audit-review, or target-profile seams as if they were missing.
- Do not invent a gateway binary, standalone event/audit service, or PostgreSQL default-store path just to make Milestone 3 look larger.
- Do not replace the Milestone 2 wording and confidence helper chain with a new review flow.

## Key Decisions
- Treat the Debian 12 guide set as a landed baseline and move the next truth surface to review-packet readiness.
- Publish execution truth as coverage and unit-map data, not only prose.
- Keep Unit 63 focused on readiness visibility; the real execution work begins in Units 64 through 69.
- Keep support claims locked until packet execution and closeout are real.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-review-packet-template.md` plus the five proof guides remain the canonical capture instructions.
- The candidate-host create/probe/bootstrap review-prep lane remains bounded and honest; it does not imply broader support.
- Existing controller, CLI, web, and docs-site surfaces remain the verified baseline for this post-guide phase.
- Future packet execution may happen locally or on real staging hosts, but public copy can advance only after evidence changes `/second-target-policy-pack`.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md` for the Unit 63 implementation and the queued Unit 64 through Unit 69 execution map.

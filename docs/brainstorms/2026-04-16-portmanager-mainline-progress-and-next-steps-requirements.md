---
date: 2026-04-16
topic: portmanager-mainline-progress-and-next-steps
---

# PortManager Mainline Progress and Next Steps Requirements

## Problem Frame
PortManager's docs-first baseline successfully froze contracts, architecture, and UI direction, and the current branch now proves a narrow operational slice around backups, rollback, diagnostics, operations, and event history.
Unit 0 delivery discipline is now real on `main`: `pnpm acceptance:verify`, `.github/workflows/mainline-acceptance.yml`, and the latest GitHub Actions runs `24565361391` (`mainline-acceptance`) plus `24565361388` (`docs-pages`) both passed on `2026-04-17` for commit `63a1257`.
The repository still presents broader V1 promises than the code currently fulfills, especially around host management, bridge-rule management, exposure-policy management, live web parity, and the controller-agent steady-state boundary.
Mainline needs one durable truth source that compares the frozen requirements against verified code reality, updates the progress narrative, and locks the next implementation direction before more scope is added.

## Current Verified State

| Surface | Frozen requirement | Verified current reality |
| --- | --- | --- |
| Controller API | `hosts`, `bridge-rules`, `exposure-policies`, `health-checks`, `operations`, `rollback-points`, `backups`, `snapshots/diagnostics` | `apps/controller/src/controller-server.ts` currently serves `operations`, `events`, `backups`, `health-checks`, `diagnostics`, `bridge-rules/{ruleId}/drift-check`, `snapshots/diagnostics`, `rollback-points`, and `rollback-points/{id}/apply`; it does not yet serve real `/hosts`, `/bridge-rules`, or `/exposure-policies` resources. |
| CLI | Web, CLI, and API should observe the same host, rule, operation, and degraded model | `crates/portmanager-cli/src/main.rs` currently exposes `backups`, `diagnostics`, `events`, `health-checks`, `operation get`, `operations`, and `rollback-points`; it does not yet expose host, bridge-rule, or exposure-policy workflows. |
| Web | Information architecture requires `Overview`, `Hosts`, `Bridge Rules`, `Operations`, `Backups`, and `Console` with diagnostics detail | `apps/web/src/main.ts` renders only `overview`, `host-detail`, and `operations` views from mock-state factories, with no controller fetch path and no dedicated `Hosts`, `Bridge Rules`, `Backups`, `Console`, or diagnostics-detail route. |
| Agent boundary | Controller-agent steady state should be `HTTP over Tailscale` | `crates/portmanager-agent/src/main.rs` remains a file-backed CLI skeleton with `bootstrap`, `apply`, `collect`, `snapshot`, and `rollback`; it does not yet expose a long-lived HTTP service. |
| Mainline delivery gate | Repeatable local and CI acceptance discipline should protect `main` before milestone wording moves | `pnpm acceptance:verify`, `.github/workflows/mainline-acceptance.yml`, and latest `main` runs `24565361391` / `24565361388` are green, so Unit 0 is achieved and now serves as standing branch discipline. |
| Verification | Milestone 1 and early reliability work should be evidenced by tests | `tests/milestone/` and `tests/controller/` already prove backup, rollback, diagnostics, drift, recovery, event history, and operations slices, but they do not yet prove host/rule/policy parity or live web-controller integration. |

## Requirements

**Progress Accounting**
- R1. Mainline documentation must distinguish frozen docs-first baseline work from verified implementation work, instead of treating all V1 public surfaces as already delivered.
- R2. Progress documents must explicitly identify which controller endpoints, CLI commands, web views, and agent capabilities are real today and which remain deferred.
- R3. Milestone language must stop short of declaring Milestone 1 or Milestone 2 accepted until host, bridge-rule, exposure-policy, live web parity, and steady-state agent integration are actually implemented.

**Mainline Truth Sync**
- R4. The repository must contain a durable requirements document and a durable implementation plan that explain the current progress gap and the intended recovery path.
- R5. `README.md`, `Interface Document.md`, `TODO.md`, and roadmap-facing docs must be updated in both English and Chinese so a reader can understand current status without scanning source files.

**Next-Direction Discipline**
- R6. The next implementation direction must prioritize public-surface closure for `hosts`, `bridge-rules`, `exposure-policies`, live web parity, and controller-agent steady-state integration before Milestone 3 work.
- R7. Reliability work already present on the branch must be preserved and described accurately, but it must not be used to justify skipping the missing interface-parity work.
- R8. Unit 0 should now be treated as completed baseline discipline, and active implementation focus should move to Unit 1 controller surface parity rather than more gate-recovery work.

## Success Criteria
- A new contributor can tell, from repo documents alone, which V1 promises are already implemented and which are still contractual only.
- The roadmap no longer labels partially implemented work as fully accepted or fully planned when evidence shows an intermediate state.
- The next implementation plan gives an executor concrete file targets, sequencing, and verification expectations for closing the gap.

## Scope Boundaries
- This requirements document does not redefine the V1 product boundary, Milestone 1 acceptance gate, or the `Toward C` strategy.
- This requirements document does not claim that missing interface surfaces should be removed from the contract; they remain required, but not yet delivered.
- This requirements document does not prescribe specific library choices, schema rewrites, or low-level controller-agent protocol mechanics beyond reaffirming the locked `HTTP over Tailscale` steady-state direction.

## Key Decisions
- Keep the contract surface frozen: missing endpoints and pages remain delivery obligations, not candidates for scope shrinkage.
- Treat current state as "partial implementation with verified reliability primitives": this is more accurate than either "docs baseline only" or "Milestone 1 complete."
- Treat Unit 0 as achieved but mandatory: the delivery gate stays in place, while active development moves to Unit 1 controller parity.
- Sequence future work around interface parity before Milestone 3: broader distributed architecture work would compound drift if the current public surface is still incomplete.

## Dependencies / Assumptions
- Existing contracts in `packages/contracts/openapi/openapi.yaml` and `packages/typescript-contracts/src/generated/openapi.ts` remain the source of truth for V1 public surface expectations.
- Current controller and milestone tests remain trustworthy evidence for backup, rollback, diagnostics, drift, and operations behavior already implemented.

## Outstanding Questions

### Resolve Before Planning
- None.

### Deferred to Planning
- [Affects R6][Technical] How should host, bridge-rule, and exposure-policy write paths be sequenced so controller, CLI, and web stay contract-aligned without duplicating state logic?
- [Affects R6][Technical] What is the smallest incremental step from the current agent CLI skeleton to the locked `HTTP over Tailscale` steady-state service boundary?
- [Affects R5][Needs research] Which progress sections should stay mirrored into the docs-site data model versus remaining only in root/spec documents?

## Next Steps
-> `/ce:plan` for structured implementation planning.

---
title: "V1 Architecture"
audience: shared
persona:
  - contributor
  - admin
  - automation
section: architecture
sourcePath: "docs/architecture/portmanager-v1-architecture.md"
status: active
---
> Source of truth: `docs/architecture/portmanager-v1-architecture.md`
> Audience: `shared` | Section: `architecture` | Status: `active`
> Updated: 2026-04-21 | Version: v0.2.0-m3-phase0-enablement
### Current implemented split
- `web`: TypeScript React SPA for operator workflows and long-lived operational visibility
- `controller`: TypeScript REST + SSE API service
- `cli`: Rust operator and automation entrypoint
- `agent`: Rust remote execution plane installed on managed hosts
- `future shared core`: Rust crates reserved for reusable execution and platform abstraction work

### Current verified topology
1. Operator uses Web or CLI.
2. Web or CLI enters through the shared `/api/controller` consumer boundary, which is currently still served by the controller with legacy direct routes kept as compatibility aliases.
3. Controller validates requests, records operations, and resolves safety prerequisites.
4. Controller reaches the agent over `HTTP over Tailscale` after bootstrap.
5. Agent applies desired state and returns runtime evidence.
6. Controller persists runtime state, artifacts, backups, rollback points, and event updates.
7. Web and CLI read the same controller-backed truth.

### Current verified architecture progress
- Milestone 1 public-surface parity is accepted.
- Milestone 2 confidence thresholds are promotion-ready and remain guarded by `pnpm acceptance:verify`, `pnpm milestone:verify:confidence`, and the wording-review flow.
- The controller still owns desired state, orchestration, persistence, artifact indexing, and most event/audit wiring inside one TypeScript service.
- The agent is already a live bounded execution plane, but not yet a richer event or orchestration participant.
- Web and CLI are truthful peers over the same contract surface, and that surface now includes a gateway-ready `/api/controller` consumer boundary even though no separate gateway app exists yet.

### Deep compare against Scheme C

| Scheme C concern | Current repo truth | Progress classification | Implication for Milestone 3 |
| --- | --- | --- | --- |
| Consumer gateway boundary | No dedicated gateway app or service yet, but controller now serves a gateway-ready `/api/controller` consumer boundary while keeping legacy direct routes compatible, `/consumer-boundary-decision-pack` states why routing stays embedded, `/deployment-boundary-decision-pack` states why standalone deployment review still stays on hold, and `/second-target-policy-pack` states why support stays locked to one target while `debian-12-systemd-tailscale` stays review-prep only | Phase 0 baseline landed | Next focus shifts to keeping the candidate-host create/probe/bootstrap review-prep lane honest plus landing the review-packet template path, bootstrap proof through `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`, and the remaining transport/recovery/docs/acceptance/ownership evidence under `/second-target-policy-pack`, not more routing-shell churn |
| Controller, policy, event, and audit separation | `controller-read-model`, `controller-domain-service`, `audit-review-service`, `/event-audit-index`, and the persistence adapter now extract the first seam set, even though transport and storage still centralize too much work | Phase 0 baseline landed | Explicit audit-review ownership is now landed inside controller; next focus shifts to target-profile and persistence-promotion decisions before debating deployment topology |
| First-class remote agent | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, `/rollback`; controller syncs live desired state | Partially earned | Deepen event semantics while keeping the agent bounded |
| Batch host orchestration | One bounded batch exposure-policy envelope now lands as an auditable parent operation with host-scoped child outcomes across controller, CLI, and Web | Phase 0 baseline landed | Keep broader orchestration on the same audit model instead of inventing a second path |
| Persistence growth beyond SQLite | SQLite remains the active store, but the persistence adapter and readiness reporting seam are now real | Phase 0 baseline landed | Add a migration decision surface before any PostgreSQL promise |
| Second-target platform abstraction | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started | Define abstraction rules before second-target claims |

### Milestone 3 Phase 0 architecture move
Milestone 3 still does not begin with “split everything.”
It now continues with bounded enablement:

- keep `/api/controller` as the gateway-ready consumer boundary while deferring any separate gateway deployment
- add an explicit audit-review owner for `/events` and `/event-audit-index`
- keep bounded multi-host and batch-operation primitives on the same operation/evidence model
- promote persistence readiness into a migration decision surface before any PostgreSQL move
- keep supported-target expansion behind explicit target-profile rules

### Connectivity boundary that stays locked
- `SSH`: bootstrap, install, rescue, and last-resort diagnostics only
- `HTTP over Tailscale`: steady-state controller-agent communication
- `REST + SSE`: controller-web/cli communication through the shared `/api/controller` consumer boundary until a separate gateway deployment becomes justified
- No direct Web-to-agent link

### State and evidence rules that remain unchanged
- Desired state stays controller-owned.
- Runtime state stays agent-reported and controller-indexed.
- Drift remains explicit as `degraded`.
- Snapshot and diagnostic artifacts remain evidence, not source of truth.
- Milestone 3 cannot bypass backup, rollback, or audit semantics that already protect the accepted slice.

### Near-term architecture risks
- premature gateway topology work without first extracting seams
- multi-host orchestration that creates a second audit path
- database migration pressure being guessed instead of measured
- platform-breadth claims appearing before target abstractions exist

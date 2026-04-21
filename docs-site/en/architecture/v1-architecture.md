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
2. Web or CLI calls the controller directly.
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
- Web and CLI are truthful peers over the same contract surface, but still consume the controller directly rather than a gateway-ready consumer boundary.

### Deep compare against Scheme C

| Scheme C concern | Current repo truth | Progress classification | Implication for Milestone 3 |
| --- | --- | --- | --- |
| Consumer gateway boundary | No dedicated gateway app or service; Web and CLI call controller directly | Not started | Begin with a gateway-ready contract boundary, not a new deployable service claim |
| Controller, policy, event, and audit separation | `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still centralize most of this work | Not started | Extract seams before debating deployment topology |
| First-class remote agent | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, `/rollback`; controller syncs live desired state | Partially earned | Deepen event semantics while keeping the agent bounded |
| Batch host orchestration | Proof slice remains one host / one rule plus reliability replay | Not started | Add bounded batch-operation envelopes on the same audit model |
| Persistence growth beyond SQLite | SQLite remains the only real store | Not started | Introduce persistence seams and migration-readiness criteria |
| Second-target platform abstraction | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started | Define abstraction rules before second-target claims |

### Milestone 3 Phase 0 architecture move
Milestone 3 does not begin with “split everything.”
It begins with bounded enablement:

- extract controller domain seams for orchestration, policy, read models, and event/audit indexing
- shape a gateway-ready consumer boundary without breaking current Web/CLI flows
- add bounded multi-host and batch-operation primitives that reuse the current operation/evidence model
- isolate persistence behind readiness seams before any PostgreSQL move
- keep supported-target expansion behind explicit abstraction rules

### Connectivity boundary that stays locked
- `SSH`: bootstrap, install, rescue, and last-resort diagnostics only
- `HTTP over Tailscale`: steady-state controller-agent communication
- `REST + SSE`: controller-web/cli communication until a gateway-ready boundary becomes real
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

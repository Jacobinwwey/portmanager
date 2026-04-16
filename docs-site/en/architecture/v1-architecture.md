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
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Service split
- `web`: TypeScript React SPA for operator workflows and long-lived operational visibility.
- `controller`: TypeScript API service exposing REST resources and SSE event streams.
- `cli`: Rust first-class operator and automation entrypoint.
- `agent`: Rust remote execution plane installed on managed hosts.
- `future shared core`: Rust crates for rule application logic, validation, and platform abstraction reuse.

### System responsibilities
- Controller owns desired state, orchestration, persistence, artifact indexing, and operation history.
- Web owns operator-facing interaction, visualization, and inspection.
- CLI owns automation-friendly command surfaces with deterministic machine output.
- Agent owns minimal execution, collection, rollback primitive, and bounded host introspection.
- Shared contracts own cross-surface DTO truth.

### Control-plane topology
1. Operator uses Web or CLI.
2. Web or CLI calls controller API.
3. Controller validates request against OpenAPI / JSON Schema derived types.
4. Controller records an `Operation` and resolves safety prerequisites.
5. Controller reaches agent over HTTP on Tailscale after bootstrap.
6. Agent applies desired state and returns runtime evidence.
7. Controller persists runtime state, artifacts, and event stream updates.
8. Web and CLI consume the same operation and state results.

### Connectivity boundary
- `SSH`: bootstrap, install, rescue, and last-resort diagnostics only.
- `HTTP over Tailscale`: steady-state controller-agent communication.
- `REST + SSE`: controller-web/cli communication.
- No direct Web-to-agent link is part of the baseline.

### State model
- Desired state is controller-owned.
- Runtime state is agent-reported and controller-indexed.
- Drift is a first-class outcome and must be represented explicitly as `degraded` rather than inferred away.
- Snapshot and diagnostic artifacts are evidence, not source of truth.

### Storage model
- Controller state store: `SQLite` in V1.
- Future migration surface: `PostgreSQL`.
- Artifact store: controller-managed filesystem path for screenshots, manifests, and diagnostics blobs.
- Remote managed paths: `/etc/portmanager` for human-maintained config and `/var/lib/portmanager` for operational state.

### Domain lifecycle
- Host lifecycle: `draft -> probing -> bootstrapping -> ready -> degraded -> retired`
- Rule lifecycle: `desired -> applying -> applied_unverified -> active -> degraded -> rollback_pending -> rolled_back -> removed`
- Operation lifecycle: `queued -> running -> succeeded | failed | degraded | cancelled`

### Non-goals for the baseline upload
- No hidden sidecars or implicit controller-written remote state outside documented managed paths.
- No direct shell-command orchestration model for steady-state operation.
- No coupling of UI-only state with actual domain state.
- No agent-side browser runtime.

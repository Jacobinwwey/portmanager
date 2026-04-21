---
title: "Second-Target Review Contract"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-second-target-review-contract.md"
status: active
---
> Source of truth: `docs/operations/portmanager-second-target-review-contract.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze the public wording and maintainer wording for the declared review-prep candidate `debian-12-systemd-tailscale`.

### Current claim posture
- `ubuntu-24.04-systemd-tailscale` remains the only supported target profile.
- `debian-12-systemd-tailscale` is review-prep only.
- `/second-target-policy-pack` is the canonical controller contract for second-target expansion truth.
- No wider platform claim, gateway deployment claim, or PostgreSQL-default claim is allowed through this document.

### Required wording rules
- Say `candidate` or `review-prep candidate`, never `supported`, `available`, or `shipped`.
- Keep support claims locked to Ubuntu until bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity are all proven.
- Keep docs, CLI, Web, controller contract, and roadmap pages aligned with the same hold state.
- If parity evidence regresses or becomes stale, keep the candidate on hold and update `/second-target-policy-pack` first.

### Required source surfaces
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### Current review boundary
- Review owner: `controller`
- Candidate target: `debian-12-systemd-tailscale`
- Blocking evidence today: bootstrap transport parity, steady-state transport parity, backup and restore parity, diagnostics parity, rollback parity
- Landed governance artifacts today: docs contract, acceptance recipe, operator ownership definition

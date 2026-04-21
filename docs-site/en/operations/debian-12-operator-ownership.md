---
title: "Debian 12 Operator Ownership"
audience: shared
persona:
  - operator
  - admin
  - contributor
section: operations
sourcePath: "docs/operations/portmanager-debian-12-operator-ownership.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-operator-ownership.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Define who owns review-prep work for `debian-12-systemd-tailscale`.

### Ownership boundary
- Review owner: `controller`
- Support owner before review approval: none beyond the locked Ubuntu baseline
- Candidate operator owner: the maintainer who stages the Debian 12 environment and records the review packet

### Required owner duties
- Keep support claims locked to Ubuntu until review opens.
- Stage Debian 12 environment, Tailscale reachability, and target-profile enrollment.
- Preserve bootstrap, steady-state, backup, diagnostics, and rollback evidence.
- Record the packet through `docs/operations/portmanager-debian-12-review-packet-template.md`.
- Update `/second-target-policy-pack` and docs surfaces when evidence changes.
- Stop the candidate review immediately if parity proof regresses.

### Required sign-off conditions
- Review packet contains the full acceptance recipe evidence bundle.
- Review packet follows `docs/operations/portmanager-debian-12-review-packet-template.md`.
- `/second-target-policy-pack` reflects the same truth as docs, CLI, and Web.
- Rollback ownership is explicit and rehearsed.
- Any unresolved parity gap is listed as blocking, not hidden behind aspirational prose.

### Escalation rule
If owner duty or evidence retention cannot be maintained, keep `debian-12-systemd-tailscale` in review-prep and do not widen supported-target claims.

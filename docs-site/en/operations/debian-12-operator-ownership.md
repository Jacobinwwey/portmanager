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
Define who owns bounded-review work for `debian-12-systemd-tailscale`.

### Ownership boundary
- Review owner: `controller`
- Support owner before review close: none beyond the locked Ubuntu baseline
- Candidate operator owner: the maintainer who stages the Debian 12 environment, preserves the packet root, and records bounded-review verdicts

### Required owner duties
- Keep support claims locked to Ubuntu until bounded review closes.
- Stage Debian 12 environment, Tailscale reachability, and target-profile enrollment.
- Preserve bootstrap, steady-state, backup, diagnostics, and rollback evidence.
- Record the packet through `docs/operations/portmanager-debian-12-review-packet-template.md`.
- Record adjudication verdicts through `/second-target-policy-pack`.
- Update `/second-target-policy-pack` and docs surfaces when evidence changes or review finds a real delta.
- Stop the candidate review immediately if parity proof regresses or packet integrity drifts.

### Required sign-off conditions
- Review packet contains the full acceptance recipe evidence bundle.
- Review packet follows `docs/operations/portmanager-debian-12-review-packet-template.md`.
- `/second-target-policy-pack` exposes the same `review_required` plus `review_open` truth as docs, CLI, and Web.
- Pending verdicts are explicit: packet integrity, drift acknowledgement, support lock confirmation, operator sign-off, and follow-up scope bounding.
- `/second-target-policy-pack` reflects the same truth as docs, CLI, and Web.
- Rollback ownership is explicit and rehearsed.
- Any unresolved parity gap or review-found delta is listed as blocking, not hidden behind aspirational prose.

### Escalation rule
If owner duty or evidence retention cannot be maintained, keep `debian-12-systemd-tailscale` in bounded review and do not widen supported-target claims.

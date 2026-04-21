---
title: "Debian 12 Review Packet Template"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-review-packet-template.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-review-packet-template.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one explicit review-packet template for `debian-12-systemd-tailscale`.
This document does not claim that parity already passed.
It names the artifact slots that must be filled before `/second-target-policy-pack` can move any blocked parity criterion.

### Packet header
- candidate target profile id
- candidate host id and Tailscale address
- operator name plus review date
- controller commit or release under review
- short drift summary, including any still-blocking mismatch

### Preserved bootstrap and steady-state packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review date: `2026-04-21`
- controller commit: `ce19f8b6572171896e2bdb42cdb184eeab845454`
- candidate target profile id: `debian-12-systemd-tailscale`
- candidate host id: `host_debian_12_review_packet_1776805736172_558`
- recorded address for this bounded rehearsal: `172.17.0.2`
- bootstrap operation id: `op_bootstrap_host_1776805736313_817`
- bootstrap result summary: `host host_debian_12_review_packet_1776805736172_558 bootstrapped via http://172.17.0.2:8711; 0 rule(s) staged with backup policy best_effort`
- audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-audit-index.json`
- target-profile confirmation: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-host-detail.json`
- steady-state post-mutation operation id: `op_create_rule_1776805736384_555`
- steady-state `/health` capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-health.json`
- steady-state `/runtime-state` capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-runtime-state.json`
- steady-state audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-audit-index.json`
- drift summary: local Debian 12 Docker bridge replaced live Tailscale for this preserved review packet, so broader support claims remain locked.

### Required evidence sections
1. Bootstrap transport parity
   - bootstrap operation id
   - bootstrap result summary
   - linked event replay or audit-index reference
   - confirmation that host target profile stayed `debian-12-systemd-tailscale`
2. Steady-state transport parity
   - one controller-driven mutation after bootstrap
   - resulting `/health` capture
   - resulting `/runtime-state` capture
   - linked controller operation or audit reference
3. Backup and restore parity
   - backup-bearing mutation id
   - backup manifest path
   - remote-backup result if configured
   - restore or restore-readiness note for the same packet
4. Diagnostics parity
   - diagnostics operation id
   - diagnostics artifact paths
   - linked event replay or audit-index reference
   - short operator note for any drift
5. Rollback parity
   - rollback-point id
   - rollback operation id
   - rollback result summary
   - post-rollback diagnostics linkage

### Publication rule
- Keep the packet in review-prep until every required section has real artifact links.
- If any section regresses, update `/second-target-policy-pack` first and keep support claims locked to Ubuntu.
- Link this packet back into the acceptance recipe, bootstrap-proof guide, steady-state-proof guide, backup-restore-proof guide, diagnostics-proof guide, rollback-proof guide, and operator ownership note when evidence changes.

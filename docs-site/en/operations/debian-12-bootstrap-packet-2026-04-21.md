---
title: "Debian 12 Bootstrap Packet 2026-04-21"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md"
status: active
---
> Source of truth: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
This directory preserves the bounded Unit 64 through Unit 69 review packet captured on `2026-04-21`.
It does not widen supported-target claims.
It records one real Debian 12 bootstrap, steady-state, backup, diagnostics, and rollback rehearsal for `debian-12-systemd-tailscale`, and it now supports bounded second-target review while broader support claims remain locked.

### Files
- `bootstrap-capture-summary.json`: capture date, controller commit, host id, drift note, and packet overview.
- `bootstrap-operation.json`: terminal controller bootstrap operation detail.
- `bootstrap-audit-index.json`: linked `bootstrap_host` audit-index entry.
- `bootstrap-host-detail.json`: target-profile confirmation and host ready state.
- `steady-state-capture-summary.json`: capture date, controller commit, host id, drift note, and steady-state packet overview.
- `steady-state-operation.json`: terminal controller post-bootstrap mutation detail.
- `steady-state-health.json`: preserved `/health` response from the same bounded packet.
- `steady-state-runtime-state.json`: preserved `/runtime-state` response from the same bounded packet.
- `steady-state-audit-index.json`: linked `create_rule` audit-index entry for the same bounded packet.
- `steady-state-host-detail.json`: host detail after the bounded steady-state mutation.
- `backup-capture-summary.json`: capture date, controller commit, host id, readiness delta, and backup packet overview.
- `backup-operation.json`: terminal controller backup operation detail.
- `backup-summary.json`: preserved backup summary with manifest linkage and remote-backup result.
- `backup-rollback-points.json`: ready rollback-point linkage preserved from the same backup packet.
- `backup-host-detail.json`: host detail after the bounded backup operation.
- `backup-github-upload.json`: sanitized remote GitHub upload proof for the preserved backup bundle.
- `diagnostics-capture-summary.json`: capture date, host/rule linkage, artifact coverage delta, and operator drift note for the diagnostics slice.
- `diagnostics-operation.json`: terminal controller diagnostics operation detail.
- `diagnostics-artifacts.json`: preserved diagnostics artifact bundle with machine-readable and snapshot paths.
- `diagnostics-audit-index.json`: linked diagnostics audit-index entry for the same bounded packet.
- `diagnostics-host-detail.json`: host detail after diagnostics verified the bounded rule.
- `rollback-capture-summary.json`: capture date, rollback linkage, post-rollback diagnostics linkage, and operator drift note for the rollback slice.
- `rollback-operation.json`: terminal controller rollback operation detail.
- `rollback-result.json`: copied rollback result summary from the preserved rollback artifact.
- `rollback/rp_op_backup_1776807481139_825-result.json`: original rollback result artifact emitted by the controller rollback primitive.
- `rollback-post-diagnostics.json`: preserved post-rollback diagnostics linkage for the same rehearsal.
- `rollback-post-diagnostics-audit-index.json`: linked post-rollback diagnostics audit-index entry.
- `rollback-host-detail.json`: host detail after rollback plus post-rollback diagnostics.
- `backups/backup_op_backup_1776807481139_825/manifest.json`: local manifest for the bounded backup bundle.
- `bootstrap-initial-policy-pack.json`: historical pre-landing `/second-target-policy-pack` truth showing the packet originally started from `capture_required`.
- `packet-ready-policy-pack.json`: final `/second-target-policy-pack` snapshot showing `packet_ready` plus `review_required` after the full bounded packet landed.

### Drift Note
- The preserved rehearsal ran inside a local Debian 12 Docker container.
- Container bridge address `172.17.0.2` replaced a live Tailscale address in this bounded packet.
- Support claims remain locked to `ubuntu-24.04-systemd-tailscale`.

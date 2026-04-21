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
This directory preserves the bounded Unit 64 and Unit 65 review packet captured on `2026-04-21`.
It does not widen supported-target claims.
It records one real Debian 12 bootstrap plus steady-state rehearsal for `debian-12-systemd-tailscale` while backup, diagnostics, rollback, and second-target review remain pending.

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
- `bootstrap-initial-policy-pack.json`: historical pre-landing `/second-target-policy-pack` truth showing the packet originally started from `capture_required`.

### Drift Note
- The preserved rehearsal ran inside a local Debian 12 Docker container.
- Container bridge address `172.17.0.3` replaced a live Tailscale address in this bounded packet.
- Support claims remain locked to `ubuntu-24.04-systemd-tailscale`.

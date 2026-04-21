---
title: "Debian 12 Bootstrap Proof Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-bootstrap-proof-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one concrete bootstrap-proof capture guide for `debian-12-systemd-tailscale`.
This document now also points at one preserved bootstrap bundle.
It still does not widen supported-target claims beyond the bounded review packet.

### Inputs
- Candidate host already exists with target profile `debian-12-systemd-tailscale`.
- `pnpm acceptance:verify` is green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm the preserved bootstrap and steady-state packet is landed while backup, diagnostics, rollback, and second-target review still block broader review.
2. Create or confirm one candidate host with `--target-profile-id debian-12-systemd-tailscale`.
3. Run one bounded bootstrap rehearsal through the normal controller path:
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
4. Read the resulting operation detail:
   - `portmanager operation get <bootstrap-operation-id> --json`
5. Record one linked audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --type bootstrap_host --limit 5 --json`
6. Record one host-detail snapshot proving the target profile stayed locked:
   - `portmanager hosts get <host-id> --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Preserved execution bundle
- artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- capture summary: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-capture-summary.json`
- bootstrap operation detail: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-operation.json`
- bootstrap audit index: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-audit-index.json`
- bootstrap host detail: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-host-detail.json`
- preserved bootstrap operation id: `op_bootstrap_host_1776803574305_379`
- preserved result summary: `host host_debian_12_bootstrap_review_1776803574142_396 bootstrapped via http://172.17.0.3:8711; 0 rule(s) staged with backup policy best_effort`
- preserved target-profile confirmation: host `host_debian_12_bootstrap_review_1776803574142_396` stayed on `debian-12-systemd-tailscale` and reached `ready`
- drift note: this bounded packet used a local Debian 12 Docker bridge address instead of a live Tailscale tailnet, so support claims remain locked

### Required artifacts
- bootstrap operation id
- bootstrap terminal result summary
- audit-index or replay reference linked to the same bootstrap
- host target profile confirmation showing `debian-12-systemd-tailscale`

### Exit rule
Treat bootstrap transport parity as the landed packet slice only while the preserved review packet keeps all four artifacts linked to the same rehearsal; steady-state, backup, diagnostics, rollback, and review closeout remain blocked.

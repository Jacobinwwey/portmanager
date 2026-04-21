---
title: "Debian 12 Backup and Restore Proof Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-backup-restore-proof-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one concrete backup-and-restore proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark full second-target review as passed.
It now records the bounded backup bundle that `/second-target-policy-pack` treats as landed backup-and-restore evidence inside the complete preserved review packet.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal.
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` and `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchor transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Preserved bounded packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- backup operation id: `op_backup_1776807481139_825`
- backup result summary: `backup backup_op_backup_1776807481139_825 created with rollback point rp_op_backup_1776807481139_825; GitHub backup uploaded to Jacobinwwey/portmanager-backups:portmanager-backups/host_debian_12_review_packet_1776805736172_558/backup_op_backup_1776807481139_825.bundle.json`
- backup manifest path: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backups/backup_op_backup_1776807481139_825/manifest.json`
- remote-backup result: `succeeded`, with upload record `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-github-upload.json`
- restore-readiness reference: `rp_op_backup_1776807481139_825`, preserved in `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-rollback-points.json`

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm backup-and-restore parity is already backed by the preserved packet while broader support claims still stay locked pending bounded review.
2. Trigger one bounded controller backup operation on the candidate host:
   - `POST /backups/run` with `mode: "required"`
   - Use any equivalent bounded path only if it preserves the same manifest, remote-backup, and rollback-point evidence model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <backup-operation-id> --json`
4. Capture the linked backup summary from the same operation:
   - `portmanager backups list --operation-id <backup-operation-id> --json`
5. Record the remote-backup result from the same bundle:
   - preserve the explicit configured result if GitHub backup is enabled
   - preserve the explicit `not_configured` state and operator action if remote backup is still absent
6. Record one restore-readiness reference from the same bundle:
   - `portmanager rollback-points list --host-id <host-id> --state ready --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- backup-bearing controller operation id
- backup manifest path
- remote-backup result or explicit not-configured state from the same bundle
- rollback-point or restore-readiness reference linked to the same operation

### Exit rule
Keep backup and restore parity tied to one bounded backup operation packet, and refresh `/second-target-policy-pack` first if any of the four linked artifacts drift while bounded review remains open.

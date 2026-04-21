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
This document does not mark backup and restore parity as passed.
It defines the minimum backup-bearing artifact bundle that must exist before `/second-target-policy-pack` can move backup parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal.
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` and `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchor transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm backup parity still blocks review.
2. Run one backup-bearing controller mutation on the candidate host:
   - `portmanager bridge-rules delete --rule-id <rule-id> --wait`
   - Use any equivalent bounded mutation only if it preserves the same backup and rollback evidence model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <backup-bearing-operation-id> --json`
4. Capture the linked backup summary from the same mutation:
   - `portmanager backups --operation-id <backup-bearing-operation-id> --json`
5. Record the remote-backup result from the same bundle:
   - preserve the explicit configured result if GitHub backup is enabled
   - preserve the explicit `not_configured` state and operator action if remote backup is still absent
6. Record one restore-readiness reference from the same bundle:
   - `portmanager rollback-points --host-id <host-id> --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- backup-bearing controller mutation id
- backup manifest path
- remote-backup result or explicit not-configured state from the same bundle
- rollback-point or restore-readiness reference linked to the same mutation

### Exit rule
Keep backup and restore parity blocked until one review packet links all four artifacts back to the same backup-bearing mutation.

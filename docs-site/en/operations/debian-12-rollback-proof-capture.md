---
title: "Debian 12 Rollback Proof Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-rollback-proof-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-rollback-proof-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one concrete rollback proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark rollback parity as passed.
It defines the minimum rollback rehearsal bundle that must exist before `/second-target-policy-pack` can move rollback parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded backup-bearing mutation capture and one diagnostics capture.
- `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md` and `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md` already anchor the pre-rollback evidence bundle.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm rollback parity still blocks review.
2. List rollback points for the candidate host and choose one point tied to the same bounded review packet:
   - `portmanager rollback-points --host-id <host-id> --json`
3. Rehearse one bounded rollback:
   - `portmanager rollback-points apply <rollback-point-id> --wait --json`
4. Record the resulting controller operation detail:
   - `portmanager operation get <rollback-operation-id> --json`
5. Preserve the rollback-point id plus the terminal rollback result summary from the same packet:
   - keep the explicit `rollbackPointId`
   - keep the explicit terminal `resultSummary`
6. Record one post-rollback diagnostics linkage from the same rehearsal:
   - `portmanager diagnostics list --host-id <host-id> --rule-id <rule-id> --json`
   - preserve one linked diagnostics artifact path or audit reference that proves post-rollback verification actually ran
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- rollback-point id selected for the rehearsal
- rollback controller operation id
- terminal rollback result summary
- post-rollback diagnostics artifact or audit linkage from the same rehearsal

### Exit rule
Keep rollback parity blocked until one review packet links all four artifacts back to the same bounded rollback rehearsal.

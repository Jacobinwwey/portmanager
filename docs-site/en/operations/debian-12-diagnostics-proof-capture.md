---
title: "Debian 12 Diagnostics Proof Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-diagnostics-proof-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one concrete diagnostics proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark diagnostics parity as passed.
It defines the minimum diagnostics artifact bundle that must exist before `/second-target-policy-pack` can move diagnostics parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal and one steady-state mutation capture.
- `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchors post-bootstrap transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm diagnostics parity still blocks review.
2. Trigger one bounded controller-side diagnostics run for the candidate host and rule:
   - `curl -fsS -X POST http://<controller-host>:<controller-port>/snapshots/diagnostics -H 'content-type: application/json' -d '{"hostId":"<host-id>","ruleId":"<rule-id>","port":<listen-port>,"scheme":"http","captureSnapshot":true}'`
   - Use any equivalent bounded controller-driven diagnostics trigger only if it preserves the same controller artifact and event model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <diagnostics-operation-id> --json`
4. Capture the diagnostics artifact bundle from the same run:
   - `portmanager diagnostics list --host-id <host-id> --rule-id <rule-id> --json`
5. Record one linked controller audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --rule-id <rule-id> --limit 5 --json`
6. Record one short operator drift note from the same packet:
   - preserve the explicit no-drift conclusion if verification stayed healthy
   - preserve the explicit degraded or rollback-required note if drift remained
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- diagnostics controller operation id
- diagnostics artifact paths from the same run
- controller audit-index or replay reference linked to the same run
- short operator note for any drift or verified no-drift outcome

### Exit rule
Keep diagnostics parity blocked until one review packet links all four artifacts back to the same diagnostics run.

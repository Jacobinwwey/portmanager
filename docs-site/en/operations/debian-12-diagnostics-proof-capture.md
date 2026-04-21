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
This document does not widen supported-target claims by itself.
It now points at the preserved diagnostics artifact bundle that `/second-target-policy-pack` treats as landed diagnostics evidence inside the complete bounded review packet.

### Preserved bounded packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- diagnostics operation id: `op_diag_1776809568435_848`
- diagnostics artifact bundle: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-artifacts.json`
- diagnostics audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-audit-index.json`
- operator drift note and summary: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json`

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal and one steady-state mutation capture.
- `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchors post-bootstrap transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm diagnostics parity is already backed by the preserved packet while broader support claims still stay locked pending bounded review.
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
Keep diagnostics parity tied to one preserved diagnostics run, and refresh `/second-target-policy-pack` first if any of the four linked artifacts drift while bounded review remains open.

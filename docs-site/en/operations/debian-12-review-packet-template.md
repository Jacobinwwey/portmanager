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
> Updated: 2026-04-22 | Version: v0.3.0
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

### Preserved full bounded packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review date: `2026-04-21`
- controller commit: `b4b648fd4a2b694df1892ea2b6fe610e5d387516`
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
- backup operation id: `op_backup_1776807481139_825`
- backup result summary: `backup backup_op_backup_1776807481139_825 created with rollback point rp_op_backup_1776807481139_825; GitHub backup uploaded to Jacobinwwey/portmanager-backups:portmanager-backups/host_debian_12_review_packet_1776805736172_558/backup_op_backup_1776807481139_825.bundle.json`
- backup manifest path: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backups/backup_op_backup_1776807481139_825/manifest.json`
- backup summary: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-summary.json`
- remote-backup upload record: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-github-upload.json`
- restore-readiness reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-rollback-points.json`
- diagnostics operation id: `op_diag_1776809568435_848`
- diagnostics artifact bundle: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-artifacts.json`
- diagnostics audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-audit-index.json`
- diagnostics drift note: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json`
- rollback-point id: `rp_op_backup_1776807481139_825`
- rollback operation id: `op_rollback_1776809568474_70`
- rollback result summary: `rollback rp_op_backup_1776807481139_825 applied from rp_op_backup_1776807481139_825-result.json`
- rollback result artifact: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback/rp_op_backup_1776807481139_825-result.json`
- post-rollback diagnostics linkage: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-post-diagnostics.json`
- drift summary: local Debian 12 Docker bridge replaced live Tailscale for this preserved review packet, so broader support claims remain locked until bounded second-target review closes.

### Filesystem-backed live packet extension
- fresh packet root pattern: `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`
- canonical summary filename: `live-transport-follow-up-summary.json`
- preferred preview helper: `pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url <url>`
- preferred capture helper: `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>`
- scaffold helper: `pnpm milestone:scaffold:live-packet -- --packet-date <date>`
- assembly helper fallback: `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
- validator helper: `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
- the preferred preview helper now auto-resolves the latest candidate host plus latest successful bootstrap pair for `debian-12-systemd-tailscale`, fetches controller host detail, bootstrap detail, and one host-scoped audit index directly from bounded controller surfaces, then reports packet root, resolved ids, captured address, derived agent base URL, audit operation ids, and `captureReady` without writing packet files
- the preferred capture helper now runs immediately after preview reports `captureReady: true`, reuses the same resolved host/bootstrap pair, fetches steady-state `/health`, steady-state `/runtime-state`, and the same host-scoped audit index, then writes the canonical packet-local files and summary in one step
- `--candidate-target-profile-id <target-profile-id>`, `--host-id <host-id>`, and `--bootstrap-operation-id <operation-id>` remain bounded override flags when operator review needs a different candidate lane, a hand-picked bootstrap pair, or mismatch debugging
- the assembly helper copies real source artifacts into the canonical packet-local filenames, derives `candidateTargetProfileId`, `capturedAt`, and `capturedAddress`, and fails on cross-source address drift so operators do not hand-write `live-transport-follow-up-summary.json`
- scaffold-only packet roots may be replaced by capture or assembly without `--force`, but existing non-scaffold packet roots stay protected unless `--force` is explicit
- controller default truth now reads only the newest valid packet root whose summary file keeps:
  - `candidateTargetProfileId`
  - `capturedAt`
  - `capturedAddress`
  - `requiredArtifactIds`
  - `artifactFiles`
- minimum packet-local file layout for discovery:
  - `candidate-host-detail.json`
  - `bootstrap-operation.json`
  - `steady-state-health.json`
  - `steady-state-runtime-state.json`
  - `controller-audit-index.json`
  - `live-transport-follow-up-summary.json`
- `requiredArtifactIds` must include all five live follow-up artifact ids, and `artifactFiles` must map each id to one existing packet-local file.
- `capturedAddress` must be non-empty and must not remain `172.17.0.2`.
- scaffold-marked summary or artifact files are invalid by design and do not count as packet evidence.
- incomplete or malformed newer packet roots do not clear the blocking delta; controller falls back to the newest valid root or keeps `capture_required`.

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
   - bounded backup operation id
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
- Keep the packet in bounded review until every required section stays linked to real artifact evidence and review closes.
- If any section regresses, update `/second-target-policy-pack` first and keep support claims locked to Ubuntu.
- Link this packet back into the acceptance recipe, bootstrap-proof guide, steady-state-proof guide, backup-restore-proof guide, diagnostics-proof guide, rollback-proof guide, and operator ownership note when evidence changes.

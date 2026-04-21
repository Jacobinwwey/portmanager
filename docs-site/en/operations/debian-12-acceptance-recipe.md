---
title: "Debian 12 Acceptance Recipe"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-acceptance-recipe.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-acceptance-recipe.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Define the bounded review-prep recipe for `debian-12-systemd-tailscale`.
This document does not claim that parity proof already passed.
It freezes the exact proof sequence and artifact bundle required before second-target review can open.
Current repo baseline now supports candidate-host enrollment, probe, and bootstrap rehearsal only.
It still does not claim bootstrap parity passed, and it still does not claim steady-state, backup, diagnostics, or rollback parity.

### Preconditions
- `pnpm acceptance:verify` stays green on the current mainline slice.
- `pnpm milestone:review:promotion-ready -- --limit 20` has already been reviewed for wording truth.
- Candidate host runs Debian 12 with `systemd`.
- Candidate host is reachable through Tailscale.
- Operator can preserve backup, diagnostics, and rollback artifacts for the review packet.

### Suggested staging options
- Preferred: one disposable Debian 12 VM or physical host on the same Tailscale tailnet as controller.
- Optional local rehearsal: `incus launch images:debian/12 portmanager-debian12-review`
  - If `incus` is unavailable, use any equivalent Debian 12 environment.
  - This command is a staging suggestion, not proof by itself.

### Review-prep proof sequence
1. Enroll one Debian 12 host with target profile `debian-12-systemd-tailscale`.
2. Run host probe and bootstrap.
3. Capture bootstrap transport result plus controller operation evidence.
4. Apply one bridge rule or exposure policy through the normal controller path.
5. Capture steady-state runtime evidence from agent `/health` and `/runtime-state`.
6. Trigger one backup-bearing mutation and record backup manifest plus remote-backup result if configured.
7. Run diagnostics and preserve diagnostics artifacts plus controller event linkage.
8. Rehearse rollback and record rollback-point linkage, result summary, and post-rollback diagnostics.
9. Publish one review packet that links every artifact back to `/second-target-policy-pack`.

### Required evidence bundle
- controller operation ids for bootstrap, apply, diagnostics, backup, rollback
- event replay or audit index references for each proof step
- backup manifest path and rollback-point id
- diagnostics artifact paths
- host target-profile id and Debian 12 runtime notes
- summary of any drift or parity mismatch

### Exit rule
Only mark parity criteria true after the exact evidence bundle exists and is linked in the review packet.

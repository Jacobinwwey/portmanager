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
This document does not mark bootstrap parity as passed.
It defines the minimum artifact bundle that must exist before `/second-target-policy-pack` can move bootstrap parity beyond review-prep.

### Inputs
- Candidate host already exists with target profile `debian-12-systemd-tailscale`.
- `pnpm acceptance:verify` is green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm bootstrap parity still blocks review.
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

### Required artifacts
- bootstrap operation id
- bootstrap terminal result summary
- audit-index or replay reference linked to the same bootstrap
- host target profile confirmation showing `debian-12-systemd-tailscale`

### Exit rule
Keep bootstrap parity blocked until one review packet links all four artifacts back to the same bootstrap rehearsal.

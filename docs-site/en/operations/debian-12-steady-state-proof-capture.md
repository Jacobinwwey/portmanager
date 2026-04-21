---
title: "Debian 12 Steady-State Proof Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-steady-state-proof-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze one concrete steady-state proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark steady-state transport parity as passed.
It defines the minimum post-bootstrap artifact bundle that must exist before `/second-target-policy-pack` can move steady-state parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal.
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` already anchors bootstrap evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm steady-state parity still blocks review.
2. Run one normal controller-driven mutation after bootstrap:
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
   - Use any equivalent exposure-policy or rule mutation only if it preserves the same bounded evidence model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <post-mutation-operation-id> --json`
4. Capture steady-state health:
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
5. Capture steady-state runtime state:
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
6. Record one linked controller audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- post-mutation controller operation id
- steady-state `/health` capture
- steady-state `/runtime-state` capture
- controller audit-index or replay reference linked to the same mutation

### Exit rule
Keep steady-state transport parity blocked until one review packet links all four artifacts back to the same post-bootstrap mutation.

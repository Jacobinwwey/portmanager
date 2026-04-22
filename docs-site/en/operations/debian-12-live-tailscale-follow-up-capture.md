---
title: "Debian 12 Live Tailscale Follow-Up Capture"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md"
status: active
---
> Source of truth: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.2.0
### Purpose
Freeze one explicit live-Tailscale follow-up capture guide for `debian-12-systemd-tailscale`.
This guide starts only after `/second-target-policy-pack` opens bounded review and keeps the preserved Docker-bridge packet immutable as historical evidence.
It does not widen supported-target claims by itself.

### Inputs
- `portmanager operations second-target-policy-pack --json` shows `reviewAdjudication.state: review_open`.
- The same pack shows `liveTransportFollowUp.state: capture_required`.
- The current recorded address is still `172.17.0.2`.
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` stays preserved and untouched.
- `pnpm milestone:review:promotion-ready -- --limit 20` already passed wording review on the current mainline slice.
- `pnpm milestone:scaffold:live-packet -- --packet-date <date>`, `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`, and `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>` are available locally.
- One Debian 12 candidate host is reachable on a real Tailscale tailnet.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm the follow-up guide path, artifact root pattern, current recorded address, and required artifact ids.
2. Create one fresh artifact root for the new bounded packet with the repo-native scaffold helper:
   - `pnpm milestone:scaffold:live-packet -- --packet-date <date>`
3. Record one host detail snapshot that proves the candidate host is now on a live Tailscale-backed address:
   - `portmanager hosts get <host-id> --json`
4. Rehearse bounded bootstrap on that same candidate host and capture the linked controller operation:
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
   - `portmanager operation get <bootstrap-operation-id> --json`
5. Run one bounded steady-state mutation on the same host, then capture live transport evidence:
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
6. Record one controller audit or replay reference that links the new bootstrap plus steady-state captures into one bounded packet:
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
7. Feed those five real source artifacts into the repo-native assembly helper so the packet-local JSON files, canonical summary, and packet README stay synchronized without mutating the preserved Docker-bridge packet:
   - `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
8. Only pass `--captured-at <iso>` when operator review must override the newest valid source timestamp. Otherwise let the helper derive `candidateTargetProfileId`, `capturedAt`, and `capturedAddress`, and fail if host-detail versus bootstrap transport addresses drift.
9. `artifactFiles` must still point at packet-local files for all five required artifact ids. Use this minimum layout unless a successor template explicitly replaces it:
   - `candidate-host-detail.json`
   - `bootstrap-operation.json`
   - `steady-state-health.json`
   - `steady-state-runtime-state.json`
   - `controller-audit-index.json`
   - `live-transport-follow-up-summary.json`
10. Run the repo-native validator before commit:
   - `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
11. Update `docs/operations/portmanager-debian-12-review-packet-template.md` or a successor live packet README so every new artifact links back to `/second-target-policy-pack`.

### Required artifacts
- `candidate_host_with_tailscale_ip`: one host detail snapshot with a live Tailscale-backed address
- `bootstrap_operation_with_tailscale_transport`: one bootstrap operation result that resolves to the live Tailscale-backed address
- `steady_state_health_with_tailscale_transport`: one `/health` capture from the same live packet
- `steady_state_runtime_state_with_tailscale_transport`: one `/runtime-state` capture from the same live packet
- `linked_controller_audit_reference`: one audit-index or replay reference that links the live bootstrap and steady-state captures

### Canonical packet summary contract
- Filename: `live-transport-follow-up-summary.json`
- `candidateTargetProfileId` must stay `debian-12-systemd-tailscale`.
- `capturedAt` must be an ISO timestamp so controller can choose the newest valid packet deterministically.
- `capturedAddress` must be non-empty and must not stay `172.17.0.2`.
- `requiredArtifactIds` must include all five live follow-up artifact ids.
- `artifactFiles` must map each required artifact id to one packet-local file path that already exists under the same packet root.

### Exit rule
Keep `/second-target-policy-pack.liveTransportFollowUp.state` at `capture_required` until all five artifacts plus `live-transport-follow-up-summary.json` are preserved under one fresh live-Tailscale packet root.
Controller default truth now ignores newer invalid roots and only selects the newest valid packet root deterministically.
Scaffold-marked summary or artifact files are explicitly invalid and must be replaced before the validator can pass.
Do not overwrite the preserved Docker-bridge packet; keep it as historical evidence that still explains why broader support remained locked.

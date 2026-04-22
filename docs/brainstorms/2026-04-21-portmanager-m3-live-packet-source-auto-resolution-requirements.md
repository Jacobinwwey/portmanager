---
date: 2026-04-21
topic: portmanager-m3-live-packet-source-auto-resolution
---

# PortManager Milestone 3 Live Packet Source Auto-Resolution Requirements

Status note on `2026-04-21`: review adjudication, live-packet discovery, scaffold safety, scaffold -> assemble -> validate tooling, capture automation, roadmap blocker visibility, and remote `main` CI parity are already landed. Public `main` still stays `capture_required` because operators still have to discover the latest candidate host id and latest successful bootstrap operation id before the capture helper can run, and that manual lookup is now the narrowest repo-native Milestone 3 gap.

## Problem Frame
Current repo truth no longer lacks packet structure, capture logic, or validator rules:

- `/second-target-policy-pack` already exposes `review_open`, `reviewAdjudication.blockingDeltas`, and `liveTransportFollowUp.state: capture_required`
- `live-transport-follow-up-summary.json` already stays the canonical discovery contract
- `pnpm milestone:capture:live-packet` already fetches the five required live follow-up artifacts once a candidate host id and bootstrap operation id are known
- scaffold roots can already be upgraded safely, while non-scaffold packet roots stay protected without explicit `--force`

The remaining live queue is narrower.
Operators still have to stop before capture, inspect controller host inventory, identify the right candidate host, inspect bootstrap operations, and hand the latest successful ids back into the helper.
That lookup step is repetitive, drift-prone, and still weakens the claim that capture is the preferred repo-native path.

## Comparison Against Prior Milestone 3 Slices

| Prior slice | Current state | Result | Remaining implication |
| --- | --- | --- | --- |
| Review delta visibility | `container_bridge_transport_substitution` stays explicit through `/second-target-policy-pack.reviewAdjudication.blockingDeltas` | Landed | Keep blocker visible while reducing operator lookup drift |
| Live packet discovery | Newest valid packet root auto-discovery already works | Landed | Reuse the same summary contract after capture completes |
| Execution tooling | Scaffold, assemble, validate, and capture helpers already exist | Landed | Remove the last manual id lookup before capture |
| Capture automation | Controller plus agent evidence can already be fetched in one command once ids are known | Landed | Resolve those ids repo-natively instead of requiring a manual preflight |

## Requirements

**Repo-Native Source Auto-Resolution**
- R1. The capture helper must accept `--packet-date` and `--controller-base-url` as the only required capture arguments, while `--host-id` and `--bootstrap-operation-id` become optional overrides.
- R2. The capture helper must accept optional `--candidate-target-profile-id`, defaulting to `debian-12-systemd-tailscale`, so the bounded resolver stays explicit about which candidate lane it is selecting.
- R3. When `--host-id` and `--bootstrap-operation-id` are both omitted, the helper must resolve the latest successful bootstrap operation for the declared candidate target profile directly from controller `GET /hosts` plus `GET /operations`.
- R4. When `--host-id` is present but `--bootstrap-operation-id` is omitted, the helper must resolve the latest successful bootstrap operation for that same host from controller `GET /operations`.
- R5. When `--bootstrap-operation-id` is present but `--host-id` is omitted, the helper must derive `hostId` from that bootstrap operation detail and continue with the same bounded capture flow.
- R6. The helper must fail clearly when no candidate host matches the declared target profile, when no successful bootstrap operation exists for the resolved host, or when explicit `--host-id` and `--bootstrap-operation-id` refer to different hosts.
- R7. The helper must keep using the existing read-only capture flow, canonical packet summary contract, and validator logic after resolution completes.

**Docs And Progress Sync**
- R8. `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` must teach `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` as the preferred minimal path, while keeping explicit ids and scaffold/assemble helpers as fallback.
- R9. README, TODO, `Interface Document.md`, roadmap/progress docs, milestone/product strategy docs, and docs-site surfaces must mark capture automation as landed history and switch the active Milestone 3 map to this source-auto-resolution pair.
- R10. Developer-progress wording must stay conservative: repo-native capture becomes easier, but support still remains locked until one real committed live packet clears `container_bridge_transport_substitution`.

**Regression Coverage**
- R11. Milestone tooling tests must cover capture CLI parsing with omitted ids, controller-backed automatic resolution for the latest candidate bootstrap pair, and explicit-id mismatch failure.
- R12. Docs verification must keep the new active-map pair, minimal capture command, explicit override path, and preferred-capture wording aligned across roadmap and development-progress pages.

## Success Criteria
- One preferred repo-native command can discover the latest candidate host plus bootstrap ids and then fetch the five required live artifacts without manual controller inventory lookup.
- Explicit ids still remain available for bounded operator override and debugging.
- Public roadmap and development-progress surfaces both say the same thing: blocker truth stays open, source auto-resolution is active, and support remains locked until one validator-passing real packet lands on `main`.

## Scope Boundaries
- Do not fabricate or commit fake live Tailscale evidence.
- Do not automate probe, bootstrap, bridge-rule mutation, or any other controller write in this slice.
- Do not reopen standalone deployment, PostgreSQL-by-default, or broader Toward C debates here.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` remains the operator-facing capture guide.
- `docs/operations/portmanager-debian-12-review-packet-template.md` remains the canonical packet-layout reference.
- `apps/controller/src/second-target-policy-pack.ts` remains the only discovery-truth source for valid live packet roots.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-plan.md` for the concrete implementation units that add candidate host/bootstrap auto-resolution, retarget operator docs, and update roadmap/development-progress surfaces.

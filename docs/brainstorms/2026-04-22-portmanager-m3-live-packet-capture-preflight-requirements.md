---
date: 2026-04-22
topic: portmanager-m3-live-packet-capture-preflight
---

# PortManager Milestone 3 Live Packet Capture Preflight Requirements

Status note on `2026-04-22`: review adjudication, live-packet discovery, scaffold safety, scaffold -> assemble -> validate tooling, capture automation, source auto-resolution, roadmap blocker visibility, and remote `main` CI parity are already landed. Public `main` still stays `capture_required` because one real committed live packet still does not exist, and operators still lack one repo-native read-only preflight that shows exactly which candidate host, bootstrap operation, audit window, and agent URL capture will use before any packet files are written.

## Problem Frame
Current repo truth is stronger than before:

- `/second-target-policy-pack` already exposes `review_open`, `reviewAdjudication.blockingDeltas`, and `liveTransportFollowUp.state: capture_required`
- `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` already auto-resolves the latest candidate host plus bootstrap pair
- scaffold, assemble, validate, and capture helpers already keep canonical packet layout and validator truth aligned
- docs-site roadmap plus development-progress pages already publish the active source-auto-resolution lane

One bounded operator gap still remains.
The repo can now choose the right controller-side sources automatically, but it still cannot show operators a read-only preflight verdict before capture tries to write packet files.
That means operators still have to trust the helper blindly or discover capture blockers only after the write-oriented command starts.

## Comparison Against Prior Milestone 3 Slices

| Prior slice | Current state | Result | Remaining implication |
| --- | --- | --- | --- |
| Review delta visibility | `container_bridge_transport_substitution` stays explicit through `/second-target-policy-pack.reviewAdjudication.blockingDeltas` | Landed | Keep blocker visible while reducing operator uncertainty |
| Live packet discovery | Newest valid packet root auto-discovery already works | Landed | Reuse the same summary contract after one real packet lands |
| Execution tooling | Scaffold, assemble, validate, capture, and source auto-resolution already exist | Landed | Add one read-only preflight step before packet writing |
| Source auto-resolution | Minimal capture command resolves candidate host plus bootstrap ids repo-natively | Landed | Show that resolved plan and capture blockers before writing packet files |

## Requirements

**Read-Only Capture Preflight**
- R1. The live packet helper must add a `preview` action and repo script `pnpm milestone:preview:live-packet`.
- R2. The preview action must accept the same minimal controller-side inputs as capture: `--packet-date` and `--controller-base-url`, with optional `--candidate-target-profile-id`, `--host-id`, `--bootstrap-operation-id`, `--agent-base-url`, and `--audit-limit`.
- R3. The preview action must reuse the same bounded source-auto-resolution rules as capture so operators see the exact candidate host and bootstrap pair that capture would use.
- R4. The preview action must fetch controller host detail, bootstrap operation detail, and host-scoped audit index, but must not write packet files or mutate controller or agent state.
- R5. The preview action must report packet root, candidate target profile, resolved host id, resolved bootstrap operation id, captured address, derived agent base URL when available, audit window operation ids, and whether the bootstrap operation is present in the audit window.
- R6. The preview action must expose a single readiness verdict that stays false when capture would still fail because the agent base URL cannot be resolved or the bootstrap operation is missing from the chosen audit window.
- R7. The preview action must preserve clear failure behavior when explicit host/bootstrap overrides drift across different hosts.

**Docs And Progress Sync**
- R8. `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` must teach `pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url <url>` as the preferred read-only preflight before the minimal capture command.
- R9. README, TODO, `Interface Document.md`, roadmap/progress docs, milestone/product strategy docs, and docs-site surfaces must mark source auto-resolution as landed history and switch the active Milestone 3 map to this capture-preflight pair.
- R10. Developer-progress wording must stay conservative: preview makes operator review clearer, but support still remains locked until one validator-passing real packet clears `container_bridge_transport_substitution`.

**Regression Coverage**
- R11. Milestone tooling tests must cover preview CLI parsing, successful read-only preview resolution, blocked preview readiness when agent/audit prerequisites are missing, and continued explicit-id mismatch failure.
- R12. Docs verification must keep the new active-map pair, preview-first wording, minimal capture command, and bounded override path aligned across roadmap and development-progress pages.

## Success Criteria
- Operators can run one read-only repo-native preflight command and see exactly which host/bootstrap pair capture will use plus whether capture is currently ready.
- Capture blockers such as unresolved agent URL or too-small audit window appear before any packet-writing command runs.
- Public roadmap and development-progress surfaces both say the same thing: source auto-resolution is landed history, capture preflight is active, and support remains locked until one real packet lands on `main`.

## Scope Boundaries
- Do not fabricate or commit fake live Tailscale evidence.
- Do not write packet files from preview mode.
- Do not automate probe, bootstrap, bridge-rule mutation, or any other controller write in this slice.
- Do not widen supported-target claims for `debian-12-systemd-tailscale`.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` remains the operator-facing follow-up guide.
- `docs/operations/portmanager-debian-12-review-packet-template.md` remains the canonical packet-layout reference.
- `apps/controller/src/second-target-policy-pack.ts` remains the single discovery-truth source for valid live packet roots.

## Next Steps
- Move to `docs/plans/2026-04-22-portmanager-m3-live-packet-capture-preflight-plan.md` for the concrete implementation units that add the read-only preview flow, retarget operator docs, and update roadmap/development-progress surfaces.

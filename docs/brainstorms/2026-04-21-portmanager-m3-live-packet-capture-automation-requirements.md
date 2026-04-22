---
date: 2026-04-21
topic: portmanager-m3-live-packet-capture-automation
---

# PortManager Milestone 3 Live Packet Capture Automation Requirements

Status note on `2026-04-21`: review adjudication, live-packet discovery, scaffold safety, scaffold -> assemble -> validate tooling, roadmap blocker visibility, and remote `main` CI parity are already landed. Public `main` still stays `capture_required` because operators must manually fetch five live artifacts before the canonical packet can be assembled, and that manual step is now the narrowest real Milestone 3 gap.

## Problem Frame
Current repo truth no longer lacks packet structure or validator rules:

- `/second-target-policy-pack` already exposes `review_open`, `reviewAdjudication.blockingDeltas`, and `liveTransportFollowUp.state: capture_required`
- `live-transport-follow-up-summary.json` is already the canonical discovery contract
- `pnpm milestone:scaffold:live-packet`, `pnpm milestone:assemble:live-packet`, and `pnpm milestone:validate:live-packet` already exist
- newer malformed or scaffold-marked packet roots no longer clear the blocking delta

The remaining live queue is narrower.
Operators still have to run `portmanager hosts get`, `portmanager operation get`, two direct agent reads, and `portmanager operations audit-index`, then manually hand those five outputs to the assembly helper.
That manual fetch step is repetitive, drift-prone, and still leaves room for mismatched source scope even though the repo already knows the canonical packet layout and validator truth.

## Comparison Against Prior Milestone 3 Slices

| Prior slice | Current state | Result | Remaining implication |
| --- | --- | --- | --- |
| Review delta visibility | `/second-target-policy-pack.reviewAdjudication.blockingDeltas` keeps `container_bridge_transport_substitution` explicit | Landed | Keep blocker visible while reducing operator drift |
| Live packet discovery | Newest valid packet root auto-discovery already works | Landed | Reuse same summary contract and validator |
| Execution tooling | Scaffold, assemble, and validate helpers already exist | Landed | Add one higher-level capture helper instead of more manual packet choreography |
| Operator guidance | Guide and template already freeze canonical packet filenames and summary fields | Landed | Promote one preferred capture path and demote manual source gathering to fallback |

## Requirements

**Repo-Native Capture Path**
- R1. PortManager must ship one repo-native capture helper that fetches the five required live follow-up artifacts from real controller plus agent HTTP surfaces and writes one canonical packet root without hand-built intermediate JSON files.
- R2. The capture helper must accept `--packet-date`, `--controller-base-url`, `--host-id`, and `--bootstrap-operation-id`, plus optional `--agent-base-url`, `--audit-limit`, `--captured-at`, and `--force`.
- R3. The capture helper must fetch:
  - candidate host detail from controller
  - bootstrap operation detail from controller
  - steady-state `/health` from the live agent base URL
  - steady-state `/runtime-state` from the same live agent base URL
  - one controller audit index scoped to the same host and bounded review window
- R4. When `--agent-base-url` is omitted, the helper must derive it from the bootstrap operation transport summary and fail if no usable live base URL can be resolved.
- R5. The capture helper must fail when the host detail versus bootstrap transport addresses drift, or when the fetched audit index does not include the declared bootstrap operation within the bounded capture window.

**Safe Packet Mutation**
- R6. Assembly and capture must allow replacing a scaffold-only packet root without `--force`, so the documented scaffold -> capture or scaffold -> assemble workflow remains safe.
- R7. Assembly and capture must refuse to overwrite an existing non-scaffold packet root unless `--force` is explicitly provided.
- R8. Capture must reuse the existing canonical packet summary contract and validator logic rather than inventing a parallel discovery path.

**Docs And Progress Sync**
- R9. `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` must teach the capture helper as the preferred path while keeping scaffold plus assemble as fallback.
- R10. README, TODO, `Interface Document.md`, roadmap/progress docs, milestone/product strategy docs, and docs-site surfaces must mark the previous review-delta/execution-tooling slices as landed history and switch the active Milestone 3 map to this capture-automation pair.
- R11. Developer-progress wording must stay conservative: the repo now automates evidence collection better, but support still remains locked until one real committed live packet clears `container_bridge_transport_substitution`.

**Regression Coverage**
- R12. Milestone tooling tests must cover capture CLI parsing, capture success against mocked controller plus agent HTTP surfaces, and scaffold-root replacement without `--force`.
- R13. Docs verification must keep the new active-map pair, new capture command, and preferred-capture wording aligned across roadmap and development-progress pages.

## Success Criteria
- One repo-native command can fetch host detail, bootstrap operation, steady-state health, runtime-state, and audit-index evidence into the canonical live packet root.
- Scaffold roots remain invalid by design, but can be safely upgraded into real packet roots without deleting files by hand.
- Existing real packet roots are protected from accidental overwrite unless `--force` is explicit.
- Public roadmap and development-progress surfaces both say the same thing: blocker truth stays open, capture automation is active, and support remains locked until one validator-passing real packet lands on `main`.

## Scope Boundaries
- Do not automate probe, bootstrap, bridge-rule mutation, or any other controller write in this slice.
- Do not fabricate or commit fake live Tailscale evidence.
- Do not narrow supported-target claims for `debian-12-systemd-tailscale`.
- Do not reopen standalone deployment, PostgreSQL-by-default, or broader Toward C debates here.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` remains the operator-facing capture guide.
- `docs/operations/portmanager-debian-12-review-packet-template.md` remains the canonical packet-layout reference.
- `apps/controller/src/second-target-policy-pack.ts` remains the only discovery-truth source for valid live packet roots.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-live-packet-capture-automation-plan.md` for the concrete implementation units that add the capture helper, retarget operator docs, and update roadmap/development-progress surfaces.

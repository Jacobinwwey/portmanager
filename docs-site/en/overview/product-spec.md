---
title: "V1 Product Specification"
audience: shared
persona:
  - operator
  - admin
  - integrator
  - contributor
section: overview
sourcePath: "docs/specs/portmanager-v1-product-spec.md"
status: active
---
> Source of truth: `docs/specs/portmanager-v1-product-spec.md`
> Audience: `shared` | Section: `overview` | Status: `active`
> Updated: 2026-04-20 | Version: v0.4.15-confidence-promotion-ready
### Summary
PortManager V1 is a control plane for exposing selected remote localhost services over Tailscale without treating ad-hoc shell commands as the operating model.
The product goal is not only exposure, but safe exposure: desired state, operations history, diagnostics visibility, backup-before-mutation, and explicit rollback points.

### Product posture
- `docs-first` is a delivery rule, not a documentation preference.
- `One Host, One Rule, One Rollback` is the first implementation milestone and the acceptance center of gravity.
- Web, CLI, and future agent-driven automation are first-class peers over the same contract surface.
- The product must remain agent-friendly from day one, even before advanced agent workflows are implemented.

### Primary operator problems being solved
- Operators need a safer replacement for scattered SSH, ad-hoc system edits, and undocumented local port exposure scripts.
- Operators need visibility into whether a rule is merely configured, actually active, or silently degraded.
- Operators need a reliable way to prove that a target local service is reachable and visually responds as expected.
- Operators need a bounded rollback surface so PortManager never claims ownership over unrelated workloads.

### V1 in-scope baseline
- Split services architecture: React SPA web plus TypeScript controller API.
- Rust CLI and Rust agent as the execution-facing implementation layers for milestone work.
- Controller-side snapshot and diagnostics pipeline.
- Explicit operations model with event streaming.
- Backup and rollback as hard safety requirements.
- Local artifact store for snapshots, diagnostics, manifests, and operation evidence.
- Shared public contracts defined by OpenAPI and JSON Schema.
- Self-hosted deployment boundary for `controller + web`.

### V1 out-of-scope baseline
- Shipping milestone implementation code in the first upload.
- PostgreSQL as the default state store.
- Agent-side browser runtime or screenshot capture.
- Generic multi-platform host support beyond Ubuntu 24.04 with systemd and Tailscale.
- Managed Kubernetes, hosted SaaS, or multi-tenant control plane work.
- Mobile or desktop end-user clients.

### Locked assumptions
- The first remote target profile is `Ubuntu 24.04 + systemd + Tailscale`.
- Controller is the source of desired state.
- Agent is a bounded execution plane, not a peer strategist.
- SSH is bootstrap and rescue only.
- Runtime mutations must be auditable as operations.
- Destructive mutation cannot proceed if required local backup fails.

### Primary entities
- `Host`: a managed remote machine with bootstrap, readiness, and health state.
- `BridgeRule`: a desired localhost exposure rule.
- `ExposurePolicy`: the host-level guardrail for allowed sources, exclusions, and conflict handling.
- `HealthCheck`: machine-readable reachability and rule verification evidence.
- `Operation`: an auditable lifecycle record of work requested by API, CLI, or Web.
- `RollbackPoint`: a verified recovery target created around destructive mutations.
- `Backup`: a concrete stored bundle with manifest and checksums.
- `Snapshot` and `Diagnostic`: controller-captured evidence for a specific host, rule, and port.

### Product web expectations locked for V1
- Product web overview must use the provided control-console layout language, reinterpreted for PortManager semantics.
- The product must expose a host-centric main table, a contextual right rail, and a bottom event stream.
- Host detail must show current policy, rules, health, backups, rollback points, and recent diagnostics.
- Port detail must show webpage snapshot preview, transport reachability, HTTP result, and TLS basics when applicable.
- The VitePress docs site is a separate documentation surface and follows its own docs-site design baseline.

### Acceptance target for Milestone 1
A V1 implementation will be considered valid only if all of the following become true:
- one host can move from `draft` to `ready`
- one bridge rule can move from `desired` to `active`
- a destructive operation always creates a local backup first
- a failure leaves an operation record and rollback point
- controller diagnostics can produce both machine-readable results and webpage snapshot artifacts
- Web, CLI, and API observe the same host, rule, operation, and degraded state model

### Current implementation progress snapshot
- Already evidenced in code and tests: backup-before-mutation, rollback evidence, controller-side diagnostics capture, operation history, event replay, drift-driven degraded status, real host lifecycle resources, real bridge-rule CRUD, real exposure-policy management, live Web parity across the locked information architecture, and a controller-agent steady-state `HTTP over Tailscale` service path.
- Fresh acceptance evidence on `2026-04-17`: `pnpm acceptance:verify` passes; the embedded milestone proof now shows live bootstrap to `ready`, bridge-rule activation to `active` after controller diagnostics, live agent HTTP apply/runtime collection, and preserved backup/rollback evidence.
- Fresh Windows real-machine acceptance on `2026-04-18`: `pnpm acceptance:verify` passed again on the latest `main`, and development-progress docs validation now honors the committed generated confidence fallback when local `.portmanager` history is absent, matching the docs publication contract on a fresh machine instead of requiring an ignored local-only file.
- Fresh acceptance hardening on `2026-04-18`: the same development-progress docs validation now also tolerates a newer ignored local `.portmanager` history than the committed docs-site progress artifact, so local acceptance stays stable until docs generation is explicitly rerun.
- Controller-side rule lifecycle intentionally becomes `active` only after diagnostics while raw agent runtime remains `applied_unverified` until verification. That split keeps operator truth on the controller side without breaking current artifact compatibility.
- Fresh Milestone 2 slice on `2026-04-17`: agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- Fresh Milestone 2 orchestration slice on `2026-04-17`: `pnpm milestone:verify:confidence` now composes the standing `pnpm acceptance:verify` gate with the remote-backup replay proof, and `.github/workflows/mainline-acceptance.yml` now runs that heavier routine on `push main`, `workflow_dispatch`, and the daily scheduled history run.
- Fresh Milestone 2 confidence-history slice on `2026-04-17`: the canonical routine now writes `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md` with CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`, and CI restores/saves that bundle before uploading it so developers can inspect repeat-green evidence without digging through raw logs.
- Fresh Milestone 2 confidence-readiness slice on `2026-04-17`: the persisted history now classifies `local-only`, `building-history`, and `promotion-ready`, marks whether each run qualifies for readiness advancement, uses `7` qualified runs plus `3` consecutive qualified passes as the shared threshold, and publishes the same summary into the GitHub Actions job summary for developers.
- Fresh Milestone 2 confidence-history sync slice on `2026-04-17`: `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle artifacts from GitHub Actions back into local `.portmanager/reports/` files through authenticated `gh`, dedupes repeated imports by stable entry id, and gives developers a repo-native readiness review path that matches CI summary math.
- Fresh Milestone 2 confidence-review-signal slice on `2026-04-17`: the persisted snapshot now carries `latestQualifiedRun` plus visibility breakdown metadata for qualified mainline runs, local visibility-only runs, and non-qualified remote runs, and the summary now renders that split so newer local verification noise does not hide the actual latest mainline evidence.
- Fresh Milestone 2 confidence-progress-page slice on `2026-04-17`: the docs site now generates milestone confidence progress data, publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, and previews the same latest-qualified snapshot on roadmap home.
- Fresh Milestone 2 confidence-review-digest slice on `2026-04-20`: `pnpm milestone:review:confidence` now compares synced local readiness against the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, separates countdown alignment from visibility-only drift, and only fails on published-countdown mismatch when `--require-published-countdown-match` is requested explicitly.
- Fresh promotion-ready publication refresh on `2026-04-20`: after pulling the latest `main`, `pnpm milestone:sync:confidence-history -- --limit 20` imported 7 qualified `mainline-acceptance` runs through authenticated `gh`, `pnpm milestone:review:confidence` first exposed published countdown drift, `docs:generate:refresh-confidence` then republished the tracked docs artifact, and the synced plus published summary now truthfully report `promotion-ready` with `7/7` qualified runs, `7/3` qualified consecutive passes, and `0` remaining qualified runs. The latest qualified run is `24647442700/1` on `ddc15a3116d3`.
- Deep compare against the completed `2026-04-16` reconciliation docs now shows that the old parity and proof-orchestration gaps are closed; the remaining technical gap is now sustained qualified green history and the milestone-language review that follows from that evidence rather than more reporting scaffolding or review-signal fixes.
- Current product conclusion: the first trusted public control-plane slice is now real and accepted; Milestone 2 confidence maintenance now means syncing completed mainline evidence into local review, running `pnpm milestone:review:confidence`, reading the summary's latest-qualified signal plus the verification report and public development-progress page, refreshing the tracked public artifact deliberately when review agrees, and keeping qualified history green while human milestone-language review narrows wording. As of `2026-04-20`, both synced and published readiness truth are `promotion-ready`; promotion thresholds are met, so the countdown is closed and the remaining work is deliberate wording review rather than more readiness accumulation.

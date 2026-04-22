# PortManager

Updated: 2026-04-21
Version: v0.6.0-m3-phase0-enablement

## English

PortManager is a docs-first control plane for managing remote localhost exposure over Tailscale with explicit safety rails around backup, rollback, diagnostics, and operations visibility.

This repository started as a baseline repository, not as an implementation repository.
The first upload froze decisions, contracts, design language, and deployment boundaries before any milestone code was written.
The current branch now also includes Milestone 1 foundation code for workspace setup, contract generation, controller service skeletons, controller-side local backup, rollback, diagnostics, snapshot, and event-stream primitives, real controller `hosts` / `bridge-rules` / `exposure-policies` resources with host probe and bootstrap paths, contract-aligned Rust CLI host / rule / policy commands plus the earlier operations and event history surfaces, a long-lived Rust agent service boundary over `HTTP over Tailscale`, a React SPA shell for overview and host detail, and a one-host / one-rule / diagnostics / one-rollback verification script alongside the `GitHub Pages + VitePress` publishing layer.

### Current verified implementation progress
- Real today: contract generation, controller surfaces for `hosts`, `hosts/{hostId}`, `hosts/{hostId}/probe`, `hosts/{hostId}/bootstrap`, `bridge-rules`, `bridge-rules/{ruleId}`, `bridge-rules/{ruleId}/drift-check`, `exposure-policies/{hostId}`, plus `operations`, `events`, `backups`, `backups/run`, `health-checks`, `diagnostics`, `rollback-points`, `rollback-points/{id}/apply`, and `snapshots/diagnostics`.
- Real today: Rust CLI read and inspection commands for `operations`, `operation get`, `events`, `health-checks`, `backups`, `diagnostics`, `rollback-points`, `hosts`, `bridge-rules`, and `exposure-policies`, plus core write paths for host create/probe/bootstrap, bridge-rule create/update/delete, and exposure-policy apply.
- Real today: branch-level reliability slice with backup policy, drift-driven degraded state, recovery evidence, event history, and rollback inspection proved in `tests/controller/` and `tests/milestone/`.
- Acceptance re-verified on `2026-04-17`: `pnpm acceptance:verify` now passes after the Unit 4 agent-service delivery and the Unit 5 docs sync pass.
- Fresh Windows real-machine verification on `2026-04-18`: `pnpm acceptance:verify` passed again on the latest `main`, and the docs/development-progress validation now correctly accepts the committed generated confidence snapshot when local `.portmanager` history is absent, matching the docs-generation contract instead of requiring an ignored machine-local file.
- Fresh acceptance hardening on `2026-04-18`: development-progress docs validation no longer forces committed docs-site progress data to equal a newer ignored local `.portmanager` history snapshot. This keeps `pnpm acceptance:verify` hermetic on developer machines until `docs:generate` is intentionally rerun.
- Mainline acceptance is now formalized as a repeatable local and CI gate through `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`. This hardens delivery discipline, but it does not by itself advance Milestone 1 to accepted.
- Fresh promotion-ready maintenance checkpoint on `2026-04-21`: local `corepack pnpm acceptance:verify` still passed, the latest synced `mainline-acceptance` evidence now reaches run `24707884501`, the last published `docs-pages` proof before this refresh remained healthy at run `24707884469`, and the tracked confidence-progress artifact has now been deliberately refreshed to the latest reviewed `23/7` promotion-ready snapshot before publication.
- GitHub Actions already proved Unit 0 green on `main` on `2026-04-17`, so the acceptance gate now serves as standing branch discipline rather than active recovery work.
- Verified hardening from that acceptance pass: contract generation no longer depends on a Windows-fragile `openapi-typescript` CLI path, controller-operation SQLite tests now close handles before cleanup, CLI transport failures remain distinct from degraded business state even when upstream disconnects surface as `502`, and the Rust mock HTTP server no longer flakes on Windows nonblocking accepted sockets.
- Real today from Unit 1: controller-backed host draft lifecycle, host detail composition, host probe/bootstrap operations, bridge-rule CRUD with backup-aware destructive mutation, and exposure-policy get/put are all covered by `tests/controller/host-rule-policy.test.ts`.
- Real today from Unit 2: CLI parity for host, bridge-rule, and exposure-policy inspection and core write flows is now covered by `crates/portmanager-cli/tests/host_rule_policy_cli.rs`.
- Real today from Unit 3: `apps/web/src/main.ts` now loads controller-backed `overview`, `host-detail`, `hosts`, `bridge-rules`, `operations`, `backups`, and `console` views, and `tests/web/live-controller-shell.test.ts` proves live diagnostics detail, backup evidence, and event replay across those routes.
- Real today from Unit 4: `crates/portmanager-agent/src/main.rs` now exposes a long-lived `serve` command with `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback`; `apps/controller/src/agent-client.ts` now syncs desired state against that live agent URL, collects runtime state, and explicitly degrades unreachable hosts and rules. `crates/portmanager-agent/tests/agent_cli.rs` plus `tests/controller/agent-service.test.ts` prove both the live and unreachable-agent paths.
- Fresh milestone proof on `2026-04-17`: the embedded `pnpm milestone:verify` flow now shows host `draft -> ready`, bridge rule `desired -> active`, live agent HTTP bootstrap/apply/runtime collection, snapshot evidence, and preserved backup/rollback artifacts.
- Milestone 1 public-surface acceptance is now closed on the locked V1 boundary. Milestone 2 reliability hardening remains open and must advance only on this same live host / rule / policy model.
- Controller-side rule truth now becomes `active` after diagnostics while raw agent runtime remains `applied_unverified` until that verification step. That semantic split is now intentional shipped behavior, not a missing surface.
- Current web status: live controller-backed route parity is now real; mock factories remain only as preview fallback when no controller base URL is configured.
- Real today from early Milestone 2 follow-through: backup inventory now carries actionable remote-backup target, setup, status, and operator-action guidance across API, CLI text, Web views, and milestone proof output.
- Real today from the next Milestone 2 slice: live agent `/health` and `/runtime-state` now publish `agentVersion`; controller host summaries/details now persist `agentVersion` plus `agentHeartbeatAt`; API, CLI text, and Web host detail now expose `live` / `stale` / `unreachable` heartbeat semantics on the same host/rule/policy model.
- Real today from the current Milestone 2 slice: controller `GET /diagnostics` now accepts `state`, and Web host detail now groups latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence on the same live host/rule/policy model, proved by `tests/controller/diagnostics.test.ts`, `tests/web/web-shell.test.ts`, and `tests/web/live-controller-shell.test.ts`.
- Real today from the latest Milestone 2 slice: controller backup bundles now upload through the GitHub Contents API when `PORTMANAGER_GITHUB_BACKUP_ENABLED`, `PORTMANAGER_GITHUB_BACKUP_REPO`, and `PORTMANAGER_GITHUB_BACKUP_TOKEN` are configured; required-mode success and failure now stay explicit across API, CLI, Web, and `tests/milestone/reliability-github-backup.test.ts`.
- Real today from the newest Milestone 2 slice: `scripts/milestone/verify-reliability-remote-backup-replay.ts` now replays local-only, configured-success, and configured-failure required backups on the same live agent-backed host/rule flow, while `tests/milestone/reliability-remote-backup-replay.test.ts` and `tests/web/live-controller-shell.test.ts` prove API, CLI, Web backup views, and agent runtime stay aligned.
- Real today from Unit 6 and Unit 7: `pnpm milestone:verify:confidence` now composes the standing `pnpm acceptance:verify` gate with the remote-backup replay proof, while `.github/workflows/mainline-acceptance.yml` now runs that heavier confidence routine on `push main`, `workflow_dispatch`, and the daily scheduled history run without redefining the lighter PR gate.
- Real today from the next confidence-maintenance slice: each `pnpm milestone:verify:confidence` run now writes `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md`, and carries CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`; the mainline confidence job now restores and saves that history bundle across runs, then uploads `milestone-confidence-bundle-*` so repeat-green evidence stops living only in raw logs.
- Real today from the current readiness slice: persisted confidence history now classifies `local-only`, `building-history`, and `promotion-ready`, marks whether each run qualifies for milestone-readiness advancement, and measures progress against one explicit threshold: `7` qualified runs plus `3` consecutive qualified passes from `push`, `workflow_dispatch`, or `schedule` on `refs/heads/main`.
- Real today from the current readiness slice: `.github/workflows/mainline-acceptance.yml` now publishes `.portmanager/reports/milestone-confidence-summary.md` into the GitHub Actions job summary, so developers can inspect readiness progress without downloading artifacts first.
- Real today from the newest confidence-maintenance slice: `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle artifacts from GitHub Actions into local `.portmanager/reports/` history and summary files, dedupes repeated imports by stable entry id, and requires authenticated `gh` access with `repo` scope.
- Real today from the latest developer-review slice: the persisted confidence snapshot now records `latestQualifiedRun` plus a visibility breakdown for qualified mainline runs, local visibility-only runs, and non-qualified remote runs, so synced and local summaries keep real mainline evidence readable even after newer local verification noise.
- Real today from the new docs-publication slice: the docs site now generates `docs-site/data/milestone-confidence-progress.ts`, publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, and previews the same latest-qualified and visibility-breakdown snapshot directly on `/en/roadmap/` and `/zh/roadmap/`.
- Real today from the newest review-digest slice: `pnpm milestone:review:confidence` now compares synced local confidence history with the tracked `docs-site/data/milestone-confidence-progress.ts` artifact, writes `.portmanager/reports/milestone-confidence-review.md`, separates countdown alignment from local visibility-only drift, and keeps strict published-countdown failure behind `--require-published-countdown-match`.
- Real today from the newest wording-review slice: `pnpm milestone:review:promotion-ready -- --limit 20` now also writes `.portmanager/reports/milestone-wording-review.md`, freezing the current readiness gate, publication-alignment posture, `Source surface status`, and explicit claim posture before any milestone-language change.
- Real today from the current-run CI review-pack slice: `pnpm milestone:review:promotion-ready -- --skip-sync` now lets the `mainline-acceptance` confidence job reuse the just-written local confidence artifacts, append `.portmanager/reports/milestone-confidence-review.md` plus `.portmanager/reports/milestone-wording-review.md` to the job summary, and upload both files inside `milestone-confidence-bundle-*`.
- Real today from the review-pack fetch slice: `pnpm milestone:fetch:review-pack` now downloads that uploaded current-run bundle back into `.portmanager/reports/current-ci-review-pack/`, writes `review-pack-manifest.json`, and gives developers one repo-native CI-first review surface without manual GitHub artifact browsing.
- Fresh promotion-ready publication refresh on `2026-04-21`: after pulling the latest `main`, `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` synced completed `mainline-acceptance` runs through authenticated `gh`, wrote the review digest, and republished the tracked docs artifact from the same completed workflow evidence. Exact live counters and the latest qualified run now stay on the generated development-progress page plus the tracked confidence artifact instead of brittle root-doc hard-coding.
- Fresh docs-publication contract on `2026-04-18`: default docs generation now reuses the committed `docs-site/data/milestone-confidence-progress.ts` artifact, and only `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` is allowed to republish that tracked snapshot from local `.portmanager` history.
- Fresh Node 24 workflow-runtime proof on `2026-04-20`: forcing GitHub workflow JavaScript actions onto Node 24 did not break `mainline-acceptance` or `docs-pages`; remaining Node 20 deprecation annotations now come from GitHub official action metadata rather than repo-local workflow drift.
- Deep compare against the `2026-04-16` requirements and reconciliation plan now shows that the old Unit 1 through Unit 7 proof-orchestration gap is closed in code; the remaining technical gap is no longer missing history scaffolding, local import plumbing, or summary-truth review metadata, but the explicit Milestone 3 seams that Scheme C still requires.
- New direction docs now extend that chain through the full Milestone 2 confidence series and into Milestone 3 entry: the earlier enablement baseline remains documented in `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`, the landed live-follow-up slice is preserved in `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`, the landed discovery slice is now preserved in `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`, and the active implementation map is now `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`. Units 63 through 76 stay landed history with one preserved Debian 12 review packet, artifact coverage `20/20`, `review_open`, landed filesystem-backed discovery, and repaired remote `main` CI parity after the stale live-loader `hold` expectation moved to `review_required`; the remaining gap is narrower: `/second-target-policy-pack.liveTransportFollowUp` still defaults to `capture_required` because no real live Tailscale packet is committed yet.
- Active execution lane now keeps Milestone 3 inside bounded `Phase 0 enablement` while Milestone 2 stays the guardrail truth surface: continue using `pnpm milestone:review:promotion-ready -- --limit 20`, `pnpm milestone:fetch:review-pack`, `.portmanager/reports/milestone-wording-review.md`, the verification report, and the public development-progress page to keep public wording honest. Units 51 through 62 remain the landed enablement baseline, Units 63 through 76 stay landed history, and the next queue is Units 77 through 79 live packet execution tooling: keep the preserved Debian 12 Docker-bridge packet immutable, keep the compatibility-safe `/api/controller` consumer boundary, `audit-review-service`, target-profile registry, `/persistence-decision-pack`, `/consumer-boundary-decision-pack`, `/deployment-boundary-decision-pack`, and `/second-target-policy-pack` stable, ship `pnpm milestone:scaffold:live-packet` plus `pnpm milestone:validate:live-packet`, reject scaffold markers by design, and move toward one real committed live packet without manual packet-root guesswork. The synced and published readiness state remains `promotion-ready`; exact live counters and the latest qualified run stay on the development-progress page plus the tracked confidence artifact, while Milestone 3 continues without pretending Scheme C is already delivered.

### Immediate execution order
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now run through the shared store and runner without regressing backup, rollback, diagnostics, drift, or event evidence.
- `Unit 2`: complete. Rust CLI host, bridge-rule, and exposure-policy read/write flows now mirror the controller-backed resource model with `--json` and wait-aware polling.
- `Unit 3`: complete. Web route parity now covers controller-backed `Hosts`, `Bridge Rules`, `Backups`, `Console`, live overview/host detail/operations, and diagnostics detail.
- `Unit 4`: complete. The agent now serves the locked `HTTP over Tailscale` boundary and controller syncs desired state over it while preserving current artifact formats.
- `Unit 5`: complete. `pnpm acceptance:verify` was replayed, roadmap and product docs were synced, and Milestone 1 wording moved to accepted public-surface status.
- `Unit 6`: complete. `scripts/acceptance/confidence.mjs` now keeps one canonical step runner for `pnpm acceptance:verify` and `pnpm milestone:verify:confidence` without changing Unit 0 semantics.
- `Unit 7`: complete. `.github/workflows/mainline-acceptance.yml` now keeps PR validation on `pnpm acceptance:verify` and runs `pnpm milestone:verify:confidence` on `push main`, `workflow_dispatch`, and the daily scheduled history lane.
- `Confidence history bundle slice`: complete. `pnpm milestone:verify:confidence` now writes `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, and `.portmanager/reports/milestone-confidence-summary.md`; CI restores and saves the history bundle across runs and uploads it as `milestone-confidence-bundle-*` for developers to inspect.
- `Confidence readiness slice`: complete. Persisted confidence history now classifies `local-only`, `building-history`, and `promotion-ready`, marks qualified readiness runs, and publishes the same summary into the GitHub Actions run page.
- `Confidence history sync slice`: complete. `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle history from GitHub Actions into local readiness review with deduped entries and the same shared readiness math.
- `Confidence review-signal slice`: complete. Synced and local `.portmanager/reports/milestone-confidence-summary.md` output now separates `Latest Run` from `Latest Qualified Run` and counts visibility-only local versus non-qualified remote noise, so developer review no longer loses real mainline evidence after local reruns.
- `Confidence progress page slice`: complete. The docs site now publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress` from generated milestone confidence data, and roadmap home now previews the same readiness snapshot.
- `Confidence review digest slice`: complete. `pnpm milestone:review:confidence` now gives developers one repo-native comparison between synced local readiness and the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, and separates countdown drift from visibility-only drift before any docs refresh decision.
- `Confidence wording-review slice`: complete. `pnpm milestone:review:promotion-ready` now also emits `.portmanager/reports/milestone-wording-review.md`, so developers get one local checklist for wording guardrails, `Source surface status`, publication-alignment posture, and claim posture.
- `Confidence review-pack CI slice`: complete. `pnpm milestone:review:promotion-ready -- --skip-sync` now lets `mainline-acceptance` publish `.portmanager/reports/milestone-confidence-review.md` plus `.portmanager/reports/milestone-wording-review.md` from the current run in the uploaded bundle and job summary.
- `Confidence review-pack fetch slice`: complete. `pnpm milestone:fetch:review-pack` now downloads the latest completed `mainline-acceptance` review bundle or one explicit `--run-id`, stages the current-run review files under `.portmanager/reports/current-ci-review-pack/`, and writes `review-pack-manifest.json` for durable CI-first review.
- `Unit 53`: complete. Controller now exposes `/event-audit-index`, reuses the same accepted evidence model for indexed review reads, and Web Operations plus Console now show shared indexed event/audit review panels without reopening transport concentration.
- `Unit 54`: complete. Controller store now runs behind a SQLite-backed persistence adapter seam, measures PostgreSQL readiness pressure from real store counts, and keeps existing store behavior unchanged behind that new boundary.
- `Unit 55`: complete. `/event-audit-index` and `/persistence-readiness` now ship as generated contract surfaces, CLI `operations audit-index` plus `operations persistence-readiness` mirror controller reads, and Web Overview plus Console expose persistence-readiness detail for developer review.
- `Unit 56`: complete. Controller now serves `/api/controller/*` as a gateway-ready consumer boundary while preserving legacy direct routes, Web keeps prefixed base URLs intact, and CLI now accepts `PORTMANAGER_CONSUMER_BASE_URL` without breaking older controller-base configuration.
- `Unit 57`: complete. Controller replay and indexed audit review now run behind one explicit `audit-review-service` owner, batch/diagnostics/backup/rollback linkage stays queryable inside the same boundary, and legacy plus `/api/controller` event routes stay compatible.
- `Governance slice`: complete. `docs/operations/portmanager-second-target-review-contract.md`, `docs/operations/portmanager-debian-12-acceptance-recipe.md`, and `docs/operations/portmanager-debian-12-operator-ownership.md` now freeze review-prep wording, proof sequence, and ownership for `debian-12-systemd-tailscale` without widening supported-target claims.
- `Next lane`: Milestone 3 `Phase 0 enablement` on top of the same accepted live slice: keep `pnpm milestone:review:promotion-ready -- --limit 20` and `pnpm milestone:fetch:review-pack` as the Milestone 2 wording guardrails, keep the landed `/persistence-decision-pack`, `/consumer-boundary-decision-pack`, `/deployment-boundary-decision-pack`, and `/second-target-policy-pack` review surfaces, target-profile registry, and `/api/controller` consumer boundary stable, and treat `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md` as the current map. Units 63 through 76 stay landed history, the first complete bounded Debian 12 review packet remains preserved at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`, guide coverage stays complete, artifact coverage is `20/20`, and `/second-target-policy-pack` still exposes `review_open`, pending adjudication verdicts, plus `liveTransportFollowUp.state: capture_required` with guide path `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`; the active work is to use the scaffold plus validator helpers to prepare one real committed live packet while discovery and support-lock logic stay conservative.

### Locked V1 shape
- `web`: TypeScript React SPA
- `controller`: TypeScript REST + SSE API service
- `cli`: Rust first-class automation entrypoint
- `agent`: Rust minimal remote execution plane
- `future shared core`: Rust crates for reusable execution and platform abstractions

### Locked protocol and storage decisions
- Contracts: `OpenAPI + JSON Schema + code generation`
- Controller API: `REST + SSE`
- Controller to agent: `HTTP over Tailscale`
- Bootstrap and rescue: `SSH only`
- Human-maintained config: `TOML`
- Protocol payloads, snapshots, exports: `JSON`
- V1 state store: `SQLite`
- Future migration target: `PostgreSQL`

### Locked V1 product boundary
- First milestone: `One Host, One Rule, One Rollback`
- Controller-side webpage snapshot and connectivity diagnostics
- Frontend visibility for snapshot preview, reachability, HTTP basics, and TLS basics
- Mandatory local backup before destructive mutation
- Optional GitHub private backup implemented as a V1 supported boundary
- Self-hosted control plane Docker boundary for `controller + web`
- Human and Agent documentation are split at the top level of the published docs site
- The VitePress docs site follows its own docs-first design baseline and does not inherit the product console mother-template
- Quick Start installation entrypoints are frozen as public distribution contracts and explicitly marked `Planned`
- Roadmap is published as a first-class docs page with product and engineering tracks
- No business implementation code in the initial upload; Milestone 1 foundation work now continues in branch development with contracts, controller, CLI, agent execution foundations, the first web control-plane shell, and milestone verification flow

### Repository layout
- `docs/specs/` stores product specifications, milestones, information architecture, diagnostics, SDK, Docker, and baseline checklists
- `docs/architecture/` stores architecture, contracts, and bootstrap decisions
- `docs/operations/` stores operational safety policy, especially backup and rollback
- `docs/design/` stores the product-console design baseline, the docs-site design baseline, and reference assets
- `docs-site/` stores the VitePress publishing layer for GitHub Pages
- `apps/` stores early TypeScript controller and web skeletons
- `crates/` stores early Rust CLI and agent skeletons
- `packages/typescript-contracts/` stores generated TypeScript contract surfaces
- `scripts/docs/` stores locale extraction and publishing support scripts
- `scripts/contracts/` stores contract generation and drift-check tooling
- `.github/workflows/` stores docs deployment and mainline acceptance automation
- `packages/contracts/openapi/` stores the controller API draft
- `packages/contracts/jsonschema/` stores runtime, backup, rollback, and diagnostics schemas

### Reading order
1. `docs/specs/portmanager-v1-baseline-checklist.md`
2. `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
3. `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
4. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
5. `docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
6. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-readiness-requirements.md`
7. `docs/plans/2026-04-17-portmanager-m2-confidence-readiness-plan.md`
8. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-history-sync-requirements.md`
9. `docs/plans/2026-04-17-portmanager-m2-confidence-history-sync-plan.md`
10. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-review-signal-requirements.md`
11. `docs/plans/2026-04-17-portmanager-m2-confidence-review-signal-plan.md`
12. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-progress-page-requirements.md`
13. `docs/plans/2026-04-17-portmanager-m2-confidence-progress-page-plan.md`
14. `docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md`
15. `docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md`
16. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-review-digest-requirements.md`
17. `docs/plans/2026-04-20-portmanager-m2-confidence-review-digest-plan.md`
18. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md`
19. `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md`
20. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md`
21. `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md`
22. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md`
23. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md`
24. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md`
25. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md`
26. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md`
27. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md`
28. `docs/specs/portmanager-v1-product-spec.md`
29. `docs/architecture/portmanager-v1-architecture.md`
30. `docs/design/portmanager-overview-design-baseline.md`
31. `docs/design/portmanager-docs-site-design-baseline.md`
30. `packages/contracts/README.md`

### Docs site commands
- install: `corepack pnpm --dir docs-site --ignore-workspace install --frozen-lockfile --prefer-offline`
- generate locale pages: `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- republish confidence progress from synced local history: `corepack pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- build the published docs site: `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

### Milestone verification
- run the full mainline acceptance gate locally: `corepack pnpm acceptance:verify`
- run the canonical milestone confidence routine locally: `pnpm milestone:verify:confidence`
- sync completed GitHub Actions confidence history into local review: `pnpm milestone:sync:confidence-history -- --limit 20`
- run the repo-native promotion review helper: `pnpm milestone:review:promotion-ready -- --limit 20`
- inspect latest local confidence report: `.portmanager/reports/milestone-confidence-report.json`
- inspect latest local confidence history: `.portmanager/reports/milestone-confidence-history.json`
- inspect latest local confidence summary: `.portmanager/reports/milestone-confidence-summary.md`
- inspect latest local wording-review checklist: `.portmanager/reports/milestone-wording-review.md`
- inspect latest local claim posture: `Public claim class`, `Source surface status`, plus `Required next action` inside `.portmanager/reports/milestone-wording-review.md`
- sync prerequisite: authenticated `gh` CLI with `repo` scope so workflow runs and artifacts can be read
- readiness threshold: `7` qualified mainline runs + `3` consecutive qualified passes
- developer progress view in GitHub Actions: `mainline-acceptance` job summary
- developer progress view in repo: synced `.portmanager/reports/milestone-confidence-summary.md`, which now separates latest visible run from latest qualified run and shows visibility breakdown
- developer progress view in docs site: `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, with roadmap-home preview cards on `/en/roadmap/` and `/zh/roadmap/`
- run the current one-host / one-rule / diagnostics / one-rollback / event-stream proof: `pnpm milestone:verify`
- run the current multi-state remote-backup replay proof: `pnpm milestone:verify:reliability-remote-backup-replay`

## 中文

PortManager 是一个以 docs-first 为原则的控制平面项目，用于通过 Tailscale 管理远端 localhost 暴露能力，并显式提供备份、回滚、诊断与操作可见性等安全护栏。

这个仓库最初刻意是“基线仓库”，而不是“实现仓库”。
首次上传先冻结决策、契约、设计语言与部署边界，之后才进入里程碑代码实现。
当前分支已经加入 Milestone 1 的基础实现代码，包括 workspace、契约生成链路、controller 服务骨架、controller 侧本地备份、回滚、诊断、快照与事件流原语、真实 controller `hosts` / `bridge-rules` / `exposure-policies` 资源与 host probe / bootstrap 路径、与这些资源对齐的 Rust CLI host / rule / policy 命令和既有 operations / event history 表面、通过 `HTTP over Tailscale` 提供长驻服务边界的 Rust agent、overview / host detail 的 React SPA shell，以及单主机 / 单规则 / 诊断 / 单回滚验证脚本，同时保留 `GitHub Pages + VitePress` 文档发布层。

### 当前已验证的实现进度
- 已真实落地：契约生成、controller 的 `hosts`、`hosts/{hostId}`、`hosts/{hostId}/probe`、`hosts/{hostId}/bootstrap`、`bridge-rules`、`bridge-rules/{ruleId}`、`bridge-rules/{ruleId}/drift-check`、`exposure-policies/{hostId}`，以及 `operations`、`events`、`backups`、`backups/run`、`health-checks`、`diagnostics`、`rollback-points`、`rollback-points/{id}/apply`、`snapshots/diagnostics` 等运行路径。
- 已真实落地：Rust CLI 的 `operations`、`operation get`、`events`、`health-checks`、`backups`、`diagnostics`、`rollback-points`、`hosts`、`bridge-rules`、`exposure-policies` 查询能力，以及 host create / probe / bootstrap、bridge-rule create / update / delete、exposure-policy apply 与 operation / rollback 的等待轮询能力。
- 已真实落地：`tests/controller/` 与 `tests/milestone/` 已证明 backup policy、drift 驱动 degraded、recovery 证据、event history 与 rollback 检查这一条可靠性切片。
- 已于 `2026-04-17` 重新拿到整套验收证据：在 Unit 4 agent-service 交付与 Unit 5 文档同步之后，`pnpm acceptance:verify` 已重新通过。
- 已于 `2026-04-18` 在 Windows 真机上再次完成主线验收：最新 `main` 上的 `pnpm acceptance:verify` 再次通过，而且 docs/development-progress 校验现在已经与发布契约对齐，在本地 `.portmanager` 历史缺失时会接受已提交的 generated confidence snapshot，而不再错误要求一个被忽略的本机文件必须存在。
- 已于 `2026-04-18` 继续完成一轮 acceptance 加固：development-progress docs 校验不再强制要求已提交的 docs-site progress data 必须与一个更新的、被忽略的本地 `.portmanager` 历史快照完全相等，因此在开发者机器上，`pnpm acceptance:verify` 可以在未主动重跑 `docs:generate` 前继续保持 hermetic。
- 主线验收现在已经通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 被正式固化为可重复的本地与 CI gate。它提升了主线交付纪律，但并不意味着 Milestone 1 已经完成验收。
- 已于 `2026-04-21` 新增 promotion-ready 维护检查点：本地 `corepack pnpm acceptance:verify` 继续通过，最新同步的 `mainline-acceptance` 证据已经推进到 run `24707884501`，这次刷新前最近一次已发布 `docs-pages` 证明仍保持在 run `24707884469` 且健康，被跟踪的 confidence-progress artifact 现在也已经在发布前被有意刷新到最新评审过的 `23/7` promotion-ready 快照。
- GitHub Actions 已在 `2026-04-17` 证明 Unit 0 在 `main` 上转绿，因此主线验收 gate 现在已经从“待建立纪律”转为“持续保持的分支纪律”。
- 这轮验收同时固化了 Windows 侧加固项：契约生成不再依赖在 Windows 上脆弱的 `openapi-typescript` CLI 路径，controller operation 的 SQLite 测试在清理前显式关闭句柄，CLI 在上游断连被映射为 `502` 时仍然把它识别为 `transport` 而不是业务 `degraded`，Rust mock HTTP server 也不再受 Windows 非阻塞 accepted socket 抖动影响。
- Unit 1 现状：controller-backed 的 host draft 生命周期、host detail 组合、host probe / bootstrap operation、带备份证据的 bridge-rule CRUD，以及 exposure-policy get / put 已经由 `tests/controller/host-rule-policy.test.ts` 证明。
- Unit 2 现状：CLI 的 host、bridge-rule、exposure-policy 检查与核心写入流已经真实落地，并由 `crates/portmanager-cli/tests/host_rule_policy_cli.rs` 覆盖。
- Unit 3 现状：`apps/web/src/main.ts` 现在已经能加载 controller-backed 的 `overview`、`host-detail`、`hosts`、`bridge-rules`、`operations`、`backups`、`console` 视图；`tests/web/live-controller-shell.test.ts` 也已证明 live diagnostics detail、backup 证据与 event replay 已贯通这些页面。
- Unit 4 现状：`crates/portmanager-agent/src/main.rs` 已经提供长驻 `serve` 命令以及 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`；`apps/controller/src/agent-client.ts` 现在会对 live agent URL 推送 desired state、收集 runtime state，并在 agent 不可达时显式把 host / rule 置为 degraded。`crates/portmanager-agent/tests/agent_cli.rs` 与 `tests/controller/agent-service.test.ts` 已覆盖 live 与 unreachable-agent 两条路径。
- 最新 milestone proof 也已经证明 host `draft -> ready`、bridge rule `desired -> active`、live agent HTTP bootstrap/apply/runtime collection，以及 backup / rollback 证据保持不变。
- Milestone 1 的公共表面验收已经在锁定 V1 边界上闭环。Milestone 2 的可靠性加固仍然未完成，而且必须继续建立在这同一套 live host / rule / policy 模型上。
- controller 侧规则真相现在会在 diagnostics 之后进入 `active`，而原始 agent runtime 在那之前仍保持 `applied_unverified`。这已经是刻意保留的已交付语义，不再是缺失表面。
- 当前 Web 状态：live controller-backed 路由一致性已经真实落地；在没有配置 controller base URL 时，mock factory 只作为预览回退存在。
- 当前也已补上早期 Milestone 2 跟进项：backup 清单现在会在 API、CLI 文本、Web 视图与 milestone proof 输出中统一暴露可操作的远端备份目标、配置、状态与操作提示。
- 当前也已补上下一段 Milestone 2 切片：live agent `/health` 与 `/runtime-state` 现在会显式发布 `agentVersion`；controller host summary/detail 会持久化 `agentVersion` 与 `agentHeartbeatAt`；API、CLI 文本与 Web host detail 现在都能暴露 `live` / `stale` / `unreachable` 的 heartbeat 语义。
- 当前也已补上这一段 Milestone 2 切片：`GET /diagnostics` 现在支持 `state` 过滤；Web host detail 已经按最新诊断、degraded 诊断历史、recovery-ready 成功证据分组展示，并由 `tests/controller/diagnostics.test.ts`、`tests/web/web-shell.test.ts`、`tests/web/live-controller-shell.test.ts` 证明。
- 当前也已补上最新 Milestone 2 切片：当 `PORTMANAGER_GITHUB_BACKUP_ENABLED`、`PORTMANAGER_GITHUB_BACKUP_REPO`、`PORTMANAGER_GITHUB_BACKUP_TOKEN` 已配置时，controller 现在会把 backup bundle 通过 GitHub Contents API 上传；required-mode 成功与失败路径现在已经在 API、CLI、Web 与 `tests/milestone/reliability-github-backup.test.ts` 中保持显式一致。
- 当前也已补上最新一段 Milestone 2 切片：`scripts/milestone/verify-reliability-remote-backup-replay.ts` 现在会在同一条 live agent-backed host/rule 流程上重放 local-only、configured-success、configured-failure 三类 required backup；`tests/milestone/reliability-remote-backup-replay.test.ts` 与 `tests/web/live-controller-shell.test.ts` 也已经证明 API、CLI、Web backup 视图与 agent runtime 仍然讲同一套证据故事。
- 当前也已补上 Unit 6 与 Unit 7：`pnpm milestone:verify:confidence` 现在已经把既有 `pnpm acceptance:verify` gate 与 remote-backup replay proof 收敛成一条规范 routine；`.github/workflows/mainline-acceptance.yml` 也已在 `push main`、`workflow_dispatch` 与每日 schedule 历史收集路径上运行这条更重的 routine，同时保留更轻的 PR gate。
- 当前也已补上下一段 confidence-maintenance 切片：每次 `pnpm milestone:verify:confidence` 运行现在都会写出 `.portmanager/reports/milestone-confidence-report.json`、追加 `.portmanager/reports/milestone-confidence-history.json`、渲染 `.portmanager/reports/milestone-confidence-summary.md`，并附带 `eventName`、`ref`、`sha`、`runId`、`runAttempt`、`workflow` 等 CI traceability 字段；主线 confidence job 现在还会跨 run 恢复并保存这组 history bundle，再上传 `milestone-confidence-bundle-*` artifact，让持续转绿历史不再只停留在原始日志里。
- 当前也已补上 current-run CI review-pack 切片：`pnpm milestone:review:promotion-ready -- --skip-sync` 现在会让 `mainline-acceptance` confidence job 复用刚写出的本地 confidence artifacts，把 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 同时追加到 job summary，并一并上传进 `milestone-confidence-bundle-*`。
- 当前也已补上 review-pack fetch 切片：`pnpm milestone:fetch:review-pack` 现在会把这组上传后的 current-run review bundle 重新落到 `.portmanager/reports/current-ci-review-pack/`，写出 `review-pack-manifest.json`，让开发者不再需要手动点击 GitHub artifact。
- 当前也已补上 confidence readiness 切片：持久 confidence history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，标记每次 run 是否真正属于里程碑推进资格范围，并用 `7` 次 qualified run 加 `3` 次连续 qualified pass 作为统一阈值。
- 当前也已补上开发者可见性切片：`.github/workflows/mainline-acceptance.yml` 现在会把 `.portmanager/reports/milestone-confidence-summary.md` 直接写进 GitHub Actions job summary，开发者无需先下载 artifact 就能查看 readiness 进度。
- 当前也已补上最新的 confidence-maintenance 切片：`pnpm milestone:sync:confidence-history` 现在会通过已认证且具备 `repo` scope 的 `gh`，把 GitHub Actions 已完成 `mainline-acceptance` bundle artifact 导回本地 `.portmanager/reports/`，按稳定 history entry id 去重，并让开发者在本地复核与 CI 相同的 readiness 结论。
- 当前也已补上最新的开发者复核切片：持久 confidence snapshot 现在会额外记录 `latestQualifiedRun`，并把 qualified mainline run、本地 visibility-only run、非 qualified 远端 run 分开统计，让同步后的 summary 在本地 rerun 之后仍然能清楚暴露真实主线证据。
- 当前也已补上新的 docs-publication 切片：docs-site 现在会生成 `docs-site/data/milestone-confidence-progress.ts`，公开发布 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，并在 `/en/roadmap/` 与 `/zh/roadmap/` 首页直接预览同一份 latest-qualified / visibility-breakdown 快照。
- 当前也已补上最新的 review-digest 切片：`pnpm milestone:review:confidence` 现在会把同步后的本地 confidence history 与已跟踪 `docs-site/data/milestone-confidence-progress.ts` 产物直接对比，写出 `.portmanager/reports/milestone-confidence-review.md`，把 countdown 对齐状态与本地 visibility-only 漂移拆开汇报，并且只在显式传入 `--require-published-countdown-match` 时才把公开倒计时不一致变成失败。
- 当前也已补上最新的 wording-review 切片：`pnpm milestone:review:promotion-ready -- --limit 20` 现在还会额外写出 `.portmanager/reports/milestone-wording-review.md`，把当前 readiness gate、公开对齐状态、`Source surface status` 与待复核 source surfaces 冻结成一份本地清单。
- 已于 `2026-04-21` 完成最新一次 promotion-ready 发布刷新：拉取最新 `main` 后，`pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` 已通过已认证 `gh` 同步 completed `mainline-acceptance` 运行、写出 review digest，并把被跟踪 docs 产物重发到同一份已完成 workflow 证据；精确的实时计数与最新 qualified run 现在统一以下发到 development-progress 页面与被跟踪 confidence artifact 为准，而不再在 root docs 里硬编码易漂移数字。
- 已于 `2026-04-18` 继续冻结 docs 发布契约：默认 docs 生成现在会复用已提交的 `docs-site/data/milestone-confidence-progress.ts`，只有 `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` 才允许把本地 `.portmanager` history 显式提升为新的公开快照。
- 已于 `2026-04-20` 新增 Node 24 workflow-runtime 证明：在把 GitHub workflow JavaScript actions 强制运行到 Node 24 之后，`mainline-acceptance` 与 `docs-pages` 仍然保持通过；当前剩余的 Node 20 退役 annotation 现在已经收敛为 GitHub 官方 action 元数据层面的上游 warning，而不是 repo 本地 workflow 漂移。
- 深度对比 `2026-04-16` 的需求文档与 reconciliation plan 之后，现在已经可以确认：旧的 Unit 1 到 Unit 7 证明编排缺口都已在代码中闭环；剩余技术缺口已经不再是历史脚手架缺失、本地导入路径缺失，或 summary 复核语义缺失，而是 Scheme C 仍然需要补上的显式 Milestone 3 seam。
- 新的方向文档已经在此前完整的 Milestone 2 confidence 文档链之上，继续进入 Milestone 3：此前补上的 `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` 继续作为 enablement 基线，已落地的 live follow-up 切片保留在 `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`，已落地的 discovery 切片保留在 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`，而当前激活的实现地图已经切到 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`。此前公开的 Units 63 through 76 现在已经全部成为已落地历史，artifact coverage 继续保持 `20/20`，remote `main` 的 CI 也已经在把 stale live-loader `hold` 预期修正到 `review_required` 后恢复一致；但 `/second-target-policy-pack.liveTransportFollowUp` 仍然默认停在 `capture_required`，因为 repo 里还没有一份真实提交的 live Tailscale packet。
- remote-backup-replay 切片之后，主动执行主线现在已经转向 Milestone 3 的有边界 enablement，同时继续保留 Milestone 2 的 promotion-ready 文案复核与 gate 健康作为真相护栏：继续执行 `pnpm milestone:review:promotion-ready -- --limit 20` 这条 repo-native helper；如果第一问题是当前 CI run，就先执行 `pnpm milestone:fetch:review-pack`，读取 `.portmanager/reports/current-ci-review-pack/` 里的 review pack；随后继续结合带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md`、visibility breakdown、验证报告与公开 docs progress page 做开发者判断。当前这条主线上的 Unit 51 到 Unit 62 继续作为已落地 enablement 基线存在，Units 63 到 76 已经作为已落地历史存在，而下一队列已经切到 Units 77 到 79 的 live packet execution tooling：继续把 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` 保留为不可变历史 packet，继续把候选 `debian-12-systemd-tailscale` 保持为 `review_required`、`review_open` 与阻塞 delta `container_bridge_transport_substitution` 的真实来源，同时落地 `pnpm milestone:scaffold:live-packet` 与 `pnpm milestone:validate:live-packet`，让 scaffold marker 保持“故意无效”的准备态，再推动下一份真实 live packet，而不是继续手工拼接 packet 根目录。

### 当前执行顺序
- `Unit 1`：已完成。controller 的 `hosts`、`bridge-rules`、`exposure-policies` 已接入现有 store / runner 与备份、回滚、诊断、drift、事件证据链。
- `Unit 2`：已完成。Rust CLI 的 host、bridge-rule、exposure-policy 读写流已与 controller 资源模型对齐，并保留 `--json` 与等待轮询约定。
- `Unit 3`：已完成。Web 路由一致性现在已经补齐 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail，并把 overview / host detail / operations 接到 live controller 数据。
- `Unit 4`：已完成。agent 已经在保住现有产物格式的前提下接入锁定的 `HTTP over Tailscale` 稳态服务边界。
- `Unit 5`：已完成。`pnpm acceptance:verify` 已重跑通过，roadmap 与产品文档已同步，Milestone 1 文案已提升为公共表面已验收状态。
- `Unit 6`：已完成。`scripts/acceptance/confidence.mjs` 现在已经用同一套 step runner 统一 `pnpm acceptance:verify` 与 `pnpm milestone:verify:confidence`，同时保住 Unit 0 语义不变。
- `Unit 7`：已完成。`.github/workflows/mainline-acceptance.yml` 现在会继续用 `pnpm acceptance:verify` 作为 PR gate，并在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上运行 `pnpm milestone:verify:confidence`。
- `Confidence history bundle 切片`：已完成。`pnpm milestone:verify:confidence` 现在会写出带 CI traceability 元数据的 `.portmanager/reports/milestone-confidence-report.json`、`.portmanager/reports/milestone-confidence-history.json` 与 `.portmanager/reports/milestone-confidence-summary.md`；CI 也会跨 run 恢复并保存这组 bundle，再上传成 `milestone-confidence-bundle-*` artifact 供开发者核对。
- `Confidence readiness 切片`：已完成。持久 confidence history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，记录当前 run 是否真正属于里程碑推进资格范围，并把同一份 summary 发布到 GitHub Actions workflow 页面。
- `Confidence history sync 切片`：已完成。`pnpm milestone:sync:confidence-history` 现在会把 GitHub Actions 已完成 `mainline-acceptance` bundle history 导回本地 readiness review，并用同一套 readiness 计算逻辑与去重规则重建本地 summary。
- `Confidence review-signal 切片`：已完成。同步后与本地的 `.portmanager/reports/milestone-confidence-summary.md` 现在会把 `Latest Run` 与 `Latest Qualified Run` 分开显示，并统计本地 visibility-only 与非 qualified 远端噪声，开发者不再需要手动翻表判断真实主线证据。
- `Confidence progress page 切片`：已完成。docs-site 现在会从生成后的 milestone confidence 数据发布 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，并在 roadmap 首页直接预览同一份 readiness 快照。
- `Confidence review digest 切片`：已完成。`pnpm milestone:review:confidence` 现在会给开发者一条 repo-native 复核摘要步骤，用来直接比较同步后的本地 readiness 与已跟踪公开 progress artifact，写出 `.portmanager/reports/milestone-confidence-review.md`，并把 countdown 漂移与 visibility-only 漂移分开汇报。
- `Confidence wording-review 切片`：已完成。`pnpm milestone:review:promotion-ready` 现在还会写出 `.portmanager/reports/milestone-wording-review.md`，让开发者能用一份本地清单同时查看文案护栏、`Source surface status`、公开对齐状态与 claim posture。
- `Confidence review-pack CI 切片`：已完成。`pnpm milestone:review:promotion-ready -- --skip-sync` 现在会让 `mainline-acceptance` 把当前 run 的 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 直接追加到 job summary，并一并上传进 `milestone-confidence-bundle-*`。
- `Confidence review-pack fetch 切片`：已完成。`pnpm milestone:fetch:review-pack` 现在会下载最新已完成 `mainline-acceptance` review bundle 或显式 `--run-id`，把当前 run 复核文件稳定落到 `.portmanager/reports/current-ci-review-pack/`，并写出 `review-pack-manifest.json` 供开发者保留 CI-first 证据。
- `Unit 53`：已完成。controller 现在公开 `/event-audit-index`，继续复用同一套已验收 evidence model 提供索引化 review read；Web 的 Operations 与 Console 也已经显示共享的 indexed event/audit review 面板，而没有重新把 transport 集中度做得更重。
- `Unit 54`：已完成。controller store 现在运行在 SQLite-backed persistence adapter seam 后面，会通过真实 store 计数衡量 PostgreSQL readiness pressure，并保持既有 store 行为不变。
- `Unit 55`：已完成。`/event-audit-index` 与 `/persistence-readiness` 现在都已经作为生成后的合同面发布；CLI 的 `operations audit-index` 与 `operations persistence-readiness` 已经对齐 controller read；Web 的 Overview 与 Console 也已经公开 persistence-readiness 细节，方便开发者复核。
- `Unit 56`：已完成。controller 现在会在保留旧直连路由兼容性的同时公开 `/api/controller/*` consumer boundary；Web 已经保持 prefix base URL 不丢失，CLI 也已经支持 `PORTMANAGER_CONSUMER_BASE_URL`，而不破坏旧的 controller-base 配置。
- `治理切片`：已完成。`docs/operations/portmanager-second-target-review-contract.md`、`docs/operations/portmanager-debian-12-acceptance-recipe.md` 与 `docs/operations/portmanager-debian-12-operator-ownership.md` 现在已经冻结 `debian-12-systemd-tailscale` 的 review-prep 文案、证明顺序与 ownership，而没有扩大支持声明。
- `下一主线`：Milestone 3 现在已经在同一条 accepted live slice 上作为有边界的 `Phase 0 enablement` 打开。继续把 `pnpm milestone:review:promotion-ready -- --limit 20` 与 `pnpm milestone:fetch:review-pack` 当作 Milestone 2 的文案 guardrail，并把 `.portmanager/reports/milestone-wording-review.md`、验证报告与公开 development-progress 页面视为同一份真相包；同时把 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md` 当作当前实现地图。Units 63 到 76 现在都已经作为已落地历史存在，而第一份完整有边界 Debian 12 review packet 继续保留在 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`：guide coverage 继续完整、artifact coverage 维持 `20/20`，并且 `/second-target-policy-pack` 现在还会公开 `review_open`、待裁定 verdict 与 `liveTransportFollowUp.state: capture_required`，同时把 guide path 固定到 `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`；公开快照仍然只会在现有 helper 与人工复核同意时通过 `--refresh-published-artifact` 前进，而下一步工作已经收窄为通过 scaffold 与 validator helper 为下一份真实 live packet 做准备。

### 已锁定的 V1 形态
- `web`：TypeScript React SPA
- `controller`：TypeScript REST + SSE API 服务
- `cli`：Rust 一等自动化入口
- `agent`：Rust 最小远端执行面
- `future shared core`：用于复用执行能力与平台抽象的 Rust crates

### 已锁定的协议与存储决策
- 契约：`OpenAPI + JSON Schema + 代码生成`
- Controller API：`REST + SSE`
- controller 到 agent：`HTTP over Tailscale`
- Bootstrap 与救援：`仅 SSH`
- 人类维护配置：`TOML`
- 协议载荷、快照、导出：`JSON`
- V1 状态库：`SQLite`
- 未来迁移目标：`PostgreSQL`

### 已锁定的 V1 产品边界
- 首个里程碑：`One Host, One Rule, One Rollback`
- controller 侧网页快照与连通性诊断
- 前端可见页面快照、可达性、HTTP 基础结果与 TLS 基础结果
- destructive mutation 前必须先完成本地备份
- GitHub 私有备份在 V1 中已经作为受支持边界真实落地
- Docker 仅覆盖 `controller + web` 的 self-hosted control plane
- 发布站点在顶层区分 Human 与 Agent 两类文档入口
- VitePress 文档站遵循独立的 docs-first 设计基线，而不继承产品控制台母版
- Quick Start 安装入口作为公共分发契约被固化，并明确标记为 `Planned`
- Roadmap 作为一级文档页，同时呈现产品与工程双轨路线
- 首次上传不包含业务实现代码；当前分支开始进入 Milestone 1 基础实现

### 仓库结构
- `docs/specs/` 存放产品规格、里程碑、信息架构、诊断、SDK、Docker 与基线清单
- `docs/architecture/` 存放架构、契约与 bootstrap 决策
- `docs/operations/` 存放运维安全策略，尤其是备份与回滚
- `docs/design/` 存放产品控制台设计基线、文档站设计基线与参考资产
- `docs-site/` 存放 GitHub Pages 的 VitePress 发布层
- `apps/` 存放早期 TypeScript controller 与 web 骨架
- `crates/` 存放早期 Rust CLI 与 agent 骨架
- `packages/typescript-contracts/` 存放生成的 TypeScript 契约表面
- `scripts/docs/` 存放语言拆分与发布辅助脚本
- `scripts/contracts/` 存放契约生成与漂移检查工具
- `.github/workflows/` 存放文档部署与主线验收自动化
- `packages/contracts/openapi/` 存放 controller API 草案
- `packages/contracts/jsonschema/` 存放运行态、备份、回滚与诊断 schema

### 推荐阅读顺序
1. `docs/specs/portmanager-v1-baseline-checklist.md`
2. `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
3. `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
4. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
5. `docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
6. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-readiness-requirements.md`
7. `docs/plans/2026-04-17-portmanager-m2-confidence-readiness-plan.md`
8. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-history-sync-requirements.md`
9. `docs/plans/2026-04-17-portmanager-m2-confidence-history-sync-plan.md`
10. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-review-signal-requirements.md`
11. `docs/plans/2026-04-17-portmanager-m2-confidence-review-signal-plan.md`
12. `docs/brainstorms/2026-04-17-portmanager-m2-confidence-progress-page-requirements.md`
13. `docs/plans/2026-04-17-portmanager-m2-confidence-progress-page-plan.md`
14. `docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md`
15. `docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md`
16. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-review-digest-requirements.md`
17. `docs/plans/2026-04-20-portmanager-m2-confidence-review-digest-plan.md`
18. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md`
19. `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md`
20. `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md`
21. `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md`
22. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md`
23. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md`
24. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md`
25. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md`
26. `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md`
27. `docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md`
28. `docs/specs/portmanager-v1-product-spec.md`
29. `docs/architecture/portmanager-v1-architecture.md`
30. `docs/design/portmanager-overview-design-baseline.md`
31. `docs/design/portmanager-docs-site-design-baseline.md`
30. `packages/contracts/README.md`

### 文档站命令
- 安装依赖：`corepack pnpm --dir docs-site --ignore-workspace install --frozen-lockfile --prefer-offline`
- 生成语言页面：`corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- 从同步后的本地 history 重新发布 confidence progress：`corepack pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- 构建发布站点：`corepack pnpm --dir docs-site --ignore-workspace run docs:build`

### 里程碑验证
- 运行完整主线验收 gate：`corepack pnpm acceptance:verify`
- 运行规范 Milestone 2 confidence routine：`pnpm milestone:verify:confidence`
- 把 GitHub Actions 已完成 confidence history 同步到本地复核：`pnpm milestone:sync:confidence-history -- --limit 20`
- 运行 repo-native promotion review helper：`pnpm milestone:review:promotion-ready -- --limit 20`
- 查看最新本地 confidence 报告：`.portmanager/reports/milestone-confidence-report.json`
- 查看最新本地 confidence history：`.portmanager/reports/milestone-confidence-history.json`
- 查看最新本地 confidence summary：`.portmanager/reports/milestone-confidence-summary.md`
- 查看最新本地 wording-review 清单：`.portmanager/reports/milestone-wording-review.md`
- 查看最新本地 claim posture：`.portmanager/reports/milestone-wording-review.md` 里的 `Public claim class`、`Source surface status` 与 `Required next action`
- 同步前提：`gh` 已认证且具备 `repo` scope，能读取 workflow run 与 artifact
- readiness 阈值：`7` 次 qualified mainline run + `3` 次连续 qualified pass
- GitHub Actions 开发者进度面：`mainline-acceptance` job summary
- 仓库内开发者进度面：同步后的 `.portmanager/reports/milestone-confidence-summary.md`，现在会区分最新可见 run、最新 qualified run，并显示 visibility breakdown
- docs-site 开发者进度面：`/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，并且 `/en/roadmap/` 与 `/zh/roadmap/` 首页会直接预览同一份 readiness 快照
- 运行当前单主机 / 单规则 / 诊断 / 单回滚 / 事件流证明链路：`pnpm milestone:verify`
- 运行当前 multi-state remote-backup replay 证明链路：`pnpm milestone:verify:reliability-remote-backup-replay`

# PortManager

Updated: 2026-04-21
Version: v0.6.0-m3-phase0-enablement

## English

### Baseline work completed
- [x] Freeze the V1 product boundary and architecture.
- [x] Freeze OpenAPI and JSON Schema as the public contract foundation.
- [x] Freeze the controller-side diagnostics and snapshot model.
- [x] Freeze the Docker and SDK boundary for V1.
- [x] Add the GitHub Pages + VitePress publishing layer.
- [x] Freeze Human / Agent top-level docs entrypoints.
- [x] Freeze one-line install and bootstrap contract shapes as `Planned` public interfaces.
- [x] Publish the first roadmap page as a first-class docs surface.
- [x] Separate the product console design baseline from the VitePress docs-site design baseline.

### Next implementation work
- [x] Milestone 1: contracts foundation and codegen toolchain.
- [x] Milestone 1: controller skeleton with SQLite state store and operation runner.
- [x] Milestone 1: Rust agent skeleton with bootstrap, apply, collect, snapshot, rollback.
- [x] Milestone 1: Rust CLI skeleton with `--json` and `--wait`.
- [x] Milestone 1: React SPA skeleton for overview and host detail.
- [x] Milestone 1: one-host bootstrap and one-rule apply verification.
- [x] Milestone 1: local backup and rollback primitive.
- [x] Milestone 1: controller-side webpage snapshot and connectivity diagnostics.
- [x] Milestone 1: unified event stream across Web, CLI, and API.
- [x] Milestone 2: explicit drift-driven degraded state visibility across Web, CLI, and API.
- [x] Milestone 2: filtered backup, diagnostics, and rollback inspection with CLI rollback execution.
- [x] Milestone 2: best_effort versus required backup policy enforcement with visible remote-backup status.
- [x] Milestone 2: actionable remote-backup setup and status guidance across Web, CLI, API, and proof output.
- [x] Milestone 2: filtered operation inventory with recovery-linked summaries across Web, CLI, and API.
- [x] Milestone 2: selected-operation event timeline and filtered event history across Web, CLI, and API.
- [x] Milestone 2: operation detail now carries direct selected-event replay path and linked recovery evidence across API and CLI.
- [x] Delivery discipline: formalize and keep a repeatable mainline acceptance gate with `pnpm acceptance:verify` plus `.github/workflows/mainline-acceptance.yml`, and keep that gate green on `main`.
- [x] Milestone 1: controller `hosts`, `bridge-rules`, `exposure-policies`, host probe/bootstrap, and backup-aware destructive rule mutation are now real and covered by `tests/controller/host-rule-policy.test.ts`.
- [x] Milestone 1: the agent now serves the locked `HTTP over Tailscale` boundary and controller syncs desired state over that live service while preserving snapshot and rollback artifacts.
- [x] Unit 5: `pnpm acceptance:verify` re-ran green after docs sync, and Milestone 1 wording moved to accepted public-surface status.

### Current post-Milestone-1 focus
- [x] Milestone 1 acceptance closure: add real controller `hosts` resources and readiness lifecycle, not only operation evidence and diagnostics primitives.
- [x] Milestone 1 acceptance closure: add real controller `bridge-rules` CRUD and `exposure-policies` surfaces.
- [x] Milestone 1 acceptance closure: mirror controller host/rule/policy surfaces into CLI.
- [x] Milestone 1 acceptance closure: mirror controller host/rule/policy surfaces into Web.
- [x] Milestone 1 acceptance closure: replace Web mock-only states with controller-backed data and add dedicated `Hosts`, `Bridge Rules`, `Backups`, `Console`, and diagnostics-detail surfaces.
- [x] Milestone 1 acceptance closure: evolve the agent from file-backed CLI skeleton to the locked `HTTP over Tailscale` steady-state service boundary.
- [x] Milestone 1 acceptance closure: rerun acceptance, sync roadmap and product docs, and move milestone wording only after the proof is green.
- [x] Milestone 2 acceptance closure: expose remote-backup setup and status more clearly across Web, CLI, API, and proof output so required-mode degradation is actionable.
- [x] Milestone 2 acceptance closure: land agent heartbeat/version semantics across agent `/health` + `/runtime-state`, controller host surfaces, CLI host output, Web host detail, and roadmap/progress docs.
- [x] Milestone 2 acceptance closure: expand live degraded/recovery/diagnostics-history UX on the same host/rule/policy model.
- [x] Milestone 2 acceptance closure: deliver real GitHub backup on top of the now-explicit remote-backup guidance surfaces.
- [x] Milestone 2 reliability slice: replay configured, failed, and local-only required remote-backup evidence on the same live agent-backed host/rule flow across API, CLI, Web, and agent proof.
- [x] Milestone 2 acceptance closure: keep qualified `pnpm milestone:verify:confidence` history green until the readiness summary reaches `promotion-ready` with `7` qualified runs plus `3` consecutive qualified passes. Current synced and published checkpoint on `2026-04-21`: `promotion-ready`, thresholds met, and exact live counters plus the latest qualified run now stay on the tracked confidence artifact and development-progress page instead of root-doc prose.
- [x] Milestone 2 acceptance closure: land `pnpm milestone:verify:confidence` as the canonical composed routine while preserving `pnpm acceptance:verify` as the Unit 0 gate.
- [x] Milestone 2 acceptance closure: wire the canonical confidence routine into `.github/workflows/mainline-acceptance.yml` for `push main`, `workflow_dispatch`, and the daily scheduled history lane.
- [x] Milestone 2 acceptance closure: write `.portmanager/reports/milestone-confidence-report.json` from the canonical confidence routine with CI traceability metadata, and upload the same report from CI for developer inspection.
- [x] Milestone 2 acceptance closure: persist `.portmanager/reports/milestone-confidence-history.json` plus `.portmanager/reports/milestone-confidence-summary.md`, restore and save that bundle across CI runs, and upload it as `milestone-confidence-bundle-*` for developer review.
- [x] Milestone 2 acceptance closure: classify persisted confidence history as `local-only`, `building-history`, or `promotion-ready`, and distinguish qualified mainline evidence from local visibility-only runs.
- [x] Milestone 2 acceptance closure: publish `.portmanager/reports/milestone-confidence-summary.md` into the GitHub Actions job summary for direct developer progress review.
- [x] Milestone 2 acceptance closure: land `pnpm milestone:sync:confidence-history` so developers can import completed `mainline-acceptance` bundle history into local readiness review with authenticated `gh`, deduped entries, and the same shared readiness math.
- [x] Milestone 2 acceptance closure: keep synced/local `.portmanager/reports/milestone-confidence-summary.md` truthful for developer review by surfacing `Latest Qualified Run` and visibility-only noise counts beside the latest visible run.
- [x] Milestone 2 acceptance closure: publish the synced confidence snapshot as first-class docs-site developer progress pages at `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, and surface the same live counters on roadmap home.
- [x] Milestone 2 acceptance closure: add `pnpm milestone:review:confidence` as the repo-native developer review digest so synced local history and the tracked public progress artifact can be compared before any docs refresh or milestone-language change.
- [x] Milestone 2 acceptance closure: add `.portmanager/reports/milestone-wording-review.md` so `pnpm milestone:review:promotion-ready` emits one local wording-review checklist with guardrails, source surfaces, publication-alignment state, and explicit claim posture.
- [x] Milestone 2 acceptance closure: let `pnpm milestone:review:promotion-ready -- --skip-sync` reuse current local artifacts so `mainline-acceptance` uploads `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` in the current-run bundle and job summary.
- [x] Real-machine acceptance: replay `pnpm acceptance:verify` and `pnpm milestone:verify:confidence` on Windows against the latest `main`, then sync completed mainline confidence history locally with authenticated `gh` for developer review.
- [x] Acceptance hardening: align development-progress docs validation with the committed generated confidence fallback so a fresh machine does not fail on missing ignored `.portmanager` history.
- [x] Acceptance hardening: keep development-progress docs validation hermetic when ignored local `.portmanager` history is newer than committed docs-site progress data and `docs:generate` has not been rerun yet.
- [x] Milestone 3 Unit 51: extract `controller-domain-service` and `controller-read-model` seams, move controller orchestration and host-detail composition behind explicit modules, and keep current HTTP contracts plus acceptance evidence unchanged.
- [x] Milestone 3 Unit 52: add gateway-ready batch exposure-policy envelope, parent-child operation linkage, CLI batch apply flow, and Web batch outcome rendering without broadening supported target claims.
- [x] Milestone 3 Unit 53: land `/event-audit-index`, shared indexed event/audit review reads, and Web operations/console audit panels without changing the accepted evidence model.
- [x] Milestone 3 Unit 54: add the SQLite-backed persistence adapter seam, measurable PostgreSQL readiness reporting, and keep store behavior unchanged behind the new adapter boundary.
- [x] Milestone 3 Unit 55: publish `/event-audit-index` and `/persistence-readiness` as generated contract surfaces, add CLI parity for both reads, and surface persistence readiness in Web overview/console developer views.
- [x] Milestone 3 Unit 56: land `/api/controller/*` as the compatibility-safe consumer boundary, preserve prefixed Web base URLs, and let CLI read `PORTMANAGER_CONSUMER_BASE_URL` without breaking older controller-base config.
- [x] Milestone 3 Unit 57: extract `audit-review-service`, make `/events` and `/event-audit-index` share one boundary owner, and preserve batch parent/child evidence plus compatibility-safe consumer routes.
- [x] Milestone 3 Unit 58: add an explicit target-profile registry for `ubuntu-24.04-systemd-tailscale`, publish it across controller, CLI, and Web, and reject unsupported second-target claims without broadening current support.
- [x] Milestone 3 Unit 59: promote `persistence-readiness` into a migration decision surface with explicit next actions while keeping SQLite as the active backend.
- [x] Milestone 3 Unit 60: publish `/consumer-boundary-decision-pack` so `/api/controller` stays embedded until standalone deployment boundary, edge-policy ownership, and external consumer pressure all exist.
- [x] Milestone 3 Unit 61: publish `/deployment-boundary-decision-pack` so `/api/controller` stays controller-embedded until deployable artifact, edge runtime controls, replay parity, observability ownership, and external pressure justify standalone deployment review.
- [x] Milestone 3 Unit 62: publish `/second-target-policy-pack` so support stays locked to `ubuntu-24.04-systemd-tailscale` until one candidate target, transport parity, backup/diagnostics/rollback parity, docs contract, acceptance recipe, and operator ownership justify review.
- [x] Milestone 3 governance slice: land review-prep docs contract, Debian 12 acceptance recipe, and operator ownership notes so `/second-target-policy-pack` points at explicit evidence sources before parity proof lands.

### Recommended execution order
- [x] Unit 0: formalize the repeatable local and CI acceptance gate with `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`, then keep it green on `main` while Unit 1 becomes the active lane.
- [x] Unit 1: implement controller `hosts`, `bridge-rules`, and `exposure-policies` as the shared runtime source of truth.
- [x] Unit 2: add CLI parity for host, rule, and policy inspection and core write paths on top of completed Unit 1.
- [x] Unit 3: replace Web mock shells with controller-backed data and routes for `Hosts`, `Bridge Rules`, `Backups`, `Console`, and diagnostics detail.
- [x] Unit 4: move the agent to the minimum `HTTP over Tailscale` steady-state service boundary while preserving artifact compatibility.
- [x] Unit 5: rerun acceptance, sync roadmap and product docs, and then reassess Milestone 1 / 2 status language.
- [x] Milestone 2 acceptance closure: add `pnpm milestone:fetch:review-pack` so developers can stage the uploaded current-run `milestone-confidence-bundle-*` into `.portmanager/reports/current-ci-review-pack/` with a local manifest instead of manual GitHub artifact browsing.
- [ ] Next lane: keep Milestone 3 as bounded `Phase 0 enablement` while Milestone 2 review helpers remain the guardrail truth surface. Continue running `pnpm milestone:review:promotion-ready -- --limit 20` after completed mainline runs, use `pnpm milestone:fetch:review-pack` when the current CI run is the first question, keep `.portmanager/reports/milestone-wording-review.md`, `Public claim class`, `Source surface status`, the verification report, and the public development-progress page as the wording-truth bundle, keep the new candidate-host create/probe/bootstrap review-prep lane honest, and move the next implementation step from landed Units 51-62, declared candidate `debian-12-systemd-tailscale`, and the landed governance slice toward the review-packet template `docs/operations/portmanager-debian-12-review-packet-template.md`, the bootstrap-proof guide `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`, the steady-state guide `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`, the backup-restore guide `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`, the diagnostics guide `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`, the rollback guide `docs/operations/portmanager-debian-12-rollback-proof-capture.md`, plus rollback parity evidence under `/second-target-policy-pack` while keeping `/consumer-boundary-decision-pack`, `/deployment-boundary-decision-pack`, `/persistence-decision-pack`, `/second-target-policy-pack`, the target-profile registry, and `/api/controller` stable.

### Current direction documents
- [x] Land requirements doc: `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
- [x] Land implementation plan: `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
- [x] Land follow-up requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
- [x] Land follow-up implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
- [x] Land readiness requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-readiness-requirements.md`
- [x] Land readiness implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-readiness-plan.md`
- [x] Land confidence-history sync requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-history-sync-requirements.md`
- [x] Land confidence-history sync implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-history-sync-plan.md`
- [x] Land confidence-review-signal requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-review-signal-requirements.md`
- [x] Land confidence-review-signal implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-review-signal-plan.md`
- [x] Land confidence-progress-page requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-progress-page-requirements.md`
- [x] Land confidence-progress-page implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-progress-page-plan.md`
- [x] Land confidence-promotion-countdown requirements doc: `docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md`
- [x] Land confidence-promotion-countdown implementation plan: `docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md`
- [x] Land confidence-review-digest requirements doc: `docs/brainstorms/2026-04-20-portmanager-m2-confidence-review-digest-requirements.md`
- [x] Land confidence-review-digest implementation plan: `docs/plans/2026-04-20-portmanager-m2-confidence-review-digest-plan.md`
- [x] Land confidence-promotion-ready-wording requirements doc: `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md`
- [x] Land confidence-promotion-ready-wording implementation plan: `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md`
- [x] Land confidence-promotion-review-helper requirements doc: `docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md`
- [x] Land confidence-promotion-review-helper implementation plan: `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md`
- [x] Land confidence-wording-review-report requirements doc: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md`
- [x] Land confidence-wording-review-report implementation plan: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md`
- [x] Land confidence-wording-claim-matrix requirements doc: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md`
- [x] Land confidence-wording-claim-matrix implementation plan: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md`
- [x] Land confidence-wording-surface-status requirements doc: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md`
- [x] Land confidence-wording-surface-status implementation plan: `docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md`
- [x] Land confidence-review-pack-fetch requirements doc: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-fetch-requirements.md`
- [x] Land confidence-review-pack-fetch implementation plan: `docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-fetch-plan.md`
- [x] Land confidence-publication-refresh-maintenance requirements doc: `docs/brainstorms/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-requirements.md`
- [x] Land confidence-publication-refresh-maintenance implementation plan: `docs/plans/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-plan.md`
- [x] Land Milestone 3 Toward C enablement requirements doc: `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md`
- [x] Land Milestone 3 Toward C enablement implementation plan: `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`
- [x] Land Milestone 3 review-packet readiness requirements doc: `docs/brainstorms/2026-04-21-portmanager-m3-review-packet-readiness-requirements.md`
- [x] Land Milestone 3 review-packet readiness implementation plan: `docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md`
- [x] Sync progress language across root docs and roadmap docs before merging into `main`.

## 中文

### 已完成的基线工作
- [x] 冻结 V1 产品边界与架构决策。
- [x] 冻结 OpenAPI 与 JSON Schema 作为公共契约基础。
- [x] 冻结 controller-side 诊断与快照模型。
- [x] 冻结 V1 的 Docker 与 SDK 边界。
- [x] 增加 GitHub Pages + VitePress 文档发布层。
- [x] 固化 Human / Agent 顶层文档入口。
- [x] 将一行安装与 bootstrap 形态固化为 `Planned` 公共契约。
- [x] 将首版 roadmap 页面作为一级文档面发布。
- [x] 将产品控制台设计基线与 VitePress 文档站设计基线明确拆分。

### 后续实现工作
- [x] 里程碑 1：契约基础设施与 codegen 工具链。
- [x] 里程碑 1：带 SQLite 状态库与 operation runner 的 controller 骨架。
- [x] 里程碑 1：具备 bootstrap、apply、collect、snapshot、rollback 的 Rust agent 骨架。
- [x] 里程碑 1：强制支持 `--json` 与 `--wait` 的 Rust CLI 骨架。
- [x] 里程碑 1：overview 与 host detail 的 React SPA 骨架。
- [x] 里程碑 1：单主机 bootstrap 与单规则 apply 验证。
- [x] 里程碑 1：本地备份与回滚原语。
- [x] 里程碑 1：controller 侧网页快照与连通性诊断。
- [x] 里程碑 1：Web、CLI 与 API 共享事件流。
- [x] 里程碑 2：在 Web、CLI 与 API 中显式暴露 drift 驱动的 degraded 状态。
- [x] 里程碑 2：补全 backup、diagnostics、rollback 的筛选检查面，并支持 CLI 执行 rollback。
- [x] 里程碑 2：落地 best_effort 与 required 的 backup policy 行为差异，并显式暴露远端备份状态。
- [x] 里程碑 2：在 Web、CLI、API 与证明输出中补上可操作的远端备份配置与状态提示。
- [x] 里程碑 2：补全 operation 列表筛选与 recovery 证据摘要，并在 Web、CLI、API 中统一暴露。
- [x] 里程碑 2：补全选中 operation 的事件时间线与 event history 筛选，并在 Web、CLI、API 中统一暴露。
- [x] 里程碑 2：让 operation detail 直接携带选中事件回放路径与 recovery 证据，并在 API、CLI 中统一暴露。
- [x] 交付纪律：通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 固化并持续保持可重复执行的主线验收 gate，并继续把这条 gate 在 `main` 上维持为绿。
- [x] 里程碑 1：controller 的 `hosts`、`bridge-rules`、`exposure-policies`、host probe / bootstrap，以及带备份证据的 destructive rule mutation 已真实落地，并由 `tests/controller/host-rule-policy.test.ts` 覆盖。
- [x] 里程碑 1：agent 已经提供锁定的 `HTTP over Tailscale` 服务边界，controller 现在会通过 live service 同步 desired state，同时保住 snapshot 与 rollback 产物兼容性。
- [x] Unit 5：文档同步后 `pnpm acceptance:verify` 已重新转绿，Milestone 1 文案已经提升为公共表面已验收状态。

### 当前里程碑 1 之后的重点
- [x] 里程碑 1 验收闭环：补上真实 controller `hosts` 资源与 readiness 生命周期，而不只是 operation 证据和 diagnostics 原语。
- [x] 里程碑 1 验收闭环：补上真实 controller `bridge-rules` CRUD 与 `exposure-policies` 表面。
- [x] 里程碑 1 验收闭环：把 controller 的 host/rule/policy 表面同步镜像到 CLI。
- [x] 里程碑 1 验收闭环：把 controller 的 host/rule/policy 表面同步镜像到 Web。
- [x] 里程碑 1 验收闭环：把 Web 从纯 mock 状态切到 controller 实时数据，并增加独立的 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail 页面。
- [x] 里程碑 1 验收闭环：把 agent 从文件落盘式 CLI 骨架推进到锁定的 `HTTP over Tailscale` 稳态服务边界。
- [x] 里程碑 1 验收闭环：重新执行验收、同步 roadmap 与产品文档，并且只在证明链转绿后提升里程碑文案。
- [x] 里程碑 2 验收闭环：在 Web、CLI、API 与证明输出中更清楚地暴露远端备份配置与状态，让 required-mode 降级真正可操作。
- [x] 里程碑 2 验收闭环：补上 agent heartbeat/version 语义，并同步到 agent `/health` + `/runtime-state`、controller host 表面、CLI host 输出、Web host detail 与 roadmap/progress 文档。
- [x] 里程碑 2 验收闭环：继续在统一 host/rule/policy 模型上补强 live degraded/recovery/diagnostics-history UX。
- [x] 里程碑 2 验收闭环：在已经显式化的远端备份提示表面之上，真正交付 GitHub backup。
- [x] 里程碑 2 可靠性切片：在同一条 live agent-backed host/rule 流程上，围绕 configured、failed、local-only 三类 required remote-backup 证据重放 API、CLI、Web 与 agent proof。
- [x] 里程碑 2 验收闭环：让 qualified `pnpm milestone:verify:confidence` 历史持续保持为绿，直到 readiness summary 以 `7` 次 qualified run 加 `3` 次连续 qualified pass 进入 `promotion-ready`，再决定 Milestone 2 文案何时可以无保留提升。当前同步与公开检查点都已在 `2026-04-21` 进入 `promotion-ready`，门槛已满足，而且精确实时计数与最新 qualified run 已统一通过被跟踪 confidence artifact 与 development-progress 页面发布。
- [x] 里程碑 2 验收闭环：落地 `pnpm milestone:verify:confidence` 作为规范组合 routine，同时保留 `pnpm acceptance:verify` 作为 Unit 0 gate。
- [x] 里程碑 2 验收闭环：把规范 confidence routine 接入 `.github/workflows/mainline-acceptance.yml` 的 `push main`、`workflow_dispatch` 与每日 schedule 历史路径。
- [x] 里程碑 2 验收闭环：让规范 confidence routine 写出带 CI traceability 元数据的 `.portmanager/reports/milestone-confidence-report.json`，并把同一份报告从 CI 上传给开发者核对。
- [x] 里程碑 2 验收闭环：持久化 `.portmanager/reports/milestone-confidence-history.json` 与 `.portmanager/reports/milestone-confidence-summary.md`，在 CI 各次运行之间恢复并保存这组 bundle，并以 `milestone-confidence-bundle-*` 上传给开发者核对。
- [x] 里程碑 2 验收闭环：把持久 confidence history 明确分类为 `local-only`、`building-history`、`promotion-ready`，并把 qualified mainline 证据与本地可见性 run 区分开。
- [x] 里程碑 2 验收闭环：把 `.portmanager/reports/milestone-confidence-summary.md` 直接发布到 GitHub Actions job summary，供开发者即时核对进度。
- [x] 里程碑 2 验收闭环：落盘 `pnpm milestone:sync:confidence-history`，让开发者能通过已认证 `gh` 把 completed `mainline-acceptance` bundle history 导回本地 readiness review，并沿用同一套去重与 readiness 计算逻辑。
- [x] 里程碑 2 验收闭环：让同步后与本地的 `.portmanager/reports/milestone-confidence-summary.md` 在开发者复核时保持真实，通过 `Latest Qualified Run` 与 visibility-only 噪声计数避免本地 rerun 掩盖主线证据。
- [x] 里程碑 2 验收闭环：把同步后的 confidence snapshot 作为 docs-site 一级开发者进度页面公开到 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，并在 roadmap 首页直接显示同一份 live 计数。
- [x] 里程碑 2 验收闭环：补上 `pnpm milestone:review:confidence` 作为 repo-native 开发者复核摘要命令，让同步后的本地 history 与已跟踪公开 progress artifact 能在任何 docs 刷新或里程碑文案收窄前先被直接对比。
- [x] 里程碑 2 验收闭环：补上 `.portmanager/reports/milestone-wording-review.md`，让 `pnpm milestone:review:promotion-ready` 直接产出一份包含文案护栏、source surfaces 与公开对齐状态的本地 wording-review 清单。
- [x] 里程碑 2 验收闭环：让 `pnpm milestone:review:promotion-ready -- --skip-sync` 复用当前本地 artifacts，让 `mainline-acceptance` 把 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 上传进当前 run bundle 与 job summary。
- [x] 真机验收：在 Windows 真机上对最新 `main` 重放 `pnpm acceptance:verify` 与 `pnpm milestone:verify:confidence`，并通过已认证 `gh` 把 completed mainline confidence history 同步回本地供开发者复核。
- [x] 验收加固：让 development-progress docs 校验与已提交的 generated confidence fallback 对齐，避免全新机器在缺失被忽略的 `.portmanager` 历史时误报失败。
- [x] 验收加固：当被忽略的本地 `.portmanager` 历史比已提交 docs-site progress data 更新、且尚未重跑 `docs:generate` 时，development-progress docs 校验仍保持 hermetic，不再误报失败。
- [x] 里程碑 3 Unit 51：抽出 `controller-domain-service` 与 `controller-read-model` seam，把 controller 编排与 host detail 组合收敛到显式模块后面，并保持现有 HTTP 契约与验收证据不变。
- [x] 里程碑 3 Unit 52：增加 gateway-ready 的 batch exposure-policy envelope、parent-child operation linkage、CLI batch apply flow，以及 Web batch outcome rendering，同时不扩大会被支持的 target 声明。
- [x] 里程碑 3 Unit 53：落地 `/event-audit-index`、共享的索引化 event/audit review read，以及 Web operations/console 审计面板，同时不改变已验收 evidence model。
- [x] 里程碑 3 Unit 54：落地 SQLite-backed persistence adapter seam、可度量的 PostgreSQL readiness 报告，并保持新适配器边界后的 store 行为不变。
- [x] 里程碑 3 Unit 55：把 `/event-audit-index` 与 `/persistence-readiness` 作为生成后的合同面发布，补齐 CLI 双读一致性，并在 Web overview/console 开发者视图公开 persistence readiness。
- [x] 里程碑 3 Unit 56：把 `/api/controller/*` 落成兼容旧路由的 consumer boundary，保证 Web 的 prefix base URL 不丢失，并让 CLI 支持 `PORTMANAGER_CONSUMER_BASE_URL` 而不破坏旧 controller-base 配置。
- [x] 里程碑 3 Unit 57：抽出 `audit-review-service`，让 `/events` 与 `/event-audit-index` 拥有同一个 boundary owner，并继续保住 batch parent/child 证据和 consumer route 兼容性。
- [x] 里程碑 3 Unit 58：为 `ubuntu-24.04-systemd-tailscale` 建立显式 target-profile registry，在 controller、CLI 与 Web 中统一发布，并在不扩大当前支持范围的前提下拒绝不受支持的第二目标声明。
- [x] 里程碑 3 Unit 59：把 `persistence-readiness` 提升成带明确 next action 的 migration decision surface，同时继续把 SQLite 保持为当前 active backend。
- [x] 里程碑 3 Unit 60：发布 `/consumer-boundary-decision-pack`，明确只有在独立部署边界、edge-policy ownership 与 external consumer pressure 同时成立时，`/api/controller` 才需要进入 split review。
- [x] 里程碑 3 Unit 61：发布 `/deployment-boundary-decision-pack`，明确只有在 deployable artifact、edge runtime controls、replay parity、observability ownership 与 external pressure 同时成立时，`/api/controller` 才能进入独立部署复核。
- [x] 里程碑 3 Unit 62：发布 `/second-target-policy-pack`，明确只有在候选第二目标、传输等价、backup/diagnostics/rollback 等价、文档契约、验收 recipe 与 operator ownership 同时成立时，支持声明才能超出 `ubuntu-24.04-systemd-tailscale`。
- [x] 里程碑 3 治理切片：落盘 review-prep 文档契约、Debian 12 验收 recipe 与 operator ownership 说明，让 `/second-target-policy-pack` 在等价证明落地前先指向明确证据源。

### 推荐推进顺序
- [x] Unit 0：通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 固化可重复的本地与 CI 验收 gate，并继续把这条 gate 在 `main` 上维持为绿，再把主动主线切到 Unit 1。
- [x] Unit 1：先把 controller 的 `hosts`、`bridge-rules`、`exposure-policies` 做成统一运行态真源。
- [x] Unit 2：在已完成的 Unit 1 基础上补齐 CLI 对 host / rule / policy 的检查与核心写入路径。
- [x] Unit 3：把 Web mock shell 切到 controller 实时数据与路由，补齐 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail。
- [x] Unit 4：在保持证据产物兼容的前提下，把 agent 推进到最小 `HTTP over Tailscale` 稳态服务边界。
- [x] Unit 5：重新执行验收、同步 roadmap 与产品文档，再评估 Milestone 1 / 2 状态是否可以提升。
- [x] 里程碑 2 验收闭环：补上 `pnpm milestone:fetch:review-pack`，让开发者把上传后的 current-run `milestone-confidence-bundle-*` 稳定落到 `.portmanager/reports/current-ci-review-pack/`，并保留 `review-pack-manifest.json`，不再依赖手动 GitHub artifact 点击。
- [ ] 下一主线：继续把 Milestone 3 保持为有边界的 `Phase 0 enablement`，同时把 Milestone 2 的 review helper 保留为 guardrail 真相面。继续在 completed mainline runs 之后执行 `pnpm milestone:review:promotion-ready -- --limit 20`；如果第一问题是当前 CI run，就先执行 `pnpm milestone:fetch:review-pack` 并读取 `.portmanager/reports/current-ci-review-pack/`；继续把 `.portmanager/reports/milestone-wording-review.md`、`Public claim class`、`Source surface status`、验证报告与公开 development-progress 页面当作文案真相包；继续把新落地的 candidate host 注册、probe、bootstrap review-prep lane 保持诚实；然后把后续实现从已落地的 Unit 51-62、已声明候选 `debian-12-systemd-tailscale` 与已落地治理切片收窄到围绕 `/second-target-policy-pack` 的 review packet 模板 `docs/operations/portmanager-debian-12-review-packet-template.md`、bootstrap proof 指南 `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`、steady-state 指南 `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`、backup-restore 指南 `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`、diagnostics、rollback 等价证据，同时继续保持 `/consumer-boundary-decision-pack`、`/deployment-boundary-decision-pack`、`/persistence-decision-pack`、`/second-target-policy-pack`、target-profile registry 与 `/api/controller` 稳定。

### 当前方向文档
- [x] 落盘需求文档：`docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
- [x] 落盘实现计划：`docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
- [x] 落盘后续需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
- [x] 落盘后续实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
- [x] 落盘 readiness 需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-readiness-requirements.md`
- [x] 落盘 readiness 实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-readiness-plan.md`
- [x] 落盘 confidence-history sync 需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-history-sync-requirements.md`
- [x] 落盘 confidence-history sync 实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-history-sync-plan.md`
- [x] 落盘 confidence-review-signal 需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-review-signal-requirements.md`
- [x] 落盘 confidence-review-signal 实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-review-signal-plan.md`
- [x] 落盘 confidence-progress-page 需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-progress-page-requirements.md`
- [x] 落盘 confidence-progress-page 实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-progress-page-plan.md`
- [x] 落盘 confidence-promotion-countdown 需求文档：`docs/brainstorms/2026-04-19-portmanager-m2-confidence-promotion-countdown-requirements.md`
- [x] 落盘 confidence-promotion-countdown 实现计划：`docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md`
- [x] 落盘 confidence-review-digest 需求文档：`docs/brainstorms/2026-04-20-portmanager-m2-confidence-review-digest-requirements.md`
- [x] 落盘 confidence-review-digest 实现计划：`docs/plans/2026-04-20-portmanager-m2-confidence-review-digest-plan.md`
- [x] 落盘 confidence-promotion-ready-wording 需求文档：`docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-requirements.md`
- [x] 落盘 confidence-promotion-ready-wording 实现计划：`docs/plans/2026-04-20-portmanager-m2-confidence-promotion-ready-wording-plan.md`
- [x] 落盘 confidence-promotion-review-helper 需求文档：`docs/brainstorms/2026-04-20-portmanager-m2-confidence-promotion-review-helper-requirements.md`
- [x] 落盘 confidence-promotion-review-helper 实现计划：`docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md`
- [x] 落盘 confidence-wording-review-report 需求文档：`docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-review-report-requirements.md`
- [x] 落盘 confidence-wording-review-report 实现计划：`docs/plans/2026-04-21-portmanager-m2-confidence-wording-review-report-plan.md`
- [x] 落盘 confidence-wording-claim-matrix 需求文档：`docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-requirements.md`
- [x] 落盘 confidence-wording-claim-matrix 实现计划：`docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md`
- [x] 落盘 confidence-wording-surface-status 需求文档：`docs/brainstorms/2026-04-21-portmanager-m2-confidence-wording-surface-status-requirements.md`
- [x] 落盘 confidence-wording-surface-status 实现计划：`docs/plans/2026-04-21-portmanager-m2-confidence-wording-surface-status-plan.md`
- [x] 落盘 confidence-review-pack-fetch 需求文档：`docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-fetch-requirements.md`
- [x] 落盘 confidence-review-pack-fetch 实现计划：`docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-fetch-plan.md`
- [x] 落盘 confidence-publication-refresh-maintenance 需求文档：`docs/brainstorms/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-requirements.md`
- [x] 落盘 confidence-publication-refresh-maintenance 实现计划：`docs/plans/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-plan.md`
- [x] 落盘 Milestone 3 Toward C enablement 需求文档：`docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md`
- [x] 落盘 Milestone 3 Toward C enablement 实现计划：`docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`
- [x] 落盘 Milestone 3 review-packet readiness 需求文档：`docs/brainstorms/2026-04-21-portmanager-m3-review-packet-readiness-requirements.md`
- [x] 落盘 Milestone 3 review-packet readiness 实现计划：`docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md`
- [x] 在合并进 `main` 前，同步 root docs 与 roadmap docs 的进度表述。

# PortManager

Updated: 2026-04-20
Version: v0.5.13-confidence-review-digest

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
- [ ] Milestone 2 acceptance closure: keep qualified `pnpm milestone:verify:confidence` history green until the readiness summary reaches `promotion-ready` with `7` qualified runs plus `3` consecutive qualified passes. Current synced checkpoint on `2026-04-20`: `5/7` qualified runs, `5/3` qualified consecutive passes, `2` remaining qualified runs.
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
- [x] Real-machine acceptance: replay `pnpm acceptance:verify` and `pnpm milestone:verify:confidence` on Windows against the latest `main`, then sync completed mainline confidence history locally with authenticated `gh` for developer review.
- [x] Acceptance hardening: align development-progress docs validation with the committed generated confidence fallback so a fresh machine does not fail on missing ignored `.portmanager` history.
- [x] Acceptance hardening: keep development-progress docs validation hermetic when ignored local `.portmanager` history is newer than committed docs-site progress data and `docs:generate` has not been rerun yet.

### Recommended execution order
- [x] Unit 0: formalize the repeatable local and CI acceptance gate with `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`, then keep it green on `main` while Unit 1 becomes the active lane.
- [x] Unit 1: implement controller `hosts`, `bridge-rules`, and `exposure-policies` as the shared runtime source of truth.
- [x] Unit 2: add CLI parity for host, rule, and policy inspection and core write paths on top of completed Unit 1.
- [x] Unit 3: replace Web mock shells with controller-backed data and routes for `Hosts`, `Bridge Rules`, `Backups`, `Console`, and diagnostics detail.
- [x] Unit 4: move the agent to the minimum `HTTP over Tailscale` steady-state service boundary while preserving artifact compatibility.
- [x] Unit 5: rerun acceptance, sync roadmap and product docs, and then reassess Milestone 1 / 2 status language.
- [ ] Next lane: sync completed mainline confidence history into local review, run `pnpm milestone:review:confidence`, use the summary's latest-qualified signal plus the verification report and public development-progress page during developer review, keep qualified Milestone 2 confidence history green on the same live slice, and wait for the final `2` qualified runs before narrowing milestone wording.

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
- [ ] 里程碑 2 验收闭环：让 qualified `pnpm milestone:verify:confidence` 历史持续保持为绿，直到 readiness summary 以 `7` 次 qualified run 加 `3` 次连续 qualified pass 进入 `promotion-ready`，再决定 Milestone 2 文案何时可以无保留提升。当前已同步检查点为 `2026-04-20` 的 `5/7` qualified runs、`5/3` qualified consecutive passes，仍剩 `2` 次 qualified runs。
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
- [x] 真机验收：在 Windows 真机上对最新 `main` 重放 `pnpm acceptance:verify` 与 `pnpm milestone:verify:confidence`，并通过已认证 `gh` 把 completed mainline confidence history 同步回本地供开发者复核。
- [x] 验收加固：让 development-progress docs 校验与已提交的 generated confidence fallback 对齐，避免全新机器在缺失被忽略的 `.portmanager` 历史时误报失败。
- [x] 验收加固：当被忽略的本地 `.portmanager` 历史比已提交 docs-site progress data 更新、且尚未重跑 `docs:generate` 时，development-progress docs 校验仍保持 hermetic，不再误报失败。

### 推荐推进顺序
- [x] Unit 0：通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 固化可重复的本地与 CI 验收 gate，并继续把这条 gate 在 `main` 上维持为绿，再把主动主线切到 Unit 1。
- [x] Unit 1：先把 controller 的 `hosts`、`bridge-rules`、`exposure-policies` 做成统一运行态真源。
- [x] Unit 2：在已完成的 Unit 1 基础上补齐 CLI 对 host / rule / policy 的检查与核心写入路径。
- [x] Unit 3：把 Web mock shell 切到 controller 实时数据与路由，补齐 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail。
- [x] Unit 4：在保持证据产物兼容的前提下，把 agent 推进到最小 `HTTP over Tailscale` 稳态服务边界。
- [x] Unit 5：重新执行验收、同步 roadmap 与产品文档，再评估 Milestone 1 / 2 状态是否可以提升。
- [ ] 下一主线：先把 completed mainline confidence history 同步到本地复核，再执行 `pnpm milestone:review:confidence`，利用 summary 里的 latest-qualified 信号、验证报告与公开 development-progress 页面做开发者判断，继续在同一条 live 切片上把 qualified Milestone 2 confidence history 持续保持为绿，并等最后 `2` 次 qualified runs 到位后再收窄里程碑文案。

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
- [x] 在合并进 `main` 前，同步 root docs 与 roadmap docs 的进度表述。

# PortManager

Updated: 2026-04-17
Version: v0.5.2-m2-confidence-plan

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
- [ ] Milestone 2 acceptance closure: package `pnpm acceptance:verify` plus the remote-backup replay proof into one canonical confidence routine, collect that routine on the accepted live slice, and use repeat green history before advancing Milestone 2 wording.

### Recommended execution order
- [x] Unit 0: formalize the repeatable local and CI acceptance gate with `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`, then keep it green on `main` while Unit 1 becomes the active lane.
- [x] Unit 1: implement controller `hosts`, `bridge-rules`, and `exposure-policies` as the shared runtime source of truth.
- [x] Unit 2: add CLI parity for host, rule, and policy inspection and core write paths on top of completed Unit 1.
- [x] Unit 3: replace Web mock shells with controller-backed data and routes for `Hosts`, `Bridge Rules`, `Backups`, `Console`, and diagnostics detail.
- [x] Unit 4: move the agent to the minimum `HTTP over Tailscale` steady-state service boundary while preserving artifact compatibility.
- [x] Unit 5: rerun acceptance, sync roadmap and product docs, and then reassess Milestone 1 / 2 status language.
- [ ] Next lane: harden Milestone 2 confidence routine on the same live slice by replacing the current two-command proof story with one canonical routine and then keeping that routine green.

### Current direction documents
- [x] Land requirements doc: `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
- [x] Land implementation plan: `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
- [x] Land follow-up requirements doc: `docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
- [x] Land follow-up implementation plan: `docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
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
- [ ] 里程碑 2 验收闭环：把 `pnpm acceptance:verify` 与 remote-backup replay proof 收敛成一个规范 confidence routine，在已验收的 live 切片上收集这条 routine 的持续绿历史，再决定 Milestone 2 文案何时可以无保留提升。

### 推荐推进顺序
- [x] Unit 0：通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 固化可重复的本地与 CI 验收 gate，并继续把这条 gate 在 `main` 上维持为绿，再把主动主线切到 Unit 1。
- [x] Unit 1：先把 controller 的 `hosts`、`bridge-rules`、`exposure-policies` 做成统一运行态真源。
- [x] Unit 2：在已完成的 Unit 1 基础上补齐 CLI 对 host / rule / policy 的检查与核心写入路径。
- [x] Unit 3：把 Web mock shell 切到 controller 实时数据与路由，补齐 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail。
- [x] Unit 4：在保持证据产物兼容的前提下，把 agent 推进到最小 `HTTP over Tailscale` 稳态服务边界。
- [x] Unit 5：重新执行验收、同步 roadmap 与产品文档，再评估 Milestone 1 / 2 状态是否可以提升。
- [ ] 下一主线：继续在同一条 live 切片上加固 Milestone 2 的 confidence routine，把当前双入口证明链收敛成一条规范 routine，再把它持续保持为绿直到可信度变成常态。

### 当前方向文档
- [x] 落盘需求文档：`docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md`
- [x] 落盘实现计划：`docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`
- [x] 落盘后续需求文档：`docs/brainstorms/2026-04-17-portmanager-m2-confidence-routine-requirements.md`
- [x] 落盘后续实现计划：`docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md`
- [x] 在合并进 `main` 前，同步 root docs 与 roadmap docs 的进度表述。

# PortManager

Updated: 2026-04-17
Version: v0.5.0-github-backup

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
- Mainline acceptance is now formalized as a repeatable local and CI gate through `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`. This hardens delivery discipline, but it does not by itself advance Milestone 1 to accepted.
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
- Active execution lane after the GitHub-backup slice is now Milestone 2 reliability hardening: repeated proof on the same live agent-backed slice across configured, failed, and local-only remote-backup paths.
- The `2026-04-16` requirements and implementation-plan docs drove the parity, heartbeat/version, diagnostics-history, and GitHub-backup slices; the remaining direction is repeated live reliability replay before any further milestone-status promotion.

### Immediate execution order
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now run through the shared store and runner without regressing backup, rollback, diagnostics, drift, or event evidence.
- `Unit 2`: complete. Rust CLI host, bridge-rule, and exposure-policy read/write flows now mirror the controller-backed resource model with `--json` and wait-aware polling.
- `Unit 3`: complete. Web route parity now covers controller-backed `Hosts`, `Bridge Rules`, `Backups`, `Console`, live overview/host detail/operations, and diagnostics detail.
- `Unit 4`: complete. The agent now serves the locked `HTTP over Tailscale` boundary and controller syncs desired state over it while preserving current artifact formats.
- `Unit 5`: complete. `pnpm acceptance:verify` was replayed, roadmap and product docs were synced, and Milestone 1 wording moved to accepted public-surface status.
- `Next lane`: Milestone 2 reliability hardening on the same live slice: repeated proof across configured, failed, and local-only remote-backup evidence.

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
4. `docs/specs/portmanager-v1-product-spec.md`
5. `docs/architecture/portmanager-v1-architecture.md`
6. `docs/design/portmanager-overview-design-baseline.md`
7. `docs/design/portmanager-docs-site-design-baseline.md`
8. `packages/contracts/README.md`

### Docs site commands
- install: `corepack pnpm --dir docs-site --ignore-workspace install --frozen-lockfile --prefer-offline`
- generate locale pages: `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- build the published docs site: `corepack pnpm --dir docs-site --ignore-workspace run docs:build`

### Milestone verification
- run the full mainline acceptance gate locally: `pnpm acceptance:verify`
- run the current one-host / one-rule / diagnostics / one-rollback / event-stream proof: `pnpm milestone:verify`

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
- 主线验收现在已经通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 被正式固化为可重复的本地与 CI gate。它提升了主线交付纪律，但并不意味着 Milestone 1 已经完成验收。
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
- GitHub-backup 切片落地之后，主动执行主线继续收窄为 Milestone 2 可靠性加固：基于同一条 live agent 切片，对 configured、failed、local-only 三类 remote-backup 路径继续重复证明。
- `2026-04-16` 的需求文档与实现计划已经驱动完当前这一轮一致性、heartbeat/version、diagnostics-history 与 GitHub-backup 切片；剩余方向是先把 live 可靠性重复重放做深，再决定是否继续提升里程碑状态。

### 当前执行顺序
- `Unit 1`：已完成。controller 的 `hosts`、`bridge-rules`、`exposure-policies` 已接入现有 store / runner 与备份、回滚、诊断、drift、事件证据链。
- `Unit 2`：已完成。Rust CLI 的 host、bridge-rule、exposure-policy 读写流已与 controller 资源模型对齐，并保留 `--json` 与等待轮询约定。
- `Unit 3`：已完成。Web 路由一致性现在已经补齐 `Hosts`、`Bridge Rules`、`Backups`、`Console`、diagnostics detail，并把 overview / host detail / operations 接到 live controller 数据。
- `Unit 4`：已完成。agent 已经在保住现有产物格式的前提下接入锁定的 `HTTP over Tailscale` 稳态服务边界。
- `Unit 5`：已完成。`pnpm acceptance:verify` 已重跑通过，roadmap 与产品文档已同步，Milestone 1 文案已提升为公共表面已验收状态。
- `下一主线`：继续在同一条 live 切片上推进 Milestone 2 可靠性加固：围绕 configured、failed、local-only 三类 remote-backup 证据继续重复证明。

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
4. `docs/specs/portmanager-v1-product-spec.md`
5. `docs/architecture/portmanager-v1-architecture.md`
6. `docs/design/portmanager-overview-design-baseline.md`
7. `docs/design/portmanager-docs-site-design-baseline.md`
8. `packages/contracts/README.md`

### 文档站命令
- 安装依赖：`corepack pnpm --dir docs-site --ignore-workspace install --frozen-lockfile --prefer-offline`
- 生成语言页面：`corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- 构建发布站点：`corepack pnpm --dir docs-site --ignore-workspace run docs:build`

### 里程碑验证
- 运行完整主线验收 gate：`pnpm acceptance:verify`
- 运行当前单主机 / 单规则 / 诊断 / 单回滚 / 事件流证明链路：`pnpm milestone:verify`

# PortManager

Updated: 2026-04-17
Version: v0.4.2-mainline-acceptance-gate

## English

PortManager is a docs-first control plane for managing remote localhost exposure over Tailscale with explicit safety rails around backup, rollback, diagnostics, and operations visibility.

This repository started as a baseline repository, not as an implementation repository.
The first upload froze decisions, contracts, design language, and deployment boundaries before any milestone code was written.
The current branch now also includes Milestone 1 foundation code for workspace setup, contract generation, controller service skeletons, controller-side local backup, rollback, diagnostics, snapshot, and event-stream primitives, a first real Rust CLI read path plus event history command, a file-backed Rust agent skeleton, a React SPA shell for overview and host detail, and a one-host / one-rule / diagnostics / one-rollback verification script alongside the `GitHub Pages + VitePress` publishing layer.

### Current verified implementation progress
- Real today: contract generation, controller read surfaces for `operations`, `backups`, `health-checks`, `diagnostics`, `rollback-points`, plus `events`, `backups/run`, `snapshots/diagnostics`, `bridge-rules/{ruleId}/drift-check`, and rollback apply.
- Real today: Rust CLI read and inspection commands for `operations`, `operation get`, `events`, `health-checks`, `backups`, `diagnostics`, and `rollback-points`, including wait-aware polling for operation and rollback flows.
- Real today: branch-level reliability slice with backup policy, drift-driven degraded state, recovery evidence, event history, and rollback inspection proved in `tests/controller/` and `tests/milestone/`.
- Acceptance re-verified on a Windows real machine on `2026-04-17`: `pnpm test`, `pnpm typecheck`, `cargo test --workspace`, `pnpm --dir docs-site run docs:build`, and `pnpm milestone:verify` all passed in one validation pass after fixing Windows-specific compatibility blockers.
- Mainline acceptance is now formalized as a repeatable local and CI gate through `pnpm acceptance:verify` and `.github/workflows/mainline-acceptance.yml`. This hardens delivery discipline, but it does not by itself advance Milestone 1 to accepted.
- Verified hardening from that acceptance pass: contract generation no longer depends on a Windows-fragile `openapi-typescript` CLI path, controller-operation SQLite tests now close handles before cleanup, CLI transport failures remain distinct from degraded business state even when upstream disconnects surface as `502`, and the Rust mock HTTP server no longer flakes on Windows nonblocking accepted sockets.
- Still missing: real controller `hosts`, `bridge-rules`, and `exposure-policies` resources, CLI host/rule/policy workflows, live web-controller data wiring for the full V1 information architecture, and a long-lived agent `HTTP over Tailscale` steady-state service.
- Current web status: `apps/web/src/main.ts` renders only `overview`, `host-detail`, and `operations` shells from mock factories; navigation labels for `Hosts`, `Bridge Rules`, `Backups`, and `Console` are present, but those pages are not yet backed by real controller data.
- Next direction is locked in `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md` and `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`: close interface parity first, then upgrade milestone status.

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
- Optional-but-documented GitHub private backup as V1 supported boundary
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
- install: `corepack pnpm --dir docs-site install`
- generate locale pages: `corepack pnpm --dir docs-site run docs:generate`
- build the published docs site: `corepack pnpm --dir docs-site run docs:build`

### Milestone verification
- run the full mainline acceptance gate locally: `pnpm acceptance:verify`
- run the current one-host / one-rule / diagnostics / one-rollback / event-stream proof: `pnpm milestone:verify`

## 中文

PortManager 是一个以 docs-first 为原则的控制平面项目，用于通过 Tailscale 管理远端 localhost 暴露能力，并显式提供备份、回滚、诊断与操作可见性等安全护栏。

这个仓库最初刻意是“基线仓库”，而不是“实现仓库”。
首次上传先冻结决策、契约、设计语言与部署边界，之后才进入里程碑代码实现。
当前分支已经加入 Milestone 1 的基础实现代码，包括 workspace、契约生成链路、controller 服务骨架、controller 侧本地备份、回滚、诊断、快照与事件流原语、首条可运行的 Rust CLI read path 与 event history 命令、文件落盘式 Rust agent 骨架、overview / host detail 的 React SPA shell，以及单主机 / 单规则 / 诊断 / 单回滚验证脚本，同时保留 `GitHub Pages + VitePress` 文档发布层。

### 当前已验证的实现进度
- 已真实落地：契约生成、controller 的 `operations`、`backups`、`health-checks`、`diagnostics`、`rollback-points` 读接口，以及 `events`、`backups/run`、`snapshots/diagnostics`、`bridge-rules/{ruleId}/drift-check`、rollback apply 等运行路径。
- 已真实落地：Rust CLI 的 `operations`、`operation get`、`events`、`health-checks`、`backups`、`diagnostics`、`rollback-points` 查询能力，以及 operation / rollback 的等待轮询能力。
- 已真实落地：`tests/controller/` 与 `tests/milestone/` 已证明 backup policy、drift 驱动 degraded、recovery 证据、event history 与 rollback 检查这一条可靠性切片。
- 已于 `2026-04-17` 在 Windows 真机上再次完成整套验收：`pnpm test`、`pnpm typecheck`、`cargo test --workspace`、`pnpm --dir docs-site run docs:build`、`pnpm milestone:verify` 在同一轮验证中全部通过。
- 主线验收现在已经通过 `pnpm acceptance:verify` 与 `.github/workflows/mainline-acceptance.yml` 被正式固化为可重复的本地与 CI gate。它提升了主线交付纪律，但并不意味着 Milestone 1 已经完成验收。
- 这轮验收同时固化了 Windows 侧加固项：契约生成不再依赖在 Windows 上脆弱的 `openapi-typescript` CLI 路径，controller operation 的 SQLite 测试在清理前显式关闭句柄，CLI 在上游断连被映射为 `502` 时仍然把它识别为 `transport` 而不是业务 `degraded`，Rust mock HTTP server 也不再受 Windows 非阻塞 accepted socket 抖动影响。
- 仍然缺失：controller 的真实 `hosts`、`bridge-rules`、`exposure-policies` 资源，CLI 的 host/rule/policy 工作流，覆盖完整 V1 信息架构的 live web-controller 数据链路，以及长驻式的 agent `HTTP over Tailscale` 稳态服务。
- 当前 Web 状态：`apps/web/src/main.ts` 只渲染 `overview`、`host-detail`、`operations` 三个 mock shell；`Hosts`、`Bridge Rules`、`Backups`、`Console` 目前只有导航标签，还没有真实 controller 数据支撑的页面。
- 下一步方向已固定在 `docs/brainstorms/2026-04-16-portmanager-mainline-progress-and-next-steps-requirements.md` 与 `docs/plans/2026-04-16-portmanager-mainline-reconciliation-plan.md`：先补齐接口与实时页面一致性，再提升里程碑状态。

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
- GitHub 私有备份在 V1 中属于受支持边界
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
- 安装依赖：`corepack pnpm --dir docs-site install`
- 生成语言页面：`corepack pnpm --dir docs-site run docs:generate`
- 构建发布站点：`corepack pnpm --dir docs-site run docs:build`

### 里程碑验证
- 运行完整主线验收 gate：`pnpm acceptance:verify`
- 运行当前单主机 / 单规则 / 诊断 / 单回滚 / 事件流证明链路：`pnpm milestone:verify`

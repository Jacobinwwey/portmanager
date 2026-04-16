# PortManager

Updated: 2026-04-16
Version: v0.3.0-docs-site-design-alignment

## English

PortManager is a docs-first control plane for managing remote localhost exposure over Tailscale with explicit safety rails around backup, rollback, diagnostics, and operations visibility.

This repository intentionally starts as a baseline repository, not as an implementation repository.
The first upload freezes decisions, contracts, design language, and deployment boundaries before any milestone code is written.
The current repository now also includes a formal docs publishing layer using `GitHub Pages + VitePress`.

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
- No business implementation code in the initial upload

### Repository layout
- `docs/specs/` stores product specifications, milestones, information architecture, diagnostics, SDK, Docker, and baseline checklists
- `docs/architecture/` stores architecture, contracts, and bootstrap decisions
- `docs/operations/` stores operational safety policy, especially backup and rollback
- `docs/design/` stores the product-console design baseline, the docs-site design baseline, and reference assets
- `docs-site/` stores the VitePress publishing layer for GitHub Pages
- `scripts/docs/` stores locale extraction and publishing support scripts
- `.github/workflows/` stores docs deployment automation
- `packages/contracts/openapi/` stores the controller API draft
- `packages/contracts/jsonschema/` stores runtime, backup, rollback, and diagnostics schemas

### Reading order
1. `docs/specs/portmanager-v1-baseline-checklist.md`
2. `docs/specs/portmanager-v1-product-spec.md`
3. `docs/architecture/portmanager-v1-architecture.md`
4. `docs/design/portmanager-overview-design-baseline.md`
5. `docs/design/portmanager-docs-site-design-baseline.md`
6. `packages/contracts/README.md`

### Docs site commands
- install: `corepack pnpm --dir docs-site install`
- generate locale pages: `corepack pnpm --dir docs-site run docs:generate`
- build the published docs site: `corepack pnpm --dir docs-site run docs:build`

## 中文

PortManager 是一个以 docs-first 为原则的控制平面项目，用于通过 Tailscale 管理远端 localhost 暴露能力，并显式提供备份、回滚、诊断与操作可见性等安全护栏。

这个仓库当前刻意是“基线仓库”，而不是“实现仓库”。
首次上传先冻结决策、契约、设计语言与部署边界，之后才进入里程碑代码实现。
当前仓库还包含了一套正式文档发布层，使用 `GitHub Pages + VitePress`。

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
- 首次上传不包含业务实现代码

### 仓库结构
- `docs/specs/` 存放产品规格、里程碑、信息架构、诊断、SDK、Docker 与基线清单
- `docs/architecture/` 存放架构、契约与 bootstrap 决策
- `docs/operations/` 存放运维安全策略，尤其是备份与回滚
- `docs/design/` 存放产品控制台设计基线、文档站设计基线与参考资产
- `docs-site/` 存放 GitHub Pages 的 VitePress 发布层
- `scripts/docs/` 存放语言拆分与发布辅助脚本
- `.github/workflows/` 存放文档部署自动化
- `packages/contracts/openapi/` 存放 controller API 草案
- `packages/contracts/jsonschema/` 存放运行态、备份、回滚与诊断 schema

### 推荐阅读顺序
1. `docs/specs/portmanager-v1-baseline-checklist.md`
2. `docs/specs/portmanager-v1-product-spec.md`
3. `docs/architecture/portmanager-v1-architecture.md`
4. `docs/design/portmanager-overview-design-baseline.md`
5. `docs/design/portmanager-docs-site-design-baseline.md`
6. `packages/contracts/README.md`

### 文档站命令
- 安装依赖：`corepack pnpm --dir docs-site install`
- 生成语言页面：`corepack pnpm --dir docs-site run docs:generate`
- 构建发布站点：`corepack pnpm --dir docs-site run docs:build`

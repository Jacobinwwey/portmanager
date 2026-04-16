# PortManager

Updated: 2026-04-16
Version: v0.3.0-docs-site-design-alignment

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

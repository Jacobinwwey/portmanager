---
title: "V1 架构"
audience: shared
persona:
  - contributor
  - admin
  - automation
section: architecture
sourcePath: "docs/architecture/portmanager-v1-architecture.md"
status: active
---
> 真源文档：`docs/architecture/portmanager-v1-architecture.md`
> Audience：`shared` | Section：`architecture` | Status：`active`
> Updated：2026-04-21 | Version：v0.2.0-m3-phase0-enablement
### 当前已实现的拆分
- `web`：面向操作员工作流与长期运行可见性的 TypeScript React SPA
- `controller`：TypeScript 的 `REST + SSE` API 服务
- `cli`：Rust 操作员与自动化入口
- `agent`：安装在受管主机上的 Rust 远端执行面
- `future shared core`：为可复用执行逻辑与平台抽象预留的 Rust crates

### 当前已验证拓扑
1. 操作者使用 Web 或 CLI。
2. Web 或 CLI 先进入共享的 `/api/controller` consumer boundary；这条边界当前仍由 controller 进程承载，并继续保留旧直连路由作为兼容别名。
3. Controller 完成请求校验、记录 operation、检查安全前提。
4. Bootstrap 之后，controller 通过 `HTTP over Tailscale` 访问 agent。
5. Agent 应用 desired state 并返回运行态证据。
6. Controller 持久化 runtime state、artifacts、backups、rollback points 与 event 更新。
7. Web 与 CLI 读取同一份 controller-backed 真相。

### 当前已验证的架构推进状态
- Milestone 1 的公共表面一致性已经完成验收。
- Milestone 2 的 confidence 门槛已经进入 promotion-ready，并继续由 `pnpm acceptance:verify`、`pnpm milestone:verify:confidence` 与 wording-review 流程保护。
- Controller 仍然在一个 TypeScript 服务里同时承担 desired state、orchestration、persistence、artifact indexing 与大部分 event/audit wiring。
- Agent 已经是 live 的 bounded execution plane，但还不是更强的 event / orchestration participant。
- Web 与 CLI 已经是同一份契约上的 truthful peer，而且这份契约现在已经包含 gateway-ready 的 `/api/controller` consumer boundary，只是还没有独立 gateway app。

### 对照 Scheme C 的深度比较

| Scheme C 关注点 | 当前仓库真相 | 推进分类 | 对 Milestone 3 的含义 |
| --- | --- | --- | --- |
| Consumer gateway boundary | 当前还没有独立 gateway app 或 service，但 controller 已经开始提供 gateway-ready 的 `/api/controller` consumer boundary，并继续兼容旧直连路由；`/consumer-boundary-decision-pack` 已明确说明这条边界为什么现在仍应保持内嵌，`/deployment-boundary-decision-pack` 也已明确说明为什么独立部署复核仍应保持在 hold，而 `/second-target-policy-pack` 现在还会公开 review-packet readiness，明确 `debian-12-systemd-tailscale` 仍然只是 review-prep，guide coverage 已完整而 artifact coverage 仍缺失 | Phase 0 baseline 已落地 | 下一焦点已经切到建立在 readiness surface 之上的 Unit 64 到 Unit 69：bootstrap、steady-state、backup-and-restore、diagnostics、rollback 与 second-target review closeout，而不是继续做路由外壳工作 |
| Controller / policy / event / audit 分层 | `controller-read-model`、`controller-domain-service`、`/event-audit-index` 与 persistence adapter 已经抽出第一批 seam，虽然 transport 与 storage 仍然集中太多职责 | Phase 0 baseline 已落地 | 下一焦点应该转向显式 audit-review owner，再讨论部署拆分 |
| 一等远端 agent | Agent 已提供 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`，controller 也已接入 live sync | 部分达成 | 在保持 agent 有边界的前提下继续增强事件语义 |
| 批量主机编排 | 一个有边界的 batch exposure-policy envelope 现在已经落地：controller、CLI 与 Web 都能围绕同一个 parent operation 与 host-scoped child outcome 复核结果 | Phase 0 baseline 已落地 | 继续把更广的 orchestration 收敛在同一套 audit model 上，而不是长出第二条路径 |
| 超出 SQLite 的持久化增长 | SQLite 仍然是 active store，但 persistence adapter 与 readiness reporting seam 都已经真实存在 | Phase 0 baseline 已落地 | 在任何 PostgreSQL 承诺之前，先补 migration decision surface |
| 第二目标画像的平台抽象 | Ubuntu 24.04 + systemd + Tailscale 仍是唯一支持目标，而 `debian-12-systemd-tailscale` 现在已经在 `/second-target-policy-pack` 里通过 review-packet readiness、guide coverage、artifact coverage 与 Units 63 through 69 队列被明确限制在有边界 review-prep 姿态里 | Phase 0 baseline 已落地 | 先执行 Unit 64 到 Unit 69，再讨论任何更广的第二目标声明或 abstraction rewrite |

### Milestone 3 Phase 0 的架构动作
Milestone 3 仍然不是从“全部拆开”开始。
它现在继续做的是有边界的 enablement：

- 把 `/api/controller` 稳定为 gateway-ready 的 consumer boundary，同时继续推迟任何独立 gateway 部署
- 为 `/events` 与 `/event-audit-index` 增加显式 audit-review owner
- 继续让 bounded multi-host / batch-operation primitive 留在同一套 operation/evidence model 上
- 在任何 PostgreSQL move 之前，把 persistence readiness 提升成 migration decision surface
- 把 supported-target expansion 继续放在显式 target-profile rule 之后

### 仍然锁定的连通性边界
- `SSH`：只用于 bootstrap、安装、救援与最后手段诊断
- `HTTP over Tailscale`：稳态 controller-agent 通信
- `REST + SSE`：继续通过共享的 `/api/controller` consumer boundary 承载 controller 与 web/cli 通信，直到独立 gateway 部署真的有必要
- 不允许 Web 直连 agent

### 不会改变的状态与证据规则
- Desired state 继续由 controller 持有。
- Runtime state 继续由 agent 上报、controller 建索引。
- Drift 继续显式呈现为 `degraded`。
- Snapshot 与 diagnostic artifact 继续只是证据，不是真源。
- Milestone 3 不允许绕过已经保护 accepted slice 的 backup、rollback 与 audit 语义。

### 近期架构风险
- 在 seam 还没抽出来前就过早谈 gateway 拓扑
- 多主机编排长出第二条审计路径
- 把数据库迁移压力靠猜测而不是测量来决定
- 在 target abstraction 还不存在前就开始平台广度表述

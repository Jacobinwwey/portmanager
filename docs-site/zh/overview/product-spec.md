---
title: "V1 产品规格"
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
> 真源文档：`docs/specs/portmanager-v1-product-spec.md`
> Audience：`shared` | Section：`overview` | Status：`active`
> Updated：2026-04-17 | Version：v0.4.8-m2-confidence-history-sync
### 摘要
PortManager V1 是一个通过 Tailscale 暴露远端 localhost 服务的控制平面，它的目标不只是“能转发”，而是“安全地转发”：具备期望状态、操作历史、诊断可见性、变更前备份以及明确回滚点。

### 产品姿态
- `docs-first` 是交付规则，不只是文档偏好。
- `One Host, One Rule, One Rollback` 是首个实现里程碑，也是验收重心。
- Web、CLI 与未来 agent 驱动自动化都必须作为同一契约面的平级一等入口。
- 即使高级 agent 工作流尚未实现，产品从第一天开始也必须保持 agent-friendly。

### 主要要解决的操作者问题
- 操作者需要一个比零散 SSH、临时系统修改、未文档化端口暴露脚本更安全的替代方案。
- 操作者需要知道一条规则究竟只是“配置了”，还是“真正生效了”，还是“已经静默降级”。
- 操作者需要可靠证明某个本地服务是否可达，以及它的网页是否真的按预期响应。
- 操作者需要一个有边界的回滚面，确保 PortManager 不会宣称接管与其无关的工作负载。

### V1 基线范围内
- 前后端拆分架构：React SPA web + TypeScript controller API。
- Rust CLI 与 Rust agent 作为后续里程碑中的执行层。
- controller-side 快照与诊断链路。
- 带事件流的显式 operations 模型。
- 备份与回滚作为硬安全要求。
- 用于存放快照、诊断、manifest 与操作证据的本地产物仓。
- 以 OpenAPI 与 JSON Schema 定义的共享公共契约。
- `controller + web` 的 self-hosted 部署边界。

### V1 基线范围外
- 在首次上传中交付业务实现代码。
- 将 PostgreSQL 作为默认状态库。
- 让 agent 承担浏览器运行时或截图职责。
- 支持超出 Ubuntu 24.04 + systemd + Tailscale 之外的通用多平台远端目标。
- 托管式 SaaS、Kubernetes 管理面或多租户控制平面。
- 移动端或桌面端终端产品。

### 已锁定假设
- 首个远端目标画像是 `Ubuntu 24.04 + systemd + Tailscale`。
- Controller 是期望状态的真源。
- Agent 是有边界的执行面，而不是策略平级面。
- SSH 仅用于 bootstrap 与救援。
- 所有运行时变更都必须作为 operation 被审计。
- 如果必需的本地备份失败，则 destructive mutation 不得继续。

### 主要领域对象
- `Host`：受管远端主机，具备 bootstrap、readiness 与 health 状态。
- `BridgeRule`：期望中的 localhost 暴露规则。
- `ExposurePolicy`：主机级别的允许源、排除项与冲突处理护栏。
- `HealthCheck`：机器可读的连通性与规则验证证据。
- `Operation`：由 API、CLI 或 Web 发起工作的审计记录。
- `RollbackPoint`：围绕 destructive mutation 创建的可验证恢复目标。
- `Backup`：带 manifest 与 checksum 的实际备份包。
- `Snapshot` 与 `Diagnostic`：controller 针对特定 host、rule、port 抓取的证据。

### V1 产品 Web 预期
- 产品 Web 的 Overview 页面必须复用你给出的控制台布局语言，并改写为 PortManager 语义。
- 产品必须暴露“主机中心表格 + 右侧上下文栏 + 底部事件流”这一信息架构。
- Host detail 必须显示当前 policy、rules、health、backups、rollback points 与最近 diagnostics。
- Port detail 必须显示网页快照预览、传输层可达性、HTTP 结果，以及适用时的 TLS 基础信息。
- VitePress 文档站属于独立的文档发布面，遵循单独的 docs-site 设计基线。

### 里程碑 1 的验收目标
只有当以下条件全部成立时，V1 实现才算有效：
- 一台主机可以从 `draft` 进入 `ready`
- 一条 bridge rule 可以从 `desired` 进入 `active`
- destructive operation 在变更前总能先完成本地备份
- 失败会留下 operation 记录与 rollback point
- controller 诊断同时产出机器可读结果与网页快照产物
- Web、CLI 与 API 对 host、rule、operation 与 degraded 状态的观察一致

### 当前实现进度快照
- 代码与测试已证明：变更前备份、回滚证据、controller-side diagnostics 抓取、operation 历史、事件回放、drift 驱动 degraded 状态、真实 host 生命周期资源、真实 bridge-rule CRUD、真实 exposure-policy 管理、覆盖锁定信息架构的 live Web 一致性，以及 controller-agent 稳态 `HTTP over Tailscale` 服务链路。
- `2026-04-17` 的最新验收证据已经成立：`pnpm acceptance:verify` 重新通过；其中内嵌的 milestone proof 现在已经证明 live bootstrap 到 `ready`、controller diagnostics 之后 bridge rule 进入 `active`、live agent HTTP apply/runtime collection，以及 backup / rollback 证据保持不变。
- controller 侧的规则生命周期会在 diagnostics 之后才进入 `active`，而原始 agent runtime 在验证完成前仍保持 `applied_unverified`。这条分层语义现在已经是刻意保留的实现，不再是缺失项。
- `2026-04-17` 的下一段 Milestone 2 切片也已经落地：agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在都会发布 `agentVersion` 以及 `live` / `stale` / `unreachable` 的 heartbeat 语义。
- `2026-04-17` 的下一段 Milestone 2 编排切片也已经落地：`pnpm milestone:verify:confidence` 现在已经把既有 `pnpm acceptance:verify` gate 与 remote-backup replay proof 收敛成一条规范 routine，`.github/workflows/mainline-acceptance.yml` 也会在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上运行这条更重的 routine。
- `2026-04-17` 的下一段 Milestone 2 confidence-history 切片也已经落地：规范 routine 现在会写出 `.portmanager/reports/milestone-confidence-report.json`、追加 `.portmanager/reports/milestone-confidence-history.json`、渲染 `.portmanager/reports/milestone-confidence-summary.md`，并附带 `eventName`、`ref`、`sha`、`runId`、`runAttempt`、`workflow` 等 CI traceability 字段；CI 也会先恢复并保存这组 bundle，再上传同一份 bundle，让开发者不必只靠原始日志核对持续转绿证据。
- `2026-04-17` 的下一段 Milestone 2 confidence-readiness 切片也已经落地：持久 history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，标记每次 run 是否真正属于 readiness 推进资格范围，并用 `7` 次 qualified run 加 `3` 次连续 qualified pass 作为统一阈值；同一份 summary 也会直接出现在 GitHub Actions job summary 里供开发者查看。
- `2026-04-17` 的下一段 Milestone 2 confidence-history sync 切片也已经落地：`pnpm milestone:sync:confidence-history` 现在会通过已认证 `gh` 把 GitHub Actions 已完成 `mainline-acceptance` bundle artifact 导回本地 `.portmanager/reports/`，按稳定 history entry id 去重，并让开发者在本地复核与 CI 相同的 readiness 结论。
- 深度对比已经完成的 `2026-04-16` reconciliation 文档之后，现在已经可以确认：旧的一致性缺口与证明编排缺口都已闭环；剩余技术缺口已经不再是继续补脚手架，而是根据同步后的 readiness 结果与人工复核来决定文案是否继续收窄。
- 当前产品结论：第一条可信的公共控制平面切片已经真实存在并完成验收；Milestone 2 的 confidence-readiness 维护现在意味着同步 completed mainline 证据、持续保持 qualified history 为绿，并且只在证据稳定时提升文案。

# PortManager V1 Product Specification

Updated: 2026-04-16
Version: v0.3.0-docs-site-design-alignment

## English

### Summary
PortManager V1 is a control plane for exposing selected remote localhost services over Tailscale without treating ad-hoc shell commands as the operating model.
The product goal is not only exposure, but safe exposure: desired state, operations history, diagnostics visibility, backup-before-mutation, and explicit rollback points.

### Product posture
- `docs-first` is a delivery rule, not a documentation preference.
- `One Host, One Rule, One Rollback` is the first implementation milestone and the acceptance center of gravity.
- Web, CLI, and future agent-driven automation are first-class peers over the same contract surface.
- The product must remain agent-friendly from day one, even before advanced agent workflows are implemented.

### Primary operator problems being solved
- Operators need a safer replacement for scattered SSH, ad-hoc system edits, and undocumented local port exposure scripts.
- Operators need visibility into whether a rule is merely configured, actually active, or silently degraded.
- Operators need a reliable way to prove that a target local service is reachable and visually responds as expected.
- Operators need a bounded rollback surface so PortManager never claims ownership over unrelated workloads.

### V1 in-scope baseline
- Split services architecture: React SPA web plus TypeScript controller API.
- Rust CLI and Rust agent as the execution-facing implementation layers for milestone work.
- Controller-side snapshot and diagnostics pipeline.
- Explicit operations model with event streaming.
- Backup and rollback as hard safety requirements.
- Local artifact store for snapshots, diagnostics, manifests, and operation evidence.
- Shared public contracts defined by OpenAPI and JSON Schema.
- Self-hosted deployment boundary for `controller + web`.

### V1 out-of-scope baseline
- Shipping milestone implementation code in the first upload.
- PostgreSQL as the default state store.
- Agent-side browser runtime or screenshot capture.
- Generic multi-platform host support beyond Ubuntu 24.04 with systemd and Tailscale.
- Managed Kubernetes, hosted SaaS, or multi-tenant control plane work.
- Mobile or desktop end-user clients.

### Locked assumptions
- The first remote target profile is `Ubuntu 24.04 + systemd + Tailscale`.
- Controller is the source of desired state.
- Agent is a bounded execution plane, not a peer strategist.
- SSH is bootstrap and rescue only.
- Runtime mutations must be auditable as operations.
- Destructive mutation cannot proceed if required local backup fails.

### Primary entities
- `Host`: a managed remote machine with bootstrap, readiness, and health state.
- `BridgeRule`: a desired localhost exposure rule.
- `ExposurePolicy`: the host-level guardrail for allowed sources, exclusions, and conflict handling.
- `HealthCheck`: machine-readable reachability and rule verification evidence.
- `Operation`: an auditable lifecycle record of work requested by API, CLI, or Web.
- `RollbackPoint`: a verified recovery target created around destructive mutations.
- `Backup`: a concrete stored bundle with manifest and checksums.
- `Snapshot` and `Diagnostic`: controller-captured evidence for a specific host, rule, and port.

### Product web expectations locked for V1
- Product web overview must use the provided control-console layout language, reinterpreted for PortManager semantics.
- The product must expose a host-centric main table, a contextual right rail, and a bottom event stream.
- Host detail must show current policy, rules, health, backups, rollback points, and recent diagnostics.
- Port detail must show webpage snapshot preview, transport reachability, HTTP result, and TLS basics when applicable.
- The VitePress docs site is a separate documentation surface and follows its own docs-site design baseline.

### Acceptance target for Milestone 1
A V1 implementation will be considered valid only if all of the following become true:
- one host can move from `draft` to `ready`
- one bridge rule can move from `desired` to `active`
- a destructive operation always creates a local backup first
- a failure leaves an operation record and rollback point
- controller diagnostics can produce both machine-readable results and webpage snapshot artifacts
- Web, CLI, and API observe the same host, rule, operation, and degraded state model

## 中文

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

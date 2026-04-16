# PortManager V1 Architecture

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### Service split
- `web`: TypeScript React SPA for operator workflows and long-lived operational visibility.
- `controller`: TypeScript API service exposing REST resources and SSE event streams.
- `cli`: Rust first-class operator and automation entrypoint.
- `agent`: Rust remote execution plane installed on managed hosts.
- `future shared core`: Rust crates for rule application logic, validation, and platform abstraction reuse.

### System responsibilities
- Controller owns desired state, orchestration, persistence, artifact indexing, and operation history.
- Web owns operator-facing interaction, visualization, and inspection.
- CLI owns automation-friendly command surfaces with deterministic machine output.
- Agent owns minimal execution, collection, rollback primitive, and bounded host introspection.
- Shared contracts own cross-surface DTO truth.

### Control-plane topology
1. Operator uses Web or CLI.
2. Web or CLI calls controller API.
3. Controller validates request against OpenAPI / JSON Schema derived types.
4. Controller records an `Operation` and resolves safety prerequisites.
5. Controller reaches agent over HTTP on Tailscale after bootstrap.
6. Agent applies desired state and returns runtime evidence.
7. Controller persists runtime state, artifacts, and event stream updates.
8. Web and CLI consume the same operation and state results.

### Connectivity boundary
- `SSH`: bootstrap, install, rescue, and last-resort diagnostics only.
- `HTTP over Tailscale`: steady-state controller-agent communication.
- `REST + SSE`: controller-web/cli communication.
- No direct Web-to-agent link is part of the baseline.

### State model
- Desired state is controller-owned.
- Runtime state is agent-reported and controller-indexed.
- Drift is a first-class outcome and must be represented explicitly as `degraded` rather than inferred away.
- Snapshot and diagnostic artifacts are evidence, not source of truth.

### Storage model
- Controller state store: `SQLite` in V1.
- Future migration surface: `PostgreSQL`.
- Artifact store: controller-managed filesystem path for screenshots, manifests, and diagnostics blobs.
- Remote managed paths: `/etc/portmanager` for human-maintained config and `/var/lib/portmanager` for operational state.

### Domain lifecycle
- Host lifecycle: `draft -> probing -> bootstrapping -> ready -> degraded -> retired`
- Rule lifecycle: `desired -> applying -> applied_unverified -> active -> degraded -> rollback_pending -> rolled_back -> removed`
- Operation lifecycle: `queued -> running -> succeeded | failed | degraded | cancelled`

### Non-goals for the baseline upload
- No hidden sidecars or implicit controller-written remote state outside documented managed paths.
- No direct shell-command orchestration model for steady-state operation.
- No coupling of UI-only state with actual domain state.
- No agent-side browser runtime.

## 中文

### 服务拆分
- `web`：面向操作员工作流与长期运行可见性的 TypeScript React SPA。
- `controller`：暴露 REST 资源与 SSE 事件流的 TypeScript API 服务。
- `cli`：面向操作员与自动化的一等 Rust 入口。
- `agent`：安装在受管主机上的 Rust 远端执行面。
- `future shared core`：用于规则应用逻辑、校验与平台抽象复用的 Rust crates。

### 系统职责
- Controller 负责期望状态、编排、持久化、产物索引与操作历史。
- Web 负责面向操作者的交互、可视化与检查。
- CLI 负责自动化友好的命令面与确定性机器输出。
- Agent 负责最小执行、运行态采集、回滚原语与有边界的主机自检。
- 共享契约负责跨入口 DTO 的真源。

### 控制平面拓扑
1. 操作者使用 Web 或 CLI。
2. Web 或 CLI 调用 controller API。
3. Controller 依据 OpenAPI / JSON Schema 派生类型完成请求校验。
4. Controller 记录一个 `Operation` 并检查安全前提。
5. Bootstrap 之后，controller 通过 Tailscale 上的 HTTP 访问 agent。
6. Agent 应用期望状态并返回运行态证据。
7. Controller 持久化 runtime state、artifacts 与 event stream 更新。
8. Web 与 CLI 消费同一份 operation 与状态结果。

### 连通性边界
- `SSH`：仅用于 bootstrap、安装、救援与最后手段诊断。
- `HTTP over Tailscale`：稳态下的 controller-agent 通信。
- `REST + SSE`：controller 与 web/cli 通信。
- 基线中不包含 Web 直连 agent。

### 状态模型
- Desired state 由 controller 持有。
- Runtime state 由 agent 上报、controller 建索引。
- 漂移必须作为一等结果被显式表示为 `degraded`，而不是被暗中吞掉。
- Snapshot 与 diagnostic artifact 是证据，不是真源。

### 存储模型
- Controller 状态库：V1 中为 `SQLite`。
- 未来迁移面：`PostgreSQL`。
- Artifact store：由 controller 管理的文件系统路径，用于截图、manifest 与诊断结果。
- 远端受管路径：`/etc/portmanager` 用于人类维护配置，`/var/lib/portmanager` 用于运行态数据。

### 领域生命周期
- Host 生命周期：`draft -> probing -> bootstrapping -> ready -> degraded -> retired`
- Rule 生命周期：`desired -> applying -> applied_unverified -> active -> degraded -> rollback_pending -> rolled_back -> removed`
- Operation 生命周期：`queued -> running -> succeeded | failed | degraded | cancelled`

### 基线上传的非目标
- 不允许出现未文档化的远端隐式 sidecar 或 controller 擅写状态路径。
- 不把 shell 命令编排当作稳态运行模型。
- 不把 UI 层局部状态和真实领域状态混在一起。
- 不让 agent 承担浏览器运行时职责。

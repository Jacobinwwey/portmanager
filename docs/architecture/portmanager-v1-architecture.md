# PortManager V1 Architecture

Updated: 2026-04-21
Version: v0.2.0-m3-phase0-enablement

## English

### Current implemented split
- `web`: TypeScript React SPA for operator workflows and long-lived operational visibility
- `controller`: TypeScript REST + SSE API service
- `cli`: Rust operator and automation entrypoint
- `agent`: Rust remote execution plane installed on managed hosts
- `future shared core`: Rust crates reserved for reusable execution and platform abstraction work

### Current verified topology
1. Operator uses Web or CLI.
2. Web or CLI calls the controller directly.
3. Controller validates requests, records operations, and resolves safety prerequisites.
4. Controller reaches the agent over `HTTP over Tailscale` after bootstrap.
5. Agent applies desired state and returns runtime evidence.
6. Controller persists runtime state, artifacts, backups, rollback points, and event updates.
7. Web and CLI read the same controller-backed truth.

### Current verified architecture progress
- Milestone 1 public-surface parity is accepted.
- Milestone 2 confidence thresholds are promotion-ready and remain guarded by `pnpm acceptance:verify`, `pnpm milestone:verify:confidence`, and the wording-review flow.
- The controller still owns desired state, orchestration, persistence, artifact indexing, and most event/audit wiring inside one TypeScript service.
- The agent is already a live bounded execution plane, but not yet a richer event or orchestration participant.
- Web and CLI are truthful peers over the same contract surface, but still consume the controller directly rather than a gateway-ready consumer boundary.

### Deep compare against Scheme C

| Scheme C concern | Current repo truth | Progress classification | Implication for Milestone 3 |
| --- | --- | --- | --- |
| Consumer gateway boundary | No dedicated gateway app or service; Web and CLI call controller directly | Not started | Begin with a gateway-ready contract boundary, not a new deployable service claim |
| Controller, policy, event, and audit separation | `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still centralize most of this work | Not started | Extract seams before debating deployment topology |
| First-class remote agent | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, `/rollback`; controller syncs live desired state | Partially earned | Deepen event semantics while keeping the agent bounded |
| Batch host orchestration | Proof slice remains one host / one rule plus reliability replay | Not started | Add bounded batch-operation envelopes on the same audit model |
| Persistence growth beyond SQLite | SQLite remains the only real store | Not started | Introduce persistence seams and migration-readiness criteria |
| Second-target platform abstraction | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started | Define abstraction rules before second-target claims |

### Milestone 3 Phase 0 architecture move
Milestone 3 does not begin with “split everything.”
It begins with bounded enablement:

- extract controller domain seams for orchestration, policy, read models, and event/audit indexing
- shape a gateway-ready consumer boundary without breaking current Web/CLI flows
- add bounded multi-host and batch-operation primitives that reuse the current operation/evidence model
- isolate persistence behind readiness seams before any PostgreSQL move
- keep supported-target expansion behind explicit abstraction rules

### Connectivity boundary that stays locked
- `SSH`: bootstrap, install, rescue, and last-resort diagnostics only
- `HTTP over Tailscale`: steady-state controller-agent communication
- `REST + SSE`: controller-web/cli communication until a gateway-ready boundary becomes real
- No direct Web-to-agent link

### State and evidence rules that remain unchanged
- Desired state stays controller-owned.
- Runtime state stays agent-reported and controller-indexed.
- Drift remains explicit as `degraded`.
- Snapshot and diagnostic artifacts remain evidence, not source of truth.
- Milestone 3 cannot bypass backup, rollback, or audit semantics that already protect the accepted slice.

### Near-term architecture risks
- premature gateway topology work without first extracting seams
- multi-host orchestration that creates a second audit path
- database migration pressure being guessed instead of measured
- platform-breadth claims appearing before target abstractions exist

## 中文

### 当前已实现的拆分
- `web`：面向操作员工作流与长期运行可见性的 TypeScript React SPA
- `controller`：TypeScript 的 `REST + SSE` API 服务
- `cli`：Rust 操作员与自动化入口
- `agent`：安装在受管主机上的 Rust 远端执行面
- `future shared core`：为可复用执行逻辑与平台抽象预留的 Rust crates

### 当前已验证拓扑
1. 操作者使用 Web 或 CLI。
2. Web 或 CLI 直接访问 controller。
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
- Web 与 CLI 已经是同一份契约上的 truthful peer，但它们仍然直接访问 controller，而不是通过 gateway-ready 的 consumer boundary。

### 对照 Scheme C 的深度比较

| Scheme C 关注点 | 当前仓库真相 | 推进分类 | 对 Milestone 3 的含义 |
| --- | --- | --- | --- |
| Consumer gateway boundary | 当前没有独立 gateway app 或 service；Web 与 CLI 仍直接访问 controller | 尚未开始 | 先做 gateway-ready 的 contract boundary，而不是先声称新部署拓扑 |
| Controller / policy / event / audit 分层 | `apps/controller/src/controller-server.ts` 与 `apps/controller/src/operation-store.ts` 仍集中承载大部分相关职责 | 尚未开始 | 先抽出 seam，再讨论部署拆分 |
| 一等远端 agent | Agent 已提供 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`，controller 也已接入 live sync | 部分达成 | 在保持 agent 有边界的前提下继续增强事件语义 |
| 批量主机编排 | 当前证明切片仍是 one host / one rule 加可靠性重放 | 尚未开始 | 需要在同一套 audit model 上增加 bounded batch-operation envelope |
| 超出 SQLite 的持久化增长 | SQLite 仍然是唯一真实状态库 | 尚未开始 | 先引入 persistence seam 与 migration-readiness criteria |
| 第二目标画像的平台抽象 | Ubuntu 24.04 + systemd + Tailscale 仍是唯一可信目标 | 尚未开始 | 在第二目标画像出现前先定义 abstraction rule |

### Milestone 3 Phase 0 的架构动作
Milestone 3 不是从“全部拆开”开始。
它先从有边界的 enablement 开始：

- 抽出 controller 的 orchestration、policy、read model 与 event/audit indexing seam
- 在不打断当前 Web/CLI 流程的前提下形成 gateway-ready 的 consumer boundary
- 增加建立在现有 operation/evidence model 上的 bounded multi-host / batch-operation primitive
- 在任何 PostgreSQL move 之前，把 persistence 隔离到 readiness seam 后面
- 把 supported-target expansion 继续放在显式 abstraction rule 之后

### 仍然锁定的连通性边界
- `SSH`：只用于 bootstrap、安装、救援与最后手段诊断
- `HTTP over Tailscale`：稳态 controller-agent 通信
- `REST + SSE`：在 gateway-ready boundary 真实落地前，继续作为 controller 与 web/cli 的通信方式
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

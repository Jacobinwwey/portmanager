---
title: "Toward C 策略"
audience: shared
persona:
  - contributor
  - admin
  - operator
  - automation
section: roadmap
sourcePath: "docs/specs/portmanager-toward-c-strategy.md"
status: active
---
> 真源文档：`docs/specs/portmanager-toward-c-strategy.md`
> Audience：`shared` | Section：`roadmap` | Status：`active`
> Updated：2026-04-21 | Version：v0.2.0-m3-phase0-enablement
### 用途
这份文档继续把 `Toward C` 保持为一个具体方向。
里程碑 3 不是“以后再扩点规模”。
它是 PortManager 从已经被接受的 `B` 状态，受控走向 **方案 C：Agent-First Distributed Platform** 的路径。

### 2026-04-21 的进入状态更新
PortManager 已经不再处于必须把 `Toward C` 纯粹停留在纸面上的阶段。
当前仓库已经具备：

- 已完成验收的 Milestone 1 公共切片
- 已达到 promotion-ready、并进入谨慎文案复核的 Milestone 2 confidence 主线
- 横跨 controller、CLI、web、agent、docs 与 CI review surface 的同一套 live evidence model

这意味着 Milestone 3 现在可以作为 `Phase 0 enablement` 启动。
这 **并不** 意味着 Scheme C 已经被实现。

### C 是什么
`C` 更具体地说，就是 **方案 C：Agent-First Distributed Platform**。
在这套方案里：

- controller、agent、event stream、policy layer、audit layer 会变成显式架构边界
- UI、CLI 与自动化入口会收敛到 gateway-ready 的 API 边界，而不是继续长出临时本地表面
- 远端 agent 仍然保持有边界，但会成为一等的证据与编排参与者

### C 不是什么
- 不是把任意 shell 自动化升级为运行模型
- 不是承诺一个版本里支持所有客户端和所有主机
- 不是出于语言洁癖驱动的重写命令
- 不是默认承诺托管 SaaS 或多租户
- 不是绕开契约治理的许可
- 也不是说当前仓库已经有 API gateway、拆开的 audit service、batch orchestration，或者 PostgreSQL readiness

### 它与 A、B 的关系
- `A` 冻结 docs-first 基线、契约与设计边界。
- `B` 证明第一条可信控制平面切片，并把当前 agent-service 的最小必要行为吸收进这个模型。
- 只有当 `A` 与 `B` 已经足够真实，扩展范围不会把产品重新变回模糊状态时，`C` 才能开始。

### 当前架构缺口地图

| Scheme C 预期 | 当前已验证状态 | 缺口状态 |
| --- | --- | --- |
| gateway-ready 的 consumer 边界 | controller 现在会公开 `/api/controller` 这条 consumer-prefixed 边界，同时继续兼容旧直连路由；Web 已经保持 prefix base URL 不丢失，CLI 也已经支持 `PORTMANAGER_CONSUMER_BASE_URL`，只是仍然没有独立 gateway app | Phase 0 baseline 已落地 |
| 显式 event / policy / audit 分层 | `controller-read-model`、`controller-domain-service`、`/event-audit-index` 与 persistence adapter 已经抽出第一批 seam，虽然 controller transport 与 store 仍然集中太多职责 | Phase 0 baseline 已落地 |
| 一等但有边界的 agent 角色 | agent 已经提供 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`，controller 也已接入 live sync | 部分达成 |
| 批量主机编排 | 一个有边界的 batch exposure-policy envelope 现在已经落地：controller、CLI 与 Web 都可以围绕同一个 parent operation 与 host-scoped child outcome 复核批量结果 | Phase 0 baseline 已落地 |
| 超出 SQLite 的持久化就绪度 | `operation-store` 现在已经运行在 SQLite-backed persistence adapter seam 后面，并会从真实 store 计数发布可度量的 PostgreSQL readiness pressure | Phase 0 baseline 已落地 |
| 面向第二目标画像的平台抽象 | Ubuntu 24.04 + systemd + Tailscale 仍然是唯一可信目标 | 尚未开始 |

### 为什么仍然需要 C
如果没有 C，PortManager 很容易停留在狭义、单用途的暴露工具上。
有了 C，PortManager 才有机会成长为更耐用的底座，用于支撑：

- 多主机操作
- 更丰富的 agent reporting 与事件语义
- 未来的 agent-consumer 工作流
- 更广的操作系统覆盖
- 更广的开发者与操作者集成表面

### 权衡摘要
方案 C 的好处：

- 长期扩展性更强
- 一等公民 agent 姿态更清晰
- policy、execution、events、audit 的长期分层更干净

如果过早启动，方案 C 的代价：

- 很容易过度设计
- 基础设施工作会跑在价值交付前面
- 在范围扩展时稀释可靠性真相

### Phase 0 后续工作流
Milestone 3 现在不是重新做一遍已落地 seam，而是在其上继续推进：

- 保持已落地的 `/api/controller` consumer boundary 稳定，同时定义未来 split criteria
- Unit 57：建立在当前 replay 与 indexed review surface 之上的独立 audit/event boundary 决策
- Unit 58：已完成。显式 target-profile registry 与 target-abstraction rule 现在已经先锁定 Ubuntu 24.04 + systemd + Tailscale 契约，再拒绝任何第二目标声明
- Unit 59：建立在已测量 readiness criteria 之上的 persistence promotion decision surface
- 继续让 bounded batch work 留在同一套 evidence model 上，而不是再发明第二条 orchestration 路径

### 延续到 C 的语言与边界决策
- 当前 `TypeScript web/controller + Rust CLI/agent` 的拆分仍然有效，除非后续真的测量到压力并证明必须改变。
- `OpenAPI + JSON Schema + codegen` 继续是不可谈判的硬规则。
- `TOML` 继续作为人类维护配置的首选格式，而 `JSON` 继续作为传输、快照与导出格式。
- `PostgreSQL` 仍然只是为真实并发或可靠性压力预留的迁移面，而不是象征性前提；新的 persistence adapter、readiness report 与显式 `/persistence-readiness` 契约，就是为了在任何默认状态库切换前先量化这类压力。

### 进入真实 C 执行阶段的前置条件
- B 状态的 operation 已经在反复使用中被证明可信。
- Drift、degraded、backup 与 rollback 语义已经在操作上站得住脚。
- 最小 agent-service 迁移已经足够完成，旧行为不再是事实上的重心。
- 契约表面已经足够稳定，不会让新增 SDK 与 agent-consumer 工作流造成语义分叉。

### 需要持续警惕的战略风险
Milestone 3 最大的风险，仍然是过早泛化。
如果 PortManager 在操作模型尚未可信之前就开始扩展平台和编排范围，产品只会变得更宽，同时也更弱。
防止这一点的方式，是把 C 当作一个有门槛的扩展阶段，并在 C 开始时继续保留 Milestone 2 guardrail。

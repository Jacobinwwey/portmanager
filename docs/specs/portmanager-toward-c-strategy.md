# PortManager Toward C Strategy

Updated: 2026-04-21
Version: v0.2.0-m3-phase0-enablement

## English

### Purpose
This document keeps `Toward C` specific.
Milestone 3 is not “more scale later.”
It is the bounded path from PortManager's accepted `B` state toward **Scheme C: Agent-First Distributed Platform**.

### Readiness update on 2026-04-21
PortManager is no longer in the old posture where `Toward C` had to stay purely theoretical.
The repo now has:

- an accepted Milestone 1 public slice
- a promotion-ready Milestone 2 confidence lane with deliberate wording review
- one verified live evidence model across controller, CLI, web, agent, docs, and CI review surfaces

That means Milestone 3 can start as `Phase 0 enablement`.
It does **not** mean Scheme C is already implemented.

### What C is
`C` is specifically **Scheme C: Agent-First Distributed Platform**.
In that scheme:

- controller, agent, event stream, policy layer, and audit layer become explicit architecture seams
- UI, CLI, and automation converge on a gateway-ready API boundary instead of ad-hoc local surface growth
- remote agents remain bounded, but become first-class evidence and orchestration participants

### What C is not
- not a pivot to arbitrary shell automation as the operating model
- not a promise to support every client and every host in one release
- not a rewrite mandate driven by language ideology
- not hosted SaaS or multi-tenant scope by default
- not permission to bypass contract governance
- not proof that the repo already contains a gateway, split audit service, batch orchestration, or PostgreSQL readiness

### Relationship to A and B
- `A` freezes the docs-first baseline, contracts, and design boundaries.
- `B` proves the first trusted control-plane slice and absorbs the minimum current agent-service behavior into that model.
- `C` starts only after `A` and `B` are real enough that broader scope will not dissolve the product back into ambiguity.

### Current architecture gap map

| Scheme C expectation | Current verified state | Gap posture |
| --- | --- | --- |
| Gateway-ready consumer boundary | Web and CLI still call the controller directly over `REST + SSE` | Not started |
| Explicit event/policy/audit seams | `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still concentrate most of that work | Not started |
| First-class bounded agent role | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback` with live controller sync | Partially earned |
| Batch host orchestration | Proof slice still centers on one host / one rule plus reliability replay | Not started |
| Persistence readiness beyond SQLite | SQLite remains the only real store | Not started |
| Platform abstraction for second targets | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started |

### Why keep C
Without C, PortManager risks staying only a narrow single-purpose exposure tool.
With C, PortManager can become a stronger foundation for:

- multi-host operations
- richer agent reporting and event semantics
- future agent-consumer workflows
- broader operating-system reach
- wider developer and operator integration surfaces

### Trade-off summary
Advantages of Scheme C:

- strongest long-term extensibility
- clearest first-class-agent posture
- cleanest long-term separation between policy, execution, events, and audit

Costs of Scheme C if started carelessly:

- easy over-design
- infrastructure work can outrun delivered value
- reliability truth can get diluted while scope broadens

### Phase 0 enablement workstreams
Milestone 3 starts with bounded enablement work, not full distributed separation:

- gateway-ready consumer boundary
- controller seam extraction for policy, orchestration, read models, and audit/event indexing
- bounded batch host and multi-operation primitives on the same evidence model
- persistence seams and PostgreSQL readiness criteria
- explicit target-abstraction rules before second-target claims

### Language and boundary decisions carried into C
- The current `TypeScript web/controller + Rust CLI/agent` split remains valid until measured pressure proves otherwise.
- `OpenAPI + JSON Schema + codegen` stays non-negotiable.
- `TOML` remains the preferred human-maintained config format, while `JSON` remains the transport, snapshot, and export format.
- `PostgreSQL` is still a migration path for real concurrency or reliability pressure, not a symbolic prerequisite.

### Entry criteria for real C execution
- B-state operations are trusted in repeated use.
- Drift, degraded, backup, and rollback semantics are operationally credible.
- Minimal agent-service migration is complete enough that legacy behavior is no longer the true center of gravity.
- Contract surfaces are stable enough that new SDK and agent-consumer flows do not cause semantic divergence.

### Strategy risk to watch
The biggest Milestone 3 risk is premature generalization.
If PortManager broadens platform and orchestration scope before the operational model is trusted, the product becomes broader and weaker at the same time.
The antidote is to treat C as a gated expansion and to keep the Milestone 2 guardrail active while C begins.

## 中文

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
| gateway-ready 的 consumer 边界 | Web 与 CLI 仍然通过 `REST + SSE` 直接访问 controller | 尚未开始 |
| 显式 event / policy / audit 分层 | `apps/controller/src/controller-server.ts` 与 `apps/controller/src/operation-store.ts` 仍然承载大部分相关职责 | 尚未开始 |
| 一等但有边界的 agent 角色 | agent 已经提供 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`，controller 也已接入 live sync | 部分达成 |
| 批量主机编排 | 当前证明切片仍以 one host / one rule 加可靠性重放为中心 | 尚未开始 |
| 超出 SQLite 的持久化就绪度 | SQLite 仍然是唯一真实状态库 | 尚未开始 |
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

### Phase 0 enablement 工作流
Milestone 3 先启动的是有边界的 enablement，而不是完整分布式拆分：

- gateway-ready 的 consumer boundary
- controller 的 seam extraction，用于 policy、orchestration、read model 与 audit/event indexing
- 建立在同一套 evidence model 上的 bounded batch host / multi-operation primitive
- persistence seam 与 PostgreSQL readiness criteria
- 在第二目标画像出现前先定义 target-abstraction rule

### 延续到 C 的语言与边界决策
- 当前 `TypeScript web/controller + Rust CLI/agent` 的拆分仍然有效，除非后续真的测量到压力并证明必须改变。
- `OpenAPI + JSON Schema + codegen` 继续是不可谈判的硬规则。
- `TOML` 继续作为人类维护配置的首选格式，而 `JSON` 继续作为传输、快照与导出格式。
- `PostgreSQL` 仍然只是为真实并发或可靠性压力预留的迁移面，而不是象征性前提。

### 进入真实 C 执行阶段的前置条件
- B 状态的 operation 已经在反复使用中被证明可信。
- Drift、degraded、backup 与 rollback 语义已经在操作上站得住脚。
- 最小 agent-service 迁移已经足够完成，旧行为不再是事实上的重心。
- 契约表面已经足够稳定，不会让新增 SDK 与 agent-consumer 工作流造成语义分叉。

### 需要持续警惕的战略风险
Milestone 3 最大的风险，仍然是过早泛化。
如果 PortManager 在操作模型尚未可信之前就开始扩展平台和编排范围，产品只会变得更宽，同时也更弱。
防止这一点的方式，是把 C 当作一个有门槛的扩展阶段，并在 C 开始时继续保留 Milestone 2 guardrail。

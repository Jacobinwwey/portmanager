# PortManager Toward C Strategy

Updated: 2026-04-16
Version: v0.1.0-roadmap-solidification

## English

### Purpose
This document turns `Toward C` from a loose label into a recorded strategic direction.
It exists so Milestone 3 is not read as “more scale later,” but as a specific broadening of PortManager's product and engineering posture.

### What C is
`C` is specifically **Scheme C: Agent-First Distributed Platform**.
It is not merely “broader platform support later.”
In this scheme:
- controller, agent, event stream, policy layer, and audit layer are split from the beginning
- UI, CLI, and automation all talk to an API gateway
- remote agents are treated as first-class citizens rather than thin edge helpers

This is the most architecturally complete direction under discussion.

### What C is not
- not a pivot to arbitrary shell automation as the primary operating model
- not a promise to support every client and every host in one release
- not a rewrite mandate driven by language ideology
- not a hosted SaaS or multi-tenant platform commitment by default
- not an excuse to bypass contract governance
- not the correct starting point for a V1 empty-repository build that still needs to prove practical value and robustness quickly

### Relationship to A and B
- `A` freezes the docs-first baseline, contracts, and design boundaries.
- `B` proves the first trusted control-plane slice and absorbs the minimum current agent-service behavior into that model.
- `C` only becomes responsible work once both `A` and `B` are already real enough that broader scope will not dissolve the product into ambiguity.

### Why keep C at all
Even though C is too heavy for the V1 starting point, it remains important because it captures the most complete long-term architecture direction:
- strongest theoretical extensibility
- cleanest first-class-agent posture
- cleanest long-term separation between policy, execution, events, and audit

The roadmap keeps C not because it should be started immediately, but because it should remain visible as an intentional later option once the system earns the right to broaden.

### Why C matters
Without C, PortManager risks remaining only a narrow single-purpose exposure tool.
With C, PortManager can become a more durable foundation for:
- multi-host operations
- richer agent reporting and event semantics
- future agent-consumer workflows
- broader operating-system reach
- wider developer and operator integration surfaces

### Trade-off summary
Advantages of Scheme C:
- most “complete” architecture on paper
- strongest theoretical extensibility
- strongest first-class-agent posture

Costs of Scheme C at V1 time:
- obvious over-design risk
- too much time can be spent on infrastructure instead of delivered value
- V1 can lose the practical implementation and robustness focus that matters most right now

Suitability:
- a better fit when there is already a team, product validation, and multiple deployment environments advancing in parallel
- a poor fit for the first proof slice of an empty-repository control plane

### Engineering implications locked for C
- `controller`: must grow stronger orchestration, operation graphing, and event indexing semantics rather than merely more CRUD endpoints
- `web`: must evolve from single-host inspection to multi-host and multi-operation coordination without losing the operator-first model
- `cli`: must remain deterministic and agent-friendly while supporting broader orchestration flows
- `agent`: must report richer runtime evidence and event structure, but remain bounded rather than becoming an ungoverned strategy peer
- `shared contracts`: must continue to govern every surface expansion so platform breadth does not become DTO drift

### Language and boundary decisions carried into C
- The current split of `TypeScript web/controller` plus `Rust CLI/agent` remains valid until measured pressure proves otherwise.
- `OpenAPI + JSON Schema + codegen` stays non-negotiable.
- `TOML` remains the preferred human-maintained config format, while `JSON` remains the transport, snapshot, and export format.
- `PostgreSQL` is a migration path for reliability and concurrency pressure, not a symbolic prerequisite for seriousness.

### Platform-expansion rule
C can broaden support to additional targets such as macOS, wider Linux profiles, Windows remote, and future mobile-adjacent consumer surfaces.
But each target must enter through an explicit support boundary and platform abstraction layer.
C is not allowed to grow by piling undocumented target-specific exceptions into the controller or agent.

### Entry criteria for real C execution
- B-state operations are trusted in repeated use
- drift, degraded, backup, and rollback semantics are operationally credible
- minimal agent-service migration is complete enough that the legacy behavior is no longer the true center of gravity
- contract surfaces are stable enough that new SDK and agent-consumer flows do not cause semantic divergence

### Strategy risk to watch
The biggest risk in C is premature generalization.
If PortManager broadens platform and orchestration scope before the operational model is trusted, the product will become broader and weaker at the same time.
The antidote is to treat C as a gated expansion, not a default appetite for abstraction.

## 中文

### 用途
这份文档把 `Toward C` 从一个松散标签，变成正式记录下来的战略方向。
它的作用是防止里程碑 3 被误读成“以后再扩点规模”，而是明确它对应的是 PortManager 在产品姿态和工程姿态上的一次扩展。

### C 是什么
`C` 更具体地说，就是 **方案 C：Agent-First Distributed Platform**。
它不是简单的“以后支持更多平台”。
在这套方案里：
- 从第一天开始就把 controller、agent、event stream、policy layer、audit layer 拆开
- UI、CLI、自动化接口都统一对着 API gateway
- 远端 agent 被视为一等公民，而不是薄薄的边缘执行器

这是当前讨论中架构上最“完整”的方向。

### C 不是什么
- 不是把任意 shell 自动化升级为主要运行模型
- 不是承诺在一个版本里支持所有客户端和所有主机
- 不是出于语言意识形态驱动的重写命令
- 不是默认承诺托管 SaaS 或多租户平台
- 不是绕开契约治理的借口
- 不是空仓库 V1 在仍需快速证明实践价值与鲁棒性时的正确起手方式

### 它与 A、B 的关系
- `A` 冻结 docs-first 基线、契约与设计边界。
- `B` 证明第一条可信控制平面切片，并把当前 agent-service 的最小必要行为吸收进这个模型。
- 只有当 `A` 与 `B` 都已经足够真实，扩展范围不会把产品重新变回模糊状态时，`C` 才是负责任的工作。

### 为什么还要保留 C
虽然 C 对 V1 起步来说过重，但它仍然重要，因为它承载了最完整的长期架构方向：
- 理论上的扩展性最好
- 一等公民 agent 姿态最清晰
- policy、execution、events、audit 的长期分层最干净

路线图保留 C，不是因为它应该立刻开始，而是因为一旦系统挣到了扩展范围的资格，它就应该作为一个被明确记录过的后续方向，而不是重新临时想象。

### 为什么 C 重要
如果没有 C，PortManager 很容易停留在一个狭义、单用途的暴露工具上。
有了 C，PortManager 才有机会成为更耐用的基础设施底座，用于支撑：
- 多主机操作
- 更丰富的 agent reporting 与事件语义
- 未来的 agent-consumer 工作流
- 更广的操作系统覆盖
- 更广的开发者与操作者集成表面

### 权衡摘要
方案 C 的优点：
- 架构上最“完整”
- 理论扩展性最好
- 一等公民 agent 姿态最清晰

方案 C 在 V1 时点的代价：
- 明显存在过度设计风险
- 很容易把时间耗在基础设施而不是价值交付上
- 会直接削弱当下最重要的“实践与鲁棒性落地”

适用阶段：
- 更适合已经有团队、已有产品验证、且多个部署环境同时推进的时候
- 不适合作为空仓库控制平面的第一条证明切片

### 在 C 中锁定的工程含义
- `controller`：要成长为更强的 orchestration、operation graphing 与 event indexing 语义，而不只是更多 CRUD 接口
- `web`：要从单主机检查面，成长为多主机 / 多 operation 协调面，同时不丢掉 operator-first 模型
- `cli`：必须继续保持确定性与 agent-friendly，同时支持更广的 orchestration 流程
- `agent`：要上报更丰富的运行态证据与事件结构，但仍然保持有边界，而不是变成失控的策略平级面
- `shared contracts`：必须继续治理所有扩展表面，防止平台广度演变成 DTO 漂移

### 延续到 C 的语言与边界决策
- 当前 `TypeScript web/controller + Rust CLI/agent` 的拆分仍然有效，除非后续真的测量到压力并证明必须改变。
- `OpenAPI + JSON Schema + codegen` 继续是不可谈判的硬规则。
- `TOML` 继续作为人类维护配置的首选格式，而 `JSON` 继续作为传输、快照与导出格式。
- `PostgreSQL` 是为可靠性与并发压力预留的迁移面，而不是用来象征“更专业”的前置条件。

### 平台扩展规则
C 可以把支持范围扩展到更多目标，例如 macOS、更广 Linux、Windows 远端，以及未来更接近移动端的 consumer surface。
但每个目标都必须通过显式支持边界和平台抽象层进入系统。
C 不允许通过不断往 controller 或 agent 里堆 undocumented target-specific exception 的方式“长出来”。

### 进入真实 C 执行阶段的前置条件
- B 状态的 operation 已经在反复使用中被证明可信
- drift、degraded、backup 与 rollback 语义已经在操作上站得住脚
- 最小 agent-service 迁移已经足够完成，旧行为不再是事实上的重心
- 契约表面已经足够稳定，不会让新增 SDK 与 agent-consumer 工作流造成语义分叉

### 需要持续警惕的战略风险
C 最大的风险，是过早泛化。
如果 PortManager 在操作模型尚未可信之前就开始扩展平台和编排范围，产品只会变得更宽，同时也更弱。
防止这一点的方式，是把 C 当作一个有门槛的扩展阶段，而不是默认的抽象冲动。

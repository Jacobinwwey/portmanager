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
> Updated：2026-04-16 | Version：v0.1.0-roadmap-solidification
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

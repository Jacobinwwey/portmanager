---
title: "契约策略"
audience: shared
persona:
  - integrator
  - contributor
  - automation
section: architecture
sourcePath: "docs/architecture/portmanager-contract-strategy.md"
status: active
---
> 真源文档：`docs/architecture/portmanager-contract-strategy.md`
> Audience：`shared` | Section：`architecture` | Status：`active`
> Updated：2026-04-16 | Version：v0.1.0-docs-baseline
### 硬规则
`OpenAPI + JSON Schema + 代码生成` 是 PortManager V1 不可谈判的基础。

### 契约归属
- OpenAPI 负责 controller API 资源、请求体、响应体与 SSE 事件结构。
- JSON Schema 负责面向 agent 的载荷、运行态快照、诊断证据、回滚结果与备份 manifest。
- 生成的 SDK 与生成的模型必须由这些契约派生，而不能长期维护并行的手写真源。

### 锁定这一点的原因
- 防止 Web、controller、CLI、agent 与 SDK 之间的 DTO 漂移。
- 让 CLI 输出和 Web/API 的状态语义保持收敛，而不是越做越分叉。
- 让未来语言扩展受 codegen 约束，而不是靠各端自行理解。
- 让契约评审先于实现评审。

### 代码生成规则
- Web、controller 与 TypeScript SDK 使用从 OpenAPI / JSON Schema 生成的 TypeScript 类型。
- CLI 与 agent 使用生成或与 schema 对齐的 Rust 模型。
- 临时手写适配层只允许作为包裹生成类型的薄集成代码。
- 禁止长期维护平行 DTO 真源。

### 版本规则
- 契约版本通过仓库评审推进，而不是由运行时漂移暗中改变。
- Breaking contract change 必须显式升级版本并更新文档。
- 事件流载荷必须与 REST 资源同样严格地版本化。

### 后续里程碑中的评审要求
任何修改资源结构、operation 状态结构、诊断载荷或回滚产物的实现 PR，都必须先更新契约，或者与契约更新一起提交。

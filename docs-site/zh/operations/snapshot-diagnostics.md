---
title: "快照与诊断"
audience: shared
persona:
  - operator
  - admin
  - automation
section: operations
sourcePath: "docs/specs/portmanager-snapshot-diagnostics.md"
status: active
---
> 真源文档：`docs/specs/portmanager-snapshot-diagnostics.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-16 | Version：v0.1.0-docs-baseline
### 已锁定的抓取模型
V1 使用 `controller-side capture`。
Controller 通过 Tailscale 访问 `host:port`，完成传输检查、HTTP 检查、TLS 检查与网页截图，而不是让 agent 承担浏览器运行时。

### 选择这一方案的原因
- 让 agent 保持小而专注于执行
- 让截图与诊断结果进入同一套控制平面证据系统
- 让 Web、CLI 与未来 SDK 消费同一套 artifact 模型
- 降低远端运行时依赖复杂度

### 最小诊断输出
- host 与 rule 上下文
- 目标端口与协议假设
- TCP 连通性结果
- 适用时的 HTTP 结果
- 页面标题与基础元信息
- 若存在跳转链则记录最终 URL
- 适用时的 TLS 基础信息：是否启用、subject、issuer、过期时间、有效性摘要
- 抓取时间戳
- operation 关联
- artifact 关联

### 最小快照输出
- 截图产物路径或对象键
- 可供预览的元信息
- viewport 与 capture mode 元信息
- operation 关联
- 目标 host/rule/port 上下文

### 产物处理
- 结果必须落到 controller 侧 artifact store。
- Operation 详情必须能链接到 diagnostics 与 snapshot 产物。
- Host 与 rule 视图必须暴露最近结果与历史记录。
- 若产物缺失，应视为 degraded 或 failed，而不是静默忽略。

### 前端预期
前端必须支持：
- 某端口最近一次预览图
- 诊断摘要卡片
- 最近运行历史
- operation 可追踪性
- 抓取失败时的显式错误状态

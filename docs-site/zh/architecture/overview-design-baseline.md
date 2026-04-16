---
title: "产品控制台设计基线"
audience: human
persona:
  - contributor
  - operator
section: architecture
sourcePath: "docs/design/portmanager-overview-design-baseline.md"
status: active
---
> 真源文档：`docs/design/portmanager-overview-design-baseline.md`
> Audience：`human` | Section：`architecture` | Status：`active`
> Updated：2026-04-16 | Version：v0.3.0-docs-site-design-alignment
### 作用范围边界
本文档只定义未来产品 Web 控制平面的设计基线。
它不负责定义公共 VitePress 文档站。
文档站发布层的设计基线单独记录在 `docs/design/portmanager-docs-site-design-baseline.md`。

### 设计真源
你提供的 HTML 设计现在已经成为 V1 Overview 控制台的官方视觉母版。
仓库中保留了：
- `docs/design/assets/original-onesync-reference.html`：原始提供的 HTML
- `docs/design/assets/portmanager-overview-reference.html`：PortManager 语义改写版参考页
- 当前这份设计基线文档
- 一份单独的语义映射文档

### 已冻结的内容
以下布局语言已经正式锁定为首个实现里程碑的前端基线：
- 带摘要指标的紧凑操作头部
- 节奏明确、带单一主要动作区的左侧导航
- 作为主操作面的高密度主表格
- 用于展示选中实体上下文状态的右侧栏
- 用于事件可见性的底部终端式流面板

### 必须完成的语义替换
原始资产管理语义必须被完全移除。
界面必须改用 PortManager 语义，例如：
- 控制平面健康状态
- 受管主机
- bridge rules
- exposure policy
- operations
- backups
- rollback points
- diagnostics 与 snapshots

### 不允许漂移的地方
- 不允许退化成通用 SaaS 管理后台平铺风格
- 不允许用巨大营销卡片替换高密度主机表格
- 不允许存在没有领域模型支撑的伪遥测标签
- 若未先修订本文档，不允许偏离这套母版布局语言

### 实现对齐要求
第一版真实 UI 实现必须先对齐这份基线，之后次级页面才可以更自由地延展。
如果后续实现确实要偏离这套语言，必须先更新文档，并把它作为一项设计决策处理，而不是编码便利行为。

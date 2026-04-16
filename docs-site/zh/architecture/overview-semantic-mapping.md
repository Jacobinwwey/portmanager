---
title: "Overview 语义映射"
audience: human
persona:
  - contributor
  - operator
section: architecture
sourcePath: "docs/design/portmanager-overview-semantic-mapping.md"
status: active
---
> 真源文档：`docs/design/portmanager-overview-semantic-mapping.md`
> Audience：`human` | Section：`architecture` | Status：`active`
> Updated：2026-04-16 | Version：v0.1.0-docs-baseline
### 用途
这份文档负责把你提供的 HTML 控制台骨架映射成 PortManager 领域语义，避免后续 UI 工作保留错误的名词体系。

### Header 映射
- `OneSync` -> `PortManager`
- 搜索框 -> 跨入口快速搜索 host、rule、operation、backup
- total / up / updates / off -> managed hosts / ready / active operations / degraded
- 个人资料区 -> 操作者身份与 workspace / environment 上下文

### Sidebar 映射
- `Dashboard` -> `Overview`
- `Software Assets` -> `Hosts`
- `Inventory` -> `Bridge Rules`
- `Debug Log` -> `Console`
- `Nodes` -> `Operations` 或最终以 host 为中心的导航
- 底部 CTA -> 根据页面上下文映射为 `Add Host` 或 `Apply Desired State`

### 主内容映射
- `Operations Overview` -> `Control Plane Overview`
- `Active Node` -> 当前选中主机或当前聚焦环境
- `Critical Software Assets` -> `Managed Hosts`
- 表格行 -> 主机行，而不是软件资产行
- 状态徽标 -> 与领域模型绑定的 readiness、policy 或 health 状态
- 右侧 metadata 卡片 -> `Selected Host`
- 右侧 skills 卡片 -> `Effective Policy`
- 底部 debug stream -> `Event Stream`

### V1 必须新增的 PortManager 语义
原始参考页并不足以完整表达 PortManager V1，因此实际实现时在保持布局语言的同时，必须补上：
- host readiness 与 Tailscale 身份
- backup 与 rollback 可见性
- diagnostics 与 snapshot 可见性
- 逐端口 reachability 与 HTTP/TLS 详情
- operation 可追踪性

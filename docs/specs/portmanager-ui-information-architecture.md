# PortManager Product Web UI Information Architecture

Updated: 2026-04-16
Version: v0.3.0-docs-site-design-alignment

## English

### Scope boundary
This document defines the product web control-plane information architecture.
It does not define the public VitePress docs site.
The docs-site publishing baseline lives in `docs/design/portmanager-docs-site-design-baseline.md`.

### Baseline direction
The UI baseline reuses the supplied operations-console visual language, but the semantics are fully rewritten for PortManager.
The baseline is not allowed to drift into asset-management vocabulary, synthetic telemetry, or dashboard theater.

### Primary navigation
- `Overview`
- `Hosts`
- `Bridge Rules`
- `Operations`
- `Backups`
- `Console`

### Header
The header is the control-plane status band.
It must show:
- global controller health
- managed host count and readiness summary
- active operations summary
- degraded count
- quick search
- settings / profile entry points

### Overview page
The overview page is the canonical first screen.
Its sections are locked as:
- Header: control-plane total state
- Sidebar: primary navigation and main action
- Main table: `Managed Hosts`
- Right rail: `Selected Host` and `Effective Policy`
- Bottom panel: `Event Stream`

### Hosts page
The hosts page deepens the overview table into a management surface.
Required modules:
- host identity and labels
- Tailscale identity
- readiness and degraded state
- bootstrap status
- agent version and heartbeat
- last successful backup
- last successful diagnostics run

### Host detail page
Required sections:
- identity and readiness summary
- effective exposure policy
- bridge rules table
- recent health checks
- recent operations
- backup and rollback history
- latest diagnostics and snapshots
- local artifact references

### Bridge rule detail page
Required sections:
- desired state vs runtime state
- listen and target coordinates
- policy evaluation result
- last apply operation
- verification result
- last rollback point touching the rule

### Port diagnostics detail page
This page is mandatory in V1 information architecture.
Required sections:
- latest webpage snapshot preview
- capture timestamp and operation link
- TCP reachability result
- HTTP status, page title, and final URL when applicable
- TLS basics: enabled, subject, issuer, expiry, validity note
- recent diagnostic history list
- artifact download links or references

### Operations page
Required sections:
- active and recent operations list
- operation state timeline
- initiator and request source
- linked host, rule, backup, rollback, and diagnostic artifacts
- terminal-style event stream for the selected operation

### Backups page
Required sections:
- local backup inventory
- GitHub backup status
- backup policy mode
- restore eligibility
- rollback point association

### Console page
The console is a human-readable stream of events and operator evidence.
It is not a shell replacement.
It must aggregate:
- controller events
- operation state transitions
- host degraded signals
- diagnostics completion events
- backup / rollback outcomes

### Design rule
The provided HTML remains the product web visual mother template.
This rule applies to the future React SPA control plane, not to `docs-site/`.
Any deviation from its core layout language must be preceded by a design baseline update in `docs/design/`.

## 中文

### 作用范围边界
本文档定义的是产品 Web 控制平面的信息架构。
它不负责定义公共 VitePress 文档站。
文档站发布层的基线记录在 `docs/design/portmanager-docs-site-design-baseline.md`。

### 基线方向
UI 基线复用你提供的 operations-console 视觉语言，但语义必须完全改写为 PortManager。
这套基线不允许漂移为资产管理词汇、伪遥测装饰或“看起来很像监控台”的空壳仪表盘。

### 主导航
- `Overview`
- `Hosts`
- `Bridge Rules`
- `Operations`
- `Backups`
- `Console`

### Header
Header 是控制平面的状态带，必须显示：
- controller 全局健康状态
- 受管主机数量与 readiness 摘要
- 活跃 operations 摘要
- degraded 数量
- 快速搜索
- 设置 / 个人资料入口

### Overview 页面
Overview 是规范中的首屏。
其结构锁定为：
- Header：控制平面总状态
- Sidebar：主导航与主要动作
- 主表：`Managed Hosts`
- 右栏：`Selected Host` 与 `Effective Policy`
- 底部面板：`Event Stream`

### Hosts 页面
Hosts 页面是在 overview 表格之上的深入管理面。
必须包含：
- 主机身份与标签
- Tailscale 身份
- readiness 与 degraded 状态
- bootstrap 状态
- agent 版本与心跳
- 最近一次成功备份
- 最近一次成功诊断

### Host detail 页面
必须包含：
- 身份与 readiness 摘要
- 生效中的 exposure policy
- bridge rules 表格
- 最近 health checks
- 最近 operations
- 备份与回滚历史
- 最近 diagnostics 与 snapshots
- 本地产物引用

### Bridge rule detail 页面
必须包含：
- desired state 与 runtime state 对比
- listen 与 target 坐标
- policy 评估结果
- 最近一次 apply operation
- verify 结果
- 最近影响该规则的 rollback point

### Port diagnostics detail 页面
这个页面在 V1 信息架构中是强制项。
必须包含：
- 最新网页快照预览
- 抓取时间戳与关联 operation 链接
- TCP 连通性结果
- HTTP 状态、页面标题，以及适用时的最终 URL
- TLS 基础信息：是否启用、subject、issuer、过期时间、有效性说明
- 最近诊断历史列表
- 产物下载链接或引用

### Operations 页面
必须包含：
- 活跃与最近 operations 列表
- operation 状态时间线
- 发起者与请求来源
- 关联的 host、rule、backup、rollback 与 diagnostic 产物
- 面向选中 operation 的终端式事件流

### Backups 页面
必须包含：
- 本地备份清单
- GitHub 备份状态
- 备份策略模式
- 恢复资格
- rollback point 关联关系

### Console 页面
Console 是面向人的事件流与操作证据视图，不是 shell 替代品。
它必须聚合：
- controller 事件
- operation 状态迁移
- host degraded 信号
- diagnostics 完成事件
- backup / rollback 结果

### 设计规则
你提供的 HTML 仍然是产品 Web 的视觉母版。
这条规则适用于未来 React SPA 控制平面，而不适用于 `docs-site/`。
任何偏离其核心布局语言的后续实现，都必须先更新 `docs/design/` 中的设计基线文档。

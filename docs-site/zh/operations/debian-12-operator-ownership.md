---
title: "Debian 12 操作员归属"
audience: shared
persona:
  - operator
  - admin
  - contributor
section: operations
sourcePath: "docs/operations/portmanager-debian-12-operator-ownership.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-operator-ownership.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
定义 `debian-12-systemd-tailscale` 的 review-prep 工作归属。

### 归属边界
- Review owner：`controller`
- review 批准前的支持 owner：除 Ubuntu 锁定基线之外没有额外支持 owner
- 候选 operator owner：负责准备 Debian 12 环境并记录 review packet 的维护者

### 必需 owner 职责
- 在 review 开启前，持续把支持声明锁在 Ubuntu。
- 负责 Debian 12 环境、Tailscale 可达性与 target-profile 注册。
- 保留 bootstrap、steady-state、backup、diagnostics、rollback 证据。
- 按 `docs/operations/portmanager-debian-12-review-packet-template.md` 记录 packet。
- 证据变化时同步更新 `/second-target-policy-pack` 与 docs 表面。
- 一旦 parity proof 回退，立即停止候选复核推进。

### 必需签字条件
- review packet 包含完整 acceptance recipe 证据包。
- review packet 遵循 `docs/operations/portmanager-debian-12-review-packet-template.md`。
- `/second-target-policy-pack` 与 docs、CLI、Web 保持同一份真相。
- rollback ownership 已经明确且完成演练。
- 任何未解决的 parity gap 都必须列为 blocking，而不是被愿景文案掩盖。

### 升级规则
如果 owner 职责或证据保留无法维持，`debian-12-systemd-tailscale` 必须继续停留在 review-prep，不能扩大支持声明。

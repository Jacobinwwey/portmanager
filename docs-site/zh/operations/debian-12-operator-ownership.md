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
定义 `debian-12-systemd-tailscale` 的 bounded-review 工作归属。

### 归属边界
- Review owner：`controller`
- review 关闭前的支持 owner：除 Ubuntu 锁定基线之外没有额外支持 owner
- 候选 operator owner：负责准备 Debian 12 环境、保留 packet 根目录并记录 bounded-review verdict 的维护者

### 必需 owner 职责
- 在 bounded review 关闭前，持续把支持声明锁在 Ubuntu。
- 负责 Debian 12 环境、Tailscale 可达性与 target-profile 注册。
- 保留 bootstrap、steady-state、backup、diagnostics、rollback 证据。
- 按 `docs/operations/portmanager-debian-12-review-packet-template.md` 记录 packet。
- 通过 `/second-target-policy-pack` 记录 adjudication verdict。
- 证据变化或 review 找到真实 delta 时，同步更新 `/second-target-policy-pack` 与 docs 表面。
- 一旦 parity proof 回退或 packet integrity 漂移，立即停止候选复核推进。

### 必需签字条件
- review packet 包含完整 acceptance recipe 证据包。
- review packet 遵循 `docs/operations/portmanager-debian-12-review-packet-template.md`。
- `/second-target-policy-pack` 与 docs、CLI、Web 一样公开 `review_required` 加 `review_open` 真相。
- 待裁定 verdict 必须显式存在：packet integrity、drift acknowledgement、support lock confirmation、operator sign-off、follow-up scope bounding。
- `/second-target-policy-pack` 与 docs、CLI、Web 保持同一份真相。
- rollback ownership 已经明确且完成演练。
- 任何未解决的 parity gap 或 review-found delta 都必须列为 blocking，而不是被愿景文案掩盖。

### 升级规则
如果 owner 职责或证据保留无法维持，`debian-12-systemd-tailscale` 必须继续停留在 bounded review，不能扩大支持声明。

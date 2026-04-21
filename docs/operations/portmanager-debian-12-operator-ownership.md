# PortManager Debian 12 Operator Ownership

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Define who owns review-prep work for `debian-12-systemd-tailscale`.

### Ownership boundary
- Review owner: `controller`
- Support owner before review approval: none beyond the locked Ubuntu baseline
- Candidate operator owner: the maintainer who stages the Debian 12 environment and records the review packet

### Required owner duties
- Keep support claims locked to Ubuntu until review opens.
- Stage Debian 12 environment, Tailscale reachability, and target-profile enrollment.
- Preserve bootstrap, steady-state, backup, diagnostics, and rollback evidence.
- Update `/second-target-policy-pack` and docs surfaces when evidence changes.
- Stop the candidate review immediately if parity proof regresses.

### Required sign-off conditions
- Review packet contains the full acceptance recipe evidence bundle.
- `/second-target-policy-pack` reflects the same truth as docs, CLI, and Web.
- Rollback ownership is explicit and rehearsed.
- Any unresolved parity gap is listed as blocking, not hidden behind aspirational prose.

### Escalation rule
If owner duty or evidence retention cannot be maintained, keep `debian-12-systemd-tailscale` in review-prep and do not widen supported-target claims.

## 中文

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
- 证据变化时同步更新 `/second-target-policy-pack` 与 docs 表面。
- 一旦 parity proof 回退，立即停止候选复核推进。

### 必需签字条件
- review packet 包含完整 acceptance recipe 证据包。
- `/second-target-policy-pack` 与 docs、CLI、Web 保持同一份真相。
- rollback ownership 已经明确且完成演练。
- 任何未解决的 parity gap 都必须列为 blocking，而不是被愿景文案掩盖。

### 升级规则
如果 owner 职责或证据保留无法维持，`debian-12-systemd-tailscale` 必须继续停留在 review-prep，不能扩大支持声明。

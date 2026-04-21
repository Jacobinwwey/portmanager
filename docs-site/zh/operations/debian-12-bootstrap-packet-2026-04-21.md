---
title: "Debian 12 Bootstrap Packet 2026-04-21"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md"
status: active
---
> 真源文档：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
这个目录保留了 `2026-04-21` 捕获的有边界 Unit 64 与 Unit 65 review packet。
它不会扩大支持声明。
它记录了一次真实的 `debian-12-systemd-tailscale` Debian 12 bootstrap 加 steady-state 预演，而 backup、diagnostics、rollback 与 second-target review 仍然待完成。

### 文件
- `bootstrap-capture-summary.json`：记录采集时间、controller commit、host id、drift 备注与 packet 概览。
- `bootstrap-operation.json`：controller bootstrap operation 的终态详情。
- `bootstrap-audit-index.json`：对应 `bootstrap_host` 的 audit-index 条目。
- `bootstrap-host-detail.json`：target-profile 确认与 host ready 状态。
- `steady-state-capture-summary.json`：记录采集时间、controller commit、host id、drift 备注与 steady-state 概览。
- `steady-state-operation.json`：bootstrap 后 controller mutation 的终态详情。
- `steady-state-health.json`：同一份有边界 packet 的 `/health` 响应。
- `steady-state-runtime-state.json`：同一份有边界 packet 的 `/runtime-state` 响应。
- `steady-state-audit-index.json`：对应 `create_rule` 的 audit-index 条目。
- `steady-state-host-detail.json`：bounded steady-state mutation 之后的 host detail。
- `bootstrap-initial-policy-pack.json`：历史上的落地前 `/second-target-policy-pack` 初始真相快照，仍保留 `capture_required` 起点。

### Drift 备注
- 这次保留的预演运行在本地 Debian 12 Docker 容器里。
- 容器 bridge 地址 `172.17.0.3` 在这份有边界 packet 中替代了 live Tailscale 地址。
- 支持声明继续锁定在 `ubuntu-24.04-systemd-tailscale`。

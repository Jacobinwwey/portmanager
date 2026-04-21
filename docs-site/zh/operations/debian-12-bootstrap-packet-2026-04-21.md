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
这个目录保留了 `2026-04-21` 捕获的有边界 Unit 64 到 Unit 69 review packet。
它不会扩大支持声明。
它记录了一次真实的 `debian-12-systemd-tailscale` Debian 12 bootstrap、steady-state、backup、diagnostics 与 rollback 预演，并且现在已经支撑 bounded second-target review，但更广支持声明仍然保持锁定。

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
- `backup-capture-summary.json`：记录采集时间、controller commit、host id、readiness 变化与 backup packet 概览。
- `backup-operation.json`：controller backup operation 的终态详情。
- `backup-summary.json`：保留同一份 packet 的 backup 摘要、manifest 链接与 remote-backup 结果。
- `backup-rollback-points.json`：保留同一份 backup packet 的 ready rollback-point 链接。
- `backup-host-detail.json`：bounded backup operation 之后的 host detail。
- `backup-github-upload.json`：保留 backup bundle 的 GitHub 上传脱敏证明。
- `diagnostics-capture-summary.json`：记录 diagnostics 切片的采集时间、host/rule 链接、artifact coverage 变化与 operator drift 备注。
- `diagnostics-operation.json`：controller diagnostics operation 的终态详情。
- `diagnostics-artifacts.json`：保留同一份 packet 的 diagnostics artifact bundle，其中包含机器可读结果与 snapshot 路径。
- `diagnostics-audit-index.json`：同一份 bounded packet 的 diagnostics audit-index 条目。
- `diagnostics-host-detail.json`：diagnostics 验证 bounded rule 之后的 host detail。
- `rollback-capture-summary.json`：记录 rollback 切片的采集时间、rollback 链接、rollback 后 diagnostics 链接与 operator drift 备注。
- `rollback-operation.json`：controller rollback operation 的终态详情。
- `rollback-result.json`：从原始 rollback 产物复制出的结果摘要。
- `rollback/rp_op_backup_1776807481139_825-result.json`：controller rollback primitive 直接产生的原始 rollback result artifact。
- `rollback-post-diagnostics.json`：同一轮 rehearsal 的 rollback 后 diagnostics 链接。
- `rollback-post-diagnostics-audit-index.json`：rollback 后 diagnostics 的 audit-index 条目。
- `rollback-host-detail.json`：rollback 与 rollback 后 diagnostics 之后的 host detail。
- `backups/backup_op_backup_1776807481139_825/manifest.json`：这次有边界 backup bundle 的本地 manifest。
- `bootstrap-initial-policy-pack.json`：历史上的落地前 `/second-target-policy-pack` 初始真相快照，仍保留 `capture_required` 起点。
- `packet-ready-policy-pack.json`：完整有边界 packet 落地后的最终 `/second-target-policy-pack` 快照，显示 `packet_ready` 与 `review_required`。

### Drift 备注
- 这次保留的预演运行在本地 Debian 12 Docker 容器里。
- 容器 bridge 地址 `172.17.0.2` 在这份有边界 packet 中替代了 live Tailscale 地址。
- 支持声明继续锁定在 `ubuntu-24.04-systemd-tailscale`。

# Debian 12 Review Packet 2026-04-21

Updated: 2026-04-21
Version: v0.1.0

## English

This directory preserves the bounded Unit 64 and Unit 65 review packet captured on `2026-04-21`.
It does not widen supported-target claims.
It records one real Debian 12 bootstrap plus steady-state rehearsal for `debian-12-systemd-tailscale` while backup, diagnostics, rollback, and second-target review remain pending.

### Files
- `bootstrap-capture-summary.json`: capture date, controller commit, host id, drift note, and packet overview.
- `bootstrap-operation.json`: terminal controller bootstrap operation detail.
- `bootstrap-audit-index.json`: linked `bootstrap_host` audit-index entry.
- `bootstrap-host-detail.json`: target-profile confirmation and host ready state.
- `steady-state-capture-summary.json`: capture date, controller commit, host id, drift note, and steady-state packet overview.
- `steady-state-operation.json`: terminal controller post-bootstrap mutation detail.
- `steady-state-health.json`: preserved `/health` response from the same bounded packet.
- `steady-state-runtime-state.json`: preserved `/runtime-state` response from the same bounded packet.
- `steady-state-audit-index.json`: linked `create_rule` audit-index entry for the same bounded packet.
- `steady-state-host-detail.json`: host detail after the bounded steady-state mutation.
- `bootstrap-initial-policy-pack.json`: historical pre-landing `/second-target-policy-pack` truth showing the packet originally started from `capture_required`.

### Drift Note
- The preserved rehearsal ran inside a local Debian 12 Docker container.
- Container bridge address `172.17.0.3` replaced a live Tailscale address in this bounded packet.
- Support claims remain locked to `ubuntu-24.04-systemd-tailscale`.

## 中文

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

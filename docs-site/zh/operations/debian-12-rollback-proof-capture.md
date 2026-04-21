---
title: "Debian 12 回滚证明采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-rollback-proof-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-rollback-proof-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 rollback 证明采集指南。
本文档本身不会扩大支持声明。
它现在指向 `/second-target-policy-pack` 已视为落地、并且位于同一份完整 bounded review packet 里的 rollback rehearsal 产物包。

### 已保留的 2026-04-21 有边界 packet
- packet 产物根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- rollback-point id：`rp_op_backup_1776807481139_825`
- rollback operation id：`op_rollback_1776809568474_70`
- rollback 结果摘要与产物：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-capture-summary.json`、`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback/rp_op_backup_1776807481139_825-result.json`
- rollback 后 diagnostics 链接：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-post-diagnostics.json`

### 输入条件
- 候选主机已经完成一次有边界的带 backup mutation 采集和一次 diagnostics 采集。
- `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md` 与 `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md` 已经作为 rollback 之前证据包的锚点存在。
- 当前主线上的 `pnpm acceptance:verify` 继续为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`、`docs/operations/portmanager-debian-12-review-packet-template.md` 与 `docs/operations/portmanager-backup-rollback-policy.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 rollback parity 已经由保留 packet 支撑，但更广支持声明仍然在 bounded review 完成前保持锁定。
2. 列出候选主机的 rollback points，并选择一个属于同一份有边界 review packet 的 point：
   - `portmanager rollback-points --host-id <host-id> --json`
3. 预演一次有边界 rollback：
   - `portmanager rollback-points apply <rollback-point-id> --wait --json`
4. 记录 resulting controller operation 详情：
   - `portmanager operation get <rollback-operation-id> --json`
5. 保留同一份 packet 里的 rollback-point id 与终态 rollback 结果摘要：
   - 保留显式 `rollbackPointId`
   - 保留显式终态 `resultSummary`
6. 为同一轮 rehearsal 记录一条 rollback 后 diagnostics 链接：
   - `portmanager diagnostics list --host-id <host-id> --rule-id <rule-id> --json`
   - 保留一条 linked diagnostics artifact 路径或 audit 引用，证明 rollback 后验证确实执行过
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- 本次 rehearsal 选中的 rollback-point id
- rollback 的 controller operation id
- 终态 rollback 结果摘要
- 同一次 rehearsal 的 rollback 后 diagnostics artifact 或 audit 链接

### 退出规则
把 rollback parity 固定到同一条已保留 rollback rehearsal 上；只要四类链接产物出现漂移，就先刷新 `/second-target-policy-pack`，并继续保持 bounded review。

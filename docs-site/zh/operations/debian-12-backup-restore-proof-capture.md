---
title: "Debian 12 备份与恢复证明采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-backup-restore-proof-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 backup-and-restore 证明采集指南。
本文档不表示完整 second-target review 已通过。
它现在记录 `/second-target-policy-pack` 已视为落地的有边界 backup 产物包，并把它放在同一份完整保留的 review packet 里。

### 输入条件
- 候选主机已经完成一次有边界 bootstrap 预演。
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` 与 `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` 已经作为 transport 证据锚点存在。
- 当前主线上的 `pnpm acceptance:verify` 继续为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`、`docs/operations/portmanager-debian-12-review-packet-template.md` 与 `docs/operations/portmanager-backup-rollback-policy.md` 继续作为配套真相面。

### 已保留的 2026-04-21 有边界 packet
- packet 产物根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- backup operation id：`op_backup_1776807481139_825`
- backup 结果摘要：`backup backup_op_backup_1776807481139_825 created with rollback point rp_op_backup_1776807481139_825; GitHub backup uploaded to Jacobinwwey/portmanager-backups:portmanager-backups/host_debian_12_review_packet_1776805736172_558/backup_op_backup_1776807481139_825.bundle.json`
- backup manifest 路径：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backups/backup_op_backup_1776807481139_825/manifest.json`
- remote-backup 结果：`succeeded`，上传记录保存在 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-github-upload.json`
- restore-readiness 引用：`rp_op_backup_1776807481139_825`，保存在 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-rollback-points.json`

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 backup-and-restore parity 已由保留 packet 支撑，而更广支持声明仍然在 bounded review 完成前保持锁定。
2. 在候选主机上触发一次有边界 controller backup operation：
   - 调用 `POST /backups/run`，并传入 `mode: "required"`
   - 只有在保持同一套 manifest、remote-backup 与 rollback-point 证据模型时，才可以改用等价路径。
3. 记录对应 controller operation 详情：
   - `portmanager operation get <backup-operation-id> --json`
4. 采集同一条 operation 对应的 backup 摘要：
   - `portmanager backups list --operation-id <backup-operation-id> --json`
5. 记录同一份 bundle 里的 remote-backup 结果：
   - 如果 GitHub backup 已启用，就保留显式 configured 结果
   - 如果 remote backup 仍未配置，就保留显式 `not_configured` 状态与 operator action
6. 记录同一份 bundle 里的 restore-readiness 引用：
   - `portmanager rollback-points list --host-id <host-id> --state ready --json`
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- 带 backup 的 controller operation id
- backup manifest 路径
- 同一份 bundle 中的 remote-backup 结果，或显式 not-configured 状态
- 指向同一条 operation 的 rollback-point 或 restore-readiness 引用

### 退出规则
把 backup and restore parity 固定到同一份有边界 backup operation packet 上；只要四类链接产物出现漂移，就先刷新 `/second-target-policy-pack`，并继续保持 bounded review。

---
title: "Debian 12 Review Packet 模板"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-review-packet-template.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-review-packet-template.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.2.0
### 目的
冻结一份 `debian-12-systemd-tailscale` 的显式 review packet 模板。
本文档不宣称等价已经通过。
它只说明在 `/second-target-policy-pack` 推进任何被阻塞 parity criterion 之前，哪些证据槽位必须真实填满。

### Packet 头部
- candidate target profile id
- candidate host id 与 Tailscale 地址
- operator 名称与 review 日期
- 当前 review 的 controller commit 或 release
- drift 摘要，以及仍然阻塞的 mismatch

### 已保留的 2026-04-21 完整有边界 packet
- packet 产物根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review 日期：`2026-04-21`
- controller commit：`b4b648fd4a2b694df1892ea2b6fe610e5d387516`
- candidate target profile id：`debian-12-systemd-tailscale`
- candidate host id：`host_debian_12_review_packet_1776805736172_558`
- 本次有边界预演记录地址：`172.17.0.2`
- bootstrap operation id：`op_bootstrap_host_1776805736313_817`
- bootstrap result summary：`host host_debian_12_review_packet_1776805736172_558 bootstrapped via http://172.17.0.2:8711; 0 rule(s) staged with backup policy best_effort`
- audit 引用：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-audit-index.json`
- target-profile 确认：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-host-detail.json`
- steady-state 后续 mutation operation id：`op_create_rule_1776805736384_555`
- steady-state `/health` 采集：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-health.json`
- steady-state `/runtime-state` 采集：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-runtime-state.json`
- steady-state audit 引用：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-audit-index.json`
- backup operation id：`op_backup_1776807481139_825`
- backup 结果摘要：`backup backup_op_backup_1776807481139_825 created with rollback point rp_op_backup_1776807481139_825; GitHub backup uploaded to Jacobinwwey/portmanager-backups:portmanager-backups/host_debian_12_review_packet_1776805736172_558/backup_op_backup_1776807481139_825.bundle.json`
- backup manifest 路径：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backups/backup_op_backup_1776807481139_825/manifest.json`
- backup 摘要：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-summary.json`
- remote-backup 上传记录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-github-upload.json`
- restore-readiness 引用：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-rollback-points.json`
- diagnostics operation id：`op_diag_1776809568435_848`
- diagnostics artifact bundle：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-artifacts.json`
- diagnostics audit 引用：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-audit-index.json`
- diagnostics drift 备注：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json`
- rollback-point id：`rp_op_backup_1776807481139_825`
- rollback operation id：`op_rollback_1776809568474_70`
- rollback 结果摘要：`rollback rp_op_backup_1776807481139_825 applied from rp_op_backup_1776807481139_825-result.json`
- rollback 结果产物：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback/rp_op_backup_1776807481139_825-result.json`
- rollback 后 diagnostics 链接：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-post-diagnostics.json`
- drift 摘要：这次保留的 review packet 使用本地 Debian 12 Docker bridge 替代 live Tailscale，因此更广支持声明继续保持锁定，直到 bounded second-target review 关闭。

### filesystem-backed live packet 扩展
- 新 packet 根目录模式：`docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`
- 规范 summary 文件名：`live-transport-follow-up-summary.json`
- scaffold helper：`pnpm milestone:scaffold:live-packet -- --packet-date <date>`
- assembly helper：`pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
- validator helper：`pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
- assembly helper 会把真实源产物复制到规范 packet 本地文件名中，自动推导 `candidateTargetProfileId`、`capturedAt` 与 `capturedAddress`，并在跨源地址漂移时直接失败，因此 operator 不再默认手写 `live-transport-follow-up-summary.json`
- controller 默认真相现在只会读取“最新有效 packet”根目录，而这份 summary 文件至少要同时保留：
  - `candidateTargetProfileId`
  - `capturedAt`
  - `capturedAddress`
  - `requiredArtifactIds`
  - `artifactFiles`
- discovery 的最小 packet 本地文件布局固定为：
  - `candidate-host-detail.json`
  - `bootstrap-operation.json`
  - `steady-state-health.json`
  - `steady-state-runtime-state.json`
  - `controller-audit-index.json`
  - `live-transport-follow-up-summary.json`
- `requiredArtifactIds` 必须包含全部五个 live follow-up artifact id，而 `artifactFiles` 必须把每个 id 映射到同一 packet 根目录下一个已经存在的文件。
- `capturedAddress` 必须非空，而且不能继续保持 `172.17.0.2`。
- 任何还带 scaffold marker 的 summary 或 artifact 文件都属于“故意无效”的准备态，不算真实 packet 证据。
- 更新但无效的新 packet 根目录不会清除 blocking delta；controller 会回退到最新有效根目录，或继续保持 `capture_required`。

### 必需证据分区
1. Bootstrap transport parity
   - bootstrap operation id
   - bootstrap result summary
   - 对应的 event replay 或 audit-index 引用
   - 证明 host target profile 仍然是 `debian-12-systemd-tailscale`
2. Steady-state transport parity
   - bootstrap 之后的一次 controller-driven mutation
   - 对应 `/health` 采集
   - 对应 `/runtime-state` 采集
   - 对应 controller operation 或 audit 引用
3. Backup and restore parity
   - 有边界 backup operation id
   - backup manifest 路径
   - 若已配置则附上 remote-backup 结果
   - 同一份 packet 内的 restore 或 restore-readiness 备注
4. Diagnostics parity
   - diagnostics operation id
   - diagnostics artifact 路径
   - 对应 event replay 或 audit-index 引用
   - 任意 drift 的 operator 简述
5. Rollback parity
   - rollback-point id
   - rollback operation id
   - rollback result summary
   - 回滚后 diagnostics 链接

### 发布规则
- 在每个必需分区都持续拥有真实 artifact 链接、并且 bounded review 尚未关闭之前，packet 保持为有边界 review。
- 任何分区一旦回退，先更新 `/second-target-policy-pack`，并继续把支持声明锁在 Ubuntu。
- 当证据变化时，把这份 packet 同步回 acceptance recipe、bootstrap proof 指南、steady-state proof 指南、backup-restore proof 指南、diagnostics proof 指南、rollback proof 指南与 operator ownership 文档。

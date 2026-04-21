# PortManager Debian 12 Backup and Restore Proof Capture

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze one concrete backup-and-restore proof-capture guide for `debian-12-systemd-tailscale`.
This document does not mark backup and restore parity as passed.
It defines the minimum backup-bearing artifact bundle that must exist before `/second-target-policy-pack` can move backup parity beyond review-prep.

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal.
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` and `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` already anchor transport evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`, `docs/operations/portmanager-debian-12-review-packet-template.md`, and `docs/operations/portmanager-backup-rollback-policy.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm backup parity still blocks review.
2. Run one backup-bearing controller mutation on the candidate host:
   - `portmanager bridge-rules delete --rule-id <rule-id> --wait`
   - Use any equivalent bounded mutation only if it preserves the same backup and rollback evidence model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <backup-bearing-operation-id> --json`
4. Capture the linked backup summary from the same mutation:
   - `portmanager backups --operation-id <backup-bearing-operation-id> --json`
5. Record the remote-backup result from the same bundle:
   - preserve the explicit configured result if GitHub backup is enabled
   - preserve the explicit `not_configured` state and operator action if remote backup is still absent
6. Record one restore-readiness reference from the same bundle:
   - `portmanager rollback-points --host-id <host-id> --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- backup-bearing controller mutation id
- backup manifest path
- remote-backup result or explicit not-configured state from the same bundle
- rollback-point or restore-readiness reference linked to the same mutation

### Exit rule
Keep backup and restore parity blocked until one review packet links all four artifacts back to the same backup-bearing mutation.

## 中文

### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 backup-and-restore 证明采集指南。
本文档不表示 backup and restore parity 已通过。
它只定义在 `/second-target-policy-pack` 能把 backup parity 从 review-prep 向前推进之前，最少必须真实存在的 backup-bearing 产物包。

### 输入条件
- 候选主机已经完成一次有边界 bootstrap 预演。
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` 与 `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` 已经作为 transport 证据锚点存在。
- 当前主线上的 `pnpm acceptance:verify` 继续为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md`、`docs/operations/portmanager-debian-12-review-packet-template.md` 与 `docs/operations/portmanager-backup-rollback-policy.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 backup parity 仍然是阻塞项。
2. 在候选主机上执行一次带 backup 的 controller mutation：
   - `portmanager bridge-rules delete --rule-id <rule-id> --wait`
   - 只有在保持同一套 backup 与 rollback 证据模型时，才可以改用等价的有边界 mutation。
3. 记录对应 controller operation 详情：
   - `portmanager operation get <backup-bearing-operation-id> --json`
4. 采集同一条 mutation 对应的 backup 摘要：
   - `portmanager backups --operation-id <backup-bearing-operation-id> --json`
5. 记录同一份 bundle 里的 remote-backup 结果：
   - 如果 GitHub backup 已启用，就保留显式 configured 结果
   - 如果 remote backup 仍未配置，就保留显式 `not_configured` 状态与 operator action
6. 记录同一份 bundle 里的 restore-readiness 引用：
   - `portmanager rollback-points --host-id <host-id> --json`
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- 带 backup 的 controller mutation id
- backup manifest 路径
- 同一份 bundle 中的 remote-backup 结果，或显式 not-configured 状态
- 指向同一条 mutation 的 rollback-point 或 restore-readiness 引用

### 退出规则
在同一份 review packet 把四类产物都链接回同一次带 backup 的 mutation 之前，backup and restore parity 继续保持阻塞。

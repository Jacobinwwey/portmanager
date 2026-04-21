# PortManager Debian 12 Review Packet Template

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze one explicit review-packet template for `debian-12-systemd-tailscale`.
This document does not claim that parity already passed.
It names the artifact slots that must be filled before `/second-target-policy-pack` can move any blocked parity criterion.

### Packet header
- candidate target profile id
- candidate host id and Tailscale address
- operator name plus review date
- controller commit or release under review
- short drift summary, including any still-blocking mismatch

### Preserved bootstrap and steady-state packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review date: `2026-04-21`
- controller commit: `ce19f8b6572171896e2bdb42cdb184eeab845454`
- candidate target profile id: `debian-12-systemd-tailscale`
- candidate host id: `host_debian_12_review_packet_1776805736172_558`
- recorded address for this bounded rehearsal: `172.17.0.2`
- bootstrap operation id: `op_bootstrap_host_1776805736313_817`
- bootstrap result summary: `host host_debian_12_review_packet_1776805736172_558 bootstrapped via http://172.17.0.2:8711; 0 rule(s) staged with backup policy best_effort`
- audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-audit-index.json`
- target-profile confirmation: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-host-detail.json`
- steady-state post-mutation operation id: `op_create_rule_1776805736384_555`
- steady-state `/health` capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-health.json`
- steady-state `/runtime-state` capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-runtime-state.json`
- steady-state audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-audit-index.json`
- drift summary: local Debian 12 Docker bridge replaced live Tailscale for this preserved review packet, so broader support claims remain locked.

### Required evidence sections
1. Bootstrap transport parity
   - bootstrap operation id
   - bootstrap result summary
   - linked event replay or audit-index reference
   - confirmation that host target profile stayed `debian-12-systemd-tailscale`
2. Steady-state transport parity
   - one controller-driven mutation after bootstrap
   - resulting `/health` capture
   - resulting `/runtime-state` capture
   - linked controller operation or audit reference
3. Backup and restore parity
   - backup-bearing mutation id
   - backup manifest path
   - remote-backup result if configured
   - restore or restore-readiness note for the same packet
4. Diagnostics parity
   - diagnostics operation id
   - diagnostics artifact paths
   - linked event replay or audit-index reference
   - short operator note for any drift
5. Rollback parity
   - rollback-point id
   - rollback operation id
   - rollback result summary
   - post-rollback diagnostics linkage

### Publication rule
- Keep the packet in review-prep until every required section has real artifact links.
- If any section regresses, update `/second-target-policy-pack` first and keep support claims locked to Ubuntu.
- Link this packet back into the acceptance recipe, bootstrap-proof guide, steady-state-proof guide, backup-restore-proof guide, diagnostics-proof guide, rollback-proof guide, and operator ownership note when evidence changes.

## 中文

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

### 已保留的 2026-04-21 bootstrap 与 steady-state packet
- packet 产物根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review 日期：`2026-04-21`
- controller commit：`ce19f8b6572171896e2bdb42cdb184eeab845454`
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
- drift 摘要：这次保留的 review packet 使用本地 Debian 12 Docker bridge 替代 live Tailscale，因此更广支持声明继续保持锁定。

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
   - 带 backup 的 mutation id
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
- 在每个必需分区都拥有真实 artifact 链接之前，packet 只能停留在 review-prep。
- 任何分区一旦回退，先更新 `/second-target-policy-pack`，并继续把支持声明锁在 Ubuntu。
- 当证据变化时，把这份 packet 同步回 acceptance recipe、bootstrap proof 指南、steady-state proof 指南、backup-restore proof 指南、diagnostics proof 指南、rollback proof 指南与 operator ownership 文档。

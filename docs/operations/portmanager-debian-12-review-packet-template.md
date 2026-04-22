# PortManager Debian 12 Review Packet Template

Updated: 2026-04-21
Version: v0.2.0

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

### Preserved full bounded packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- review date: `2026-04-21`
- controller commit: `b4b648fd4a2b694df1892ea2b6fe610e5d387516`
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
- backup operation id: `op_backup_1776807481139_825`
- backup result summary: `backup backup_op_backup_1776807481139_825 created with rollback point rp_op_backup_1776807481139_825; GitHub backup uploaded to Jacobinwwey/portmanager-backups:portmanager-backups/host_debian_12_review_packet_1776805736172_558/backup_op_backup_1776807481139_825.bundle.json`
- backup manifest path: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backups/backup_op_backup_1776807481139_825/manifest.json`
- backup summary: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-summary.json`
- remote-backup upload record: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-github-upload.json`
- restore-readiness reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/backup-rollback-points.json`
- diagnostics operation id: `op_diag_1776809568435_848`
- diagnostics artifact bundle: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-artifacts.json`
- diagnostics audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-audit-index.json`
- diagnostics drift note: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json`
- rollback-point id: `rp_op_backup_1776807481139_825`
- rollback operation id: `op_rollback_1776809568474_70`
- rollback result summary: `rollback rp_op_backup_1776807481139_825 applied from rp_op_backup_1776807481139_825-result.json`
- rollback result artifact: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback/rp_op_backup_1776807481139_825-result.json`
- post-rollback diagnostics linkage: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-post-diagnostics.json`
- drift summary: local Debian 12 Docker bridge replaced live Tailscale for this preserved review packet, so broader support claims remain locked until bounded second-target review closes.

### Filesystem-backed live packet extension
- fresh packet root pattern: `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`
- canonical summary filename: `live-transport-follow-up-summary.json`
- preferred capture helper: `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>`
- scaffold helper: `pnpm milestone:scaffold:live-packet -- --packet-date <date>`
- assembly helper fallback: `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
- validator helper: `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
- the preferred capture helper now auto-resolves the latest candidate host plus latest successful bootstrap pair for `debian-12-systemd-tailscale`, fetches host detail, bootstrap detail, steady-state `/health`, steady-state `/runtime-state`, and one host-scoped audit index directly from bounded controller plus agent HTTP surfaces, then writes the canonical packet-local files and summary in one step
- `--candidate-target-profile-id <target-profile-id>`, `--host-id <host-id>`, and `--bootstrap-operation-id <operation-id>` remain bounded override flags when operator review needs a different candidate lane, a hand-picked bootstrap pair, or mismatch debugging
- the assembly helper copies real source artifacts into the canonical packet-local filenames, derives `candidateTargetProfileId`, `capturedAt`, and `capturedAddress`, and fails on cross-source address drift so operators do not hand-write `live-transport-follow-up-summary.json`
- scaffold-only packet roots may be replaced by capture or assembly without `--force`, but existing non-scaffold packet roots stay protected unless `--force` is explicit
- controller default truth now reads only the newest valid packet root whose summary file keeps:
  - `candidateTargetProfileId`
  - `capturedAt`
  - `capturedAddress`
  - `requiredArtifactIds`
  - `artifactFiles`
- minimum packet-local file layout for discovery:
  - `candidate-host-detail.json`
  - `bootstrap-operation.json`
  - `steady-state-health.json`
  - `steady-state-runtime-state.json`
  - `controller-audit-index.json`
  - `live-transport-follow-up-summary.json`
- `requiredArtifactIds` must include all five live follow-up artifact ids, and `artifactFiles` must map each id to one existing packet-local file.
- `capturedAddress` must be non-empty and must not remain `172.17.0.2`.
- scaffold-marked summary or artifact files are invalid by design and do not count as packet evidence.
- incomplete or malformed newer packet roots do not clear the blocking delta; controller falls back to the newest valid root or keeps `capture_required`.

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
   - bounded backup operation id
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
- Keep the packet in bounded review until every required section stays linked to real artifact evidence and review closes.
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
- 首选 capture helper：`pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>`
- scaffold helper：`pnpm milestone:scaffold:live-packet -- --packet-date <date>`
- assembly helper 回退路径：`pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
- validator helper：`pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
- 首选 capture helper 现在会先为 `debian-12-systemd-tailscale` 自动解析最新候选主机与最新成功 bootstrap 配对，再直接从有边界的 controller 与 agent HTTP surface 抓取 host detail、bootstrap detail、steady-state `/health`、steady-state `/runtime-state` 与一份 host-scoped audit index，然后一次写入规范 packet 本地文件与 summary
- `--candidate-target-profile-id <target-profile-id>`、`--host-id <host-id>` 与 `--bootstrap-operation-id <operation-id>` 继续保留为有边界 override 参数，用于切换候选 lane、手工指定 bootstrap 配对或排查 mismatch
- assembly helper 会把真实源产物复制到规范 packet 本地文件名中，自动推导 `candidateTargetProfileId`、`capturedAt` 与 `capturedAddress`，并在跨源地址漂移时直接失败，因此 operator 不再默认手写 `live-transport-follow-up-summary.json`
- scaffold-only 的 packet 根目录可以被 capture 或 assembly 直接升级；而已经存在的非 scaffold packet 根目录只有显式传 `--force` 才允许覆盖
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

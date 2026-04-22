# PortManager Debian 12 Acceptance Recipe

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Define the bounded review-prep recipe for `debian-12-systemd-tailscale`.
This document does not claim that parity proof already passed.
It freezes the exact proof sequence and artifact bundle required before second-target review can open.
The companion review-packet template at `docs/operations/portmanager-debian-12-review-packet-template.md` freezes how those artifacts are recorded.
The companion capture guides at `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`, `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`, `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`, `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`, `docs/operations/portmanager-debian-12-rollback-proof-capture.md`, and `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` freeze how bootstrap, steady-state, backup, diagnostics, rollback, and blocker-resolution follow-up evidence are gathered.
Current repo baseline now supports candidate-host enrollment, probe, and one preserved complete Debian 12 review packet with bounded bootstrap, steady-state, backup, diagnostics, and rollback evidence.
It still does not widen broader support claims automatically, and it still keeps broader support claims locked to Ubuntu until bounded review closes.

### Preconditions
- `pnpm acceptance:verify` stays green on the current mainline slice.
- `pnpm milestone:review:promotion-ready -- --limit 20` has already been reviewed for wording truth.
- Candidate host runs Debian 12 with `systemd`.
- Candidate host is preferably reachable through Tailscale; a bounded local rehearsal may use an equivalent Debian 12 environment when the drift note is preserved.
- Operator can preserve backup, diagnostics, and rollback artifacts for the review packet.

### Suggested staging options
- Preferred: one disposable Debian 12 VM or physical host on the same Tailscale tailnet as controller.
- Optional local rehearsal: `incus launch images:debian/12 portmanager-debian12-review`
  - If `incus` is unavailable, use any equivalent Debian 12 environment.
  - This command is a staging suggestion, not proof by itself.
- Preserved Units 64-69 example: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
  - This bounded example used a local Debian 12 Docker container, preserved bootstrap, steady-state, backup, diagnostics, and rollback evidence, and recorded the drift note instead of pretending live Tailscale parity already exists.

### Review-prep proof sequence
1. Enroll one Debian 12 host with target profile `debian-12-systemd-tailscale`.
2. Run host probe and bootstrap.
3. Capture bootstrap transport result plus controller operation evidence.
4. Apply one bridge rule or exposure policy through the normal controller path.
5. Capture steady-state runtime evidence from agent `/health` and `/runtime-state`.
6. Trigger one bounded backup operation and record backup manifest plus remote-backup result if configured.
7. Run diagnostics and preserve diagnostics artifacts plus controller event linkage.
8. Rehearse rollback and record rollback-point linkage, result summary, and post-rollback diagnostics.
9. Publish one review packet from `docs/operations/portmanager-debian-12-review-packet-template.md` that links every artifact back to `/second-target-policy-pack`.

### Required evidence bundle
- controller operation ids for bootstrap, apply, diagnostics, backup, rollback
- event replay or audit index references for each proof step
- backup manifest path and rollback-point id
- diagnostics artifact paths
- host target-profile id and Debian 12 runtime notes
- summary of any drift or parity mismatch
- review-packet template path: `docs/operations/portmanager-debian-12-review-packet-template.md`
- bootstrap-proof guide path: `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`
- steady-state-proof guide path: `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`
- backup-restore-proof guide path: `docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`
- diagnostics-proof guide path: `docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`
- rollback-proof guide path: `docs/operations/portmanager-debian-12-rollback-proof-capture.md`
- live-Tailscale follow-up guide path: `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`

### Exit rule
Only mark parity criteria true after the exact evidence bundle exists and is linked in the review packet. The current preserved packet now keeps bounded review open, but the next required action is no longer vague “more review”: follow `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` and preserve one fresh packet under `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/` instead of mutating the historical Docker-bridge packet in place.

## 中文

### 目的
定义 `debian-12-systemd-tailscale` 的有边界 review-prep recipe。
本文档不宣称等价证明已经通过。
它只冻结在第二目标 review 能开启前必须完成的证明顺序与产物包。
配套的 `docs/operations/portmanager-debian-12-review-packet-template.md` 会冻结这些产物该如何落盘记录。
配套的 `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`、`docs/operations/portmanager-debian-12-steady-state-proof-capture.md`、`docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`、`docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`、`docs/operations/portmanager-debian-12-rollback-proof-capture.md` 与 `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` 会冻结 bootstrap、steady-state、backup、diagnostics、rollback 与 blocker-resolution follow-up 证据该如何采集。
当前仓库基线现在已经支持 candidate host 的注册、probe，以及一份已保留、同时带有 bootstrap、steady-state、backup、diagnostics 与 rollback 证据的完整 Debian 12 review packet。
它仍然不会自动扩大更广支持声明，也继续把更广支持声明锁在 Ubuntu 上，直到 bounded review 关闭。

### 前置条件
- 当前主线切片上的 `pnpm acceptance:verify` 持续为绿。
- `pnpm milestone:review:promotion-ready -- --limit 20` 已完成文案真相复核。
- 候选主机运行 Debian 12 且带 `systemd`。
- 候选主机优先通过 Tailscale 可达；若是有边界本地预演，也可以使用等价 Debian 12 环境，但必须保留 drift 备注。
- 操作员能够保留 backup、diagnostics、rollback 产物，供 review packet 使用。

### 推荐布置方式
- 优先：与 controller 位于同一 Tailscale tailnet 的一次性 Debian 12 VM 或物理机。
- 可选本地预演：`incus launch images:debian/12 portmanager-debian12-review`
  - 如果没有 `incus`，可以改用任何等价 Debian 12 环境。
  - 这条命令只是布置建议，不构成证明本身。
- 已保留的 Unit 64-69 示例：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
  - 这份有边界示例使用本地 Debian 12 Docker 容器，已经保留 bootstrap、steady-state、backup、diagnostics 与 rollback 证据，并显式记录 drift 备注，而不是假装 live Tailscale 等价已经成立。

### Review-prep 证明顺序
1. 用 target profile `debian-12-systemd-tailscale` 注册一台 Debian 12 主机。
2. 运行 host probe 与 bootstrap。
3. 记录 bootstrap transport 结果与 controller operation 证据。
4. 通过正常 controller 路径执行一条 bridge rule 或 exposure policy。
5. 从 agent `/health` 与 `/runtime-state` 采集稳态运行证据。
6. 触发一次有边界 backup operation，并记录 backup manifest 与远端 backup 结果（若已配置）。
7. 运行 diagnostics，保留 diagnostics 产物与 controller event 链接。
8. 演练 rollback，记录 rollback-point linkage、结果摘要与回滚后的 diagnostics。
9. 按 `docs/operations/portmanager-debian-12-review-packet-template.md` 发布一份 review packet，把每个产物都链接回 `/second-target-policy-pack`。

### 必需证据包
- bootstrap、apply、diagnostics、backup、rollback 的 controller operation id
- 每个步骤对应的 event replay 或 audit index 引用
- backup manifest 路径与 rollback-point id
- diagnostics artifact 路径
- host target-profile id 与 Debian 12 运行时备注
- 任意 drift 或 parity mismatch 的摘要
- review-packet template 路径：`docs/operations/portmanager-debian-12-review-packet-template.md`
- bootstrap proof 指南路径：`docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`
- steady-state proof 指南路径：`docs/operations/portmanager-debian-12-steady-state-proof-capture.md`
- backup-restore proof 指南路径：`docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`
- diagnostics proof 指南路径：`docs/operations/portmanager-debian-12-diagnostics-proof-capture.md`
- rollback proof 指南路径：`docs/operations/portmanager-debian-12-rollback-proof-capture.md`
- live-Tailscale follow-up 指南路径：`docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`

### 退出规则
只有在完整证据包真实存在且已经链接进 review packet 之后，才能把等价 criteria 标为 true。当前已保留 packet 现在已经让 bounded review 打开，但下一步已经不再是模糊的“继续 review”，而是按 `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md` 在 `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/` 下保留一份新的 live packet，而不是原地改写历史 Docker-bridge packet。

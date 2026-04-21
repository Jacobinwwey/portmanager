# PortManager Debian 12 Acceptance Recipe

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Define the bounded review-prep recipe for `debian-12-systemd-tailscale`.
This document does not claim that parity proof already passed.
It freezes the exact proof sequence and artifact bundle required before second-target review can open.

### Preconditions
- `pnpm acceptance:verify` stays green on the current mainline slice.
- `pnpm milestone:review:promotion-ready -- --limit 20` has already been reviewed for wording truth.
- Candidate host runs Debian 12 with `systemd`.
- Candidate host is reachable through Tailscale.
- Operator can preserve backup, diagnostics, and rollback artifacts for the review packet.

### Suggested staging options
- Preferred: one disposable Debian 12 VM or physical host on the same Tailscale tailnet as controller.
- Optional local rehearsal: `incus launch images:debian/12 portmanager-debian12-review`
  - If `incus` is unavailable, use any equivalent Debian 12 environment.
  - This command is a staging suggestion, not proof by itself.

### Review-prep proof sequence
1. Enroll one Debian 12 host with target profile `debian-12-systemd-tailscale`.
2. Run host probe and bootstrap.
3. Capture bootstrap transport result plus controller operation evidence.
4. Apply one bridge rule or exposure policy through the normal controller path.
5. Capture steady-state runtime evidence from agent `/health` and `/runtime-state`.
6. Trigger one backup-bearing mutation and record backup manifest plus remote-backup result if configured.
7. Run diagnostics and preserve diagnostics artifacts plus controller event linkage.
8. Rehearse rollback and record rollback-point linkage, result summary, and post-rollback diagnostics.
9. Publish one review packet that links every artifact back to `/second-target-policy-pack`.

### Required evidence bundle
- controller operation ids for bootstrap, apply, diagnostics, backup, rollback
- event replay or audit index references for each proof step
- backup manifest path and rollback-point id
- diagnostics artifact paths
- host target-profile id and Debian 12 runtime notes
- summary of any drift or parity mismatch

### Exit rule
Only mark parity criteria true after the exact evidence bundle exists and is linked in the review packet.

## 中文

### 目的
定义 `debian-12-systemd-tailscale` 的有边界 review-prep recipe。
本文档不宣称等价证明已经通过。
它只冻结在第二目标 review 能开启前必须完成的证明顺序与产物包。

### 前置条件
- 当前主线切片上的 `pnpm acceptance:verify` 持续为绿。
- `pnpm milestone:review:promotion-ready -- --limit 20` 已完成文案真相复核。
- 候选主机运行 Debian 12 且带 `systemd`。
- 候选主机已经通过 Tailscale 可达。
- 操作员能够保留 backup、diagnostics、rollback 产物，供 review packet 使用。

### 推荐布置方式
- 优先：与 controller 位于同一 Tailscale tailnet 的一次性 Debian 12 VM 或物理机。
- 可选本地预演：`incus launch images:debian/12 portmanager-debian12-review`
  - 如果没有 `incus`，可以改用任何等价 Debian 12 环境。
  - 这条命令只是布置建议，不构成证明本身。

### Review-prep 证明顺序
1. 用 target profile `debian-12-systemd-tailscale` 注册一台 Debian 12 主机。
2. 运行 host probe 与 bootstrap。
3. 记录 bootstrap transport 结果与 controller operation 证据。
4. 通过正常 controller 路径执行一条 bridge rule 或 exposure policy。
5. 从 agent `/health` 与 `/runtime-state` 采集稳态运行证据。
6. 触发一次带 backup 的 mutation，并记录 backup manifest 与远端 backup 结果（若已配置）。
7. 运行 diagnostics，保留 diagnostics 产物与 controller event 链接。
8. 演练 rollback，记录 rollback-point linkage、结果摘要与回滚后的 diagnostics。
9. 发布一份 review packet，把每个产物都链接回 `/second-target-policy-pack`。

### 必需证据包
- bootstrap、apply、diagnostics、backup、rollback 的 controller operation id
- 每个步骤对应的 event replay 或 audit index 引用
- backup manifest 路径与 rollback-point id
- diagnostics artifact 路径
- host target-profile id 与 Debian 12 运行时备注
- 任意 drift 或 parity mismatch 的摘要

### 退出规则
只有在完整证据包真实存在且已经链接进 review packet 之后，才能把等价 criteria 标为 true。

---
title: "Debian 12 验收配方"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-acceptance-recipe.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-acceptance-recipe.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
定义 `debian-12-systemd-tailscale` 的有边界 review-prep recipe。
本文档不宣称等价证明已经通过。
它只冻结在第二目标 review 能开启前必须完成的证明顺序与产物包。
配套的 `docs/operations/portmanager-debian-12-review-packet-template.md` 会冻结这些产物该如何落盘记录。
配套的 `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`、`docs/operations/portmanager-debian-12-steady-state-proof-capture.md`、`docs/operations/portmanager-debian-12-backup-restore-proof-capture.md`、`docs/operations/portmanager-debian-12-diagnostics-proof-capture.md` 与 `docs/operations/portmanager-debian-12-rollback-proof-capture.md` 会冻结 bootstrap、steady-state、backup、diagnostics 与 rollback 证据该如何采集。
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

### 退出规则
只有在完整证据包真实存在且已经链接进 review packet 之后，才能把等价 criteria 标为 true。当前已保留 packet 现在已经满足这条要求，因此下一步是 bounded second-target review，而不是继续发明新的采集步骤。

---
title: "第二目标复核契约"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-second-target-review-contract.md"
status: active
---
> 真源文档：`docs/operations/portmanager-second-target-review-contract.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
冻结已声明 review-prep 候选 `debian-12-systemd-tailscale` 的公开文案与维护者文案。

### 当前声明姿态
- `ubuntu-24.04-systemd-tailscale` 仍然是唯一受支持 target profile。
- `debian-12-systemd-tailscale` 只是 review-prep 候选。
- `/second-target-policy-pack` 是第二目标扩展真相的唯一 controller 合同面。
- 本文档不允许引出更广平台支持、独立 gateway 部署、或 PostgreSQL 默认状态库之类的声明。

### 必须遵守的文案规则
- 只能写 `candidate` 或 `review-prep candidate`，不能写 `supported`、`available`、`shipped`。
- 在 bootstrap transport、steady-state transport、backup/restore、diagnostics、rollback 五类等价证据全部真实前，支持声明必须继续锁在 Ubuntu。
- docs、CLI、Web、controller contract 与 roadmap 页面必须保持同一份 hold 状态。
- 如果等价证据回退或过期，先更新 `/second-target-policy-pack`，再更新其它表面。

### 必须同步的来源表面
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs/operations/portmanager-debian-12-review-packet-template.md`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### 当前复核边界
- Review owner：`controller`
- 候选目标：`debian-12-systemd-tailscale`
- 当前已经落地的局部技术切片：candidate host 注册、probe 与 bootstrap review-prep lane
- 当前阻塞证据：bootstrap transport parity、steady-state transport parity、backup/restore parity、diagnostics parity、rollback parity
- 当前已落地治理产物：docs contract、acceptance recipe、review-packet template、operator ownership definition

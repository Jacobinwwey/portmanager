# PortManager Second-Target Review Contract

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze the public wording and maintainer wording for the declared review-prep candidate `debian-12-systemd-tailscale`.

### Current claim posture
- `ubuntu-24.04-systemd-tailscale` remains the only supported target profile.
- `debian-12-systemd-tailscale` is review-prep only.
- `/second-target-policy-pack` is the canonical controller contract for second-target expansion truth.
- No wider platform claim, gateway deployment claim, or PostgreSQL-default claim is allowed through this document.

### Required wording rules
- Say `candidate` or `review-prep candidate`, never `supported`, `available`, or `shipped`.
- Keep support claims locked to Ubuntu until bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity are all proven.
- Keep docs, CLI, Web, controller contract, and roadmap pages aligned with the same hold state.
- If parity evidence regresses or becomes stale, keep the candidate on hold and update `/second-target-policy-pack` first.

### Required source surfaces
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### Current review boundary
- Review owner: `controller`
- Candidate target: `debian-12-systemd-tailscale`
- Blocking evidence today: bootstrap transport parity, steady-state transport parity, backup and restore parity, diagnostics parity, rollback parity
- Landed governance artifacts today: docs contract, acceptance recipe, operator ownership definition

## 中文

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
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### 当前复核边界
- Review owner：`controller`
- 候选目标：`debian-12-systemd-tailscale`
- 当前阻塞证据：bootstrap transport parity、steady-state transport parity、backup/restore parity、diagnostics parity、rollback parity
- 当前已落地治理产物：docs contract、acceptance recipe、operator ownership definition

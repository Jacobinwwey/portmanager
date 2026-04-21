# PortManager Second-Target Review Contract

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze the public wording and maintainer wording for the declared bounded-review candidate `debian-12-systemd-tailscale`.

### Current claim posture
- `ubuntu-24.04-systemd-tailscale` remains the only supported target profile.
- `debian-12-systemd-tailscale` is the bounded-review candidate, not a supported target.
- `/second-target-policy-pack` is the canonical controller contract for second-target expansion truth.
- The preserved packet root is `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`, and current controller truth is guide coverage `6/6`, artifact coverage `20/20`, `decisionState: review_required`, and `reviewAdjudication.state: review_open`.
- No wider platform claim, gateway deployment claim, or PostgreSQL-default claim is allowed through this document.

### Required wording rules
- Say `candidate` or `bounded-review candidate`, never `supported`, `available`, or `shipped`.
- Keep support claims locked to Ubuntu while bounded second-target review remains open.
- Keep docs, CLI, Web, controller contract, and roadmap pages aligned with the same `review_required` plus `review_open` posture.
- If packet evidence regresses, drifts, or review finds a real delta, update `/second-target-policy-pack` first and move the blocking truth there before changing any prose.

### Required source surfaces
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs/operations/portmanager-debian-12-review-packet-template.md`
- `docs/operations/portmanager-debian-12-operator-ownership.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/packet-ready-policy-pack.json`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### Current review boundary
- Review owner: `controller`
- Candidate target: `debian-12-systemd-tailscale`
- Preserved packet root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- Open adjudication verdicts: `packet_integrity`, `drift_acknowledged`, `support_lock_confirmed`, `operator_signoff`, `follow_up_scope_bounded`
- Landed governance artifacts today: docs contract, acceptance recipe, review-packet template, operator ownership definition, and review adjudication contract data
- Broader support still remains locked to `ubuntu-24.04-systemd-tailscale`

## 中文

### 目的
冻结已声明 bounded-review 候选 `debian-12-systemd-tailscale` 的公开文案与维护者文案。

### 当前声明姿态
- `ubuntu-24.04-systemd-tailscale` 仍然是唯一受支持 target profile。
- `debian-12-systemd-tailscale` 是 bounded-review 候选，不是受支持目标。
- `/second-target-policy-pack` 是第二目标扩展真相的唯一 controller 合同面。
- 当前保留 packet 根目录是 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`，controller 真相已经来到 guide coverage `6/6`、artifact coverage `20/20`、`decisionState: review_required` 与 `reviewAdjudication.state: review_open`。
- 本文档不允许引出更广平台支持、独立 gateway 部署、或 PostgreSQL 默认状态库之类的声明。

### 必须遵守的文案规则
- 只能写 `candidate` 或 `bounded-review candidate`，不能写 `supported`、`available`、`shipped`。
- 只要 bounded second-target review 还开着，支持声明就必须继续锁在 Ubuntu。
- docs、CLI、Web、controller contract 与 roadmap 页面必须保持同一份 `review_required` 加 `review_open` 真相。
- 只要 packet 证据回退、漂移，或者 review 找到真实 delta，先更新 `/second-target-policy-pack`，再更新其它表面。

### 必须同步的来源表面
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs/operations/portmanager-debian-12-review-packet-template.md`
- `docs/operations/portmanager-debian-12-operator-ownership.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/packet-ready-policy-pack.json`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### 当前复核边界
- Review owner：`controller`
- 候选目标：`debian-12-systemd-tailscale`
- 当前保留的 packet 根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- 当前待裁定 verdict：`packet_integrity`、`drift_acknowledged`、`support_lock_confirmed`、`operator_signoff`、`follow_up_scope_bounded`
- 当前已落地治理产物：docs contract、acceptance recipe、review-packet template、operator ownership definition，以及 review adjudication 合同数据
- 更广支持声明仍然继续锁在 `ubuntu-24.04-systemd-tailscale`

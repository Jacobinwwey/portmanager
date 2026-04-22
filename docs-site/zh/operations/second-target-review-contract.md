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
冻结已声明 bounded-review 候选 `debian-12-systemd-tailscale` 的公开文案与维护者文案。

### 当前声明姿态
- `ubuntu-24.04-systemd-tailscale` 仍然是唯一受支持 target profile。
- `debian-12-systemd-tailscale` 是 bounded-review 候选，不是受支持目标。
- `/second-target-policy-pack` 是第二目标扩展真相的唯一 controller 合同面。
- 当前保留 packet 根目录是 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`，controller 真相已经来到 guide coverage `6/6`、artifact coverage `20/20`、`decisionState: review_required` 与 `reviewAdjudication.state: review_open`。
- 当前阻塞 delta 是 `container_bridge_transport_substitution`：这份保留 packet 仍然使用 Docker bridge 地址 `172.17.0.2`，而不是 live Tailscale transport，所以更广支持声明继续保持锁定。
- 本文档不允许引出更广平台支持、独立 gateway 部署、或 PostgreSQL 默认状态库之类的声明。

### 必须遵守的文案规则
- 只能写 `candidate` 或 `bounded-review candidate`，不能写 `supported`、`available`、`shipped`。
- 只要 bounded second-target review 还开着，支持声明就必须继续锁在 Ubuntu。
- docs、CLI、Web、controller contract 与 roadmap 页面必须保持同一份 `review_required`、`review_open` 与 `blockingDeltas` 真相。
- 只要 packet 证据回退、漂移，或者 review 找到真实 delta，先更新 `/second-target-policy-pack`，再更新其它表面。
- 只要 `container_bridge_transport_substitution` 还没被 live Tailscale-backed bounded packet 替换，就必须持续把这个 delta 保持为显式阻塞真相。

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
- 当前阻塞 delta：`container_bridge_transport_substitution`
- 当前必需 follow-up：为 `debian-12-systemd-tailscale` 捕获一份 live Tailscale-backed bounded packet，否则继续把支持声明锁在 Ubuntu
- 当前已落地治理产物：docs contract、acceptance recipe、review-packet template、operator ownership definition，以及 review delta 合同数据
- 更广支持声明仍然继续锁在 `ubuntu-24.04-systemd-tailscale`

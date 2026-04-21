---
title: "Debian 12 稳态证明采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-steady-state-proof-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-steady-state-proof-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 steady-state 证明采集指南。
本文档不表示 steady-state transport parity 已通过。
它只定义在 `/second-target-policy-pack` 能把 steady-state parity 从 review-prep 向前推进之前，最少必须真实存在的 bootstrap 后产物包。

### 输入条件
- 候选主机已经完成一次有边界 bootstrap 预演。
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` 已经作为 bootstrap 证据锚点存在。
- 当前主线上的 `pnpm acceptance:verify` 继续为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` 与 `docs/operations/portmanager-debian-12-review-packet-template.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 steady-state parity 仍然是阻塞项。
2. 在 bootstrap 之后执行一次正常 controller-driven mutation：
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
   - 只有在保持同一套有边界证据模型时，才可以改用等价 exposure-policy 或 rule mutation。
3. 记录对应 controller operation 详情：
   - `portmanager operation get <post-mutation-operation-id> --json`
4. 采集 steady-state health：
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
5. 采集 steady-state runtime state：
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
6. 记录一条对应的 controller audit 或 replay 引用：
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- bootstrap 后 mutation 的 controller operation id
- steady-state `/health` 采集结果
- steady-state `/runtime-state` 采集结果
- 指向同一条 mutation 的 controller audit-index 或 replay 引用

### 退出规则
在同一份 review packet 把四类产物都链接回同一次 bootstrap 后 mutation 之前，steady-state transport parity 继续保持阻塞。

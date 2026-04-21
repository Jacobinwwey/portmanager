# PortManager Debian 12 Steady-State Proof Capture

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze one concrete steady-state proof-capture guide for `debian-12-systemd-tailscale`.
This document does not widen broader support claims by itself.
It defines the minimum post-bootstrap artifact bundle that must exist before `/second-target-policy-pack` can move steady-state parity beyond review-prep.

### Preserved packet on 2026-04-21
- packet artifact root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- candidate host id: `host_debian_12_review_packet_1776805736172_558`
- post-mutation operation id: `op_create_rule_1776805736384_555`
- health capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-health.json`
- runtime-state capture: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-runtime-state.json`
- controller audit reference: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-audit-index.json`

### Inputs
- Candidate host already completed one bounded bootstrap rehearsal.
- `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md` already anchors bootstrap evidence.
- `pnpm acceptance:verify` remains green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm steady-state parity still blocks review.
2. Run one normal controller-driven mutation after bootstrap:
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
   - Use any equivalent exposure-policy or rule mutation only if it preserves the same bounded evidence model.
3. Record the resulting controller operation detail:
   - `portmanager operation get <post-mutation-operation-id> --json`
4. Capture steady-state health:
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
5. Capture steady-state runtime state:
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
6. Record one linked controller audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- post-mutation controller operation id
- steady-state `/health` capture
- steady-state `/runtime-state` capture
- controller audit-index or replay reference linked to the same mutation

### Exit rule
If these four artifacts stop linking back to the same bounded review packet, move steady-state transport parity back to blocked and keep broader support claims locked.

## 中文

### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 steady-state 证明采集指南。
本文档本身不会扩大更广的支持声明。
它只定义在 `/second-target-policy-pack` 能把 steady-state parity 从 review-prep 向前推进之前，最少必须真实存在的 bootstrap 后产物包。

### 已保留的 2026-04-21 packet
- packet 产物根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- candidate host id：`host_debian_12_review_packet_1776805736172_558`
- 后续 mutation operation id：`op_create_rule_1776805736384_555`
- health 采集：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-health.json`
- runtime-state 采集：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-runtime-state.json`
- controller audit 引用：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-audit-index.json`

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
只要这四类产物不再能同时链接回同一份有边界 review packet，就把 steady-state transport parity 重新退回阻塞，并继续锁住更广支持声明。

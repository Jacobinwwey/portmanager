# PortManager Debian 12 Bootstrap Proof Capture

Updated: 2026-04-21
Version: v0.1.0

## English

### Purpose
Freeze one concrete bootstrap-proof capture guide for `debian-12-systemd-tailscale`.
This document does not mark bootstrap parity as passed.
It defines the minimum artifact bundle that must exist before `/second-target-policy-pack` can move bootstrap parity beyond review-prep.

### Inputs
- Candidate host already exists with target profile `debian-12-systemd-tailscale`.
- `pnpm acceptance:verify` is green on current mainline.
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` and `docs/operations/portmanager-debian-12-review-packet-template.md` stay the companion truth surfaces.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm bootstrap parity still blocks review.
2. Create or confirm one candidate host with `--target-profile-id debian-12-systemd-tailscale`.
3. Run one bounded bootstrap rehearsal through the normal controller path:
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
4. Read the resulting operation detail:
   - `portmanager operation get <bootstrap-operation-id> --json`
5. Record one linked audit or replay reference:
   - `portmanager operations audit-index --host-id <host-id> --type bootstrap_host --limit 5 --json`
6. Record one host-detail snapshot proving the target profile stayed locked:
   - `portmanager hosts get <host-id> --json`
7. Copy every captured value into `docs/operations/portmanager-debian-12-review-packet-template.md`.

### Required artifacts
- bootstrap operation id
- bootstrap terminal result summary
- audit-index or replay reference linked to the same bootstrap
- host target profile confirmation showing `debian-12-systemd-tailscale`

### Exit rule
Keep bootstrap parity blocked until one review packet links all four artifacts back to the same bootstrap rehearsal.

## 中文

### 目的
冻结一份 `debian-12-systemd-tailscale` 的具体 bootstrap proof 采集指南。
本文档不表示 bootstrap parity 已通过。
它只定义在 `/second-target-policy-pack` 能把 bootstrap parity 从 review-prep 向前推进之前，最少必须真实存在的产物包。

### 输入条件
- 候选主机已经以 `debian-12-systemd-tailscale` target profile 存在。
- 当前主线上的 `pnpm acceptance:verify` 为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` 与 `docs/operations/portmanager-debian-12-review-packet-template.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 bootstrap parity 仍然是阻塞项。
2. 使用 `--target-profile-id debian-12-systemd-tailscale` 创建或确认一台候选主机。
3. 通过正常 controller 路径执行一次有边界 bootstrap 预演：
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
4. 读取对应 operation 详情：
   - `portmanager operation get <bootstrap-operation-id> --json`
5. 记录同一条 bootstrap 对应的 audit 或 replay 引用：
   - `portmanager operations audit-index --host-id <host-id> --type bootstrap_host --limit 5 --json`
6. 记录一份 host detail 快照，证明 target profile 仍然锁定：
   - `portmanager hosts get <host-id> --json`
7. 把采集结果逐项回填进 `docs/operations/portmanager-debian-12-review-packet-template.md`。

### 必需产物
- bootstrap operation id
- bootstrap 终态结果摘要
- 指向同一条 bootstrap 的 audit-index 或 replay 引用
- 证明 host target profile 仍然是 `debian-12-systemd-tailscale` 的记录

### 退出规则
在同一份 review packet 把四类产物都链接回同一次 bootstrap 预演之前，bootstrap parity 继续保持阻塞。

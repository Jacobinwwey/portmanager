---
title: "Debian 12 Bootstrap 证明采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-bootstrap-proof-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
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

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
本文档现在也指向一份已经保留的 bootstrap 产物包。
它仍然不会把支持声明扩大到这份有边界 review packet 之外。

### 输入条件
- 候选主机已经以 `debian-12-systemd-tailscale` target profile 存在。
- 当前主线上的 `pnpm acceptance:verify` 为绿。
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` 与 `docs/operations/portmanager-debian-12-review-packet-template.md` 继续作为配套真相面。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认已保留的 bootstrap 切片仍然链接在完整 bounded packet 里，而更广支持声明仍然在 bounded review 完成前保持锁定。
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

### 已保留的执行产物包
- artifact 根目录：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- capture summary：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-capture-summary.json`
- bootstrap operation detail：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-operation.json`
- bootstrap audit index：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-audit-index.json`
- bootstrap host detail：`docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-host-detail.json`
- 已保留 bootstrap operation id：`op_bootstrap_host_1776805736313_817`
- 已保留结果摘要：`host host_debian_12_review_packet_1776805736172_558 bootstrapped via http://172.17.0.2:8711; 0 rule(s) staged with backup policy best_effort`
- 已保留 target-profile 确认：host `host_debian_12_review_packet_1776805736172_558` 保持 `debian-12-systemd-tailscale`，并进入 `ready`
- drift 备注：这份有边界 packet 使用本地 Debian 12 Docker bridge 地址替代 live Tailscale tailnet，因此支持声明继续保持锁定

### 必需产物
- bootstrap operation id
- bootstrap 终态结果摘要
- 指向同一条 bootstrap 的 audit-index 或 replay 引用
- 证明 host target profile 仍然是 `debian-12-systemd-tailscale` 的记录

### 退出规则
只有当同一份 review packet 持续把四类产物都链接回同一次 bootstrap 预演时，bootstrap transport parity 才能继续保持为已落地切片；更广支持声明仍然要等 bounded second-target review 关闭后才能前进。

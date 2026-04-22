---
title: "Debian 12 Live Tailscale Follow-Up 采集"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md"
status: active
---
> 真源文档：`docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-21 | Version：v0.1.0
### 目的
冻结一份 `debian-12-systemd-tailscale` 的显式 live Tailscale follow-up 采集指南。
这份指南只会在 `/second-target-policy-pack` 已经打开 bounded review 之后启动，并且会把当前保留的 Docker-bridge packet 继续作为历史证据保留。
它本身不会扩大支持声明。

### 输入条件
- `portmanager operations second-target-policy-pack --json` 已经显示 `reviewAdjudication.state: review_open`。
- 同一份 pack 已经显示 `liveTransportFollowUp.state: capture_required`。
- 当前记录地址仍然是 `172.17.0.2`。
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` 继续作为已保留历史 packet，不被改写。
- `pnpm milestone:review:promotion-ready -- --limit 20` 已经在当前主线切片上完成文案复核。
- 已有一台 Debian 12 候选主机真实接入同一条 Tailscale tailnet。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 follow-up guide path、artifact root pattern、当前记录地址与 required artifact id。
2. 为新的有边界 packet 创建一份新根目录：
   - `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`
3. 记录一份 host detail 快照，证明候选主机已经切到 live Tailscale-backed 地址：
   - `portmanager hosts get <host-id> --json`
4. 在同一台候选主机上重放一次有边界 bootstrap，并记录对应 controller operation：
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
   - `portmanager operation get <bootstrap-operation-id> --json`
5. 在同一台主机上执行一次有边界 steady-state mutation，然后采集 live transport 证据：
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
6. 记录一条 controller audit 或 replay 引用，把新的 bootstrap 与 steady-state 采集串成同一份 bounded packet：
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
7. 把这些产物全部写入新的 packet 根目录，不要去修改已保留的 Docker-bridge packet。
8. 把新产物回填到 `docs/operations/portmanager-debian-12-review-packet-template.md` 或后续 live packet README，并确保每个链接都能回到 `/second-target-policy-pack`。

### 必需产物
- `candidate_host_with_tailscale_ip`：一份带 live Tailscale-backed 地址的 host detail 快照
- `bootstrap_operation_with_tailscale_transport`：一份解析到 live Tailscale-backed 地址的 bootstrap operation 结果
- `steady_state_health_with_tailscale_transport`：同一份 live packet 下的 `/health` 采集
- `steady_state_runtime_state_with_tailscale_transport`：同一份 live packet 下的 `/runtime-state` 采集
- `linked_controller_audit_reference`：把 live bootstrap 与 steady-state 采集串起来的一条 audit-index 或 replay 引用

### 退出规则
只要这五类产物还没有在同一份新的 live-Tailscale packet 根目录下完整保留，就继续把 `/second-target-policy-pack.liveTransportFollowUp.state` 保持为 `capture_required`。
不要覆盖已保留的 Docker-bridge packet；它必须继续作为历史证据存在，说明为什么更广支持声明一直保持锁定。

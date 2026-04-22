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
> Updated：2026-04-21 | Version：v0.3.0
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
- 本地现在已经把 `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` 作为首选 repo-native 采集路径，因为它已经能为 `debian-12-systemd-tailscale` 自动解析最新候选主机与最新成功 bootstrap 配对；`--candidate-target-profile-id <target-profile-id>`、`--host-id <host-id>` 与 `--bootstrap-operation-id <operation-id>` 继续保留为有边界 override 参数，同时仍保留 `pnpm milestone:scaffold:live-packet -- --packet-date <date>`、`pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>` 与 `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>` 作为底层回退 helper。
- 已有一台 Debian 12 候选主机真实接入同一条 Tailscale tailnet。

### 采集流程
1. 先读取 `portmanager operations second-target-policy-pack`，确认 follow-up guide path、artifact root pattern、当前记录地址与 required artifact id。
2. 在同一台候选主机上重放一次有边界 bootstrap，并保留对应 controller operation id：
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
3. 在同一台主机上执行一次有边界 steady-state mutation，让 live follow-up packet 拥有新的 transport 证据：
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
4. 首选路径：直接用一条 repo-native capture helper 自动解析最新候选主机与最新成功 bootstrap 配对，再抓取 host detail、bootstrap detail、steady-state `/health`、steady-state `/runtime-state` 与一份 host-scoped audit index，然后一次写入规范 packet 本地 JSON 文件与 `live-transport-follow-up-summary.json`：
   - `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>`
5. 只有在 operator review 需要切换有边界候选 lane 时，才额外传 `--candidate-target-profile-id <target-profile-id>`；只有在需要 hand-picked override 或 mismatch 调试时，才额外传 `--host-id <host-id>` 与 `--bootstrap-operation-id <operation-id>`。只有在 bootstrap result summary 无法给出可用 live agent base URL 时，才额外传 `--agent-base-url <url>`。只有在 host-scoped audit window 太窄、还抓不到 bootstrap operation 时，才额外放大 `--audit-limit <count>`。已经存在但仍是 scaffold-only 的 packet 根目录可以直接升级；而已经存在的非 scaffold packet 根目录仍然必须显式传 `--force` 才允许覆盖。
6. 回退路径：如果 capture helper 暂时无法直接访问 controller 或 agent HTTP surface，就先创建 scaffold 根目录，再手工收集五份源产物交给 assembly helper：
   - `pnpm milestone:scaffold:live-packet -- --packet-date <date>`
   - `portmanager hosts get <host-id> --json`
   - `portmanager operation get <bootstrap-operation-id> --json`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
   - `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
7. 只有在 operator review 明确需要覆盖最新源时间戳时才额外传 `--captured-at <iso>`；否则让 helper 自动从真实产物推导 `candidateTargetProfileId`、`capturedAt` 与 `capturedAddress`，并在 host-detail 与 bootstrap 传输地址漂移时直接失败。
8. `artifactFiles` 仍然必须给五个必需产物 id 都指向同一 packet 根目录下的文件。除非后续模板明确替换，否则最小布局固定为：
   - `candidate-host-detail.json`
   - `bootstrap-operation.json`
   - `steady-state-health.json`
   - `steady-state-runtime-state.json`
   - `controller-audit-index.json`
   - `live-transport-follow-up-summary.json`
9. 在提交前执行 repo-native validator：
   - `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
10. 把新产物回填到 `docs/operations/portmanager-debian-12-review-packet-template.md` 或后续 live packet README，并确保每个链接都能回到 `/second-target-policy-pack`。

### 必需产物
- `candidate_host_with_tailscale_ip`：一份带 live Tailscale-backed 地址的 host detail 快照
- `bootstrap_operation_with_tailscale_transport`：一份解析到 live Tailscale-backed 地址的 bootstrap operation 结果
- `steady_state_health_with_tailscale_transport`：同一份 live packet 下的 `/health` 采集
- `steady_state_runtime_state_with_tailscale_transport`：同一份 live packet 下的 `/runtime-state` 采集
- `linked_controller_audit_reference`：把 live bootstrap 与 steady-state 采集串起来的一条 audit-index 或 replay 引用

### 规范 packet summary 契约
- 文件名固定：`live-transport-follow-up-summary.json`
- `candidateTargetProfileId` 必须继续保持为 `debian-12-systemd-tailscale`
- `capturedAt` 必须是 ISO 时间戳，方便 controller 确定“最新有效 packet”
- `capturedAddress` 必须非空，而且不能继续是 `172.17.0.2`
- `requiredArtifactIds` 必须包含全部五个 live follow-up artifact id
- `artifactFiles` 必须把每个必需 artifact id 映射到同一 packet 根目录下已经存在的文件路径

### 退出规则
只要这五类产物与 `live-transport-follow-up-summary.json` 还没有在同一份新的 live-Tailscale packet 根目录下完整保留，就继续把 `/second-target-policy-pack.liveTransportFollowUp.state` 保持为 `capture_required`。
controller 默认真相现在会忽略更新但无效的 packet 根目录，只会稳定选择“最新有效 packet”。
任何还带 scaffold marker 的 summary 或 artifact 文件都属于显式无效状态，必须先被真实产物替换，validator 才会通过。
不要覆盖已保留的 Docker-bridge packet；它必须继续作为历史证据存在，说明为什么更广支持声明一直保持锁定。

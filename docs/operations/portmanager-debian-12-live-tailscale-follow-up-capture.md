# PortManager Debian 12 Live Tailscale Follow-Up Capture

Updated: 2026-04-21
Version: v0.3.0

## English

### Purpose
Freeze one explicit live-Tailscale follow-up capture guide for `debian-12-systemd-tailscale`.
This guide starts only after `/second-target-policy-pack` opens bounded review and keeps the preserved Docker-bridge packet immutable as historical evidence.
It does not widen supported-target claims by itself.

### Inputs
- `portmanager operations second-target-policy-pack --json` shows `reviewAdjudication.state: review_open`.
- The same pack shows `liveTransportFollowUp.state: capture_required`.
- The current recorded address is still `172.17.0.2`.
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` stays preserved and untouched.
- `pnpm milestone:review:promotion-ready -- --limit 20` already passed wording review on the current mainline slice.
- `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` is now the preferred repo-native capture path because it can auto-resolve the latest candidate host plus latest successful bootstrap pair for `debian-12-systemd-tailscale`; `--candidate-target-profile-id <target-profile-id>`, `--host-id <host-id>`, and `--bootstrap-operation-id <operation-id>` remain bounded override flags, while `pnpm milestone:scaffold:live-packet -- --packet-date <date>`, `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`, and `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>` remain available as lower-level fallback helpers.
- One Debian 12 candidate host is reachable on a real Tailscale tailnet.

### Capture flow
1. Read `portmanager operations second-target-policy-pack` and confirm the follow-up guide path, artifact root pattern, current recorded address, and required artifact ids.
2. Rehearse bounded bootstrap on that same candidate host and keep the linked controller operation id:
   - `portmanager hosts probe <host-id> --wait`
   - `portmanager hosts bootstrap <host-id> --ssh-user <user> --desired-agent-port <port> --wait`
3. Run one bounded steady-state mutation on the same host so the live follow-up packet has fresh transport evidence:
   - `portmanager bridge-rules create --host-id <host-id> --protocol tcp --listen-port <listen-port> --target-host <target-host> --target-port <target-port> --wait`
4. Preferred path: let one repo-native capture command auto-resolve the latest candidate host plus latest successful bootstrap pair, fetch host detail, bootstrap detail, steady-state `/health`, steady-state `/runtime-state`, and one host-scoped audit index, then write the canonical packet-local JSON files plus `live-transport-follow-up-summary.json` in one step:
   - `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>`
5. Add `--candidate-target-profile-id <target-profile-id>` when operator review needs a bounded candidate lane other than the default `debian-12-systemd-tailscale`. Add explicit `--host-id <host-id>` and `--bootstrap-operation-id <operation-id>` only when operator review needs a hand-selected override or mismatch debugging path. Add `--agent-base-url <url>` only when the bootstrap result summary does not expose a usable live agent base URL. Add `--audit-limit <count>` when the host-scoped audit window must widen so the bootstrap operation still appears in the captured audit index. Existing scaffold roots may be upgraded without `--force`, but existing non-scaffold packet roots stay protected unless `--force` is explicit.
6. Fallback path: if direct capture cannot reach controller or agent HTTP surfaces, create one fresh scaffold root and feed the five bounded source files into the assembly helper manually:
   - `pnpm milestone:scaffold:live-packet -- --packet-date <date>`
   - `portmanager hosts get <host-id> --json`
   - `portmanager operation get <bootstrap-operation-id> --json`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/health`
   - `curl -fsSL http://<tailscale-ip>:<agent-port>/runtime-state`
   - `portmanager operations audit-index --host-id <host-id> --limit 5 --json`
   - `pnpm milestone:assemble:live-packet -- --packet-date <date> --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`
7. Only pass `--captured-at <iso>` when operator review must override the newest valid source timestamp. Otherwise let the helper derive `candidateTargetProfileId`, `capturedAt`, and `capturedAddress`, and fail if host-detail versus bootstrap transport addresses drift.
8. `artifactFiles` must still point at packet-local files for all five required artifact ids. Use this minimum layout unless a successor template explicitly replaces it:
   - `candidate-host-detail.json`
   - `bootstrap-operation.json`
   - `steady-state-health.json`
   - `steady-state-runtime-state.json`
   - `controller-audit-index.json`
   - `live-transport-follow-up-summary.json`
9. Run the repo-native validator before commit:
   - `pnpm milestone:validate:live-packet -- --packet-root docs/operations/artifacts/debian-12-live-tailscale-packet-<date>`
10. Update `docs/operations/portmanager-debian-12-review-packet-template.md` or a successor live packet README so every new artifact links back to `/second-target-policy-pack`.

### Required artifacts
- `candidate_host_with_tailscale_ip`: one host detail snapshot with a live Tailscale-backed address
- `bootstrap_operation_with_tailscale_transport`: one bootstrap operation result that resolves to the live Tailscale-backed address
- `steady_state_health_with_tailscale_transport`: one `/health` capture from the same live packet
- `steady_state_runtime_state_with_tailscale_transport`: one `/runtime-state` capture from the same live packet
- `linked_controller_audit_reference`: one audit-index or replay reference that links the live bootstrap and steady-state captures

### Canonical packet summary contract
- Filename: `live-transport-follow-up-summary.json`
- `candidateTargetProfileId` must stay `debian-12-systemd-tailscale`.
- `capturedAt` must be an ISO timestamp so controller can choose the newest valid packet deterministically.
- `capturedAddress` must be non-empty and must not stay `172.17.0.2`.
- `requiredArtifactIds` must include all five live follow-up artifact ids.
- `artifactFiles` must map each required artifact id to one packet-local file path that already exists under the same packet root.

### Exit rule
Keep `/second-target-policy-pack.liveTransportFollowUp.state` at `capture_required` until all five artifacts plus `live-transport-follow-up-summary.json` are preserved under one fresh live-Tailscale packet root.
Controller default truth now ignores newer invalid roots and only selects the newest valid packet root deterministically.
Scaffold-marked summary or artifact files are explicitly invalid and must be replaced before the validator can pass.
Do not overwrite the preserved Docker-bridge packet; keep it as historical evidence that still explains why broader support remained locked.

## 中文

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

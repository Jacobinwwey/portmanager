# PortManager V1 Product Specification

Updated: 2026-04-20
Version: v0.4.15-confidence-promotion-ready

## English

### Summary
PortManager V1 is a control plane for exposing selected remote localhost services over Tailscale without treating ad-hoc shell commands as the operating model.
The product goal is not only exposure, but safe exposure: desired state, operations history, diagnostics visibility, backup-before-mutation, and explicit rollback points.

### Product posture
- `docs-first` is a delivery rule, not a documentation preference.
- `One Host, One Rule, One Rollback` is the first implementation milestone and the acceptance center of gravity.
- Web, CLI, and future agent-driven automation are first-class peers over the same contract surface.
- The product must remain agent-friendly from day one, even before advanced agent workflows are implemented.

### Primary operator problems being solved
- Operators need a safer replacement for scattered SSH, ad-hoc system edits, and undocumented local port exposure scripts.
- Operators need visibility into whether a rule is merely configured, actually active, or silently degraded.
- Operators need a reliable way to prove that a target local service is reachable and visually responds as expected.
- Operators need a bounded rollback surface so PortManager never claims ownership over unrelated workloads.

### V1 in-scope baseline
- Split services architecture: React SPA web plus TypeScript controller API.
- Rust CLI and Rust agent as the execution-facing implementation layers for milestone work.
- Controller-side snapshot and diagnostics pipeline.
- Explicit operations model with event streaming.
- Backup and rollback as hard safety requirements.
- Local artifact store for snapshots, diagnostics, manifests, and operation evidence.
- Shared public contracts defined by OpenAPI and JSON Schema.
- Self-hosted deployment boundary for `controller + web`.

### V1 out-of-scope baseline
- Shipping milestone implementation code in the first upload.
- PostgreSQL as the default state store.
- Agent-side browser runtime or screenshot capture.
- Generic multi-platform host support beyond Ubuntu 24.04 with systemd and Tailscale.
- Managed Kubernetes, hosted SaaS, or multi-tenant control plane work.
- Mobile or desktop end-user clients.

### Locked assumptions
- The first remote target profile is `Ubuntu 24.04 + systemd + Tailscale`.
- Controller is the source of desired state.
- Agent is a bounded execution plane, not a peer strategist.
- SSH is bootstrap and rescue only.
- Runtime mutations must be auditable as operations.
- Destructive mutation cannot proceed if required local backup fails.

### Primary entities
- `Host`: a managed remote machine with bootstrap, readiness, and health state.
- `BridgeRule`: a desired localhost exposure rule.
- `ExposurePolicy`: the host-level guardrail for allowed sources, exclusions, and conflict handling.
- `HealthCheck`: machine-readable reachability and rule verification evidence.
- `Operation`: an auditable lifecycle record of work requested by API, CLI, or Web.
- `RollbackPoint`: a verified recovery target created around destructive mutations.
- `Backup`: a concrete stored bundle with manifest and checksums.
- `Snapshot` and `Diagnostic`: controller-captured evidence for a specific host, rule, and port.

### Product web expectations locked for V1
- Product web overview must use the provided control-console layout language, reinterpreted for PortManager semantics.
- The product must expose a host-centric main table, a contextual right rail, and a bottom event stream.
- Host detail must show current policy, rules, health, backups, rollback points, and recent diagnostics.
- Port detail must show webpage snapshot preview, transport reachability, HTTP result, and TLS basics when applicable.
- The VitePress docs site is a separate documentation surface and follows its own docs-site design baseline.

### Acceptance target for Milestone 1
A V1 implementation will be considered valid only if all of the following become true:
- one host can move from `draft` to `ready`
- one bridge rule can move from `desired` to `active`
- a destructive operation always creates a local backup first
- a failure leaves an operation record and rollback point
- controller diagnostics can produce both machine-readable results and webpage snapshot artifacts
- Web, CLI, and API observe the same host, rule, operation, and degraded state model

### Current implementation progress snapshot
- Already evidenced in code and tests: backup-before-mutation, rollback evidence, controller-side diagnostics capture, operation history, event replay, drift-driven degraded status, real host lifecycle resources, real bridge-rule CRUD, real exposure-policy management, live Web parity across the locked information architecture, and a controller-agent steady-state `HTTP over Tailscale` service path.
- Fresh acceptance evidence on `2026-04-17`: `pnpm acceptance:verify` passes; the embedded milestone proof now shows live bootstrap to `ready`, bridge-rule activation to `active` after controller diagnostics, live agent HTTP apply/runtime collection, and preserved backup/rollback evidence.
- Fresh Windows real-machine acceptance on `2026-04-18`: `pnpm acceptance:verify` passed again on the latest `main`, and development-progress docs validation now honors the committed generated confidence fallback when local `.portmanager` history is absent, matching the docs publication contract on a fresh machine instead of requiring an ignored local-only file.
- Fresh acceptance hardening on `2026-04-18`: the same development-progress docs validation now also tolerates a newer ignored local `.portmanager` history than the committed docs-site progress artifact, so local acceptance stays stable until docs generation is explicitly rerun.
- Controller-side rule lifecycle intentionally becomes `active` only after diagnostics while raw agent runtime remains `applied_unverified` until verification. That split keeps operator truth on the controller side without breaking current artifact compatibility.
- Fresh Milestone 2 slice on `2026-04-17`: agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- Fresh Milestone 2 orchestration slice on `2026-04-17`: `pnpm milestone:verify:confidence` now composes the standing `pnpm acceptance:verify` gate with the remote-backup replay proof, and `.github/workflows/mainline-acceptance.yml` now runs that heavier routine on `push main`, `workflow_dispatch`, and the daily scheduled history run.
- Fresh Milestone 2 confidence-history slice on `2026-04-17`: the canonical routine now writes `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md` with CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`, and CI restores/saves that bundle before uploading it so developers can inspect repeat-green evidence without digging through raw logs.
- Fresh Milestone 2 confidence-readiness slice on `2026-04-17`: the persisted history now classifies `local-only`, `building-history`, and `promotion-ready`, marks whether each run qualifies for readiness advancement, uses `7` qualified runs plus `3` consecutive qualified passes as the shared threshold, and publishes the same summary into the GitHub Actions job summary for developers.
- Fresh Milestone 2 confidence-history sync slice on `2026-04-17`: `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle artifacts from GitHub Actions back into local `.portmanager/reports/` files through authenticated `gh`, dedupes repeated imports by stable entry id, and gives developers a repo-native readiness review path that matches CI summary math.
- Fresh Milestone 2 confidence-review-signal slice on `2026-04-17`: the persisted snapshot now carries `latestQualifiedRun` plus visibility breakdown metadata for qualified mainline runs, local visibility-only runs, and non-qualified remote runs, and the summary now renders that split so newer local verification noise does not hide the actual latest mainline evidence.
- Fresh Milestone 2 confidence-progress-page slice on `2026-04-17`: the docs site now generates milestone confidence progress data, publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, and previews the same latest-qualified snapshot on roadmap home.
- Fresh Milestone 2 confidence-review-digest slice on `2026-04-20`: `pnpm milestone:review:confidence` now compares synced local readiness against the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, separates countdown alignment from visibility-only drift, and only fails on published-countdown mismatch when `--require-published-countdown-match` is requested explicitly.
- Fresh promotion-ready publication refresh on `2026-04-20`: after pulling the latest `main`, `pnpm milestone:sync:confidence-history -- --limit 20` imported 7 qualified `mainline-acceptance` runs through authenticated `gh`, `pnpm milestone:review:confidence` first exposed published countdown drift, `docs:generate:refresh-confidence` then republished the tracked docs artifact, and the synced plus published summary now truthfully report `promotion-ready` with `7/7` qualified runs, `7/3` qualified consecutive passes, and `0` remaining qualified runs. The latest qualified run is `24647442700/1` on `ddc15a3116d3`.
- Deep compare against the completed `2026-04-16` reconciliation docs now shows that the old parity and proof-orchestration gaps are closed; the remaining technical gap is now sustained qualified green history and the milestone-language review that follows from that evidence rather than more reporting scaffolding or review-signal fixes.
- Current product conclusion: the first trusted public control-plane slice is now real and accepted; Milestone 2 confidence maintenance now means syncing completed mainline evidence into local review, running `pnpm milestone:review:confidence`, reading the summary's latest-qualified signal plus the verification report and public development-progress page, refreshing the tracked public artifact deliberately when review agrees, and keeping qualified history green while human milestone-language review narrows wording. As of `2026-04-20`, both synced and published readiness truth are `promotion-ready`; promotion thresholds are met, so the countdown is closed and the remaining work is deliberate wording review rather than more readiness accumulation.

## 中文

### 摘要
PortManager V1 是一个通过 Tailscale 暴露远端 localhost 服务的控制平面，它的目标不只是“能转发”，而是“安全地转发”：具备期望状态、操作历史、诊断可见性、变更前备份以及明确回滚点。

### 产品姿态
- `docs-first` 是交付规则，不只是文档偏好。
- `One Host, One Rule, One Rollback` 是首个实现里程碑，也是验收重心。
- Web、CLI 与未来 agent 驱动自动化都必须作为同一契约面的平级一等入口。
- 即使高级 agent 工作流尚未实现，产品从第一天开始也必须保持 agent-friendly。

### 主要要解决的操作者问题
- 操作者需要一个比零散 SSH、临时系统修改、未文档化端口暴露脚本更安全的替代方案。
- 操作者需要知道一条规则究竟只是“配置了”，还是“真正生效了”，还是“已经静默降级”。
- 操作者需要可靠证明某个本地服务是否可达，以及它的网页是否真的按预期响应。
- 操作者需要一个有边界的回滚面，确保 PortManager 不会宣称接管与其无关的工作负载。

### V1 基线范围内
- 前后端拆分架构：React SPA web + TypeScript controller API。
- Rust CLI 与 Rust agent 作为后续里程碑中的执行层。
- controller-side 快照与诊断链路。
- 带事件流的显式 operations 模型。
- 备份与回滚作为硬安全要求。
- 用于存放快照、诊断、manifest 与操作证据的本地产物仓。
- 以 OpenAPI 与 JSON Schema 定义的共享公共契约。
- `controller + web` 的 self-hosted 部署边界。

### V1 基线范围外
- 在首次上传中交付业务实现代码。
- 将 PostgreSQL 作为默认状态库。
- 让 agent 承担浏览器运行时或截图职责。
- 支持超出 Ubuntu 24.04 + systemd + Tailscale 之外的通用多平台远端目标。
- 托管式 SaaS、Kubernetes 管理面或多租户控制平面。
- 移动端或桌面端终端产品。

### 已锁定假设
- 首个远端目标画像是 `Ubuntu 24.04 + systemd + Tailscale`。
- Controller 是期望状态的真源。
- Agent 是有边界的执行面，而不是策略平级面。
- SSH 仅用于 bootstrap 与救援。
- 所有运行时变更都必须作为 operation 被审计。
- 如果必需的本地备份失败，则 destructive mutation 不得继续。

### 主要领域对象
- `Host`：受管远端主机，具备 bootstrap、readiness 与 health 状态。
- `BridgeRule`：期望中的 localhost 暴露规则。
- `ExposurePolicy`：主机级别的允许源、排除项与冲突处理护栏。
- `HealthCheck`：机器可读的连通性与规则验证证据。
- `Operation`：由 API、CLI 或 Web 发起工作的审计记录。
- `RollbackPoint`：围绕 destructive mutation 创建的可验证恢复目标。
- `Backup`：带 manifest 与 checksum 的实际备份包。
- `Snapshot` 与 `Diagnostic`：controller 针对特定 host、rule、port 抓取的证据。

### V1 产品 Web 预期
- 产品 Web 的 Overview 页面必须复用你给出的控制台布局语言，并改写为 PortManager 语义。
- 产品必须暴露“主机中心表格 + 右侧上下文栏 + 底部事件流”这一信息架构。
- Host detail 必须显示当前 policy、rules、health、backups、rollback points 与最近 diagnostics。
- Port detail 必须显示网页快照预览、传输层可达性、HTTP 结果，以及适用时的 TLS 基础信息。
- VitePress 文档站属于独立的文档发布面，遵循单独的 docs-site 设计基线。

### 里程碑 1 的验收目标
只有当以下条件全部成立时，V1 实现才算有效：
- 一台主机可以从 `draft` 进入 `ready`
- 一条 bridge rule 可以从 `desired` 进入 `active`
- destructive operation 在变更前总能先完成本地备份
- 失败会留下 operation 记录与 rollback point
- controller 诊断同时产出机器可读结果与网页快照产物
- Web、CLI 与 API 对 host、rule、operation 与 degraded 状态的观察一致

### 当前实现进度快照
- 代码与测试已证明：变更前备份、回滚证据、controller-side diagnostics 抓取、operation 历史、事件回放、drift 驱动 degraded 状态、真实 host 生命周期资源、真实 bridge-rule CRUD、真实 exposure-policy 管理、覆盖锁定信息架构的 live Web 一致性，以及 controller-agent 稳态 `HTTP over Tailscale` 服务链路。
- `2026-04-17` 的最新验收证据已经成立：`pnpm acceptance:verify` 重新通过；其中内嵌的 milestone proof 现在已经证明 live bootstrap 到 `ready`、controller diagnostics 之后 bridge rule 进入 `active`、live agent HTTP apply/runtime collection，以及 backup / rollback 证据保持不变。
- `2026-04-18` 的 Windows 真机验收也已经成立：最新 `main` 上的 `pnpm acceptance:verify` 再次通过，而且 development-progress docs 校验现在已经在本地 `.portmanager` 历史缺失时尊重已提交的 generated confidence fallback，让全新机器的 gate 行为与 docs 发布契约保持一致，而不再错误要求一个被忽略的本地文件。
- `2026-04-18` 也继续补齐了一层 acceptance 加固：同一条 development-progress docs 校验现在还会容忍“被忽略的本地 `.portmanager` 历史比已提交 docs-site progress artifact 更新”的场景，因此本地 acceptance 在未明确重跑 docs 生成前仍保持稳定。
- controller 侧的规则生命周期会在 diagnostics 之后才进入 `active`，而原始 agent runtime 在验证完成前仍保持 `applied_unverified`。这条分层语义现在已经是刻意保留的实现，不再是缺失项。
- `2026-04-17` 的下一段 Milestone 2 切片也已经落地：agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在都会发布 `agentVersion` 以及 `live` / `stale` / `unreachable` 的 heartbeat 语义。
- `2026-04-17` 的下一段 Milestone 2 编排切片也已经落地：`pnpm milestone:verify:confidence` 现在已经把既有 `pnpm acceptance:verify` gate 与 remote-backup replay proof 收敛成一条规范 routine，`.github/workflows/mainline-acceptance.yml` 也会在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上运行这条更重的 routine。
- `2026-04-17` 的下一段 Milestone 2 confidence-history 切片也已经落地：规范 routine 现在会写出 `.portmanager/reports/milestone-confidence-report.json`、追加 `.portmanager/reports/milestone-confidence-history.json`、渲染 `.portmanager/reports/milestone-confidence-summary.md`，并附带 `eventName`、`ref`、`sha`、`runId`、`runAttempt`、`workflow` 等 CI traceability 字段；CI 也会先恢复并保存这组 bundle，再上传同一份 bundle，让开发者不必只靠原始日志核对持续转绿证据。
- `2026-04-17` 的下一段 Milestone 2 confidence-readiness 切片也已经落地：持久 history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，标记每次 run 是否真正属于 readiness 推进资格范围，并用 `7` 次 qualified run 加 `3` 次连续 qualified pass 作为统一阈值；同一份 summary 也会直接出现在 GitHub Actions job summary 里供开发者查看。
- `2026-04-17` 的下一段 Milestone 2 confidence-history sync 切片也已经落地：`pnpm milestone:sync:confidence-history` 现在会通过已认证 `gh` 把 GitHub Actions 已完成 `mainline-acceptance` bundle artifact 导回本地 `.portmanager/reports/`，按稳定 history entry id 去重，并让开发者在本地复核与 CI 相同的 readiness 结论。
- `2026-04-17` 的下一段 Milestone 2 confidence-review-signal 切片也已经落地：持久 snapshot 现在会额外记录 `latestQualifiedRun`，并把 qualified mainline run、本地 visibility-only run、非 qualified 远端 run 分开统计；summary 也会把这些信号单独渲染出来，让本地 rerun 不再掩盖真实主线证据。
- `2026-04-17` 的下一段 Milestone 2 confidence-progress-page 切片也已经落地：docs-site 现在会生成 milestone confidence progress 数据，公开发布 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，并在 roadmap 首页直接预览同一份 latest-qualified 快照。
- `2026-04-20` 的下一段 Milestone 2 confidence-review-digest 切片也已经落地：`pnpm milestone:review:confidence` 现在会把同步后的本地 readiness 与已跟踪公开 progress artifact 直接对比，写出 `.portmanager/reports/milestone-confidence-review.md`，把 countdown 对齐状态与 visibility-only 漂移分开汇报，并且只在显式传入 `--require-published-countdown-match` 时才把公开倒计时不一致变成失败。
- `2026-04-20` 的 promotion-ready 开发者复核刷新也已经成立：拉取最新 `main` 之后，`pnpm milestone:sync:confidence-history -- --limit 20` 已通过已认证 `gh` 成功导入 7 次 qualified `mainline-acceptance` 运行，`pnpm milestone:review:confidence` 先暴露公开倒计时漂移，`docs:generate:refresh-confidence` 再把被跟踪 docs 产物刷新到同一份同步状态；同步后的本地与公开 summary 现在都明确显示 readiness 为 `promotion-ready`，进度为 `7/7` qualified runs、`7/3` qualified consecutive passes，且剩余 qualified runs 为 `0`。
- 深度对比已经完成的 `2026-04-16` reconciliation 文档之后，现在已经可以确认：旧的一致性缺口与证明编排缺口都已闭环；剩余技术缺口已经不再是继续补脚手架或继续修 summary 复核语义，而是持续积累 qualified 绿历史，并根据同步后的证据与人工复核来决定文案是否继续收窄。
- 当前产品结论：第一条可信的公共控制平面切片已经真实存在并完成验收；Milestone 2 的 confidence 维护现在意味着同步 completed mainline 证据、执行 `pnpm milestone:review:confidence`、读取 summary 里的 latest-qualified 信号、验证报告与公开 development-progress 页面、只在人工复核同意时显式刷新被跟踪公开 artifact，并持续保持 qualified history 为绿。截至 `2026-04-20`，同步后的本地与公开 readiness 真相都已经进入 `promotion-ready`；promotion 门槛已满足，因此倒计时已经闭环，剩余工作是谨慎收窄文案，而不是继续累积 readiness run。

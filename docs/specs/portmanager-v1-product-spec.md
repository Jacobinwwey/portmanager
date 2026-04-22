# PortManager V1 Product Specification

Updated: 2026-04-21
Version: v0.5.0-m3-phase0-enablement

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
- Fresh promotion-ready publication refresh on `2026-04-21`: after the latest completed mainline evidence was already synced locally, `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` wrote the review digest, refreshed `.portmanager/reports/milestone-wording-review.md`, and republished the tracked docs artifact from that same reviewed evidence bundle. The public snapshot now follows latest qualified run `24707884501/1` (`ca6dbe919157`) and `23/7` qualified runs; exact live counters remain on the generated development-progress page plus the tracked confidence artifact, while this product spec keeps the threshold-met conclusion stable.
- Deep compare against the completed `2026-04-16` reconciliation docs now shows that the old parity and proof-orchestration gaps are closed; the remaining technical gap is no longer missing review machinery, but the explicit Milestone 3 seams that Scheme C still requires.
- Current product conclusion: the first trusted public control-plane slice is now real and accepted, Milestone 2 confidence remains the active guardrail, and Milestone 3 is already inside bounded enablement rather than sitting as a distant slogan. The default review flow still runs through `pnpm milestone:review:promotion-ready -- --limit 20`, `.portmanager/reports/milestone-wording-review.md`, the verification report, and the public development-progress page so public wording stays honest. Exact live counters remain on the development-progress page plus the tracked confidence artifact, while the landed Units 51 through 62 still define the enablement baseline, the landed follow-up slice remains preserved in `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`, the landed discovery slice remains preserved in `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`, the landed review-delta plus execution-tooling groundwork remains preserved in `docs/brainstorms/2026-04-21-portmanager-m3-review-delta-surface-requirements.md`, `docs/plans/2026-04-21-portmanager-m3-review-delta-surface-plan.md`, `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md`, and `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`, and the active implementation map now shifts to `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-plan.md`: Units 63 through 79 now stay landed history, one complete bounded Debian 12 review packet remains preserved at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`, artifact coverage is `20/20`, remote `main` CI parity is repaired after the stale live-loader `hold` expectation moved to `review_required`, `/second-target-policy-pack` now publishes `reviewAdjudication.blockingDeltas` alongside `liveTransportFollowUp.state: capture_required`, and the next live queue is the bounded follow-up that keeps blocking delta `container_bridge_transport_substitution` plus Docker bridge truth `172.17.0.2` explicit while `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` becomes the preferred repo-native collector and explicit ids remain bounded overrides for one real live packet for declared candidate `debian-12-systemd-tailscale` under the still-locked support contract.

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
- `2026-04-21` 的最新 promotion-ready 开发者复核刷新也已经成立：在最新 completed mainline 证据已经同步到本地之后，`pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` 已写出 review digest、刷新 `.portmanager/reports/milestone-wording-review.md`，并把被跟踪 docs 产物重发到同一份已评审过的证据 bundle；当前公开快照已经跟上最新 qualified run `24707884501/1` 与 `23/7` qualified runs。精确实时计数改由 development-progress 页面与被跟踪 confidence artifact 发布，而不是继续把数字硬编码在产品规格里。
- 深度对比已经完成的 `2026-04-16` reconciliation 文档之后，现在已经可以确认：旧的一致性缺口与证明编排缺口都已闭环；剩余技术缺口已经不再是继续补脚手架或继续修 summary 复核语义，而是 Scheme C 仍然需要补上的显式 Milestone 3 seam。
- 当前产品结论：第一条可信的公共控制平面切片已经真实存在并完成验收，Milestone 2 的 confidence 现在继续作为 guardrail 主线存在，而 Milestone 3 已经进入有边界的 enablement，而不再只是一个遥远口号。默认复核链路仍然经过 `pnpm milestone:review:promotion-ready -- --limit 20`、`.portmanager/reports/milestone-wording-review.md`、验证报告与公开 development-progress 页面，确保公共文案继续诚实。精确实时计数继续留在 development-progress 页面与被跟踪 confidence artifact，而已落地的 Unit 51 到 Unit 62 继续构成 enablement 基线，已落地的 live follow-up 切片保留在 `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`，已落地的 discovery 切片保留在 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-discovery-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-discovery-plan.md`，已落地的 review-delta 与 execution-tooling groundwork 保留在 `docs/brainstorms/2026-04-21-portmanager-m3-review-delta-surface-requirements.md`、`docs/plans/2026-04-21-portmanager-m3-review-delta-surface-plan.md`、`docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`，当前激活的实现地图已经切到 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-source-auto-resolution-plan.md`：Units 63 到 79 现在都已成为已落地历史，第一份完整有边界 Debian 12 review packet 继续保留在 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`，artifact coverage 维持 `20/20`，remote `main` CI 也已经在把 stale live-loader `hold` 预期修正到 `review_required` 后恢复一致，`/second-target-policy-pack` 现在会公开 `reviewAdjudication.blockingDeltas` 与 `liveTransportFollowUp.state: capture_required`，而当前公开的下一条队列已经收窄为继续显式公开阻塞 delta `container_bridge_transport_substitution` 与 Docker bridge 真相 `172.17.0.2`，再把 `pnpm milestone:capture:live-packet -- --packet-date <date> --controller-base-url <url>` 作为首选 repo-native 采集路径，把 `--candidate-target-profile-id`、`--host-id` 与 `--bootstrap-operation-id` 保留为有边界 override，把 scaffold、assemble 与 validator helper 保留为回退与核验层，为下一份真实 live Tailscale packet 写入证据，并继续限定已声明候选 `debian-12-systemd-tailscale` 不会自动扩大支持声明。

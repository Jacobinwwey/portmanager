# Interface Document

Updated: 2026-04-21
Version: v0.4.0-m3-phase0-enablement

## English

This document summarizes the V1 public interface boundary for PortManager.
It is a compact companion to `packages/contracts/README.md`, not a replacement for the contracts themselves.

### Controller API resources
- `hosts`
- `bridge-rules`
- `exposure-policies`
- `health-checks`
- `operations`
- `rollback-points`
- `backups`
- `snapshots/diagnostics`

### Protocol rules
- Controller API: `REST + SSE`
- Controller-agent steady state: `HTTP over Tailscale`
- Bootstrap and rescue: `SSH`
- Human-maintained configuration: `TOML`
- Protocol payloads, snapshots, and exports: `JSON`
- Shared contracts: `OpenAPI + JSON Schema + code generation`

### Public consumers
- Web
- CLI
- TypeScript SDK
- Rust crate
- future agent-driven automation

### Current implementation parity snapshot

| Surface | Contract expectation | Verified current status |
| --- | --- | --- |
| `hosts` | V1 managed-host resource | Controller, CLI, and Web implemented. `apps/controller/src/controller-server.ts` exposes `/hosts`, `/hosts/{hostId}`, `/hosts/{hostId}/probe`, and `/hosts/{hostId}/bootstrap`; `crates/portmanager-cli/src/main.rs` mirrors list/get/create/probe/bootstrap; `apps/web/src/main.ts` now renders controller-backed `overview`, `host-detail`, and dedicated `Hosts` views. |
| `bridge-rules` | CRUD plus verification and drift handling | Controller, CLI, and Web implemented. Controller exposes list/detail/create/update/delete plus `/bridge-rules/{ruleId}/drift-check`; CLI mirrors list/get/create/update/delete; Web now renders controller-backed `Bridge Rules` topology, verification, and linked recovery evidence. |
| `exposure-policies` | Host-level policy read/write surface | Controller and CLI implement the write surface, and Web now consumes live effective policy data in overview, host detail, and bridge-rule views. `GET/PUT /exposure-policies/{hostId}` remain the source of truth. |
| `health-checks` | Shared inspection surface for host/rule health evidence | Implemented for controller and CLI reads. Web now renders live host and bridge-rule health evidence from controller-backed `health-checks` data. |
| `operations` | Shared audit record plus detail and replay | Implemented for controller and CLI reads, including detail and replay URLs. Web operations and console surfaces now consume live controller data, replay URLs, and selected diagnostic detail. |
| `rollback-points` | Recovery inventory plus apply flow | Implemented for controller and CLI list/apply flows. Web now renders live rollback readiness and linked recovery evidence in host-detail and backups views. |
| `backups` | Backup inventory plus backup execution | Implemented for controller list/run and CLI list. Web now renders live backup inventory, manifest paths, and related recovery operations in dedicated `Backups` and controller-backed host views. When `PORTMANAGER_GITHUB_BACKUP_ENABLED`, `PORTMANAGER_GITHUB_BACKUP_REPO`, and `PORTMANAGER_GITHUB_BACKUP_TOKEN` are configured, controller also uploads the backup bundle JSON through the GitHub Contents API and publishes `succeeded` / `failed` / `not_configured` remote status across API, CLI, and Web. |
| `snapshots/diagnostics` | Diagnostics run/list plus snapshot evidence | Implemented for controller run/list and CLI list. Controller `GET /diagnostics` now also accepts `state` for degraded-versus-recovery history filtering, and Web host detail now renders latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence inside controller-backed host-level surfaces. |
| Controller-agent steady state | `HTTP over Tailscale` | Implemented. `crates/portmanager-agent/src/main.rs` now exposes long-lived `serve` with `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback`; controller uses `apps/controller/src/agent-client.ts` to push desired state, collect runtime state, and explicitly degrade unreachable hosts and rules. |

### Verification boundary
- The repository now has a repeatable mainline verification gate: `pnpm acceptance:verify`.
- The repository now also has one canonical Milestone 2 confidence routine: `pnpm milestone:verify:confidence`.
- The repository now also has one repo-native Milestone 2 history-import command: `pnpm milestone:sync:confidence-history`.
- The repository now also has one repo-native Milestone 2 developer review digest: `pnpm milestone:review:confidence`.
- The repository now also has one repo-native Milestone 2 promotion review helper: `pnpm milestone:review:promotion-ready`.
- The repository now also has one repo-native Milestone 2 current-run review-pack fetch helper: `pnpm milestone:fetch:review-pack`.
- The main branch CI mirror for that gate is `.github/workflows/mainline-acceptance.yml`.
- That workflow keeps `pnpm acceptance:verify` on the standing PR path and runs `pnpm milestone:verify:confidence` on `push main`, `workflow_dispatch`, and the daily scheduled history run.
- The confidence routine now writes `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, and `.portmanager/reports/milestone-confidence-summary.md` with CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`; the confidence job restores and saves the history bundle across runs, runs `pnpm milestone:review:promotion-ready -- --skip-sync` against the current local artifacts, uploads that review pack as part of `milestone-confidence-bundle-*`, and publishes the same markdown summary plus review files directly in the GitHub Actions job summary.
- The sync command reads those completed CI bundles back through authenticated `gh` access with `repo` scope, imports completed qualified runs including failures, dedupes by stable history entry id, and rewrites the same local history and summary files for developer review.
- The review-digest command compares that synced local history bundle with the tracked `docs-site/data/milestone-confidence-progress.ts` publication artifact, writes `.portmanager/reports/milestone-confidence-review.md`, distinguishes countdown alignment from full local visibility-only drift, and only turns published-countdown mismatch into a failure when `--require-published-countdown-match` is explicitly requested.
- The promotion-review helper composes the sync and review-digest steps for the default developer-review flow, writes `.portmanager/reports/milestone-wording-review.md` for human milestone-language review, publishes `Public claim class`, `Source surface status`, plus `Required next action`, supports `--skip-sync` for current-run CI review-pack generation, and only refreshes the tracked public artifact when `--refresh-published-artifact` is passed explicitly.
- The fetch helper downloads the uploaded current-run `milestone-confidence-bundle-*`, stages `.portmanager/reports/milestone-confidence-review.md`, `.portmanager/reports/milestone-wording-review.md`, and any companion summary/history/report files under `.portmanager/reports/current-ci-review-pack/`, and writes `.portmanager/reports/current-ci-review-pack/review-pack-manifest.json` so CI-first review can stay repo-native.
- The confidence history now distinguishes qualified Milestone 2 promotion evidence from local visibility-only runs, persists `latestQualifiedRun` plus visibility-only breakdown metadata, and classifies readiness as `local-only`, `building-history`, or `promotion-ready` against one explicit rule: `7` qualified runs plus `3` consecutive qualified passes from `push`, `workflow_dispatch`, or `schedule` on `refs/heads/main`.
- The docs site now also publishes that synced review state through `/en/roadmap/development-progress` and `/zh/roadmap/development-progress`, backed by generated milestone confidence data and previewed directly on roadmap home.
- Default docs publication now reuses the committed `docs-site/data/milestone-confidence-progress.ts` artifact; only `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` is allowed to republish that tracked snapshot from local `.portmanager` history.
- Unit 0 is already achieved and should be treated as mandatory baseline discipline through `pnpm acceptance:verify`, `mainline-acceptance`, and `docs-pages`.
- This gate proves current code health across tests, type checks, Rust workspace tests, contract drift checks, docs-site build, and milestone verification.
- Fresh local proof on `2026-04-17`: `pnpm acceptance:verify` passes after the Unit 4 agent-service delivery and Unit 5 docs sync.
- Fresh promotion-ready maintenance checkpoint on `2026-04-21`: local `corepack pnpm acceptance:verify` still passed, the latest synced `mainline-acceptance` evidence now reaches run `24707884501`, the last published `docs-pages` proof before this refresh remained healthy at run `24707884469`, and the tracked confidence-progress artifact has now been deliberately refreshed to the latest reviewed `23/7` promotion-ready snapshot before publication.
- Fresh promotion-ready publication refresh on `2026-04-21`: after pulling the latest `main`, `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` synced completed `mainline-acceptance` runs through authenticated `gh`, wrote the review digest, and republished the tracked docs artifact from the same completed workflow evidence. Exact live counters and the latest qualified run now live in the generated development-progress surface plus the tracked confidence artifact, not as brittle interface-doc literals.
- Fresh verification hardening on `2026-04-18`: development-progress docs validation now matches `scripts/docs/extract-locales.mjs` by accepting the committed generated confidence snapshot when `.portmanager` history is absent, so a fresh machine no longer fails the standing gate on an ignored local-only file.
- Fresh verification hardening on `2026-04-18`: the same development-progress docs validation also no longer requires committed docs-site progress data to match a newer ignored local `.portmanager` history snapshot, so the standing gate remains stable until docs generation is intentionally rerun.
- The confidence routine extends that baseline with the remote-backup replay proof on the same accepted live slice. It does **not** mean Milestone 2 reliability wording can broaden automatically; continued green history and deliberate human review are still required.
- Current readiness truth after that review remains `promotion-ready` with promotion thresholds met. The default local review flow now starts from `pnpm milestone:review:promotion-ready -- --limit 20`, which syncs history, writes the review digest, and emits `.portmanager/reports/milestone-wording-review.md` before any explicit refresh decision; when the first question is the current CI run, `pnpm milestone:fetch:review-pack` now stages the uploaded review bundle under `.portmanager/reports/current-ci-review-pack/`. `promotion-ready-reviewed` and `promotion-ready-refresh-required` still distinguish public-artifact alignment from refresh-required local lead, and the tracked public snapshot still moves only through the same helper plus `--refresh-published-artifact` when review agrees. Exact live counters stay on the development-progress page and tracked confidence artifact, while this interface guide keeps the threshold-met conclusion stable.

### Current delivery status
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now exist as real source-of-truth resources.
- `Unit 2`: complete. CLI now inspects and mutates those same controller-backed resources with the existing `--json` and wait-aware conventions.
- `Unit 3`: complete. Web now renders controller-backed routes and diagnostics detail.
- `Unit 4`: complete. Controller and agent now communicate through the locked `HTTP over Tailscale` steady-state boundary without breaking current evidence artifacts.
- `Unit 5`: complete. Acceptance was replayed and milestone language updated only after the proof stayed green.
- `Milestone 2 slice shipped`: agent `/health` + `/runtime-state`, controller host summary/detail, CLI host output, and Web host detail now share `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- `Milestone 2 slice shipped`: controller `GET /diagnostics` now filters by `state`, and Web host detail now groups degraded diagnostics history with recovery-ready successful evidence.
- `Milestone 2 slice shipped`: controller backup bundles now upload through the GitHub Contents API when configured, and required-mode success/failure stays explicit across API, CLI, Web, and milestone proof.
- `Milestone 2 slice shipped`: repeated remote-backup replay now exercises local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule flow across API, CLI, Web backup views, and agent runtime proof.
- `Milestone 2 slice shipped`: `pnpm milestone:verify:confidence` now composes the standing acceptance gate with the remote-backup replay proof, and the mainline workflow now collects that heavier routine on `push main`, `workflow_dispatch`, and the daily scheduled history path.
- `Milestone 2 slice shipped`: the canonical confidence routine now emits a durable JSON report at `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md`, and CI restores/saves that history bundle across runs so green-history review stops depending on raw job logs alone.
- `Milestone 2 slice shipped`: the persisted confidence history now classifies `local-only`, `building-history`, and `promotion-ready`, marks whether each run qualifies for readiness advancement, and GitHub Actions publishes the same summary directly in the workflow run page.
- `Milestone 2 slice shipped`: `pnpm milestone:sync:confidence-history` now lets developers pull completed `mainline-acceptance` bundle history back into local readiness review with authenticated `gh`, deduped entries, and the same shared readiness summary.
- `Milestone 2 slice shipped`: synced and local confidence summaries now separate `Latest Run` from `Latest Qualified Run` and count visibility-only local versus non-qualified remote runs, so developer review stays truthful after local reruns.
- `Milestone 2 slice shipped`: the docs site now publishes the same synced confidence snapshot as a first-class development-progress page and roadmap-home preview for public developer review.
- `Milestone 2 slice shipped`: `pnpm milestone:review:confidence` now gives developers one repo-native digest that compares synced local readiness with the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, and keeps countdown drift separate from visibility-only drift during milestone review.
- `Milestone 2 slice shipped`: `pnpm milestone:review:promotion-ready` now gives developers one repo-native helper that composes history sync plus review-digest generation, emits `.portmanager/reports/milestone-wording-review.md`, classifies claim posture as `promotion-ready-reviewed` or `promotion-ready-refresh-required` when thresholds are already met, and only republishes the tracked public snapshot when `--refresh-published-artifact` is requested explicitly.
- `Milestone 2 slice shipped`: `pnpm milestone:review:promotion-ready -- --skip-sync` now lets the confidence job publish `.portmanager/reports/milestone-confidence-review.md` plus `.portmanager/reports/milestone-wording-review.md` inside `milestone-confidence-bundle-*` for the current run.
- `Milestone 2 slice shipped`: `pnpm milestone:fetch:review-pack` now lets developers stage the uploaded current-run review pack under `.portmanager/reports/current-ci-review-pack/` with `review-pack-manifest.json` instead of manual artifact browsing.
- `Milestone 3 slice shipped`: controller now serves `/api/controller/*` as a compatibility-safe consumer boundary, Web keeps prefixed base URLs intact, and CLI now accepts `PORTMANAGER_CONSUMER_BASE_URL` without breaking older controller-base configuration.
- `Next lane`: Milestone 3 now starts as bounded `Phase 0 enablement` on top of the same live host / rule / policy slice. Milestone 2 review helpers remain the wording-truth guardrail: keep `pnpm milestone:review:promotion-ready -- --limit 20` as the default completed-mainline review entrypoint, use `pnpm milestone:fetch:review-pack` when CI state is the immediate question, review `.portmanager/reports/current-ci-review-pack/`, `.portmanager/reports/milestone-wording-review.md`, `Public claim class`, `Source surface status`, the verification report, and the public progress page together, and only refresh the tracked public snapshot through the same helper plus `--refresh-published-artifact` when review agrees. New implementation work now follows `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md`, `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`, and the Debian review-prep docs beyond landed Units 51 through 62 and declared candidate `debian-12-systemd-tailscale`, keeping `/consumer-boundary-decision-pack`, `/deployment-boundary-decision-pack`, `/persistence-decision-pack`, `/second-target-policy-pack`, and the target-profile registry as the truthful platform contract while the new candidate-host create/probe/bootstrap review-prep lane stays honest and the review-packet template, bootstrap-proof guide `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`, steady-state guide `docs/operations/portmanager-debian-12-steady-state-proof-capture.md`, plus the remaining recovery parity are still being captured.

## 中文

本文档汇总 PortManager V1 的公共接口边界。
它是 `packages/contracts/README.md` 的紧凑配套说明，而不是契约本体的替代品。

### Controller API 资源
- `hosts`
- `bridge-rules`
- `exposure-policies`
- `health-checks`
- `operations`
- `rollback-points`
- `backups`
- `snapshots/diagnostics`

### 协议规则
- Controller API：`REST + SSE`
- controller-agent 稳态通信：`HTTP over Tailscale`
- bootstrap 与救援：`SSH`
- 人类维护配置：`TOML`
- 协议载荷、快照与导出：`JSON`
- 共享契约：`OpenAPI + JSON Schema + 代码生成`

### 公共使用方
- Web
- CLI
- TypeScript SDK
- Rust crate
- 未来的 agent 驱动自动化

### 当前实现一致性快照

| 表面 | 契约预期 | 当前已验证状态 |
| --- | --- | --- |
| `hosts` | V1 受管主机资源 | controller、CLI、Web 已实现。`apps/controller/src/controller-server.ts` 已暴露 `/hosts`、`/hosts/{hostId}`、`/hosts/{hostId}/probe`、`/hosts/{hostId}/bootstrap`；`crates/portmanager-cli/src/main.rs` 已补齐 list/get/create/probe/bootstrap；`apps/web/src/main.ts` 现在也已渲染 controller-backed 的 `overview`、`host-detail` 与独立 `Hosts` 视图。 |
| `bridge-rules` | CRUD 加验证与漂移处理 | controller、CLI、Web 已实现。controller 已暴露 list/detail/create/update/delete 以及 `/bridge-rules/{ruleId}/drift-check`；CLI 已补齐 list/get/create/update/delete；Web 现在也有 controller-backed 的 `Bridge Rules` 拓扑、验证与恢复证据页面。 |
| `exposure-policies` | 主机级 policy 读写面 | controller 与 CLI 负责真实写入面；Web 现在已经在 overview、host detail、bridge-rule 视图中消费 live effective policy 数据。`GET/PUT /exposure-policies/{hostId}` 仍然是真源。 |
| `health-checks` | 跨界面共享的 host/rule 健康证据面 | controller 与 CLI 的读取能力已实现；Web 现在也会从 controller-backed `health-checks` 渲染 live host / rule 健康证据。 |
| `operations` | 共享审计记录、详情与回放入口 | controller 与 CLI 的读取能力已实现，包括 detail 与 replay URL；Web 的 operations 与 console 页面现在也会消费 live controller 数据、replay URL 与 diagnostics detail。 |
| `rollback-points` | 恢复点清单与 apply 流程 | controller 与 CLI 的 list/apply 已实现；Web 现在也会在 host-detail 与 backups 页面中渲染 live rollback readiness 与恢复证据。 |
| `backups` | 备份清单与执行入口 | controller 的 list/run 与 CLI 的 list 已实现；Web 现在也已经在独立 `Backups` 与 controller-backed host 视图里渲染 live backup inventory、manifest 路径与恢复操作。当 `PORTMANAGER_GITHUB_BACKUP_ENABLED`、`PORTMANAGER_GITHUB_BACKUP_REPO`、`PORTMANAGER_GITHUB_BACKUP_TOKEN` 已配置时，controller 还会通过 GitHub Contents API 上传 backup bundle JSON，并把 `succeeded` / `failed` / `not_configured` 远端状态同步暴露给 API、CLI 与 Web。 |
| `snapshots/diagnostics` | 诊断执行、列表与快照证据 | controller 的 run/list 与 CLI 的 list 已实现；controller `GET /diagnostics` 现在还支持 `state` 过滤 degraded 与 recovery 历史，Web host detail 也已经在 controller-backed host 证据面里分组渲染最新诊断、degraded 诊断历史与 recovery-ready 成功证据。 |
| controller-agent 稳态通信 | `HTTP over Tailscale` | 已实现。`crates/portmanager-agent/src/main.rs` 现在已经提供长驻 `serve` 以及 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`；controller 会通过 `apps/controller/src/agent-client.ts` 推送 desired state、收集 runtime state，并在 agent 不可达时显式把 host / rule 置为 degraded。 |

### 验证边界
- 当前仓库已经具备可重复执行的主线验证 gate：`pnpm acceptance:verify`。
- 当前仓库也已经具备一条规范的 Milestone 2 confidence routine：`pnpm milestone:verify:confidence`。
- 当前仓库也已经具备一条 repo-native 的 Milestone 2 history-import 命令：`pnpm milestone:sync:confidence-history`。
- 当前仓库也已经具备一条 repo-native 的 Milestone 2 开发者复核摘要命令：`pnpm milestone:review:confidence`。
- 当前仓库也已经具备一条 repo-native 的 Milestone 2 promotion review helper：`pnpm milestone:review:promotion-ready`。
- 该 gate 在主分支上的 CI 镜像为 `.github/workflows/mainline-acceptance.yml`。
- 这条 workflow 会继续把 `pnpm acceptance:verify` 保留在 PR 路径上，并在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上运行 `pnpm milestone:verify:confidence`。
- 这条 confidence routine 现在还会写出 `.portmanager/reports/milestone-confidence-report.json`、`.portmanager/reports/milestone-confidence-history.json` 与 `.portmanager/reports/milestone-confidence-summary.md`，并附带 `eventName`、`ref`、`sha`、`runId`、`runAttempt`、`workflow` 等 CI traceability 字段；confidence job 还会在各次运行之间恢复并保存这组 history bundle，对当前本地 artifacts 执行 `pnpm milestone:review:promotion-ready -- --skip-sync`，把这组 review pack 一并上传进 `milestone-confidence-bundle-*`，并把同一份 markdown summary 与 review 文件直接发布到 GitHub Actions job summary 供开发者核对。
- 这条 sync 命令会通过已认证且具备 `repo` scope 的 `gh` 读取这些已完成 CI bundle，把包含失败 run 在内的已完成 qualified 历史导回本地，按稳定 history entry id 去重，并重写同一份本地 history 与 summary 文件供开发者复核。
- 这条 review-digest 命令会把同步后的本地 history bundle 与已跟踪 `docs-site/data/milestone-confidence-progress.ts` 发布产物直接对比，写出 `.portmanager/reports/milestone-confidence-review.md`，把 countdown 对齐状态与完整本地 visibility-only 漂移拆开汇报，并且只在显式传入 `--require-published-countdown-match` 时才把公开倒计时不一致转成失败。
- 这条 promotion-review helper 会把 sync 与 review-digest 串成默认开发者复核链路，还会额外写出 `.portmanager/reports/milestone-wording-review.md` 供人工里程碑文案复核使用，明确给出 `Public claim class`、`Source surface status` 与 `Required next action`，同时支持 `--skip-sync` 作为当前 run 的 CI review-pack 生成模式，并且只有在显式传入 `--refresh-published-artifact` 时才会刷新被跟踪公开 artifact。
- 这组 confidence history 现在还会把真正属于 Milestone 2 readiness 推进的 qualified run 与本地可见性 run 区分开，持久化 `latestQualifiedRun` 与 visibility-only breakdown 元数据，并按照 `local-only`、`building-history`、`promotion-ready` 三种状态汇总 readiness；统一阈值为 `push`、`workflow_dispatch`、`schedule` on `refs/heads/main` 的 `7` 次 qualified run 加 `3` 次连续 qualified pass。
- docs-site 现在也会通过 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress` 公开这份同步后的复核状态，并在 roadmap 首页直接预览同一份 milestone confidence 快照。
- 默认 docs 发布现在会复用已提交的 `docs-site/data/milestone-confidence-progress.ts`；只有 `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` 才允许把本地 `.portmanager` history 重新发布成新的被跟踪快照。
- Unit 0 现在已经成立，应通过 `pnpm acceptance:verify`、`mainline-acceptance` 与 `docs-pages` 被视为必须持续保持的基线纪律。
- 它覆盖当前代码的测试、类型检查、Rust workspace 测试、契约漂移检查、docs-site 构建与 milestone 验证。
- 本地最新证明也发生在 `2026-04-17`：Unit 4 agent-service 交付与 Unit 5 文档同步之后，`pnpm acceptance:verify` 已重新通过。
- `2026-04-21` 的 promotion-ready 维护检查点也已经成立：本地 `corepack pnpm acceptance:verify` 继续通过，最新同步的 `mainline-acceptance` 证据已经推进到 run `24707884501`，这次刷新前最近一次已发布 `docs-pages` 证明仍保持在 run `24707884469` 且健康，被跟踪的 confidence-progress artifact 现在也已经在发布前被有意刷新到最新评审过的 `23/7` promotion-ready 快照。
- `2026-04-21` 的 promotion-ready 发布刷新也已经成立：拉取最新 `main` 之后，`pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` 已通过已认证 `gh` 同步 completed `mainline-acceptance` 运行、写出 review digest，并把被跟踪 docs 产物刷新到同一份已完成 workflow 证据；精确实时计数与最新 qualified run 现在统一以下发到 development-progress 页面与被跟踪 confidence artifact 为准，而不再写死在接口说明里。
- `2026-04-18` 的验证加固也已经完成：development-progress docs 校验现在已经与 `scripts/docs/extract-locales.mjs` 的发布契约保持一致，在 `.portmanager` 历史缺失时会接受已提交的 generated confidence snapshot，因此一台全新的机器不再因为一个被忽略的本地文件而误报 gate 失败。
- `2026-04-18` 的验证加固还继续补齐了一层：同一条 development-progress docs 校验不再要求已提交的 docs-site progress data 必须与一个更新的、被忽略的本地 `.portmanager` 历史快照完全相等，因此在未主动重跑 docs 生成前，standing gate 仍然保持稳定。
- 这条 confidence routine 会在同一条已验收 live 切片上继续叠加 remote-backup replay proof，但它**并不**意味着 Milestone 2 可靠性文案可以自动放宽；仍然需要持续为绿的历史与谨慎的人工复核。
- 同步后的当前 readiness 真相现在已经是 `promotion-ready`，promotion 门槛也已经满足；当前默认本地复核链路现在会从 `pnpm milestone:review:promotion-ready -- --limit 20` 开始，它会先同步 history、再写出 review digest 与 `.portmanager/reports/milestone-wording-review.md`，并用 `promotion-ready-reviewed` 与 `promotion-ready-refresh-required` 区分公开 artifact 已对齐还是仍需刷新；如果第一问题是当前 CI run，则先执行 `pnpm milestone:fetch:review-pack`，把上传后的 review bundle 落到 `.portmanager/reports/current-ci-review-pack/`。精确实时计数统一留给 development-progress 页面与被跟踪 confidence artifact，而这份接口说明保留更稳定的 threshold-met 结论。倒计时已经闭环，因此剩余工作是持续保持 gate 健康并谨慎复核文案，而不是继续累积 readiness run。

### 当前交付状态
- `Unit 1`：已完成。controller 的 `hosts`、`bridge-rules`、`exposure-policies` 真源资源已经落地。
- `Unit 2`：已完成。CLI 已补齐这些 controller-backed 资源，并继续沿用现有 `--json` 与等待轮询约定。
- `Unit 3`：已完成。Web 现在已经渲染 controller-backed 路由与 diagnostics detail。
- `Unit 4`：已完成。在不破坏现有证据产物的前提下，controller 与 agent 已通过锁定的 `HTTP over Tailscale` 稳态边界接通。
- `Unit 5`：已完成。只有在证明链保持为绿之后，验收才被重跑，里程碑状态表述也才被更新。
- `Milestone 2 切片已交付`：controller `GET /diagnostics` 现在支持 `state` 过滤，Web host detail 也已经把 degraded diagnostics history 与 recovery-ready 成功证据成组展示出来。
- `Milestone 2 切片已交付`：当配置存在时，controller backup bundle 现在会通过 GitHub Contents API 上传，required-mode 成功/失败路径也已经在 API、CLI、Web 与 milestone proof 中保持显式一致。
- `Milestone 2 切片已交付`：remote-backup replay 现在会在同一条 live agent-backed host / rule 流程上重放 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 证据对齐。
- `Milestone 2 切片已交付`：`pnpm milestone:verify:confidence` 现在已经把既有 acceptance gate 与 remote-backup replay proof 收敛成一条规范 routine，主线 workflow 也会在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上收集这条更重的证明。
- `Milestone 2 切片已交付`：规范 confidence routine 现在还会写出带 CI traceability 元数据的 `.portmanager/reports/milestone-confidence-report.json`、`.portmanager/reports/milestone-confidence-history.json` 与 `.portmanager/reports/milestone-confidence-summary.md`，CI 也会在各次运行之间恢复并保存这组 bundle，再上传同一份 bundle，让开发者核对持续转绿历史时不再只依赖原始 job 日志。
- `Milestone 2 切片已交付`：持久 confidence history 现在会把 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态直接写进 summary，标记当前 run 是否属于 readiness 推进资格范围，并把同一份 summary 发布到 GitHub Actions workflow 页面。
- `Milestone 2 切片已交付`：`pnpm milestone:sync:confidence-history` 现在已经允许开发者通过已认证 `gh` 把 completed `mainline-acceptance` bundle history 导回本地 readiness review，并保持与同一套 summary 计算逻辑一致。
- `Milestone 2 切片已交付`：同步后与本地的 confidence summary 现在会把 `Latest Run` 与 `Latest Qualified Run` 分开显示，并统计本地 visibility-only 与非 qualified 远端 run，让开发者在本地 rerun 之后仍然能看到真实主线证据。
- `Milestone 2 切片已交付`：docs-site 现在也会把同一份同步后的 confidence snapshot 发布成一级开发者进度页面，并在 roadmap 首页直接公开预览。
- `Milestone 2 切片已交付`：`pnpm milestone:review:confidence` 现在已经给开发者补上一条 repo-native 复核摘要命令，用来直接对比同步后的本地 readiness 与已跟踪公开 progress artifact，写出 `.portmanager/reports/milestone-confidence-review.md`，并把 countdown 漂移与 visibility-only 漂移分开汇报。
- `Milestone 2 切片已交付`：`pnpm milestone:review:promotion-ready` 现在已经给开发者补上一条 repo-native helper，把 history sync 与 review digest 串成同一条默认复核链路，还会写出带 claim posture 的 `.portmanager/reports/milestone-wording-review.md`，并且只在显式传入 `--refresh-published-artifact` 时刷新被跟踪公开 artifact。
- `Milestone 2 切片已交付`：`pnpm milestone:review:promotion-ready -- --skip-sync` 现在会让 confidence job 把当前 run 的 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 直接上传进 `milestone-confidence-bundle-*`。
- `Milestone 2 切片已交付`：`pnpm milestone:fetch:review-pack` 现在已经把上传后的 current-run review pack 稳定落到 `.portmanager/reports/current-ci-review-pack/`，并写出 `review-pack-manifest.json`，让开发者不再依赖 GitHub artifact 手动点击。
- `Milestone 3 切片已交付`：controller 现在会公开兼容旧路由的 `/api/controller/*` consumer boundary；Web 已经保持 prefix base URL 不丢失，CLI 也已经支持 `PORTMANAGER_CONSUMER_BASE_URL`，而不破坏旧 controller-base 配置。
- `下一主线`：Milestone 3 现在已经在同一条 live host / rule / policy 切片上作为有边界的 `Phase 0 enablement` 启动。Milestone 2 的 review helper 继续保留为文案真相 guardrail：把 `pnpm milestone:review:promotion-ready -- --limit 20` 作为 completed-mainline 之后的默认复核入口；如果第一问题是当前 CI 状态，就先执行 `pnpm milestone:fetch:review-pack` 并读取 `.portmanager/reports/current-ci-review-pack/`；随后继续把 `.portmanager/reports/milestone-wording-review.md`、`Public claim class`、`Source surface status`、验证报告与公开 progress page 当作同一份复核包，并且只在 helper 报告需要前进且人工复核同意时通过同一条 helper 加上 `--refresh-published-artifact` 刷新公开快照。新的实现工作改由 `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md`、`docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` 与 Debian review-prep 文档约束，在已落地的 Unit 51 到 Unit 62 和已声明候选 `debian-12-systemd-tailscale` 之外继续推进围绕 `/second-target-policy-pack` 的 candidate host 注册、probe、bootstrap review-prep lane 真相维护，以及 review packet 模板落盘、bootstrap proof 指南 `docs/operations/portmanager-debian-12-bootstrap-proof-capture.md`、steady-state 指南 `docs/operations/portmanager-debian-12-steady-state-proof-capture.md` 与其余恢复等价证明，同时继续把 `/consumer-boundary-decision-pack`、`/deployment-boundary-decision-pack`、`/persistence-decision-pack`、`/second-target-policy-pack` 与 target-profile registry 保持为唯一受支持的平台契约。

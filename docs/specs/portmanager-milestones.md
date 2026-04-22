# PortManager Milestones

Updated: 2026-04-21
Version: v0.6.0-m3-phase0-enablement

## English

### Roadmap sequencing rules
- Freeze contracts, design baselines, and publishing rules before implementation breadth.
- Prove one trusted operational slice before expanding reliability or platform reach.
- Reliability work comes before platform breadth, because unstable multi-host expansion only amplifies ambiguity.
- `Toward C` is an earned phase, not a placeholder slogan. It begins only after the `B` validation state is credible.

### A / B / C progression model
- `A`: docs-first baseline. Contracts, design baselines, route contracts, install contract, and publishing rules are frozen and reviewable.
- `B`: trusted validation state. PortManager proves one real control-plane slice end to end: one host, one rule, one rollback, plus the minimum migration of current agent-service settings and capabilities needed to stop the product from remaining a paper design.
- `C`: broader platform state. PortManager grows from a narrow single-host bridge control plane into a more general terminal-side management substrate for both human and agent consumers, without abandoning contract-first governance.

### Milestone 1: One Host, One Rule, One Rollback

#### Why this milestone exists
Milestone 1 is intentionally narrow.
Its job is to prove that PortManager is a real control plane rather than a collection of docs, shell glue, screenshots, and future promises.
This milestone is also where the `B` validation state starts: the smallest credible migration of current agent-service behavior into the new control-plane model.

#### Locked choices
- split services: `controller API + React SPA web`
- execution layers: `Rust CLI + Rust agent`
- `SQLite` as the V1 state-store default
- `OpenAPI + JSON Schema + codegen` as the public contract foundation
- controller-side snapshot and diagnostics, not agent-side browser capture
- bootstrap and rescue over SSH, steady-state communication over `HTTP over Tailscale`

#### Acceptance gate
Milestone 1 is only accepted when all of the following become true:
- one host can move from `draft` to `ready`
- one bridge rule can move from `desired` to `active`
- destructive mutation always creates a required local backup first
- failure leaves both an operation record and a usable rollback point
- diagnostics produce both machine-readable results and webpage snapshot artifacts
- Web, CLI, and API observe the same host, rule, operation, and degraded-state model

#### Current verified status
- Milestone 1 public-surface acceptance is now closed on `2026-04-17`.
- Verified now: backup-before-mutation, rollback evidence, diagnostics capture, drift-driven degraded state, filtered operation history, event replay, and controller/CLI inspection surfaces for operations, backups, diagnostics, health checks, and rollback points.
- Verified now from Unit 1: controller-backed `/hosts`, `/hosts/{hostId}`, `/hosts/{hostId}/probe`, `/hosts/{hostId}/bootstrap`, `/bridge-rules`, `/bridge-rules/{ruleId}`, and `GET/PUT /exposure-policies/{hostId}` are now real, and destructive rule mutation preserves backup and rollback evidence before state changes.
- Verified now from Unit 2: CLI `hosts`, `bridge-rules`, and `exposure-policies` read/write flows now mirror those controller resources with the existing `--json` and wait-aware conventions, and `crates/portmanager-cli/tests/host_rule_policy_cli.rs` proves the public command surface end to end.
- Verified now from Unit 3: Web renders live controller-backed overview, host detail, hosts, bridge rules, backups, console, and diagnostics detail across the locked information architecture.
- Verified now from Unit 4: the agent now exposes the steady-state controller-agent `HTTP over Tailscale` service boundary, controller pushes desired state across that boundary, and unreachable agents degrade affected hosts and rules explicitly.
- Fresh acceptance evidence on `2026-04-17`: `pnpm acceptance:verify` now passes after Unit 4 delivery and Unit 5 docs sync; the embedded milestone proof shows host `draft -> ready`, bridge rule `desired -> active`, live agent HTTP bootstrap/apply/runtime collection, snapshot evidence, and preserved backup/rollback artifacts.
- Fresh Windows real-machine acceptance on `2026-04-18`: `pnpm acceptance:verify` passed again on the latest `main`, and development-progress docs validation now honors the committed generated confidence fallback when local `.portmanager` history is absent, matching the docs publication contract on a fresh machine.
- Fresh acceptance hardening on `2026-04-18`: that same development-progress docs validation now also stays stable when ignored local `.portmanager` history is newer than committed docs-site progress data, so acceptance no longer depends on local hidden-state freshness unless docs generation is intentionally rerun.
- Fresh promotion-ready maintenance checkpoint on `2026-04-21`: local `corepack pnpm acceptance:verify` still passed, the latest synced `mainline-acceptance` evidence now reaches run `24707884501`, the last published `docs-pages` proof before this refresh remained healthy at run `24707884469`, and the tracked confidence-progress artifact has now been deliberately refreshed to the latest reviewed `23/7` promotion-ready snapshot before publication. The standing acceptance gate therefore remains healthy, and the next publication proof should be rechecked after this refresh lands on `main`.
- Controller-side rule truth intentionally becomes `active` only after diagnostics while raw agent runtime remains `applied_unverified` until verification. That separation is now shipped behavior, not a Milestone 1 gap.

#### Current development sequence
- `Unit 0`: complete and mandatory. Keep the gate green while later units land, but do not treat gate work as the current milestone-closure objective.
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now run through the shared store and runner with host lifecycle and backup-aware rule mutation.
- `Unit 2`: complete. CLI now mirrors those same resources so controller and CLI share one truthful public surface.
- `Unit 3`: complete. Web now renders controller-backed views and diagnostics detail across overview, host detail, hosts, bridge rules, operations, backups, and console.
- `Unit 4`: complete. The agent now serves the minimum `HTTP over Tailscale` steady-state boundary without breaking current artifact compatibility.
- `Unit 5`: complete. `pnpm acceptance:verify` was replayed, roadmap and product docs were synced, and Milestone 1 wording moved only after proof stayed green.
- `Heartbeat/version slice`: complete. Agent `/health` + `/runtime-state`, controller host summary/detail, CLI host output, and Web host detail now share `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- `Diagnostics-history slice`: complete. Controller `GET /diagnostics` now filters by `state`, and Web host detail now groups latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence on the same live host / rule / policy slice.
- `GitHub-backup slice`: complete. Controller backup bundles now upload through the GitHub Contents API when configured, and required-mode success/failure paths stay explicit across API, CLI, Web, and dedicated reliability proof.
- `Remote-backup replay slice`: complete. `scripts/milestone/verify-reliability-remote-backup-replay.ts` now replays local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule flow, and the evidence stays aligned across API, CLI, Web backup views, and agent runtime.
- `Confidence-history bundle slice`: complete. `pnpm milestone:verify:confidence` now writes `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md`, and CI restores/saves that bundle across runs before uploading `milestone-confidence-bundle-*` for direct inspection.
- `Confidence-readiness slice`: complete. Persisted history now classifies `local-only`, `building-history`, and `promotion-ready`, tracks qualified readiness runs, and publishes the same summary in the GitHub Actions run page.
- `Confidence-history sync slice`: complete. `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle history from GitHub Actions into local readiness review with deduped entries and the same shared readiness math.
- `Confidence-review-signal slice`: complete. Synced and local confidence summaries now separate `Latest Run` from `Latest Qualified Run` and count visibility-only local versus non-qualified remote noise, so developer review keeps real mainline evidence visible after local reruns.
- `Confidence-progress-page slice`: complete. The docs site now publishes a first-class development-progress page from generated confidence data and surfaces the same live counters on roadmap home.
- `Confidence-review-digest slice`: complete. `pnpm milestone:review:confidence` now compares synced local readiness with the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, separates countdown drift from visibility-only drift, and keeps strict published-countdown failure opt-in.
- `Confidence-review-pack CI slice`: complete. `pnpm milestone:review:promotion-ready -- --skip-sync` now lets `mainline-acceptance` publish the current-run `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` inside `milestone-confidence-bundle-*`.
- `Confidence-review-pack fetch slice`: complete. `pnpm milestone:fetch:review-pack` now stages the uploaded current-run review bundle into `.portmanager/reports/current-ci-review-pack/` and writes `review-pack-manifest.json` for CI-first review.
- `Next lane`: Milestone 3 now opens as bounded `Phase 0 enablement` on top of the same live host / rule / policy slice. Milestone 2 review helpers remain mandatory guardrails: keep `pnpm milestone:review:promotion-ready -- --limit 20` as the default completed-mainline review entrypoint, use `pnpm milestone:fetch:review-pack` when the current CI run is the first question, keep the public development-progress page plus `.portmanager/reports/milestone-wording-review.md` as the wording-truth bundle, and only move the tracked public snapshot through the same helper plus `--refresh-published-artifact` when review agrees. Units 57 through 62 remain landed enablement seams, Unit 63 lands review-packet readiness on top, and Units 64 through 69 now preserve the first complete bounded Debian 12 review packet at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`: guide coverage stays complete, artifact coverage is `20/20`, bootstrap, steady-state, backup-and-restore, diagnostics, and rollback parity are landed, and the earlier Units 63 through 69 queue now collapses into bounded second-target review through `/second-target-policy-pack`. The active Milestone 3 map is now `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` plus `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`, while `/second-target-policy-pack.liveTransportFollowUp` keeps `capture_required`, points at `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`, and names the fresh packet root pattern `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`. The Debian review-prep governance slice still freezes docs contract, acceptance recipe, review-packet template, five proof guides, the live follow-up guide, and ownership sources; the candidate-host create/probe/bootstrap lane plus one bounded live steady-state mutation, one bounded backup operation, one diagnostics run, and one rollback rehearsal stay bounded; and broader target support remains blocked while review remains open.

#### What remains intentionally deferred
- PostgreSQL as the default store
- batch orchestration and fleet management
- broader platform support beyond the first Ubuntu 24.04 target
- turning agent into a browser runtime or shell-orchestrator substitute
- broad productization of C-shaped capabilities before the first trusted slice is real

### Milestone 2: Engineering Reliability

#### Why this milestone exists
Milestone 2 exists to make the `B` validation state trustworthy in repeated real use.
The order is deliberate: PortManager should not broaden scope while backup, rollback, drift visibility, and degraded-state handling are still weak.
This milestone is about survivability, inspectability, and operational confidence rather than adding the most exciting new surfaces.

#### Locked choices
- reliability is treated as first-class product behavior, not merely internal engineering hygiene
- degraded state must become explicit and user-visible rather than inferred away
- backup policy must become an enforceable part of operations, not a soft convention
- GitHub private backup integration is additive safety, not a replacement for required local backup
- stronger rollback UX only matters if rollback evidence remains contract-aligned and auditable

#### Acceptance gate
Milestone 2 is only accepted when all of the following become true:
- degraded state is explicit in Web, CLI, and API rather than hidden behind generic failure text
- backup policy modes such as `best_effort` and `required` are visible and behaviorally meaningful
- drift detection can move a resource into `degraded` without semantic ambiguity
- rollback flows are easier to inspect and execute without weakening evidence trails
- diagnostics, backups, and operations surfaces are materially more complete than the Milestone 1 skeleton

#### Current verified status
- Reliability work has already started on this branch.
- Verified now: backup-policy visibility, drift-driven degraded records, recovery-linked operation summaries, rollback inspection, and richer event history flows in controller and CLI tests.
- Verified now: remote-backup guidance is now explicit across Web, CLI, API, and proof output; backup summaries now publish remote target, setup state, status summary, and operator action instead of only raw `not_configured` state.
- Verified now: configured GitHub backup now uploads controller backup bundles through the GitHub Contents API and reports explicit remote redundancy success/failure state across API, CLI, Web, and `tests/milestone/reliability-github-backup.test.ts`.
- Verified now: repeated remote-backup replay is durable in repo. `scripts/milestone/verify-reliability-remote-backup-replay.ts` plus `tests/milestone/reliability-remote-backup-replay.test.ts` now prove local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule slice while `tests/web/live-controller-shell.test.ts` keeps the Web backup surface aligned.
- Verified now: agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics on the accepted live slice.
- Verified now from the accepted Milestone 1 slice: upstream disconnects that surface as `502` are still treated as transport-level failures rather than controller business-state failures; live unreachable-agent paths now degrade hosts and rules explicitly; controller-side diagnostics promote rules to `active` after real verification.
- Verified now: `pnpm milestone:verify:confidence` now composes the standing `pnpm acceptance:verify` gate with the remote-backup replay proof, and `.github/workflows/mainline-acceptance.yml` now collects that heavier routine on `push main`, `workflow_dispatch`, and the daily scheduled history run.
- Verified now: the canonical routine now writes `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, and `.portmanager/reports/milestone-confidence-summary.md` with CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`, and the confidence workflow restores/saves that bundle before uploading it for developer review.
- Verified now: the persisted confidence history now classifies `local-only`, `building-history`, and `promotion-ready`, measures progress against `7` qualified runs plus `3` consecutive qualified passes from `push`, `workflow_dispatch`, and `schedule` on `refs/heads/main`, and publishes the same summary in the workflow run page for developers.
- Verified now: `pnpm milestone:sync:confidence-history` now lets developers import those completed GitHub Actions bundles back into local readiness review with authenticated `gh`, deduped entries, and the same shared readiness summary.
- Verified now: the synced/local summary now persists `latestQualifiedRun`, shows a visibility breakdown for qualified mainline versus visibility-only noise, and keeps the latest mainline evidence readable even when newer local runs exist.
- Verified now: the docs site now publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress` from generated milestone confidence data, and roadmap home previews the same readiness snapshot for public developer review.
- Verified now: `mainline-acceptance` confidence collection now runs `pnpm milestone:review:promotion-ready -- --skip-sync`, so the uploaded `milestone-confidence-bundle-*` also carries `.portmanager/reports/milestone-confidence-review.md` plus `.portmanager/reports/milestone-wording-review.md` for the current run.
- Fresh promotion-ready publication refresh on `2026-04-21`: after pulling the latest `main`, `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` synced completed `mainline-acceptance` runs through authenticated `gh`, wrote the review digest, and republished the tracked docs artifact from the same completed workflow evidence. Exact live counters and the latest qualified run still live on the generated development-progress page and tracked confidence artifact, while this roadmap spec keeps the broader threshold-met conclusion stable.
- Fresh runtime-transition proof on `2026-04-20`: forcing GitHub workflow JavaScript actions onto Node 24 did not break `mainline-acceptance` or `docs-pages`; the remaining Node 20 deprecation annotations now come from GitHub official action metadata rather than repo-local workflow drift.
- Deep compare against the completed `2026-04-16` reconciliation plan now shows that the old parity, steady-state delivery, and proof-orchestration gaps are closed; the remaining architecture gap is now the explicit Milestone 3 seams that Scheme C still requires rather than invention of more reporting surfaces or review-signal repair.
- Milestone 2 remains an active guardrail lane while human milestone-language review deliberately keeps public wording honest on top of the now promotion-ready evidence. That guardrail no longer blocks Milestone 3 Phase 0 enablement; it is the proof discipline Milestone 3 must keep.

#### Reliability sequencing rule
- Milestone 2 work should continue only on top of the same host/rule/policy public model that closes Milestone 1.
- The Unit 0 acceptance gate stays mandatory, but it is now protecting a completed Unit 1 through Unit 5 base rather than standing in for missing parity work.
- Reliability status can move only after live Web, CLI, API, and agent evidence keep telling the same story across repeated proof runs.

#### What remains intentionally deferred
- full broad-platform support
- generic orchestration across many heterogeneous host classes
- mandatory PostgreSQL migration before real concurrency and reliability pressure exists
- rewriting the product around future C concerns before reliability is actually earned

### Milestone 3: Toward C

#### What C means
`C` is not “more features.”
It specifically means moving toward **Scheme C: Agent-First Distributed Platform**.
In that scheme:
- controller, agent, event stream, policy layer, and audit layer are split from the beginning
- UI, CLI, and automation interfaces all face an API gateway rather than speaking to ad-hoc local surfaces
- the remote agent becomes a true first-class actor in the architecture

The attraction of C is architectural completeness and long-term extensibility.
The danger of C is equally real: at empty-repository time, it can spend too much effort on infrastructure shape before PortManager has earned its first reliable value slice.

#### Current verified entry signal
Milestone 3 can now begin as a bounded execution phase because all of the following are already true:
- the `B` validation state is credible enough that Milestone 3 no longer needs to stay purely theoretical
- backup, rollback, degraded handling, and public review surfaces are already protected by the same accepted live slice
- shared contracts already govern Web, controller, CLI, agent, and docs-site publication surfaces
- minimal agent-service migration is complete enough that the product no longer revolves around shell-only behavior

#### Deep compare against current code

| Scheme C expectation | Current verified state | Gap classification |
| --- | --- | --- |
| Gateway-ready consumer boundary | Controller now serves a consumer-prefixed `/api/controller` boundary while keeping legacy direct routes compatible; Web preserves prefixed base URLs and CLI accepts `PORTMANAGER_CONSUMER_BASE_URL`, even though no separate gateway app exists yet | Phase 0 baseline landed |
| Explicit controller / policy / event / audit separation | `controller-read-model`, `controller-domain-service`, `/event-audit-index`, and the persistence adapter now extract the first read/write seams, even though transport and persistence still centralize too much work | Phase 0 baseline landed |
| First-class bounded remote agent | Live agent service boundary already exists with `/health`, `/runtime-state`, `/apply`, `/snapshot`, `/rollback` | Partially earned |
| Batch host management | One bounded batch exposure-policy envelope now lands as an auditable parent operation with host-scoped child outcomes across controller, CLI, and Web | Phase 0 baseline landed |
| Persistence readiness beyond SQLite | `operation-store` now runs behind a SQLite-backed persistence adapter seam, publishes measurable PostgreSQL readiness pressure from live store counts, and now exposes an explicit `/persistence-decision-pack` review surface with next actions while SQLite stays active | Phase 0 baseline landed |
| Platform abstraction for additional targets | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started |

#### Milestone 3 Phase 0 continuation workstreams
- keep the landed `/api/controller` consumer boundary stable while defining future split criteria
- Unit 57: complete. one explicit `audit-review-service` owner now sits behind `/events`, `/operations/events`, and `/event-audit-index` while preserving legacy and consumer-prefixed route compatibility
- Unit 58: complete. explicit target-profile registry and target-abstraction rules now publish the locked Ubuntu 24.04 + systemd + Tailscale contract before second-target claims
- Unit 59: complete. persistence promotion decision surface now turns landed readiness metrics into an explicit `/persistence-decision-pack` review surface with next actions while SQLite stays active
- Unit 60: complete. consumer-boundary split criteria now ship as `/consumer-boundary-decision-pack`, keeping `/api/controller` embedded until standalone deployment boundary, edge-policy ownership, and external consumer pressure become real.
- Unit 61: complete. deployment-boundary decision pack now ships as `/deployment-boundary-decision-pack`, keeping `/api/controller` controller-embedded until deployable artifact, edge runtime controls, replay parity, observability ownership, and external pressure justify standalone deployment review.
- Unit 62: complete. second-target policy pack now ships as `/second-target-policy-pack`, keeping support locked to Ubuntu until candidate-target declaration, parity evidence, docs contract, acceptance recipe, and operator ownership justify review.
- Next queue: keep the landed consumer boundary, consumer-boundary decision pack, deployment-boundary decision pack, second-target policy pack, audit-review boundary, target-profile registry, persistence decision pack, and Debian review-prep governance docs stable while the preserved Units 64-69 review packet at `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` drives bounded second-target review for declared candidate `debian-12-systemd-tailscale` under `/second-target-policy-pack`
- continue using the same bounded batch-operation envelope and evidence model rather than inventing a second orchestration path

#### Guardrails that still stay in force
- keep `pnpm acceptance:verify` green
- keep `pnpm milestone:verify:confidence` green
- keep `pnpm milestone:review:promotion-ready -- --limit 20` and `.portmanager/reports/milestone-wording-review.md` as the wording-truth bundle
- do not create a second evidence model while opening Milestone 3
- do not weaken backup, rollback, degraded, or contract governance semantics in the name of distribution

#### Explicit non-goals for C
- C is not a pivot to arbitrary shell orchestration as the operating model
- C is not an excuse to become a generic MDM platform in one jump
- C is not a requirement to rewrite everything into one language for ideological purity
- C is not simultaneous support for every platform before support boundaries are explicit
- C is not permission to weaken contract review discipline in the name of speed
- C is not permission to claim a gateway, split audit service, fleet orchestration, PostgreSQL default, or broader platform support before those seams are real

## 中文

### 路线排序规则
- 在扩展实现广度之前，先冻结契约、设计基线与发布规则。
- 在扩展可靠性或平台范围之前，先证明一条可信的最小运行切片。
- 可靠性工作优先于平台广度，因为不稳定的多主机扩展只会放大歧义。
- `Toward C` 不是一个占位口号，而是一个需要通过 `B` 验证状态“挣出来”的阶段。

### A / B / C 递进模型
- `A`：docs-first 基线。契约、设计基线、路由契约、安装契约与发布规则都已经冻结且可评审。
- `B`：可信验证状态。PortManager 端到端证明一条真实控制平面切片：one host、one rule、one rollback，并且完成当前 agent-service 设置与能力的最小迁移，不再停留在纸面方案。
- `C`：更广的平台状态。PortManager 从狭义的单主机 bridge 控制平面，成长为同时服务人类与 agent consumer 的更通用 terminal-side 管理基座，同时仍然保持 contract-first 治理。

### 里程碑 1：One Host, One Rule, One Rollback

#### 为什么需要这个里程碑
里程碑 1 必须刻意保持狭窄。
它的职责是证明 PortManager 是一个真实控制平面，而不是一组文档、shell 胶水、截图和未来承诺的组合。
这里也是 `B` 验证状态开始形成的地方：把当前 agent-service 行为最小且可信地迁移进新的控制平面模型。

#### 已锁定选择
- 服务拆分：`controller API + React SPA web`
- 执行层：`Rust CLI + Rust agent`
- `SQLite` 作为 V1 默认状态库
- `OpenAPI + JSON Schema + codegen` 作为公共契约基础
- 使用 controller-side 快照与诊断，而不是 agent-side 浏览器抓取
- bootstrap / rescue 走 SSH，稳态通信走 `HTTP over Tailscale`

#### 验收门槛
只有当以下条件全部满足时，里程碑 1 才算成立：
- 一台主机可以从 `draft` 进入 `ready`
- 一条 bridge rule 可以从 `desired` 进入 `active`
- destructive mutation 前总能先完成必需的本地备份
- 失败会留下 operation 记录与可用 rollback point
- diagnostics 同时产出机器可读结果与网页快照产物
- Web、CLI 与 API 对 host、rule、operation 与 degraded 状态的观察一致

#### 当前已验证状态
- Milestone 1 的公共表面验收已经在 `2026-04-17` 闭环。
- 当前已验证：变更前备份、回滚证据、诊断抓取、drift 驱动 degraded 状态、筛选后的 operation 历史、事件回放，以及 controller/CLI 对 operations、backups、diagnostics、health checks、rollback points 的检查表面。
- Unit 1 当前已验证：controller-backed 的 `/hosts`、`/hosts/{hostId}`、`/hosts/{hostId}/probe`、`/hosts/{hostId}/bootstrap`、`/bridge-rules`、`/bridge-rules/{ruleId}`，以及 `GET/PUT /exposure-policies/{hostId}` 现在都已真实存在；destructive rule mutation 也会在状态变更前保留 backup 与 rollback 证据。
- Unit 2 当前已验证：CLI 的 `hosts`、`bridge-rules`、`exposure-policies` 读写流已经与 controller 资源对齐，并继续沿用现有 `--json` 与等待轮询约定；`crates/portmanager-cli/tests/host_rule_policy_cli.rs` 已证明这组公共命令表面。
- Unit 3 当前已验证：Web 已经在锁定的信息架构上渲染 live controller-backed 的 overview、host detail、hosts、bridge rules、operations、backups、console 与 diagnostics detail。
- Unit 4 当前已验证：agent 已经提供稳态 controller-agent `HTTP over Tailscale` 服务边界，controller 会通过这条边界推送 desired state，并在 agent 不可达时显式把 host / rule 置为 degraded。
- `2026-04-17` 的最新验收证据已经成立：Unit 4 交付与 Unit 5 文档同步之后，`pnpm acceptance:verify` 已重新转绿；其中内嵌的 milestone proof 现在已经证明 host `draft -> ready`、bridge rule `desired -> active`、live agent HTTP bootstrap/apply/runtime collection，以及 backup / rollback 证据保持不变。
- `2026-04-18` 的 Windows 真机验收也已经成立：最新 `main` 上的 `pnpm acceptance:verify` 再次通过，而且 development-progress docs 校验现在已经在本地 `.portmanager` 历史缺失时尊重已提交的 generated confidence fallback，使全新机器的 gate 行为与 docs 发布契约保持一致。
- `2026-04-18` 还继续补齐了一层 acceptance 加固：当被忽略的本地 `.portmanager` 历史比已提交 docs-site progress data 更新时，这条 development-progress docs 校验也会继续保持稳定，因此 acceptance 不再依赖本地隐藏状态是否“刚好够新”，除非开发者明确重跑 docs 生成。
- `2026-04-21` 的 promotion-ready 维护检查点也已经成立：本地 `corepack pnpm acceptance:verify` 继续通过，最新同步的 `mainline-acceptance` 证据已经推进到 run `24707884501`，这次刷新前最近一次已发布 `docs-pages` 证明仍保持在 run `24707884469` 且健康，被跟踪的 confidence-progress artifact 现在也已经在发布前被有意刷新到最新评审过的 `23/7` promotion-ready 快照。因此当前剩余工作已经收窄为发布刷新维护，而不是新的 readiness 脚手架。
- controller 侧规则真相会在 diagnostics 之后进入 `active`，而原始 agent runtime 在验证完成前仍保持 `applied_unverified`。这已经是有意保留的已交付语义，不再是里程碑 1 缺口。

#### 当前推进顺序
- `Unit 0`：已经完成并且必须保持；在后续单元推进时持续维持 gate 为绿，但不要再把 gate 工作当成当前里程碑闭环目标。
- `Unit 1`：已完成。controller 的 `hosts`、`bridge-rules`、`exposure-policies` 已接入共享 store / runner，并包含 host lifecycle 与带备份证据的 rule mutation。
- `Unit 2`：已完成。CLI 已补齐这些同名资源，让 controller 与 CLI 共享同一套可信公共表面。
- `Unit 3`：已完成。Web 现在已经在 overview、host detail、hosts、bridge rules、operations、backups、console 中渲染 controller-backed 视图与 diagnostics detail。
- `Unit 4`：已完成。agent 现在已经在不破坏当前产物兼容性的前提下，接入最小 `HTTP over Tailscale` 稳态服务边界。
- `Unit 5`：已完成。`pnpm acceptance:verify` 已重放通过，roadmap 与产品文档已同步，里程碑 1 文案只在证明链保持为绿之后才被提升。
- `Heartbeat/version 切片`：已完成。agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在共享 `agentVersion` 以及 `live` / `stale` / `unreachable` heartbeat 语义。
- `Diagnostics-history 切片`：已完成。controller `GET /diagnostics` 现在支持 `state` 过滤，Web host detail 也已经在同一条 live host / rule / policy 切片上分组展示最新诊断、degraded diagnostics history 与 recovery-ready 成功证据。
- `GitHub-backup 切片`：已完成。当配置存在时，controller backup bundle 现在会通过 GitHub Contents API 上传，required-mode 成功/失败路径也已经在 API、CLI、Web 与专门的可靠性证明里保持显式一致。
- `Remote-backup replay 切片`：已完成。`scripts/milestone/verify-reliability-remote-backup-replay.ts` 现在会在同一条 live agent-backed host / rule 流程上重放 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 证据保持对齐。
- `Confidence readiness 切片`：已完成。持久 history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，记录当前 run 是否真正属于 readiness 推进资格范围，并把同一份 summary 发布到 GitHub Actions workflow 页面。
- `Confidence history sync 切片`：已完成。`pnpm milestone:sync:confidence-history` 现在会把 GitHub Actions 已完成 `mainline-acceptance` bundle history 导回本地 readiness review，并用同一套 readiness 计算逻辑与去重规则重建本地 summary。
- `Confidence review-signal 切片`：已完成。同步后与本地 confidence summary 现在会把 `Latest Run` 与 `Latest Qualified Run` 分开显示，并统计本地 visibility-only 与非 qualified 远端噪声，让开发者在本地 rerun 之后仍然能看见真实主线证据。
- `Confidence progress page 切片`：已完成。docs-site 现在会从生成后的 confidence 数据发布一级开发者进度页，并在 roadmap 首页显示相同的 live 计数。
- `Confidence review digest 切片`：已完成。`pnpm milestone:review:confidence` 现在会把同步后的本地 readiness 与已跟踪公开 progress artifact 直接对比，写出 `.portmanager/reports/milestone-confidence-review.md`，区分 countdown 漂移与 visibility-only 漂移，并把严格公开倒计时检查保持为显式可选。
- `Confidence review-pack CI 切片`：已完成。`pnpm milestone:review:promotion-ready -- --skip-sync` 现在会让 `mainline-acceptance` 把当前 run 的 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md` 直接上传进 `milestone-confidence-bundle-*`，供开发者查看当前 run。
- `Confidence review-pack fetch 切片`：已完成。`pnpm milestone:fetch:review-pack` 现在会把上传后的 current-run review bundle 落到 `.portmanager/reports/current-ci-review-pack/`，并写出 `review-pack-manifest.json`，让开发者用 repo-native 路径复核当前 CI run。
- `下一主线`：Milestone 3 现在已经作为有边界的 `Phase 0 enablement` 打开，但仍然建立在同一条 live host / rule / policy 切片上。Milestone 2 的 review helper 继续保留为 guardrail：把 `pnpm milestone:review:promotion-ready -- --limit 20` 作为 completed-mainline 之后的默认复核入口；如果第一问题是当前 CI run，就先执行 `pnpm milestone:fetch:review-pack` 并读取 `.portmanager/reports/current-ci-review-pack/`；继续把公开 development-progress 页面、`.portmanager/reports/milestone-wording-review.md` 与验证报告当作文案真相包；只在人工复核同意时通过同一条 helper 加上 `--refresh-published-artifact` 推进公开快照。Unit 57 到 Unit 62 继续作为已落地 seam 保持稳定，Unit 63 已经把 review-packet readiness 接到 `/second-target-policy-pack`，而 Units 64 到 69 现在又把第一份完整有边界 Debian 12 review packet 保留到 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`：guide coverage 已完整、artifact coverage 来到 `20/20`、bootstrap、steady-state、backup-and-restore、diagnostics 与 rollback parity 已落地，而此前公开的 Units 63 through 69 队列也已经收敛为有边界 second-target review。当前激活的 Milestone 3 地图已经切到 `docs/brainstorms/2026-04-21-portmanager-m3-live-tailscale-follow-up-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-tailscale-follow-up-plan.md`，同时 `/second-target-policy-pack.liveTransportFollowUp` 会继续保持 `capture_required`、指向 `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`，并把新的 packet 根目录模式固定为 `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`。Debian review-prep 治理切片继续冻结文档契约、验收 recipe、review-packet template、五份 proof 指南、live follow-up guide 与 ownership 来源；candidate host 注册、probe、bootstrap review-prep lane 继续保持有边界，并额外允许一条有边界 live steady-state mutation、一条有边界 backup operation、一条 diagnostics run 与一条 rollback rehearsal；同时继续把锁定 target-profile registry、consumer-boundary decision pack、deployment-boundary decision pack、second-target policy pack 与 persistence decision pack 保持为真实平台契约。

#### 明确延后的内容
- PostgreSQL 作为默认状态库
- 批量编排与 fleet 管理
- 超出首个 Ubuntu 24.04 目标之外的广平台支持
- 让 agent 变成浏览器运行时或 shell 编排替身
- 在第一条可信切片真实存在之前，过早产品化所有 C 形态能力

### 里程碑 2：Engineering Reliability

#### 为什么需要这个里程碑
里程碑 2 的职责，是让 `B` 验证状态在反复真实使用中值得信任。
顺序是刻意的：当 backup、rollback、drift 可见性与 degraded 处理还很弱时，不应该先扩展范围。
这个里程碑的重点是 survivability、inspectability 与 operational confidence，而不是最“好看”的新表面。

#### 已锁定选择
- 可靠性被视为一等产品行为，而不只是内部工程 hygiene
- degraded 状态必须显式、可见，而不是被隐式吞掉
- backup policy 必须成为 operation 行为的一部分，而不是软约定
- GitHub 私有备份接入是附加安全层，不能替代必需的本地备份
- rollback UX 只有在证据链仍然可审计、与契约对齐时才有意义

#### 验收门槛
只有当以下条件全部满足时，里程碑 2 才算成立：
- degraded 状态在 Web、CLI 与 API 中显式存在，而不是被泛化失败文案掩盖
- `best_effort` / `required` 等备份策略既可见又真正影响行为
- drift detection 能在无语义歧义的情况下把资源推进 `degraded`
- rollback 更容易检查与执行，但不会削弱证据轨迹
- diagnostics、backups 与 operations 页面相较于里程碑 1 骨架有实质补全

#### 当前已验证状态
- 可靠性工作已经在当前分支启动。
- 当前已验证：backup policy 可见性、drift 驱动 degraded 记录、带 recovery 关联的 operation 摘要、rollback 检查能力，以及更丰富的 controller/CLI 事件历史流。
- 当前已验证：远端备份提示现在已经在 Web、CLI、API 与 proof 输出中显式可见；backup 摘要不再只暴露原始 `not_configured`，而是会同时给出远端目标、配置状态、状态摘要与操作者动作。
- 当前已验证：当 GitHub backup 已配置时，controller 现在会通过 GitHub Contents API 上传 backup bundle，并在 API、CLI、Web 与 `tests/milestone/reliability-github-backup.test.ts` 中显式暴露远端冗余成功/失败状态。
- 当前已验证：repo 里已经存在可重复执行的 remote-backup replay 证明。`scripts/milestone/verify-reliability-remote-backup-replay.ts` 与 `tests/milestone/reliability-remote-backup-replay.test.ts` 现在会在同一条 live agent-backed host / rule 切片上证明 local-only、configured-success、configured-failure 三类 required backup，而 `tests/web/live-controller-shell.test.ts` 则继续把 Web backup 表面对齐到同一套证据。
- 当前已验证：agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在已经会在同一条 live 切片上统一发布 `agentVersion` 与 `live` / `stale` / `unreachable` heartbeat 语义。
- 已被接受的 Milestone 1 切片进一步证明：即使上游断连在本机上表现为 `502`，CLI 仍将其明确归类为 transport 级故障，而不是 controller 业务错误；live unreachable-agent 路径现在也会显式把 host / rule 置为 degraded；controller-side diagnostics 还会在真实验证后把规则提升到 `active`。
- 当前已验证：`pnpm milestone:verify:confidence` 现在已经把既有 `pnpm acceptance:verify` gate 与 remote-backup replay proof 收敛成一条规范 routine，`.github/workflows/mainline-acceptance.yml` 也会在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上收集这条更重的 routine。
- 当前已验证：规范 routine 现在还会写出 `.portmanager/reports/milestone-confidence-report.json`、`.portmanager/reports/milestone-confidence-history.json` 与 `.portmanager/reports/milestone-confidence-summary.md`，并附带 `eventName`、`ref`、`sha`、`runId`、`runAttempt`、`workflow` 等 CI traceability 字段；confidence workflow 也会先恢复并保存这组 bundle，再上传给开发者核对。
- 当前已验证：持久 confidence history 现在会区分 `local-only`、`building-history`、`promotion-ready` 三种 readiness 状态，按照 `push`、`workflow_dispatch`、`schedule` on `refs/heads/main` 的 `7` 次 qualified run 加 `3` 次连续 qualified pass 统计推进进度，并把同一份 summary 直接发布到 workflow 页面给开发者查看。
- 当前已验证：`pnpm milestone:sync:confidence-history` 现在允许开发者通过已认证 `gh` 把这些已完成 workflow bundle 导回本地 readiness review，并按稳定 history entry id 去重。
- 当前已验证：docs-site 现在会从生成后的 milestone confidence 数据公开发布 `/en/roadmap/development-progress` 与 `/zh/roadmap/development-progress`，roadmap 首页也会直接预览同一份 readiness 快照，方便开发者公开复核。
- 当前已验证：`mainline-acceptance` 的 confidence collection 现在会执行 `pnpm milestone:review:promotion-ready -- --skip-sync`，因此上传的 `milestone-confidence-bundle-*` 也会带上 `.portmanager/reports/milestone-confidence-review.md` 与 `.portmanager/reports/milestone-wording-review.md`，供开发者直接查看当前 run。
- `2026-04-21` 的最新 promotion-ready 开发者复核刷新也已经成立：拉取最新 `main` 之后，`pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` 已通过已认证 `gh` 同步 completed `mainline-acceptance` 运行、写出 review digest，并把被跟踪 docs 产物刷新到同一份已完成 workflow 证据；精确实时计数与最新 qualified run 改由 development-progress 页面与被跟踪 confidence artifact 发布，而这份 roadmap spec 保留更稳定的 threshold-met 结论。
- `2026-04-20` 的运行时迁移证明也已经成立：在把 GitHub workflow JavaScript actions 强制运行到 Node 24 之后，`mainline-acceptance` 与 `docs-pages` 仍然保持通过；当前剩余的 Node 20 退役 annotation 现在已经收敛为 GitHub 官方 action 元数据层面的上游 warning，而不是 repo 本地 workflow 漂移。
- 深度对比已经完成的 `2026-04-16` reconciliation plan 之后，现在可以确认：旧的表面一致性、稳态边界与证明编排缺口都已闭环；剩余架构缺口已经不再是继续补报告脚手架或继续修复 summary 复核语义，而是持续积累 qualified 绿历史，并根据同步后的证据与人工复核来决定文案是否继续收窄。
- 里程碑 2 现在仍然是必须保持的 guardrail 主线，但它已经不再阻塞 Milestone 3 Phase 0 enablement。当前阶段的职责，是继续基于 promotion-ready 证据保持人工文案复核与 gate 健康，让 Milestone 3 的启动仍然站在同一套证明纪律上。

#### 可靠性推进规则
- 里程碑 2 的推进必须建立在同一套 host/rule/policy 公共模型之上，而不是绕过里程碑 1 缺口。
- Unit 0 验收 gate 仍然必须保持，但它现在保护的是已经完成的 Unit 1 到 Unit 5 基座，而不再是拿来替代缺失的一致性工作。
- 只有当 live Web、CLI、API 与 agent 证据能够在多次重放中持续讲同一个故事时，可靠性状态才有资格继续提升。

#### 明确延后的内容
- 完整的广平台支持
- 跨多种异构主机类型的通用编排
- 在真实并发和可靠性压力出现前，把 PostgreSQL 迁移硬塞进默认路径
- 在可靠性尚未真正建立前，过早围绕 C 进行产品重心重排

### 里程碑 3：Toward C

#### C 代表什么
`C` 不是“更多功能”。
它更具体地指向 **方案 C：Agent-First Distributed Platform**。
在这套方案里：
- 从一开始就把 controller、agent、event stream、policy layer、audit layer 拆开
- UI、CLI、自动化接口统一面对 API gateway，而不是依赖临时本地表面
- 远端 agent 成为真正的一等架构参与者

C 的吸引力，在于架构完整性和长期扩展性。
但它的风险也同样明确：在空仓库起步阶段，很容易把时间消耗在基础设施形状上，而不是先把 PortManager 的第一条可靠价值链路做出来。

#### 当前已验证的进入信号
Milestone 3 现在已经可以作为有边界的执行阶段启动，因为下面这些条件都已经成立：
- `B` 验证状态已经足够可信，不再需要把 Milestone 3 纯粹停留在纸面上
- backup、rollback、degraded 处理与公共 review surface 已经被同一条 accepted live slice 保护住
- Web、controller、CLI、agent 与 docs-site 发布表面都已经受共享契约治理
- 最小 agent-service 迁移已经足够完成，产品不再围绕 shell-only 行为打转

#### 对照当前代码的深度比较

| Scheme C 预期 | 当前已验证状态 | 缺口分类 |
| --- | --- | --- |
| gateway-ready 的 consumer boundary | controller 现在会公开带 consumer prefix 的 `/api/controller` 边界，同时继续兼容旧的直连路由；Web 已经保持 prefix base URL 不丢失，CLI 也已经支持 `PORTMANAGER_CONSUMER_BASE_URL`，只是仍然没有独立 gateway app | Phase 0 baseline 已落地 |
| 显式 controller / policy / event / audit 分层 | `controller-read-model`、`controller-domain-service` 与 `/event-audit-index` 已经抽出第一批读写 seam，虽然 transport 与 persistence 仍然集中太多职责 | Phase 0 baseline 已落地 |
| 一等但有边界的远端 agent | live agent service boundary 已经存在，并提供 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback` | 部分达成 |
| 批量主机管理 | 一个有边界的 batch exposure-policy envelope 现在已经落地：controller、CLI 与 Web 都可以围绕同一个 parent operation 与 host-scoped child outcome 复核批量结果 | Phase 0 baseline 已落地 |
| 超出 SQLite 的持久化就绪度 | `operation-store` 现在已经运行在 SQLite-backed persistence adapter seam 后面，会从真实 store 计数发布可度量的 PostgreSQL readiness pressure，并额外公开带 next action 的 `/persistence-decision-pack` 复核表面，同时继续让 SQLite 保持 active | Phase 0 baseline 已落地 |
| 面向更多目标画像的平台抽象 | Ubuntu 24.04 + systemd + Tailscale 仍然是唯一可信目标 | 尚未开始 |

#### Milestone 3 Phase 0 后续工作流
- 保持已落地的 `/api/controller` consumer boundary 稳定，同时定义未来 split criteria
- Unit 57：建立在 `/events` 与 `/event-audit-index` 之上的独立 audit/event boundary 决策
- Unit 58：已完成。显式 target-profile registry 与 target-abstraction rule 现在已经在 controller、CLI 与 Web 中发布锁定的 Ubuntu 24.04 + systemd + Tailscale 契约，并在第二目标画像出现前拒绝扩大支持声明
- Unit 59：已完成。建立在已落地 readiness metrics 之上的 persistence promotion decision surface 现在已经通过 `/persistence-decision-pack` 公开显式 next action，同时继续让 SQLite 保持 active
- Unit 60：已完成。consumer-boundary split criteria 现在已经通过 `/consumer-boundary-decision-pack` 公开，明确只有在独立部署边界、edge policy ownership 与 external consumer pressure 全部真实出现后，`/api/controller` 才需要进入 split review。
- Unit 61：已完成。deployment-boundary decision pack 现在已经通过 `/deployment-boundary-decision-pack` 公开，明确只有在 deployable artifact、edge runtime controls、replay parity、observability ownership 与 external pressure 全部真实出现后，`/api/controller` 才需要进入独立部署复核。
- Unit 62：已完成。second-target policy pack 现在已经通过 `/second-target-policy-pack` 公开，明确只有在候选第二目标声明、等价证据、文档契约、验收 recipe 与 operator ownership 全部真实出现后，支持声明才能超出 Ubuntu 锁定画像。
- 下一批队列：继续把已落地的 consumer boundary、consumer-boundary decision pack、deployment-boundary decision pack、second-target policy pack、audit-review boundary、target-profile registry 与 persistence decision pack 保持稳定，同时让已保留的 Unit 64-69 review packet `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/` 支撑已声明候选 `debian-12-systemd-tailscale` 的有边界 second-target review
- 继续复用同一套 bounded batch-operation envelope 与 evidence model，而不是长出第二条 orchestration 路径

#### 仍然必须保持的 guardrail
- 继续让 `pnpm acceptance:verify` 转绿
- 继续让 `pnpm milestone:verify:confidence` 转绿
- 继续把 `pnpm milestone:review:promotion-ready -- --limit 20` 与 `.portmanager/reports/milestone-wording-review.md` 当作文案真相包
- 在 Milestone 3 开始时，不允许长出第二套 evidence model
- 不允许以“分布式”为名削弱 backup、rollback、degraded 或 contract governance 语义

#### C 的明确非目标
- C 不是把任意 shell 编排升格为产品运行模型
- C 不是一步跳成通用 MDM 平台的借口
- C 不是出于语言洁癖而要求把一切重写成单一语言
- C 不是在支持边界尚未明确前就同时支持所有平台
- C 不是以“速度”为名削弱契约评审纪律的许可
- C 也不是在 gateway、audit service、fleet orchestration、PostgreSQL default 或更广平台支持还没真实存在前，就提前对外宣称这些能力

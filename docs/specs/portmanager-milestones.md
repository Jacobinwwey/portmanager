# PortManager Milestones

Updated: 2026-04-18
Version: v0.5.10-real-machine-acceptance-sync

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
- `Next lane`: Milestone 2 confidence-readiness maintenance on the same live host / rule / policy slice by reviewing the synced summary's latest-qualified signal and public development-progress page, keeping qualified history green, and narrowing milestone wording only when the evidence justifies it.

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
- Fresh real-machine developer-review proof on `2026-04-18`: `pnpm milestone:verify:confidence` passed on Windows, `pnpm milestone:sync:confidence-history -- --limit 20` imported one qualified `mainline-acceptance` run through authenticated `gh`, and the synced summary now truthfully reports `building-history` with `1/7` qualified runs and `1/3` qualified consecutive passes.
- Deep compare against the completed `2026-04-16` reconciliation plan now shows that the old parity, steady-state delivery, and proof-orchestration gaps are closed; the remaining architecture gap is now sustained qualified green history and milestone-language review rather than invention of more reporting surfaces or review-signal repair.
- Milestone 2 still remains in progress until the qualified history stays green long enough for the synced readiness evidence and human review to justify narrower reliability language.

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

#### Why C is not Milestone 1 or Milestone 2
- If Milestone 1 is not real, C is only architecture theater.
- If Milestone 2 is not real, C only multiplies unreliability across more hosts and more surfaces.
- C must therefore build on a trusted `B` state plus explicit reliability work, rather than skipping those gates.
- C is retained as a later direction precisely because its upside is strategic, while its downside at V1 time is over-design and delayed practical delivery.

#### Entry gate into C
Milestone 3 can only begin as a real execution phase when all of the following are true:
- the `B` validation state is trusted in real use
- backup, rollback, and degraded handling are stable enough that scope expansion does not erase accountability
- shared contracts are already governing Web, controller, CLI, agent, and SDK-facing shapes
- minimal agent-service migration has proven the product can absorb existing behavior without losing control-plane semantics

#### Locked C workstreams
- stronger agent reporting and event semantics
- batch host management and bounded orchestration primitives
- PostgreSQL migration or migration-readiness once SQLite becomes a real concurrency or reliability constraint
- broader platform abstraction, but still through explicit supported-target layers
- preparation for macOS, mobile, wider Linux, Windows remote, and more general consumer surfaces only after the abstraction layer is credible
- progressive movement toward the Agent-First Distributed Platform shape only after the value-delivery and robustness gates have already been earned

#### Explicit non-goals for C
- C is not a pivot to arbitrary shell orchestration as the operating model
- C is not an excuse to become a generic MDM platform in one jump
- C is not a requirement to rewrite everything into one language for ideological purity
- C is not simultaneous support for every platform before support boundaries are explicit
- C is not permission to weaken contract review discipline in the name of speed
- C is not the right starting posture for an empty-repository V1 that is supposed to prove practical robustness quickly

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
- `下一主线`：继续在同一条 live host / rule / policy 切片上推进 Milestone 2 的 confidence-readiness 加固：复核同步后 summary 的 latest-qualified 信号和公开 development-progress 页面、把 qualified history 持续转绿，并且只在证据足够时收窄里程碑文案。

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
- `2026-04-18` 的真机开发者复核证据也已经成立：`pnpm milestone:verify:confidence` 已在 Windows 真机通过，`pnpm milestone:sync:confidence-history -- --limit 20` 也已通过已认证 `gh` 成功导入 1 次 qualified `mainline-acceptance` 运行；同步后的 summary 现在真实显示 readiness 仍为 `building-history`，进度为 `1/7` qualified runs 与 `1/3` qualified consecutive passes。
- 深度对比已经完成的 `2026-04-16` reconciliation plan 之后，现在可以确认：旧的表面一致性、稳态边界与证明编排缺口都已闭环；剩余架构缺口已经不再是继续补报告脚手架或继续修复 summary 复核语义，而是持续积累 qualified 绿历史，并根据同步后的证据与人工复核来决定文案是否继续收窄。
- 里程碑 2 仍然处于进行中，直到同步后的 readiness 证据与人工复核共同支持更收敛的可靠性文案。

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

#### 为什么 C 不是里程碑 1 或 2
- 如果里程碑 1 不真实，C 就只是架构表演。
- 如果里程碑 2 不真实，C 只会把不可靠性复制到更多主机和更多界面。
- 所以 C 必须建立在可信 `B` 状态和显式可靠性工作之后，而不是跳过这些门槛。
- 之所以把 C 留在后面，就是因为它的上限是战略性的，而它在 V1 阶段的下限则是明显过度设计与价值交付延迟。

#### 进入 C 的前置门槛
只有当以下条件都成立时，里程碑 3 才能从口号变成真实执行阶段：
- `B` 验证状态已经在真实使用中被证明可信
- backup、rollback 与 degraded 处理已经足够稳定，不会在扩展范围时抹掉责任边界
- Web、controller、CLI、agent 与 SDK-facing 结构都已经受共享契约治理
- 最小 agent-service 迁移已经证明产品可以吸收现有行为，同时不丢失控制平面语义

#### C 中锁定的工作流
- 更强的 agent reporting 与 event semantics
- 批量主机管理与有边界的 orchestration primitive
- 当 SQLite 真正成为并发或可靠性瓶颈后，再推进 PostgreSQL 迁移或迁移就绪工作
- 更广的平台抽象，但仍然通过明确支持目标层推进
- 只有当抽象层可信之后，才为 macOS、移动端、更广 Linux、Windows 远端以及更通用 consumer surface 做准备
- 只有在价值交付与鲁棒性门槛已经达标之后，才逐步朝 Agent-First Distributed Platform 形态演进

#### C 的明确非目标
- C 不是把任意 shell 编排升格为产品运行模型
- C 不是一步跳成通用 MDM 平台的借口
- C 不是出于语言洁癖而要求把一切重写成单一语言
- C 不是在支持边界尚未明确前就同时支持所有平台
- C 不是以“速度”为名削弱契约评审纪律的许可
- C 不是空仓库 V1 的正确起手姿态，因为那会直接削弱你最看重的“实践与鲁棒性落地”

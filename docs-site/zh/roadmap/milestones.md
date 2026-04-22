---
title: "里程碑"
audience: shared
persona:
  - contributor
  - admin
  - operator
section: roadmap
sourcePath: "docs/specs/portmanager-milestones.md"
status: active
---
> 真源文档：`docs/specs/portmanager-milestones.md`
> Audience：`shared` | Section：`roadmap` | Status：`active`
> Updated：2026-04-21 | Version：v0.6.0-m3-phase0-enablement
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
- `下一主线`：Milestone 3 现在已经作为有边界的 `Phase 0 enablement` 打开，但仍然建立在同一条 live host / rule / policy 切片上。Milestone 2 的 review helper 继续保留为 guardrail：把 `pnpm milestone:review:promotion-ready -- --limit 20` 作为 completed-mainline 之后的默认复核入口；如果第一问题是当前 CI run，就先执行 `pnpm milestone:fetch:review-pack` 并读取 `.portmanager/reports/current-ci-review-pack/`；继续把公开 development-progress 页面、`.portmanager/reports/milestone-wording-review.md` 与验证报告当作文案真相包；只在人工复核同意时通过同一条 helper 加上 `--refresh-published-artifact` 推进公开快照。Unit 57 到 Unit 62 继续作为已落地 seam 保持稳定，Units 63 到 76 现在都已经成为已落地历史，而第一份完整有边界 Debian 12 review packet 继续保留到 `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`：guide coverage 已完整、artifact coverage 保持 `20/20`、bootstrap、steady-state、backup-and-restore、diagnostics 与 rollback parity 已落地，remote `main` CI 也已经在把 stale live-loader `hold` 预期修正到 `review_required` 后恢复一致。当前激活的 Milestone 3 地图已经切到 `docs/brainstorms/2026-04-21-portmanager-m3-live-packet-execution-tooling-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-live-packet-execution-tooling-plan.md`，同时 `/second-target-policy-pack.liveTransportFollowUp` 会继续保持 `capture_required`、指向 `docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md`，并继续把新的 packet 根目录模式固定为 `docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/`；当前真实缺口已经收敛为用 scaffold 与 validator helper 为下一份真实 live packet 做准备。Debian review-prep 治理切片继续冻结文档契约、验收 recipe、review-packet template、五份 proof 指南、live follow-up guide 与 ownership 来源；candidate host 注册、probe、bootstrap review-prep lane 继续保持有边界，并额外允许一条有边界 live steady-state mutation、一条有边界 backup operation、一条 diagnostics run 与一条 rollback rehearsal；同时继续把锁定 target-profile registry、consumer-boundary decision pack、deployment-boundary decision pack、second-target policy pack 与 persistence decision pack 保持为真实平台契约。

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

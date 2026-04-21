export type RoadmapStage = 'now' | 'next' | 'later'

export interface RoadmapProfile {
  title: { en: string; zh: string }
  summary: { en: string; zh: string }
  advantages: { en: string[]; zh: string[] }
  costs: { en: string[]; zh: string[] }
  suitableWhen: { en: string[]; zh: string[] }
  notFor: { en: string[]; zh: string[] }
  docs: string[]
}

export interface RoadmapMilestone {
  id: string
  stage: RoadmapStage
  title: { en: string; zh: string }
  status: { en: string; zh: string }
  summary: { en: string; zh: string }
  decision: { en: string; zh: string }
  productOutcomes: { en: string[]; zh: string[] }
  engineeringWork: { en: string[]; zh: string[] }
  entryCriteria: { en: string[]; zh: string[] }
  tradeoffs: { en: string[]; zh: string[] }
  verifiedNow: { en: string[]; zh: string[] }
  blockingGaps: { en: string[]; zh: string[] }
  developerFocus: { en: string[]; zh: string[] }
  focus?: {
    label: { en: string; zh: string }
    body: { en: string; zh: string }
  }
  dependencies: string[]
  docs: string[]
}

export interface RoadmapProgressBucket {
  id: string
  tone: 'safe' | 'next' | 'planned'
  label: { en: string; zh: string }
  items: { en: string[]; zh: string[] }
}

export const roadmapPrinciples = {
  en: [
    'Freeze contracts, design baselines, and publishing rules before implementation breadth.',
    'Prove one trusted control-plane slice before reliability and platform expansion.',
    'Treat Toward C as a gated expansion rather than an excuse for premature distributed design.'
  ],
  zh: [
    '在扩展实现广度之前，先冻结契约、设计基线与发布规则。',
    '在扩展可靠性和平台范围之前，先证明一条可信控制平面切片。',
    '把 Toward C 视为一个有门槛的扩展阶段，而不是过早分布式设计的借口。'
  ]
}

export const roadmapProgression = [
  {
    id: 'a',
    label: { en: 'A', zh: 'A' },
    title: { en: 'Docs-First Baseline', zh: 'Docs-First 基线' },
    description: {
      en: 'Contracts, design boundaries, publishing rules, and installation contracts are frozen and reviewable.',
      zh: '契约、设计边界、发布规则与安装契约都已经冻结且可评审。'
    }
  },
  {
    id: 'b',
    label: { en: 'B', zh: 'B' },
    title: { en: 'Trusted Validation State', zh: '可信验证状态' },
    description: {
      en: 'PortManager proves one host, one rule, one rollback, and absorbs the minimum current agent-service behavior into a real control-plane slice.',
      zh: 'PortManager 证明 one host、one rule、one rollback，并把当前 agent-service 的最小必要行为吸收进真实控制平面切片。'
    }
  },
  {
    id: 'c',
    label: { en: 'C', zh: 'C' },
    title: { en: 'Agent-First Distributed Platform', zh: 'Agent-First Distributed Platform' },
    description: {
      en: 'A later architecture direction where controller, agent, events, policy, and audit become more explicitly distributed and the remote agent becomes a first-class actor.',
      zh: '一个更后置的架构方向：controller、agent、events、policy、audit 更明确地走向分布式，远端 agent 成为一等参与者。'
    }
  }
]

export const schemeCProfile: RoadmapProfile = {
  title: {
    en: 'Scheme C: Agent-First Distributed Platform',
    zh: '方案 C：Agent-First Distributed Platform'
  },
  summary: {
    en: 'Split controller, agent, event stream, policy, and audit early; put UI, CLI, and automation behind an API gateway; treat the remote agent as a first-class actor.',
    zh: '尽早拆开 controller、agent、event stream、policy、audit；让 UI、CLI、自动化统一面对 API gateway；把远端 agent 视为一等参与者。'
  },
  advantages: {
    en: [
      'Architecturally the most complete direction under discussion.',
      'The strongest theoretical extensibility for multi-host and multi-surface growth.',
      'The clearest first-class-agent posture for future agent-consumer workflows.'
    ],
    zh: [
      '这是当前讨论里架构上最完整的方向。',
      '它对多主机、多表面扩展拥有最强的理论延展性。',
      '它为未来 agent-consumer 工作流提供了最清晰的一等公民 agent 姿态。'
    ]
  },
  costs: {
    en: [
      'This is the easiest way to over-design an empty-repository V1.',
      'Time can be consumed by infrastructure shape before practical value delivery exists.',
      'It can erode the implementation-and-robustness focus that matters most right now.'
    ],
    zh: [
      '它是最容易让空仓库 V1 掉进过度设计的方向。',
      '在实践价值链路成立前，时间很容易被基础设施形状消耗掉。',
      '它会削弱当前最重要的“实践与鲁棒性落地”重心。'
    ]
  },
  suitableWhen: {
    en: [
      'There is already a team rather than a solo docs-first push.',
      'Product validation is real rather than aspirational.',
      'Multiple deployment environments are advancing in parallel and now justify stronger distribution boundaries.'
    ],
    zh: [
      '已经不是单人 docs-first 推进，而是有实际团队协作。',
      '产品验证已经真实存在，而不是停留在设想阶段。',
      '多个部署环境正在并行推进，已经足以支撑更强的分布式边界。'
    ]
  },
  notFor: {
    en: [
      'Not the right starting posture for Milestone 1.',
      'Not a substitute for earning reliability in Milestone 2.',
      'Not an excuse to broaden platform scope before contracts and rollback semantics are trusted.'
    ],
    zh: [
      '它不是里程碑 1 的正确起手姿态。',
      '它不能替代里程碑 2 的可靠性建设。',
      '它不能成为在契约和回滚语义尚未可信前就扩平台范围的借口。'
    ]
  },
  docs: ['toward-c-strategy', 'milestones', 'v1-architecture', 'contract-strategy']
}

export const roadmapDeveloperProgress = {
  title: {
    en: 'Development Progress',
    zh: '开发进度'
  },
  lede: {
    en: 'This page now exposes three layers at once: the accepted Milestone 1 public slice, the still-mandatory Milestone 2 confidence guardrail, and the new Milestone 3 `Phase 0 enablement` lane. Current repo truth is no longer “Toward C someday” and no longer “Milestone 2 helper plumbing first.” Current repo truth is evidence-first progression: keep the same accepted live slice honest through review helpers and public counters, then use that protected base to start gateway-ready boundaries, controller seam extraction, event/audit indexing, bounded batch orchestration, and persistence-readiness work. Exact live counters stay on this development-progress page and the tracked confidence artifact.',
    zh: '这个页面现在同时暴露三层真实状态：已经完成验收的 Milestone 1 公共切片、仍然必须保持的 Milestone 2 confidence guardrail，以及新开启的 Milestone 3 `Phase 0 enablement` 主线。当前仓库真相已经不再是“Toward C 以后再说”，也不再是“先补 Milestone 2 helper 脚手架”；当前真相是 evidence-first 递进：继续用 review helper 与公开计数保护同一条 accepted live slice，再在这条被保护的底座上启动 gateway-ready boundary、controller seam extraction、event/audit indexing、bounded batch orchestration 与 persistence-readiness 工作。精确实时计数继续留在这个 development-progress 页面与被跟踪 confidence artifact 上。'
  },
  buckets: [
    {
      id: 'verified',
      tone: 'safe',
      label: {
        en: 'Verified Now',
        zh: '当前已验证'
      },
      items: {
        en: [
          'Docs-first baseline, contracts, and roadmap sequencing remain locked.',
          'Units 0 through 5 are complete: controller, CLI, web, live agent boundary, acceptance replay, and docs sync now tell one mainline story.',
          '`pnpm acceptance:verify` and `pnpm milestone:verify:confidence` still protect that same accepted live slice.',
          'The confidence bundle, synced review signal, public development-progress page, and wording-review checklist are already real; Milestone 3 does not need more readiness plumbing before it begins.',
          'Milestone proof now shows host `draft -> ready`, bridge rule `desired -> active`, live agent HTTP bootstrap/apply/runtime collection, snapshot evidence, and preserved backup/rollback artifacts.',
          'Agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.',
          'Configured GitHub backup now uploads controller backup bundles through the GitHub Contents API and publishes explicit succeeded remote redundancy state across API, CLI, web, and dedicated reliability proof.',
          'Remote-backup replay is now durable in repo: one proof replays local-only, configured-success, and configured-failure required backups on the same live agent-backed slice across API, CLI, Web backup views, and agent runtime.',
          'Deep compare now also confirms what still does not exist: no gateway app, no explicit controller/event/audit separation, no batch orchestration, no PostgreSQL readiness seam, and no broader target abstraction.'
        ],
        zh: [
          'Docs-first 基线、契约和路线排序继续保持锁定。',
          'Unit 0 到 Unit 5 现在都已完成：controller、CLI、web、live agent 边界、验收重放与文档同步已经讲同一条主线故事。',
          '`pnpm acceptance:verify` 与 `pnpm milestone:verify:confidence` 仍然继续保护这条 accepted live slice。',
          'confidence bundle、同步后的 review signal、公开 development-progress 页面与 wording-review checklist 都已经真实存在；Milestone 3 并不需要先再补一轮 readiness 脚手架。',
          'milestone proof 现在已经证明 host `draft -> ready`、bridge rule `desired -> active`、live agent HTTP bootstrap/apply/runtime collection，以及 backup/rollback 证据保持不变。',
          'agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在已经会统一发布 `agentVersion` 与 `live` / `stale` / `unreachable` heartbeat 语义。',
          '当 GitHub backup 已配置时，controller backup bundle 现在会通过 GitHub Contents API 上传，并在 API、CLI、web 与专门的可靠性证明里显式暴露远端冗余成功状态。',
          'repo 内已经落地可重复执行的 remote-backup replay：同一条 live agent-backed 切片现在会重放 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 证据保持一致。',
          '深度对比现在也已经明确当前尚未存在的东西：没有 gateway app、没有显式 controller/event/audit 分层、没有 batch orchestration、没有 PostgreSQL readiness seam，也没有更广目标平台抽象。'
        ]
      }
    },
    {
      id: 'in-progress',
      tone: 'next',
      label: {
        en: 'In Progress',
        zh: '进行中'
      },
      items: {
        en: [
          'Milestone 2 remains the guardrail lane, but Milestone 3 `Phase 0 enablement` is now the next execution phase.',
          'Current repo work has shifted from helper-access closure to architecture enablement on top of a protected evidence model.',
          'The remaining gap is no longer confidence plumbing; the remaining gap is the set of explicit Scheme C seams that current code still lacks.',
          'Roadmap, milestone docs, product spec, architecture doc, and root progress docs now all publish the same Milestone 3 gap map and next direction.',
          'Mainline evidence collection still keeps `pnpm acceptance:verify` on PRs while `push main`, `workflow_dispatch`, and the daily schedule run `pnpm milestone:verify:confidence`, restore/save the confidence history bundle, upload the bundle artifact, and publish the readiness summary for developers.'
        ],
        zh: [
          'Milestone 2 现在仍然是 guardrail 主线，但 Milestone 3 `Phase 0 enablement` 已经成为下一阶段。',
          '当前仓库工作已经从 helper 访问闭环，转向建立在受保护 evidence model 之上的架构 enablement。',
          '剩余缺口已经不再是 confidence 脚手架，而是当前代码仍然缺少的那组显式 Scheme C seam。',
          'roadmap、里程碑文档、产品规格、架构文档与 root progress docs 现在都已经发布同一份 Milestone 3 gap map 与下一步方向。',
          'mainline evidence collection 现在仍然会把 `pnpm acceptance:verify` 保留在 PR 路径上，并在 `push main`、`workflow_dispatch` 与每日 schedule 路径上运行 `pnpm milestone:verify:confidence`、恢复并保存 confidence history bundle、上传 bundle artifact，并向开发者发布 readiness summary。'
        ]
      }
    },
    {
      id: 'developer-focus',
      tone: 'planned',
      label: {
        en: 'Developer Focus',
        zh: '开发者下一步'
      },
      items: {
        en: [
          'Keep Unit 0 green now that the qualified-history threshold is met and the published state is `promotion-ready`.',
          'Run `pnpm milestone:review:promotion-ready -- --limit 20` after completed mainline runs and use `pnpm milestone:fetch:review-pack` when the current CI run is the first question; Milestone 3 does not replace that review chain.',
          'Keep `pnpm milestone:verify:confidence` green on `push main`, `workflow_dispatch`, and the daily scheduled history lane while Milestone 3 work begins.',
          'Use the new requirements/plan pair as the current implementation map: `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` and `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`.',
          'Start with gateway-ready boundaries, controller seam extraction, event/audit indexing, bounded batch orchestration, and persistence-readiness work instead of jumping straight to topology churn.',
          'Protect the lighter Unit 0 branch gate while the heavier confidence routine keeps collecting evidence.',
          'Keep remote-backup evidence aligned across controller, CLI, web, and agent instead of letting the routine drift from the accepted slice.'
        ],
        zh: [
          '当前 promotion-ready 门槛已经满足，继续把 Unit 0 保持为绿。',
          '在主线出现已完成 run 之后执行 `pnpm milestone:review:promotion-ready -- --limit 20`；如果第一问题是当前 CI run，就先执行 `pnpm milestone:fetch:review-pack`，Milestone 3 不会替代这条复核链路。',
          '继续让 `pnpm milestone:verify:confidence` 在 `push main`、`workflow_dispatch` 与每日 schedule 历史路径上持续转绿，同时 Milestone 3 开始推进。',
          '把新的 requirements/plan 组合作为当前实现地图：`docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md`。',
          '先做 gateway-ready boundary、controller seam extraction、event/audit indexing、bounded batch orchestration 与 persistence-readiness 工作，而不是直接跳向新的部署拓扑。',
          '在更重的 confidence routine 继续收集证据时，保住更轻的 Unit 0 分支 gate 不被重新定义。',
          '继续让 controller、CLI、web、agent 共享同一套 remote-backup 证据，而不是让新的 routine 偏离已验收切片。'
        ]
      }
    }
  ] satisfies RoadmapProgressBucket[]
}

export const roadmapMilestones: RoadmapMilestone[] = [
  {
    id: 'm1',
    stage: 'now',
    title: { en: 'Milestone 1: One Host, One Rule, One Rollback', zh: '里程碑 1：One Host, One Rule, One Rollback' },
    status: { en: 'Accepted Public Slice', zh: '公共切片已验收' },
    summary: {
      en: 'Turn the frozen contracts and specs into the first trusted control-plane slice; backup, diagnostics, rollback, operations evidence, controller/CLI/Web parity, and the live controller-agent service boundary are now real, and Unit 5 has replayed acceptance against that same slice.',
      zh: '把已冻结的契约与规范落成第一条可信控制平面切片；backup、diagnostics、rollback、operations 证据、controller/CLI/Web 一致性以及 live controller-agent 服务边界都已真实落地，Unit 5 也已经在这同一条切片上重放验收。'
    },
    decision: {
      en: 'Milestone 1 stayed intentionally narrow so PortManager could earn practical value before broader reliability or distributed ambitions consumed the roadmap; that narrow slice is now accepted and should not be reopened by new parity drift.',
      zh: '里程碑 1 刻意保持狭窄，是为了让 PortManager 先挣到实践价值，再去承担更广的可靠性或分布式野心；这条狭窄切片现在已经完成验收，不应再被新的表面漂移重新打开。'
    },
    productOutcomes: {
      en: ['A host can become ready through real controller-managed lifecycle.', 'A single bridge rule can become active through real contract-backed flows.', 'Operators can inspect snapshots, diagnostics, and rollback evidence across live Web, CLI, and API surfaces.'],
      zh: ['一台主机可以通过真实 controller 生命周期进入 ready。', '单条 bridge rule 可以通过真实契约驱动流程进入 active。', '操作者可以在 live Web、CLI、API 中检查快照、诊断与回滚证据。']
    },
    engineeringWork: {
      en: ['Contracts foundation and codegen.', 'Close controller, CLI, and web parity for hosts, bridge rules, and exposure policies.', 'Keep backup-before-mutation, rollback evidence, diagnostics flow, and event history intact while adding the missing public surfaces.'],
      zh: ['契约基础设施与 codegen。', '补齐 controller、CLI、web 在 hosts、bridge rules、exposure policies 上的一致性。', '在补全缺失公共表面的同时，保住变更前备份、回滚证据、诊断链路与事件历史能力。']
    },
    entryCriteria: {
      en: ['Docs-first baseline is frozen.', 'Product-console and docs-site boundaries are separated.', 'Ubuntu 24.04 + systemd + Tailscale target remains the only primary host profile.'],
      zh: ['Docs-first 基线已经冻结。', '产品控制台与 docs-site 的边界已经分开。', 'Ubuntu 24.04 + systemd + Tailscale 仍然是唯一主目标画像。']
    },
    tradeoffs: {
      en: ['No PostgreSQL default yet.', 'No broad platform support yet.', 'No Agent-First Distributed Platform starting posture.'],
      zh: ['暂不把 PostgreSQL 设为默认。', '暂不做广平台支持。', '暂不以 Agent-First Distributed Platform 作为起手姿态。']
    },
    verifiedNow: {
      en: [
        'Controller operations, backups, diagnostics, rollback points, and event replay surfaces are already real.',
        'Controller-backed hosts, host probe/bootstrap, bridge-rule CRUD, exposure-policy get/put, and backup-aware destructive rule mutation are now real and covered by `tests/controller/host-rule-policy.test.ts`.',
        'CLI host, bridge-rule, and exposure-policy list/detail plus core write flows are now real and covered by `crates/portmanager-cli/tests/host_rule_policy_cli.rs`.',
        'Web now renders controller-backed overview, host detail, hosts, bridge-rules, operations, backups, and console views with diagnostics detail, proved by `tests/web/live-controller-shell.test.ts`.',
        'The agent now exposes `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback` through the long-lived `serve` command, and controller syncs desired state against that live boundary.',
        'CLI inspection flows for operations, backups, diagnostics, health checks, and rollback points are already real.',
        'Milestone verification now proves backup-before-mutation, diagnostics evidence, rollback evidence, degraded-state history, host `draft -> ready`, and bridge rule `desired -> active` on the live agent-backed slice.',
        '`pnpm acceptance:verify` passes on 2026-04-17 after the Unit 4 delivery and Unit 5 docs sync.'
      ],
      zh: [
        'controller 的 operations、backups、diagnostics、rollback points、event replay 表面已经真实存在。',
        'controller-backed 的 hosts、host probe / bootstrap、bridge-rule CRUD、exposure-policy get / put，以及带备份证据的 destructive rule mutation 现在都已真实存在，并由 `tests/controller/host-rule-policy.test.ts` 覆盖。',
        'CLI 的 host、bridge-rule、exposure-policy list/detail 与核心写入流现在都已真实存在，并由 `crates/portmanager-cli/tests/host_rule_policy_cli.rs` 覆盖。',
        'Web 现在已经能渲染 controller-backed 的 overview、host detail、hosts、bridge-rules、operations、backups、console 与 diagnostics detail，并由 `tests/web/live-controller-shell.test.ts` 证明。',
        'agent 现在已经通过长驻 `serve` 命令暴露 `/health`、`/runtime-state`、`/apply`、`/snapshot`、`/rollback`，controller 也已经会对这条 live 边界同步 desired state。',
        'CLI 的 operations、backups、diagnostics、health checks、rollback points 检查流已经真实存在。',
        'milestone verification 现在已经在 live agent-backed 切片上证明变更前备份、诊断证据、回滚证据、degraded 状态历史，以及 host `draft -> ready` 与 bridge rule `desired -> active`。',
        '`pnpm acceptance:verify` 已在 2026-04-17 的 Unit 4 交付与 Unit 5 文档同步之后重新转绿。'
      ]
    },
    blockingGaps: {
      en: [
        'No blocking gap remains for the locked Milestone 1 public-surface slice.',
        'Remaining unfinished work now belongs to Milestone 2: repeated live reliability replay on top of configured, failed, and local-only remote-backup evidence.',
        'Raw agent runtime intentionally remains `applied_unverified` until controller diagnostics promote the controller-side rule lifecycle to `active`; this is shipped verification sequencing, not a Milestone 1 blocker.'
      ],
      zh: [
        '锁定的 Milestone 1 公共表面切片已经没有阻塞缺口。',
        '剩余未完成工作现在都属于 Milestone 2：建立在 configured、failed、local-only 三类 remote-backup 证据之上的 live 可靠性重复证明。',
        '原始 agent runtime 会在 controller diagnostics 把 controller 侧 rule lifecycle 提升到 `active` 之前保持 `applied_unverified`；这是已交付的验证顺序，而不是 Milestone 1 阻塞项。'
      ]
    },
    developerFocus: {
      en: [
        'Treat Milestone 1 as closed and protect it with the mainline gate.',
        'Use the accepted live agent-backed slice as the only base for Milestone 2 reliability work.',
        'Keep controller-side diagnostics as the rule-activation authority while preserving the shipped heartbeat/version semantics across agent, API, CLI, and Web.'
      ],
      zh: [
        '把 Milestone 1 当作已闭环状态，并继续用主线 gate 保护它。',
        '把已经验收的 live agent-backed 切片作为 Milestone 2 可靠性工作的唯一底座。',
        '继续让 controller-side diagnostics 承担规则激活权威，同时把已经交付的 heartbeat/version 语义稳定保持在 agent、API、CLI 与 Web 之间。'
      ]
    },
    dependencies: [],
    docs: ['product-spec', 'v1-architecture', 'contract-strategy', 'ui-information-architecture', 'milestones']
  },
  {
    id: 'm2',
    stage: 'now',
    title: { en: 'Milestone 2: Engineering Reliability', zh: '里程碑 2：Engineering Reliability' },
    status: { en: 'Promotion-Ready Guardrail', zh: 'Promotion-Ready 护栏' },
    summary: {
      en: 'Reliability work has reached a promotion-ready confidence state and now acts as the guardrail that keeps Milestone 3 honest: same accepted live slice, same review helpers, same public progress counters, and same evidence-first discipline.',
      zh: '可靠性工作已经进入 promotion-ready 的 confidence 状态，现在转而承担 Milestone 3 的 guardrail：同一条 accepted live slice、同一组 review helper、同一套公开 progress 计数，以及同一条 evidence-first 纪律。'
    },
    decision: {
      en: 'Milestone 2 no longer blocks Milestone 3 entry through missing machinery. Its job now is to preserve one trusted evidence model and one honest public wording flow while architecture scope expands carefully.',
      zh: 'Milestone 2 现在已经不再因为缺少机器而阻塞 Milestone 3 进入。它当前的职责，是在架构范围谨慎扩展时继续保住同一套可信 evidence model 与同一条诚实的公共文案流程。'
    },
    productOutcomes: {
      en: ['Degraded state becomes operationally visible across live surfaces.', 'Backup policy becomes explicit and enforceable with matching evidence trails.', 'Diagnostics and operations views mature without depending on mock-only presentation.'],
      zh: ['Degraded 状态在真实界面中具备操作可见性。', '备份策略变得明确且可执行，并保持一致的证据链。', 'Diagnostics 与 operations 视图成熟，不再依赖纯 mock 展示。']
    },
    engineeringWork: {
      en: ['Configured, failed, and local-only GitHub backup evidence on top of the explicit remote-backup guidance surfaces.', 'Drift detection and degraded handling on top of real host/rule/policy resources.', 'Stronger rollback UX, artifact retention, and live event/history parity.'],
      zh: ['建立在显式远端备份提示表面之上的 configured、failed、local-only 三类 GitHub backup 证据。', '建立在真实 host/rule/policy 资源之上的漂移检测与 degraded 处理。', '更强的 rollback 体验、产物保留与实时 event/history 一致性。']
    },
    entryCriteria: {
      en: ['Milestone 1 slice is accepted end to end.', 'Local backup before mutation is already enforced.', 'Host/rule/operation state semantics are shared across Web, CLI, and API.'],
      zh: ['里程碑 1 切片已经端到端完成验收。', '变更前本地备份已经是强制行为。', 'Web、CLI 与 API 已共享 host/rule/operation 状态语义。']
    },
    tradeoffs: {
      en: ['Still not broad multi-platform expansion.', 'Still not generic fleet orchestration.', 'PostgreSQL remains optional until there is real pressure.'],
      zh: ['仍然不先做广义多平台扩展。', '仍然不先做通用 fleet 编排。', '在真实压力出现前，PostgreSQL 继续保持可选迁移面。']
    },
    verifiedNow: {
      en: [
        'Backup policy modes already behave differently and expose remote-backup status evidence.',
        'Remote-backup setup, status, and operator action are now explicit across API, CLI, web, and proof output instead of being buried behind raw enum state.',
        'Configured GitHub backup now uploads controller backup bundles through the GitHub Contents API and reports explicit remote redundancy success/failure across API, CLI, web, and dedicated reliability proof.',
        'One durable replay proof now covers local-only, configured-success, and configured-failure required backups on the same live agent-backed slice across API, CLI, Web backup views, and agent runtime.',
        'Agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.',
        'Drift detection already records explicit degraded state and recovery-linked summaries.',
        'Controller `GET /diagnostics` now filters by `state`, and Web host detail now shows degraded diagnostics history alongside recovery-ready successful evidence.',
        'Event history, operation detail replay paths, and rollback inspection are already richer than the original skeleton.',
        'Live agent-backed behavior now participates in degraded handling, rule verification, and controller-side activation semantics.',
        'Synced/local confidence summary now persists `latestQualifiedRun` plus visibility-only breakdown metadata, so the latest mainline evidence stays explicit even when newer local runs exist.',
        'The docs site now publishes the same synced milestone confidence state as a first-class development-progress page and roadmap-home preview.',
        'The tracked public confidence artifact now also matches that synced promotion-ready state and carries the exact live counters plus latest qualified run for developers who need the freshest proof.',
        'The mainline acceptance gate now protects this reliability slice from docs, contract, and test drift while Milestone 2 hardening continues.'
      ],
      zh: [
        'backup policy 模式已经具备真实行为差异，并暴露远端备份状态证据。',
        '远端备份的配置、状态与操作者动作现在已经在 API、CLI、Web 与 proof 输出中显式可见，不再只是埋在原始枚举状态后面。',
        '当 GitHub backup 已配置时，controller backup bundle 现在会通过 GitHub Contents API 上传，并在 API、CLI、Web 与专门的可靠性证明里显式暴露远端冗余成功/失败状态。',
        '同一条 live agent-backed 切片上，现在已经有一条 durable replay proof 覆盖 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 对齐。',
        'agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在已经会统一发布 `agentVersion` 与 `live` / `stale` / `unreachable` heartbeat 语义。',
        'drift detection 已经记录显式 degraded 状态与 recovery 关联摘要。',
        'controller `GET /diagnostics` 现在支持 `state` 过滤，Web host detail 也已经把 degraded diagnostics history 与 recovery-ready 成功证据并排展示出来。',
        'event history、operation detail replay path、rollback inspection 已经比最初骨架更完整。',
        'live agent-backed 行为现在也已经进入 degraded 处理、规则验证与 controller-side 激活语义。',
        '同步后与本地 confidence summary 现在会持久化 `latestQualifiedRun` 与 visibility-only breakdown 元数据，因此即使本地出现更新的 rerun，也不会掩盖最新主线证据。',
        'docs-site 现在也会把同一份同步后的 milestone confidence 状态发布成一级 development-progress 页面，并在 roadmap 首页直接预览。',
        '被跟踪的公开 confidence artifact 现在也已经与这份同步后的 promotion-ready 状态对齐，并为需要最新证明的开发者携带精确实时计数与最新 qualified run。',
        '在 Milestone 2 可靠性加固继续推进时，主线验收 gate 也继续保护这条切片，避免文档、契约和测试发生漂移。'
      ]
    },
    blockingGaps: {
      en: [
        'Milestone 2 no longer lacks canonical confidence collection, synced review truth, or a truthful public confidence artifact.',
        'The remaining Milestone 2 obligation is deliberate wording review plus continued gate health on the accepted live slice, and that review now runs through `.portmanager/reports/milestone-wording-review.md`.'
      ],
      zh: [
        '在同一条 live agent-backed 切片上，Milestone 2 的验收已经不再缺少规范 confidence 收集、可信的同步复核信号，或真实对齐的公开 confidence artifact。',
        'Milestone 2 当前剩余职责已经收窄为基于已验收 live 切片、通过 `.portmanager/reports/milestone-wording-review.md` 执行的人工文案复核，以及持续保持 gate 健康。'
      ]
    },
    developerFocus: {
      en: [
        'Keep configured, failed, and local-only backup evidence aligned across controller, CLI, web, and agent.',
        'Keep `pnpm milestone:verify:confidence` green on the same accepted agent-backed slice.',
        'Use `pnpm milestone:review:promotion-ready -- --limit 20`, `.portmanager/reports/milestone-wording-review.md`, `Public claim class`, `Source surface status`, `Latest Qualified Run`, and the visibility breakdown during developer review.',
        'Refresh the tracked public confidence artifact only through the same helper plus `--refresh-published-artifact` when the digest and human review agree.',
        'Treat Milestone 2 as the guardrail for Milestone 3, not as a reason to reopen Milestone 1 parity work.'
      ],
      zh: [
        '继续让 controller、CLI、web、agent 在 configured、failed、local-only 三类 backup 证据上保持一致。',
        '继续让 `pnpm milestone:verify:confidence` 在同一条已验收 live agent-backed 切片上保持为绿。',
        '在开发者复核时继续使用 `pnpm milestone:review:promotion-ready -- --limit 20`、带 `Public claim class` 与 `Source surface status` 的 `.portmanager/reports/milestone-wording-review.md`、`Latest Qualified Run` 与 visibility breakdown。',
        '只有在 digest 与人工复核共同同意时，才通过同一条 helper 加上 `--refresh-published-artifact` 刷新被跟踪公开 confidence artifact。',
        '把 Milestone 2 当作 Milestone 3 的 guardrail，而不是重新打开 Milestone 1 表面补洞的理由。'
      ]
    },
    dependencies: ['m1'],
    docs: ['backup-rollback-policy', 'real-machine-verification-report', 'snapshot-diagnostics', 'sdk-docker', 'milestones']
  },
  {
    id: 'm3',
    stage: 'next',
    title: { en: 'Milestone 3: Toward C', zh: '里程碑 3：Toward C' },
    status: { en: 'Phase 0 Enablement', zh: 'Phase 0 启动' },
    summary: {
      en: 'Milestone 3 now starts as bounded enablement: keep the same accepted evidence model, surface the current architecture gap map honestly, and begin the first seam-building work needed before any stronger Scheme C claim becomes real.',
      zh: 'Milestone 3 现在以有边界的 enablement 方式启动：继续保住同一套已验收 evidence model，诚实公开当前架构缺口地图，并开始真正把 Scheme C 需要的第一批 seam 建起来。'
    },
    decision: {
      en: 'Milestone 3 begins now only because the repo has earned a credible entry signal. It still starts with seams and bounded contracts, not with premature topology theater.',
      zh: 'Milestone 3 之所以现在可以开始，只是因为仓库已经挣到了可信进入信号。它的起点仍然应该是 seam 与有边界契约，而不是过早的拓扑表演。'
    },
    productOutcomes: {
      en: ['Gateway-ready consumer boundary.', 'Stronger indexed event and audit review model.', 'A credible path to bounded multi-host operations and later platform expansion.'],
      zh: ['Gateway-ready 的 consumer boundary。', '更强的索引化 event / audit 复核模型。', '为有边界的多主机操作与后续平台扩展建立可信路径。']
    },
    engineeringWork: {
      en: ['Controller seam extraction.', 'Gateway-ready contract shaping.', 'Indexed event/audit reads and persistence-readiness seams on top of the newly landed bounded batch envelope.'],
      zh: ['Controller seam extraction。', 'Gateway-ready 的契约边界塑形。', '在新落地的 bounded batch envelope 之上继续补齐索引化 event / audit read 与 persistence-readiness seam。']
    },
    entryCriteria: {
      en: ['Milestone 1 slice is accepted.', 'Milestone 2 confidence is promotion-ready and still guarded by review helpers.', 'Minimal agent-service migration is already complete.'],
      zh: ['Milestone 1 切片已经完成验收。', 'Milestone 2 confidence 已经进入 promotion-ready，并继续受 review helper 保护。', '最小 agent-service 迁移已经完成。']
    },
    tradeoffs: {
      en: ['Do not start with topology churn before seam extraction.', 'Do not let infrastructure elegance outrun delivered value.', 'Do not dilute contract governance while broadening the platform.'],
      zh: ['不要在 seam 还没抽出来前就先做拓扑改造。', '不要让基础设施优雅性跑在价值交付前面。', '不要在扩展平台时稀释契约治理。']
    },
    verifiedNow: {
      en: [
        'The architectural direction is documented and reviewable.',
        'The entry gate is now credible enough for bounded execution, not just future narration.',
        'Controller transport now delegates baseline host-detail composition and host/rule/policy orchestration through explicit `controller-read-model` and `controller-domain-service` seams while preserving the current HTTP contract and acceptance evidence.',
        'A bounded batch exposure-policy envelope now lands as one auditable parent operation with host-scoped child outcomes across controller, CLI, and Web without introducing a fake fleet engine.',
        'Current docs still publish the remaining gap map honestly: no gateway app, no indexed event/audit split, no PostgreSQL readiness seam, and no broader target abstraction yet.'
      ],
      zh: [
        '这个架构方向已经被文档化并可评审。',
        '进入门槛现在已经足以支撑有边界执行，而不再只是未来叙述。',
        'Controller transport 现在已经通过显式的 `controller-read-model` 与 `controller-domain-service` seam 委托 host detail 组合与 host/rule/policy 编排，同时保持现有 HTTP 契约与验收证据不变。',
        '一个有边界的 batch exposure-policy envelope 现在已经落地：controller、CLI 与 Web 都可以围绕同一个 parent operation 与 host-scoped child outcome 复核批量结果，而没有引入伪 fleet engine。',
        '当前文档仍然诚实公开剩余缺口地图：还没有 gateway app、没有索引化 event/audit 分层、没有 PostgreSQL readiness seam，也没有更广目标平台抽象。'
      ]
    },
    blockingGaps: {
      en: [
        'Web and CLI still consume the controller directly instead of a gateway-ready boundary.',
        'Controller seam extraction is only at the baseline stage; indexed event/audit separation and broader boundary hardening are still unfinished.',
        'Only one bounded batch envelope is real today; broader orchestration, persistence seams, and target abstractions are still missing.'
      ],
      zh: [
        'Web 与 CLI 仍然直接消费 controller，而不是 gateway-ready 的 boundary。',
        'Controller seam extraction 目前还只是 baseline 阶段；索引化 event/audit 分层与更广的 boundary 加固仍未完成。',
        '当前真实存在的只是一个有边界的 batch envelope；更广的 orchestration、persistence seam 与 target abstraction 仍然缺失。'
      ]
    },
    developerFocus: {
      en: [
        'Use `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` and `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` as the active implementation map; Unit 51 seam extraction baseline and Unit 52 bounded batch envelope are now landed on that path.',
        'Move next to indexed event/audit reads, persistence seams, and deeper gateway-ready contract hardening instead of reopening controller-transport concentration.',
        'Extend Milestone 3 on the same evidence model: keep the landed batch envelope auditable while adding indexed review surfaces.',
        'Keep Milestone 2 review helpers and public progress counters active while Milestone 3 work lands.'
      ],
      zh: [
        '把 `docs/brainstorms/2026-04-21-portmanager-m3-toward-c-enablement-requirements.md` 与 `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` 当作当前实现地图；其中 Unit 51 seam extraction baseline 与 Unit 52 bounded batch envelope 都已落地。',
        '下一步转向索引化 event/audit read、persistence seam 与更深的 gateway-ready contract hardening，而不是重新把 controller transport 堆回去。',
        '继续在同一套 evidence model 上扩展 Milestone 3：保住已经落地的 batch envelope 可审计性，再补齐 indexed review surface。',
        '在 Milestone 3 落地时，继续让 Milestone 2 review helper 与公开 progress counter 保持为真相护栏。'
      ]
    },
    focus: {
      label: { en: 'Scheme C', zh: '方案 C' },
      body: {
        en: 'Agent-First Distributed Platform: split controller, agent, event stream, policy, and audit early; place UI, CLI, and automation behind an API gateway; treat the remote agent as a true first-class citizen.',
        zh: 'Agent-First Distributed Platform：尽早拆开 controller、agent、event stream、policy、audit；让 UI、CLI、自动化统一面对 API gateway；把远端 agent 视为真正的一等公民。'
      }
    },
    dependencies: ['m2'],
    docs: ['milestones', 'toward-c-strategy', 'v1-architecture', 'sdk-docker', 'contract-strategy']
  }
]

export const roadmapTracks = {
  product: {
    en: ['Control Plane Baseline', 'Diagnostics Visibility', 'Backup & Rollback Confidence', 'Reliability Guardrail', 'Toward C Enablement'],
    zh: ['控制平面基线', '诊断可见性', '备份与回滚信心', '可靠性护栏', 'Toward C 启动']
  },
  engineering: {
    en: ['Contracts', 'Controller Seams', 'Agent', 'CLI', 'Web', 'Event & Audit Index', 'Batch Operations', 'Persistence Readiness', 'Toward C'],
    zh: ['契约', 'Controller 分层', 'Agent', 'CLI', 'Web', 'Event 与 Audit 索引', '批量操作', '持久化就绪度', 'Toward C']
  }
}

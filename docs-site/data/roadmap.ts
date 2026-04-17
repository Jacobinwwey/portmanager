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
    en: 'This page now exposes the accepted Milestone 1 public slice, the mainline gate that keeps it honest, the shipped heartbeat/version, GitHub-backup, and remote-backup-replay slices, and the remaining work to keep that evidence routine on the same live agent-backed flow.',
    zh: '这个页面现在直接暴露已经完成验收的 Milestone 1 公共切片、持续保护主线的 gate、已经落地的 heartbeat/version、GitHub-backup 与 remote-backup-replay 切片，以及建立在同一条 live agent 切片之上的剩余常态化证据工作。'
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
          'Units 0 through 5 are now complete: controller, CLI, web, live agent boundary, acceptance replay, and docs sync now tell one mainline story.',
          '`pnpm acceptance:verify` passes on 2026-04-17 after the Unit 4 agent-service delivery and Unit 5 docs sync.',
          'Milestone proof now shows host `draft -> ready`, bridge rule `desired -> active`, live agent HTTP bootstrap/apply/runtime collection, snapshot evidence, and preserved backup/rollback artifacts.',
          'Agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.',
          'Configured GitHub backup now uploads controller backup bundles through the GitHub Contents API and publishes explicit succeeded remote redundancy state across API, CLI, web, and dedicated reliability proof.',
          'Remote-backup replay is now durable in repo: one proof replays local-only, configured-success, and configured-failure required backups on the same live agent-backed slice across API, CLI, Web backup views, and agent runtime.',
          'Roadmap page, milestone docs, product spec, and root progress docs now reflect the same truth.'
        ],
        zh: [
          'Docs-first 基线、契约和路线排序继续保持锁定。',
          'Unit 0 到 Unit 5 现在都已完成：controller、CLI、web、live agent 边界、验收重放与文档同步已经讲同一条主线故事。',
          '`pnpm acceptance:verify` 已在 2026-04-17 的 Unit 4 agent-service 交付与 Unit 5 文档同步之后重新转绿。',
          'milestone proof 现在已经证明 host `draft -> ready`、bridge rule `desired -> active`、live agent HTTP bootstrap/apply/runtime collection，以及 backup/rollback 证据保持不变。',
          'agent `/health` + `/runtime-state`、controller host summary/detail、CLI host 输出与 Web host detail 现在已经会统一发布 `agentVersion` 与 `live` / `stale` / `unreachable` heartbeat 语义。',
          '当 GitHub backup 已配置时，controller backup bundle 现在会通过 GitHub Contents API 上传，并在 API、CLI、web 与专门的可靠性证明里显式暴露远端冗余成功状态。',
          'repo 内已经落地可重复执行的 remote-backup replay：同一条 live agent-backed 切片现在会重放 local-only、configured-success、configured-failure 三类 required backup，并把 API、CLI、Web backup 视图与 agent runtime 证据保持一致。',
          'roadmap 页面、里程碑文档、产品规格与 root progress docs 现在已经反映同一套真实状态。'
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
          'Milestone 2 reliability hardening is now the active lane, not Milestone 1 parity recovery.',
          'Configured, failed, and local-only GitHub backup paths now all exist inside one durable replay proof on the same live slice; remaining work is confidence maintenance, not first delivery.',
          'Controller `GET /diagnostics` now filters by `state`, and Web host detail now groups latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence on the same live host/rule/policy slice.',
          'Broader reliability replay on the same live agent-backed slice still needs continued reruns across Web, CLI, API, agent, and mixed remote-backup states before the status language can simplify.'
        ],
        zh: [
          '当前主线已经转到 Milestone 2 可靠性加固，而不再是 Milestone 1 一致性补洞。',
          'configured、failed、local-only 三类 GitHub backup 路径现在都已经落在同一条 durable replay proof 的 live 切片上；剩余工作不再是首次交付，而是常态化维持与可信度加深。',
          'controller `GET /diagnostics` 现在支持 `state` 过滤，Web host detail 也已经在同一条 live host/rule/policy 切片上分组展示最新诊断、degraded diagnostics history 与 recovery-ready 成功证据。',
          '同一条 live agent-backed 切片上的可靠性重放仍需要在 Web、CLI、API、agent 以及多种 remote-backup 状态之间持续重跑，之后状态文案才能继续收窄。'
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
          'Keep Unit 0 green while Milestone 2 work lands.',
          'Keep rerunning the combined remote-backup replay on the live agent-backed slice across configured, failed, and local-only evidence.',
          'Keep remote-backup evidence aligned across controller, CLI, web, and agent instead of letting the new replay proof drift.',
          'Keep Toward C deferred until Milestone 2 evidence becomes trustworthy.'
        ],
        zh: [
          '继续把 Unit 0 保持为绿，再让 Milestone 2 工作落地。',
          '围绕 configured、failed、local-only 三类 remote-backup 证据，继续在同一条 live agent-backed 切片上重跑 combined replay。',
          '继续让 controller、CLI、web、agent 共享同一套 remote-backup 证据，而不是让新 replay proof 自身发生漂移。',
          '在 Milestone 2 证据真正可信之前，继续把 Toward C 保持为延后方向。'
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
    stage: 'next',
    title: { en: 'Milestone 2: Engineering Reliability', zh: '里程碑 2：Engineering Reliability' },
    status: { en: 'Reliability Hardening In Progress', zh: '可靠性加固进行中' },
    summary: {
      en: 'Strengthen the accepted B-state slice until degraded handling, rollback confidence, remote-backup clarity, and drift visibility become operationally trustworthy across repeated real runs.',
      zh: '把已经被接受的 B 状态切片继续强化到 degraded 处理、rollback 信心、远端备份清晰度与 drift 可见性都能在多次真实运行中值得信任。'
    },
    decision: {
      en: 'Reliability stays ahead of platform expansion, but it now builds on a completed Milestone 1 slice rather than a missing-parity story.',
      zh: '可靠性仍然优先于平台扩展，但它现在建立在已经完成的 Milestone 1 切片之上，而不再建立在“缺表面”的叙事上。'
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
        '在 Milestone 2 可靠性加固继续推进时，主线验收 gate 也继续保护这条切片，避免文档、契约和测试发生漂移。'
      ]
    },
    blockingGaps: {
      en: [
        'Milestone 2 acceptance still needs continued reruns of the combined replay and the acceptance gate on the same live agent-backed slice before status can advance.',
        'The remaining gap is trust that stays green over time, not discovery of a missing remote-backup state.'
      ],
      zh: [
        '在同一条 live agent-backed 切片上，Milestone 2 的验收仍需要把 combined replay 与 acceptance gate 持续重跑之后，状态才有资格继续提升。',
        '当前剩余缺口是能长期保持为绿的可信度，而不是缺失某个 remote-backup 状态。'
      ]
    },
    developerFocus: {
      en: [
        'Build Milestone 2 on the completed Unit 0 through Unit 5 lane instead of reopening Milestone 1 parity work.',
        'Keep configured, failed, and local-only backup evidence aligned across controller, CLI, web, and agent.',
        'Keep rerunning the combined replay and the mainline acceptance gate on the same accepted agent-backed slice.',
        'Keep one evidence model and one acceptance gate across controller, CLI, web, and agent.'
      ],
      zh: [
        '把 Milestone 2 建立在已经完成的 Unit 0 到 Unit 5 主线之上，而不是重新打开 Milestone 1 的表面补洞。',
        '继续让 controller、CLI、web、agent 在 configured、failed、local-only 三类 backup 证据上保持一致。',
        '继续在同一条已验收的 live agent-backed 切片上反复重跑 combined replay 与主线 acceptance gate。',
        '继续让 controller、CLI、web、agent 共用同一套证据模型与同一条验收 gate。'
      ]
    },
    dependencies: ['m1'],
    docs: ['backup-rollback-policy', 'snapshot-diagnostics', 'sdk-docker', 'milestones']
  },
  {
    id: 'm3',
    stage: 'later',
    title: { en: 'Milestone 3: Toward C', zh: '里程碑 3：Toward C' },
    status: { en: 'Planned', zh: '计划中' },
    summary: {
      en: 'Prepare PortManager for Scheme C: Agent-First Distributed Platform, but only after practical robustness has already been earned.',
      zh: '为方案 C：Agent-First Distributed Platform 做准备，但前提是已经先把实践鲁棒性挣出来。'
    },
    decision: {
      en: 'C is kept as a later direction because it is architecturally the most complete option, but it is also the easiest way to over-design an empty-repository V1.',
      zh: '保留 C 作为后续方向，是因为它在架构上最完整，但它也最容易让空仓库 V1 直接掉进过度设计。'
    },
    productOutcomes: {
      en: ['Batch host management.', 'Stronger agent event model.', 'A credible path to broader platform support.'],
      zh: ['批量主机管理。', '更强的 agent 事件模型。', '更可信的多平台扩展路径。']
    },
    engineeringWork: {
      en: ['Platform abstraction growth.', 'PostgreSQL migration or readiness work.', 'Preparation for macOS, mobile, Windows remote, and wider Linux support.'],
      zh: ['平台抽象扩展。', 'PostgreSQL 迁移或迁移准备。', '为 macOS、移动端、Windows 远端与更广 Linux 支持做准备。']
    },
    entryCriteria: {
      en: ['B-state validation is trusted in repeated real use.', 'Reliability semantics are stable enough that expansion will not erase accountability.', 'Minimal agent-service migration is already complete.'],
      zh: ['B 状态已经在反复真实使用中被证明可信。', '可靠性语义已经足够稳定，不会在扩展范围时抹掉责任边界。', '最小 agent-service 迁移已经完成。']
    },
    tradeoffs: {
      en: ['Do not start with controller/agent/event/policy/audit full separation in V1.', 'Do not let infrastructure elegance outrun delivered value.', 'Do not dilute contract governance while broadening the platform.'],
      zh: ['不要在 V1 起点就做 controller/agent/event/policy/audit 全量拆分。', '不要让基础设施优雅性跑在价值交付前面。', '不要在扩展平台时稀释契约治理。']
    },
    verifiedNow: {
      en: [
        'The architectural direction is documented and reviewable.',
        'The entry gate is explicit instead of being treated as an automatic next step.',
        'Current roadmap copy already constrains C behind B-state trust and reliability proof.'
      ],
      zh: [
        '这个架构方向已经被文档化并可评审。',
        '进入门槛已经被明确写出，而不是被当成自动的下一步。',
        '当前 roadmap 文案已经把 C 明确约束在 B 状态可信和可靠性证明之后。'
      ]
    },
    blockingGaps: {
      en: [
        'B-state trust beyond Milestone 1 is not yet fully earned.',
        'Milestone 2 reliability proof is still incomplete across repeated real use.',
        'Starting distributed separation now would amplify reliability drift instead of resolving it.'
      ],
      zh: [
        '超出 Milestone 1 之后的 B 状态可信度还没有完全挣出来。',
        'Milestone 2 的可靠性证明在重复真实使用中仍未闭环。',
        '现在就启动分布式拆分，只会放大可靠性漂移，而不是解决它。'
      ]
    },
    developerFocus: {
      en: [
        'Treat C as a reference direction, not an active execution lane.',
        'Do not start controller/agent/event/policy/audit separation before Milestone 1 and Milestone 2 closure.',
        'Keep future-platform thinking documented, but spend implementation time on parity and reliability first.'
      ],
      zh: [
        '把 C 当作参考方向，而不是当前执行主线。',
        '在里程碑 1 和里程碑 2 闭环前，不要提前启动 controller/agent/event/policy/audit 拆分。',
        '把未来平台思考继续写清楚，但把实现时间先花在一致性和可靠性上。'
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
    en: ['Control Plane Baseline', 'Diagnostics Visibility', 'Backup & Rollback Confidence', 'SDK & Docker Maturity', 'Reliability before Expansion'],
    zh: ['控制平面基线', '诊断可见性', '备份与回滚信心', 'SDK 与 Docker 成熟度', '先可靠性，再扩展']
  },
  engineering: {
    en: ['Contracts', 'Controller', 'Agent', 'CLI', 'Web', 'Backup', 'Diagnostics', 'Drift', 'Toward C'],
    zh: ['契约', 'Controller', 'Agent', 'CLI', 'Web', 'Backup', 'Diagnostics', 'Drift', 'Toward C']
  }
}

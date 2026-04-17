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
    en: 'This page now exposes what is already real, which gate protects mainline, what is still blocking acceptance, and what developers should advance next before milestone status moves again.',
    zh: '这个页面现在直接暴露哪些能力已经真实存在、哪条 gate 正在保护主线、哪些缺口仍在阻塞验收，以及开发者在里程碑状态继续推进前应该先做什么。'
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
          'Docs-first baseline, contracts, and roadmap sequencing are locked.',
          'Mainline acceptance discipline is now real through `pnpm acceptance:verify`, the `mainline-acceptance` workflow, and the 2026-04-17 Windows validation pass.',
          'Backup, rollback, diagnostics, drift, event history, and recovery evidence are already proved in controller, CLI, and milestone tests.',
          'Mainline documentation now distinguishes contractual surface from delivered surface.'
        ],
        zh: [
          'Docs-first 基线、契约和路线排序已经锁定。',
          '主线验收纪律已经真实落地：`pnpm acceptance:verify`、`mainline-acceptance` workflow 与 2026-04-17 的 Windows 验证已经连成同一条 gate。',
          'backup、rollback、diagnostics、drift、event history、recovery 证据已经在 controller、CLI、milestone 测试中被证明。',
          '主线文档现在已经明确区分契约表面与已交付表面。'
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
          'Milestone 1 acceptance closure is still blocked on real hosts, bridge rules, exposure policies, live web parity, and the agent steady-state service.',
          'GitHub runner parity still needs one stabilization pass because workflow run `24564534909` failed on the one-host verification teardown with `ERR_SERVER_NOT_RUNNING`.',
          'Milestone 2 reliability acceptance still has to be replayed on that same live host/rule/policy model instead of the current partial slice.',
          'Roadmap status sync is still required between root specs, docs-site detail pages, and the roadmap index each time acceptance evidence changes.'
        ],
        zh: [
          '里程碑 1 验收闭环仍然卡在真实 hosts、bridge rules、exposure policies、live web 一致性与 agent 稳态服务上。',
          'GitHub runner 一致性还需要再做一次稳定化，因为 workflow run `24564534909` 在 one-host 验证 teardown 上命中了 `ERR_SERVER_NOT_RUNNING`。',
          '里程碑 2 仍然要把可靠性验收重放到同一套 live host/rule/policy 模型上，而不是继续停留在当前部分切片。',
          '每次验收证据变化后，路线状态仍然需要在 root specs、docs-site 详情页和 roadmap 首页之间继续同步。'
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
          'Unit 0: keep `mainline-acceptance` green on GitHub runner parity by making one-host verification teardown idempotent.',
          'Unit 1: make controller host, bridge-rule, and exposure-policy resources real without regressing current evidence flows.',
          'Unit 2 + Unit 3: mirror those resources into CLI commands and replace web mock routes with live views before advancing milestone status.',
          'Unit 4 + Unit 5: move the agent to the locked HTTP-over-Tailscale steady-state boundary, rerun acceptance, and only then rewrite milestone language.'
        ],
        zh: [
          'Unit 0：先把 one-host 验证 teardown 做成幂等，在 GitHub runner 一致性下保持 `mainline-acceptance` 为绿。',
          'Unit 1：先把 controller 的 host、bridge-rule、exposure-policy 资源做成真实表面，同时不回退现有证据链。',
          'Unit 2 + Unit 3：在提升里程碑状态前，把这些表面同步镜像到 CLI 命令，并把 Web mock 路由切到 live 视图。',
          'Unit 4 + Unit 5：把 agent 推进到锁定的 HTTP-over-Tailscale 稳态边界，重新跑验收，然后再重写里程碑文案。'
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
    status: { en: 'Acceptance Closure In Progress', zh: '验收闭环进行中' },
    summary: {
      en: 'Turn the frozen contracts and specs into the first credible control-plane slice; backup, diagnostics, rollback, and operations evidence are real, but host/rule/policy parity is still incomplete.',
      zh: '把已冻结的契约与规范落成第一条可信控制平面切片；backup、diagnostics、rollback、operations 证据已经真实存在，但 host/rule/policy 一致性仍未补齐。'
    },
    decision: {
      en: 'Milestone 1 stays intentionally narrow so PortManager can prove practical value before broader reliability or distributed ambitions consume the roadmap; current work must close the missing public surfaces before status can advance.',
      zh: '里程碑 1 必须刻意保持狭窄，让 PortManager 先证明实践价值，再去承担更广可靠性或分布式野心；当前工作必须先补齐缺失的公共表面，里程碑状态才有资格继续推进。'
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
        'CLI inspection flows for operations, backups, diagnostics, health checks, and rollback points are already real.',
        'Milestone verification already proves backup-before-mutation, diagnostics evidence, rollback evidence, and degraded-state history.',
        'Mainline acceptance is now repeatable through `pnpm acceptance:verify` and the matching CI workflow, but still measures only a partial public surface.'
      ],
      zh: [
        'controller 的 operations、backups、diagnostics、rollback points、event replay 表面已经真实存在。',
        'CLI 的 operations、backups、diagnostics、health checks、rollback points 检查流已经真实存在。',
        '里程碑验证已经证明变更前备份、诊断证据、回滚证据与 degraded 状态历史。',
        '主线验收现在已经可以通过 `pnpm acceptance:verify` 与对应 CI workflow 重复执行，但它衡量的仍然只是部分公共表面。'
      ]
    },
    blockingGaps: {
      en: [
        'Real `/hosts`, `/bridge-rules`, and `/exposure-policies` resources are still missing.',
        'GitHub runner parity still needs idempotent teardown in the one-host verification flow to keep `mainline-acceptance` green.',
        'Web roadmap IA still relies on mock-only overview, host detail, and operations shells.',
        'Agent steady-state service over HTTP over Tailscale is still missing.',
        'Milestone 1 wording still cannot advance until Unit 1 through Unit 4 close the public-surface gap.'
      ],
      zh: [
        '真实 `/hosts`、`/bridge-rules`、`/exposure-policies` 资源仍然缺失。',
        'one-host 验证流还需要补上幂等 teardown，GitHub runner 一致性下的 `mainline-acceptance` 才能持续保持绿色。',
        'Web 的 roadmap 信息架构仍然依赖 mock-only 的 overview、host detail、operations shell。',
        '基于 HTTP over Tailscale 的 agent 稳态服务仍然缺失。',
        '在 Unit 1 到 Unit 4 补齐公共表面缺口之前，里程碑 1 文案都还不能继续提升。'
      ]
    },
    developerFocus: {
      en: [
        'Unit 0: harden the one-host verification teardown so GitHub runner parity keeps `mainline-acceptance` green.',
        'Unit 1: build controller source-of-truth resources for hosts, rules, and policies.',
        'Unit 2 + Unit 3: mirror those resources into CLI and live web routes without losing current verification coverage.',
        'Unit 4 + Unit 5: keep Milestone 1 proof green while the agent boundary hardens and docs are resynced.'
      ],
      zh: [
        'Unit 0：先把 one-host 验证 teardown 加固成幂等，让 GitHub runner 一致性下的 `mainline-acceptance` 持续为绿。',
        'Unit 1：先补齐 controller 中作为真源的 hosts、rules、policies 资源。',
        'Unit 2 + Unit 3：在不丢失当前验证覆盖的前提下，把这些资源同步到 CLI 和 live Web 路由。',
        'Unit 4 + Unit 5：在 agent 边界加固和文档重同步过程中，保持里程碑 1 验证持续为绿。'
      ]
    },
    dependencies: [],
    docs: ['product-spec', 'v1-architecture', 'contract-strategy', 'ui-information-architecture', 'milestones']
  },
  {
    id: 'm2',
    stage: 'next',
    title: { en: 'Milestone 2: Engineering Reliability', zh: '里程碑 2：Engineering Reliability' },
    status: { en: 'Reliability Slice Started', zh: '可靠性切片已启动' },
    summary: {
      en: 'Strengthen the B-state slice until degraded handling, rollback confidence, and drift visibility become operationally trustworthy; branch-level reliability work exists, but acceptance still depends on live cross-surface parity.',
      zh: '把 B 状态切片强化到 degraded 处理、rollback 信心和 drift 可见性都真正值得信任；当前分支已经有可靠性切片，但验收仍依赖真实跨界面一致性。'
    },
    decision: {
      en: 'Reliability stays ahead of platform expansion, but it also cannot be treated as accepted while the missing host/rule/policy surfaces still block truthful Web, CLI, and API alignment.',
      zh: '可靠性仍然优先于平台扩展，但在缺失的 host/rule/policy 表面仍阻碍 Web、CLI、API 真实对齐之前，也不能把它当作已经验收完成。'
    },
    productOutcomes: {
      en: ['Degraded state becomes operationally visible across live surfaces.', 'Backup policy becomes explicit and enforceable with matching evidence trails.', 'Diagnostics and operations views mature without depending on mock-only presentation.'],
      zh: ['Degraded 状态在真实界面中具备操作可见性。', '备份策略变得明确且可执行，并保持一致的证据链。', 'Diagnostics 与 operations 视图成熟，不再依赖纯 mock 展示。']
    },
    engineeringWork: {
      en: ['GitHub backup integration and remote-backup status.', 'Drift detection and degraded handling on top of real host/rule/policy resources.', 'Stronger rollback UX, artifact retention, and live event/history parity.'],
      zh: ['GitHub 备份接入与远端备份状态。', '建立在真实 host/rule/policy 资源之上的漂移检测与 degraded 处理。', '更强的 rollback 体验、产物保留与实时 event/history 一致性。']
    },
    entryCriteria: {
      en: ['Milestone 1 slice is real end to end.', 'Local backup before mutation is already enforced.', 'Host/rule/operation state semantics are shared across Web, CLI, and API.'],
      zh: ['里程碑 1 切片已经端到端成立。', '变更前本地备份已经是强制行为。', 'Web、CLI 与 API 已共享 host/rule/operation 状态语义。']
    },
    tradeoffs: {
      en: ['Still not broad multi-platform expansion.', 'Still not generic fleet orchestration.', 'PostgreSQL remains optional until there is real pressure.'],
      zh: ['仍然不先做广义多平台扩展。', '仍然不先做通用 fleet 编排。', '在真实压力出现前，PostgreSQL 继续保持可选迁移面。']
    },
    verifiedNow: {
      en: [
        'Backup policy modes already behave differently and expose remote-backup status evidence.',
        'Drift detection already records explicit degraded state and recovery-linked summaries.',
        'Event history, operation detail replay paths, and rollback inspection are already richer than the original skeleton.',
        'The mainline acceptance gate now protects this reliability slice from docs, contract, and test drift while Milestone 1 parity work continues.'
      ],
      zh: [
        'backup policy 模式已经具备真实行为差异，并暴露远端备份状态证据。',
        'drift detection 已经记录显式 degraded 状态与 recovery 关联摘要。',
        'event history、operation detail replay path、rollback inspection 已经比最初骨架更完整。',
        '在里程碑 1 一致性工作继续推进时，主线验收 gate 也开始保护这条可靠性切片，避免文档、契约和测试发生漂移。'
      ]
    },
    blockingGaps: {
      en: [
        'Web still lacks live-data parity for the broader reliability surfaces.',
        'Host/rule/policy public surfaces remain incomplete, so cross-interface reliability cannot yet be declared finished.',
        'Milestone 2 still depends on Milestone 1 parity closure before acceptance language can advance.'
      ],
      zh: [
        'Web 仍然缺少覆盖更广可靠性表面的 live-data 一致性。',
        'host/rule/policy 公共表面仍不完整，所以还不能宣布跨界面可靠性已经完成。',
        '在里程碑 1 一致性闭环前，里程碑 2 仍不能推进到验收完成表述。'
      ]
    },
    developerFocus: {
      en: [
        'Keep Milestone 2 behind the Unit 1 through Unit 4 closure path instead of promoting it from partial evidence.',
        'Harden reliability UX only on the same live host/rule/policy surfaces that replace current mocks.',
        'Keep one evidence model and one acceptance gate across controller, CLI, web, and agent instead of growing parallel reliability stories.'
      ],
      zh: [
        '把里程碑 2 保持在 Unit 1 到 Unit 4 的闭环路径之后，而不是靠部分证据提前升级。',
        '只在替换掉当前 mock 的同一套 live host/rule/policy 表面上继续加固可靠性 UX。',
        '让 controller、CLI、web、agent 继续共用同一套证据模型与验收 gate，而不是分裂出多套可靠性叙事。'
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
        'B-state trust is not yet fully earned.',
        'Controller, CLI, web, and agent public-surface parity is still incomplete.',
        'Starting distributed separation now would amplify documentation and implementation drift.'
      ],
      zh: [
        'B 状态可信度还没有完全挣出来。',
        'controller、CLI、web、agent 的公共表面一致性仍未补齐。',
        '现在就启动分布式拆分，只会放大文档和实现漂移。'
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

export type RoadmapStage = 'now' | 'next' | 'later'

export interface RoadmapMilestone {
  id: string
  stage: RoadmapStage
  title: { en: string; zh: string }
  status: { en: string; zh: string }
  summary: { en: string; zh: string }
  productOutcomes: { en: string[]; zh: string[] }
  engineeringWork: { en: string[]; zh: string[] }
  dependencies: string[]
  docs: string[]
}

export const roadmapMilestones: RoadmapMilestone[] = [
  {
    id: 'm1',
    stage: 'now',
    title: { en: 'Milestone 1: One Host, One Rule, One Rollback', zh: '里程碑 1：One Host, One Rule, One Rollback' },
    status: { en: 'Docs Baseline Locked', zh: '文档基线已锁定' },
    summary: { en: 'Turn the frozen contracts and specs into the first reliable single-host control plane path.', zh: '把已冻结的契约与规格，落成第一条可靠的单主机控制平面路径。' },
    productOutcomes: {
      en: ['A host can become ready.', 'A single bridge rule can become active.', 'Operators can inspect snapshots, diagnostics, and rollback evidence.'],
      zh: ['一台主机可以进入 ready。', '单条 bridge rule 可以进入 active。', '操作者可以检查快照、诊断与回滚证据。']
    },
    engineeringWork: {
      en: ['Contracts foundation and codegen.', 'Controller, CLI, agent, and web skeletons.', 'Backup-before-mutation and diagnostics flow.'],
      zh: ['契约基础设施与 codegen。', 'Controller、CLI、agent 与 web 骨架。', '变更前备份与诊断链路。']
    },
    dependencies: [],
    docs: ['product-spec', 'v1-architecture', 'contract-strategy', 'milestones']
  },
  {
    id: 'm2',
    stage: 'next',
    title: { en: 'Milestone 2: Engineering Reliability', zh: '里程碑 2：Engineering Reliability' },
    status: { en: 'Planned', zh: '计划中' },
    summary: { en: 'Strengthen the system once the single-host golden path exists.', zh: '在单主机金路径成立之后，增强系统的可靠性。' },
    productOutcomes: {
      en: ['Degraded state becomes operationally visible.', 'Backup policy becomes explicit and enforceable.', 'Diagnostics and operations views mature.'],
      zh: ['Degraded 状态具备操作可见性。', '备份策略变得明确且可执行。', 'Diagnostics 与 operations 视图成熟。']
    },
    engineeringWork: {
      en: ['GitHub backup integration.', 'Drift detection and degraded handling.', 'Stronger rollback UX and artifact retention.'],
      zh: ['GitHub 备份接入。', '漂移检测与 degraded 处理。', '更强的 rollback 体验与产物保留策略。']
    },
    dependencies: ['m1'],
    docs: ['backup-rollback-policy', 'snapshot-diagnostics', 'sdk-docker', 'milestones']
  },
  {
    id: 'm3',
    stage: 'later',
    title: { en: 'Milestone 3: Toward C', zh: '里程碑 3：Toward C' },
    status: { en: 'Planned', zh: '计划中' },
    summary: { en: 'Prepare PortManager for broader platform, orchestration, and persistence maturity.', zh: '为更广的平台、编排能力和持久化成熟度做准备。' },
    productOutcomes: {
      en: ['Batch host management.', 'Stronger agent event model.', 'A credible path to broader platform support.'],
      zh: ['批量主机管理。', '更强的 agent 事件模型。', '更可信的多平台扩展路径。']
    },
    engineeringWork: {
      en: ['Platform abstraction growth.', 'PostgreSQL migration or readiness work.', 'Preparation for macOS, mobile, and wider Linux support.'],
      zh: ['平台抽象扩展。', 'PostgreSQL 迁移或迁移准备。', '为 macOS、移动端与更广 Linux 支持做准备。']
    },
    dependencies: ['m2'],
    docs: ['milestones', 'v1-architecture', 'sdk-docker']
  }
]

export const roadmapTracks = {
  product: {
    en: ['Control Plane Baseline', 'Diagnostics Visibility', 'Backup & Rollback Confidence', 'SDK & Docker Maturity', 'Reliability & Expansion'],
    zh: ['控制平面基线', '诊断可见性', '备份与回滚信心', 'SDK 与 Docker 成熟度', '可靠性与扩展']
  },
  engineering: {
    en: ['Contracts', 'Controller', 'Agent', 'CLI', 'Web', 'Backup', 'Diagnostics', 'Drift'],
    zh: ['契约', 'Controller', 'Agent', 'CLI', 'Web', 'Backup', 'Diagnostics', 'Drift']
  }
}

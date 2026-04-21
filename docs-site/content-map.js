export const contentMap = [
  {
    id: 'product-spec',
    sourcePath: 'docs/specs/portmanager-v1-product-spec.md',
    route: 'overview/product-spec',
    audience: 'shared',
    persona: ['operator', 'admin', 'integrator', 'contributor'],
    section: 'overview',
    status: 'active',
    titles: {
      en: 'V1 Product Specification',
      zh: 'V1 产品规格'
    }
  },
  {
    id: 'repo-baseline',
    sourcePath: 'docs/specs/portmanager-repo-baseline.md',
    route: 'overview/repo-baseline',
    audience: 'shared',
    persona: ['contributor', 'admin'],
    section: 'overview',
    status: 'active',
    titles: {
      en: 'Repository Baseline',
      zh: '仓库基线'
    }
  },
  {
    id: 'baseline-checklist',
    sourcePath: 'docs/specs/portmanager-v1-baseline-checklist.md',
    route: 'overview/baseline-checklist',
    audience: 'shared',
    persona: ['contributor', 'admin'],
    section: 'overview',
    status: 'active',
    titles: {
      en: 'Baseline Checklist',
      zh: '基线清单'
    }
  },
  {
    id: 'milestones',
    sourcePath: 'docs/specs/portmanager-milestones.md',
    route: 'roadmap/milestones',
    audience: 'shared',
    persona: ['contributor', 'admin', 'operator'],
    section: 'roadmap',
    status: 'active',
    titles: {
      en: 'Milestones',
      zh: '里程碑'
    }
  },
  {
    id: 'toward-c-strategy',
    sourcePath: 'docs/specs/portmanager-toward-c-strategy.md',
    route: 'roadmap/toward-c-strategy',
    audience: 'shared',
    persona: ['contributor', 'admin', 'operator', 'automation'],
    section: 'roadmap',
    status: 'active',
    titles: {
      en: 'Toward C Strategy',
      zh: 'Toward C 策略'
    }
  },
  {
    id: 'docs-site-architecture',
    sourcePath: 'docs/specs/portmanager-docs-site-architecture.md',
    route: 'architecture/docs-site-architecture',
    audience: 'shared',
    persona: ['contributor', 'admin'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Docs Site Architecture',
      zh: '文档站架构'
    }
  },
  {
    id: 'install-distribution-contract',
    sourcePath: 'docs/specs/portmanager-install-distribution-contract.md',
    route: 'operations/install-distribution-contract',
    audience: 'shared',
    persona: ['admin', 'automation'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Install and Distribution Contract',
      zh: '安装与分发契约'
    }
  },
  {
    id: 'ui-information-architecture',
    sourcePath: 'docs/specs/portmanager-ui-information-architecture.md',
    route: 'architecture/ui-information-architecture',
    audience: 'human',
    persona: ['operator', 'contributor'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Product Web UI Information Architecture',
      zh: '产品 Web UI 信息架构'
    }
  },
  {
    id: 'snapshot-diagnostics',
    sourcePath: 'docs/specs/portmanager-snapshot-diagnostics.md',
    route: 'operations/snapshot-diagnostics',
    audience: 'shared',
    persona: ['operator', 'admin', 'automation'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Snapshot and Diagnostics',
      zh: '快照与诊断'
    }
  },
  {
    id: 'sdk-docker',
    sourcePath: 'docs/specs/portmanager-sdk-and-docker.md',
    route: 'operations/sdk-and-docker-boundary',
    audience: 'shared',
    persona: ['admin', 'integrator', 'contributor'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'SDK and Docker Boundary',
      zh: 'SDK 与 Docker 边界'
    }
  },
  {
    id: 'v1-architecture',
    sourcePath: 'docs/architecture/portmanager-v1-architecture.md',
    route: 'architecture/v1-architecture',
    audience: 'shared',
    persona: ['contributor', 'admin', 'automation'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'V1 Architecture',
      zh: 'V1 架构'
    }
  },
  {
    id: 'contract-strategy',
    sourcePath: 'docs/architecture/portmanager-contract-strategy.md',
    route: 'architecture/contract-strategy',
    audience: 'shared',
    persona: ['integrator', 'contributor', 'automation'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Contract Strategy',
      zh: '契约策略'
    }
  },
  {
    id: 'agent-bootstrap',
    sourcePath: 'docs/architecture/portmanager-agent-bootstrap.md',
    route: 'architecture/agent-bootstrap',
    audience: 'shared',
    persona: ['admin', 'contributor', 'automation'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Agent Bootstrap',
      zh: 'Agent Bootstrap'
    }
  },
  {
    id: 'backup-rollback-policy',
    sourcePath: 'docs/operations/portmanager-backup-rollback-policy.md',
    route: 'operations/backup-rollback-policy',
    audience: 'shared',
    persona: ['operator', 'admin', 'contributor'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Backup and Rollback Policy',
      zh: '备份与回滚策略'
    }
  },
  {
    id: 'real-machine-verification-report',
    sourcePath: 'docs/operations/portmanager-real-machine-verification-report.md',
    route: 'operations/real-machine-verification-report',
    audience: 'shared',
    persona: ['operator', 'admin', 'contributor', 'automation'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Real-Machine Verification Report',
      zh: '真机验证报告'
    }
  },
  {
    id: 'second-target-review-contract',
    sourcePath: 'docs/operations/portmanager-second-target-review-contract.md',
    route: 'operations/second-target-review-contract',
    audience: 'shared',
    persona: ['operator', 'admin', 'contributor', 'automation'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Second-Target Review Contract',
      zh: '第二目标复核契约'
    }
  },
  {
    id: 'debian-12-acceptance-recipe',
    sourcePath: 'docs/operations/portmanager-debian-12-acceptance-recipe.md',
    route: 'operations/debian-12-acceptance-recipe',
    audience: 'shared',
    persona: ['operator', 'admin', 'contributor', 'automation'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Debian 12 Acceptance Recipe',
      zh: 'Debian 12 验收配方'
    }
  },
  {
    id: 'debian-12-operator-ownership',
    sourcePath: 'docs/operations/portmanager-debian-12-operator-ownership.md',
    route: 'operations/debian-12-operator-ownership',
    audience: 'shared',
    persona: ['operator', 'admin', 'contributor'],
    section: 'operations',
    status: 'active',
    titles: {
      en: 'Debian 12 Operator Ownership',
      zh: 'Debian 12 操作员归属'
    }
  },
  {
    id: 'overview-design-baseline',
    sourcePath: 'docs/design/portmanager-overview-design-baseline.md',
    route: 'architecture/overview-design-baseline',
    audience: 'human',
    persona: ['contributor', 'operator'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Product Console Design Baseline',
      zh: '产品控制台设计基线'
    }
  },
  {
    id: 'overview-semantic-mapping',
    sourcePath: 'docs/design/portmanager-overview-semantic-mapping.md',
    route: 'architecture/overview-semantic-mapping',
    audience: 'human',
    persona: ['contributor', 'operator'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Product Console Semantic Mapping',
      zh: '产品控制台语义映射'
    }
  },
  {
    id: 'docs-site-design-baseline',
    sourcePath: 'docs/design/portmanager-docs-site-design-baseline.md',
    route: 'architecture/docs-site-design-baseline',
    audience: 'shared',
    persona: ['contributor', 'admin'],
    section: 'architecture',
    status: 'active',
    titles: {
      en: 'Docs Site Design Baseline',
      zh: '文档站设计基线'
    }
  },
  {
    id: 'contracts-baseline',
    sourcePath: 'packages/contracts/README.md',
    route: 'reference/contracts-baseline',
    audience: 'shared',
    persona: ['integrator', 'automation', 'contributor'],
    section: 'reference',
    status: 'active',
    titles: {
      en: 'Contracts Baseline',
      zh: '契约基线'
    }
  }
]

export const publishableRoots = [
  'docs/specs',
  'docs/architecture',
  'docs/operations',
  'docs/design',
  'packages/contracts/README.md'
]

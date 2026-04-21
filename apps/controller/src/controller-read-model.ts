import type {
  BackupSummary,
  BatchOperationSummary,
  BridgeRule,
  ExposurePolicy,
  HealthCheck,
  HostDetail,
  HostSummary,
  OperationDetail,
  OperationListFilters,
  OperationStore,
  OperationSummary,
  RollbackPoint
} from './operation-store.ts'

export interface ControllerReadModel {
  getBridgeRule(id: string): BridgeRule | null
  getExposurePolicy(hostId: string): ExposurePolicy | null
  getHost(id: string): HostSummary | null
  getHostDetail(id: string): HostDetail | null
  getOperation(id: string): OperationDetail | null
  getRollbackPoint(id: string): RollbackPoint | null
  listBackups(filters?: { hostId?: string; operationId?: string }): BackupSummary[]
  listBridgeRules(filters?: { hostId?: string }): BridgeRule[]
  listDiagnostics(filters?: { hostId?: string; ruleId?: string; state?: string }): OperationDetail[]
  listHealthChecks(filters?: { hostId?: string; ruleId?: string }): HealthCheck[]
  listHosts(): HostSummary[]
  listOperations(filters?: OperationListFilters): OperationSummary[]
  listRollbackPoints(filters?: {
    hostId?: string
    state?: RollbackPoint['state']
  }): RollbackPoint[]
}

function defaultExposurePolicy(hostId: string): ExposurePolicy {
  return {
    hostId,
    allowedSources: ['tailscale'],
    excludedPorts: [22],
    samePortMirror: false,
    conflictPolicy: 'reject',
    backupPolicy: 'best_effort'
  }
}

function operationStartedAtValue(operation: Pick<OperationSummary, 'startedAt'>) {
  const parsed = Date.parse(operation.startedAt)
  return Number.isFinite(parsed) ? parsed : 0
}

function sortChildOperations(operations: OperationSummary[]) {
  return [...operations].sort((left, right) => {
    const startedAtDiff = operationStartedAtValue(left) - operationStartedAtValue(right)
    if (startedAtDiff !== 0) {
      return startedAtDiff
    }

    return left.id.localeCompare(right.id)
  })
}

function buildBatchSummary(childOperations: OperationSummary[]): BatchOperationSummary {
  const sortedChildren = sortChildOperations(childOperations)

  return {
    totalTargets: sortedChildren.length,
    succeededTargets: sortedChildren.filter((operation) => operation.state === 'succeeded').length,
    degradedTargets: sortedChildren.filter((operation) => operation.state === 'degraded').length,
    failedTargets: sortedChildren.filter((operation) => operation.state === 'failed').length,
    targetHostIds: sortedChildren
      .map((operation) => operation.hostId)
      .filter((hostId): hostId is string => Boolean(hostId))
  }
}

export function createControllerReadModel(options: {
  store: Pick<
    OperationStore,
    | 'getBridgeRule'
    | 'getExposurePolicy'
    | 'getHost'
    | 'getHostLabels'
    | 'getOperation'
    | 'getRollbackPoint'
    | 'listBackups'
    | 'listBridgeRules'
    | 'listDiagnostics'
    | 'listHealthChecks'
    | 'listHosts'
    | 'listOperations'
    | 'listRollbackPoints'
  >
}): ControllerReadModel {
  const { store } = options

  return {
    getBridgeRule(id) {
      return store.getBridgeRule(id)
    },
    getExposurePolicy(hostId) {
      return store.getExposurePolicy(hostId)
    },
    getHost(id) {
      return store.getHost(id)
    },
    getHostDetail(id) {
      const host = store.getHost(id)
      if (!host) {
        return null
      }

      return {
        ...host,
        labels: store.getHostLabels(id),
        effectivePolicy: store.getExposurePolicy(id) ?? defaultExposurePolicy(id),
        recentRules: store.listBridgeRules({ hostId: id }).slice(0, 10),
        recentOperations: store.listOperations({ hostId: id }).slice(0, 10)
      }
    },
    getOperation(id) {
      const operation = store.getOperation(id)
      if (!operation) {
        return null
      }

      if (operation.type !== 'batch_apply_policy') {
        return operation
      }

      const childOperations = sortChildOperations(store.listOperations({ parentOperationId: id }))

      return {
        ...operation,
        childOperations,
        batchSummary: buildBatchSummary(childOperations)
      }
    },
    getRollbackPoint(id) {
      return store.getRollbackPoint(id)
    },
    listBackups(filters) {
      return store.listBackups(filters)
    },
    listBridgeRules(filters) {
      return store.listBridgeRules(filters)
    },
    listDiagnostics(filters) {
      return store.listDiagnostics(filters)
    },
    listHealthChecks(filters) {
      return store.listHealthChecks(filters)
    },
    listHosts() {
      return store.listHosts()
    },
    listOperations(filters) {
      return store.listOperations(filters)
    },
    listRollbackPoints(filters) {
      return store.listRollbackPoints(filters)
    }
  }
}

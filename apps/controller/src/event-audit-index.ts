import type { ControllerEvent, ControllerEventBus } from './controller-events.ts'
import type {
  BackupSummary,
  OperationDetail,
  OperationListFilters,
  OperationStore,
  RollbackPoint
} from './operation-store.ts'

export interface EventAuditIndexFilters extends OperationListFilters {
  operationId?: string
  limit?: number
}

export interface EventAuditIndexEntry {
  operation: OperationDetail
  latestEvent: ControllerEvent | null
  eventCount: number
  firstEventAt?: string
  lastEventAt?: string
  latestDiagnostic?: OperationDetail
  backup?: BackupSummary
  rollbackPoint?: RollbackPoint
  linkedArtifacts: string[]
}

export interface EventAuditIndex {
  list(filters?: EventAuditIndexFilters): EventAuditIndexEntry[]
}

function operationMomentValue(operation: Pick<OperationDetail, 'startedAt' | 'finishedAt'>) {
  const value = Date.parse(operation.finishedAt ?? operation.startedAt ?? '')
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY
}

function eventMomentValue(event: Pick<ControllerEvent, 'emittedAt'>) {
  const value = Date.parse(event.emittedAt)
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY
}

function dedupeStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function latestDiagnosticFor(
  store: Pick<OperationStore, 'listDiagnostics'>,
  operation: OperationDetail
) {
  if (!operation.hostId) {
    return undefined
  }

  if (operation.type === 'diagnostics') {
    return operation
  }

  return store.listDiagnostics({
    hostId: operation.hostId,
    ruleId: operation.ruleId
  })[0]
}

export function createEventAuditIndex(options: {
  store: Pick<
    OperationStore,
    'findBackupByOperationId' | 'getOperation' | 'getRollbackPoint' | 'listDiagnostics' | 'listOperations'
  >
  eventBus: Pick<ControllerEventBus, 'listAll'>
}): EventAuditIndex {
  const { store, eventBus } = options

  return {
    list(filters = {}) {
      const operations = store
        .listOperations({
          hostId: filters.hostId,
          ruleId: filters.ruleId,
          state: filters.state,
          type: filters.type,
          ...(filters.operationId ? {} : {})
        })
        .map((summary) => store.getOperation(summary.id))
        .filter((operation): operation is OperationDetail => Boolean(operation))
        .filter((operation) => {
          if (filters.operationId && operation.id !== filters.operationId) {
            return false
          }

          if (filters.parentOperationId && operation.parentOperationId !== filters.parentOperationId) {
            return false
          }

          return true
        })

      const events = eventBus
        .listAll()
        .filter((event) => {
          if (filters.operationId && event.operationId !== filters.operationId) {
            return false
          }

          if (filters.hostId && event.hostId !== filters.hostId) {
            return false
          }

          if (filters.ruleId && event.ruleId !== filters.ruleId) {
            return false
          }

          return true
        })

      const eventsByOperation = new Map<string, ControllerEvent[]>()
      for (const event of events) {
        const grouped = eventsByOperation.get(event.operationId)
        if (grouped) {
          grouped.push(event)
        } else {
          eventsByOperation.set(event.operationId, [event])
        }
      }

      const entries = operations
        .reduce<EventAuditIndexEntry[]>((result, operation) => {
          const operationEvents = eventsByOperation.get(operation.id) ?? []
          if (operationEvents.length === 0) {
            return result
          }

          const latestEvent = operationEvents[operationEvents.length - 1]
          const firstEvent = operationEvents[0]
          const backup = store.findBackupByOperationId(operation.id) ?? undefined
          const rollbackPoint = operation.rollbackPointId
            ? store.getRollbackPoint(operation.rollbackPointId) ?? undefined
            : undefined
          const latestDiagnostic = latestDiagnosticFor(store, operation)

          result.push({
            operation,
            latestEvent: latestEvent ?? null,
            eventCount: operationEvents.length,
            firstEventAt: firstEvent?.emittedAt,
            lastEventAt: latestEvent?.emittedAt,
            latestDiagnostic,
            backup,
            rollbackPoint,
            linkedArtifacts: dedupeStrings([
              backup?.manifestPath,
              operation.snapshotResult?.artifactPath
            ])
          })
          return result
        }, [])
        .sort((left, right) => {
          const latestEventDiff =
            eventMomentValue(right.latestEvent ?? { emittedAt: '' }) -
            eventMomentValue(left.latestEvent ?? { emittedAt: '' })
          if (latestEventDiff !== 0) {
            return latestEventDiff
          }

          const operationDiff = operationMomentValue(right.operation) - operationMomentValue(left.operation)
          if (operationDiff !== 0) {
            return operationDiff
          }

          return right.operation.id.localeCompare(left.operation.id)
        })

      const requestedLimit = filters.limit ?? (entries.length || 20)
      const limit = Math.max(1, Math.min(requestedLimit, 200))
      return entries.slice(0, limit)
    }
  }
}

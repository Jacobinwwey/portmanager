import type { ControllerEventBus } from './controller-events.ts'
import type { OperationDetail, OperationStore } from './operation-store.ts'

export interface OperationExecutionResult {
  state?: Extract<OperationDetail['state'], 'succeeded' | 'degraded'>
  resultSummary?: string
  eventStreamUrl?: string
  backupId?: string
  rollbackPointId?: string
  diagnosticResult?: OperationDetail['diagnosticResult']
  snapshotResult?: OperationDetail['snapshotResult']
}

export interface OperationRunner {
  run(
    operationId: string,
    execute: () => Promise<OperationExecutionResult> | OperationExecutionResult
  ): Promise<OperationDetail>
}

export function createOperationRunner(options: {
  store: OperationStore
  eventBus: ControllerEventBus
}): OperationRunner {
  const { store, eventBus } = options

  function eventLevelFromState(state: OperationDetail['state']) {
    if (state === 'succeeded') {
      return 'success' as const
    }

    if (state === 'degraded' || state === 'cancelled') {
      return 'warn' as const
    }

    if (state === 'failed') {
      return 'error' as const
    }

    return 'info' as const
  }

  function eventSummary(operation: OperationDetail) {
    if (operation.resultSummary) {
      return operation.resultSummary
    }

    return `${operation.type} entered ${operation.state}`
  }

  function publish(operation: OperationDetail) {
    eventBus.publish({
      id: `evt_${operation.id}_${operation.state}_${Date.now()}`,
      kind: 'operation_state_changed',
      operationId: operation.id,
      operationType: operation.type,
      state: operation.state,
      level: eventLevelFromState(operation.state),
      summary: eventSummary(operation),
      hostId: operation.hostId,
      ruleId: operation.ruleId,
      emittedAt: new Date().toISOString()
    })
  }

  return {
    async run(operationId, execute) {
      const running = store.markRunning(operationId)
      publish(running)

      try {
        const result = await execute()
        const succeeded = store.markFinished(operationId, {
          state: result.state ?? 'succeeded',
          resultSummary: result.resultSummary,
          eventStreamUrl: result.eventStreamUrl,
          backupId: result.backupId,
          rollbackPointId: result.rollbackPointId,
          diagnosticResult: result.diagnosticResult,
          snapshotResult: result.snapshotResult
        })
        publish(succeeded)
        return succeeded
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const failed = store.markFinished(operationId, {
          state: 'failed',
          resultSummary: message
        })
        publish(failed)
        throw error
      }
    }
  }
}

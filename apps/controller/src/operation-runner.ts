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

  function publish(operation: OperationDetail) {
    eventBus.publish({
      kind: 'operation_state_changed',
      operationId: operation.id,
      state: operation.state,
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

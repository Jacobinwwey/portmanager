import type { components } from '@portmanager/typescript-contracts'

export type ControllerOperationState =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'degraded'
  | 'cancelled'

export type ControllerEvent = components['schemas']['OperationEvent'] & {
  kind: 'operation_state_changed'
}

export type ControllerEventHandler = (event: ControllerEvent) => void

export interface ControllerEventQuery {
  operationId?: string
  hostId?: string
  ruleId?: string
  limit?: number
}

export interface ControllerEventBus {
  publish(event: ControllerEvent): void
  listAll(): ControllerEvent[]
  listRecent(limit?: number): ControllerEvent[]
  subscribe(handler: ControllerEventHandler): () => void
}

export function createControllerEventBus(): ControllerEventBus {
  const handlers = new Set<ControllerEventHandler>()
  const history: ControllerEvent[] = []
  const historyLimit = 128

  return {
    publish(event) {
      history.push(event)
      if (history.length > historyLimit) {
        history.shift()
      }

      for (const handler of handlers) {
        handler(event)
      }
    },
    listAll() {
      return [...history]
    },
    listRecent(limit = history.length) {
      return [...history].slice(-limit).reverse()
    },
    subscribe(handler) {
      handlers.add(handler)
      return () => {
        handlers.delete(handler)
      }
    }
  }
}

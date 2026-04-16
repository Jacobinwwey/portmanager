export type ControllerOperationState = 'queued' | 'running' | 'succeeded' | 'failed' | 'degraded' | 'cancelled'

export interface ControllerEvent {
  kind: 'operation_state_changed'
  operationId: string
  state: ControllerOperationState
  emittedAt: string
}

export type ControllerEventHandler = (event: ControllerEvent) => void

export interface ControllerEventBus {
  publish(event: ControllerEvent): void
  subscribe(handler: ControllerEventHandler): () => void
}

export function createControllerEventBus(): ControllerEventBus {
  const handlers = new Set<ControllerEventHandler>()

  return {
    publish(event) {
      for (const handler of handlers) {
        handler(event)
      }
    },
    subscribe(handler) {
      handlers.add(handler)
      return () => {
        handlers.delete(handler)
      }
    }
  }
}

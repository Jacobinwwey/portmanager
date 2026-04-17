import type {
  ApplyDesiredStateSchema,
  OperationResultSchema,
  RollbackResultSchema,
  RuntimeStateSchema,
  SnapshotManifestSchema
} from '@portmanager/typescript-contracts'

export class AgentClientError extends Error {
  kind: 'invalid_response' | 'remote_error' | 'unreachable'
  status?: number

  constructor(
    message: string,
    options: {
      kind: 'invalid_response' | 'remote_error' | 'unreachable'
      status?: number
    }
  ) {
    super(message)
    this.name = 'AgentClientError'
    this.kind = options.kind
    this.status = options.status
  }
}

interface JsonRequestInit {
  method?: 'GET' | 'POST'
  payload?: unknown
}

async function requestJson<T>(baseUrl: string, pathname: string, init: JsonRequestInit = {}) {
  const target = new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)

  let response: Response
  try {
    response = await fetch(target, {
      method: init.method ?? 'GET',
      headers: init.payload ? { 'content-type': 'application/json' } : undefined,
      body: init.payload ? JSON.stringify(init.payload) : undefined,
      signal: AbortSignal.timeout(500)
    })
  } catch (error) {
    throw new AgentClientError(error instanceof Error ? error.message : String(error), {
      kind: 'unreachable'
    })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    throw new AgentClientError(error instanceof Error ? error.message : String(error), {
      kind: 'invalid_response',
      status: response.status
    })
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : `${response.status} ${response.statusText}`
    throw new AgentClientError(message, {
      kind: response.status >= 500 ? 'remote_error' : 'invalid_response',
      status: response.status
    })
  }

  return payload as T
}

export interface ControllerAgentClient {
  applyDesiredState(baseUrl: string, input: {
    operationId: string
    desiredState: ApplyDesiredStateSchema
  }): Promise<OperationResultSchema>
  collectRuntimeState(baseUrl: string): Promise<RuntimeStateSchema>
  rollback(baseUrl: string, input: {
    operationId: string
    rollbackPointId: string
    restoreFiles: string[]
    notes?: string
  }): Promise<RollbackResultSchema>
  snapshot(baseUrl: string, input: {
    operationId: string
    hostId: string
    backupMode: string
    bundleFiles: string[]
    diagnosticArtifacts?: string[]
  }): Promise<SnapshotManifestSchema>
}

export function createAgentClient(): ControllerAgentClient {
  return {
    applyDesiredState(baseUrl, input) {
      return requestJson(baseUrl, '/apply', {
        method: 'POST',
        payload: input
      })
    },
    collectRuntimeState(baseUrl) {
      return requestJson(baseUrl, '/runtime-state')
    },
    rollback(baseUrl, input) {
      return requestJson(baseUrl, '/rollback', {
        method: 'POST',
        payload: input
      })
    },
    snapshot(baseUrl, input) {
      return requestJson(baseUrl, '/snapshot', {
        method: 'POST',
        payload: input
      })
    }
  }
}

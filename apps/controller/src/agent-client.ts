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

const defaultAgentRequestTimeoutMs = 5_000
const minimumAgentRequestTimeoutMs = 250

interface JsonRequestInit {
  method?: 'GET' | 'POST'
  payload?: unknown
}

export function resolveAgentRequestTimeoutMs(
  value: unknown = process.env.PORTMANAGER_AGENT_REQUEST_TIMEOUT_MS
) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= minimumAgentRequestTimeoutMs) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isInteger(parsed) && parsed >= minimumAgentRequestTimeoutMs) {
      return parsed
    }
  }

  return defaultAgentRequestTimeoutMs
}

async function requestJson<T>(
  baseUrl: string,
  pathname: string,
  init: JsonRequestInit = {},
  options: {
    fetchImpl: typeof fetch
    requestTimeoutMs: number
  }
) {
  const target = new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)

  let response: Response
  try {
    response = await options.fetchImpl(target, {
      method: init.method ?? 'GET',
      headers: init.payload ? { 'content-type': 'application/json' } : undefined,
      body: init.payload ? JSON.stringify(init.payload) : undefined,
      signal: AbortSignal.timeout(options.requestTimeoutMs)
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

export function createAgentClient(options: {
  requestTimeoutMs?: number
  fetchImpl?: typeof fetch
} = {}): ControllerAgentClient {
  const fetchImpl = options.fetchImpl ?? fetch
  const requestTimeoutMs = resolveAgentRequestTimeoutMs(options.requestTimeoutMs)

  return {
    applyDesiredState(baseUrl, input) {
      return requestJson(baseUrl, '/apply', {
        method: 'POST',
        payload: input
      }, {
        fetchImpl,
        requestTimeoutMs
      })
    },
    collectRuntimeState(baseUrl) {
      return requestJson(baseUrl, '/runtime-state', {}, {
        fetchImpl,
        requestTimeoutMs
      })
    },
    rollback(baseUrl, input) {
      return requestJson(baseUrl, '/rollback', {
        method: 'POST',
        payload: input
      }, {
        fetchImpl,
        requestTimeoutMs
      })
    },
    snapshot(baseUrl, input) {
      return requestJson(baseUrl, '/snapshot', {
        method: 'POST',
        payload: input
      }, {
        fetchImpl,
        requestTimeoutMs
      })
    }
  }
}

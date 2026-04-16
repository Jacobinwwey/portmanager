import { mkdirSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'

import type { ControllerEventBus } from './controller-events.ts'
import { createLocalBackupPrimitive } from './local-backup-primitive.ts'
import { createLocalDiagnosticsPrimitive } from './local-diagnostics-primitive.ts'
import type { OperationStore } from './operation-store.ts'
import { createOperationRunner } from './operation-runner.ts'

export interface ControllerServer {
  close(): Promise<void>
  listen(port?: number): Promise<{ port: number; baseUrl: string }>
}

function createOperationId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function sendJson(response: http.ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request: http.IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

export function createControllerServer(options: {
  store: OperationStore
  eventBus: ControllerEventBus
  artifactRoot?: string
}): ControllerServer {
  const { store, eventBus } = options
  const artifactRoot =
    options.artifactRoot ?? path.join(process.cwd(), '.portmanager', 'controller-artifacts')

  mkdirSync(artifactRoot, { recursive: true })

  const runner = createOperationRunner({ store, eventBus })
  const backupPrimitive = createLocalBackupPrimitive({ artifactRoot, store })
  const diagnosticsPrimitive = createLocalDiagnosticsPrimitive({ artifactRoot })
  const subscriptions = new Set<() => void>()

  const server = http.createServer((request, response) => {
    void handleRequest(request, response).catch((error) => {
      sendJson(response, 500, {
        error: 'internal_error',
        message: error instanceof Error ? error.message : String(error)
      })
    })
  })

  async function handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')

    if (request.method === 'GET' && requestUrl.pathname === '/operations') {
      sendJson(response, 200, { items: store.listOperations() })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/events') {
      const rawLimit = Number(requestUrl.searchParams.get('limit') ?? '20')
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 20

      sendJson(response, 200, { items: eventBus.listRecent(limit) })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/backups') {
      sendJson(response, 200, {
        items: store.listBackups({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          operationId: requestUrl.searchParams.get('operationId') ?? undefined
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/health-checks') {
      sendJson(response, 200, {
        items: store.listHealthChecks({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          ruleId: requestUrl.searchParams.get('ruleId') ?? undefined
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/diagnostics') {
      sendJson(response, 200, {
        items: store.listDiagnostics({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          ruleId: requestUrl.searchParams.get('ruleId') ?? undefined
        })
      })
      return
    }

    const driftMatch =
      request.method === 'POST'
        ? requestUrl.pathname.match(/^\/bridge-rules\/([^/]+)\/drift-check$/)
        : null

    if (driftMatch) {
      const payload = await readJsonBody(request)
      const ruleId = decodeURIComponent(driftMatch[1] ?? '')
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const expectedStateHash =
        typeof payload.expectedStateHash === 'string' ? payload.expectedStateHash : undefined
      const observedStateHash =
        typeof payload.observedStateHash === 'string' ? payload.observedStateHash : undefined
      const backupPolicy =
        payload.backupPolicy === 'required' ? 'required' : payload.backupPolicy === 'best_effort' ? 'best_effort' : undefined

      if (!hostId || !expectedStateHash || !observedStateHash || !backupPolicy) {
        sendJson(response, 400, { error: 'invalid_drift_check_request' })
        return
      }

      const operationId = createOperationId('op_verify')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'verify_rule',
        initiator: 'web',
        hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const driftDetected = expectedStateHash !== observedStateHash
          const summary = driftDetected
            ? backupPolicy === 'required'
              ? `drift detected: expected ${expectedStateHash}, observed ${observedStateHash}, rollback inspection required`
              : `drift detected: expected ${expectedStateHash}, observed ${observedStateHash}, best_effort remediation allowed`
            : `bridge verification matched expected state hash ${expectedStateHash}`

          store.createHealthCheck({
            id: `hc_${ruleId}_${operationId}`,
            hostId,
            ruleId,
            category: 'bridge_verify',
            status: driftDetected ? 'degraded' : 'healthy',
            summary,
            backupPolicy
          })

          return {
            state: driftDetected ? 'degraded' : 'succeeded',
            resultSummary: summary
          }
        })
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/backups/run') {
      const payload = await readJsonBody(request)
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : 'host_alpha'
      const mode = payload.mode === 'required' ? 'required' : 'best_effort'
      const operationId = createOperationId('op_backup')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'backup',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const { backup, rollbackPoint } = backupPrimitive.runBackup({
            operationId,
            hostId,
            mode
          })

          return {
            resultSummary: `backup ${backup.id} created with rollback point ${rollbackPoint.id}`,
            backupId: backup.id,
            rollbackPointId: rollbackPoint.id
          }
        })
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/snapshots/diagnostics') {
      const payload = await readJsonBody(request)
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const port =
        typeof payload.port === 'number' && Number.isInteger(payload.port) ? payload.port : undefined

      if (!hostId || !port || port < 1 || port > 65_535) {
        sendJson(response, 400, { error: 'invalid_diagnostics_request' })
        return
      }

      const operationId = createOperationId('op_diag')
      const ruleId = typeof payload.ruleId === 'string' ? payload.ruleId : undefined
      const scheme = payload.scheme === 'https' ? 'https' : 'http'
      const captureSnapshot = payload.captureSnapshot !== false
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'diagnostics',
        initiator: 'web',
        hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const result = await diagnosticsPrimitive.runDiagnostics({
            operationId,
            hostId,
            ruleId,
            port,
            scheme,
            captureSnapshot
          })

          return {
            state: result.state,
            resultSummary: result.resultSummary,
            diagnosticResult: result.diagnosticResult,
            snapshotResult: result.snapshotResult
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/rollback-points') {
      const state = requestUrl.searchParams.get('state')
      sendJson(response, 200, {
        items: store.listRollbackPoints({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          state:
            state === 'ready' || state === 'applied' || state === 'invalid' ? state : undefined
        })
      })
      return
    }

    if (
      request.method === 'POST' &&
      requestUrl.pathname.startsWith('/rollback-points/') &&
      requestUrl.pathname.endsWith('/apply')
    ) {
      const rollbackPointId = requestUrl.pathname
        .slice('/rollback-points/'.length, -'/apply'.length)
        .replace(/\/$/, '')

      const rollbackPoint = store.getRollbackPoint(rollbackPointId)
      if (!rollbackPoint) {
        sendJson(response, 404, { error: 'rollback_point_not_found' })
        return
      }

      const operationId = createOperationId('op_rollback')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'rollback',
        initiator: 'web',
        hostId: rollbackPoint.hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const result = backupPrimitive.applyRollback({
            operationId,
            rollbackPointId
          })

          return {
            resultSummary: `rollback ${result.rollbackPoint.id} applied from ${path.basename(result.rollbackResultPath)}`,
            rollbackPointId: result.rollbackPoint.id
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname.startsWith('/operations/')) {
      const operationId = requestUrl.pathname.slice('/operations/'.length)

      if (operationId === 'events') {
        response.writeHead(200, {
          'cache-control': 'no-cache',
          connection: 'keep-alive',
          'content-type': 'text/event-stream'
        })
        response.write(': connected\n\n')
        for (const event of [...eventBus.listRecent(50)].reverse()) {
          response.write(`id: ${event.id}\n`)
          response.write(`event: ${event.kind}\n`)
          response.write(`data: ${JSON.stringify(event)}\n\n`)
        }

        const unsubscribe = eventBus.subscribe((event) => {
          response.write(`id: ${event.id}\n`)
          response.write(`event: ${event.kind}\n`)
          response.write(`data: ${JSON.stringify(event)}\n\n`)
        })

        subscriptions.add(unsubscribe)
        request.on('close', () => {
          unsubscribe()
          subscriptions.delete(unsubscribe)
        })
        return
      }

      const detail = store.getOperation(operationId)
      if (!detail) {
        sendJson(response, 404, { error: 'operation_not_found' })
        return
      }

      sendJson(response, 200, detail)
      return
    }

    sendJson(response, 404, { error: 'not_found' })
  }

  return {
    async listen(port = 0) {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, '127.0.0.1', () => {
          server.off('error', reject)
          resolve()
        })
      })

      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Controller server failed to bind')
      }

      return {
        port: address.port,
        baseUrl: `http://127.0.0.1:${address.port}`
      }
    },
    async close() {
      for (const unsubscribe of subscriptions) {
        unsubscribe()
      }
      subscriptions.clear()

      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    }
  }
}

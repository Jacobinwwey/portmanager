import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-batch-operations-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
  }
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await fetch(`${baseUrl}/operations/${operationId}`)
    assert.equal(response.status, 200)

    const payload = (await response.json()) as Record<string, unknown>
    if (
      payload.state === 'succeeded' ||
      payload.state === 'failed' ||
      payload.state === 'degraded'
    ) {
      return payload
    }

    await delay(25)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

async function startAgentServer(hostId: string) {
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method === 'POST' && request.url === '/apply') {
      const payload = await readJsonBody(request)
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          schemaVersion: '0.1.0',
          operationId:
            typeof payload.operationId === 'string' ? payload.operationId : `op_agent_${hostId}`,
          type: 'apply',
          state: 'succeeded',
          hostId,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          resultSummary: `agent applied desired state for ${hostId}`
        })
      )
      return
    }

    if (request.method === 'GET' && request.url === '/runtime-state') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          schemaVersion: '0.1.0',
          hostId,
          agentState: 'ready',
          agentVersion: '0.1.0',
          effectiveStateHash: `${hostId}_hash_001`,
          health: {
            summary: `agent ready for ${hostId}`,
            signals: [
              {
                code: 'batch_apply_policy',
                status: 'healthy',
                message: hostId
              }
            ]
          },
          appliedRules: [],
          updatedAt: new Date().toISOString()
        })
      )
      return
    }

    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'not_found' }))
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  assert.ok(address && typeof address !== 'string')

  return {
    server,
    port: address.port
  }
}

test('batch exposure-policy apply creates parent and host-scoped child operations', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const alphaAgent = await startAgentServer('host_alpha')
    const betaAgent = await startAgentServer('host_beta')
    const listening = await server.listen(0)

    try {
      store.createHost({
        id: 'host_alpha',
        name: 'Alpha Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })
      store.createHost({
        id: 'host_beta',
        name: 'Beta Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })

      for (const [hostId, desiredAgentPort] of [
        ['host_alpha', alphaAgent.port],
        ['host_beta', betaAgent.port]
      ] as const) {
        const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sshUser: 'ubuntu',
            desiredAgentPort,
            backupPolicy: 'best_effort'
          })
        })
        assert.equal(bootstrapResponse.status, 202)
        const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
        await waitForTerminalOperation(listening.baseUrl, bootstrapAccepted.operationId)
      }

      const batchResponse = await fetch(
        `${listening.baseUrl}/batch-operations/exposure-policies/apply`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            hostIds: ['host_alpha', 'host_beta'],
            allowedSources: ['tailscale', 'admin'],
            excludedPorts: [22, 8443],
            samePortMirror: true,
            conflictPolicy: 'replace_existing',
            backupPolicy: 'required'
          })
        }
      )

      assert.equal(batchResponse.status, 202)
      const batchAccepted = (await batchResponse.json()) as { operationId: string }
      const batchOperation = await waitForTerminalOperation(
        listening.baseUrl,
        batchAccepted.operationId
      )

      assert.equal(batchOperation.type, 'batch_apply_policy')
      assert.equal(batchOperation.state, 'succeeded')

      const detailResponse = await fetch(
        `${listening.baseUrl}/operations/${batchAccepted.operationId}`
      )
      assert.equal(detailResponse.status, 200)
      const detail = (await detailResponse.json()) as {
        batchSummary?: Record<string, unknown>
        childOperations?: Array<Record<string, unknown>>
      }

      assert.equal(detail.batchSummary?.totalTargets, 2)
      assert.equal(detail.batchSummary?.succeededTargets, 2)
      assert.equal(detail.batchSummary?.degradedTargets, 0)
      assert.deepEqual(
        detail.batchSummary?.targetHostIds,
        ['host_alpha', 'host_beta']
      )
      assert.equal(detail.childOperations?.length, 2)
      assert.deepEqual(
        detail.childOperations?.map((operation) => operation.hostId).sort(),
        ['host_alpha', 'host_beta']
      )
      assert.equal(
        detail.childOperations?.every(
          (operation) =>
            operation.parentOperationId === batchAccepted.operationId &&
            operation.type === 'apply_policy' &&
            operation.state === 'succeeded'
        ),
        true
      )

      const childListResponse = await fetch(
        `${listening.baseUrl}/operations?parentOperationId=${batchAccepted.operationId}`
      )
      assert.equal(childListResponse.status, 200)
      const childList = (await childListResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      assert.equal(childList.items.length, 2)
    } finally {
      alphaAgent.server.close()
      betaAgent.server.close()
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('batch exposure-policy apply keeps partial degradation explicit when one host agent goes unreachable', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const alphaAgent = await startAgentServer('host_alpha')
    const betaAgent = await startAgentServer('host_beta')
    const listening = await server.listen(0)

    try {
      store.createHost({
        id: 'host_alpha',
        name: 'Alpha Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })
      store.createHost({
        id: 'host_beta',
        name: 'Beta Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })

      for (const [hostId, desiredAgentPort] of [
        ['host_alpha', alphaAgent.port],
        ['host_beta', betaAgent.port]
      ] as const) {
        const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sshUser: 'ubuntu',
            desiredAgentPort,
            backupPolicy: 'best_effort'
          })
        })
        assert.equal(bootstrapResponse.status, 202)
        const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
        await waitForTerminalOperation(listening.baseUrl, bootstrapAccepted.operationId)
      }

      await new Promise<void>((resolve, reject) => {
        betaAgent.server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })

      const batchResponse = await fetch(
        `${listening.baseUrl}/batch-operations/exposure-policies/apply`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            hostIds: ['host_alpha', 'host_beta'],
            allowedSources: ['tailscale'],
            excludedPorts: [22],
            samePortMirror: false,
            conflictPolicy: 'reject',
            backupPolicy: 'best_effort'
          })
        }
      )

      assert.equal(batchResponse.status, 202)
      const batchAccepted = (await batchResponse.json()) as { operationId: string }
      const batchOperation = await waitForTerminalOperation(
        listening.baseUrl,
        batchAccepted.operationId
      )

      assert.equal(batchOperation.type, 'batch_apply_policy')
      assert.equal(batchOperation.state, 'degraded')

      const detailResponse = await fetch(
        `${listening.baseUrl}/operations/${batchAccepted.operationId}`
      )
      assert.equal(detailResponse.status, 200)
      const detail = (await detailResponse.json()) as {
        batchSummary?: Record<string, unknown>
        childOperations?: Array<Record<string, unknown>>
      }
      assert.equal(detail.batchSummary?.totalTargets, 2)
      assert.equal(detail.batchSummary?.succeededTargets, 1)
      assert.equal(detail.batchSummary?.degradedTargets, 1)
      assert.equal(detail.childOperations?.length, 2)

      const childByHost = new Map(
        (detail.childOperations ?? []).map((operation) => [operation.hostId, operation])
      )
      assert.equal(childByHost.get('host_alpha')?.state, 'succeeded')
      assert.equal(childByHost.get('host_beta')?.state, 'degraded')
      assert.equal(store.getHost('host_alpha')?.agentState, 'ready')
      assert.equal(store.getHost('host_beta')?.agentState, 'unreachable')
    } finally {
      alphaAgent.server.close()
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

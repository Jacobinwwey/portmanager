import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-diagnostics-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
  }
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
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

    await delay(20)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

test('controller server captures diagnostic result and webpage snapshot artifacts', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()
  const target = createServer((request, response) => {
    if (request.url === '/') {
      response.writeHead(302, { location: '/status' })
      response.end()
      return
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(`<!doctype html><html><head><title>Alpha Relay Healthy</title></head><body>ok</body></html>`)
  })

  await new Promise<void>((resolve, reject) => {
    target.once('error', reject)
    target.listen(0, '127.0.0.1', () => {
      target.off('error', reject)
      resolve()
    })
  })

  try {
    const address = target.address()
    assert.ok(address && typeof address !== 'string')

    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/snapshots/diagnostics`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_http',
          port: address.port,
          scheme: 'http',
          captureSnapshot: true
        })
      })

      assert.equal(response.status, 202)
      const accepted = (await response.json()) as { operationId: string; state: string }
      assert.equal(accepted.state, 'queued')

      const operation = await waitForTerminalOperation(listening.baseUrl, accepted.operationId)
      assert.equal(operation.state, 'succeeded')
      assert.equal(operation.type, 'diagnostics')

      const diagnosticResult = operation.diagnosticResult as Record<string, unknown>
      assert.equal(diagnosticResult.hostId, 'host_alpha')
      assert.equal(diagnosticResult.ruleId, 'rule_alpha_http')
      assert.equal(diagnosticResult.port, address.port)
      assert.equal(diagnosticResult.tcpReachable, true)
      assert.equal(diagnosticResult.httpStatus, 200)
      assert.equal(diagnosticResult.pageTitle, 'Alpha Relay Healthy')
      assert.match(String(diagnosticResult.finalUrl), /\/status$/)

      const snapshotResult = operation.snapshotResult as Record<string, unknown>
      assert.equal(snapshotResult.hostId, 'host_alpha')
      assert.equal(snapshotResult.ruleId, 'rule_alpha_http')
      assert.equal(snapshotResult.httpStatus, 200)
      assert.equal(snapshotResult.pageTitle, 'Alpha Relay Healthy')
      assert.equal(typeof snapshotResult.artifactPath, 'string')
      assert.equal(existsSync(String(snapshotResult.artifactPath)), true)
      assert.match(readFileSync(String(snapshotResult.artifactPath), 'utf8'), /Alpha Relay Healthy/)

      const diagnosticsResponse = await fetch(`${listening.baseUrl}/diagnostics?hostId=host_alpha`)
      assert.equal(diagnosticsResponse.status, 200)
      const diagnosticsPayload = (await diagnosticsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(diagnosticsPayload.items.length, 1)
      assert.equal(diagnosticsPayload.items[0]?.id, accepted.operationId)
      assert.deepEqual(diagnosticsPayload.items[0]?.snapshotResult, operation.snapshotResult)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      target.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
    rmSync(directory, { recursive: true, force: true })
  }
})

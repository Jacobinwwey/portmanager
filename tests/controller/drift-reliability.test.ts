import test from 'node:test'
import assert from 'node:assert/strict'
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
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-drift-'))
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

test('controller server records degraded drift check and explicit bridge verification evidence', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/bridge-rules/rule_alpha_https/drift-check`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          expectedStateHash: 'expected_hash_alpha',
          observedStateHash: 'observed_hash_bravo',
          backupPolicy: 'required'
        })
      })

      assert.equal(response.status, 202)
      const accepted = (await response.json()) as { operationId: string; state: string }
      assert.equal(accepted.state, 'queued')

      const operation = await waitForTerminalOperation(listening.baseUrl, accepted.operationId)
      assert.equal(operation.type, 'verify_rule')
      assert.equal(operation.state, 'degraded')
      assert.match(String(operation.resultSummary), /drift detected/i)
      assert.equal(operation.eventStreamUrl, '/operations/events')

      const healthResponse = await fetch(
        `${listening.baseUrl}/health-checks?hostId=host_alpha&ruleId=rule_alpha_https`
      )
      assert.equal(healthResponse.status, 200)
      const healthPayload = (await healthResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(healthPayload.items.length, 1)
      assert.equal(healthPayload.items[0]?.category, 'bridge_verify')
      assert.equal(healthPayload.items[0]?.status, 'degraded')
      assert.equal(healthPayload.items[0]?.backupPolicy, 'required')
      assert.match(String(healthPayload.items[0]?.summary), /expected_hash_alpha/i)
      assert.match(String(healthPayload.items[0]?.summary), /rollback inspection required/i)

      const eventsResponse = await fetch(`${listening.baseUrl}/events?limit=4`)
      assert.equal(eventsResponse.status, 200)
      const eventsPayload = (await eventsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      assert.equal(eventsPayload.items[0]?.operationType, 'verify_rule')
      assert.equal(eventsPayload.items[0]?.state, 'degraded')
      assert.equal(eventsPayload.items[0]?.level, 'warn')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

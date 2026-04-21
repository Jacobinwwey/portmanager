import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationRunner,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-consumer-boundary-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('controller server serves consumer-prefixed rest routes beside legacy routes', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus })

    store.createHost({
      id: 'host_alpha',
      name: 'Alpha Relay',
      sshHost: '100.64.0.11',
      sshPort: 22
    })

    const listening = await server.listen(0)

    try {
      const legacyResponse = await fetch(`${listening.baseUrl}/hosts`)
      const consumerResponse = await fetch(`${listening.baseUrl}/api/controller/hosts`)

      assert.equal(legacyResponse.status, 200)
      assert.equal(consumerResponse.status, 200)

      const legacyPayload = (await legacyResponse.json()) as {
        items: Array<{ id: string; name: string }>
      }
      const consumerPayload = (await consumerResponse.json()) as {
        items: Array<{ id: string; name: string }>
      }

      assert.deepEqual(consumerPayload, legacyPayload)
      assert.equal(consumerPayload.items[0]?.id, 'host_alpha')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server replays sse through consumer-prefixed routes', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_consumer_boundary_001',
      type: 'apply_policy',
      initiator: 'web',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    const listening = await server.listen(0)

    try {
      await runner.run('op_consumer_boundary_001', async () => {
        await delay(5)
        return {
          resultSummary: 'consumer boundary replay is alive'
        }
      })

      const response = await fetch(
        `${listening.baseUrl}/api/controller/operations/events?operationId=op_consumer_boundary_001`,
        {
          headers: {
            accept: 'text/event-stream'
          }
        }
      )
      assert.equal(response.status, 200)

      const reader = response.body?.getReader()
      assert.ok(reader)

      const decoder = new TextDecoder()
      let received = ''
      while (!received.includes('consumer boundary replay is alive')) {
        const next = await reader.read()
        if (next.done) {
          break
        }
        received += decoder.decode(next.value, { stream: true })
      }

      await reader.cancel()

      assert.match(received, /event: operation_state_changed/)
      assert.match(received, /consumer boundary replay is alive/)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

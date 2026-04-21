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
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-events-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('controller server replays structured event stream entries and exposes recent history', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_events_001',
      type: 'apply_policy',
      initiator: 'web',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    const listening = await server.listen(0)

    try {
      await runner.run('op_events_001', async () => {
        await delay(5)
        return {
          resultSummary: 'rule_alpha_https applied and awaiting diagnostics'
        }
      })

      const detailResponse = await fetch(`${listening.baseUrl}/operations/op_events_001`)
      assert.equal(detailResponse.status, 200)
      const detail = (await detailResponse.json()) as Record<string, unknown>
      assert.equal(detail.eventStreamUrl, '/operations/events?operationId=op_events_001')

      const eventsResponse = await fetch(`${listening.baseUrl}/events?limit=5`)
      assert.equal(eventsResponse.status, 200)
      const eventsPayload = (await eventsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(eventsPayload.items.length >= 2, true)
      assert.equal(eventsPayload.items[0]?.kind, 'operation_state_changed')
      assert.equal(eventsPayload.items[0]?.operationId, 'op_events_001')
      assert.equal(eventsPayload.items[0]?.operationType, 'apply_policy')
      assert.equal(eventsPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(eventsPayload.items[0]?.ruleId, 'rule_alpha_https')
      assert.equal(eventsPayload.items[0]?.state, 'succeeded')
      assert.equal(eventsPayload.items[0]?.level, 'success')
      assert.equal(
        eventsPayload.items[0]?.summary,
        'rule_alpha_https applied and awaiting diagnostics'
      )

      const sseResponse = await fetch(`${listening.baseUrl}/operations/events`, {
        headers: {
          accept: 'text/event-stream'
        }
      })
      assert.equal(sseResponse.status, 200)

      const reader = sseResponse.body?.getReader()
      assert.ok(reader)

      const decoder = new TextDecoder()
      let received = ''
      while (!received.includes('rule_alpha_https applied and awaiting diagnostics')) {
        const next = await reader.read()
        if (next.done) {
          break
        }
        received += decoder.decode(next.value, { stream: true })
      }

      await reader.cancel()

      assert.match(received, /event: operation_state_changed/)
      assert.match(received, /"operationType":"apply_policy"/)
      assert.match(received, /"level":"success"/)
      assert.match(received, /"summary":"rule_alpha_https applied and awaiting diagnostics"/)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server filters event history and SSE replay for one selected operation', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_events_target_001',
      type: 'backup',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_events_other_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    const listening = await server.listen(0)

    try {
      await runner.run('op_events_target_001', async () => {
        await delay(5)
        return {
          state: 'degraded',
          resultSummary: 'required GitHub backup is not configured'
        }
      })

      await runner.run('op_events_other_001', async () => ({
        resultSummary: 'diagnostics refreshed relay evidence'
      }))

      const eventsResponse = await fetch(
        `${listening.baseUrl}/events?limit=10&operationId=op_events_target_001`
      )
      assert.equal(eventsResponse.status, 200)
      const eventsPayload = (await eventsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(eventsPayload.items.length, 2)
      assert.equal(
        eventsPayload.items.every((event) => event.operationId === 'op_events_target_001'),
        true
      )
      assert.equal(eventsPayload.items[0]?.state, 'degraded')
      assert.equal(eventsPayload.items[1]?.state, 'running')

      const auditIndexResponse = await fetch(
        `${listening.baseUrl}/event-audit-index?operationId=op_events_target_001`
      )
      assert.equal(auditIndexResponse.status, 200)
      const auditIndexPayload = (await auditIndexResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(auditIndexPayload.items.length, 1)
      assert.equal(
        (auditIndexPayload.items[0]?.latestEvent as Record<string, unknown>)?.summary,
        eventsPayload.items[0]?.summary
      )
      assert.equal(
        (auditIndexPayload.items[0]?.latestEvent as Record<string, unknown>)?.state,
        eventsPayload.items[0]?.state
      )

      const sseResponse = await fetch(
        `${listening.baseUrl}/operations/events?operationId=op_events_target_001`,
        {
          headers: {
            accept: 'text/event-stream'
          }
        }
      )
      assert.equal(sseResponse.status, 200)

      const reader = sseResponse.body?.getReader()
      assert.ok(reader)

      const decoder = new TextDecoder()
      let received = ''
      while (!received.includes('required GitHub backup is not configured')) {
        const next = await reader.read()
        if (next.done) {
          break
        }
        received += decoder.decode(next.value, { stream: true })
      }

      await reader.cancel()

      assert.match(received, /op_events_target_001/)
      assert.doesNotMatch(received, /op_events_other_001/)
      assert.match(received, /required GitHub backup is not configured/)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

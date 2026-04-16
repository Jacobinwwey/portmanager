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
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-controller-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('operation store enqueues and lists queued operations from SQLite state', () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const accepted = store.enqueueOperation({
      id: 'op_bootstrap_001',
      type: 'bootstrap_host',
      initiator: 'cli',
      hostId: 'host_alpha'
    })

    assert.deepEqual(accepted, {
      operationId: 'op_bootstrap_001',
      state: 'queued'
    })

    assert.deepEqual(store.listOperations(), [
      {
        id: 'op_bootstrap_001',
        type: 'bootstrap_host',
        state: 'queued',
        hostId: 'host_alpha',
        ruleId: undefined,
        startedAt: store.getOperation('op_bootstrap_001')?.startedAt,
        finishedAt: undefined
      }
    ])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('operation runner moves queued operation to succeeded and emits state transitions', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })

    store.enqueueOperation({
      id: 'op_probe_001',
      type: 'probe_host',
      initiator: 'automation',
      hostId: 'host_beta'
    })

    const events: string[] = []
    const unsubscribe = eventBus.subscribe((event) => {
      events.push(`${event.kind}:${event.operationId}:${event.state}`)
    })

    const detail = await runner.run('op_probe_001', async () => {
      return {
        resultSummary: 'probe complete'
      }
    })

    unsubscribe()

    assert.equal(detail.state, 'succeeded')
    assert.equal(detail.initiator, 'automation')
    assert.equal(detail.finishedAt !== undefined, true)
    assert.deepEqual(events, [
      'operation_state_changed:op_probe_001:running',
      'operation_state_changed:op_probe_001:succeeded'
    ])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('operation runner marks failed operation and keeps error summary', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })

    store.enqueueOperation({
      id: 'op_diag_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_gamma'
    })

    await assert.rejects(
      () =>
        runner.run('op_diag_001', async () => {
          throw new Error('tcp unreachable')
        }),
      /tcp unreachable/
    )

    const detail = store.getOperation('op_diag_001')
    assert.equal(detail?.state, 'failed')
    assert.equal(detail?.finishedAt !== undefined, true)
    assert.equal(detail?.resultSummary, 'tcp unreachable')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server exposes queued operations over REST', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_rest_001',
      type: 'create_rule',
      initiator: 'web',
      hostId: 'host_delta',
      ruleId: 'rule_delta'
    })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/operations`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as { items: Array<{ id: string; state: string }> }
      assert.deepEqual(payload.items, [
        {
          id: 'op_rest_001',
          type: 'create_rule',
          state: 'queued',
          hostId: 'host_delta',
          ruleId: 'rule_delta',
          startedAt: store.getOperation('op_rest_001')?.startedAt
        }
      ])
    } finally {
      await server.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server streams operation state transitions over SSE', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_sse_001',
      type: 'probe_host',
      initiator: 'automation',
      hostId: 'host_epsilon'
    })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/operations/events`, {
        headers: {
          accept: 'text/event-stream'
        }
      })

      assert.equal(response.status, 200)

      const reader = response.body?.getReader()
      assert.ok(reader)

      const runPromise = runner.run('op_sse_001', async () => {
        await delay(10)
        return { resultSummary: 'probe streamed' }
      })

      const decoder = new TextDecoder()
      let received = ''

      while (!received.includes('succeeded')) {
        const next = await reader.read()
        if (next.done) {
          break
        }
        received += decoder.decode(next.value, { stream: true })
      }

      await runPromise
      await reader.cancel()

      assert.match(received, /event: operation_state_changed/)
      assert.match(received, /"operationId":"op_sse_001"/)
      assert.match(received, /"state":"running"/)
      assert.match(received, /"state":"succeeded"/)
    } finally {
      await server.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

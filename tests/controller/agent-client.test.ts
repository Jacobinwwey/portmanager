import test from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

import {
  AgentClientError,
  createAgentClient,
  resolveAgentRequestTimeoutMs
} from '../../apps/controller/src/agent-client.ts'

test('resolveAgentRequestTimeoutMs falls back to sane steady-state defaults', () => {
  assert.equal(resolveAgentRequestTimeoutMs(undefined), 5_000)
  assert.equal(resolveAgentRequestTimeoutMs(''), 5_000)
  assert.equal(resolveAgentRequestTimeoutMs('200'), 5_000)
  assert.equal(resolveAgentRequestTimeoutMs('250'), 250)
  assert.equal(resolveAgentRequestTimeoutMs('1500'), 1_500)
  assert.equal(resolveAgentRequestTimeoutMs(3_000), 3_000)
})

test('agent client honors configured timeout instead of the old 500ms hard stop', async () => {
  const client = createAgentClient({
    requestTimeoutMs: 1_200,
    fetchImpl: async () => {
      await delay(800)

      return new Response(
        JSON.stringify({
          hostId: 'host_alpha',
          agentVersion: '0.1.0',
          appliedRules: []
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }
  })

  const runtimeState = await client.collectRuntimeState('http://127.0.0.1:9999')
  assert.equal(runtimeState.hostId, 'host_alpha')
  assert.equal(runtimeState.agentVersion, '0.1.0')
})

test('agent client still reports unreachable when request exceeds configured timeout', async () => {
  const client = createAgentClient({
    requestTimeoutMs: 300,
    fetchImpl: async (_input, init) => {
      await delay(700)

      if (init?.signal?.aborted) {
        throw init.signal.reason
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }
  })

  await assert.rejects(
    () => client.collectRuntimeState('http://127.0.0.1:9999'),
    (error) =>
      error instanceof AgentClientError &&
      error.kind === 'unreachable'
  )
})

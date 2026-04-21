import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildPersistenceDecisionPack,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-persistence-decision-pack-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('persistence decision pack escalates triggered metrics into explicit cutover review guidance', () => {
  const pack = buildPersistenceDecisionPack({
    backend: 'sqlite',
    databasePath: '/var/lib/portmanager/controller.sqlite',
    status: 'migration_ready',
    migrationTarget: 'postgresql',
    summary: 'readiness counters crossed migration threshold',
    recommendedAction: 'open migration review',
    metrics: {
      operationRows: {
        current: 2200,
        monitor: 500,
        migrationReady: 2000,
        status: 'migration_ready'
      },
      diagnosticRows: {
        current: 50,
        monitor: 200,
        migrationReady: 750,
        status: 'healthy'
      },
      backupRows: {
        current: 210,
        monitor: 200,
        migrationReady: 750,
        status: 'monitor'
      },
      rollbackPointRows: {
        current: 32,
        monitor: 200,
        migrationReady: 750,
        status: 'healthy'
      },
      hostRows: {
        current: 3,
        monitor: 25,
        migrationReady: 100,
        status: 'healthy'
      }
    }
  })

  assert.equal(pack.decisionState, 'review_required')
  assert.equal(pack.reviewRequired, true)
  assert.match(pack.summary, /cutover review must begin/i)
  assert.equal(pack.triggerMetrics[0]?.key, 'operationRows')
  assert.equal(pack.triggerMetrics[0]?.status, 'migration_ready')
  assert.equal(pack.triggerMetrics[1]?.key, 'backupRows')
  assert.equal(pack.nextActions.length >= 2, true)
  assert.equal(pack.readiness.status, 'migration_ready')
})

test('controller server exposes persistence decision pack as explicit controller contract', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({
      persistence: {
        kind: 'sqlite',
        databasePath,
        thresholds: {
          hostRows: { monitor: 1, migrationReady: 2 }
        }
      }
    })
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
      const response = await fetch(`${listening.baseUrl}/persistence-decision-pack`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        backend: string
        migrationTarget: string
        decisionState: string
        reviewRequired: boolean
        summary: string
        nextActions: string[]
        triggerMetrics: Array<{ key: string; status: string }>
        readiness: {
          status: string
          metrics: {
            hostRows: { current: number; status: string }
          }
        }
      }

      assert.equal(payload.backend, 'sqlite')
      assert.equal(payload.migrationTarget, 'postgresql')
      assert.equal(payload.decisionState, 'prepare_review')
      assert.equal(payload.reviewRequired, false)
      assert.match(payload.summary, /review prep/i)
      assert.equal(payload.nextActions.length >= 2, true)
      assert.equal(payload.triggerMetrics[0]?.key, 'hostRows')
      assert.equal(payload.triggerMetrics[0]?.status, 'monitor')
      assert.equal(payload.readiness.status, 'monitor')
      assert.equal(payload.readiness.metrics.hostRows.current, 1)
      assert.equal(payload.readiness.metrics.hostRows.status, 'monitor')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-persistence-readiness-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('controller server exposes persistence readiness as explicit controller contract', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({
      persistence: {
        kind: 'sqlite',
        databasePath,
        thresholds: {
          operationRows: { monitor: 2, migrationReady: 3 },
          backupRows: { monitor: 1, migrationReady: 2 },
          rollbackPointRows: { monitor: 1, migrationReady: 2 }
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
    store.enqueueOperation({
      id: 'op_apply_001',
      type: 'apply_policy',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_diag_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_backup_001',
      type: 'backup',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.createBackup({
      id: 'backup_001',
      hostId: 'host_alpha',
      operationId: 'op_backup_001',
      backupMode: 'required',
      localStatus: 'succeeded'
    })
    store.createRollbackPoint({
      id: 'rp_001',
      hostId: 'host_alpha',
      operationId: 'op_backup_001'
    })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/persistence-readiness`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        backend: string
        status: string
        migrationTarget: string
        summary: string
        recommendedAction: string
        metrics: {
          operationRows: { current: number; status: string }
          backupRows: { current: number; status: string }
          rollbackPointRows: { current: number; status: string }
        }
      }

      assert.equal(payload.backend, 'sqlite')
      assert.equal(payload.status, 'migration_ready')
      assert.equal(payload.migrationTarget, 'postgresql')
      assert.match(payload.summary, /SQLite remains the active default store/u)
      assert.match(payload.recommendedAction, /PostgreSQL/u)
      assert.equal(payload.metrics.operationRows.current, 3)
      assert.equal(payload.metrics.operationRows.status, 'migration_ready')
      assert.equal(payload.metrics.backupRows.current, 1)
      assert.equal(payload.metrics.backupRows.status, 'monitor')
      assert.equal(payload.metrics.rollbackPointRows.current, 1)
      assert.equal(payload.metrics.rollbackPointRows.status, 'monitor')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

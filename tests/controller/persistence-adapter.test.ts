import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  createOperationStore,
  createPersistenceAdapter
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-persistence-adapter-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('sqlite persistence adapter preserves store behavior and publishes healthy readiness by default', () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({
      persistence: {
        kind: 'sqlite',
        databasePath
      }
    })

    try {
      const host = store.createHost({
        id: 'host_alpha',
        name: 'Alpha',
        labels: ['edge'],
        sshHost: '100.64.0.11',
        sshPort: 22
      })

      assert.equal(host.id, 'host_alpha')
      assert.deepEqual(store.getHostLabels('host_alpha'), ['edge'])
      assert.equal(store.getExposurePolicy('host_alpha')?.backupPolicy, 'best_effort')

      const readiness = store.getPersistenceReadiness()
      assert.equal(readiness.backend, 'sqlite')
      assert.equal(readiness.status, 'healthy')
      assert.equal(readiness.metrics.operationRows.current, 0)
      assert.equal(readiness.metrics.hostRows.current, 1)
      assert.match(readiness.summary, /SQLite remains the active default store/u)
    } finally {
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('sqlite persistence readiness escalates when pressure thresholds are crossed', () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const adapter = createPersistenceAdapter({
      kind: 'sqlite',
      databasePath,
      thresholds: {
        operationRows: { monitor: 2, migrationReady: 3 },
        diagnosticRows: { monitor: 1, migrationReady: 2 },
        backupRows: { monitor: 1, migrationReady: 2 },
        rollbackPointRows: { monitor: 1, migrationReady: 2 }
      }
    })
    const store = createOperationStore({ persistence: adapter })

    try {
      store.createHost({
        id: 'host_alpha',
        name: 'Alpha',
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

      const readiness = store.getPersistenceReadiness()
      assert.equal(readiness.status, 'migration_ready')
      assert.equal(readiness.metrics.operationRows.current, 3)
      assert.equal(readiness.metrics.operationRows.status, 'migration_ready')
      assert.equal(readiness.metrics.backupRows.status, 'monitor')
      assert.equal(readiness.metrics.rollbackPointRows.status, 'monitor')
      assert.match(readiness.recommendedAction, /PostgreSQL/u)
    } finally {
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('persistence adapter rejects unsupported or incomplete configuration clearly', () => {
  assert.throws(
    () => {
      createPersistenceAdapter({
        kind: 'sqlite',
        databasePath: ''
      })
    },
    /requires a databasePath/u
  )

  assert.throws(
    () => {
      createPersistenceAdapter({
        kind: 'postgresql',
        connectionString: 'postgresql://localhost/portmanager'
      })
    },
    /not enabled yet/u
  )
})

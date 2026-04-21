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
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-event-audit-index-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('controller server exposes indexed event and audit entries with stable ordering and linked evidence', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_backup_required_001',
      type: 'backup',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_diag_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    store.createRollbackPoint({
      id: 'rp_alpha_002',
      hostId: 'host_alpha',
      operationId: 'op_backup_required_001',
      state: 'ready'
    })
    store.createBackup({
      id: 'backup_alpha_002',
      hostId: 'host_alpha',
      operationId: 'op_backup_required_001',
      backupMode: 'required',
      localStatus: 'succeeded',
      githubStatus: 'not_configured',
      manifestPath: '/var/lib/portmanager/backups/backup_alpha_002/manifest.json'
    })

    await runner.run('op_backup_required_001', async () => ({
      state: 'degraded',
      resultSummary: 'required GitHub backup is not configured',
      backupId: 'backup_alpha_002',
      rollbackPointId: 'rp_alpha_002'
    }))

    await delay(5)

    await runner.run('op_diag_001', async () => ({
      resultSummary: 'diagnostics confirmed https relay and refreshed host readiness evidence',
      diagnosticResult: {
        schemaVersion: '0.1.0',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        port: 443,
        tcpReachable: true,
        httpStatus: 200,
        pageTitle: 'Alpha Relay Healthy',
        finalUrl: 'https://alpha.example.test/status',
        tls: {
          enabled: true
        },
        capturedAt: '2026-04-21T10:12:00.000Z'
      },
      snapshotResult: {
        schemaVersion: '0.1.0',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        port: 443,
        artifactPath: '/var/lib/portmanager/diagnostics/op_diag_001/page-snapshot.svg',
        pageTitle: 'Alpha Relay Healthy',
        httpStatus: 200,
        viewport: {
          width: 1280,
          height: 720
        },
        capturedAt: '2026-04-21T10:12:00.000Z'
      }
    }))

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/event-audit-index?hostId=host_alpha&limit=10`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(payload.items.length, 2)
      assert.equal(
        (payload.items[0]?.operation as Record<string, unknown>)?.id,
        'op_diag_001'
      )
      assert.equal(payload.items[0]?.eventCount, 2)
      assert.equal(
        (payload.items[0]?.latestEvent as Record<string, unknown>)?.state,
        'succeeded'
      )
      assert.equal(
        (payload.items[0]?.latestDiagnostic as Record<string, unknown>)?.id,
        'op_diag_001'
      )
      assert.deepEqual(payload.items[0]?.linkedArtifacts, [
        '/var/lib/portmanager/diagnostics/op_diag_001/page-snapshot.svg'
      ])

      assert.equal(
        (payload.items[1]?.operation as Record<string, unknown>)?.id,
        'op_backup_required_001'
      )
      assert.equal(
        ((payload.items[1]?.backup as Record<string, unknown>) ?? {}).id,
        'backup_alpha_002'
      )
      assert.equal(
        ((payload.items[1]?.rollbackPoint as Record<string, unknown>) ?? {}).id,
        'rp_alpha_002'
      )
      assert.deepEqual(payload.items[1]?.linkedArtifacts, [
        '/var/lib/portmanager/backups/backup_alpha_002/manifest.json'
      ])
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server filters indexed event and audit review to one degraded operation', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const server = createControllerServer({ store, eventBus })

    store.enqueueOperation({
      id: 'op_backup_required_001',
      type: 'backup',
      initiator: 'web',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_diag_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_alpha'
    })

    await runner.run('op_backup_required_001', async () => ({
      state: 'degraded',
      resultSummary: 'required GitHub backup is not configured'
    }))
    await delay(5)
    await runner.run('op_diag_001', async () => ({
      resultSummary: 'diagnostics refreshed relay evidence'
    }))

    const listening = await server.listen(0)

    try {
      const response = await fetch(
        `${listening.baseUrl}/event-audit-index?operationId=op_backup_required_001`
      )
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(payload.items.length, 1)
      assert.equal(payload.items[0]?.eventCount, 2)
      assert.equal(
        (payload.items[0]?.latestEvent as Record<string, unknown>)?.summary,
        'required GitHub backup is not configured'
      )
      assert.equal(
        (payload.items[0]?.latestEvent as Record<string, unknown>)?.state,
        'degraded'
      )
      assert.equal(
        typeof payload.items[0]?.firstEventAt === 'string' &&
          typeof payload.items[0]?.lastEventAt === 'string' &&
          String(payload.items[0]?.firstEventAt) < String(payload.items[0]?.lastEventAt),
        true
      )
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

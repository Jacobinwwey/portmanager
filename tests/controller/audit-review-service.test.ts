import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createAuditReviewService,
  createControllerEventBus,
  createOperationRunner,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-audit-review-service-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('audit review service keeps replay ordering aligned with indexed evidence', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const auditReview = createAuditReviewService({ store, eventBus })

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

    const history = auditReview.listEventHistory({ hostId: 'host_alpha', limit: 10 })
    assert.equal(history.length, 4)
    assert.equal(history[0]?.operationId, 'op_diag_001')
    assert.equal(history[0]?.state, 'succeeded')
    assert.equal(history[1]?.operationId, 'op_diag_001')
    assert.equal(history[2]?.operationId, 'op_backup_required_001')
    assert.equal(history[2]?.state, 'degraded')

    const replay = auditReview.listReplayEvents({ hostId: 'host_alpha', limit: 10 })
    assert.equal(replay.length, 4)
    assert.equal(replay[0]?.operationId, 'op_backup_required_001')
    assert.equal(replay[0]?.state, 'running')
    assert.equal(replay[3]?.operationId, 'op_diag_001')
    assert.equal(replay[3]?.state, 'succeeded')

    const auditEntries = auditReview.listAuditEntries({ hostId: 'host_alpha', limit: 10 })
    assert.equal(auditEntries.length, 2)
    assert.deepEqual(
      auditEntries.map((entry) => entry.operation.id),
      ['op_diag_001', 'op_backup_required_001']
    )
    assert.equal(auditEntries[0]?.latestEvent?.summary, history[0]?.summary)
    assert.equal(auditEntries[0]?.latestDiagnostic?.id, 'op_diag_001')
    assert.deepEqual(auditEntries[0]?.linkedArtifacts, [
      '/var/lib/portmanager/diagnostics/op_diag_001/page-snapshot.svg'
    ])
    assert.equal(auditEntries[1]?.backup?.id, 'backup_alpha_002')
    assert.equal(auditEntries[1]?.rollbackPoint?.id, 'rp_alpha_002')
    assert.deepEqual(auditEntries[1]?.linkedArtifacts, [
      '/var/lib/portmanager/backups/backup_alpha_002/manifest.json'
    ])

    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('audit review service keeps batch children and degraded evidence inside one review boundary', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const runner = createOperationRunner({ store, eventBus })
    const auditReview = createAuditReviewService({ store, eventBus })

    store.enqueueOperation({
      id: 'op_batch_apply_policy_001',
      type: 'batch_apply_policy',
      initiator: 'web'
    })
    store.enqueueOperation({
      id: 'op_apply_alpha_001',
      type: 'apply_policy',
      initiator: 'web',
      hostId: 'host_alpha',
      parentOperationId: 'op_batch_apply_policy_001',
      ruleId: 'rule_alpha_https'
    })
    store.enqueueOperation({
      id: 'op_apply_beta_001',
      type: 'apply_policy',
      initiator: 'web',
      hostId: 'host_beta',
      parentOperationId: 'op_batch_apply_policy_001',
      ruleId: 'rule_beta_https'
    })
    store.enqueueOperation({
      id: 'op_diag_alpha_001',
      type: 'diagnostics',
      initiator: 'web',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    store.createRollbackPoint({
      id: 'rp_alpha_apply_001',
      hostId: 'host_alpha',
      operationId: 'op_apply_alpha_001',
      state: 'ready'
    })
    store.createBackup({
      id: 'backup_alpha_apply_001',
      hostId: 'host_alpha',
      operationId: 'op_apply_alpha_001',
      backupMode: 'required',
      localStatus: 'succeeded',
      githubStatus: 'not_configured',
      manifestPath: '/var/lib/portmanager/backups/backup_alpha_apply_001/manifest.json'
    })

    await runner.run('op_batch_apply_policy_001', async () => ({
      resultSummary: 'batch policy applied for 2 hosts'
    }))
    await runner.run('op_apply_alpha_001', async () => ({
      state: 'degraded',
      resultSummary: 'host alpha needs diagnostics review before exposure stays trusted',
      backupId: 'backup_alpha_apply_001',
      rollbackPointId: 'rp_alpha_apply_001'
    }))
    await delay(5)
    await runner.run('op_diag_alpha_001', async () => ({
      resultSummary: 'diagnostics captured alpha replay evidence',
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
        capturedAt: '2026-04-21T10:22:00.000Z'
      },
      snapshotResult: {
        schemaVersion: '0.1.0',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        port: 443,
        artifactPath: '/var/lib/portmanager/diagnostics/op_diag_alpha_001/page-snapshot.svg',
        pageTitle: 'Alpha Relay Healthy',
        httpStatus: 200,
        viewport: {
          width: 1280,
          height: 720
        },
        capturedAt: '2026-04-21T10:22:00.000Z'
      }
    }))
    await delay(5)
    await runner.run('op_apply_beta_001', async () => ({
      resultSummary: 'host beta exposure applied cleanly'
    }))

    const parentReplay = auditReview.listReplayEvents({
      operationId: 'op_batch_apply_policy_001',
      limit: 10
    })
    assert.equal(parentReplay.length, 2)
    assert.equal(parentReplay[0]?.state, 'running')
    assert.equal(parentReplay[1]?.state, 'succeeded')

    const childEntries = auditReview.listAuditEntries({
      parentOperationId: 'op_batch_apply_policy_001',
      limit: 10
    })
    assert.equal(childEntries.length, 2)
    assert.equal(childEntries[0]?.operation.parentOperationId, 'op_batch_apply_policy_001')
    assert.equal(childEntries[0]?.latestEvent?.operationId, 'op_apply_beta_001')
    assert.equal(childEntries[1]?.operation.id, 'op_apply_alpha_001')
    assert.equal(childEntries[1]?.latestDiagnostic?.id, 'op_diag_alpha_001')
    assert.equal(childEntries[1]?.backup?.id, 'backup_alpha_apply_001')
    assert.equal(childEntries[1]?.rollbackPoint?.id, 'rp_alpha_apply_001')
    assert.deepEqual(childEntries[1]?.linkedArtifacts, [
      '/var/lib/portmanager/backups/backup_alpha_apply_001/manifest.json'
    ])

    store.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

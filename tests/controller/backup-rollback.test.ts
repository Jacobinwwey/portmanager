import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-backup-'))
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

    const payload = (await response.json()) as {
      state: string
      resultSummary?: string
    }

    if (payload.state === 'succeeded' || payload.state === 'failed' || payload.state === 'degraded') {
      return payload
    }

    await delay(20)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

test('controller server runs best_effort backup and exposes local-only safety evidence', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          mode: 'best_effort'
        })
      })

      assert.equal(response.status, 202)
      const accepted = (await response.json()) as { operationId: string; state: string }
      assert.equal(accepted.state, 'queued')

      const operation = await waitForTerminalOperation(listening.baseUrl, accepted.operationId)
      assert.equal(operation.state, 'succeeded')
      assert.match(operation.resultSummary ?? '', /best_effort/i)
      assert.match(operation.resultSummary ?? '', /not configured/i)

      const backupsResponse = await fetch(`${listening.baseUrl}/backups`)
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<{
          id: string
          hostId: string
          localStatus: string
          backupMode?: string
          githubStatus?: string
          manifestPath?: string
          operationId?: string
        }>
      }

      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(backupsPayload.items[0]?.localStatus, 'succeeded')
      assert.equal(backupsPayload.items[0]?.backupMode, 'best_effort')
      assert.equal(backupsPayload.items[0]?.githubStatus, 'not_configured')
      assert.equal(backupsPayload.items[0]?.operationId, accepted.operationId)

      const manifestPath = backupsPayload.items[0]?.manifestPath
      assert.ok(manifestPath)

      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        backupMode: string
        operationId: string
        checksums: Array<unknown>
      }
      assert.equal(manifest.operationId, accepted.operationId)
      assert.equal(manifest.backupMode, 'best_effort')
      assert.equal(manifest.checksums.length >= 4, true)

      const rollbackResponse = await fetch(`${listening.baseUrl}/rollback-points`)
      assert.equal(rollbackResponse.status, 200)
      const rollbackPayload = (await rollbackResponse.json()) as {
        items: Array<{
          id: string
          hostId: string
          operationId: string
          state: string
          createdAt: string
        }>
      }

      assert.equal(rollbackPayload.items.length, 1)
      assert.equal(rollbackPayload.items[0]?.id, `rp_${accepted.operationId}`)
      assert.equal(rollbackPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(rollbackPayload.items[0]?.operationId, accepted.operationId)
      assert.equal(rollbackPayload.items[0]?.state, 'ready')
      assert.match(rollbackPayload.items[0]?.createdAt ?? '', /T/)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server marks required backup degraded when remote backup is unavailable', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          mode: 'required'
        })
      })

      assert.equal(response.status, 202)
      const accepted = (await response.json()) as { operationId: string }
      const operation = await waitForTerminalOperation(listening.baseUrl, accepted.operationId)

      assert.equal(operation.state, 'degraded')
      assert.match(operation.resultSummary ?? '', /required/i)
      assert.match(operation.resultSummary ?? '', /not configured/i)

      const backupsResponse = await fetch(
        `${listening.baseUrl}/backups?operationId=${accepted.operationId}`
      )
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<{
          backupMode?: string
          githubStatus?: string
          localStatus: string
        }>
      }

      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.backupMode, 'required')
      assert.equal(backupsPayload.items[0]?.localStatus, 'succeeded')
      assert.equal(backupsPayload.items[0]?.githubStatus, 'not_configured')

      const rollbackResponse = await fetch(
        `${listening.baseUrl}/rollback-points?hostId=host_alpha&state=ready`
      )
      assert.equal(rollbackResponse.status, 200)
      const rollbackPayload = (await rollbackResponse.json()) as {
        items: Array<{ state: string }>
      }
      assert.equal(rollbackPayload.items[0]?.state, 'ready')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server applies rollback point and marks result artifact applied', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const backupResponse = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          mode: 'best_effort'
        })
      })

      const acceptedBackup = (await backupResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, acceptedBackup.operationId)

      const rollbackResponse = await fetch(`${listening.baseUrl}/rollback-points/rp_${acceptedBackup.operationId}/apply`, {
        method: 'POST'
      })

      assert.equal(rollbackResponse.status, 202)
      const acceptedRollback = (await rollbackResponse.json()) as {
        operationId: string
        state: string
      }
      assert.equal(acceptedRollback.state, 'queued')

      const rollbackOperation = await waitForTerminalOperation(listening.baseUrl, acceptedRollback.operationId)
      assert.equal(rollbackOperation.state, 'succeeded')

      const rollbackListResponse = await fetch(`${listening.baseUrl}/rollback-points`)
      const rollbackListPayload = (await rollbackListResponse.json()) as {
        items: Array<{
          id: string
          state: string
        }>
      }

      assert.equal(rollbackListPayload.items[0]?.id, `rp_${acceptedBackup.operationId}`)
      assert.equal(rollbackListPayload.items[0]?.state, 'applied')

      const rollbackResultPath = path.join(
        artifactRoot,
        'rollback',
        `rp_${acceptedBackup.operationId}-result.json`
      )
      const rollbackResult = JSON.parse(readFileSync(rollbackResultPath, 'utf8')) as {
        operationId: string
        status: string
        restoredArtifacts: string[]
      }

      assert.equal(rollbackResult.operationId, acceptedRollback.operationId)
      assert.equal(rollbackResult.status, 'rolled_back')
      assert.equal(rollbackResult.restoredArtifacts.length >= 4, true)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server filters backup and rollback inspection views by host and state', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })

    const listening = await server.listen(0)

    try {
      const alphaBackupResponse = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          mode: 'required'
        })
      })
      const alphaAccepted = (await alphaBackupResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, alphaAccepted.operationId)

      const bravoBackupResponse = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_bravo',
          mode: 'best_effort'
        })
      })
      const bravoAccepted = (await bravoBackupResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, bravoAccepted.operationId)

      const rollbackResponse = await fetch(
        `${listening.baseUrl}/rollback-points/rp_${alphaAccepted.operationId}/apply`,
        {
          method: 'POST'
        }
      )
      const rollbackAccepted = (await rollbackResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, rollbackAccepted.operationId)

      const backupsResponse = await fetch(`${listening.baseUrl}/backups?hostId=host_alpha`)
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<{
          hostId: string
          operationId?: string
        }>
      }

      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(backupsPayload.items[0]?.operationId, alphaAccepted.operationId)

      const appliedRollbackResponse = await fetch(
        `${listening.baseUrl}/rollback-points?hostId=host_alpha&state=applied`
      )
      assert.equal(appliedRollbackResponse.status, 200)
      const appliedRollbackPayload = (await appliedRollbackResponse.json()) as {
        items: Array<{
          hostId: string
          state: string
        }>
      }

      assert.equal(appliedRollbackPayload.items.length, 1)
      assert.equal(appliedRollbackPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(appliedRollbackPayload.items[0]?.state, 'applied')

      const readyRollbackResponse = await fetch(
        `${listening.baseUrl}/rollback-points?hostId=host_bravo&state=ready`
      )
      assert.equal(readyRollbackResponse.status, 200)
      const readyRollbackPayload = (await readyRollbackResponse.json()) as {
        items: Array<{
          hostId: string
          state: string
        }>
      }

      assert.equal(readyRollbackPayload.items.length, 1)
      assert.equal(readyRollbackPayload.items[0]?.hostId, 'host_bravo')
      assert.equal(readyRollbackPayload.items[0]?.state, 'ready')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  closeHttpServer,
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

async function startGitHubMockServer(options: { fail?: boolean } = {}) {
  const uploads: Array<{
    authorization?: string
    path: string
    body: {
      message?: string
      content?: string
    }
  }> = []

  const server = createServer((request, response) => {
    const url = request.url ?? ''

    if (request.method !== 'PUT' || !url.startsWith('/repos/Jacobinwwey/portmanager-backups/contents/')) {
      response.writeHead(404)
      response.end()
      return
    }

    const chunks: Buffer[] = []
    request.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    request.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
        message?: string
        content?: string
      }
      uploads.push({
        authorization: request.headers.authorization,
        path: decodeURIComponent(url.slice('/repos/Jacobinwwey/portmanager-backups/contents/'.length)),
        body
      })

      if (options.fail) {
        response.writeHead(500, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ message: 'mock GitHub failure' }))
        return
      }

      response.writeHead(201, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ content: { path: uploads[uploads.length - 1]?.path } }))
    })
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  assert.ok(address && typeof address !== 'string')

  return {
    uploads,
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  }
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
          remoteTarget?: string
          remoteConfigured?: boolean
          remoteStatusSummary?: string
          remoteAction?: string
          manifestPath?: string
          operationId?: string
        }>
      }

      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.hostId, 'host_alpha')
      assert.equal(backupsPayload.items[0]?.localStatus, 'succeeded')
      assert.equal(backupsPayload.items[0]?.backupMode, 'best_effort')
      assert.equal(backupsPayload.items[0]?.githubStatus, 'not_configured')
      assert.equal(backupsPayload.items[0]?.remoteTarget, 'github')
      assert.equal(backupsPayload.items[0]?.remoteConfigured, false)
      assert.match(backupsPayload.items[0]?.remoteStatusSummary ?? '', /local-only continuation/i)
      assert.match(backupsPayload.items[0]?.remoteAction ?? '', /configure github backup/i)
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
          remoteTarget?: string
          remoteConfigured?: boolean
          remoteStatusSummary?: string
          remoteAction?: string
        }>
      }

      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.backupMode, 'required')
      assert.equal(backupsPayload.items[0]?.localStatus, 'succeeded')
      assert.equal(backupsPayload.items[0]?.githubStatus, 'not_configured')
      assert.equal(backupsPayload.items[0]?.remoteTarget, 'github')
      assert.equal(backupsPayload.items[0]?.remoteConfigured, false)
      assert.match(backupsPayload.items[0]?.remoteStatusSummary ?? '', /required-mode degradation/i)
      assert.match(backupsPayload.items[0]?.remoteAction ?? '', /configure github backup/i)

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

test('controller server uploads required backup bundle to GitHub when remote backup is configured', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()
  const github = await startGitHubMockServer()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({
      store,
      eventBus,
      artifactRoot,
      githubBackup: {
        apiBaseUrl: github.baseUrl,
        env: {
          PORTMANAGER_GITHUB_BACKUP_ENABLED: 'true',
          PORTMANAGER_GITHUB_BACKUP_REPO: 'Jacobinwwey/portmanager-backups',
          PORTMANAGER_GITHUB_BACKUP_TOKEN: 'ghs_test_token'
        }
      }
    })

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

      assert.equal(operation.state, 'succeeded')
      assert.match(operation.resultSummary ?? '', /github backup uploaded/i)

      const backupsResponse = await fetch(`${listening.baseUrl}/backups?operationId=${accepted.operationId}`)
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<{
          id: string
          githubStatus?: string
          remoteConfigured?: boolean
          remoteStatusSummary?: string
          remoteAction?: string
        }>
      }

      assert.equal(backupsPayload.items[0]?.githubStatus, 'succeeded')
      assert.equal(backupsPayload.items[0]?.remoteConfigured, true)
      assert.match(backupsPayload.items[0]?.remoteStatusSummary ?? '', /remote redundancy is available/i)
      assert.match(backupsPayload.items[0]?.remoteAction ?? '', /no remote action required/i)
      assert.equal(github.uploads.length, 1)
      assert.equal(github.uploads[0]?.authorization, 'Bearer ghs_test_token')
      assert.match(github.uploads[0]?.path ?? '', /host_alpha/)

      const bundle = JSON.parse(
        Buffer.from(github.uploads[0]?.body.content ?? '', 'base64').toString('utf8')
      ) as {
        backupId: string
        manifest: {
          operationId: string
        }
        files: Array<{ path: string }>
      }
      assert.equal(bundle.backupId, backupsPayload.items[0]?.id)
      assert.equal(bundle.manifest.operationId, accepted.operationId)
      assert.equal(bundle.files.length >= 5, true)
      assert.equal(bundle.files.some((file) => file.path === 'manifest.json'), true)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await closeHttpServer(github.server)
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server keeps required backup degraded when configured GitHub upload fails', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()
  const github = await startGitHubMockServer({ fail: true })

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({
      store,
      eventBus,
      artifactRoot,
      githubBackup: {
        apiBaseUrl: github.baseUrl,
        env: {
          PORTMANAGER_GITHUB_BACKUP_ENABLED: 'true',
          PORTMANAGER_GITHUB_BACKUP_REPO: 'Jacobinwwey/portmanager-backups',
          PORTMANAGER_GITHUB_BACKUP_TOKEN: 'ghs_test_token'
        }
      }
    })

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
      assert.match(operation.resultSummary ?? '', /github backup upload failed/i)

      const backupsResponse = await fetch(`${listening.baseUrl}/backups?operationId=${accepted.operationId}`)
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<{
          githubStatus?: string
          remoteConfigured?: boolean
          remoteStatusSummary?: string
          remoteAction?: string
        }>
      }

      assert.equal(backupsPayload.items[0]?.githubStatus, 'failed')
      assert.equal(backupsPayload.items[0]?.remoteConfigured, true)
      assert.match(backupsPayload.items[0]?.remoteStatusSummary ?? '', /remote redundancy is missing/i)
      assert.match(backupsPayload.items[0]?.remoteAction ?? '', /inspect github backup credentials/i)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await closeHttpServer(github.server)
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

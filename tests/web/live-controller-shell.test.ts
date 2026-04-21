import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  closeHttpServer,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'
import {
  BackupsPage,
  BridgeRulesPage,
  ConsolePage,
  HostsPage,
  HostDetailPage,
  loadBackupsState,
  loadBridgeRulesState,
  loadConsoleState,
  loadHostDetailState,
  loadHostsState,
  loadOperationsState,
  loadOverviewState,
  OperationsPage,
  OverviewPage
} from '../../apps/web/src/main.ts'
import { verifyReliabilityRemoteBackupReplayFlow } from '../../scripts/milestone/verify-reliability-remote-backup-replay.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-web-live-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
  }
}

async function startGitHubMockServer() {
  const server = createServer((request, response) => {
    if (
      request.method !== 'PUT' ||
      !(request.url ?? '').startsWith('/repos/Jacobinwwey/portmanager-backups/contents/')
    ) {
      response.writeHead(404)
      response.end()
      return
    }

    const chunks: Buffer[] = []
    request.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    request.on('end', () => {
      response.writeHead(201, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          content: {
            path: decodeURIComponent(
              (request.url ?? '').slice('/repos/Jacobinwwey/portmanager-backups/contents/'.length)
            )
          }
        })
      )
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
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  }
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`${baseUrl}/operations/${operationId}`)
    assert.equal(response.status, 200)

    const payload = (await response.json()) as Record<string, unknown>
    if (
      payload.state === 'succeeded' ||
      payload.state === 'failed' ||
      payload.state === 'degraded'
    ) {
      return payload
    }

    await delay(20)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

async function startAgentServer(hostId: string) {
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method === 'POST' && request.url === '/apply') {
      const payload = await readJsonBody(request)
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          schemaVersion: '0.1.0',
          operationId:
            typeof payload.operationId === 'string' ? payload.operationId : `op_agent_${hostId}`,
          type: 'apply',
          state: 'succeeded',
          hostId,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          resultSummary: `agent applied desired state for ${hostId}`
        })
      )
      return
    }

    if (request.method === 'GET' && request.url === '/runtime-state') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          schemaVersion: '0.1.0',
          hostId,
          agentState: 'ready',
          agentVersion: '0.1.0',
          effectiveStateHash: `${hostId}_hash_001`,
          health: {
            summary: `agent ready for ${hostId}`,
            signals: [
              {
                code: 'batch_apply_policy',
                status: 'healthy',
                message: hostId
              }
            ]
          },
          appliedRules: [],
          updatedAt: new Date().toISOString()
        })
      )
      return
    }

    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'not_found' }))
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
    server,
    port: address.port
  }
}

test('web live loaders render controller-backed overview, host, rules, backups, and console surfaces', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()
  const target = createServer((request, response) => {
    if (request.url === '/') {
      response.writeHead(302, { location: '/status' })
      response.end()
      return
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(
      '<!doctype html><html><head><title>Alpha Relay Healthy</title></head><body>ok</body></html>'
    )
  })

  await new Promise<void>((resolve, reject) => {
    target.once('error', reject)
    target.listen(0, '127.0.0.1', () => {
      target.off('error', reject)
      resolve()
    })
  })

  try {
    const address = target.address()
    assert.ok(address && typeof address !== 'string')

    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Bootstrap Alpha',
          labels: ['edge', 'prod'],
          ssh: {
            host: '100.64.0.11',
            port: 22
          }
        })
      })
      assert.equal(createHostResponse.status, 202)
      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<{ id: string }>
      }
      const hostId = hostsPayload.items[0]?.id
      assert.ok(hostId)

      const probeResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/probe`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ mode: 'read_only' })
      })
      assert.equal(probeResponse.status, 202)
      const probeAccepted = (await probeResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, probeAccepted.operationId)

      const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'ubuntu',
          desiredAgentPort: 8711,
          backupPolicy: 'required'
        })
      })
      assert.equal(bootstrapResponse.status, 202)
      const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, bootstrapAccepted.operationId)

      const updatePolicyResponse = await fetch(`${listening.baseUrl}/exposure-policies/${hostId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          allowedSources: ['tailscale', 'corp-vpn'],
          excludedPorts: [22, 2375],
          samePortMirror: false,
          conflictPolicy: 'reject',
          backupPolicy: 'required'
        })
      })
      assert.equal(updatePolicyResponse.status, 202)
      const updatePolicyAccepted = (await updatePolicyResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, updatePolicyAccepted.operationId)

      const createRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          name: 'HTTPS Relay',
          protocol: 'tcp',
          listenPort: 443,
          targetHost: '127.0.0.1',
          targetPort: address.port
        })
      })
      assert.equal(createRuleResponse.status, 202)
      const createRuleAccepted = (await createRuleResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createRuleAccepted.operationId)

      const rulesResponse = await fetch(`${listening.baseUrl}/bridge-rules?hostId=${hostId}`)
      const rulesPayload = (await rulesResponse.json()) as {
        items: Array<{ id: string }>
      }
      const ruleId = rulesPayload.items[0]?.id
      assert.ok(ruleId)

      const backupResponse = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          mode: 'required'
        })
      })
      assert.equal(backupResponse.status, 202)
      const backupAccepted = (await backupResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, backupAccepted.operationId)

      const diagnosticsResponse = await fetch(`${listening.baseUrl}/snapshots/diagnostics`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          ruleId,
          port: address.port,
          scheme: 'http',
          captureSnapshot: true
        })
      })
      assert.equal(diagnosticsResponse.status, 202)
      const diagnosticsAccepted = (await diagnosticsResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, diagnosticsAccepted.operationId)

      const degradedAccepted = store.enqueueOperation({
        id: 'op_diag_degraded_live_001',
        type: 'diagnostics',
        initiator: 'automation',
        hostId,
        ruleId
      })
      store.markRunning(degradedAccepted.operationId)
      store.markFinished(degradedAccepted.operationId, {
        state: 'degraded',
        resultSummary: 'diagnostics detected drift and rollback inspection remains required',
        diagnosticResult: {
          hostId,
          ruleId,
          capturedAt: '2026-04-17T01:00:00.000Z',
          port: address.port,
          tcpReachable: true,
          httpStatus: 502,
          pageTitle: 'Alpha Relay Degraded',
          finalUrl: 'http://127.0.0.1/degraded'
        }
      })

      const overviewState = await loadOverviewState({ baseUrl: listening.baseUrl, hostId })
      const hostDetailState = await loadHostDetailState({ baseUrl: listening.baseUrl, hostId })
      const operationsState = await loadOperationsState({
        baseUrl: listening.baseUrl,
        operationId: diagnosticsAccepted.operationId
      })
      const hostsState = await loadHostsState({ baseUrl: listening.baseUrl, hostId })
      const bridgeRulesState = await loadBridgeRulesState({ baseUrl: listening.baseUrl, hostId, ruleId })
      const backupsState = await loadBackupsState({ baseUrl: listening.baseUrl, hostId })
      const consoleState = await loadConsoleState({
        baseUrl: listening.baseUrl,
        hostId,
        operationId: diagnosticsAccepted.operationId
      })

      assert.equal(overviewState.managedHosts[0]?.id, hostId)
      assert.equal(hostDetailState.host.recentRules[0]?.id, ruleId)
      assert.equal(operationsState.selectedOperationId, diagnosticsAccepted.operationId)
      assert.equal(hostsState.selectedHost?.host.id, hostId)
      assert.equal(bridgeRulesState.selectedRule?.id, ruleId)
      assert.equal(backupsState.selectedBackup?.hostId, hostId)
      assert.equal(overviewState.persistenceReadiness.status, 'healthy')
      assert.equal(consoleState.selectedOperation?.id, diagnosticsAccepted.operationId)
      assert.equal(consoleState.persistenceReadiness.status, 'healthy')
      assert.equal(((operationsState as { auditIndex?: unknown[] }).auditIndex ?? []).length > 0, true)
      assert.equal(((consoleState as { auditIndex?: unknown[] }).auditIndex ?? []).length > 0, true)

      const overviewHtml = renderToStaticMarkup(h(OverviewPage, { state: overviewState }))
      assert.match(overviewHtml, /Bootstrap Alpha/)
      assert.match(overviewHtml, /Persistence readiness/i)
      const hostDetailHtml = renderToStaticMarkup(h(HostDetailPage, { state: hostDetailState }))
      assert.match(hostDetailHtml, /HTTPS Relay/)
      assert.match(hostDetailHtml, /Degraded diagnostics history/i)
      assert.match(hostDetailHtml, /Recovery-ready diagnostics/i)
      assert.match(hostDetailHtml, /rollback inspection remains required/i)
      assert.match(hostDetailHtml, /Alpha Relay Healthy/i)
      const operationsHtml = renderToStaticMarkup(h(OperationsPage, { state: operationsState }))
      assert.match(operationsHtml, /Alpha Relay Healthy/)
      assert.match(operationsHtml, /Indexed audit review/i)
      assert.match(operationsHtml, /Selected audit evidence/i)
      assert.match(renderToStaticMarkup(h(HostsPage, { state: hostsState })), /Managed host inventory/i)
      assert.match(renderToStaticMarkup(h(BridgeRulesPage, { state: bridgeRulesState })), /Selected rule topology/i)
      assert.match(renderToStaticMarkup(h(BackupsPage, { state: backupsState })), /Rollback readiness/i)

      const consoleHtml = renderToStaticMarkup(h(ConsolePage, { state: consoleState }))
      assert.match(consoleHtml, /Controller console and replay/i)
      assert.match(consoleHtml, /Selected diagnostic detail/i)
      assert.match(consoleHtml, /Persistence readiness/i)
      assert.match(consoleHtml, /Alpha Relay Healthy/)
      assert.match(consoleHtml, /Indexed event and audit review/i)
      assert.match(consoleHtml, /Selected audit evidence/i)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await closeHttpServer(target)
    rmSync(directory, { recursive: true, force: true })
  }
})

test('web live loaders render successful GitHub backup status when remote backup is configured', async () => {
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
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          id: 'host_alpha',
          name: 'Alpha Relay',
          labels: ['edge'],
          ssh: {
            host: '100.64.0.10',
            port: 22
          }
        })
      })
      assert.equal(createHostResponse.status, 202)
      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      assert.equal(hostsResponse.status, 200)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<{ id: string }>
      }
      const hostId = hostsPayload.items[0]?.id
      assert.ok(hostId)

      const backupResponse = await fetch(`${listening.baseUrl}/backups/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          mode: 'required'
        })
      })

      assert.equal(backupResponse.status, 202)
      const accepted = (await backupResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, accepted.operationId)

      const backupsState = await loadBackupsState({ baseUrl: listening.baseUrl, hostId })
      const html = renderToStaticMarkup(h(BackupsPage, { state: backupsState }))

      assert.match(html, /succeeded/i)
      assert.match(html, /remote redundancy is available/i)
      assert.match(html, /no remote action required/i)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await closeHttpServer(github.server)
    rmSync(directory, { recursive: true, force: true })
  }
})

test('web operations page renders batch target summary and per-host outcomes', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const alphaAgent = await startAgentServer('host_alpha')
    const betaAgent = await startAgentServer('host_beta')
    const listening = await server.listen(0)

    try {
      store.createHost({
        id: 'host_alpha',
        name: 'Alpha Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })
      store.createHost({
        id: 'host_beta',
        name: 'Beta Relay',
        sshHost: '127.0.0.1',
        sshPort: 22
      })

      for (const [hostId, desiredAgentPort] of [
        ['host_alpha', alphaAgent.port],
        ['host_beta', betaAgent.port]
      ] as const) {
        const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sshUser: 'ubuntu',
            desiredAgentPort,
            backupPolicy: 'best_effort'
          })
        })
        assert.equal(bootstrapResponse.status, 202)
        const accepted = (await bootstrapResponse.json()) as { operationId: string }
        await waitForTerminalOperation(listening.baseUrl, accepted.operationId)
      }

      betaAgent.server.close()

      const batchResponse = await fetch(
        `${listening.baseUrl}/batch-operations/exposure-policies/apply`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            hostIds: ['host_alpha', 'host_beta'],
            allowedSources: ['tailscale', 'admin'],
            excludedPorts: [22, 8443],
            samePortMirror: true,
            conflictPolicy: 'replace_existing',
            backupPolicy: 'required'
          })
        }
      )
      assert.equal(batchResponse.status, 202)
      const batchAccepted = (await batchResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, batchAccepted.operationId)

      const operationsState = await loadOperationsState({
        baseUrl: listening.baseUrl,
        operationId: batchAccepted.operationId
      })
      assert.equal(operationsState.selectedOperationId, batchAccepted.operationId)

      const html = renderToStaticMarkup(h(OperationsPage, { state: operationsState }))
      assert.match(html, /Batch target summary/i)
      assert.match(html, /Per-host outcomes/i)
      assert.match(html, /1 succeeded/i)
      assert.match(html, /1 degraded/i)
      assert.match(html, /host_alpha/i)
      assert.match(html, /host_beta/i)
    } finally {
      alphaAgent.server.close()
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('web live loaders replay local-only failed and successful remote-backup guidance on the same live slice', async () => {
  const result = await verifyReliabilityRemoteBackupReplayFlow()

  assert.match(result.localOnly.backupsPageHtml, /needs setup/i)
  assert.match(result.localOnly.backupsPageHtml, /configure github backup/i)

  assert.match(result.configuredFailure.backupsPageHtml, /failed/i)
  assert.match(result.configuredFailure.backupsPageHtml, /remote redundancy is missing/i)
  assert.match(result.configuredFailure.backupsPageHtml, /inspect github backup credentials/i)

  assert.match(result.configuredSuccess.backupsPageHtml, /succeeded/i)
  assert.match(result.configuredSuccess.backupsPageHtml, /remote redundancy is available/i)
  assert.match(result.configuredSuccess.backupsPageHtml, /no remote action required/i)
})

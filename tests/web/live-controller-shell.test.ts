import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
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

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-web-live-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
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
      assert.equal(consoleState.selectedOperation?.id, diagnosticsAccepted.operationId)

      assert.match(renderToStaticMarkup(h(OverviewPage, { state: overviewState })), /Bootstrap Alpha/)
      const hostDetailHtml = renderToStaticMarkup(h(HostDetailPage, { state: hostDetailState }))
      assert.match(hostDetailHtml, /HTTPS Relay/)
      assert.match(hostDetailHtml, /Degraded diagnostics history/i)
      assert.match(hostDetailHtml, /Recovery-ready diagnostics/i)
      assert.match(hostDetailHtml, /rollback inspection remains required/i)
      assert.match(hostDetailHtml, /Alpha Relay Healthy/i)
      assert.match(renderToStaticMarkup(h(OperationsPage, { state: operationsState })), /Alpha Relay Healthy/)
      assert.match(renderToStaticMarkup(h(HostsPage, { state: hostsState })), /Managed host inventory/i)
      assert.match(renderToStaticMarkup(h(BridgeRulesPage, { state: bridgeRulesState })), /Selected rule topology/i)
      assert.match(renderToStaticMarkup(h(BackupsPage, { state: backupsState })), /Rollback readiness/i)

      const consoleHtml = renderToStaticMarkup(h(ConsolePage, { state: consoleState }))
      assert.match(consoleHtml, /Controller console and replay/i)
      assert.match(consoleHtml, /Selected diagnostic detail/i)
      assert.match(consoleHtml, /Alpha Relay Healthy/)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    await closeHttpServer(target)
    rmSync(directory, { recursive: true, force: true })
  }
})

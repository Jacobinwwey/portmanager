import test from 'node:test'
import assert from 'node:assert/strict'

import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  BackupsPage,
  BridgeRulesPage,
  ConsolePage,
  createMockBackupsState,
  createMockBridgeRulesState,
  createMockConsoleState,
  createMockHostDetailState,
  createMockHostsState,
  createMockOverviewState,
  HostDetailPage,
  HostsPage,
  OperationsPage,
  OverviewPage,
  createMockOperationsState,
  loadOverviewState,
  renderWebPreviewDocument,
  webBootstrapMessage
} from '../../apps/web/src/main.ts'

test('overview shell renders locked control-plane zones and managed hosts table', () => {
  const html = renderToStaticMarkup(h(OverviewPage, { state: createMockOverviewState() }))

  assert.match(html, /Control Plane/)
  assert.match(html, /Managed Hosts/)
  assert.match(html, /Selected Host/)
  assert.match(html, /Effective Policy/)
  assert.match(html, /Persistence readiness/i)
  assert.match(html, /Event Stream/)
  assert.match(html, /Overview/)
  assert.match(html, /Bridge Rules/)
  assert.match(html, /host_alpha/)
  assert.match(html, /ready/)
})

test('host detail shell renders required milestone sections', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /identity and readiness summary/i)
  assert.match(html, /target profile and capability contract/i)
  assert.match(html, /effective exposure policy/i)
  assert.match(html, /bridge rules/i)
  assert.match(html, /recent health checks/i)
  assert.match(html, /recent operations/i)
  assert.match(html, /backup and rollback history/i)
  assert.match(html, /latest diagnostics and snapshots/i)
  assert.match(html, /local artifact references/i)
  assert.match(html, /rule_alpha_https/)
})

test('host detail shell surfaces degraded bridge verification and required backup policy', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /degraded/i)
  assert.match(html, /rollback inspection required/i)
  assert.match(html, /required/i)
})

test('host detail shell surfaces rollback candidates and diagnostics evidence references', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /rollback candidates and execution/i)
  assert.match(html, /rp_alpha_001/i)
  assert.match(html, /applied/i)
  assert.match(html, /alpha relay healthy/i)
  assert.match(html, /snapshot-op_diag_001\.html/i)
})

test('host detail shell surfaces backup policy modes and remote backup status', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /best_effort/i)
  assert.match(html, /required/i)
  assert.match(html, /not_configured/i)
  assert.match(html, /configure github backup/i)
})

test('host detail shell surfaces agent heartbeat and version semantics', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /agent heartbeat/i)
  assert.match(html, /live/i)
  assert.match(html, /0\.1\.0/i)
})

test('host detail shell surfaces locked target profile contract and capabilities', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /ubuntu-24\.04-systemd-tailscale/i)
  assert.match(html, /ubuntu 24\.04 \+ systemd \+ tailscale/i)
  assert.match(html, /http-over-tailscale/i)
  assert.match(html, /bootstrap-host/i)
  assert.match(html, /collect-diagnostics/i)
})

test('host detail shell surfaces operation summaries and linked recovery evidence', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /required github backup is not configured/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /rp_alpha_002/i)
})

test('host detail shell groups degraded diagnostics history and recovery-ready evidence', () => {
  const state = createMockHostDetailState()
  state.diagnostics = [
    {
      id: 'op_diag_degraded_000',
      type: 'diagnostics',
      state: 'degraded',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https',
      startedAt: '2026-04-16T17:44:00.000Z',
      finishedAt: '2026-04-16T17:45:00.000Z',
      resultSummary: 'diagnostics detected drift and rollback inspection remains required',
      diagnosticResult: {
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        capturedAt: '2026-04-16T17:45:00.000Z',
        port: 443,
        tcpReachable: true,
        httpStatus: 502,
        pageTitle: 'Alpha Relay Degraded',
        finalUrl: 'http://127.0.0.1/degraded'
      }
    },
    ...state.diagnostics
  ]

  const html = renderToStaticMarkup(h(HostDetailPage, { state }))

  assert.match(html, /degraded diagnostics history/i)
  assert.match(html, /recovery-ready diagnostics/i)
  assert.match(html, /rollback inspection remains required/i)
  assert.match(html, /alpha relay healthy/i)
})

test('operations shell renders required operations page sections', () => {
  const html = renderToStaticMarkup(h(OperationsPage, { state: createMockOperationsState() }))

  assert.match(html, /active and recent operations list/i)
  assert.match(html, /operation state timeline/i)
  assert.match(html, /initiator and request source/i)
  assert.match(html, /linked host, rule, backup, rollback, and diagnostic artifacts/i)
  assert.match(html, /selected operation event stream/i)
})

test('operations shell surfaces selected operation timeline and linked artifacts', () => {
  const html = renderToStaticMarkup(h(OperationsPage, { state: createMockOperationsState() }))

  assert.match(html, /op_backup_required_001/i)
  assert.match(html, /required github backup is not configured/i)
  assert.match(html, /web/i)
  assert.match(html, /policy-runbook\/backup-required/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /rp_alpha_002/i)
  assert.match(html, /snapshot-op_diag_001\.html/i)
})

test('hosts shell renders live-parity inventory and selected host rollout evidence', () => {
  const html = renderToStaticMarkup(h(HostsPage, { state: createMockHostsState() }))

  assert.match(html, /managed host inventory/i)
  assert.match(html, /selected host rollout/i)
  assert.match(html, /recent host health checks/i)
  assert.match(html, /alpha-gateway/i)
  assert.match(html, /ubuntu-24\.04-systemd-tailscale/i)
  assert.match(html, /host_probe/i)
})

test('bridge rules shell renders rule topology, verification, and linked operations evidence', () => {
  const html = renderToStaticMarkup(h(BridgeRulesPage, { state: createMockBridgeRulesState() }))

  assert.match(html, /bridge rule inventory/i)
  assert.match(html, /selected rule topology/i)
  assert.match(html, /verification and diagnostics/i)
  assert.match(html, /linked operations and recovery/i)
  assert.match(html, /rule_alpha_https/i)
  assert.match(html, /rollback inspection required/i)
})

test('backups shell renders backup manifests and rollback readiness detail', () => {
  const html = renderToStaticMarkup(h(BackupsPage, { state: createMockBackupsState() }))

  assert.match(html, /backup inventory and manifests/i)
  assert.match(html, /selected backup detail/i)
  assert.match(html, /rollback readiness/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /op_snapshot_002-manifest\.json/i)
  assert.match(html, /required-mode degradation/i)
  assert.match(html, /configure github backup/i)
})

test('console shell renders controller replay and selected diagnostic detail', () => {
  const html = renderToStaticMarkup(h(ConsolePage, { state: createMockConsoleState() }))

  assert.match(html, /controller console and replay/i)
  assert.match(html, /recent controller events/i)
  assert.match(html, /selected diagnostic detail/i)
  assert.match(html, /persistence readiness/i)
  assert.match(html, /Alpha Relay Healthy/i)
  assert.match(html, /required GitHub backup is not configured/i)
})

test('preview document embeds styles and web skeleton copy', () => {
  const html = renderWebPreviewDocument('overview')

  assert.match(html, /PortManager web skeleton/)
  assert.match(html, /--pm-accent/)
  assert.match(html, /Managed Hosts/)
  assert.equal(webBootstrapMessage(), 'PortManager web skeleton')
})

test('preview document renders operations shell when requested', () => {
  const html = renderWebPreviewDocument('operations')

  assert.match(html, /Selected operation event stream/i)
  assert.match(html, /Operation state timeline/i)
})

test('preview document renders hosts shell when requested', () => {
  const html = renderWebPreviewDocument('hosts')

  assert.match(html, /Managed host inventory/i)
  assert.match(html, /Selected host rollout/i)
})

test('overview loader keeps consumer boundary base path when building controller urls', async () => {
  const requestedPaths: string[] = []
  const fetchImpl: typeof fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    requestedPaths.push(url.pathname)

    if (url.pathname === '/api/controller/hosts') {
      return new Response(
        JSON.stringify({
          items: [
            {
              id: 'host_alpha',
              name: 'Alpha Relay',
              readiness: 'ready',
              labels: ['edge'],
              sshHost: '100.64.0.11',
              sshPort: 22,
              exposurePolicySummary: 'https preferred',
              bridgeRuleIds: ['rule_alpha_https'],
              degradedReasons: []
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/operations') {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/events') {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/hosts/host_alpha') {
      return new Response(
        JSON.stringify({
          id: 'host_alpha',
          name: 'Alpha Relay',
          readiness: 'ready',
          labels: ['edge'],
          sshHost: '100.64.0.11',
          sshPort: 22,
          agentVersion: '0.1.0',
          agentHeartbeatState: 'live',
          bridgeRules: [],
          recentOperations: [],
          effectiveExposurePolicy: {
            hostId: 'host_alpha',
            allowedSources: ['0.0.0.0/0'],
            excludedPorts: [],
            samePortMirror: true,
            conflictPolicy: 'replace_existing',
            backupPolicy: 'best_effort'
          }
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (
      url.pathname === '/api/controller/health-checks' ||
      url.pathname === '/api/controller/backups' ||
      url.pathname === '/api/controller/rollback-points' ||
      url.pathname === '/api/controller/diagnostics'
    ) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/persistence-readiness') {
      return new Response(
        JSON.stringify({
          backend: 'sqlite',
          databasePath: '/var/lib/portmanager/controller.sqlite',
          status: 'healthy',
          migrationTarget: 'postgresql',
          summary: 'consumer boundary readiness is healthy',
          recommendedAction: 'keep current store',
          metrics: {
            operationRows: {
              current: 2,
              monitor: 500,
              migrationReady: 2000,
              status: 'healthy'
            },
            diagnosticRows: {
              current: 1,
              monitor: 200,
              migrationReady: 750,
              status: 'healthy'
            },
            backupRows: {
              current: 1,
              monitor: 200,
              migrationReady: 750,
              status: 'healthy'
            },
            rollbackPointRows: {
              current: 1,
              monitor: 200,
              migrationReady: 750,
              status: 'healthy'
            },
            hostRows: {
              current: 1,
              monitor: 25,
              migrationReady: 100,
              status: 'healthy'
            }
          }
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  const state = await loadOverviewState({
    baseUrl: 'http://127.0.0.1:8710/api/controller',
    fetchImpl
  })

  assert.equal(state.persistenceReadiness.backend, 'sqlite')
  assert.equal(requestedPaths.every((pathname) => pathname.startsWith('/api/controller/')), true)
  assert.equal(requestedPaths.includes('/api/controller/persistence-readiness'), true)
  assert.equal(requestedPaths.includes('/api/controller/hosts/host_alpha'), true)
})

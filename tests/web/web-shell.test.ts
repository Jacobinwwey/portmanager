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
  renderWebPreviewDocument,
  webBootstrapMessage
} from '../../apps/web/src/main.ts'

test('overview shell renders locked control-plane zones and managed hosts table', () => {
  const html = renderToStaticMarkup(h(OverviewPage, { state: createMockOverviewState() }))

  assert.match(html, /Control Plane/)
  assert.match(html, /Managed Hosts/)
  assert.match(html, /Selected Host/)
  assert.match(html, /Effective Policy/)
  assert.match(html, /Event Stream/)
  assert.match(html, /Overview/)
  assert.match(html, /Bridge Rules/)
  assert.match(html, /host_alpha/)
  assert.match(html, /ready/)
})

test('host detail shell renders required milestone sections', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /identity and readiness summary/i)
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
})

test('host detail shell surfaces operation summaries and linked recovery evidence', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /required github backup is not configured/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /rp_alpha_002/i)
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
})

test('console shell renders controller replay and selected diagnostic detail', () => {
  const html = renderToStaticMarkup(h(ConsolePage, { state: createMockConsoleState() }))

  assert.match(html, /controller console and replay/i)
  assert.match(html, /recent controller events/i)
  assert.match(html, /selected diagnostic detail/i)
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

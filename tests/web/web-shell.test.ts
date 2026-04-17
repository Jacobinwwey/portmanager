import test from 'node:test'
import assert from 'node:assert/strict'

import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  createMockHostDetailState,
  createMockOverviewState,
  HostDetailPage,
  OverviewPage,
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

test('preview document embeds styles and web skeleton copy', () => {
  const html = renderWebPreviewDocument('overview')

  assert.match(html, /PortManager web skeleton/)
  assert.match(html, /--pm-accent/)
  assert.match(html, /Managed Hosts/)
  assert.equal(webBootstrapMessage(), 'PortManager web skeleton')
})

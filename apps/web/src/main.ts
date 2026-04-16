import type {
  BackupSummary,
  BridgeRule,
  components,
  ExposurePolicy,
  HealthCheck,
  HostDetail,
  HostSummary,
  OperationSummary
} from '@portmanager/typescript-contracts'
import { createElement as h, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'

export type WebContracts = {
  hostSummary: HostSummary
  hostDetail: HostDetail
  exposurePolicy: ExposurePolicy
  bridgeRule: BridgeRule
  operationSummary: OperationSummary
  healthCheck: HealthCheck
  backupSummary: BackupSummary
}

export interface EventStreamEntry {
  id: string
  level: 'info' | 'success' | 'warn'
  timestamp: string
  summary: string
}

export interface HostDetailState {
  host: HostDetail
  healthChecks: HealthCheck[]
  backups: BackupSummary[]
  diagnostics: OperationSummary[]
  localArtifacts: string[]
  eventStream: EventStreamEntry[]
}

export interface OverviewState {
  controllerHealth: 'healthy' | 'degraded'
  managedHosts: HostSummary[]
  selectedHost: HostDetailState
  activeOperations: number
  degradedCount: number
  eventStream: EventStreamEntry[]
}

export type WebView = 'overview' | 'host-detail'

const mountedRoots = new WeakMap<Element, Root>()
const navigationItems = ['Overview', 'Hosts', 'Bridge Rules', 'Operations', 'Backups', 'Console']

export const webSkeletonStyles = `
:root {
  --pm-bg: #e4eaec;
  --pm-bg-top: #faf7ef;
  --pm-surface: rgba(255, 252, 245, 0.86);
  --pm-panel: rgba(255, 255, 255, 0.84);
  --pm-panel-strong: rgba(255, 255, 255, 0.94);
  --pm-border: rgba(92, 105, 110, 0.18);
  --pm-text: #172126;
  --pm-muted: #617076;
  --pm-accent: #b45d1d;
  --pm-accent-soft: rgba(180, 93, 29, 0.12);
  --pm-ok: #0f6d58;
  --pm-warn: #9d5d13;
  --pm-bad: #8b3535;
  --pm-shadow: 0 18px 44px rgba(27, 43, 49, 0.12);
  --pm-sans: "IBM Plex Sans", "Segoe UI", sans-serif;
  --pm-serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
  --pm-mono: "IBM Plex Mono", "SFMono-Regular", monospace;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, var(--pm-bg-top), rgba(247, 236, 218, 0.82) 22%, transparent 36%),
    linear-gradient(165deg, var(--pm-bg-top), var(--pm-bg) 50%, #d7e0e3);
  color: var(--pm-text);
  font-family: var(--pm-sans);
}

.pm-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr) 320px;
  grid-template-rows: auto minmax(420px, 1fr) 220px;
  gap: 18px;
  padding: 22px;
}

.pm-panel,
.pm-sidebar,
.pm-stream,
.pm-main,
.pm-rail,
.pm-header {
  border: 1px solid var(--pm-border);
  background: var(--pm-panel);
  box-shadow: var(--pm-shadow);
  backdrop-filter: blur(18px);
}

.pm-header {
  grid-column: 1 / -1;
  border-radius: 30px;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 20px;
}

.pm-header-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-eyebrow,
.pm-inline-label,
.pm-microcopy {
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pm-muted);
}

.pm-title {
  margin: 0;
  font-family: var(--pm-serif);
  font-size: clamp(34px, 4vw, 54px);
  line-height: 0.94;
  letter-spacing: -0.03em;
}

.pm-lede {
  margin: 0;
  max-width: 42rem;
  color: var(--pm-muted);
  line-height: 1.6;
}

.pm-header-tools {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 14px;
}

.pm-search {
  flex: 1;
  min-width: 180px;
  border-radius: 999px;
  border: 1px solid rgba(23, 33, 38, 0.08);
  background: rgba(255, 255, 255, 0.88);
  padding: 13px 18px;
  color: var(--pm-text);
  font: inherit;
}

.pm-search:focus,
.pm-button:focus,
.pm-nav-link:focus {
  outline: 2px solid rgba(180, 93, 29, 0.38);
  outline-offset: 2px;
}

.pm-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #c86d2b, #8e4314);
  color: white;
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
  box-shadow: 0 10px 24px rgba(142, 67, 20, 0.24);
}

.pm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(142, 67, 20, 0.3);
}

.pm-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.pm-metric {
  border-radius: 18px;
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 241, 231, 0.72));
  border: 1px solid rgba(92, 105, 110, 0.12);
  animation: pm-pulse 2.8s ease-in-out infinite;
}

.pm-metric:nth-child(2) { animation-delay: 140ms; }
.pm-metric:nth-child(3) { animation-delay: 280ms; }
.pm-metric:nth-child(4) { animation-delay: 420ms; }

.pm-metric-value {
  display: block;
  margin-top: 6px;
  font-family: var(--pm-serif);
  font-size: 28px;
  line-height: 1;
}

.pm-sidebar {
  grid-column: 1;
  grid-row: 2;
  border-radius: 28px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pm-brand {
  padding: 10px 12px 18px;
  border-bottom: 1px solid rgba(92, 105, 110, 0.12);
}

.pm-brand-mark {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--pm-accent-soft);
  color: var(--pm-accent);
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pm-brand-title {
  margin: 12px 0 0;
  font-size: 22px;
  font-family: var(--pm-serif);
}

.pm-brand-copy {
  margin: 10px 0 0;
  color: var(--pm-muted);
  line-height: 1.55;
}

.pm-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pm-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-decoration: none;
  color: var(--pm-text);
  border-radius: 16px;
  padding: 12px 14px;
  background: transparent;
  transition: transform 160ms ease, background 160ms ease;
}

.pm-nav-link:hover,
.pm-nav-link[aria-current="page"] {
  transform: translateX(3px);
  background: rgba(255, 255, 255, 0.78);
}

.pm-nav-index {
  font-family: var(--pm-mono);
  color: var(--pm-muted);
}

.pm-sidebar-callout {
  margin-top: auto;
  border-radius: 22px;
  padding: 18px;
  background:
    linear-gradient(145deg, rgba(180, 93, 29, 0.88), rgba(118, 47, 20, 0.92)),
    var(--pm-accent);
  color: #fff7f0;
}

.pm-sidebar-callout h2,
.pm-sidebar-callout p {
  margin: 0;
}

.pm-sidebar-callout p {
  margin-top: 10px;
  opacity: 0.9;
  line-height: 1.5;
}

.pm-main,
.pm-rail,
.pm-stream {
  border-radius: 28px;
}

.pm-main {
  grid-column: 2;
  grid-row: 2;
  padding: 18px 18px 20px;
  overflow: hidden;
}

.pm-rail {
  grid-column: 3;
  grid-row: 2;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pm-stream {
  grid-column: 1 / -1;
  grid-row: 3;
  padding: 18px;
  background: linear-gradient(180deg, rgba(20, 28, 33, 0.95), rgba(14, 19, 23, 0.98));
  color: #f6f2e8;
}

.pm-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.pm-section-title {
  margin: 0;
  font-size: 22px;
  font-family: var(--pm-serif);
}

.pm-panel-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pm-card {
  border-radius: 24px;
  padding: 18px;
  background: var(--pm-panel-strong);
  border: 1px solid rgba(92, 105, 110, 0.12);
}

.pm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.pm-table th,
.pm-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(92, 105, 110, 0.12);
}

.pm-table th {
  color: var(--pm-muted);
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pm-table tbody tr {
  transition: transform 160ms ease, background 160ms ease;
}

.pm-table tbody tr:hover,
.pm-table tbody tr[data-selected="true"] {
  transform: translateY(-1px);
  background: rgba(180, 93, 29, 0.06);
}

.pm-status,
.pm-tone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.pm-status::before,
.pm-tone::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.pm-status-ready,
.pm-tone-success { color: var(--pm-ok); background: rgba(15, 109, 88, 0.12); }
.pm-status-bootstrapping,
.pm-status-running,
.pm-tone-info { color: var(--pm-accent); background: rgba(180, 93, 29, 0.12); }
.pm-status-degraded,
.pm-status-applying,
.pm-status-applied_unverified,
.pm-tone-warn { color: var(--pm-warn); background: rgba(157, 93, 19, 0.14); }
.pm-status-failed,
.pm-status-unreachable,
.pm-tone-error { color: var(--pm-bad); background: rgba(139, 53, 53, 0.12); }

.pm-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.pm-kv {
  display: grid;
  gap: 10px;
}

.pm-kv-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(92, 105, 110, 0.1);
}

.pm-kv-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.pm-kv-key {
  color: var(--pm-muted);
  font-family: var(--pm-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pm-list,
.pm-stream-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pm-list {
  display: grid;
  gap: 10px;
}

.pm-list-item {
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(248, 243, 234, 0.78);
  border: 1px solid rgba(92, 105, 110, 0.1);
}

.pm-stream-list {
  display: grid;
  gap: 8px;
  max-height: 100%;
  overflow: auto;
}

.pm-stream-item {
  display: grid;
  grid-template-columns: 78px 84px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--pm-mono);
  font-size: 13px;
}

.pm-stream-item:last-child {
  border-bottom: 0;
}

.pm-stream-time {
  color: rgba(255, 255, 255, 0.58);
}

.pm-hostname {
  font-family: var(--pm-serif);
  font-size: 28px;
  margin: 0;
}

.pm-artifact {
  color: var(--pm-accent);
  font-family: var(--pm-mono);
  font-size: 12px;
  word-break: break-all;
}

@keyframes pm-pulse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@media (max-width: 1100px) {
  .pm-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
  }

  .pm-sidebar,
  .pm-main,
  .pm-rail,
  .pm-stream {
    grid-column: 1;
  }

  .pm-sidebar { grid-row: 2; }
  .pm-main { grid-row: 3; }
  .pm-rail { grid-row: 4; }
  .pm-stream { grid-row: 5; }

  .pm-header {
    grid-template-columns: 1fr;
  }

  .pm-metrics,
  .pm-detail-grid {
    grid-template-columns: 1fr;
  }
}
`

export function webBootstrapMessage() {
  return 'PortManager web skeleton'
}

export function createMockHostDetailState(): HostDetailState {
  const host: HostDetail = {
    id: 'host_alpha',
    name: 'alpha-gateway',
    lifecycleState: 'ready',
    agentState: 'ready',
    tailscaleAddress: '100.64.0.10',
    updatedAt: '2026-04-16T18:02:00.000Z',
    lastBackupAt: '2026-04-16T17:45:00.000Z',
    lastDiagnosticsAt: '2026-04-16T17:52:00.000Z',
    labels: ['prod-edge', 'ubuntu-24.04'],
    effectivePolicy: {
      hostId: 'host_alpha',
      allowedSources: ['tailscale', 'corp-vpn'],
      excludedPorts: [22, 2375],
      samePortMirror: false,
      conflictPolicy: 'reject',
      backupPolicy: 'required'
    },
    recentOperations: [
      {
        id: 'op_apply_001',
        type: 'apply_policy',
        state: 'succeeded',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T17:41:00.000Z',
        finishedAt: '2026-04-16T17:43:00.000Z'
      },
      {
        id: 'op_diag_001',
        type: 'diagnostics',
        state: 'succeeded',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T17:49:00.000Z',
        finishedAt: '2026-04-16T17:52:00.000Z'
      }
    ],
    recentRules: [
      {
        id: 'rule_alpha_https',
        hostId: 'host_alpha',
        name: 'HTTPS relay',
        protocol: 'tcp',
        listenPort: 443,
        targetHost: '127.0.0.1',
        targetPort: 3000,
        lifecycleState: 'active',
        lastVerifiedAt: '2026-04-16T17:52:00.000Z',
        lastRollbackPointId: 'rp_alpha_001'
      },
      {
        id: 'rule_alpha_metrics',
        hostId: 'host_alpha',
        name: 'Metrics sidecar',
        protocol: 'tcp',
        listenPort: 9100,
        targetHost: '127.0.0.1',
        targetPort: 9100,
        lifecycleState: 'applied_unverified'
      }
    ]
  }

  return {
    host,
    healthChecks: [
      {
        id: 'hc_alpha_probe',
        hostId: 'host_alpha',
        category: 'host_probe',
        status: 'healthy',
        checkedAt: '2026-04-16T17:40:00.000Z',
        summary: 'tailscale, sudo, and nft dependencies verified'
      },
      {
        id: 'hc_alpha_bridge',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        category: 'bridge_verify',
        status: 'healthy',
        checkedAt: '2026-04-16T17:52:00.000Z',
        summary: '443 mirrored to 3000 with clean TCP reachability'
      }
    ],
    backups: [
      {
        id: 'backup_alpha_001',
        hostId: 'host_alpha',
        createdAt: '2026-04-16T17:38:00.000Z',
        localStatus: 'succeeded',
        githubStatus: 'skipped',
        manifestPath: '/var/lib/portmanager/snapshots/op_snapshot_001-manifest.json',
        operationId: 'op_snapshot_001'
      }
    ],
    diagnostics: [
      {
        id: 'op_diag_001',
        type: 'diagnostics',
        state: 'succeeded',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T17:49:00.000Z',
        finishedAt: '2026-04-16T17:52:00.000Z'
      }
    ],
    localArtifacts: [
      '/etc/portmanager/agent.toml',
      '/var/lib/portmanager/desired-state.toml',
      '/var/lib/portmanager/runtime-state.json',
      '/var/lib/portmanager/snapshots/op_snapshot_001-manifest.json',
      '/var/lib/portmanager/rollback/rp_alpha_001-result.json'
    ],
    eventStream: [
      {
        id: 'evt_001',
        level: 'success',
        timestamp: '17:38',
        summary: 'backup snapshot sealed before apply on host_alpha'
      },
      {
        id: 'evt_002',
        level: 'info',
        timestamp: '17:43',
        summary: 'policy apply completed for rule_alpha_https with active rollback point rp_alpha_001'
      },
      {
        id: 'evt_003',
        level: 'success',
        timestamp: '17:52',
        summary: 'diagnostics confirmed https relay and refreshed host readiness evidence'
      }
    ]
  }
}

export function createMockOverviewState(): OverviewState {
  const selectedHost = createMockHostDetailState()

  const secondaryHost: HostSummary = {
    id: 'host_bravo',
    name: 'bravo-lab',
    lifecycleState: 'bootstrapping',
    agentState: 'unknown',
    tailscaleAddress: '100.64.0.27',
    updatedAt: '2026-04-16T17:58:00.000Z',
    lastBackupAt: '2026-04-16T16:30:00.000Z'
  }

  const degradedHost: HostSummary = {
    id: 'host_charlie',
    name: 'charlie-staging',
    lifecycleState: 'degraded',
    agentState: 'degraded',
    tailscaleAddress: '100.64.0.38',
    updatedAt: '2026-04-16T17:51:00.000Z',
    lastBackupAt: '2026-04-16T16:14:00.000Z',
    lastDiagnosticsAt: '2026-04-16T17:44:00.000Z'
  }

  return {
    controllerHealth: 'healthy',
    managedHosts: [selectedHost.host, secondaryHost, degradedHost],
    selectedHost,
    activeOperations: 2,
    degradedCount: 1,
    eventStream: [
      ...selectedHost.eventStream,
      {
        id: 'evt_004',
        level: 'warn',
        timestamp: '17:58',
        summary: 'bootstrap still waiting for steady HTTP reachability on host_bravo'
      }
    ]
  }
}

export function OverviewPage(props: { state: OverviewState }) {
  const { state } = props

  return h(ShellFrame, {
    currentView: 'Overview',
    title: 'Control Plane',
    lede:
      'One host, one rule, one rollback. Dense operational truth first, decorative telemetry never.',
    metrics: [
      {
        label: 'Controller Health',
        value: state.controllerHealth,
        tone: state.controllerHealth === 'healthy' ? 'success' : 'warn'
      },
      {
        label: 'Managed Hosts',
        value: String(state.managedHosts.length),
        tone: 'info'
      },
      {
        label: 'Active Operations',
        value: String(state.activeOperations),
        tone: 'info'
      },
      {
        label: 'Degraded Count',
        value: String(state.degradedCount),
        tone: state.degradedCount > 0 ? 'warn' : 'success'
      }
    ],
    main: h(OverviewMain, { state }),
    rail: h(OverviewRail, { state }),
    eventStream: state.eventStream
  })
}

export function HostDetailPage(props: { state: HostDetailState }) {
  const { state } = props

  return h(ShellFrame, {
    currentView: 'Hosts',
    title: state.host.name,
    lede:
      'Host detail stays evidence-heavy: active policy, recent operations, rollback proof, diagnostics artifacts.',
    metrics: [
      {
        label: 'Lifecycle',
        value: state.host.lifecycleState,
        tone: toneFromState(state.host.lifecycleState)
      },
      {
        label: 'Agent State',
        value: state.host.agentState,
        tone: toneFromState(state.host.agentState)
      },
      {
        label: 'Active Rules',
        value: String(state.host.recentRules.length),
        tone: 'info'
      },
      {
        label: 'Last Backup',
        value: shortTime(state.host.lastBackupAt),
        tone: 'success'
      }
    ],
    main: h(HostDetailMain, { state }),
    rail: h(HostDetailRail, { state }),
    eventStream: state.eventStream
  })
}

export function renderWebPreviewDocument(view: WebView = 'overview') {
  const page =
    view === 'host-detail'
      ? h(HostDetailPage, { state: createMockHostDetailState() })
      : h(OverviewPage, { state: createMockOverviewState() })

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${webBootstrapMessage()}</title>`,
    `  <style>${webSkeletonStyles}</style>`,
    '</head>',
    '<body>',
    `  <div id="app">${renderToStaticMarkup(page)}</div>`,
    '</body>',
    '</html>'
  ].join('\n')
}

export function mountWebSkeleton(options: { container?: Element | null; view?: WebView } = {}) {
  if (typeof document === 'undefined') {
    return
  }

  ensureWebStyles(document)

  const container = options.container ?? document.getElementById('app') ?? document.body
  const view =
    options.view ??
    ((container instanceof HTMLElement && container.dataset.view === 'host-detail'
      ? 'host-detail'
      : 'overview') as WebView)

  let root = mountedRoots.get(container)
  if (!root) {
    root = createRoot(container)
    mountedRoots.set(container, root)
  }

  const page =
    view === 'host-detail'
      ? h(HostDetailPage, { state: createMockHostDetailState() })
      : h(OverviewPage, { state: createMockOverviewState() })

  root.render(page)
}

function ensureWebStyles(doc: Document) {
  if (doc.getElementById('pm-web-skeleton-styles')) {
    return
  }

  const style = doc.createElement('style')
  style.id = 'pm-web-skeleton-styles'
  style.textContent = webSkeletonStyles
  doc.head.append(style)
}

function ShellFrame(props: {
  currentView: string
  title: string
  lede: string
  metrics: Array<{ label: string; value: string; tone: Tone }>
  main: ReactNode
  rail: ReactNode
  eventStream: EventStreamEntry[]
}) {
  return h('div', { className: 'pm-shell' }, [
    h('header', { className: 'pm-header', key: 'header' }, [
      h('div', { className: 'pm-header-copy', key: 'copy' }, [
        h('span', { className: 'pm-eyebrow', key: 'eyebrow' }, webBootstrapMessage()),
        h('h1', { className: 'pm-title', key: 'title' }, props.title),
        h('p', { className: 'pm-lede', key: 'lede' }, props.lede)
      ]),
      h('div', { className: 'pm-header-tools', key: 'tools' }, [
        h('input', {
          key: 'search',
          className: 'pm-search',
          type: 'search',
          placeholder: 'Search hosts, rules, operations'
        }),
        h('button', { key: 'action', className: 'pm-button', type: 'button' }, 'Add Host')
      ]),
      h(
        'div',
        { className: 'pm-metrics', key: 'metrics' },
        props.metrics.map((metric) =>
          h('article', { className: 'pm-metric', key: metric.label }, [
            h('span', { className: 'pm-inline-label', key: 'label' }, metric.label),
            h('span', { className: 'pm-metric-value', key: 'value' }, metric.value),
            h('span', { className: `pm-tone pm-tone-${metric.tone}`, key: 'tone' }, metric.tone)
          ])
        )
      )
    ]),
    h(Sidebar, { currentView: props.currentView, key: 'sidebar' }),
    h('main', { className: 'pm-main', key: 'main' }, props.main),
    h('aside', { className: 'pm-rail', key: 'rail' }, props.rail),
    h(EventStreamPanel, { entries: props.eventStream, key: 'stream' })
  ])
}

function Sidebar(props: { currentView: string }) {
  return h('aside', { className: 'pm-sidebar' }, [
    h('div', { className: 'pm-brand', key: 'brand' }, [
      h('span', { className: 'pm-brand-mark', key: 'mark' }, 'portmanager'),
      h('h2', { className: 'pm-brand-title', key: 'title' }, 'Milestone 1 shell'),
      h(
        'p',
        { className: 'pm-brand-copy', key: 'copy' },
        'Overview shell stays dense, audit-forward, and aligned with PortManager semantics.'
      )
    ]),
    h(
      'nav',
      { className: 'pm-nav', key: 'nav', 'aria-label': 'Primary navigation' },
      navigationItems.map((item, index) =>
        h(
          'a',
          {
            className: 'pm-nav-link',
            href: `#${item.toLowerCase().replace(/\s+/g, '-')}`,
            key: item,
            'aria-current': item === props.currentView ? 'page' : undefined
          },
          [
            h('span', { className: 'pm-nav-index', key: 'index' }, `0${index + 1}`),
            h('span', { key: 'label' }, item)
          ]
        )
      )
    ),
    h('section', { className: 'pm-sidebar-callout', key: 'callout' }, [
      h('h2', { key: 'title' }, 'Primary action'),
      h(
        'p',
        { key: 'copy' },
        'Bootstrap one Ubuntu 24.04 host, prove one rule, preserve one rollback path.'
      )
    ])
  ])
}

function OverviewMain(props: { state: OverviewState }) {
  return h('section', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'hosts' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Managed Hosts',
        detail: `${props.state.managedHosts.length} tracked nodes`
      }),
      h(
        'table',
        { className: 'pm-table', key: 'table' },
        [
          h('thead', { key: 'head' }, [
            h('tr', { key: 'row' }, [
              h('th', { key: 'host' }, 'Host'),
              h('th', { key: 'tailscale' }, 'Tailscale'),
              h('th', { key: 'lifecycle' }, 'Lifecycle'),
              h('th', { key: 'agent' }, 'Agent'),
              h('th', { key: 'backup' }, 'Last Backup'),
              h('th', { key: 'updated' }, 'Updated')
            ])
          ]),
          h(
            'tbody',
            { key: 'body' },
            props.state.managedHosts.map((host) =>
              h(
                'tr',
                {
                  key: host.id,
                  'data-selected': host.id === props.state.selectedHost.host.id ? 'true' : undefined
                },
                [
                  h('td', { key: 'host' }, [
                    h('div', { key: 'name' }, host.name),
                    h('div', { className: 'pm-microcopy', key: 'id' }, host.id)
                  ]),
                  h('td', { key: 'tailscale' }, host.tailscaleAddress),
                  h('td', { key: 'lifecycle' }, h(StatusBadge, { state: host.lifecycleState })),
                  h('td', { key: 'agent' }, h(StatusBadge, { state: host.agentState })),
                  h('td', { key: 'backup' }, shortTime(host.lastBackupAt)),
                  h('td', { key: 'updated' }, shortTime(host.updatedAt))
                ]
              )
            )
          )
        ]
      )
    ])
  ])
}

function OverviewRail(props: { state: OverviewState }) {
  const detailState = props.state.selectedHost
  const policy = detailState.host.effectivePolicy

  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'selected-host' }, [
      h(SectionHeading, { key: 'heading', title: 'Selected Host', detail: detailState.host.id }),
      h('h2', { className: 'pm-hostname', key: 'name' }, detailState.host.name),
      h('div', { className: 'pm-kv', key: 'kv' }, [
        kvRow('Lifecycle', h(StatusBadge, { state: detailState.host.lifecycleState })),
        kvRow('Agent', h(StatusBadge, { state: detailState.host.agentState })),
        kvRow('Tailscale', detailState.host.tailscaleAddress),
        kvRow('Diagnostics', shortTime(detailState.host.lastDiagnosticsAt))
      ])
    ]),
    h('section', { className: 'pm-card', key: 'policy' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Effective Policy',
        detail: policy.backupPolicy
      }),
      h('div', { className: 'pm-kv', key: 'kv' }, [
        kvRow('Allowed Sources', policy.allowedSources.join(', ')),
        kvRow('Excluded Ports', policy.excludedPorts.map(String).join(', ')),
        kvRow('Conflict Policy', policy.conflictPolicy),
        kvRow('Same Port Mirror', policy.samePortMirror ? 'enabled' : 'disabled')
      ])
    ])
  ])
}

function HostDetailMain(props: { state: HostDetailState }) {
  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'identity' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Identity and readiness summary',
        detail: props.state.host.id
      }),
      h('div', { className: 'pm-kv', key: 'kv' }, [
        kvRow('Host Name', props.state.host.name),
        kvRow('Lifecycle', h(StatusBadge, { state: props.state.host.lifecycleState })),
        kvRow('Agent State', h(StatusBadge, { state: props.state.host.agentState })),
        kvRow('Labels', (props.state.host.labels ?? []).join(', ')),
        kvRow('Updated', shortTime(props.state.host.updatedAt))
      ])
    ]),
    h('section', { className: 'pm-card', key: 'policy' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Effective exposure policy',
        detail: props.state.host.effectivePolicy.backupPolicy
      }),
      h('div', { className: 'pm-kv', key: 'kv' }, [
        kvRow('Allowed Sources', props.state.host.effectivePolicy.allowedSources.join(', ')),
        kvRow('Excluded Ports', props.state.host.effectivePolicy.excludedPorts.map(String).join(', ')),
        kvRow('Conflict Policy', props.state.host.effectivePolicy.conflictPolicy),
        kvRow(
          'Same Port Mirror',
          props.state.host.effectivePolicy.samePortMirror ? 'enabled' : 'disabled'
        )
      ])
    ]),
    h('section', { className: 'pm-card', key: 'rules' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Bridge rules',
        detail: `${props.state.host.recentRules.length} tracked`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.host.recentRules.map((rule) =>
          h('li', { className: 'pm-list-item', key: rule.id }, [
            h('div', { key: 'line1' }, `${rule.id} · ${rule.listenPort} -> ${rule.targetPort}`),
            h('div', { className: 'pm-microcopy', key: 'line2' }, `${rule.protocol} · ${rule.targetHost}`),
            h(StatusBadge, { key: 'badge', state: rule.lifecycleState })
          ])
        )
      )
    ]),
    h('section', { className: 'pm-card', key: 'health' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recent health checks',
        detail: `${props.state.healthChecks.length} samples`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.healthChecks.map((check) =>
          h('li', { className: 'pm-list-item', key: check.id }, [
            h('div', { key: 'line1' }, `${check.category} · ${shortTime(check.checkedAt)}`),
            h('div', { key: 'line2' }, check.summary ?? 'No summary'),
            h(StatusBadge, { key: 'badge', state: check.status })
          ])
        )
      )
    ]),
    h('section', { className: 'pm-card', key: 'operations' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recent operations',
        detail: `${props.state.host.recentOperations.length} entries`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.host.recentOperations.map((operation) =>
          h('li', { className: 'pm-list-item', key: operation.id }, [
            h('div', { key: 'line1' }, `${operation.id} · ${operation.type}`),
            h('div', { className: 'pm-microcopy', key: 'line2' }, `rule ${operation.ruleId ?? 'n/a'}`),
            h(StatusBadge, { key: 'badge', state: operation.state })
          ])
        )
      )
    ]),
    h('section', { className: 'pm-card', key: 'backups' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Backup and rollback history',
        detail: `${props.state.backups.length} local backups`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.backups.map((backup) =>
          h('li', { className: 'pm-list-item', key: backup.id }, [
            h('div', { key: 'line1' }, `${backup.id} · ${shortTime(backup.createdAt)}`),
            h('div', { className: 'pm-microcopy', key: 'line2' }, backup.manifestPath ?? 'no manifest path'),
            h(StatusBadge, { key: 'badge', state: backup.localStatus })
          ])
        )
      )
    ])
  ])
}

function HostDetailRail(props: { state: HostDetailState }) {
  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'diagnostics' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Latest diagnostics and snapshots',
        detail: `${props.state.diagnostics.length} operations`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.diagnostics.map((diagnostic) =>
          h('li', { className: 'pm-list-item', key: diagnostic.id }, [
            h('div', { key: 'line1' }, `${diagnostic.id} · ${diagnostic.type}`),
            h('div', { className: 'pm-microcopy', key: 'line2' }, `finished ${shortTime(diagnostic.finishedAt)}`),
            h(StatusBadge, { key: 'badge', state: diagnostic.state })
          ])
        )
      )
    ]),
    h('section', { className: 'pm-card', key: 'artifacts' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Local artifact references',
        detail: `${props.state.localArtifacts.length} paths`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.localArtifacts.map((artifact) =>
          h('li', { className: 'pm-list-item', key: artifact }, [
            h('div', { className: 'pm-artifact', key: 'artifact' }, artifact)
          ])
        )
      )
    ])
  ])
}

function EventStreamPanel(props: { entries: EventStreamEntry[] }) {
  return h('section', { className: 'pm-stream' }, [
    h(SectionHeading, { key: 'heading', title: 'Event Stream', detail: 'terminal evidence' }),
    h(
      'ul',
      { className: 'pm-stream-list', key: 'list' },
      props.entries.map((entry) =>
        h('li', { className: 'pm-stream-item', key: entry.id }, [
          h('span', { className: 'pm-stream-time', key: 'time' }, entry.timestamp),
          h('span', { className: `pm-tone pm-tone-${entry.level}`, key: 'level' }, entry.level),
          h('span', { key: 'summary' }, entry.summary)
        ])
      )
    )
  ])
}

function SectionHeading(props: { title: string; detail: string }) {
  return h('div', { className: 'pm-section-heading' }, [
    h('h2', { className: 'pm-section-title', key: 'title' }, props.title),
    h('span', { className: 'pm-inline-label', key: 'detail' }, props.detail)
  ])
}

function StatusBadge(props: { state: string }) {
  return h('span', { className: `pm-status pm-status-${props.state}` }, props.state)
}

function kvRow(key: string, value: ReactNode) {
  return h('div', { className: 'pm-kv-row', key }, [
    h('span', { className: 'pm-kv-key', key: 'key' }, key),
    h('div', { key: 'value' }, value)
  ])
}

type Tone = 'success' | 'info' | 'warn'

function toneFromState(state: string): Tone {
  if (state === 'ready' || state === 'active' || state === 'succeeded' || state === 'healthy') {
    return 'success'
  }
  if (
    state === 'degraded' ||
    state === 'failed' ||
    state === 'unreachable' ||
    state === 'bootstrapping' ||
    state === 'applied_unverified'
  ) {
    return 'warn'
  }
  return 'info'
}

function shortTime(value?: string) {
  if (!value) {
    return 'n/a'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toISOString().slice(11, 16)
}

if (typeof document !== 'undefined') {
  const container = document.getElementById('app')
  if (container) {
    mountWebSkeleton({ container })
  }
}

export type ControllerEventEnvelope = components['schemas']['EventStreamEnvelope']

import type {
  BackupSummary,
  BridgeRule,
  components,
  ExposurePolicy,
  HealthCheck,
  HostDetail,
  HostSummary,
  OperationSummary,
  RollbackPoint
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

export type OperationDetailContract = components['schemas']['OperationDetail']
export interface EventStreamEntry {
  id: string
  level: 'info' | 'success' | 'warn'
  timestamp: string
  summary: string
}

export type OperationEventContract = components['schemas']['OperationEvent']
export interface EventAuditIndexEntry {
  operation: OperationDetailContract
  latestEvent: OperationEventContract | null
  eventCount: number
  firstEventAt?: string
  lastEventAt?: string
  latestDiagnostic?: OperationDetailContract
  backup?: BackupSummary
  rollbackPoint?: RollbackPoint
  linkedArtifacts: string[]
}
type FetchLike = typeof fetch

interface ControllerListEnvelope<T> {
  items: T[]
}

export interface ControllerLoadOptions {
  baseUrl: string
  fetchImpl?: FetchLike
  eventLimit?: number
}

export interface HostDetailState {
  host: HostDetail
  healthChecks: HealthCheck[]
  backups: BackupSummary[]
  rollbackPoints: RollbackPoint[]
  diagnostics: OperationDetailContract[]
  localArtifacts: string[]
  eventStream: EventStreamEntry[]
}

export interface OverviewState {
  controllerHealth: 'healthy' | 'degraded'
  managedHosts: HostSummary[]
  selectedHost: HostDetailState | null
  activeOperations: number
  degradedCount: number
  eventStream: EventStreamEntry[]
}

export interface OperationInventoryEntry {
  operation: OperationDetailContract
  requestSource: string
  linkedRuleId?: string
  linkedArtifacts: string[]
}

export interface OperationsState {
  operations: OperationInventoryEntry[]
  auditIndex: EventAuditIndexEntry[]
  selectedOperationId: string
  timeline: OperationEventContract[]
}

export interface HostsState {
  hosts: HostSummary[]
  selectedHost: HostDetailState | null
  eventStream: EventStreamEntry[]
}

export interface BridgeRulesState {
  rules: BridgeRule[]
  selectedRule: BridgeRule | null
  selectedHost: HostDetailState | null
  healthChecks: HealthCheck[]
  operations: OperationSummary[]
  diagnostics: OperationDetailContract[]
  eventStream: EventStreamEntry[]
}

export interface BackupsState {
  backups: BackupSummary[]
  selectedBackup: BackupSummary | null
  selectedHost: HostDetailState | null
  rollbackPoints: RollbackPoint[]
  operations: OperationSummary[]
  eventStream: EventStreamEntry[]
}

export interface ConsoleState {
  operations: OperationDetailContract[]
  auditIndex: EventAuditIndexEntry[]
  selectedOperation: OperationDetailContract | null
  diagnostics: OperationDetailContract[]
  selectedDiagnostic: OperationDetailContract | null
  events: OperationEventContract[]
  eventStream: EventStreamEntry[]
}

export type WebView =
  | 'overview'
  | 'host-detail'
  | 'hosts'
  | 'bridge-rules'
  | 'operations'
  | 'backups'
  | 'console'

const mountedRoots = new WeakMap<Element, Root>()
const navigationItems = ['Overview', 'Hosts', 'Bridge Rules', 'Operations', 'Backups', 'Console']

export function eventEntryFromOperationEvent(event: OperationEventContract): EventStreamEntry {
  return {
    id: event.id,
    level: event.level === 'error' ? 'warn' : event.level,
    timestamp: shortTime(event.emittedAt),
    summary: event.summary
  }
}

function defaultFetch(input: string | URL | Request, init?: RequestInit) {
  return fetch(input, init)
}

function controllerUrl(baseUrl: string, pathname: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(pathname, baseUrl)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  return url
}

async function fetchControllerJson<T>(
  baseUrl: string,
  pathname: string,
  options: {
    params?: Record<string, string | number | undefined>
    fetchImpl?: FetchLike
  } = {}
) {
  const fetchImpl = options.fetchImpl ?? defaultFetch
  const response = await fetchImpl(controllerUrl(baseUrl, pathname, options.params))

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`controller request failed for ${pathname}: ${response.status} ${body}`)
  }

  return (await response.json()) as T
}

async function fetchControllerList<T>(
  baseUrl: string,
  pathname: string,
  options: {
    params?: Record<string, string | number | undefined>
    fetchImpl?: FetchLike
  } = {}
) {
  const payload = await fetchControllerJson<ControllerListEnvelope<T>>(baseUrl, pathname, options)
  return payload.items
}

function selectById<T extends { id: string }>(items: T[], preferredId?: string) {
  if (!items.length) {
    return null
  }

  if (!preferredId) {
    return items[0] ?? null
  }

  return items.find((item) => item.id === preferredId) ?? items[0] ?? null
}

function dedupeStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function artifactPathsFromOperations(operations: Array<OperationSummary | OperationDetailContract>) {
  return dedupeStrings(
    operations.flatMap((operation) => {
      const snapshotArtifact =
        'snapshotResult' in operation && operation.snapshotResult?.artifactPath
          ? operation.snapshotResult.artifactPath
          : undefined

      return [snapshotArtifact]
    })
  )
}

function diagnosticsInState(
  diagnostics: OperationDetailContract[],
  state: Extract<OperationDetailContract['state'], 'degraded' | 'succeeded'>
) {
  return diagnostics.filter((diagnostic) => diagnostic.state === state)
}

function diagnosticHeadline(diagnostic: OperationDetailContract) {
  return (
    diagnostic.snapshotResult?.pageTitle ??
    diagnostic.diagnosticResult?.pageTitle ??
    diagnostic.resultSummary ??
    `finished ${shortTime(diagnostic.finishedAt)}`
  )
}

function diagnosticDetail(diagnostic: OperationDetailContract) {
  return (
    diagnostic.resultSummary ??
    diagnostic.diagnosticResult?.finalUrl ??
    diagnostic.snapshotResult?.artifactPath ??
    'No summary'
  )
}

function diagnosticArtifact(diagnostic: OperationDetailContract) {
  return diagnostic.snapshotResult?.artifactPath ?? diagnostic.diagnosticResult?.finalUrl ?? 'no snapshot artifact'
}

function operationMomentValue(operation: Pick<OperationDetailContract, 'startedAt' | 'finishedAt'>) {
  const value = Date.parse(operation.finishedAt ?? operation.startedAt ?? '')
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY
}

function diagnosticsRecoveryVerdict(diagnostics: OperationDetailContract[]) {
  const degradedDiagnostics = diagnosticsInState(diagnostics, 'degraded')
  const recoveryDiagnostics = diagnosticsInState(diagnostics, 'succeeded')
  const latestDegraded = degradedDiagnostics[0] ?? null
  const latestRecovery = recoveryDiagnostics[0] ?? null

  if (latestDegraded && latestRecovery) {
    if (operationMomentValue(latestRecovery) >= operationMomentValue(latestDegraded)) {
      return {
        state: 'succeeded',
        summary: 'Latest successful diagnostics prove recovery after degraded verification.',
        detail: `${latestRecovery.id} closed after ${latestDegraded.id}.`
      }
    }

    return {
      state: 'degraded',
      summary: 'Latest degraded diagnostic still needs fresh success evidence.',
      detail: `${latestDegraded.id} is newer than ${latestRecovery.id}.`
    }
  }

  if (latestRecovery) {
    return {
      state: 'succeeded',
      summary: 'Recovery-ready diagnostics available for replay and artifact review.',
      detail: `${latestRecovery.id} remains the freshest successful evidence.`
    }
  }

  if (latestDegraded) {
    return {
      state: 'degraded',
      summary: 'Degraded diagnostics remain active without recovery confirmation.',
      detail: `${latestDegraded.id} is the freshest diagnostic evidence.`
    }
  }

  return null
}

function renderDiagnosticsList(
  diagnostics: OperationDetailContract[],
  emptyCopy: string,
  key: string
) {
  return diagnostics.length
    ? h(
        'ul',
        { className: 'pm-list', key },
        diagnostics.map((diagnostic) =>
          h('li', { className: 'pm-list-item', key: diagnostic.id }, [
            h('div', { key: 'line1' }, `${diagnostic.id} · ${diagnostic.type}`),
            h(
              'div',
              { className: 'pm-microcopy', key: 'line2' },
              `${diagnostic.ruleId ?? 'host-wide'} · finished ${shortTime(diagnostic.finishedAt)}`
            ),
            h('div', { key: 'line3' }, diagnosticHeadline(diagnostic)),
            h('div', { key: 'line4' }, diagnosticDetail(diagnostic)),
            h('div', { className: 'pm-artifact', key: 'line5' }, diagnosticArtifact(diagnostic)),
            h(StatusBadge, { key: 'badge', state: diagnostic.state })
          ])
        )
      )
    : h('div', { key }, emptyState(emptyCopy))
}

function backupRemoteConfiguredCopy(backup: BackupSummary) {
  return backup.remoteConfigured ? 'configured' : 'needs setup'
}

function backupRemoteStatusSummary(backup: BackupSummary) {
  return backup.remoteStatusSummary ?? `${backup.remoteTarget ?? 'remote'} backup guidance unavailable`
}

function backupRemoteAction(backup: BackupSummary) {
  return backup.remoteAction ?? 'No remote backup action guidance published.'
}

function requestSourceFromOperation(operation: OperationDetailContract) {
  return `${operation.initiator ?? 'controller'}/${operation.type}`
}

function selectAuditIndexEntry(entries: EventAuditIndexEntry[], operationId?: string) {
  if (!entries.length) {
    return null
  }

  if (!operationId) {
    return entries[0] ?? null
  }

  return entries.find((entry) => entry.operation.id === operationId) ?? entries[0] ?? null
}

function renderAuditIndexList(entries: EventAuditIndexEntry[], key: string) {
  return entries.length
    ? h(
        'ul',
        { className: 'pm-list', key },
        entries.map((entry) =>
          h('li', { className: 'pm-list-item', key: entry.operation.id }, [
            h('div', { key: 'line1' }, `${entry.operation.id} · ${entry.operation.type}`),
            h(
              'div',
              { className: 'pm-microcopy', key: 'line2' },
              `${entry.eventCount} events · ${shortTime(entry.lastEventAt)}`
            ),
            h(
              'div',
              { key: 'line3' },
              entry.latestEvent?.summary ?? entry.operation.resultSummary ?? 'No indexed summary'
            ),
            h(
              'div',
              { className: 'pm-artifact', key: 'line4' },
              entry.linkedArtifacts[0] ??
                entry.latestDiagnostic?.snapshotResult?.pageTitle ??
                'No linked audit artifact'
            ),
            h(StatusBadge, { key: 'badge', state: entry.operation.state })
          ])
        )
      )
    : emptyState('No indexed event and audit entries are available yet.', key)
}

function readControllerBaseUrl(container?: Element | null) {
  if (container instanceof HTMLElement) {
    const datasetBaseUrl = container.dataset.controllerBaseUrl?.trim()
    if (datasetBaseUrl) {
      return datasetBaseUrl
    }
  }

  const globalConfig = globalThis as typeof globalThis & {
    PORTMANAGER_CONTROLLER_BASE_URL?: string
    __PORTMANAGER_CONTROLLER_BASE_URL__?: string
  }

  if (typeof globalConfig.PORTMANAGER_CONTROLLER_BASE_URL === 'string' && globalConfig.PORTMANAGER_CONTROLLER_BASE_URL) {
    return globalConfig.PORTMANAGER_CONTROLLER_BASE_URL
  }

  if (
    typeof globalConfig.__PORTMANAGER_CONTROLLER_BASE_URL__ === 'string' &&
    globalConfig.__PORTMANAGER_CONTROLLER_BASE_URL__
  ) {
    return globalConfig.__PORTMANAGER_CONTROLLER_BASE_URL__
  }

  if (typeof process !== 'undefined' && typeof process.env?.PORTMANAGER_CONTROLLER_BASE_URL === 'string') {
    return process.env.PORTMANAGER_CONTROLLER_BASE_URL
  }

  return undefined
}

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
.pm-status-live,
.pm-tone-success { color: var(--pm-ok); background: rgba(15, 109, 88, 0.12); }
.pm-status-bootstrapping,
.pm-status-running,
.pm-tone-info { color: var(--pm-accent); background: rgba(180, 93, 29, 0.12); }
.pm-status-degraded,
.pm-status-applying,
.pm-status-applied_unverified,
.pm-status-stale,
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

.pm-empty-state {
  border-radius: 18px;
  padding: 16px;
  color: var(--pm-muted);
  background: rgba(246, 240, 229, 0.68);
  border: 1px dashed rgba(92, 105, 110, 0.2);
  line-height: 1.6;
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
    agentVersion: '0.1.0',
    agentHeartbeatAt: '2026-04-16T18:01:00.000Z',
    agentHeartbeatState: 'live',
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
        finishedAt: '2026-04-16T17:43:00.000Z',
        resultSummary: 'policy apply completed for rule_alpha_https with active rollback point rp_alpha_001',
        rollbackPointId: 'rp_alpha_001'
      },
      {
        id: 'op_diag_001',
        type: 'diagnostics',
        state: 'succeeded',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T17:49:00.000Z',
        finishedAt: '2026-04-16T17:52:00.000Z',
        resultSummary: 'diagnostics confirmed https relay and refreshed host readiness evidence'
      },
      {
        id: 'op_backup_required_001',
        type: 'backup',
        state: 'degraded',
        hostId: 'host_alpha',
        startedAt: '2026-04-16T18:11:00.000Z',
        finishedAt: '2026-04-16T18:12:00.000Z',
        resultSummary: 'required GitHub backup is not configured',
        backupId: 'backup_alpha_002',
        rollbackPointId: 'rp_alpha_002'
      },
      {
        id: 'op_verify_001',
        type: 'verify_rule',
        state: 'degraded',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T18:08:00.000Z',
        finishedAt: '2026-04-16T18:09:00.000Z'
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
        lifecycleState: 'degraded',
        lastVerifiedAt: '2026-04-16T18:09:00.000Z',
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

  const operationEvents: OperationEventContract[] = [
    {
      id: 'evt_001',
      kind: 'operation_state_changed',
      operationId: 'op_backup_001',
      operationType: 'backup',
      state: 'succeeded',
      level: 'success',
      summary: 'backup snapshot sealed before apply on host_alpha',
      hostId: 'host_alpha',
      emittedAt: '2026-04-16T17:38:00.000Z'
    },
    {
      id: 'evt_002',
      kind: 'operation_state_changed',
      operationId: 'op_apply_001',
      operationType: 'apply_policy',
      state: 'succeeded',
      level: 'success',
      summary: 'policy apply completed for rule_alpha_https with active rollback point rp_alpha_001',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https',
      emittedAt: '2026-04-16T17:43:00.000Z'
    },
    {
      id: 'evt_003',
      kind: 'operation_state_changed',
      operationId: 'op_diag_001',
      operationType: 'diagnostics',
      state: 'succeeded',
      level: 'success',
      summary: 'diagnostics confirmed https relay and refreshed host readiness evidence',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https',
      emittedAt: '2026-04-16T17:52:00.000Z'
    },
    {
      id: 'evt_004',
      kind: 'operation_state_changed',
      operationId: 'op_verify_001',
      operationType: 'verify_rule',
      state: 'degraded',
      level: 'warn',
      summary:
        'drift detected for rule_alpha_https; required backup policy keeps rollback inspection explicit',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https',
      emittedAt: '2026-04-16T18:09:00.000Z'
    }
  ]

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
        status: 'degraded',
        checkedAt: '2026-04-16T18:09:00.000Z',
        summary:
          'drift detected: expected expected_hash_alpha, observed observed_hash_bravo, rollback inspection required',
        backupPolicy: 'required'
      }
    ],
    backups: [
      {
        id: 'backup_alpha_002',
        hostId: 'host_alpha',
        createdAt: '2026-04-16T18:12:00.000Z',
        backupMode: 'required',
        localStatus: 'succeeded',
        githubStatus: 'not_configured',
        remoteTarget: 'github',
        remoteConfigured: false,
        remoteStatusSummary:
          'GitHub backup missing; required-mode degradation stays active until remote backup is configured.',
        remoteAction: 'Configure GitHub backup before rerunning required-mode mutations.',
        manifestPath: '/var/lib/portmanager/snapshots/op_snapshot_002-manifest.json',
        operationId: 'op_snapshot_002'
      },
      {
        id: 'backup_alpha_001',
        hostId: 'host_alpha',
        createdAt: '2026-04-16T17:38:00.000Z',
        backupMode: 'best_effort',
        localStatus: 'succeeded',
        githubStatus: 'not_configured',
        remoteTarget: 'github',
        remoteConfigured: false,
        remoteStatusSummary:
          'GitHub backup missing; best_effort keeps local-only continuation with backup evidence.',
        remoteAction:
          'Configure GitHub backup for remote redundancy or keep best_effort local-only behavior.',
        manifestPath: '/var/lib/portmanager/snapshots/op_snapshot_001-manifest.json',
        operationId: 'op_snapshot_001'
      }
    ],
    rollbackPoints: [
      {
        id: 'rp_alpha_001',
        hostId: 'host_alpha',
        operationId: 'op_snapshot_001',
        state: 'applied',
        createdAt: '2026-04-16T17:38:30.000Z'
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
        finishedAt: '2026-04-16T17:52:00.000Z',
        diagnosticResult: {
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_https',
          capturedAt: '2026-04-16T17:52:00.000Z',
          port: 443,
          tcpReachable: true,
          httpStatus: 200,
          pageTitle: 'Alpha Relay Healthy',
          finalUrl: 'http://127.0.0.1/status'
        },
        snapshotResult: {
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_https',
          capturedAt: '2026-04-16T17:52:00.000Z',
          port: 443,
          httpStatus: 200,
          pageTitle: 'Alpha Relay Healthy',
          artifactPath: '/var/lib/portmanager/snapshots/snapshot-op_diag_001.html'
        }
      }
    ],
    localArtifacts: [
      '/etc/portmanager/agent.toml',
      '/var/lib/portmanager/desired-state.toml',
      '/var/lib/portmanager/runtime-state.json',
      '/var/lib/portmanager/snapshots/op_snapshot_002-manifest.json',
      '/var/lib/portmanager/snapshots/op_snapshot_001-manifest.json',
      '/var/lib/portmanager/snapshots/snapshot-op_diag_001.html',
      '/var/lib/portmanager/rollback/rp_alpha_001-result.json'
    ],
    eventStream: operationEvents.map(eventEntryFromOperationEvent)
  }
}

export function createMockOverviewState(): OverviewState {
  const selectedHost = createMockHostDetailState()

  const secondaryHost: HostSummary = {
    id: 'host_bravo',
    name: 'bravo-lab',
    lifecycleState: 'bootstrapping',
    agentState: 'unknown',
    agentHeartbeatState: 'unknown',
    tailscaleAddress: '100.64.0.27',
    updatedAt: '2026-04-16T17:58:00.000Z',
    lastBackupAt: '2026-04-16T16:30:00.000Z'
  }

  const degradedHost: HostSummary = {
    id: 'host_charlie',
    name: 'charlie-staging',
    lifecycleState: 'degraded',
    agentState: 'degraded',
    agentVersion: '0.1.0',
    agentHeartbeatAt: '2026-04-16T17:20:00.000Z',
    agentHeartbeatState: 'stale',
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
      eventEntryFromOperationEvent({
        id: 'evt_005',
        kind: 'operation_state_changed',
        operationId: 'op_bootstrap_002',
        operationType: 'bootstrap_host',
        state: 'degraded',
        level: 'warn',
        summary: 'bootstrap still waiting for steady HTTP reachability on host_bravo',
        hostId: 'host_bravo',
        emittedAt: '2026-04-16T17:58:00.000Z'
      })
    ]
  }
}

export function createMockOperationsState(): OperationsState {
  const operations = [
    {
      operation: {
        id: 'op_backup_required_001',
        type: 'backup',
        state: 'degraded',
        initiator: 'web',
        hostId: 'host_alpha',
        startedAt: '2026-04-16T18:11:00.000Z',
        finishedAt: '2026-04-16T18:12:00.000Z',
        resultSummary: 'required GitHub backup is not configured',
        backupId: 'backup_alpha_002',
        rollbackPointId: 'rp_alpha_002',
        eventStreamUrl: '/operations/events?operationId=op_backup_required_001'
      },
      requestSource: 'policy-runbook/backup-required',
      linkedRuleId: 'rule_alpha_https',
      linkedArtifacts: [
        '/var/lib/portmanager/snapshots/op_snapshot_002-manifest.json',
        '/var/lib/portmanager/rollback/rp_alpha_002-result.json',
        '/var/lib/portmanager/snapshots/snapshot-op_diag_001.html'
      ]
    },
    {
      operation: {
        id: 'op_diag_001',
        type: 'diagnostics',
        state: 'succeeded',
        initiator: 'web',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T17:49:00.000Z',
        finishedAt: '2026-04-16T17:52:00.000Z',
        resultSummary: 'diagnostics confirmed https relay and refreshed host readiness evidence',
        eventStreamUrl: '/operations/events?operationId=op_diag_001'
      },
      requestSource: 'host-detail/diagnostics',
      linkedRuleId: 'rule_alpha_https',
      linkedArtifacts: ['/var/lib/portmanager/snapshots/snapshot-op_diag_001.html']
    },
    {
      operation: {
        id: 'op_verify_001',
        type: 'verify_rule',
        state: 'degraded',
        initiator: 'automation',
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        startedAt: '2026-04-16T18:08:00.000Z',
        finishedAt: '2026-04-16T18:09:00.000Z',
        resultSummary:
          'drift detected: expected expected_hash_alpha, observed observed_hash_bravo, rollback inspection required',
        eventStreamUrl: '/operations/events?operationId=op_verify_001'
      },
      requestSource: 'drift-watch/bridge-verify',
      linkedRuleId: 'rule_alpha_https',
      linkedArtifacts: ['/var/lib/portmanager/rollback/rp_alpha_001-result.json']
    }
  ] satisfies OperationInventoryEntry[]

  const timeline = [
    {
      id: 'evt_010',
      kind: 'operation_state_changed',
      operationId: 'op_backup_required_001',
      operationType: 'backup',
      state: 'running',
      level: 'info',
      summary: 'backup operation entered running',
      hostId: 'host_alpha',
      emittedAt: '2026-04-16T18:11:10.000Z'
    },
    {
      id: 'evt_011',
      kind: 'operation_state_changed',
      operationId: 'op_backup_required_001',
      operationType: 'backup',
      state: 'degraded',
      level: 'warn',
      summary: 'required GitHub backup is not configured',
      hostId: 'host_alpha',
      emittedAt: '2026-04-16T18:12:00.000Z'
    }
  ] satisfies OperationEventContract[]

  return {
    operations,
    auditIndex: [
      {
        operation: operations[0].operation,
        latestEvent: timeline[1] ?? null,
        eventCount: 2,
        firstEventAt: timeline[0]?.emittedAt,
        lastEventAt: timeline[1]?.emittedAt,
        latestDiagnostic: operations[1].operation,
        backup: {
          id: 'backup_alpha_002',
          hostId: 'host_alpha',
          operationId: 'op_backup_required_001',
          createdAt: '2026-04-16T18:11:20.000Z',
          backupMode: 'required',
          localStatus: 'succeeded',
          githubStatus: 'not_configured',
          manifestPath: '/var/lib/portmanager/snapshots/op_snapshot_002-manifest.json',
          remoteTarget: 'github',
          remoteConfigured: false,
          remoteStatusSummary:
            'GitHub backup missing; required-mode degradation stays active until remote backup is configured.',
          remoteAction: 'Configure GitHub backup before rerunning required-mode mutations.'
        },
        rollbackPoint: {
          id: 'rp_alpha_002',
          hostId: 'host_alpha',
          operationId: 'op_backup_required_001',
          state: 'ready',
          createdAt: '2026-04-16T18:11:20.000Z'
        },
        linkedArtifacts: operations[0].linkedArtifacts
      },
      {
        operation: operations[1].operation,
        latestEvent: {
          id: 'evt_009',
          kind: 'operation_state_changed',
          operationId: 'op_diag_001',
          operationType: 'diagnostics',
          state: 'succeeded',
          level: 'success',
          summary: 'diagnostics confirmed https relay and refreshed host readiness evidence',
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_https',
          emittedAt: '2026-04-16T17:52:00.000Z'
        },
        eventCount: 2,
        firstEventAt: '2026-04-16T17:49:10.000Z',
        lastEventAt: '2026-04-16T17:52:00.000Z',
        latestDiagnostic: operations[1].operation,
        linkedArtifacts: operations[1].linkedArtifacts
      },
      {
        operation: operations[2].operation,
        latestEvent: {
          id: 'evt_008',
          kind: 'operation_state_changed',
          operationId: 'op_verify_001',
          operationType: 'verify_rule',
          state: 'degraded',
          level: 'warn',
          summary:
            'drift detected: expected expected_hash_alpha, observed observed_hash_bravo, rollback inspection required',
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_https',
          emittedAt: '2026-04-16T18:09:00.000Z'
        },
        eventCount: 2,
        firstEventAt: '2026-04-16T18:08:05.000Z',
        lastEventAt: '2026-04-16T18:09:00.000Z',
        latestDiagnostic: operations[1].operation,
        linkedArtifacts: operations[2].linkedArtifacts
      }
    ],
    selectedOperationId: 'op_backup_required_001',
    timeline
  }
}

export function createMockHostsState(): HostsState {
  const overview = createMockOverviewState()

  return {
    hosts: overview.managedHosts,
    selectedHost: overview.selectedHost,
    eventStream: overview.eventStream
  }
}

export function createMockBridgeRulesState(): BridgeRulesState {
  const selectedHost = createMockHostDetailState()
  const selectedRule = selectedHost.host.recentRules[0] ?? null

  return {
    rules: selectedHost.host.recentRules,
    selectedRule,
    selectedHost,
    healthChecks: selectedHost.healthChecks.filter(
      (check) => !selectedRule || check.ruleId === selectedRule.id
    ),
    operations: selectedHost.host.recentOperations.filter(
      (operation) => !selectedRule || operation.ruleId === selectedRule.id
    ),
    diagnostics: selectedHost.diagnostics.filter(
      (diagnostic) => !selectedRule || diagnostic.ruleId === selectedRule.id
    ),
    eventStream: selectedHost.eventStream
  }
}

export function createMockBackupsState(): BackupsState {
  const selectedHost = createMockHostDetailState()

  return {
    backups: selectedHost.backups,
    selectedBackup: selectedHost.backups[0] ?? null,
    selectedHost,
    rollbackPoints: selectedHost.rollbackPoints,
    operations: selectedHost.host.recentOperations.filter(
      (operation) =>
        operation.type === 'backup' ||
        operation.type === 'rollback' ||
        Boolean(operation.backupId) ||
        Boolean(operation.rollbackPointId)
    ),
    eventStream: selectedHost.eventStream
  }
}

export function createMockConsoleState(): ConsoleState {
  const operationsState = createMockOperationsState()
  const hostDetailState = createMockHostDetailState()

  return {
    operations: operationsState.operations.map((entry) => entry.operation),
    auditIndex: operationsState.auditIndex,
    selectedOperation: operationsState.operations[0]?.operation ?? null,
    diagnostics: hostDetailState.diagnostics,
    selectedDiagnostic: hostDetailState.diagnostics[0] ?? null,
    events: operationsState.timeline,
    eventStream: operationsState.timeline.map(eventEntryFromOperationEvent)
  }
}

async function loadOperationDetails(
  baseUrl: string,
  options: {
    params?: Record<string, string | number | undefined>
    fetchImpl?: FetchLike
  } = {}
) {
  const operations = await fetchControllerList<OperationSummary>(baseUrl, '/operations', options)

  if (!operations.length) {
    return []
  }

  return Promise.all(
    operations.map((operation) =>
      fetchControllerJson<OperationDetailContract>(baseUrl, `/operations/${encodeURIComponent(operation.id)}`, {
        fetchImpl: options.fetchImpl
      })
    )
  )
}

async function loadEventAuditIndex(
  baseUrl: string,
  options: {
    params?: Record<string, string | number | undefined>
    fetchImpl?: FetchLike
  } = {}
) {
  return fetchControllerList<EventAuditIndexEntry>(baseUrl, '/event-audit-index', options)
}

export async function loadHostDetailState(
  options: ControllerLoadOptions & {
    hostId: string
  }
): Promise<HostDetailState> {
  const eventLimit = options.eventLimit ?? 20
  const [host, healthChecks, backups, rollbackPoints, diagnostics, events] = await Promise.all([
    fetchControllerJson<HostDetail>(options.baseUrl, `/hosts/${encodeURIComponent(options.hostId)}`, {
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<HealthCheck>(options.baseUrl, '/health-checks', {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<BackupSummary>(options.baseUrl, '/backups', {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<RollbackPoint>(options.baseUrl, '/rollback-points', {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationDetailContract>(options.baseUrl, '/diagnostics', {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
      params: { hostId: options.hostId, limit: eventLimit },
      fetchImpl: options.fetchImpl
    })
  ])

  return {
    host,
    healthChecks,
    backups,
    rollbackPoints,
    diagnostics,
    localArtifacts: dedupeStrings([
      ...backups.map((backup) => backup.manifestPath),
      ...artifactPathsFromOperations(diagnostics)
    ]),
    eventStream: events.map(eventEntryFromOperationEvent)
  }
}

export async function loadOverviewState(
  options: ControllerLoadOptions & {
    hostId?: string
  }
): Promise<OverviewState> {
  const eventLimit = options.eventLimit ?? 20
  const [managedHosts, operations, events] = await Promise.all([
    fetchControllerList<HostSummary>(options.baseUrl, '/hosts', {
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationSummary>(options.baseUrl, '/operations', {
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
      params: { limit: eventLimit },
      fetchImpl: options.fetchImpl
    })
  ])

  const selectedHostSummary = selectById(managedHosts, options.hostId)
  const selectedHost = selectedHostSummary
    ? await loadHostDetailState({
        baseUrl: options.baseUrl,
        fetchImpl: options.fetchImpl,
        eventLimit,
        hostId: selectedHostSummary.id
      })
    : null

  const degradedCount = managedHosts.filter(
    (host) => host.lifecycleState === 'degraded' || host.agentState === 'degraded'
  ).length
  const activeOperations = operations.filter(
    (operation) => operation.state === 'queued' || operation.state === 'running'
  ).length

  return {
    controllerHealth: degradedCount > 0 ? 'degraded' : 'healthy',
    managedHosts,
    selectedHost,
    activeOperations,
    degradedCount,
    eventStream: events.map(eventEntryFromOperationEvent)
  }
}

export async function loadOperationsState(
  options: ControllerLoadOptions & {
    hostId?: string
    ruleId?: string
    operationId?: string
  }
): Promise<OperationsState> {
  const eventLimit = options.eventLimit ?? 20
  const [operationDetails, backups, auditIndex] = await Promise.all([
    loadOperationDetails(options.baseUrl, {
      params: {
        hostId: options.hostId,
        ruleId: options.ruleId
      },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<BackupSummary>(options.baseUrl, '/backups', {
      fetchImpl: options.fetchImpl
    }),
    loadEventAuditIndex(options.baseUrl, {
      params: {
        hostId: options.hostId,
        ruleId: options.ruleId,
        limit: eventLimit
      },
      fetchImpl: options.fetchImpl
    })
  ])

  const selectedOperation = selectById(operationDetails, options.operationId)
  const timeline = selectedOperation
    ? await fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
        params: {
          operationId: selectedOperation.id,
          limit: eventLimit
        },
        fetchImpl: options.fetchImpl
      })
    : []

  const backupManifestById = new Map(
    backups.map((backup) => [backup.id, backup.manifestPath] as const)
  )

  return {
    operations: operationDetails.map((operation) => ({
      operation,
      requestSource: requestSourceFromOperation(operation),
      linkedRuleId: operation.ruleId,
      linkedArtifacts: dedupeStrings([
        operation.backupId ? backupManifestById.get(operation.backupId) : undefined,
        ...artifactPathsFromOperations([operation])
      ])
    })),
    auditIndex,
    selectedOperationId: selectedOperation?.id ?? '',
    timeline
  }
}

export async function loadHostsState(
  options: ControllerLoadOptions & {
    hostId?: string
  }
): Promise<HostsState> {
  const eventLimit = options.eventLimit ?? 20
  const hosts = await fetchControllerList<HostSummary>(options.baseUrl, '/hosts', {
    fetchImpl: options.fetchImpl
  })
  const selectedHostSummary = selectById(hosts, options.hostId)

  return {
    hosts,
    selectedHost: selectedHostSummary
      ? await loadHostDetailState({
          baseUrl: options.baseUrl,
          fetchImpl: options.fetchImpl,
          eventLimit,
          hostId: selectedHostSummary.id
        })
      : null,
    eventStream: (
      await fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
        params: {
          hostId: selectedHostSummary?.id,
          limit: eventLimit
        },
        fetchImpl: options.fetchImpl
      })
    ).map(eventEntryFromOperationEvent)
  }
}

export async function loadBridgeRulesState(
  options: ControllerLoadOptions & {
    hostId?: string
    ruleId?: string
  }
): Promise<BridgeRulesState> {
  const eventLimit = options.eventLimit ?? 20
  const rules = await fetchControllerList<BridgeRule>(options.baseUrl, '/bridge-rules', {
    params: { hostId: options.hostId },
    fetchImpl: options.fetchImpl
  })
  const selectedRule = selectById(rules, options.ruleId)
  const selectedHostId = options.hostId ?? selectedRule?.hostId
  const [selectedHost, healthChecks, operations, diagnostics, events] = await Promise.all([
    selectedHostId
      ? loadHostDetailState({
          baseUrl: options.baseUrl,
          fetchImpl: options.fetchImpl,
          eventLimit,
          hostId: selectedHostId
        })
      : Promise.resolve(null),
    selectedRule
      ? fetchControllerList<HealthCheck>(options.baseUrl, '/health-checks', {
          params: {
            hostId: selectedRule.hostId,
            ruleId: selectedRule.id
          },
          fetchImpl: options.fetchImpl
        })
      : Promise.resolve([]),
    selectedRule
      ? fetchControllerList<OperationSummary>(options.baseUrl, '/operations', {
          params: {
            hostId: selectedRule.hostId,
            ruleId: selectedRule.id
          },
          fetchImpl: options.fetchImpl
        })
      : Promise.resolve([]),
    selectedRule
      ? fetchControllerList<OperationDetailContract>(options.baseUrl, '/diagnostics', {
          params: {
            hostId: selectedRule.hostId,
            ruleId: selectedRule.id
          },
          fetchImpl: options.fetchImpl
        })
      : Promise.resolve([]),
    fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
      params: {
        hostId: selectedHostId,
        ruleId: selectedRule?.id,
        limit: eventLimit
      },
      fetchImpl: options.fetchImpl
    })
  ])

  return {
    rules,
    selectedRule,
    selectedHost,
    healthChecks,
    operations,
    diagnostics,
    eventStream: events.map(eventEntryFromOperationEvent)
  }
}

export async function loadBackupsState(
  options: ControllerLoadOptions & {
    hostId?: string
  }
): Promise<BackupsState> {
  const eventLimit = options.eventLimit ?? 20
  const backups = await fetchControllerList<BackupSummary>(options.baseUrl, '/backups', {
    params: { hostId: options.hostId },
    fetchImpl: options.fetchImpl
  })
  const selectedBackup = backups[0] ?? null
  const selectedHostId = options.hostId ?? selectedBackup?.hostId
  const [selectedHost, rollbackPoints, operations, events] = await Promise.all([
    selectedHostId
      ? loadHostDetailState({
          baseUrl: options.baseUrl,
          fetchImpl: options.fetchImpl,
          eventLimit,
          hostId: selectedHostId
        })
      : Promise.resolve(null),
    fetchControllerList<RollbackPoint>(options.baseUrl, '/rollback-points', {
      params: { hostId: selectedHostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationSummary>(options.baseUrl, '/operations', {
      params: { hostId: selectedHostId },
      fetchImpl: options.fetchImpl
    }).then((items) =>
      items.filter((operation) => operation.type === 'backup' || operation.type === 'rollback')
    ),
    fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
      params: {
        hostId: selectedHostId,
        limit: eventLimit
      },
      fetchImpl: options.fetchImpl
    })
  ])

  return {
    backups,
    selectedBackup,
    selectedHost,
    rollbackPoints,
    operations,
    eventStream: events.map(eventEntryFromOperationEvent)
  }
}

export async function loadConsoleState(
  options: ControllerLoadOptions & {
    hostId?: string
    operationId?: string
  }
): Promise<ConsoleState> {
  const eventLimit = options.eventLimit ?? 20
  const [operations, diagnostics, events, auditIndex] = await Promise.all([
    loadOperationDetails(options.baseUrl, {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationDetailContract>(options.baseUrl, '/diagnostics', {
      params: { hostId: options.hostId },
      fetchImpl: options.fetchImpl
    }),
    fetchControllerList<OperationEventContract>(options.baseUrl, '/events', {
      params: {
        hostId: options.hostId,
        limit: eventLimit
      },
      fetchImpl: options.fetchImpl
    }),
    loadEventAuditIndex(options.baseUrl, {
      params: {
        hostId: options.hostId,
        limit: eventLimit
      },
      fetchImpl: options.fetchImpl
    })
  ])

  const selectedOperation = selectById(operations, options.operationId)
  const selectedDiagnostic = diagnostics.find(
    (diagnostic) => diagnostic.id === selectedOperation?.id
  ) ?? diagnostics[0] ?? null

  return {
    operations,
    auditIndex,
    selectedOperation,
    diagnostics,
    selectedDiagnostic,
    events,
    eventStream: events.map(eventEntryFromOperationEvent)
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
        label: 'Agent Heartbeat',
        value: state.host.agentHeartbeatState,
        tone: toneFromState(state.host.agentHeartbeatState)
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

export function OperationsPage(props: { state: OperationsState }) {
  const selected =
    props.state.operations.find((entry) => entry.operation.id === props.state.selectedOperationId) ??
    props.state.operations[0] ??
    null

  return h(ShellFrame, {
    currentView: 'Operations',
    title: 'Operations',
    lede:
      'Operations page stays audit-first: recent inventory, selected timeline, request source, and linked evidence remain visible together.',
    metrics: [
      {
        label: 'Recent Operations',
        value: String(props.state.operations.length),
        tone: 'info'
      },
      {
        label: 'Degraded Operations',
        value: String(props.state.operations.filter((entry) => entry.operation.state === 'degraded').length),
        tone: 'warn'
      },
      {
        label: 'Selected Host',
        value: selected?.operation.hostId ?? 'n/a',
        tone: selected ? 'info' : 'warn'
      },
      {
        label: 'Timeline Events',
        value: String(props.state.timeline.length),
        tone: 'info'
      }
    ],
    main: h(OperationsMain, { state: props.state, selected }),
    rail: h(OperationsRail, { state: props.state, selected }),
    eventStream: props.state.timeline.map(eventEntryFromOperationEvent)
  })
}

export function HostsPage(props: { state: HostsState }) {
  const readyCount = props.state.hosts.filter((host) => host.lifecycleState === 'ready').length
  const degradedCount = props.state.hosts.filter(
    (host) => host.lifecycleState === 'degraded' || host.agentState === 'degraded'
  ).length

  return h(ShellFrame, {
    currentView: 'Hosts',
    title: 'Hosts',
    lede:
      'Host inventory stays controller-backed: rollout readiness, latest health evidence, and bootstrap lineage remain visible together.',
    metrics: [
      {
        label: 'Managed Hosts',
        value: String(props.state.hosts.length),
        tone: 'info'
      },
      {
        label: 'Ready Hosts',
        value: String(readyCount),
        tone: readyCount > 0 ? 'success' : 'info'
      },
      {
        label: 'Degraded Hosts',
        value: String(degradedCount),
        tone: degradedCount > 0 ? 'warn' : 'success'
      },
      {
        label: 'Selected Host',
        value: props.state.selectedHost?.host.id ?? 'n/a',
        tone: props.state.selectedHost ? 'info' : 'warn'
      }
    ],
    main: h(HostsMain, { state: props.state }),
    rail: h(HostsRail, { state: props.state }),
    eventStream: props.state.eventStream
  })
}

export function BridgeRulesPage(props: { state: BridgeRulesState }) {
  const degradedRules = props.state.rules.filter((rule) => rule.lifecycleState === 'degraded').length

  return h(ShellFrame, {
    currentView: 'Bridge Rules',
    title: 'Bridge Rules',
    lede:
      'Bridge rule view keeps topology, verification evidence, and recovery links coupled so drift never hides behind pretty charts.',
    metrics: [
      {
        label: 'Tracked Rules',
        value: String(props.state.rules.length),
        tone: 'info'
      },
      {
        label: 'Degraded Rules',
        value: String(degradedRules),
        tone: degradedRules > 0 ? 'warn' : 'success'
      },
      {
        label: 'Diagnostics',
        value: String(props.state.diagnostics.length),
        tone: props.state.diagnostics.length > 0 ? 'success' : 'warn'
      },
      {
        label: 'Selected Host',
        value: props.state.selectedHost?.host.id ?? 'n/a',
        tone: props.state.selectedHost ? 'info' : 'warn'
      }
    ],
    main: h(BridgeRulesMain, { state: props.state }),
    rail: h(BridgeRulesRail, { state: props.state }),
    eventStream: props.state.eventStream
  })
}

export function BackupsPage(props: { state: BackupsState }) {
  const requiredBackups = props.state.backups.filter((backup) => backup.backupMode === 'required').length

  return h(ShellFrame, {
    currentView: 'Backups',
    title: 'Backups',
    lede:
      'Backup view stays recovery-first: manifests, rollback candidates, and operation lineage remain visible without leaving page.',
    metrics: [
      {
        label: 'Backups',
        value: String(props.state.backups.length),
        tone: 'info'
      },
      {
        label: 'Required Mode',
        value: String(requiredBackups),
        tone: requiredBackups > 0 ? 'warn' : 'info'
      },
      {
        label: 'Rollback Points',
        value: String(props.state.rollbackPoints.length),
        tone: props.state.rollbackPoints.length > 0 ? 'success' : 'warn'
      },
      {
        label: 'Selected Host',
        value: props.state.selectedHost?.host.id ?? 'n/a',
        tone: props.state.selectedHost ? 'info' : 'warn'
      }
    ],
    main: h(BackupsMain, { state: props.state }),
    rail: h(BackupsRail, { state: props.state }),
    eventStream: props.state.eventStream
  })
}

export function ConsolePage(props: { state: ConsoleState }) {
  return h(ShellFrame, {
    currentView: 'Console',
    title: 'Console',
    lede:
      'Console keeps controller replay honest: recent events, selected operation replay, and diagnostics detail all stay in one audit surface.',
    metrics: [
      {
        label: 'Recent Events',
        value: String(props.state.events.length),
        tone: props.state.events.length > 0 ? 'info' : 'warn'
      },
      {
        label: 'Operations',
        value: String(props.state.operations.length),
        tone: 'info'
      },
      {
        label: 'Diagnostics',
        value: String(props.state.diagnostics.length),
        tone: props.state.diagnostics.length > 0 ? 'success' : 'warn'
      },
      {
        label: 'Selected Host',
        value: props.state.selectedOperation?.hostId ?? props.state.selectedDiagnostic?.hostId ?? 'n/a',
        tone: props.state.selectedOperation || props.state.selectedDiagnostic ? 'info' : 'warn'
      }
    ],
    main: h(ConsoleMain, { state: props.state }),
    rail: h(ConsoleRail, { state: props.state }),
    eventStream: props.state.eventStream
  })
}

function pageForView(view: WebView) {
  if (view === 'host-detail') {
    return h(HostDetailPage, { state: createMockHostDetailState() })
  }

  if (view === 'hosts') {
    return h(HostsPage, { state: createMockHostsState() })
  }

  if (view === 'bridge-rules') {
    return h(BridgeRulesPage, { state: createMockBridgeRulesState() })
  }

  if (view === 'operations') {
    return h(OperationsPage, { state: createMockOperationsState() })
  }

  if (view === 'backups') {
    return h(BackupsPage, { state: createMockBackupsState() })
  }

  if (view === 'console') {
    return h(ConsolePage, { state: createMockConsoleState() })
  }

  return h(OverviewPage, { state: createMockOverviewState() })
}

function navigationLabelForView(view: WebView) {
  if (view === 'overview') {
    return 'Overview'
  }
  if (view === 'host-detail' || view === 'hosts') {
    return 'Hosts'
  }
  if (view === 'bridge-rules') {
    return 'Bridge Rules'
  }
  if (view === 'operations') {
    return 'Operations'
  }
  if (view === 'backups') {
    return 'Backups'
  }
  return 'Console'
}

function isWebView(value?: string): value is WebView {
  return (
    value === 'overview' ||
    value === 'host-detail' ||
    value === 'hosts' ||
    value === 'bridge-rules' ||
    value === 'operations' ||
    value === 'backups' ||
    value === 'console'
  )
}

async function livePageForView(
  view: WebView,
  options: {
    baseUrl: string
    hostId?: string
    ruleId?: string
    operationId?: string
    fetchImpl?: FetchLike
  }
) {
  if (view === 'overview') {
    return h(
      OverviewPage,
      { state: await loadOverviewState({ baseUrl: options.baseUrl, hostId: options.hostId, fetchImpl: options.fetchImpl }) }
    )
  }

  if (view === 'host-detail') {
    const hostsState = await loadHostsState({
      baseUrl: options.baseUrl,
      hostId: options.hostId,
      fetchImpl: options.fetchImpl
    })

    if (!hostsState.selectedHost) {
      return renderControllerErrorPage(view, 'No host detail available from controller.')
    }

    return h(HostDetailPage, { state: hostsState.selectedHost })
  }

  if (view === 'hosts') {
    return h(
      HostsPage,
      { state: await loadHostsState({ baseUrl: options.baseUrl, hostId: options.hostId, fetchImpl: options.fetchImpl }) }
    )
  }

  if (view === 'bridge-rules') {
    return h(
      BridgeRulesPage,
      {
        state: await loadBridgeRulesState({
          baseUrl: options.baseUrl,
          hostId: options.hostId,
          ruleId: options.ruleId,
          fetchImpl: options.fetchImpl
        })
      }
    )
  }

  if (view === 'operations') {
    return h(
      OperationsPage,
      {
        state: await loadOperationsState({
          baseUrl: options.baseUrl,
          hostId: options.hostId,
          ruleId: options.ruleId,
          operationId: options.operationId,
          fetchImpl: options.fetchImpl
        })
      }
    )
  }

  if (view === 'backups') {
    return h(
      BackupsPage,
      { state: await loadBackupsState({ baseUrl: options.baseUrl, hostId: options.hostId, fetchImpl: options.fetchImpl }) }
    )
  }

  return h(
    ConsolePage,
    {
      state: await loadConsoleState({
        baseUrl: options.baseUrl,
        hostId: options.hostId,
        operationId: options.operationId,
        fetchImpl: options.fetchImpl
      })
    }
  )
}

function renderControllerErrorPage(view: WebView, message: string) {
  return h(ShellFrame, {
    currentView: navigationLabelForView(view),
    title: 'Controller sync unavailable',
    lede:
      'Live controller fetch failed. Verify controller base URL, selected ids, and endpoint readiness before trusting this page.',
    metrics: [
      { label: 'View', value: view, tone: 'warn' },
      { label: 'Controller', value: 'unavailable', tone: 'warn' },
      { label: 'Recovered', value: 'mock disabled', tone: 'warn' },
      { label: 'Action', value: 'inspect logs', tone: 'info' }
    ],
    main: emptyState(message),
    rail: emptyState('Check `PORTMANAGER_CONTROLLER_BASE_URL`, selected resource ids, and controller server health.'),
    eventStream: []
  })
}

export function renderWebPreviewDocument(view: WebView = 'overview') {
  const page = pageForView(view)

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

export function mountWebSkeleton(
  options: {
    container?: Element | null
    view?: WebView
    controllerBaseUrl?: string
    hostId?: string
    ruleId?: string
    operationId?: string
    fetchImpl?: FetchLike
  } = {}
) {
  if (typeof document === 'undefined') {
    return
  }

  ensureWebStyles(document)

  const container = options.container ?? document.getElementById('app') ?? document.body
  const datasetView = container instanceof HTMLElement ? container.dataset.view : undefined
  const view = options.view ?? (isWebView(datasetView) ? datasetView : 'overview')

  let root = mountedRoots.get(container)
  if (!root) {
    root = createRoot(container)
    mountedRoots.set(container, root)
  }

  root.render(pageForView(view))

  const controllerBaseUrl = options.controllerBaseUrl ?? readControllerBaseUrl(container)
  if (!controllerBaseUrl) {
    return
  }

  const hostId = options.hostId ?? (container instanceof HTMLElement ? container.dataset.hostId : undefined)
  const ruleId = options.ruleId ?? (container instanceof HTMLElement ? container.dataset.ruleId : undefined)
  const operationId =
    options.operationId ?? (container instanceof HTMLElement ? container.dataset.operationId : undefined)

  void livePageForView(view, {
    baseUrl: controllerBaseUrl,
    hostId,
    ruleId,
    operationId,
    fetchImpl: options.fetchImpl
  })
    .then((page) => {
      root?.render(page)
    })
    .catch((error) => {
      root?.render(
        renderControllerErrorPage(view, error instanceof Error ? error.message : String(error))
      )
    })
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
  const selectedHostId = props.state.selectedHost?.host.id

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
                  'data-selected': host.id === selectedHostId ? 'true' : undefined
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

  if (!detailState) {
    return h('div', { className: 'pm-panel-stack' }, [
      h('section', { className: 'pm-card', key: 'selected-host' }, [
        h(SectionHeading, { key: 'heading', title: 'Selected Host', detail: 'awaiting enrollment' }),
        emptyState('No controller-backed host detail yet. Create one host to unlock live rollout detail.')
      ]),
      h('section', { className: 'pm-card', key: 'policy' }, [
        h(SectionHeading, { key: 'heading', title: 'Effective Policy', detail: 'no host selected' }),
        emptyState('Effective exposure policy appears after one host is present.')
      ])
    ])
  }

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
        kvRow('Agent Heartbeat', h(StatusBadge, { state: props.state.host.agentHeartbeatState })),
        kvRow('Agent Version', props.state.host.agentVersion ?? 'unknown'),
        kvRow('Heartbeat At', shortTime(props.state.host.agentHeartbeatAt)),
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
            h(
              'div',
              { key: 'line1' },
              `${rule.id} · ${rule.name ?? 'unnamed rule'} · ${rule.listenPort} -> ${rule.targetPort}`
            ),
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
            h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
            h(
              'div',
              { className: 'pm-artifact', key: 'line4' },
              [
                operation.backupId ? `backup ${operation.backupId}` : null,
                operation.rollbackPointId ? `rollback ${operation.rollbackPointId}` : null
              ]
                .filter(Boolean)
                .join(' · ') || 'no linked recovery evidence'
            ),
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
            h(
              'div',
              { className: 'pm-microcopy', key: 'line2' },
              `${backup.backupMode} · ${backup.githubStatus ?? 'unknown'} · ${backupRemoteConfiguredCopy(backup)}`
            ),
            h('div', { key: 'line3' }, backupRemoteStatusSummary(backup)),
            h('div', { className: 'pm-microcopy', key: 'line4' }, backupRemoteAction(backup)),
            h('div', { className: 'pm-artifact', key: 'line5' }, backup.manifestPath ?? 'no manifest path'),
            h(StatusBadge, { key: 'badge', state: backup.localStatus })
          ])
        )
      )
    ]),
    h('section', { className: 'pm-card', key: 'rollback-points' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Rollback candidates and execution',
        detail: `${props.state.rollbackPoints.length} points`
      }),
      h(
        'ul',
        { className: 'pm-list', key: 'list' },
        props.state.rollbackPoints.map((rollbackPoint) =>
          h('li', { className: 'pm-list-item', key: rollbackPoint.id }, [
            h('div', { key: 'line1' }, `${rollbackPoint.id} · ${rollbackPoint.operationId}`),
            h('div', { className: 'pm-microcopy', key: 'line2' }, `created ${shortTime(rollbackPoint.createdAt)}`),
            h(StatusBadge, { key: 'badge', state: rollbackPoint.state })
          ])
        )
      )
    ])
  ])
}

function HostDetailRail(props: { state: HostDetailState }) {
  const degradedDiagnostics = diagnosticsInState(props.state.diagnostics, 'degraded')
  const recoveryDiagnostics = diagnosticsInState(props.state.diagnostics, 'succeeded')
  const recoveryVerdict = diagnosticsRecoveryVerdict(props.state.diagnostics)

  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'diagnostics' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Latest diagnostics and snapshots',
        detail: `${props.state.diagnostics.length} operations`
      }),
      renderDiagnosticsList(
        props.state.diagnostics,
        'No diagnostics snapshots recorded yet.',
        'latest-list'
      )
    ]),
    h('section', { className: 'pm-card', key: 'degraded-diagnostics' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Degraded diagnostics history',
        detail: `${degradedDiagnostics.length} degraded checks`
      }),
      renderDiagnosticsList(
        degradedDiagnostics,
        'No degraded diagnostics history recorded for this host.',
        'degraded-list'
      )
    ]),
    h('section', { className: 'pm-card', key: 'recovery-diagnostics' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recovery-ready diagnostics',
        detail: `${recoveryDiagnostics.length} successful checks`
      }),
      recoveryVerdict
        ? h('div', { className: 'pm-kv', key: 'verdict' }, [
            kvRow('Recovery Verdict', recoveryVerdict.summary),
            kvRow('Evidence', recoveryVerdict.detail),
            kvRow('Latest State', h(StatusBadge, { state: recoveryVerdict.state }))
          ])
        : h(
            'div',
            { key: 'verdict-empty' },
            emptyState('No diagnostics recovery verdict recorded yet.')
          ),
      renderDiagnosticsList(
        recoveryDiagnostics,
        'No successful diagnostics recorded yet for recovery replay.',
        'recovery-list'
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

function OperationsMain(props: { state: OperationsState; selected: OperationInventoryEntry | null }) {
  const batchSummary = props.selected?.operation.batchSummary
  const childOperations = props.selected?.operation.childOperations ?? []

  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'inventory' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Active and recent operations list',
        detail: `${props.state.operations.length} entries`
      }),
      props.state.operations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.operations.map((entry) =>
              h('li', { className: 'pm-list-item', key: entry.operation.id }, [
                h('div', { key: 'line1' }, `${entry.operation.id} · ${entry.operation.type}`),
                h(
                  'div',
                  { className: 'pm-microcopy', key: 'line2' },
                  `${entry.operation.hostId ?? 'n/a'} · ${entry.requestSource}`
                ),
                h('div', { key: 'line3' }, entry.operation.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: entry.operation.state })
              ])
            )
          )
        : emptyState('No operations recorded yet.')
    ]),
    h('section', { className: 'pm-card', key: 'timeline' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Operation state timeline',
        detail: props.selected?.operation.id ?? 'no selection'
      }),
      props.state.timeline.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.timeline.map((event) =>
              h('li', { className: 'pm-list-item', key: event.id }, [
                h('div', { key: 'line1' }, `${shortTime(event.emittedAt)} · ${event.state}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, event.level),
                h('div', { key: 'line3' }, event.summary),
                h(StatusBadge, { key: 'badge', state: event.state })
              ])
            )
          )
        : emptyState('No timeline replay yet for selected operation.')
    ]),
    h('section', { className: 'pm-card', key: 'audit-index' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Indexed audit review',
        detail: `${props.state.auditIndex.length} indexed entries`
      }),
      renderAuditIndexList(props.state.auditIndex, 'operations-audit-index')
    ]),
    h('section', { className: 'pm-card', key: 'initiator' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Initiator and request source',
        detail: props.selected?.operation.id ?? 'no selection'
      }),
      props.selected
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Initiator', props.selected.operation.initiator ?? 'unknown'),
            kvRow('Request Source', props.selected.requestSource),
            kvRow('Host', props.selected.operation.hostId ?? 'n/a'),
            kvRow('Rule', props.selected.operation.ruleId ?? props.selected.linkedRuleId ?? 'n/a'),
            kvRow('Replay Path', props.selected.operation.eventStreamUrl ?? '/operations/events')
          ])
        : emptyState('Select one operation to inspect initiator and replay path.')
    ]),
    h('section', { className: 'pm-card', key: 'batch' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Batch target summary',
        detail: batchSummary ? `${batchSummary.totalTargets} targets` : 'not a batch envelope'
      }),
      batchSummary
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Succeeded', `${batchSummary.succeededTargets} succeeded`),
            kvRow('Degraded', `${batchSummary.degradedTargets} degraded`),
            kvRow('Failed', `${batchSummary.failedTargets} failed`),
            kvRow('Targets', batchSummary.targetHostIds.join(', ') || 'n/a'),
            kvRow('Child Operations', String(childOperations.length))
          ])
        : emptyState('Selected operation does not publish batch target evidence.', 'empty')
    ]),
    h('section', { className: 'pm-card', key: 'artifacts' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Linked host, rule, backup, rollback, and diagnostic artifacts',
        detail: props.selected?.operation.hostId ?? 'n/a'
      }),
      props.selected
        ? [
            h('div', { className: 'pm-kv', key: 'kv' }, [
              kvRow('Host', props.selected.operation.hostId ?? 'n/a'),
              kvRow('Rule', props.selected.operation.ruleId ?? props.selected.linkedRuleId ?? 'n/a'),
              kvRow('Backup', props.selected.operation.backupId ?? 'n/a'),
              kvRow('Rollback', props.selected.operation.rollbackPointId ?? 'n/a')
            ]),
            props.selected.linkedArtifacts.length
              ? h(
                  'ul',
                  { className: 'pm-list', key: 'list' },
                  props.selected.linkedArtifacts.map((artifact) =>
                    h('li', { className: 'pm-list-item', key: artifact }, [
                      h('div', { className: 'pm-artifact', key: 'artifact' }, artifact)
                    ])
                  )
                )
              : emptyState('No linked artifact paths were published for this operation.', 'empty')
          ]
        : emptyState('Select one operation to inspect linked recovery evidence.')
    ])
  ])
}

function OperationsRail(props: { state: OperationsState; selected: OperationInventoryEntry | null }) {
  const childOperations = props.selected?.operation.childOperations ?? []
  const selectedAuditEntry = selectAuditIndexEntry(
    props.state.auditIndex,
    props.selected?.operation.id
  )

  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'selected' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected operation',
        detail: props.selected?.operation.type ?? 'no selection'
      }),
      props.selected
        ? [
            h('h2', { className: 'pm-hostname', key: 'name' }, props.selected.operation.id),
            h('div', { className: 'pm-kv', key: 'kv' }, [
              kvRow('State', h(StatusBadge, { state: props.selected.operation.state })),
              kvRow('Started', shortTime(props.selected.operation.startedAt)),
              kvRow('Finished', shortTime(props.selected.operation.finishedAt)),
              kvRow('Summary', props.selected.operation.resultSummary ?? 'No summary'),
              props.selected.operation.snapshotResult?.pageTitle
                ? kvRow('Diagnostic Page', props.selected.operation.snapshotResult.pageTitle)
                : null,
              props.selected.operation.snapshotResult?.artifactPath
                ? kvRow('Snapshot Artifact', props.selected.operation.snapshotResult.artifactPath)
                : null
            ])
          ]
        : emptyState('No selected operation yet.')
    ]),
    h('section', { className: 'pm-card', key: 'stream' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected operation event stream',
        detail: `${props.state.timeline.length} events`
      }),
      props.selected
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Replay Path', props.selected.operation.eventStreamUrl ?? '/operations/events'),
            kvRow('Latest Event', props.state.timeline[0]?.summary ?? 'No events')
          ])
        : emptyState('No replay path until one operation is selected.')
    ]),
    h('section', { className: 'pm-card', key: 'audit' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected audit evidence',
        detail: selectedAuditEntry?.operation.id ?? 'no indexed selection'
      }),
      selectedAuditEntry
        ? [
            h('div', { className: 'pm-kv', key: 'kv' }, [
              kvRow('Latest Event', selectedAuditEntry.latestEvent?.summary ?? 'No indexed event'),
              kvRow('Event Count', String(selectedAuditEntry.eventCount)),
              kvRow('First Seen', shortTime(selectedAuditEntry.firstEventAt)),
              kvRow('Last Seen', shortTime(selectedAuditEntry.lastEventAt)),
              kvRow('Diagnostic', selectedAuditEntry.latestDiagnostic?.id ?? 'n/a'),
              kvRow('Backup', selectedAuditEntry.backup?.id ?? 'n/a'),
              kvRow('Rollback', selectedAuditEntry.rollbackPoint?.id ?? 'n/a')
            ]),
            selectedAuditEntry.linkedArtifacts.length
              ? h(
                  'ul',
                  { className: 'pm-list', key: 'list' },
                  selectedAuditEntry.linkedArtifacts.map((artifact) =>
                    h('li', { className: 'pm-list-item', key: artifact }, [
                      h('div', { className: 'pm-artifact', key: 'artifact' }, artifact)
                    ])
                  )
                )
              : emptyState('No linked audit artifact published for selected indexed entry.', 'empty')
          ]
        : emptyState('No indexed audit evidence available yet.')
    ]),
    h('section', { className: 'pm-card', key: 'children' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Per-host outcomes',
        detail: props.selected ? `${childOperations.length} child operations` : 'no selection'
      }),
      childOperations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            childOperations.map((operation) =>
              h('li', { className: 'pm-list-item', key: operation.id }, [
                h('div', { key: 'line1' }, `${operation.hostId ?? 'n/a'} · ${operation.type}`),
                h(
                  'div',
                  { className: 'pm-microcopy', key: 'line2' },
                  `${shortTime(operation.finishedAt)} · ${operation.parentOperationId ?? 'no parent'}`
                ),
                h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: operation.state })
              ])
            )
          )
        : emptyState('Selected operation does not publish child outcome evidence.', 'empty')
    ])
  ])
}

function HostsMain(props: { state: HostsState }) {
  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'inventory' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Managed host inventory',
        detail: `${props.state.hosts.length} hosts`
      }),
      props.state.hosts.length
        ? h(
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
                  h('th', { key: 'diagnostics' }, 'Diagnostics')
                ])
              ]),
              h(
                'tbody',
                { key: 'body' },
                props.state.hosts.map((host) =>
                  h(
                    'tr',
                    {
                      key: host.id,
                      'data-selected':
                        host.id === props.state.selectedHost?.host.id ? 'true' : undefined
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
                      h('td', { key: 'diagnostics' }, shortTime(host.lastDiagnosticsAt))
                    ]
                  )
                )
              )
            ]
          )
        : emptyState('No managed hosts have reported to controller yet.')
    ]),
    h('section', { className: 'pm-card', key: 'health' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recent host health checks',
        detail: `${props.state.selectedHost?.healthChecks.length ?? 0} samples`
      }),
      props.state.selectedHost?.healthChecks.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.selectedHost.healthChecks.map((check) =>
              h('li', { className: 'pm-list-item', key: check.id }, [
                h('div', { key: 'line1' }, `${check.category} · ${shortTime(check.checkedAt)}`),
                h('div', { key: 'line2' }, check.summary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: check.status })
              ])
            )
          )
        : emptyState('No host health checks recorded yet.')
    ])
  ])
}

function HostsRail(props: { state: HostsState }) {
  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'selected' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected host rollout',
        detail: props.state.selectedHost?.host.id ?? 'no selection'
      }),
      props.state.selectedHost
        ? [
            h('h2', { className: 'pm-hostname', key: 'name' }, props.state.selectedHost.host.name),
            h('div', { className: 'pm-kv', key: 'kv' }, [
              kvRow('Lifecycle', h(StatusBadge, { state: props.state.selectedHost.host.lifecycleState })),
              kvRow('Agent', h(StatusBadge, { state: props.state.selectedHost.host.agentState })),
              kvRow('Tailscale', props.state.selectedHost.host.tailscaleAddress),
              kvRow('Last Backup', shortTime(props.state.selectedHost.host.lastBackupAt)),
              kvRow('Last Diagnostics', shortTime(props.state.selectedHost.host.lastDiagnosticsAt))
            ])
          ]
        : emptyState('Select one host to inspect rollout status.')
    ]),
    h('section', { className: 'pm-card', key: 'operations' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Bootstrap and recent operations',
        detail: `${props.state.selectedHost?.host.recentOperations.length ?? 0} entries`
      }),
      props.state.selectedHost?.host.recentOperations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.selectedHost.host.recentOperations.map((operation) =>
              h('li', { className: 'pm-list-item', key: operation.id }, [
                h('div', { key: 'line1' }, `${operation.id} · ${operation.type}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, shortTime(operation.startedAt)),
                h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: operation.state })
              ])
            )
          )
        : emptyState('No rollout operations recorded for selected host.')
    ])
  ])
}

function BridgeRulesMain(props: { state: BridgeRulesState }) {
  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'inventory' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Bridge rule inventory',
        detail: `${props.state.rules.length} rules`
      }),
      props.state.rules.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.rules.map((rule) =>
              h('li', { className: 'pm-list-item', key: rule.id }, [
                h('div', { key: 'line1' }, `${rule.id} · ${rule.name ?? 'unnamed rule'}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, `${rule.listenPort} -> ${rule.targetHost}:${rule.targetPort}`),
                h(StatusBadge, { key: 'badge', state: rule.lifecycleState })
              ])
            )
          )
        : emptyState('No bridge rules are tracked for this host yet.')
    ]),
    h('section', { className: 'pm-card', key: 'topology' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected rule topology',
        detail: props.state.selectedRule?.id ?? 'no selection'
      }),
      props.state.selectedRule
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Host', props.state.selectedRule.hostId),
            kvRow('Protocol', props.state.selectedRule.protocol),
            kvRow('Listen', String(props.state.selectedRule.listenPort)),
            kvRow('Target', `${props.state.selectedRule.targetHost}:${props.state.selectedRule.targetPort}`),
            kvRow('Last Verified', shortTime(props.state.selectedRule.lastVerifiedAt)),
            kvRow('Rollback Point', props.state.selectedRule.lastRollbackPointId ?? 'n/a')
          ])
        : emptyState('No bridge rule selected yet.')
    ]),
    h('section', { className: 'pm-card', key: 'verification' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Verification and diagnostics',
        detail: `${props.state.healthChecks.length + props.state.diagnostics.length} records`
      }),
      props.state.healthChecks.length || props.state.diagnostics.length
        ? h('ul', { className: 'pm-list', key: 'list' }, [
            ...props.state.healthChecks.map((check) =>
              h('li', { className: 'pm-list-item', key: check.id }, [
                h('div', { key: 'line1' }, `${check.category} · ${shortTime(check.checkedAt)}`),
                h('div', { key: 'line2' }, check.summary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: check.status })
              ])
            ),
            ...props.state.diagnostics.map((diagnostic) =>
              h('li', { className: 'pm-list-item', key: diagnostic.id }, [
                h('div', { key: 'line1' }, `${diagnostic.id} · ${diagnostic.type}`),
                h(
                  'div',
                  { className: 'pm-microcopy', key: 'line2' },
                  diagnostic.snapshotResult?.pageTitle ?? diagnostic.resultSummary ?? 'No diagnostics detail'
                ),
                h(
                  'div',
                  { className: 'pm-artifact', key: 'line3' },
                  diagnostic.snapshotResult?.artifactPath ?? 'no snapshot artifact'
                ),
                h(StatusBadge, { key: 'badge', state: diagnostic.state })
              ])
            )
          ])
        : emptyState('No verification or diagnostics evidence published for selected rule.')
    ])
  ])
}

function BridgeRulesRail(props: { state: BridgeRulesState }) {
  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'operations' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Linked operations and recovery',
        detail: `${props.state.operations.length} entries`
      }),
      props.state.operations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.operations.map((operation) =>
              h('li', { className: 'pm-list-item', key: operation.id }, [
                h('div', { key: 'line1' }, `${operation.id} · ${operation.type}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, shortTime(operation.startedAt)),
                h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
                h(
                  'div',
                  { className: 'pm-artifact', key: 'line4' },
                  [
                    operation.backupId ? `backup ${operation.backupId}` : null,
                    operation.rollbackPointId ? `rollback ${operation.rollbackPointId}` : null
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'no linked recovery evidence'
                ),
                h(StatusBadge, { key: 'badge', state: operation.state })
              ])
            )
          )
        : emptyState('No linked operations recorded for selected bridge rule.')
    ]),
    h('section', { className: 'pm-card', key: 'policy' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Effective host policy',
        detail: props.state.selectedHost?.host.effectivePolicy.backupPolicy ?? 'n/a'
      }),
      props.state.selectedHost
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Allowed Sources', props.state.selectedHost.host.effectivePolicy.allowedSources.join(', ')),
            kvRow('Excluded Ports', props.state.selectedHost.host.effectivePolicy.excludedPorts.map(String).join(', ')),
            kvRow('Conflict Policy', props.state.selectedHost.host.effectivePolicy.conflictPolicy),
            kvRow(
              'Same Port Mirror',
              props.state.selectedHost.host.effectivePolicy.samePortMirror ? 'enabled' : 'disabled'
            )
          ])
        : emptyState('No host policy available until one host is selected.')
    ])
  ])
}

function BackupsMain(props: { state: BackupsState }) {
  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'inventory' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Backup inventory and manifests',
        detail: `${props.state.backups.length} backups`
      }),
      props.state.backups.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.backups.map((backup) =>
              h('li', { className: 'pm-list-item', key: backup.id }, [
                h('div', { key: 'line1' }, `${backup.id} · ${shortTime(backup.createdAt)}`),
                h(
                  'div',
                  { className: 'pm-microcopy', key: 'line2' },
                  `${backup.hostId} · ${backup.backupMode} · ${backup.githubStatus ?? 'github unknown'}`
                ),
                h('div', { key: 'line3' }, backupRemoteStatusSummary(backup)),
                h('div', { className: 'pm-microcopy', key: 'line4' }, backupRemoteAction(backup)),
                h('div', { className: 'pm-artifact', key: 'line5' }, backup.manifestPath ?? 'no manifest path'),
                h(StatusBadge, { key: 'badge', state: backup.localStatus })
              ])
            )
          )
        : emptyState('No backup manifests recorded yet.')
    ]),
    h('section', { className: 'pm-card', key: 'rollback' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Rollback readiness',
        detail: `${props.state.rollbackPoints.length} points`
      }),
      props.state.rollbackPoints.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.rollbackPoints.map((rollbackPoint) =>
              h('li', { className: 'pm-list-item', key: rollbackPoint.id }, [
                h('div', { key: 'line1' }, `${rollbackPoint.id} · ${rollbackPoint.operationId}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, `host ${rollbackPoint.hostId}`),
                h('div', { key: 'line3' }, `created ${shortTime(rollbackPoint.createdAt)}`),
                h(StatusBadge, { key: 'badge', state: rollbackPoint.state })
              ])
            )
          )
        : emptyState('No rollback points published yet.')
    ])
  ])
}

function BackupsRail(props: { state: BackupsState }) {
  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'selected' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected backup detail',
        detail: props.state.selectedBackup?.id ?? 'no selection'
      }),
      props.state.selectedBackup
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Host', props.state.selectedBackup.hostId),
            kvRow('Created', shortTime(props.state.selectedBackup.createdAt)),
            kvRow('Mode', props.state.selectedBackup.backupMode),
            kvRow('Local', h(StatusBadge, { state: props.state.selectedBackup.localStatus })),
            kvRow('GitHub', props.state.selectedBackup.githubStatus ?? 'not_configured'),
            kvRow('Remote Target', props.state.selectedBackup.remoteTarget ?? 'github'),
            kvRow('Remote Setup', backupRemoteConfiguredCopy(props.state.selectedBackup)),
            kvRow('Remote Status', backupRemoteStatusSummary(props.state.selectedBackup)),
            kvRow('Operator Action', backupRemoteAction(props.state.selectedBackup)),
            kvRow('Manifest', props.state.selectedBackup.manifestPath ?? 'n/a')
          ])
        : emptyState('No backup selected yet.')
    ]),
    h('section', { className: 'pm-card', key: 'operations' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recovery operations',
        detail: `${props.state.operations.length} entries`
      }),
      props.state.operations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.operations.map((operation) =>
              h('li', { className: 'pm-list-item', key: operation.id }, [
                h('div', { key: 'line1' }, `${operation.id} · ${operation.type}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, shortTime(operation.startedAt)),
                h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: operation.state })
              ])
            )
          )
        : emptyState('No recovery operations recorded yet.')
    ])
  ])
}

function ConsoleMain(props: { state: ConsoleState }) {
  return h('div', { className: 'pm-detail-grid' }, [
    h('section', { className: 'pm-card', key: 'events' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recent controller events',
        detail: `${props.state.events.length} events`
      }),
      props.state.events.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.events.map((event) =>
              h('li', { className: 'pm-list-item', key: event.id }, [
                h('div', { key: 'line1' }, `${shortTime(event.emittedAt)} · ${event.operationType}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, `${event.operationId} · ${event.level}`),
                h('div', { key: 'line3' }, event.summary),
                h(StatusBadge, { key: 'badge', state: event.state })
              ])
            )
          )
        : emptyState('No controller events have been replayed yet.')
    ]),
    h('section', { className: 'pm-card', key: 'audit-index' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Indexed event and audit review',
        detail: `${props.state.auditIndex.length} indexed entries`
      }),
      renderAuditIndexList(props.state.auditIndex, 'console-audit-index')
    ]),
    h('section', { className: 'pm-card', key: 'operations' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Recent operations',
        detail: `${props.state.operations.length} operations`
      }),
      props.state.operations.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.operations.map((operation) =>
              h('li', { className: 'pm-list-item', key: operation.id }, [
                h('div', { key: 'line1' }, `${operation.id} · ${operation.type}`),
                h('div', { className: 'pm-microcopy', key: 'line2' }, `${operation.hostId ?? 'n/a'} · ${operation.initiator ?? 'unknown'}`),
                h('div', { key: 'line3' }, operation.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: operation.state })
              ])
            )
          )
        : emptyState('No operations available in controller console yet.')
    ]),
    h('section', { className: 'pm-card', key: 'diagnostic' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected diagnostic detail',
        detail: props.state.selectedDiagnostic?.id ?? 'no diagnostic'
      }),
      props.state.selectedDiagnostic
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Host', props.state.selectedDiagnostic.hostId ?? 'n/a'),
            kvRow('Rule', props.state.selectedDiagnostic.ruleId ?? 'n/a'),
            kvRow('HTTP Status', String(props.state.selectedDiagnostic.diagnosticResult?.httpStatus ?? 'n/a')),
            kvRow('Page Title', props.state.selectedDiagnostic.snapshotResult?.pageTitle ?? 'n/a'),
            kvRow('Final URL', props.state.selectedDiagnostic.diagnosticResult?.finalUrl ?? 'n/a'),
            kvRow('Artifact', props.state.selectedDiagnostic.snapshotResult?.artifactPath ?? 'n/a')
          ])
        : emptyState('No diagnostic detail available yet.')
    ])
  ])
}

function ConsoleRail(props: { state: ConsoleState }) {
  const selectedAuditEntry = selectAuditIndexEntry(
    props.state.auditIndex,
    props.state.selectedOperation?.id
  )

  return h('div', { className: 'pm-panel-stack' }, [
    h('section', { className: 'pm-card', key: 'selected' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Controller console and replay',
        detail: props.state.selectedOperation?.id ?? 'no selection'
      }),
      props.state.selectedOperation
        ? h('div', { className: 'pm-kv', key: 'kv' }, [
            kvRow('Type', props.state.selectedOperation.type),
            kvRow('State', h(StatusBadge, { state: props.state.selectedOperation.state })),
            kvRow('Initiator', props.state.selectedOperation.initiator ?? 'unknown'),
            kvRow('Replay Path', props.state.selectedOperation.eventStreamUrl ?? '/operations/events'),
            kvRow('Summary', props.state.selectedOperation.resultSummary ?? 'No summary')
          ])
        : emptyState('No operation selected for replay.')
    ]),
    h('section', { className: 'pm-card', key: 'audit' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Selected audit evidence',
        detail: selectedAuditEntry?.operation.id ?? 'no indexed selection'
      }),
      selectedAuditEntry
        ? [
            h('div', { className: 'pm-kv', key: 'kv' }, [
              kvRow('Latest Event', selectedAuditEntry.latestEvent?.summary ?? 'No indexed event'),
              kvRow('Event Count', String(selectedAuditEntry.eventCount)),
              kvRow('Operation State', h(StatusBadge, { state: selectedAuditEntry.operation.state })),
              kvRow('Diagnostic', selectedAuditEntry.latestDiagnostic?.id ?? 'n/a'),
              kvRow('Backup', selectedAuditEntry.backup?.id ?? 'n/a'),
              kvRow('Rollback', selectedAuditEntry.rollbackPoint?.id ?? 'n/a')
            ]),
            selectedAuditEntry.linkedArtifacts.length
              ? h(
                  'ul',
                  { className: 'pm-list', key: 'list' },
                  selectedAuditEntry.linkedArtifacts.map((artifact) =>
                    h('li', { className: 'pm-list-item', key: artifact }, [
                      h('div', { className: 'pm-artifact', key: 'artifact' }, artifact)
                    ])
                  )
                )
              : emptyState('No linked audit artifact published for selected indexed entry.', 'empty')
          ]
        : emptyState('No indexed audit evidence available yet.')
    ]),
    h('section', { className: 'pm-card', key: 'diagnostics' }, [
      h(SectionHeading, {
        key: 'heading',
        title: 'Diagnostics inventory',
        detail: `${props.state.diagnostics.length} diagnostics`
      }),
      props.state.diagnostics.length
        ? h(
            'ul',
            { className: 'pm-list', key: 'list' },
            props.state.diagnostics.map((diagnostic) =>
              h('li', { className: 'pm-list-item', key: diagnostic.id }, [
                h('div', { key: 'line1' }, `${diagnostic.id} · ${diagnostic.type}`),
                h(
                  'div',
                  { className: 'pm-microcopy', key: 'line2' },
                  diagnostic.snapshotResult?.pageTitle ?? shortTime(diagnostic.finishedAt)
                ),
                h('div', { key: 'line3' }, diagnostic.resultSummary ?? 'No summary'),
                h(StatusBadge, { key: 'badge', state: diagnostic.state })
              ])
            )
          )
        : emptyState('No diagnostics inventory recorded yet.')
    ])
  ])
}

function EventStreamPanel(props: { entries: EventStreamEntry[] }) {
  return h('section', { className: 'pm-stream' }, [
    h(SectionHeading, { key: 'heading', title: 'Event Stream', detail: 'terminal evidence' }),
    props.entries.length
      ? h(
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
      : emptyState('No recent controller events to replay.')
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

function emptyState(copy: string, key?: string) {
  return h('div', { className: 'pm-empty-state', ...(key ? { key } : {}) }, copy)
}

type Tone = 'success' | 'info' | 'warn'

function toneFromState(state: string): Tone {
  if (state === 'ready' || state === 'active' || state === 'succeeded' || state === 'healthy') {
    return 'success'
  }
  if (
    state === 'live' ||
    state === 'unknown'
  ) {
    return state === 'live' ? 'success' : 'info'
  }
  if (
    state === 'degraded' ||
    state === 'failed' ||
    state === 'stale' ||
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

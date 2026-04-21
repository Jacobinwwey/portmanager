import type {
  PersistenceReadiness,
  PersistenceReadinessMetric,
  PersistenceReadinessMetrics,
  PersistenceReadinessStatus
} from './persistence-adapter.ts'

export type PersistenceDecisionState = 'hold' | 'prepare_review' | 'review_required'
export type PersistenceReadinessMetricKey = keyof PersistenceReadinessMetrics

export interface PersistenceDecisionTriggerMetric extends PersistenceReadinessMetric {
  key: PersistenceReadinessMetricKey
  label: string
  reason: string
}

export interface PersistenceDecisionPack {
  backend: PersistenceReadiness['backend']
  migrationTarget: PersistenceReadiness['migrationTarget']
  decisionState: PersistenceDecisionState
  reviewRequired: boolean
  summary: string
  nextActions: string[]
  triggerMetrics: PersistenceDecisionTriggerMetric[]
  readiness: PersistenceReadiness
}

const persistenceMetricMetadata: Record<
  PersistenceReadinessMetricKey,
  { label: string; sortOrder: number }
> = {
  operationRows: { label: 'Operations', sortOrder: 0 },
  diagnosticRows: { label: 'Diagnostics', sortOrder: 1 },
  backupRows: { label: 'Backups', sortOrder: 2 },
  rollbackPointRows: { label: 'Rollback Points', sortOrder: 3 },
  hostRows: { label: 'Hosts', sortOrder: 4 }
}

const statusWeight: Record<PersistenceReadinessStatus, number> = {
  migration_ready: 2,
  monitor: 1,
  healthy: 0
}

function decisionStateFromReadinessStatus(
  status: PersistenceReadinessStatus
): PersistenceDecisionState {
  if (status === 'migration_ready') {
    return 'review_required'
  }

  if (status === 'monitor') {
    return 'prepare_review'
  }

  return 'hold'
}

function buildTriggerReason(label: string, status: PersistenceReadinessStatus) {
  if (status === 'migration_ready') {
    return `${label} crossed migration-ready threshold; PostgreSQL review required.`
  }

  return `${label} crossed monitor threshold; PostgreSQL review prep required.`
}

function buildTriggerMetrics(
  metrics: PersistenceReadinessMetrics
): PersistenceDecisionTriggerMetric[] {
  return (Object.entries(metrics) as Array<[PersistenceReadinessMetricKey, PersistenceReadinessMetric]>)
    .filter(([, metric]) => metric.status !== 'healthy')
    .map(([key, metric]) => {
      const metadata = persistenceMetricMetadata[key]

      return {
        key,
        label: metadata.label,
        current: metric.current,
        monitor: metric.monitor,
        migrationReady: metric.migrationReady,
        status: metric.status,
        reason: buildTriggerReason(metadata.label, metric.status)
      }
    })
    .sort((left, right) => {
      const statusDelta = statusWeight[right.status] - statusWeight[left.status]
      if (statusDelta !== 0) {
        return statusDelta
      }

      return (
        persistenceMetricMetadata[left.key].sortOrder - persistenceMetricMetadata[right.key].sortOrder
      )
    })
}

function buildDecisionSummary(
  decisionState: PersistenceDecisionState,
  triggerMetrics: PersistenceDecisionTriggerMetric[]
) {
  const triggerLabels = triggerMetrics.map((metric) => metric.label).join(', ')

  if (decisionState === 'review_required') {
    return triggerLabels
      ? `SQLite stays active, but PostgreSQL cutover review must begin now because ${triggerLabels} crossed migration-ready pressure.`
      : 'SQLite stays active, but PostgreSQL cutover review must begin now.'
  }

  if (decisionState === 'prepare_review') {
    return triggerLabels
      ? `SQLite stays active, but PostgreSQL review prep should start because ${triggerLabels} crossed monitor pressure.`
      : 'SQLite stays active, but PostgreSQL review prep should start before persistence pressure widens.'
  }

  return 'SQLite stays active and no PostgreSQL cutover review is required yet.'
}

function buildNextActions(
  decisionState: PersistenceDecisionState,
  migrationTarget: PersistenceReadiness['migrationTarget']
) {
  if (decisionState === 'review_required') {
    return [
      `Open ${migrationTarget} cutover review before widening retention, concurrency, or orchestration breadth.`,
      'Keep SQLite active until review approves migration sequencing, rollback coverage, and parity checks.',
      'Use triggered metrics to scope migration rehearsal, data parity checks, and rollout risk.'
    ]
  }

  if (decisionState === 'prepare_review') {
    return [
      'Keep SQLite active while preserving schema parity for the migration target.',
      `Start ${migrationTarget} review prep for triggered counters before widening retention, concurrency, or orchestration breadth.`,
      'Recheck persistence counters during the next milestone review.'
    ]
  }

  return [
    'Keep SQLite active as the default backend.',
    'Continue tracking persistence counters before widening retention, concurrency, or orchestration breadth.'
  ]
}

export function buildPersistenceDecisionPack(
  readiness: PersistenceReadiness
): PersistenceDecisionPack {
  const decisionState = decisionStateFromReadinessStatus(readiness.status)
  const triggerMetrics = buildTriggerMetrics(readiness.metrics)

  return {
    backend: readiness.backend,
    migrationTarget: readiness.migrationTarget,
    decisionState,
    reviewRequired: decisionState === 'review_required',
    summary: buildDecisionSummary(decisionState, triggerMetrics),
    nextActions: buildNextActions(decisionState, readiness.migrationTarget),
    triggerMetrics,
    readiness
  }
}

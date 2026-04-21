import { DatabaseSync } from 'node:sqlite'

export type PersistenceReadinessStatus = 'healthy' | 'monitor' | 'migration_ready'

export interface PersistenceMetricThreshold {
  monitor: number
  migrationReady: number
}

export interface PersistencePressureThresholds {
  operationRows: PersistenceMetricThreshold
  diagnosticRows: PersistenceMetricThreshold
  backupRows: PersistenceMetricThreshold
  rollbackPointRows: PersistenceMetricThreshold
  hostRows: PersistenceMetricThreshold
}

export type PersistenceThresholdOverrides = Partial<{
  [Key in keyof PersistencePressureThresholds]: Partial<PersistenceMetricThreshold>
}>

export interface PersistenceReadinessMetric extends PersistenceMetricThreshold {
  current: number
  status: PersistenceReadinessStatus
}

export interface PersistenceReadinessMetrics {
  operationRows: PersistenceReadinessMetric
  diagnosticRows: PersistenceReadinessMetric
  backupRows: PersistenceReadinessMetric
  rollbackPointRows: PersistenceReadinessMetric
  hostRows: PersistenceReadinessMetric
}

export interface PersistenceReadiness {
  backend: 'sqlite'
  databasePath: string
  status: PersistenceReadinessStatus
  migrationTarget: 'postgresql'
  summary: string
  recommendedAction: string
  metrics: PersistenceReadinessMetrics
}

export type PersistenceAdapterConfig =
  | {
      kind: 'sqlite'
      databasePath: string
      thresholds?: PersistenceThresholdOverrides
    }
  | {
      kind: 'postgresql'
      connectionString?: string
      thresholds?: PersistenceThresholdOverrides
    }

export interface PersistenceAdapter {
  kind: 'sqlite'
  database: DatabaseSync
  databasePath: string
  close(): void
  getReadiness(): PersistenceReadiness
}

const DEFAULT_THRESHOLDS: PersistencePressureThresholds = {
  operationRows: {
    monitor: 500,
    migrationReady: 2_000
  },
  diagnosticRows: {
    monitor: 200,
    migrationReady: 750
  },
  backupRows: {
    monitor: 200,
    migrationReady: 750
  },
  rollbackPointRows: {
    monitor: 200,
    migrationReady: 750
  },
  hostRows: {
    monitor: 25,
    migrationReady: 100
  }
}

function mergeThresholds(
  overrides: PersistenceThresholdOverrides | undefined
): PersistencePressureThresholds {
  return {
    operationRows: {
      monitor: overrides?.operationRows?.monitor ?? DEFAULT_THRESHOLDS.operationRows.monitor,
      migrationReady:
        overrides?.operationRows?.migrationReady ?? DEFAULT_THRESHOLDS.operationRows.migrationReady
    },
    diagnosticRows: {
      monitor: overrides?.diagnosticRows?.monitor ?? DEFAULT_THRESHOLDS.diagnosticRows.monitor,
      migrationReady:
        overrides?.diagnosticRows?.migrationReady ?? DEFAULT_THRESHOLDS.diagnosticRows.migrationReady
    },
    backupRows: {
      monitor: overrides?.backupRows?.monitor ?? DEFAULT_THRESHOLDS.backupRows.monitor,
      migrationReady:
        overrides?.backupRows?.migrationReady ?? DEFAULT_THRESHOLDS.backupRows.migrationReady
    },
    rollbackPointRows: {
      monitor:
        overrides?.rollbackPointRows?.monitor ?? DEFAULT_THRESHOLDS.rollbackPointRows.monitor,
      migrationReady:
        overrides?.rollbackPointRows?.migrationReady ??
        DEFAULT_THRESHOLDS.rollbackPointRows.migrationReady
    },
    hostRows: {
      monitor: overrides?.hostRows?.monitor ?? DEFAULT_THRESHOLDS.hostRows.monitor,
      migrationReady: overrides?.hostRows?.migrationReady ?? DEFAULT_THRESHOLDS.hostRows.migrationReady
    }
  }
}

function countRows(database: DatabaseSync, query: string) {
  try {
    const result = database.prepare(query).get() as { total?: number } | undefined
    return Number(result?.total ?? 0)
  } catch {
    return 0
  }
}

function statusForValue(
  current: number,
  thresholds: PersistenceMetricThreshold
): PersistenceReadinessStatus {
  if (current >= thresholds.migrationReady) {
    return 'migration_ready'
  }

  if (current >= thresholds.monitor) {
    return 'monitor'
  }

  return 'healthy'
}

function highestStatus(metrics: PersistenceReadinessMetrics): PersistenceReadinessStatus {
  const statuses = Object.values(metrics).map((metric) => metric.status)
  if (statuses.includes('migration_ready')) {
    return 'migration_ready'
  }

  if (statuses.includes('monitor')) {
    return 'monitor'
  }

  return 'healthy'
}

function buildReadiness(
  database: DatabaseSync,
  databasePath: string,
  thresholds: PersistencePressureThresholds
): PersistenceReadiness {
  const metrics: PersistenceReadinessMetrics = {
    operationRows: {
      current: countRows(database, 'SELECT COUNT(*) AS total FROM operations'),
      ...thresholds.operationRows,
      status: 'healthy'
    },
    diagnosticRows: {
      current: countRows(
        database,
        "SELECT COUNT(*) AS total FROM operations WHERE type = 'diagnostics'"
      ),
      ...thresholds.diagnosticRows,
      status: 'healthy'
    },
    backupRows: {
      current: countRows(database, 'SELECT COUNT(*) AS total FROM backups'),
      ...thresholds.backupRows,
      status: 'healthy'
    },
    rollbackPointRows: {
      current: countRows(database, 'SELECT COUNT(*) AS total FROM rollback_points'),
      ...thresholds.rollbackPointRows,
      status: 'healthy'
    },
    hostRows: {
      current: countRows(database, 'SELECT COUNT(*) AS total FROM hosts'),
      ...thresholds.hostRows,
      status: 'healthy'
    }
  }

  metrics.operationRows.status = statusForValue(metrics.operationRows.current, thresholds.operationRows)
  metrics.diagnosticRows.status = statusForValue(
    metrics.diagnosticRows.current,
    thresholds.diagnosticRows
  )
  metrics.backupRows.status = statusForValue(metrics.backupRows.current, thresholds.backupRows)
  metrics.rollbackPointRows.status = statusForValue(
    metrics.rollbackPointRows.current,
    thresholds.rollbackPointRows
  )
  metrics.hostRows.status = statusForValue(metrics.hostRows.current, thresholds.hostRows)

  const status = highestStatus(metrics)

  if (status === 'migration_ready') {
    return {
      backend: 'sqlite',
      databasePath,
      status,
      migrationTarget: 'postgresql',
      summary:
        'SQLite remains the active default store, but measured persistence pressure now justifies a PostgreSQL migration review.',
      recommendedAction:
        'Keep SQLite active for current runs, but open the PostgreSQL migration review before widening retention, concurrency, or orchestration breadth.',
      metrics
    }
  }

  if (status === 'monitor') {
    return {
      backend: 'sqlite',
      databasePath,
      status,
      migrationTarget: 'postgresql',
      summary:
        'SQLite remains the active default store, but measured persistence pressure now needs explicit migration-readiness tracking.',
      recommendedAction:
        'Keep SQLite as default, preserve schema parity, and rehearse PostgreSQL migration criteria before pressure crosses the next threshold.',
      metrics
    }
  }

  return {
    backend: 'sqlite',
    databasePath,
    status,
    migrationTarget: 'postgresql',
    summary:
      'SQLite remains the active default store; current persistence pressure does not justify a PostgreSQL seam promotion yet.',
    recommendedAction:
      'Keep SQLite as default and continue watching persistence metrics before widening retention or concurrency expectations.',
    metrics
  }
}

export function createPersistenceAdapter(
  config: PersistenceAdapterConfig
): PersistenceAdapter {
  if (config.kind === 'postgresql') {
    throw new Error(
      'PostgreSQL persistence adapter is a readiness target only and is not enabled yet.'
    )
  }

  if (!config.databasePath.trim()) {
    throw new Error('SQLite persistence adapter requires a databasePath.')
  }

  const thresholds = mergeThresholds(config.thresholds)
  const database = new DatabaseSync(config.databasePath)

  return {
    kind: 'sqlite',
    database,
    databasePath: config.databasePath,
    close() {
      database.close()
    },
    getReadiness() {
      return buildReadiness(database, config.databasePath, thresholds)
    }
  }
}

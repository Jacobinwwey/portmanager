import { DatabaseSync } from 'node:sqlite'

import type {
  components,
  PortDiagnosticResultSchema,
  WebSnapshotResultSchema
} from '@portmanager/typescript-contracts'

export type BackupSummary = components['schemas']['BackupSummary']
export type HealthCheck = components['schemas']['HealthCheck']
export type OperationAccepted = components['schemas']['OperationAccepted']
export type OperationDetail = components['schemas']['OperationDetail'] & {
  diagnosticResult?: components['schemas']['PortDiagnosticResult'] & PortDiagnosticResultSchema
  snapshotResult?: components['schemas']['WebSnapshotResult'] & WebSnapshotResultSchema
  resultSummary?: string
}
export type OperationSummary = components['schemas']['OperationSummary']
export type RollbackPoint = components['schemas']['RollbackPoint']

export interface OperationListFilters {
  hostId?: string
  ruleId?: string
  type?: string
  state?: string
}

export interface FinishOperationInput {
  state: Extract<OperationDetail['state'], 'succeeded' | 'failed' | 'degraded' | 'cancelled'>
  resultSummary?: string
  eventStreamUrl?: string
  backupId?: string
  rollbackPointId?: string
  diagnosticResult?: OperationDetail['diagnosticResult']
  snapshotResult?: OperationDetail['snapshotResult']
}

export interface EnqueueOperationInput {
  id: string
  type: OperationDetail['type']
  initiator: NonNullable<OperationDetail['initiator']>
  hostId?: string
  ruleId?: string
}

export interface CreateBackupInput {
  id: string
  hostId: string
  operationId?: string
  backupMode: NonNullable<BackupSummary['backupMode']>
  localStatus: BackupSummary['localStatus']
  githubStatus?: NonNullable<BackupSummary['githubStatus']>
  manifestPath?: string
  createdAt?: string
}

export interface CreateHealthCheckInput {
  id: string
  hostId: string
  ruleId?: string
  category: HealthCheck['category']
  status: HealthCheck['status']
  summary?: string
  backupPolicy?: NonNullable<HealthCheck['backupPolicy']>
  checkedAt?: string
}

export interface CreateRollbackPointInput {
  id: string
  hostId: string
  operationId: string
  state?: RollbackPoint['state']
  createdAt?: string
}

export interface OperationStore {
  close(): void
  enqueueOperation(input: EnqueueOperationInput): OperationAccepted
  getOperation(id: string): OperationDetail | null
  listOperations(filters?: OperationListFilters): OperationSummary[]
  markRunning(id: string): OperationDetail
  markFinished(id: string, input: FinishOperationInput): OperationDetail
  createBackup(input: CreateBackupInput): BackupSummary
  createHealthCheck(input: CreateHealthCheckInput): HealthCheck
  findBackupByOperationId(operationId: string): BackupSummary | null
  listBackups(filters?: { hostId?: string; operationId?: string }): BackupSummary[]
  listHealthChecks(filters?: { hostId?: string; ruleId?: string }): HealthCheck[]
  createRollbackPoint(input: CreateRollbackPointInput): RollbackPoint
  getRollbackPoint(id: string): RollbackPoint | null
  listRollbackPoints(filters?: {
    hostId?: string
    state?: RollbackPoint['state']
  }): RollbackPoint[]
  markRollbackPointState(id: string, state: RollbackPoint['state']): RollbackPoint
  listDiagnostics(filters?: { hostId?: string; ruleId?: string }): OperationDetail[]
}

interface OperationRow {
  id: string
  type: OperationDetail['type']
  state: OperationDetail['state']
  initiator: NonNullable<OperationDetail['initiator']>
  host_id: string | null
  rule_id: string | null
  started_at: string
  finished_at: string | null
  result_summary: string | null
  event_stream_url: string | null
  backup_id: string | null
  rollback_point_id: string | null
  diagnostic_result_json: string | null
  snapshot_result_json: string | null
}

interface BackupRow {
  id: string
  host_id: string
  operation_id: string | null
  created_at: string
  backup_mode: NonNullable<BackupSummary['backupMode']> | null
  local_status: BackupSummary['localStatus']
  github_status: NonNullable<BackupSummary['githubStatus']> | null
  manifest_path: string | null
}

interface HealthCheckRow {
  id: string
  host_id: string
  rule_id: string | null
  category: HealthCheck['category']
  status: HealthCheck['status']
  summary: string | null
  backup_policy: NonNullable<HealthCheck['backupPolicy']> | null
  checked_at: string
}

interface RollbackPointRow {
  id: string
  host_id: string
  operation_id: string
  state: RollbackPoint['state']
  created_at: string
}

function nowIso() {
  return new Date().toISOString()
}

function rowToDetail(row: OperationRow): OperationDetail {
  return {
    id: row.id,
    type: row.type,
    state: row.state,
    initiator: row.initiator,
    hostId: row.host_id ?? undefined,
    ruleId: row.rule_id ?? undefined,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    eventStreamUrl: row.event_stream_url ?? '/operations/events',
    backupId: row.backup_id ?? undefined,
    rollbackPointId: row.rollback_point_id ?? undefined,
    diagnosticResult: row.diagnostic_result_json
      ? (JSON.parse(row.diagnostic_result_json) as OperationDetail['diagnosticResult'])
      : undefined,
    snapshotResult: row.snapshot_result_json
      ? (JSON.parse(row.snapshot_result_json) as OperationDetail['snapshotResult'])
      : undefined,
    resultSummary: row.result_summary ?? undefined
  }
}

function rowToSummary(row: OperationRow): OperationSummary {
  return {
    id: row.id,
    type: row.type,
    state: row.state,
    hostId: row.host_id ?? undefined,
    ruleId: row.rule_id ?? undefined,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    ...(row.result_summary ? { resultSummary: row.result_summary } : {}),
    ...(row.backup_id ? { backupId: row.backup_id } : {}),
    ...(row.rollback_point_id ? { rollbackPointId: row.rollback_point_id } : {})
  }
}

function rowToBackup(row: BackupRow): BackupSummary {
  return {
    id: row.id,
    hostId: row.host_id,
    operationId: row.operation_id ?? undefined,
    createdAt: row.created_at,
    backupMode: row.backup_mode ?? 'best_effort',
    localStatus: row.local_status,
    githubStatus: row.github_status ?? undefined,
    manifestPath: row.manifest_path ?? undefined
  }
}

function rowToHealthCheck(row: HealthCheckRow): HealthCheck {
  return {
    id: row.id,
    hostId: row.host_id,
    ruleId: row.rule_id ?? undefined,
    category: row.category,
    status: row.status,
    summary: row.summary ?? undefined,
    backupPolicy: row.backup_policy ?? undefined,
    checkedAt: row.checked_at
  }
}

function rowToRollbackPoint(row: RollbackPointRow): RollbackPoint {
  return {
    id: row.id,
    hostId: row.host_id,
    operationId: row.operation_id,
    state: row.state,
    createdAt: row.created_at
  }
}

export function createOperationStore(options: { databasePath: string }): OperationStore {
  const database = new DatabaseSync(options.databasePath)

  database.exec(`
    CREATE TABLE IF NOT EXISTS operations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      state TEXT NOT NULL,
      initiator TEXT NOT NULL,
      host_id TEXT,
      rule_id TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      result_summary TEXT,
      event_stream_url TEXT,
      backup_id TEXT,
      rollback_point_id TEXT,
      diagnostic_result_json TEXT,
      snapshot_result_json TEXT
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      operation_id TEXT,
      created_at TEXT NOT NULL,
      backup_mode TEXT,
      local_status TEXT NOT NULL,
      github_status TEXT,
      manifest_path TEXT
    );

    CREATE TABLE IF NOT EXISTS health_checks (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      rule_id TEXT,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      summary TEXT,
      backup_policy TEXT,
      checked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rollback_points (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      operation_id TEXT NOT NULL,
      state TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  try {
    database.exec(`ALTER TABLE backups ADD COLUMN backup_mode TEXT`)
  } catch {}

  const insertOperation = database.prepare(`
    INSERT INTO operations (
      id,
      type,
      state,
      initiator,
      host_id,
      rule_id,
      started_at,
      finished_at,
      result_summary,
      event_stream_url,
      backup_id,
      rollback_point_id,
      diagnostic_result_json,
      snapshot_result_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
  `)

  const getOperation = database.prepare(`
    SELECT
      id,
      type,
      state,
      initiator,
      host_id,
      rule_id,
      started_at,
      finished_at,
      result_summary,
      event_stream_url,
      backup_id,
      rollback_point_id,
      diagnostic_result_json,
      snapshot_result_json
    FROM operations
    WHERE id = ?
  `)

  const listOperations = database.prepare(`
    SELECT
      id,
      type,
      state,
      initiator,
      host_id,
      rule_id,
      started_at,
      finished_at,
      result_summary,
      event_stream_url,
      backup_id,
      rollback_point_id,
      diagnostic_result_json,
      snapshot_result_json
    FROM operations
    ORDER BY started_at DESC, id DESC
  `)

  const updateRunning = database.prepare(`
    UPDATE operations
    SET state = 'running'
    WHERE id = ?
  `)

  const updateFinished = database.prepare(`
    UPDATE operations
    SET state = ?,
        finished_at = ?,
        result_summary = ?,
        event_stream_url = ?,
        backup_id = ?,
        rollback_point_id = ?,
        diagnostic_result_json = ?,
        snapshot_result_json = ?
    WHERE id = ?
  `)

  const listDiagnosticOperations = database.prepare(`
    SELECT
      id,
      type,
      state,
      initiator,
      host_id,
      rule_id,
      started_at,
      finished_at,
      result_summary,
      event_stream_url,
      backup_id,
      rollback_point_id,
      diagnostic_result_json,
      snapshot_result_json
    FROM operations
    WHERE type = 'diagnostics'
    ORDER BY started_at DESC, id DESC
  `)

  const insertBackup = database.prepare(`
    INSERT INTO backups (
      id,
      host_id,
      operation_id,
      created_at,
      backup_mode,
      local_status,
      github_status,
      manifest_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertHealthCheck = database.prepare(`
    INSERT INTO health_checks (
      id,
      host_id,
      rule_id,
      category,
      status,
      summary,
      backup_policy,
      checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const listBackups = database.prepare(`
    SELECT
      id,
      host_id,
      operation_id,
      created_at,
      backup_mode,
      local_status,
      github_status,
      manifest_path
    FROM backups
    ORDER BY created_at DESC, id DESC
  `)

  const listHealthChecks = database.prepare(`
    SELECT
      id,
      host_id,
      rule_id,
      category,
      status,
      summary,
      backup_policy,
      checked_at
    FROM health_checks
    ORDER BY checked_at DESC, id DESC
  `)

  const findBackupByOperationId = database.prepare(`
    SELECT
      id,
      host_id,
      operation_id,
      created_at,
      backup_mode,
      local_status,
      github_status,
      manifest_path
    FROM backups
    WHERE operation_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `)

  const insertRollbackPoint = database.prepare(`
    INSERT INTO rollback_points (
      id,
      host_id,
      operation_id,
      state,
      created_at
    ) VALUES (?, ?, ?, ?, ?)
  `)

  const getRollbackPoint = database.prepare(`
    SELECT
      id,
      host_id,
      operation_id,
      state,
      created_at
    FROM rollback_points
    WHERE id = ?
  `)

  const listRollbackPoints = database.prepare(`
    SELECT
      id,
      host_id,
      operation_id,
      state,
      created_at
    FROM rollback_points
    ORDER BY created_at DESC, id DESC
  `)

  const updateRollbackPointState = database.prepare(`
    UPDATE rollback_points
    SET state = ?
    WHERE id = ?
  `)

  function requireOperation(id: string): OperationRow {
    const row = getOperation.get(id) as OperationRow | undefined
    if (!row) {
      throw new Error(`Operation not found: ${id}`)
    }
    return row
  }

  function requireRollbackPoint(id: string): RollbackPointRow {
    const row = getRollbackPoint.get(id) as RollbackPointRow | undefined
    if (!row) {
      throw new Error(`Rollback point not found: ${id}`)
    }
    return row
  }

  return {
    close() {
      database.close()
    },
    enqueueOperation(input) {
      insertOperation.run(
        input.id,
        input.type,
        'queued',
        input.initiator,
        input.hostId ?? null,
        input.ruleId ?? null,
        nowIso()
      )

      return {
        operationId: input.id,
        state: 'queued'
      }
    },
    getOperation(id) {
      const row = getOperation.get(id) as OperationRow | undefined
      return row ? rowToDetail(row) : null
    },
    listOperations(filters) {
      return (listOperations.all() as unknown as OperationRow[])
        .map((row) => rowToSummary(row))
        .filter((row) => {
          if (filters?.hostId && row.hostId !== filters.hostId) {
            return false
          }

          if (filters?.ruleId && row.ruleId !== filters.ruleId) {
            return false
          }

          if (filters?.type && row.type !== filters.type) {
            return false
          }

          if (filters?.state && row.state !== filters.state) {
            return false
          }

          return true
        })
    },
    markRunning(id) {
      const current = requireOperation(id)
      if (current.state !== 'queued') {
        throw new Error(`Operation ${id} not queued`)
      }

      updateRunning.run(id)
      return rowToDetail(requireOperation(id))
    },
    markFinished(id, input) {
      const current = requireOperation(id)
      if (current.state !== 'running') {
        throw new Error(`Operation ${id} not running`)
      }

      updateFinished.run(
        input.state,
        nowIso(),
        input.resultSummary ?? null,
        input.eventStreamUrl ?? null,
        input.backupId ?? null,
        input.rollbackPointId ?? null,
        input.diagnosticResult ? JSON.stringify(input.diagnosticResult) : null,
        input.snapshotResult ? JSON.stringify(input.snapshotResult) : null,
        id
      )
      return rowToDetail(requireOperation(id))
    },
    createBackup(input) {
      const createdAt = input.createdAt ?? nowIso()
      insertBackup.run(
        input.id,
        input.hostId,
        input.operationId ?? null,
        createdAt,
        input.backupMode,
        input.localStatus,
        input.githubStatus ?? null,
        input.manifestPath ?? null
      )

      const row = findBackupByOperationId.get(input.operationId ?? null) as BackupRow | undefined
      return row
        ? rowToBackup(row)
        : {
            id: input.id,
            hostId: input.hostId,
            operationId: input.operationId,
            createdAt,
            backupMode: input.backupMode,
            localStatus: input.localStatus,
            githubStatus: input.githubStatus,
            manifestPath: input.manifestPath
          }
    },
    createHealthCheck(input) {
      const checkedAt = input.checkedAt ?? nowIso()
      insertHealthCheck.run(
        input.id,
        input.hostId,
        input.ruleId ?? null,
        input.category,
        input.status,
        input.summary ?? null,
        input.backupPolicy ?? null,
        checkedAt
      )

      return {
        id: input.id,
        hostId: input.hostId,
        ruleId: input.ruleId,
        category: input.category,
        status: input.status,
        summary: input.summary,
        backupPolicy: input.backupPolicy,
        checkedAt
      }
    },
    findBackupByOperationId(operationId) {
      const row = findBackupByOperationId.get(operationId) as BackupRow | undefined
      return row ? rowToBackup(row) : null
    },
    listBackups(filters) {
      return (listBackups.all() as unknown as BackupRow[])
        .map((row) => rowToBackup(row))
        .filter((row) => {
          if (filters?.hostId && row.hostId !== filters.hostId) {
            return false
          }

          if (filters?.operationId && row.operationId !== filters.operationId) {
            return false
          }

          return true
        })
    },
    listHealthChecks(filters) {
      return (listHealthChecks.all() as unknown as HealthCheckRow[])
        .map((row) => rowToHealthCheck(row))
        .filter((row) => {
          if (filters?.hostId && row.hostId !== filters.hostId) {
            return false
          }

          if (filters?.ruleId && row.ruleId !== filters.ruleId) {
            return false
          }

          return true
        })
    },
    createRollbackPoint(input) {
      const createdAt = input.createdAt ?? nowIso()
      insertRollbackPoint.run(
        input.id,
        input.hostId,
        input.operationId,
        input.state ?? 'ready',
        createdAt
      )

      return rowToRollbackPoint(requireRollbackPoint(input.id))
    },
    getRollbackPoint(id) {
      const row = getRollbackPoint.get(id) as RollbackPointRow | undefined
      return row ? rowToRollbackPoint(row) : null
    },
    listRollbackPoints(filters) {
      return (listRollbackPoints.all() as unknown as RollbackPointRow[])
        .map((row) => rowToRollbackPoint(row))
        .filter((row) => {
          if (filters?.hostId && row.hostId !== filters.hostId) {
            return false
          }

          if (filters?.state && row.state !== filters.state) {
            return false
          }

          return true
        })
    },
    markRollbackPointState(id, state) {
      requireRollbackPoint(id)
      updateRollbackPointState.run(state, id)
      return rowToRollbackPoint(requireRollbackPoint(id))
    },
    listDiagnostics(filters) {
      return (listDiagnosticOperations.all() as unknown as OperationRow[])
        .map((row) => rowToDetail(row))
        .filter((row) => {
          if (filters?.hostId && row.hostId !== filters.hostId) {
            return false
          }

          if (filters?.ruleId && row.ruleId !== filters.ruleId) {
            return false
          }

          return true
        })
    }
  }
}

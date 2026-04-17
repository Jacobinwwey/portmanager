import { DatabaseSync } from 'node:sqlite'

import type {
  components,
  PortDiagnosticResultSchema,
  WebSnapshotResultSchema
} from '@portmanager/typescript-contracts'

export type BackupSummary = components['schemas']['BackupSummary']
export type BridgeRule = components['schemas']['BridgeRule']
export type ExposurePolicy = components['schemas']['ExposurePolicy']
export type HealthCheck = components['schemas']['HealthCheck']
export type HostDetail = components['schemas']['HostDetail']
export type HostSummary = components['schemas']['HostSummary']
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

export interface CreateBridgeRuleInput {
  id: string
  hostId: string
  name?: string
  protocol: BridgeRule['protocol']
  listenPort: number
  targetHost: string
  targetPort: number
  lifecycleState?: BridgeRule['lifecycleState']
  lastVerifiedAt?: string
  lastRollbackPointId?: string
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

export interface CreateHostInput {
  id: string
  name: string
  labels?: string[]
  sshHost: string
  sshPort: number
  tailscaleAddress?: string
}

export interface CreateRollbackPointInput {
  id: string
  hostId: string
  operationId: string
  state?: RollbackPoint['state']
  createdAt?: string
}

export interface ReplaceExposurePolicyInput {
  hostId: string
  allowedSources: string[]
  excludedPorts: number[]
  samePortMirror: boolean
  conflictPolicy: ExposurePolicy['conflictPolicy']
  backupPolicy: ExposurePolicy['backupPolicy']
}

export interface UpdateBridgeRuleInput {
  name?: string
  listenPort?: number
  targetHost?: string
  targetPort?: number
  lifecycleState?: BridgeRule['lifecycleState']
  lastVerifiedAt?: string
  lastRollbackPointId?: string
}

export interface UpdateHostRuntimeInput {
  lifecycleState?: HostSummary['lifecycleState']
  agentState?: HostSummary['agentState']
  agentVersion?: string
  agentHeartbeatAt?: string
  tailscaleAddress?: string
  lastBackupAt?: string
  lastDiagnosticsAt?: string
}

export interface OperationStore {
  close(): void
  enqueueOperation(input: EnqueueOperationInput): OperationAccepted
  getOperation(id: string): OperationDetail | null
  listOperations(filters?: OperationListFilters): OperationSummary[]
  markRunning(id: string): OperationDetail
  markFinished(id: string, input: FinishOperationInput): OperationDetail
  createBackup(input: CreateBackupInput): BackupSummary
  createBridgeRule(input: CreateBridgeRuleInput): BridgeRule
  createHealthCheck(input: CreateHealthCheckInput): HealthCheck
  createHost(input: CreateHostInput): HostDetail
  createRollbackPoint(input: CreateRollbackPointInput): RollbackPoint
  findBackupByOperationId(operationId: string): BackupSummary | null
  getBridgeRule(id: string): BridgeRule | null
  getExposurePolicy(hostId: string): ExposurePolicy | null
  getHost(id: string): HostSummary | null
  getHostDetail(id: string): HostDetail | null
  getRollbackPoint(id: string): RollbackPoint | null
  listBackups(filters?: { hostId?: string; operationId?: string }): BackupSummary[]
  listBridgeRules(filters?: { hostId?: string }): BridgeRule[]
  listDiagnostics(filters?: { hostId?: string; ruleId?: string; state?: string }): OperationDetail[]
  listHealthChecks(filters?: { hostId?: string; ruleId?: string }): HealthCheck[]
  listHosts(): HostSummary[]
  listRollbackPoints(filters?: {
    hostId?: string
    state?: RollbackPoint['state']
  }): RollbackPoint[]
  markRollbackPointState(id: string, state: RollbackPoint['state']): RollbackPoint
  replaceExposurePolicy(input: ReplaceExposurePolicyInput): ExposurePolicy
  updateBridgeRule(id: string, input: UpdateBridgeRuleInput): BridgeRule
  updateHostRuntime(id: string, input: UpdateHostRuntimeInput): HostDetail
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

interface BridgeRuleRow {
  id: string
  host_id: string
  name: string | null
  protocol: BridgeRule['protocol']
  listen_port: number
  target_host: string
  target_port: number
  lifecycle_state: BridgeRule['lifecycleState']
  last_verified_at: string | null
  last_rollback_point_id: string | null
  updated_at: string
}

interface ExposurePolicyRow {
  host_id: string
  allowed_sources_json: string
  excluded_ports_json: string
  same_port_mirror: number
  conflict_policy: ExposurePolicy['conflictPolicy']
  backup_policy: ExposurePolicy['backupPolicy']
  updated_at: string
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

interface HostRow {
  id: string
  name: string
  lifecycle_state: HostSummary['lifecycleState']
  tailscale_address: string
  agent_state: HostSummary['agentState']
  agent_version: string | null
  last_heartbeat_at: string | null
  last_backup_at: string | null
  last_diagnostics_at: string | null
  updated_at: string
  labels_json: string | null
  ssh_host: string
  ssh_port: number
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

const HEARTBEAT_STALE_MS = 5 * 60 * 1000

function parseNumberArray(serialized: string | null) {
  if (!serialized) {
    return []
  }

  const parsed = JSON.parse(serialized) as unknown
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
}

function parseStringArray(serialized: string | null) {
  if (!serialized) {
    return []
  }

  const parsed = JSON.parse(serialized) as unknown
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.map((value) => String(value))
}

function backupRemoteConfigured(status: BackupSummary['githubStatus']) {
  return Boolean(status && status !== 'not_configured')
}

function backupRemoteStatusSummary(backup: {
  backupMode: NonNullable<BackupSummary['backupMode']>
  githubStatus?: NonNullable<BackupSummary['githubStatus']>
}) {
  switch (backup.githubStatus) {
    case 'succeeded':
      return 'GitHub backup succeeded; remote redundancy is available for this snapshot.'
    case 'failed':
      return 'GitHub backup failed; local rollback evidence remains available but remote redundancy is missing.'
    case 'skipped':
      return backup.backupMode === 'required'
        ? 'GitHub backup was skipped; required-mode degradation stays active until remote backup is trustworthy.'
        : 'GitHub backup was skipped; best_effort continues with local evidence only.'
    case 'not_configured':
    default:
      return backup.backupMode === 'required'
        ? 'GitHub backup missing; required-mode degradation stays active until remote backup is configured.'
        : 'GitHub backup missing; best_effort keeps local-only continuation with backup evidence.'
  }
}

function backupRemoteAction(backup: {
  backupMode: NonNullable<BackupSummary['backupMode']>
  githubStatus?: NonNullable<BackupSummary['githubStatus']>
}) {
  switch (backup.githubStatus) {
    case 'succeeded':
      return 'No remote action required.'
    case 'failed':
      return 'Inspect GitHub backup credentials and connectivity, then rerun the backup.'
    case 'skipped':
      return backup.backupMode === 'required'
        ? 'Restore GitHub backup execution before trusting required-mode runs.'
        : 'Enable GitHub backup if remote redundancy should become mandatory.'
    case 'not_configured':
    default:
      return backup.backupMode === 'required'
        ? 'Configure GitHub backup before rerunning required-mode mutations.'
        : 'Configure GitHub backup for remote redundancy or keep best_effort local-only behavior.'
  }
}

function enrichBackupSummary(backup: {
  id: string
  hostId: string
  operationId?: string
  createdAt: string
  backupMode: NonNullable<BackupSummary['backupMode']>
  localStatus: BackupSummary['localStatus']
  githubStatus?: NonNullable<BackupSummary['githubStatus']>
  manifestPath?: string
}): BackupSummary {
  return {
    ...backup,
    remoteTarget: 'github',
    remoteConfigured: backupRemoteConfigured(backup.githubStatus),
    remoteStatusSummary: backupRemoteStatusSummary(backup),
    remoteAction: backupRemoteAction(backup)
  }
}

function rowToBackup(row: BackupRow): BackupSummary {
  return enrichBackupSummary({
    id: row.id,
    hostId: row.host_id,
    operationId: row.operation_id ?? undefined,
    createdAt: row.created_at,
    backupMode: row.backup_mode ?? 'best_effort',
    localStatus: row.local_status,
    githubStatus: row.github_status ?? undefined,
    manifestPath: row.manifest_path ?? undefined
  })
}

function rowToBridgeRule(row: BridgeRuleRow): BridgeRule {
  return {
    id: row.id,
    hostId: row.host_id,
    protocol: row.protocol,
    listenPort: row.listen_port,
    targetHost: row.target_host,
    targetPort: row.target_port,
    lifecycleState: row.lifecycle_state,
    ...(row.name ? { name: row.name } : {}),
    ...(row.last_verified_at ? { lastVerifiedAt: row.last_verified_at } : {}),
    ...(row.last_rollback_point_id ? { lastRollbackPointId: row.last_rollback_point_id } : {})
  }
}

function rowToExposurePolicy(row: ExposurePolicyRow): ExposurePolicy {
  return {
    hostId: row.host_id,
    allowedSources: parseStringArray(row.allowed_sources_json),
    excludedPorts: parseNumberArray(row.excluded_ports_json),
    samePortMirror: Boolean(row.same_port_mirror),
    conflictPolicy: row.conflict_policy,
    backupPolicy: row.backup_policy
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

function heartbeatStateFromRow(row: HostRow): NonNullable<HostSummary['agentHeartbeatState']> {
  if (row.agent_state === 'unreachable') {
    return 'unreachable'
  }

  if (!row.last_heartbeat_at) {
    return 'unknown'
  }

  const heartbeatAt = Date.parse(row.last_heartbeat_at)
  if (Number.isNaN(heartbeatAt)) {
    return 'unknown'
  }

  return Date.now() - heartbeatAt > HEARTBEAT_STALE_MS ? 'stale' : 'live'
}

function rowToHostSummary(row: HostRow): HostSummary {
  return {
    id: row.id,
    name: row.name,
    lifecycleState: row.lifecycle_state,
    tailscaleAddress: row.tailscale_address,
    agentState: row.agent_state,
    agentHeartbeatState: heartbeatStateFromRow(row),
    ...(row.agent_version ? { agentVersion: row.agent_version } : {}),
    ...(row.last_heartbeat_at ? { agentHeartbeatAt: row.last_heartbeat_at } : {}),
    ...(row.last_backup_at ? { lastBackupAt: row.last_backup_at } : {}),
    ...(row.last_diagnostics_at ? { lastDiagnosticsAt: row.last_diagnostics_at } : {}),
    updatedAt: row.updated_at
  }
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
    eventStreamUrl: row.event_stream_url ?? `/operations/events?operationId=${row.id}`,
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

function rowToRollbackPoint(row: RollbackPointRow): RollbackPoint {
  return {
    id: row.id,
    hostId: row.host_id,
    operationId: row.operation_id,
    state: row.state,
    createdAt: row.created_at
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

    CREATE TABLE IF NOT EXISTS hosts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lifecycle_state TEXT NOT NULL,
      tailscale_address TEXT NOT NULL,
      agent_state TEXT NOT NULL,
      agent_version TEXT,
      last_heartbeat_at TEXT,
      last_backup_at TEXT,
      last_diagnostics_at TEXT,
      updated_at TEXT NOT NULL,
      labels_json TEXT,
      ssh_host TEXT NOT NULL,
      ssh_port INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bridge_rules (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      name TEXT,
      protocol TEXT NOT NULL,
      listen_port INTEGER NOT NULL,
      target_host TEXT NOT NULL,
      target_port INTEGER NOT NULL,
      lifecycle_state TEXT NOT NULL,
      last_verified_at TEXT,
      last_rollback_point_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exposure_policies (
      host_id TEXT PRIMARY KEY,
      allowed_sources_json TEXT NOT NULL,
      excluded_ports_json TEXT NOT NULL,
      same_port_mirror INTEGER NOT NULL,
      conflict_policy TEXT NOT NULL,
      backup_policy TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  try {
    database.exec(`ALTER TABLE backups ADD COLUMN backup_mode TEXT`)
  } catch {}
  try {
    database.exec(`ALTER TABLE hosts ADD COLUMN agent_version TEXT`)
  } catch {}
  try {
    database.exec(`ALTER TABLE hosts ADD COLUMN last_heartbeat_at TEXT`)
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

  const listOperationsQuery = database.prepare(`
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

  const listBackupsQuery = database.prepare(`
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

  const listHealthChecksQuery = database.prepare(`
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

  const findBackupByOperationIdQuery = database.prepare(`
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

  const getRollbackPointQuery = database.prepare(`
    SELECT
      id,
      host_id,
      operation_id,
      state,
      created_at
    FROM rollback_points
    WHERE id = ?
  `)

  const listRollbackPointsQuery = database.prepare(`
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

  const insertHost = database.prepare(`
    INSERT INTO hosts (
      id,
      name,
      lifecycle_state,
      tailscale_address,
      agent_state,
      agent_version,
      last_heartbeat_at,
      last_backup_at,
      last_diagnostics_at,
      updated_at,
      labels_json,
      ssh_host,
      ssh_port
    ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?, ?)
  `)

  const getHostQuery = database.prepare(`
    SELECT
      id,
      name,
      lifecycle_state,
      tailscale_address,
      agent_state,
      agent_version,
      last_heartbeat_at,
      last_backup_at,
      last_diagnostics_at,
      updated_at,
      labels_json,
      ssh_host,
      ssh_port
    FROM hosts
    WHERE id = ?
  `)

  const listHostsQuery = database.prepare(`
    SELECT
      id,
      name,
      lifecycle_state,
      tailscale_address,
      agent_state,
      agent_version,
      last_heartbeat_at,
      last_backup_at,
      last_diagnostics_at,
      updated_at,
      labels_json,
      ssh_host,
      ssh_port
    FROM hosts
    ORDER BY updated_at DESC, id DESC
  `)

  const updateHostRuntime = database.prepare(`
    UPDATE hosts
    SET lifecycle_state = ?,
        tailscale_address = ?,
        agent_state = ?,
        agent_version = ?,
        last_heartbeat_at = ?,
        last_backup_at = ?,
        last_diagnostics_at = ?,
        updated_at = ?,
        labels_json = ?
    WHERE id = ?
  `)

  const touchHostUpdated = database.prepare(`
    UPDATE hosts
    SET updated_at = ?
    WHERE id = ?
  `)

  const setHostBackupTimestamp = database.prepare(`
    UPDATE hosts
    SET last_backup_at = ?,
        updated_at = ?
    WHERE id = ?
  `)

  const setHostDiagnosticsTimestamp = database.prepare(`
    UPDATE hosts
    SET last_diagnostics_at = ?,
        updated_at = ?
    WHERE id = ?
  `)

  const insertBridgeRule = database.prepare(`
    INSERT INTO bridge_rules (
      id,
      host_id,
      name,
      protocol,
      listen_port,
      target_host,
      target_port,
      lifecycle_state,
      last_verified_at,
      last_rollback_point_id,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const getBridgeRuleQuery = database.prepare(`
    SELECT
      id,
      host_id,
      name,
      protocol,
      listen_port,
      target_host,
      target_port,
      lifecycle_state,
      last_verified_at,
      last_rollback_point_id,
      updated_at
    FROM bridge_rules
    WHERE id = ?
  `)

  const listBridgeRulesQuery = database.prepare(`
    SELECT
      id,
      host_id,
      name,
      protocol,
      listen_port,
      target_host,
      target_port,
      lifecycle_state,
      last_verified_at,
      last_rollback_point_id,
      updated_at
    FROM bridge_rules
    ORDER BY updated_at DESC, id DESC
  `)

  const updateBridgeRuleQuery = database.prepare(`
    UPDATE bridge_rules
    SET name = ?,
        protocol = ?,
        listen_port = ?,
        target_host = ?,
        target_port = ?,
        lifecycle_state = ?,
        last_verified_at = ?,
        last_rollback_point_id = ?,
        updated_at = ?
    WHERE id = ?
  `)

  const getExposurePolicyQuery = database.prepare(`
    SELECT
      host_id,
      allowed_sources_json,
      excluded_ports_json,
      same_port_mirror,
      conflict_policy,
      backup_policy,
      updated_at
    FROM exposure_policies
    WHERE host_id = ?
  `)

  const upsertExposurePolicy = database.prepare(`
    INSERT INTO exposure_policies (
      host_id,
      allowed_sources_json,
      excluded_ports_json,
      same_port_mirror,
      conflict_policy,
      backup_policy,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(host_id) DO UPDATE SET
      allowed_sources_json = excluded.allowed_sources_json,
      excluded_ports_json = excluded.excluded_ports_json,
      same_port_mirror = excluded.same_port_mirror,
      conflict_policy = excluded.conflict_policy,
      backup_policy = excluded.backup_policy,
      updated_at = excluded.updated_at
  `)

  function defaultExposurePolicy(hostId: string): ExposurePolicy {
    return {
      hostId,
      allowedSources: ['tailscale'],
      excludedPorts: [22],
      samePortMirror: false,
      conflictPolicy: 'reject',
      backupPolicy: 'best_effort'
    }
  }

  function listOperationRows() {
    return listOperationsQuery.all() as unknown as OperationRow[]
  }

  function requireBridgeRule(id: string) {
    const row = getBridgeRuleQuery.get(id) as BridgeRuleRow | undefined
    if (!row) {
      throw new Error(`Bridge rule not found: ${id}`)
    }
    return row
  }

  function requireHost(id: string) {
    const row = getHostQuery.get(id) as HostRow | undefined
    if (!row) {
      throw new Error(`Host not found: ${id}`)
    }
    return row
  }

  function requireOperation(id: string) {
    const row = getOperation.get(id) as OperationRow | undefined
    if (!row) {
      throw new Error(`Operation not found: ${id}`)
    }
    return row
  }

  function requireRollbackPoint(id: string) {
    const row = getRollbackPointQuery.get(id) as RollbackPointRow | undefined
    if (!row) {
      throw new Error(`Rollback point not found: ${id}`)
    }
    return row
  }

  function touchHost(hostId: string, updatedAt = nowIso()) {
    touchHostUpdated.run(updatedAt, hostId)
  }

  function buildHostDetail(hostRow: HostRow): HostDetail {
    const policyRow = getExposurePolicyQuery.get(hostRow.id) as ExposurePolicyRow | undefined
    const rules = (listBridgeRulesQuery.all() as unknown as BridgeRuleRow[])
      .filter((row) => row.host_id === hostRow.id)
      .slice(0, 10)
      .map((row) => rowToBridgeRule(row))
    const operations = listOperationRows()
      .filter((row) => row.host_id === hostRow.id)
      .slice(0, 10)
      .map((row) => rowToSummary(row))

    return {
      ...rowToHostSummary(hostRow),
      labels: parseStringArray(hostRow.labels_json),
      effectivePolicy: policyRow ? rowToExposurePolicy(policyRow) : defaultExposurePolicy(hostRow.id),
      recentRules: rules,
      recentOperations: operations
    }
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
      return listOperationRows()
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

      const finishedAt = nowIso()
      updateFinished.run(
        input.state,
        finishedAt,
        input.resultSummary ?? null,
        input.eventStreamUrl ?? null,
        input.backupId ?? null,
        input.rollbackPointId ?? null,
        input.diagnosticResult ? JSON.stringify(input.diagnosticResult) : null,
        input.snapshotResult ? JSON.stringify(input.snapshotResult) : null,
        id
      )

      if (current.host_id && input.diagnosticResult) {
        setHostDiagnosticsTimestamp.run(finishedAt, finishedAt, current.host_id)
      } else if (current.host_id) {
        touchHost(current.host_id, finishedAt)
      }

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

      setHostBackupTimestamp.run(createdAt, createdAt, input.hostId)

      const row = findBackupByOperationIdQuery.get(input.operationId ?? null) as BackupRow | undefined
      return row
        ? rowToBackup(row)
        : enrichBackupSummary({
            id: input.id,
            hostId: input.hostId,
            operationId: input.operationId,
            createdAt,
            backupMode: input.backupMode,
            localStatus: input.localStatus,
            githubStatus: input.githubStatus,
            manifestPath: input.manifestPath
          })
    },
    createBridgeRule(input) {
      requireHost(input.hostId)
      const updatedAt = nowIso()

      insertBridgeRule.run(
        input.id,
        input.hostId,
        input.name ?? null,
        input.protocol,
        input.listenPort,
        input.targetHost,
        input.targetPort,
        input.lifecycleState ?? 'desired',
        input.lastVerifiedAt ?? null,
        input.lastRollbackPointId ?? null,
        updatedAt
      )

      touchHost(input.hostId, updatedAt)
      return rowToBridgeRule(requireBridgeRule(input.id))
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

      touchHost(input.hostId, checkedAt)

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
    createHost(input) {
      const updatedAt = nowIso()
      insertHost.run(
        input.id,
        input.name,
        'draft',
        input.tailscaleAddress ?? input.sshHost,
        'unknown',
        updatedAt,
        JSON.stringify(input.labels ?? []),
        input.sshHost,
        input.sshPort
      )

      const policy = defaultExposurePolicy(input.id)
      upsertExposurePolicy.run(
        policy.hostId,
        JSON.stringify(policy.allowedSources),
        JSON.stringify(policy.excludedPorts),
        policy.samePortMirror ? 1 : 0,
        policy.conflictPolicy,
        policy.backupPolicy,
        updatedAt
      )

      return buildHostDetail(requireHost(input.id))
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

      const row = getRollbackPointQuery.get(input.id) as RollbackPointRow | undefined
      return row
        ? rowToRollbackPoint(row)
        : {
            id: input.id,
            hostId: input.hostId,
            operationId: input.operationId,
            state: input.state ?? 'ready',
            createdAt
          }
    },
    findBackupByOperationId(operationId) {
      const row = findBackupByOperationIdQuery.get(operationId) as BackupRow | undefined
      return row ? rowToBackup(row) : null
    },
    getBridgeRule(id) {
      const row = getBridgeRuleQuery.get(id) as BridgeRuleRow | undefined
      return row ? rowToBridgeRule(row) : null
    },
    getExposurePolicy(hostId) {
      const row = getExposurePolicyQuery.get(hostId) as ExposurePolicyRow | undefined
      return row ? rowToExposurePolicy(row) : null
    },
    getHost(id) {
      const row = getHostQuery.get(id) as HostRow | undefined
      return row ? rowToHostSummary(row) : null
    },
    getHostDetail(id) {
      const row = getHostQuery.get(id) as HostRow | undefined
      return row ? buildHostDetail(row) : null
    },
    getRollbackPoint(id) {
      const row = getRollbackPointQuery.get(id) as RollbackPointRow | undefined
      return row ? rowToRollbackPoint(row) : null
    },
    listBackups(filters) {
      return (listBackupsQuery.all() as unknown as BackupRow[])
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
    listBridgeRules(filters) {
      return (listBridgeRulesQuery.all() as unknown as BridgeRuleRow[])
        .filter((row) => {
          if (filters?.hostId && row.host_id !== filters.hostId) {
            return false
          }

          return true
        })
        .map((row) => rowToBridgeRule(row))
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

          if (filters?.state && row.state !== filters.state) {
            return false
          }

          return true
        })
    },
    listHealthChecks(filters) {
      return (listHealthChecksQuery.all() as unknown as HealthCheckRow[])
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
    listHosts() {
      return (listHostsQuery.all() as unknown as HostRow[]).map((row) => rowToHostSummary(row))
    },
    listRollbackPoints(filters) {
      return (listRollbackPointsQuery.all() as unknown as RollbackPointRow[])
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
    replaceExposurePolicy(input) {
      requireHost(input.hostId)
      const updatedAt = nowIso()
      upsertExposurePolicy.run(
        input.hostId,
        JSON.stringify(input.allowedSources),
        JSON.stringify(input.excludedPorts),
        input.samePortMirror ? 1 : 0,
        input.conflictPolicy,
        input.backupPolicy,
        updatedAt
      )

      touchHost(input.hostId, updatedAt)
      const row = getExposurePolicyQuery.get(input.hostId) as unknown as ExposurePolicyRow | undefined
      if (!row) {
        throw new Error(`Exposure policy not found: ${input.hostId}`)
      }

      return rowToExposurePolicy(row)
    },
    updateBridgeRule(id, input) {
      const current = requireBridgeRule(id)
      const updatedAt = nowIso()

      updateBridgeRuleQuery.run(
        input.name ?? current.name,
        current.protocol,
        input.listenPort ?? current.listen_port,
        input.targetHost ?? current.target_host,
        input.targetPort ?? current.target_port,
        input.lifecycleState ?? current.lifecycle_state,
        input.lastVerifiedAt ?? current.last_verified_at,
        input.lastRollbackPointId ?? current.last_rollback_point_id,
        updatedAt,
        id
      )

      touchHost(current.host_id, updatedAt)
      return rowToBridgeRule(requireBridgeRule(id))
    },
    updateHostRuntime(id, input) {
      const current = requireHost(id)
      const updatedAt = nowIso()
      updateHostRuntime.run(
        input.lifecycleState ?? current.lifecycle_state,
        input.tailscaleAddress ?? current.tailscale_address,
        input.agentState ?? current.agent_state,
        input.agentVersion ?? current.agent_version,
        input.agentHeartbeatAt ?? current.last_heartbeat_at,
        input.lastBackupAt ?? current.last_backup_at,
        input.lastDiagnosticsAt ?? current.last_diagnostics_at,
        updatedAt,
        current.labels_json,
        id
      )

      return buildHostDetail(requireHost(id))
    }
  }
}

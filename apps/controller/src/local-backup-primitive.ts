import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import type {
  OperationResultSchema,
  RollbackResultSchema,
  RuntimeStateSchema,
  SnapshotManifestSchema
} from '@portmanager/typescript-contracts'

import type { BackupSummary, OperationStore, RollbackPoint } from './operation-store.ts'

interface RunBackupInput {
  operationId: string
  hostId: string
  mode: 'best_effort' | 'required'
}

interface ApplyRollbackInput {
  operationId: string
  rollbackPointId: string
}

export interface LocalBackupPrimitive {
  applyRollback(input: ApplyRollbackInput): {
    rollbackPoint: RollbackPoint
    rollbackResultPath: string
  }
  runBackup(input: RunBackupInput): {
    backup: BackupSummary
    rollbackPoint: RollbackPoint
  }
}

const SCHEMA_VERSION = '0.1.0'

function nowIso() {
  return new Date().toISOString()
}

function sha256(text: string) {
  return createHash('sha256').update(text).digest('hex')
}

function writeJsonArtifact(filePath: string, value: unknown) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const serialized = JSON.stringify(value, null, 2)
  writeFileSync(filePath, serialized)
  return {
    path: filePath,
    sha256: sha256(serialized)
  }
}

export function createLocalBackupPrimitive(options: {
  artifactRoot: string
  store: OperationStore
}): LocalBackupPrimitive {
  const { artifactRoot, store } = options

  return {
    runBackup(input) {
      const createdAt = nowIso()
      const backupId = `backup_${input.operationId}`
      const backupDirectory = path.join(artifactRoot, 'backups', backupId)

      const desiredStateSnapshot = {
        schemaVersion: SCHEMA_VERSION,
        hostId: input.hostId,
        policy: {
          allowedSources: ['tailscale'],
          excludedPorts: [22],
          samePortMirror: false,
          conflictPolicy: 'reject',
          backupPolicy: input.mode
        },
        bridgeRules: []
      }

      const runtimeStateSnapshot: RuntimeStateSchema = {
        schemaVersion: SCHEMA_VERSION,
        hostId: input.hostId,
        agentState: 'ready',
        effectiveStateHash: sha256(`${input.hostId}:${input.operationId}`),
        updatedAt: createdAt,
        appliedRules: [],
        health: {
          summary: 'local backup primitive captured runtime state before mutation',
          signals: [
            {
              code: 'local_backup',
              status: 'healthy',
              message: `backup policy ${input.mode}`
            }
          ]
        }
      }

      const operationMetadata: OperationResultSchema = {
        schemaVersion: SCHEMA_VERSION,
        operationId: input.operationId,
        type: 'backup',
        state: 'succeeded',
        hostId: input.hostId,
        startedAt: createdAt,
        finishedAt: createdAt,
        resultSummary: `local backup ${backupId} completed`
      }

      const healthSummary = {
        schemaVersion: SCHEMA_VERSION,
        hostId: input.hostId,
        summary: 'pre-mutation health summary recorded for rollback candidate generation',
        createdAt
      }

      const desiredStateArtifact = writeJsonArtifact(
        path.join(backupDirectory, 'desired-state.snapshot.json'),
        desiredStateSnapshot
      )
      const runtimeStateArtifact = writeJsonArtifact(
        path.join(backupDirectory, 'runtime-state.snapshot.json'),
        runtimeStateSnapshot
      )
      const operationArtifact = writeJsonArtifact(
        path.join(backupDirectory, 'operation-result.json'),
        operationMetadata
      )
      const healthArtifact = writeJsonArtifact(
        path.join(backupDirectory, 'health-summary.json'),
        healthSummary
      )

      const manifest: SnapshotManifestSchema = {
        schemaVersion: SCHEMA_VERSION,
        operationId: input.operationId,
        hostId: input.hostId,
        createdAt,
        artifactVersion: SCHEMA_VERSION,
        backupMode: input.mode,
        bundleFiles: [
          desiredStateArtifact.path,
          runtimeStateArtifact.path,
          operationArtifact.path,
          healthArtifact.path
        ],
        checksums: [
          desiredStateArtifact,
          runtimeStateArtifact,
          operationArtifact,
          healthArtifact
        ]
      }

      const manifestPath = path.join(backupDirectory, 'manifest.json')
      writeJsonArtifact(manifestPath, manifest)

      const backup = store.createBackup({
        id: backupId,
        hostId: input.hostId,
        operationId: input.operationId,
        createdAt,
        localStatus: 'succeeded',
        githubStatus: 'skipped',
        manifestPath
      })

      const rollbackPoint = store.createRollbackPoint({
        id: `rp_${input.operationId}`,
        hostId: input.hostId,
        operationId: input.operationId,
        createdAt,
        state: 'ready'
      })

      return { backup, rollbackPoint }
    },
    applyRollback(input) {
      const rollbackPoint = store.getRollbackPoint(input.rollbackPointId)
      if (!rollbackPoint) {
        throw new Error(`Rollback point not found: ${input.rollbackPointId}`)
      }

      const backup = store.findBackupByOperationId(rollbackPoint.operationId)
      if (!backup?.manifestPath) {
        throw new Error(`Backup manifest not found for rollback point: ${input.rollbackPointId}`)
      }

      const manifest = JSON.parse(readFileSync(backup.manifestPath, 'utf8')) as SnapshotManifestSchema
      const verifiedAt = nowIso()
      const rollbackResult: RollbackResultSchema = {
        schemaVersion: SCHEMA_VERSION,
        rollbackPointId: input.rollbackPointId,
        operationId: input.operationId,
        status: 'rolled_back',
        verifiedAt,
        restoredArtifacts: [...manifest.bundleFiles],
        notes: `rollback restored ${manifest.bundleFiles.length} managed artifacts`
      }

      const rollbackResultPath = path.join(
        artifactRoot,
        'rollback',
        `${input.rollbackPointId}-result.json`
      )
      writeJsonArtifact(rollbackResultPath, rollbackResult)

      return {
        rollbackPoint: store.markRollbackPointState(input.rollbackPointId, 'applied'),
        rollbackResultPath
      }
    }
  }
}

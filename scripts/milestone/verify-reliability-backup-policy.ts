import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { createControllerEventBus, createControllerServer, createOperationStore } from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationAccepted {
  operationId: string
  state: string
}

interface OperationDetail {
  id: string
  state: string
  resultSummary?: string
}

interface BackupSummary {
  id: string
  hostId: string
  backupMode?: string
  localStatus: string
  githubStatus?: string
  remoteTarget?: string
  remoteConfigured?: boolean
  remoteStatusSummary?: string
  remoteAction?: string
}

interface BackupInventory {
  items: BackupSummary[]
}

export interface ReliabilityBackupPolicyVerificationResult {
  bestEffortOperation: OperationDetail
  requiredOperation: OperationDetail
  apiBackups: BackupInventory
  cliBackups: BackupInventory
}

function runJsonCommandAsync<T>(command: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  return new Promise<T>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...env
      },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `${command} exited with ${code}`))
        return
      }

      resolve(JSON.parse(stdout) as T)
    })
  })
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`request failed ${response.status}: ${url}`)
  }

  return (await response.json()) as T
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const operation = await fetchJson<OperationDetail>(`${baseUrl}/operations/${operationId}`)
    if (
      operation.state === 'succeeded' ||
      operation.state === 'failed' ||
      operation.state === 'degraded'
    ) {
      return operation
    }

    await delay(20)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

export async function verifyReliabilityBackupPolicyFlow(): Promise<ReliabilityBackupPolicyVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-backup-policy-'))
  const databasePath = path.join(sandbox, 'controller.sqlite')
  const artifactRoot = path.join(sandbox, 'artifacts')
  const store = createOperationStore({ databasePath })
  const eventBus = createControllerEventBus()
  const server = createControllerServer({ store, eventBus, artifactRoot })

  try {
    const listening = await server.listen(0)

    const bestEffortAccepted = await fetchJson<OperationAccepted>(`${listening.baseUrl}/backups/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        hostId: 'host_alpha',
        mode: 'best_effort'
      })
    })
    const bestEffortOperation = await waitForTerminalOperation(
      listening.baseUrl,
      bestEffortAccepted.operationId
    )

    await delay(25)

    const requiredAccepted = await fetchJson<OperationAccepted>(`${listening.baseUrl}/backups/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        hostId: 'host_alpha',
        mode: 'required'
      })
    })
    const requiredOperation = await waitForTerminalOperation(
      listening.baseUrl,
      requiredAccepted.operationId
    )

    const apiBackups = await fetchJson<BackupInventory>(`${listening.baseUrl}/backups?hostId=host_alpha`)
    const cliBackups = await runJsonCommandAsync<BackupInventory>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'backups',
        'list',
        '--json',
        '--host-id',
        'host_alpha'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )

    return {
      bestEffortOperation,
      requiredOperation,
      apiBackups,
      cliBackups
    }
  } finally {
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityBackupPolicyFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

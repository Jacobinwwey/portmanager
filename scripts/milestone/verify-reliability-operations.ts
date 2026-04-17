import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationRunner,
  createOperationStore
} from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationInventoryItem {
  id: string
  type: string
  state: string
  hostId?: string
  ruleId?: string
  resultSummary?: string
  backupId?: string
  rollbackPointId?: string
  startedAt: string
  finishedAt?: string
}

interface OperationInventory {
  items: OperationInventoryItem[]
}

interface OperationDetail extends OperationInventoryItem {
  initiator?: string
  eventStreamUrl?: string
}

export interface ReliabilityOperationsVerificationResult {
  apiOperations: OperationInventory
  cliOperations: OperationInventory
  apiOperationDetail: OperationDetail
  cliOperationDetail: OperationDetail
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

export async function verifyReliabilityOperationsFlow(): Promise<ReliabilityOperationsVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-operations-'))
  const databasePath = path.join(sandbox, 'controller.sqlite')
  const artifactRoot = path.join(sandbox, 'artifacts')
  const store = createOperationStore({ databasePath })
  const eventBus = createControllerEventBus()
  const runner = createOperationRunner({ store, eventBus })
  const server = createControllerServer({ store, eventBus, artifactRoot })

  try {
    store.enqueueOperation({
      id: 'op_backup_required_001',
      type: 'backup',
      initiator: 'automation',
      hostId: 'host_alpha'
    })
    store.enqueueOperation({
      id: 'op_diag_001',
      type: 'diagnostics',
      initiator: 'automation',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    await runner.run('op_backup_required_001', async () => ({
      state: 'degraded',
      resultSummary: 'required GitHub backup is not configured',
      backupId: 'backup_alpha_002',
      rollbackPointId: 'rp_alpha_002'
    }))
    await runner.run('op_diag_001', async () => ({
      resultSummary: 'diagnostics confirmed https relay and refreshed host readiness evidence'
    }))

    const listening = await server.listen(0)
    const apiOperations = await fetchJson<OperationInventory>(
      `${listening.baseUrl}/operations?hostId=host_alpha&state=degraded&type=backup`
    )
    const cliOperations = await runJsonCommandAsync<OperationInventory>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'operations',
        'list',
        '--json',
        '--host-id',
        'host_alpha',
        '--state',
        'degraded',
        '--type',
        'backup'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )
    const apiOperationDetail = await fetchJson<OperationDetail>(
      `${listening.baseUrl}/operations/op_backup_required_001`
    )
    const cliOperationDetail = await runJsonCommandAsync<OperationDetail>(
      'cargo',
      ['run', '-q', '-p', 'portmanager-cli', '--', 'operation', 'get', 'op_backup_required_001', '--json'],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )

    return {
      apiOperations,
      cliOperations,
      apiOperationDetail,
      cliOperationDetail
    }
  } finally {
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityOperationsFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

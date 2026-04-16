import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { createControllerEventBus, createControllerServer, createOperationStore } from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface BackupSummary {
  id: string
  hostId: string
  operationId?: string
  localStatus: string
  githubStatus?: string
  manifestPath?: string
  createdAt: string
}

interface BackupInventory {
  items: BackupSummary[]
}

interface DiagnosticOperation {
  id: string
  type: string
  state: string
  hostId?: string
  ruleId?: string
  finishedAt?: string
  snapshotResult?: {
    pageTitle?: string
    artifactPath?: string
  }
}

interface DiagnosticInventory {
  items: DiagnosticOperation[]
}

interface RollbackPoint {
  id: string
  hostId: string
  operationId: string
  state: string
  createdAt: string
}

interface RollbackInventory {
  items: RollbackPoint[]
}

interface OperationAccepted {
  operationId: string
  state: string
}

interface OperationDetail {
  id: string
  type: string
  state: string
  rollbackPointId?: string
}

export interface ReliabilityRecoveryVerificationResult {
  rollbackPointId: string
  apiBackups: BackupInventory
  cliBackups: BackupInventory
  apiDiagnostics: DiagnosticInventory
  cliDiagnostics: DiagnosticInventory
  cliRollbackOperation: OperationDetail
  apiRollbackPoints: RollbackInventory
  cliRollbackPoints: RollbackInventory
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
  for (let attempt = 0; attempt < 50; attempt += 1) {
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

export async function verifyReliabilityRecoveryFlow(): Promise<ReliabilityRecoveryVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-recovery-'))
  const databasePath = path.join(sandbox, 'controller.sqlite')
  const artifactRoot = path.join(sandbox, 'artifacts')
  const store = createOperationStore({ databasePath })
  const eventBus = createControllerEventBus()
  const server = createControllerServer({ store, eventBus, artifactRoot })
  const diagnosticTarget = createServer((request, response) => {
    if (request.url === '/') {
      response.writeHead(302, { location: '/status' })
      response.end()
      return
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(
      '<!doctype html><html><head><title>Alpha Relay Healthy</title></head><body>ok</body></html>'
    )
  })

  try {
    await new Promise<void>((resolve, reject) => {
      diagnosticTarget.once('error', reject)
      diagnosticTarget.listen(0, '127.0.0.1', () => {
        diagnosticTarget.off('error', reject)
        resolve()
      })
    })

    const targetAddress = diagnosticTarget.address()
    if (!targetAddress || typeof targetAddress === 'string') {
      throw new Error('diagnostic target failed to bind')
    }

    const listening = await server.listen(0)

    const alphaBackupAccepted = await fetchJson<OperationAccepted>(`${listening.baseUrl}/backups/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        hostId: 'host_alpha',
        mode: 'required'
      })
    })
    await waitForTerminalOperation(listening.baseUrl, alphaBackupAccepted.operationId)

    const bravoBackupAccepted = await fetchJson<OperationAccepted>(`${listening.baseUrl}/backups/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        hostId: 'host_bravo',
        mode: 'best_effort'
      })
    })
    await waitForTerminalOperation(listening.baseUrl, bravoBackupAccepted.operationId)

    const diagnosticsAccepted = await fetchJson<OperationAccepted>(
      `${listening.baseUrl}/snapshots/diagnostics`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          ruleId: 'rule_alpha_https',
          port: targetAddress.port,
          scheme: 'http',
          captureSnapshot: true
        })
      }
    )
    await waitForTerminalOperation(listening.baseUrl, diagnosticsAccepted.operationId)

    const rollbackPointId = `rp_${alphaBackupAccepted.operationId}`
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
    const cliDiagnostics = await runJsonCommandAsync<DiagnosticInventory>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'diagnostics',
        'list',
        '--json',
        '--host-id',
        'host_alpha',
        '--rule-id',
        'rule_alpha_https'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )
    const cliRollbackOperation = await runJsonCommandAsync<OperationDetail>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'rollback-points',
        'apply',
        rollbackPointId,
        '--json',
        '--wait',
        '--poll-interval-ms',
        '10',
        '--timeout-ms',
        '2000'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )
    const apiBackups = await fetchJson<BackupInventory>(`${listening.baseUrl}/backups?hostId=host_alpha`)
    const apiDiagnostics = await fetchJson<DiagnosticInventory>(
      `${listening.baseUrl}/diagnostics?hostId=host_alpha&ruleId=rule_alpha_https`
    )
    const apiRollbackPoints = await fetchJson<RollbackInventory>(
      `${listening.baseUrl}/rollback-points?hostId=host_alpha&state=applied`
    )
    const cliRollbackPoints = await runJsonCommandAsync<RollbackInventory>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'rollback-points',
        'list',
        '--json',
        '--host-id',
        'host_alpha',
        '--state',
        'applied'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )

    return {
      rollbackPointId,
      apiBackups,
      cliBackups,
      apiDiagnostics,
      cliDiagnostics,
      cliRollbackOperation,
      apiRollbackPoints,
      cliRollbackPoints
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      diagnosticTarget.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityRecoveryFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

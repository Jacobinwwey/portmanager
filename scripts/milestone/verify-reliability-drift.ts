import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { createControllerEventBus, createControllerServer, createOperationStore } from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationDetail {
  id: string
  type: string
  state: string
  resultSummary?: string
  eventStreamUrl?: string
}

interface HealthCheck {
  id: string
  hostId: string
  ruleId?: string
  category: string
  status: string
  summary?: string
  backupPolicy?: string
  checkedAt: string
}

interface OperationEvent {
  id: string
  kind: string
  operationId: string
  operationType: string
  state: string
  level: string
  summary: string
  hostId?: string
  ruleId?: string
  emittedAt: string
}

interface HealthCheckInventory {
  items: HealthCheck[]
}

interface EventHistory {
  items: OperationEvent[]
}

export interface ReliabilityDriftVerificationResult {
  driftOperation: OperationDetail
  healthChecks: HealthCheckInventory
  cliHealthChecks: HealthCheckInventory
  eventHistory: EventHistory
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

export async function verifyReliabilityDriftFlow(): Promise<ReliabilityDriftVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-reliability-'))
  const databasePath = path.join(sandbox, 'controller.sqlite')
  const artifactRoot = path.join(sandbox, 'artifacts')
  const store = createOperationStore({ databasePath })
  const eventBus = createControllerEventBus()
  const server = createControllerServer({ store, eventBus, artifactRoot })

  try {
    const listening = await server.listen(0)
    const accepted = await fetchJson<{ operationId: string; state: string }>(
      `${listening.baseUrl}/bridge-rules/rule_alpha_https/drift-check`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          expectedStateHash: 'expected_hash_alpha',
          observedStateHash: 'observed_hash_bravo',
          backupPolicy: 'required'
        })
      }
    )

    const driftOperation = await waitForTerminalOperation(listening.baseUrl, accepted.operationId)
    const healthChecks = await fetchJson<HealthCheckInventory>(
      `${listening.baseUrl}/health-checks?hostId=host_alpha&ruleId=rule_alpha_https`
    )
    const cliHealthChecks = await runJsonCommandAsync<HealthCheckInventory>(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'health-checks',
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
    const eventHistory = await fetchJson<EventHistory>(`${listening.baseUrl}/events?limit=4`)

    return {
      driftOperation,
      healthChecks,
      cliHealthChecks,
      eventHistory
    }
  } finally {
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityDriftFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

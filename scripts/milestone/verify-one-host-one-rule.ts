import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationRunner,
  createOperationStore
} from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationResult {
  operationId: string
  type: string
  state: string
  hostId?: string
  ruleId?: string
  startedAt: string
  finishedAt?: string
  resultSummary?: string
  linkedArtifacts?: string[]
}

interface RuntimeState {
  hostId: string
  agentState: string
  effectiveStateHash: string
  appliedRules: Array<{
    id: string
    listenPort: number
    targetHost: string
    targetPort: number
    status: string
  }>
}

interface BackupInventory {
  items: Array<{
    id: string
    hostId: string
    operationId?: string
    localStatus: string
    githubStatus?: string
    manifestPath?: string
  }>
}

interface RollbackInventory {
  items: Array<{
    id: string
    hostId: string
    operationId: string
    state: string
    createdAt: string
  }>
}

export interface OneHostOneRuleVerificationResult {
  controllerBaseUrl: string
  bootstrapResult: OperationResult
  controllerBootstrapOperation: Record<string, unknown>
  applyResult: OperationResult
  runtimeState: RuntimeState
  cliOperation: Record<string, unknown>
  diagnosticsOperation: Record<string, unknown>
  diagnosticsSnapshotArtifactExists: boolean
  backups: BackupInventory
  rollbackPoints: RollbackInventory
  rollbackOperation: Record<string, unknown>
}

function runJsonCommand(command: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env
    },
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} exited with ${result.status}`)
  }

  return JSON.parse(result.stdout) as Record<string, unknown>
}

function runJsonCommandAsync(command: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
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

      resolve(JSON.parse(stdout) as Record<string, unknown>)
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

async function waitForControllerOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const operation = await fetchJson<Record<string, unknown>>(`${baseUrl}/operations/${operationId}`)
    if (
      operation.state === 'succeeded' ||
      operation.state === 'failed' ||
      operation.state === 'degraded'
    ) {
      return operation
    }

    await delay(25)
  }

  throw new Error(`controller operation did not settle: ${operationId}`)
}

export async function verifyOneHostOneRuleFlow(): Promise<OneHostOneRuleVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-milestone-'))
  const configDir = path.join(sandbox, 'config')
  const stateDir = path.join(sandbox, 'state')
  const desiredStatePath = path.join(sandbox, 'apply-desired-state.json')
  const controllerDbPath = path.join(sandbox, 'controller.sqlite')
  const controllerArtifactsPath = path.join(sandbox, 'controller-artifacts')

  const desiredState = {
    schemaVersion: '0.1.0',
    hostId: 'host_alpha',
    policy: {
      allowedSources: ['tailscale'],
      excludedPorts: [22],
      samePortMirror: false,
      conflictPolicy: 'reject',
      backupPolicy: 'required'
    },
    bridgeRules: [
      {
        id: 'rule_alpha_https',
        name: 'HTTPS relay',
        protocol: 'tcp',
        listenPort: 443,
        targetHost: '127.0.0.1',
        targetPort: 3000
      }
    ]
  }

  writeFileSync(desiredStatePath, JSON.stringify(desiredState, null, 2))

  const store = createOperationStore({ databasePath: controllerDbPath })
  const eventBus = createControllerEventBus()
  const runner = createOperationRunner({ store, eventBus })
  const server = createControllerServer({
    store,
    eventBus,
    artifactRoot: controllerArtifactsPath
  })
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

    const bootstrapResult = runJsonCommand('cargo', [
      'run',
      '-q',
      '-p',
      'portmanager-agent',
      '--',
      'bootstrap',
      '--operation-id',
      'op_bootstrap_001',
      '--host-id',
      'host_alpha',
      '--hostname',
      'alpha',
      '--tailscale-address',
      '100.64.0.10',
      '--config-dir',
      configDir,
      '--state-dir',
      stateDir,
      '--json'
    ]) as unknown as OperationResult

    store.enqueueOperation({
      id: 'op_bootstrap_001',
      type: 'bootstrap_host',
      initiator: 'automation',
      hostId: 'host_alpha'
    })

    const controllerBootstrapOperation = await runner.run('op_bootstrap_001', async () => ({
      resultSummary: 'host_alpha bootstrapped and ready for rule application'
    }))

    const applyResult = runJsonCommand('cargo', [
      'run',
      '-q',
      '-p',
      'portmanager-agent',
      '--',
      'apply',
      '--operation-id',
      'op_agent_apply_001',
      '--desired-state-file',
      desiredStatePath,
      '--state-dir',
      stateDir,
      '--json'
    ]) as unknown as OperationResult

    const runtimeState = runJsonCommand('cargo', [
      'run',
      '-q',
      '-p',
      'portmanager-agent',
      '--',
      'collect',
      '--state-dir',
      stateDir,
      '--json'
    ]) as unknown as RuntimeState

    store.enqueueOperation({
      id: 'op_apply_001',
      type: 'apply_policy',
      initiator: 'automation',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https'
    })

    const listening = await server.listen(0)
    const cliPromise = runJsonCommandAsync(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'operation',
        'get',
        'op_apply_001',
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

    await delay(40)
    await runner.run('op_apply_001', async () => {
      await delay(40)
      return {
        resultSummary: 'rule_alpha_https applied and waiting for controller-side diagnostics'
      }
    })

    const cliOperation = await cliPromise
    const diagnosticsAccepted = await fetchJson<{ operationId: string; state: string }>(
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
    const diagnosticsOperation = await waitForControllerOperation(
      listening.baseUrl,
      diagnosticsAccepted.operationId
    )
    const diagnosticsSnapshotArtifactExists = existsSync(
      String(
        (diagnosticsOperation.snapshotResult as { artifactPath?: string } | undefined)?.artifactPath ??
          ''
      )
    )

    const backupAccepted = await fetchJson<{ operationId: string; state: string }>(
      `${listening.baseUrl}/backups/run`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId: 'host_alpha',
          mode: 'required'
        })
      }
    )
    await waitForControllerOperation(listening.baseUrl, backupAccepted.operationId)

    const backupInventory = await fetchJson<BackupInventory>(`${listening.baseUrl}/backups`)
    const rollbackReadyInventory = await fetchJson<RollbackInventory>(
      `${listening.baseUrl}/rollback-points`
    )
    const rollbackPointId = rollbackReadyInventory.items[0]?.id
    if (!rollbackPointId) {
      throw new Error('rollback point missing after backup run')
    }

    const rollbackAccepted = await fetchJson<{ operationId: string; state: string }>(
      `${listening.baseUrl}/rollback-points/${rollbackPointId}/apply`,
      {
        method: 'POST'
      }
    )
    const rollbackOperation = await waitForControllerOperation(
      listening.baseUrl,
      rollbackAccepted.operationId
    )
    const rollbackInventory = await fetchJson<RollbackInventory>(`${listening.baseUrl}/rollback-points`)

    return {
      controllerBaseUrl: listening.baseUrl,
      bootstrapResult,
      controllerBootstrapOperation,
      applyResult,
      runtimeState,
      cliOperation,
      diagnosticsOperation,
      diagnosticsSnapshotArtifactExists,
      backups: backupInventory,
      rollbackPoints: rollbackInventory,
      rollbackOperation
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
  const result = await verifyOneHostOneRuleFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

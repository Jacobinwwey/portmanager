import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import {
  closeHttpServer,
  createControllerEventBus,
  createControllerServer,
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
    remoteTarget?: string
    remoteConfigured?: boolean
    remoteStatusSummary?: string
    remoteAction?: string
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

interface EventHistory {
  items: Array<{
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
  }>
}

export interface OneHostOneRuleVerificationResult {
  controllerBaseUrl: string
  bootstrapResult: OperationResult
  controllerBootstrapOperation: Record<string, unknown>
  applyResult: OperationResult
  apiRuleDetail: Record<string, unknown>
  runtimeState: RuntimeState
  cliOperation: Record<string, unknown>
  diagnosticsOperation: Record<string, unknown>
  diagnosticsSnapshotArtifactExists: boolean
  apiEventHistory: EventHistory
  cliEventHistory: EventHistory
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

function agentBinaryPath() {
  const build = spawnSync('cargo', ['build', '-q', '-p', 'portmanager-agent'], {
    cwd: repoRoot,
    encoding: 'utf8'
  })

  if (build.status !== 0) {
    throw new Error(build.stderr || build.stdout || `cargo build failed: ${build.status}`)
  }

  return path.join(
    repoRoot,
    'target',
    'debug',
    process.platform === 'win32' ? 'portmanager-agent.exe' : 'portmanager-agent'
  )
}

async function reservePort() {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('failed to reserve port')
  }

  const port = address.port
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

  return port
}

async function waitForAgent(baseUrl: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.status === 200) {
        return
      }
    } catch {
      // keep polling
    }

    await delay(25)
  }

  throw new Error(`agent did not become healthy: ${baseUrl}`)
}

async function spawnAgentService(binaryPath: string, configDir: string, stateDir: string, port: number) {
  const child = spawn(
    binaryPath,
    [
      'serve',
      '--bind-address',
      '127.0.0.1',
      '--port',
      String(port),
      '--config-dir',
      configDir,
      '--state-dir',
      stateDir
    ],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  await waitForAgent(`http://127.0.0.1:${port}`)
  return child
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
  const controllerDbPath = path.join(sandbox, 'controller.sqlite')
  const controllerArtifactsPath = path.join(sandbox, 'controller-artifacts')
  const binaryPath = agentBinaryPath()
  let agentProcess: ReturnType<typeof spawn> | undefined

  const store = createOperationStore({ databasePath: controllerDbPath })
  const eventBus = createControllerEventBus()
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

    const listening = await server.listen(0)

    const createHostAccepted = await fetchJson<{ operationId: string }>(`${listening.baseUrl}/hosts`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Alpha Relay',
        ssh: {
          host: '127.0.0.1',
          port: 22
        }
      })
    })
    await waitForControllerOperation(listening.baseUrl, createHostAccepted.operationId)

    const hostsPayload = await fetchJson<{ items: Array<Record<string, unknown>> }>(
      `${listening.baseUrl}/hosts`
    )
    const hostId = String(hostsPayload.items[0]?.id)

    runJsonCommand(binaryPath, [
      'bootstrap',
      '--operation-id',
      'op_bootstrap_001',
      '--host-id',
      hostId,
      '--hostname',
      'alpha',
      '--tailscale-address',
      '127.0.0.1',
      '--config-dir',
      configDir,
      '--state-dir',
      stateDir,
      '--json'
    ])

    const agentPort = await reservePort()
    agentProcess = await spawnAgentService(binaryPath, configDir, stateDir, agentPort)

    const bootstrapAccepted = await fetchJson<{ operationId: string }>(
      `${listening.baseUrl}/hosts/${hostId}/bootstrap`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'ubuntu',
          desiredAgentPort: agentPort,
          backupPolicy: 'required'
        })
      }
    )
    const bootstrapResult = (await waitForControllerOperation(
      listening.baseUrl,
      bootstrapAccepted.operationId
    )) as unknown as OperationResult
    const controllerBootstrapOperation = bootstrapResult

    const createRuleAccepted = await fetchJson<{ operationId: string }>(
      `${listening.baseUrl}/bridge-rules`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          name: 'HTTPS relay',
          protocol: 'tcp',
          listenPort: 443,
          targetHost: '127.0.0.1',
          targetPort: 3000
        })
      }
    )
    const applyResult = (await waitForControllerOperation(
      listening.baseUrl,
      createRuleAccepted.operationId
    )) as unknown as OperationResult

    const runtimeState = (await fetchJson<RuntimeState>(
      `http://127.0.0.1:${agentPort}/runtime-state`
    )) as RuntimeState

    const cliOperation = await runJsonCommandAsync(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'operation',
        'get',
        createRuleAccepted.operationId,
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

    const diagnosticsAccepted = await fetchJson<{ operationId: string; state: string }>(
      `${listening.baseUrl}/snapshots/diagnostics`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          ruleId: applyResult.ruleId,
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
    const apiRuleDetail = await fetchJson<Record<string, unknown>>(
      `${listening.baseUrl}/bridge-rules/${applyResult.ruleId}`
    )

    const backupAccepted = await fetchJson<{ operationId: string; state: string }>(
      `${listening.baseUrl}/backups/run`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
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
    const apiEventHistory = await fetchJson<EventHistory>(`${listening.baseUrl}/events?limit=8`)
    const cliEventHistory = (await runJsonCommandAsync(
      'cargo',
      [
        'run',
        '-q',
        '-p',
        'portmanager-cli',
        '--',
        'events',
        'list',
        '--json',
        '--limit',
        '8'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )) as unknown as EventHistory

    return {
      controllerBaseUrl: listening.baseUrl,
      bootstrapResult,
      controllerBootstrapOperation,
      applyResult,
      apiRuleDetail,
      runtimeState,
      cliOperation,
      diagnosticsOperation,
      diagnosticsSnapshotArtifactExists,
      apiEventHistory,
      cliEventHistory,
      backups: backupInventory,
      rollbackPoints: rollbackInventory,
      rollbackOperation
    }
  } finally {
    if (agentProcess) {
      agentProcess.kill()
      await new Promise<void>((resolve) => {
        agentProcess?.once('close', () => resolve())
      })
    }
    await closeHttpServer(diagnosticTarget)
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyOneHostOneRuleFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

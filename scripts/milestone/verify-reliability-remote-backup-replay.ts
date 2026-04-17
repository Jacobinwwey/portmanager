import { createServer } from 'node:http'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  closeHttpServer,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'
import { BackupsPage, loadBackupsState } from '../../apps/web/src/main.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationResult {
  id: string
  state: string
  type: string
  hostId?: string
  ruleId?: string
  resultSummary?: string
}

interface RuntimeState {
  hostId: string
  agentState: string
  agentVersion?: string
  effectiveStateHash: string
  appliedRules: Array<{
    id: string
    listenPort: number
    targetHost: string
    targetPort: number
    status: string
  }>
}

interface BackupSummary {
  id: string
  hostId: string
  backupMode?: string
  localStatus: string
  githubStatus?: string
  remoteConfigured?: boolean
  remoteStatusSummary?: string
  remoteAction?: string
}

interface BackupInventory {
  items: BackupSummary[]
}

interface EventHistory {
  items: Array<{
    id: string
    operationId: string
    state: string
    summary: string
  }>
}

export interface RemoteBackupReplayScenarioResult {
  hostId: string
  ruleId: string
  runtimeState: RuntimeState
  backupOperation: OperationResult
  apiBackups: BackupInventory
  cliBackups: BackupInventory
  apiEvents: EventHistory
  cliEvents: EventHistory
  backupsPageHtml: string
}

export interface ReliabilityRemoteBackupReplayResult {
  localOnly: RemoteBackupReplayScenarioResult
  configuredSuccess: RemoteBackupReplayScenarioResult
  configuredFailure: RemoteBackupReplayScenarioResult
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
  await closeHttpServer(server)
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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const operation = await fetchJson<Record<string, unknown>>(`${baseUrl}/operations/${operationId}`)
    if (
      operation.state === 'succeeded' ||
      operation.state === 'failed' ||
      operation.state === 'degraded'
    ) {
      return operation as unknown as OperationResult
    }

    await delay(25)
  }

  throw new Error(`controller operation did not settle: ${operationId}`)
}

async function startGitHubMockServer(mode: 'success' | 'failure') {
  const server = createServer((request, response) => {
    if (
      request.method !== 'PUT' ||
      !(request.url ?? '').startsWith('/repos/Jacobinwwey/portmanager-backups/contents/')
    ) {
      response.writeHead(404)
      response.end()
      return
    }

    if (mode === 'failure') {
      response.writeHead(500, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ message: 'simulated upload failure' }))
      return
    }

    response.writeHead(201, { 'content-type': 'application/json' })
    response.end(
      JSON.stringify({
        content: {
          path: decodeURIComponent(
            (request.url ?? '').slice('/repos/Jacobinwwey/portmanager-backups/contents/'.length)
          )
        }
      })
    )
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('GitHub mock server failed to bind')
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  }
}

async function runScenario(options: {
  binaryPath: string
  githubMode: 'not_configured' | 'success' | 'failure'
}): Promise<RemoteBackupReplayScenarioResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), `portmanager-remote-backup-${options.githubMode}-`))
  const configDir = path.join(sandbox, 'config')
  const stateDir = path.join(sandbox, 'state')
  const controllerDbPath = path.join(sandbox, 'controller.sqlite')
  const controllerArtifactsPath = path.join(sandbox, 'controller-artifacts')
  let github:
    | {
        server: ReturnType<typeof createServer>
        baseUrl: string
      }
    | undefined
  let agentProcess: ReturnType<typeof spawn> | undefined

  const eventBus = createControllerEventBus()
  const store = createOperationStore({ databasePath: controllerDbPath })

  if (options.githubMode !== 'not_configured') {
    github = await startGitHubMockServer(options.githubMode === 'success' ? 'success' : 'failure')
  }

  const server = createControllerServer({
    store,
    eventBus,
    artifactRoot: controllerArtifactsPath,
    ...(github
      ? {
          githubBackup: {
            apiBaseUrl: github.baseUrl,
            env: {
              PORTMANAGER_GITHUB_BACKUP_ENABLED: 'true',
              PORTMANAGER_GITHUB_BACKUP_REPO: 'Jacobinwwey/portmanager-backups',
              PORTMANAGER_GITHUB_BACKUP_TOKEN: 'ghs_test_token'
            }
          }
        }
      : {})
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
        name: `Alpha Relay ${options.githubMode}`,
        ssh: {
          host: '127.0.0.1',
          port: 22
        }
      })
    })
    await waitForControllerOperation(listening.baseUrl, createHostAccepted.operationId)

    const hostsPayload = await fetchJson<{ items: Array<{ id: string }> }>(`${listening.baseUrl}/hosts`)
    const hostId = hostsPayload.items[0]?.id
    if (!hostId) {
      throw new Error(`host missing for scenario ${options.githubMode}`)
    }

    const bootstrapSeed = spawnSync(
      options.binaryPath,
      [
        'bootstrap',
        '--operation-id',
        `op_seed_${options.githubMode}`,
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
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8'
      }
    )

    if (bootstrapSeed.status !== 0) {
      throw new Error(
        bootstrapSeed.stderr || bootstrapSeed.stdout || `agent bootstrap failed: ${bootstrapSeed.status}`
      )
    }

    const agentPort = await reservePort()
    agentProcess = await spawnAgentService(options.binaryPath, configDir, stateDir, agentPort)

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
    await waitForControllerOperation(listening.baseUrl, bootstrapAccepted.operationId)

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
          targetPort: targetAddress.port
        })
      }
    )
    const createRuleOperation = await waitForControllerOperation(
      listening.baseUrl,
      createRuleAccepted.operationId
    )
    const ruleId = createRuleOperation.ruleId
    if (!ruleId) {
      throw new Error(`rule missing for scenario ${options.githubMode}`)
    }

    const diagnosticsAccepted = await fetchJson<{ operationId: string }>(
      `${listening.baseUrl}/snapshots/diagnostics`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          ruleId,
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
    if (
      diagnosticsOperation.snapshotResult &&
      typeof diagnosticsOperation.snapshotResult === 'object' &&
      'artifactPath' in diagnosticsOperation.snapshotResult
    ) {
      const artifactPath = String(
        (diagnosticsOperation.snapshotResult as { artifactPath?: string }).artifactPath ?? ''
      )
      if (artifactPath && !existsSync(artifactPath)) {
        throw new Error(`diagnostic artifact missing for scenario ${options.githubMode}`)
      }
    }

    const backupAccepted = await fetchJson<{ operationId: string }>(`${listening.baseUrl}/backups/run`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        hostId,
        mode: 'required'
      })
    })
    const backupOperation = await waitForControllerOperation(listening.baseUrl, backupAccepted.operationId)

    const runtimeState = await fetchJson<RuntimeState>(`http://127.0.0.1:${agentPort}/runtime-state`)
    const apiBackups = await fetchJson<BackupInventory>(`${listening.baseUrl}/backups?hostId=${hostId}`)
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
        hostId
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )
    const apiEvents = await fetchJson<EventHistory>(
      `${listening.baseUrl}/events?limit=8&operationId=${backupAccepted.operationId}`
    )
    const cliEvents = await runJsonCommandAsync<EventHistory>(
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
        '--operation-id',
        backupAccepted.operationId,
        '--limit',
        '8'
      ],
      {
        PORTMANAGER_CONTROLLER_BASE_URL: listening.baseUrl
      }
    )

    const backupsState = await loadBackupsState({ baseUrl: listening.baseUrl, hostId })
    const backupsPageHtml = renderToStaticMarkup(h(BackupsPage, { state: backupsState }))

    return {
      hostId,
      ruleId,
      runtimeState,
      backupOperation,
      apiBackups,
      cliBackups,
      apiEvents,
      cliEvents,
      backupsPageHtml
    }
  } finally {
    if (agentProcess) {
      agentProcess.kill()
      await new Promise<void>((resolve) => {
        agentProcess?.once('close', () => resolve())
      })
    }
    if (github) {
      await closeHttpServer(github.server)
    }
    await closeHttpServer(diagnosticTarget)
    await server.close()
    store.close()
    rmSync(sandbox, { recursive: true, force: true })
  }
}

export async function verifyReliabilityRemoteBackupReplayFlow(): Promise<ReliabilityRemoteBackupReplayResult> {
  const binaryPath = agentBinaryPath()

  return {
    localOnly: await runScenario({ binaryPath, githubMode: 'not_configured' }),
    configuredSuccess: await runScenario({ binaryPath, githubMode: 'success' }),
    configuredFailure: await runScenario({ binaryPath, githubMode: 'failure' })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityRemoteBackupReplayFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

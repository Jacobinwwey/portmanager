import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-agent-service-'))
  return {
    directory,
    configDir: path.join(directory, 'config'),
    stateDir: path.join(directory, 'state'),
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
  }
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

function runAgent(binaryPath: string, args: string[]) {
  const result = spawnSync(binaryPath, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `agent command failed: ${args.join(' ')}`)
  }

  return JSON.parse(result.stdout) as Record<string, unknown>
}

async function waitForAgent(baseUrl: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.status === 200) {
        return
      }
    } catch {
      // retry until timeout
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
  ) as ChildProcessWithoutNullStreams

  await waitForAgent(`http://127.0.0.1:${port}`)
  return child
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await fetch(`${baseUrl}/operations/${operationId}`)
    assert.equal(response.status, 200)

    const payload = (await response.json()) as Record<string, unknown>
    if (
      payload.state === 'succeeded' ||
      payload.state === 'failed' ||
      payload.state === 'degraded'
    ) {
      return payload
    }

    await delay(25)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

test('controller bootstrap reaches live agent and syncs desired state over HTTP', async () => {
  const { directory, configDir, stateDir, databasePath, artifactRoot } = tempPaths()
  const binaryPath = agentBinaryPath()
  let agent: ChildProcessWithoutNullStreams | undefined

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Alpha Agent',
          ssh: {
            host: '127.0.0.1',
            port: 22
          }
        })
      })

      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const hostId = String(hostsPayload.items[0]?.id)

      const createRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules`, {
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
      })

      const createRuleAccepted = (await createRuleResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createRuleAccepted.operationId)

      runAgent(binaryPath, [
        'bootstrap',
        '--operation-id',
        'op_agent_bootstrap_001',
        '--host-id',
        hostId,
        '--hostname',
        'alpha-agent',
        '--tailscale-address',
        '127.0.0.1',
        '--config-dir',
        configDir,
        '--state-dir',
        stateDir,
        '--json'
      ])

      const agentPort = await reservePort()
      agent = await spawnAgentService(binaryPath, configDir, stateDir, agentPort)

      const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'ubuntu',
          desiredAgentPort: agentPort,
          backupPolicy: 'best_effort'
        })
      })

      assert.equal(bootstrapResponse.status, 202)
      const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
      const bootstrapOperation = await waitForTerminalOperation(
        listening.baseUrl,
        bootstrapAccepted.operationId
      )

      assert.equal(bootstrapOperation.type, 'bootstrap_host')
      assert.equal(bootstrapOperation.state, 'succeeded')

      const hostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      const hostDetail = (await hostDetailResponse.json()) as Record<string, unknown>
      assert.equal(hostDetail.lifecycleState, 'ready')
      assert.equal(hostDetail.agentState, 'ready')
      assert.equal(hostDetail.agentVersion, '0.1.0')
      assert.equal(hostDetail.agentHeartbeatState, 'live')
      assert.match(String(hostDetail.agentHeartbeatAt), /T/)
      assert.equal(
        Array.isArray(hostDetail.recentRules) &&
          (hostDetail.recentRules as Array<Record<string, unknown>>)[0]?.lifecycleState,
        'applied_unverified'
      )

      const runtimeResponse = await fetch(`http://127.0.0.1:${agentPort}/runtime-state`)
      assert.equal(runtimeResponse.status, 200)
      const runtimeState = (await runtimeResponse.json()) as Record<string, unknown>
      assert.equal(runtimeState.hostId, hostId)
      assert.equal(
        ((runtimeState.appliedRules as Array<Record<string, unknown>>) ?? [])[0]?.id,
        String((hostDetail.recentRules as Array<Record<string, unknown>>)[0]?.id)
      )
    } finally {
      if (agent) {
        agent.kill()
        await new Promise<void>((resolve) => {
          agent?.once('close', () => resolve())
        })
      }
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller marks host degraded when steady-state agent is unreachable during bootstrap', async () => {
  const { directory, configDir, stateDir, databasePath, artifactRoot } = tempPaths()
  const binaryPath = agentBinaryPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Broken Agent',
          ssh: {
            host: '127.0.0.1',
            port: 22
          }
        })
      })

      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const hostId = String(hostsPayload.items[0]?.id)

      runAgent(binaryPath, [
        'bootstrap',
        '--operation-id',
        'op_agent_bootstrap_missing_001',
        '--host-id',
        hostId,
        '--hostname',
        'broken-agent',
        '--tailscale-address',
        '127.0.0.1',
        '--config-dir',
        configDir,
        '--state-dir',
        stateDir,
        '--json'
      ])

      const unreachablePort = await reservePort()
      const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'ubuntu',
          desiredAgentPort: unreachablePort
        })
      })

      assert.equal(bootstrapResponse.status, 202)
      const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
      const bootstrapOperation = await waitForTerminalOperation(
        listening.baseUrl,
        bootstrapAccepted.operationId
      )

      assert.equal(bootstrapOperation.state, 'degraded')
      assert.match(String(bootstrapOperation.resultSummary), /agent/i)

      const hostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      const hostDetail = (await hostDetailResponse.json()) as Record<string, unknown>
      assert.equal(hostDetail.lifecycleState, 'degraded')
      assert.equal(hostDetail.agentState, 'unreachable')
      assert.equal(hostDetail.agentHeartbeatState, 'unreachable')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

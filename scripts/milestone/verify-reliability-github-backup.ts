import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import {
  closeHttpServer,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

interface OperationAccepted {
  operationId: string
}

interface OperationDetail {
  state: string
  resultSummary?: string
}

interface BackupSummary {
  githubStatus?: string
  remoteConfigured?: boolean
  remoteStatusSummary?: string
  remoteAction?: string
}

interface BackupInventory {
  items: BackupSummary[]
}

export interface ReliabilityGitHubBackupVerificationResult {
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

async function startGitHubMockServer() {
  const server = createServer((request, response) => {
    if (
      request.method !== 'PUT' ||
      !(request.url ?? '').startsWith('/repos/Jacobinwwey/portmanager-backups/contents/')
    ) {
      response.writeHead(404)
      response.end()
      return
    }

    const chunks: Buffer[] = []
    request.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    request.on('end', () => {
      response.writeHead(201, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ content: { path: request.url } }))
    })
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

export async function verifyReliabilityGitHubBackupFlow(): Promise<ReliabilityGitHubBackupVerificationResult> {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-github-backup-'))
  const github = await startGitHubMockServer()
  const databasePath = path.join(sandbox, 'controller.sqlite')
  const artifactRoot = path.join(sandbox, 'artifacts')
  const store = createOperationStore({ databasePath })
  const eventBus = createControllerEventBus()
  const server = createControllerServer({
    store,
    eventBus,
    artifactRoot,
    githubBackup: {
      apiBaseUrl: github.baseUrl,
      env: {
        PORTMANAGER_GITHUB_BACKUP_ENABLED: 'true',
        PORTMANAGER_GITHUB_BACKUP_REPO: 'Jacobinwwey/portmanager-backups',
        PORTMANAGER_GITHUB_BACKUP_TOKEN: 'ghs_test_token'
      }
    }
  })

  try {
    const listening = await server.listen(0)

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
    const requiredOperation = await waitForTerminalOperation(listening.baseUrl, requiredAccepted.operationId)

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
      requiredOperation,
      apiBackups,
      cliBackups
    }
  } finally {
    await server.close()
    store.close()
    await closeHttpServer(github.server)
    rmSync(sandbox, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyReliabilityGitHubBackupFlow()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

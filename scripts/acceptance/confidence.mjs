import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

function createStep(name, args) {
  return {
    name,
    command: 'pnpm',
    args
  }
}

export function getAcceptanceVerificationSteps() {
  return [
    createStep('Run JavaScript and TypeScript tests', ['test']),
    createStep('Run workspace type checks', ['typecheck']),
    {
      name: 'Run Rust workspace tests',
      command: 'cargo',
      args: ['test', '--workspace']
    },
    createStep('Check generated contracts for drift', ['contracts:check']),
    createStep('Build docs-site publishing layer', [
      '--dir',
      'docs-site',
      '--ignore-workspace',
      'run',
      'docs:build'
    ]),
    createStep('Run milestone verification flow', ['milestone:verify'])
  ]
}

export function getConfidenceVerificationSteps() {
  return [
    ...getAcceptanceVerificationSteps(),
    createStep('Run reliability remote-backup replay proof', [
      'milestone:verify:reliability-remote-backup-replay'
    ])
  ]
}

export function resolveInvocation(step, environment = process.env) {
  if (step.command === 'pnpm') {
    const npmExecPath = environment.npm_execpath

    if (npmExecPath) {
      return {
        command: process.execPath,
        args: [npmExecPath, ...step.args]
      }
    }

    if (process.platform === 'win32') {
      return {
        command: 'pnpm.cmd',
        args: step.args
      }
    }
  }

  return {
    command: step.command,
    args: step.args
  }
}

function formatDuration(startedAt) {
  const totalMs = Date.now() - startedAt
  const seconds = (totalMs / 1000).toFixed(1)
  return `${seconds}s`
}

export function runVerificationSteps({
  steps,
  cwd = repoRoot,
  env = process.env,
  spawnSyncImpl = spawnSync,
  stdout = process.stdout,
  stderr = process.stderr,
  successLabel = 'Verification'
}) {
  const startedAt = Date.now()

  for (const [index, step] of steps.entries()) {
    const stepStartedAt = Date.now()
    const prefix = `[${index + 1}/${steps.length}]`
    stdout.write(`\n${prefix} ${step.name}\n`)

    const invocation = resolveInvocation(step, env)
    const result = spawnSyncImpl(invocation.command, invocation.args, {
      cwd,
      stdio: 'inherit',
      env
    })
    const status = result.status ?? 1

    if (result.error) {
      stderr.write(`\n${prefix} Failed after ${formatDuration(stepStartedAt)} (${result.error.message})\n`)
      return {
        ok: false,
        status,
        failedStep: step
      }
    }

    if (status !== 0) {
      const signalMessage = result.signal ? ` (signal: ${result.signal})` : ''
      stderr.write(`\n${prefix} Failed after ${formatDuration(stepStartedAt)}${signalMessage}\n`)
      return {
        ok: false,
        status,
        failedStep: step
      }
    }

    stdout.write(`${prefix} Completed in ${formatDuration(stepStartedAt)}\n`)
  }

  stdout.write(`\n${successLabel} completed in ${formatDuration(startedAt)}\n`)
  return {
    ok: true,
    status: 0,
    failedStep: null
  }
}

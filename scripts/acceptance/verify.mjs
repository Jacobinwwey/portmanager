import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

const steps = [
  {
    name: 'Run JavaScript and TypeScript tests',
    command: 'pnpm',
    args: ['test']
  },
  {
    name: 'Run workspace type checks',
    command: 'pnpm',
    args: ['typecheck']
  },
  {
    name: 'Run Rust workspace tests',
    command: 'cargo',
    args: ['test', '--workspace']
  },
  {
    name: 'Check generated contracts for drift',
    command: 'pnpm',
    args: ['contracts:check']
  },
  {
    name: 'Build docs-site publishing layer',
    command: 'pnpm',
    args: ['--dir', 'docs-site', '--ignore-workspace', 'run', 'docs:build']
  },
  {
    name: 'Run milestone verification flow',
    command: 'pnpm',
    args: ['milestone:verify']
  }
]

function resolveInvocation(step) {
  if (step.command === 'pnpm') {
    const npmExecPath = process.env.npm_execpath

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

const startedAt = Date.now()

for (const [index, step] of steps.entries()) {
  const stepStartedAt = Date.now()
  const prefix = `[${index + 1}/${steps.length}]`
  process.stdout.write(`\n${prefix} ${step.name}\n`)

  const invocation = resolveInvocation(step)

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env
  })

  if (result.error) {
    process.stderr.write(
      `\n${prefix} Failed after ${formatDuration(stepStartedAt)} (${result.error.message})\n`
    )
    process.exit(result.status ?? 1)
  }

  if (result.status !== 0) {
    const signalMessage = result.signal ? ` (signal: ${result.signal})` : ''
    process.stderr.write(
      `\n${prefix} Failed after ${formatDuration(stepStartedAt)}${signalMessage}\n`
    )
    process.exit(result.status ?? 1)
  }

  process.stdout.write(`${prefix} Completed in ${formatDuration(stepStartedAt)}\n`)
}

process.stdout.write(`\nAcceptance verification completed in ${formatDuration(startedAt)}\n`)

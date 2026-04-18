import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const CONFIDENCE_REPORT_VERSION = '0.2.0'

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

function secondsFromMilliseconds(durationMs) {
  return Number((durationMs / 1000).toFixed(3))
}

function formatDuration(startedAt) {
  const totalMs = Date.now() - startedAt
  const seconds = (totalMs / 1000).toFixed(1)
  return `${seconds}s`
}

function buildVerificationContext(environment) {
  return {
    eventName: environment.GITHUB_EVENT_NAME ?? null,
    ref: environment.GITHUB_REF ?? null,
    sha: environment.GITHUB_SHA ?? null,
    runId: environment.GITHUB_RUN_ID ?? null,
    runAttempt: environment.GITHUB_RUN_ATTEMPT ?? null,
    workflow: environment.GITHUB_WORKFLOW ?? null
  }
}

function writeVerificationReport({
  reportPath,
  successLabel,
  startedAt,
  completedAt,
  result,
  stepReports,
  env
}) {
  if (!reportPath) {
    return
  }

  mkdirSync(path.dirname(reportPath), { recursive: true })
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        reportVersion: CONFIDENCE_REPORT_VERSION,
        label: successLabel,
        ok: result.ok,
        status: result.status,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date(completedAt).toISOString(),
        totalDurationSeconds: secondsFromMilliseconds(completedAt - startedAt),
        context: buildVerificationContext(env),
        failedStepName: result.failedStep?.name ?? null,
        steps: stepReports
      },
      null,
      2
    ),
    'utf8'
  )
}

export function runVerificationSteps({
  steps,
  cwd = repoRoot,
  env = process.env,
  spawnSyncImpl = spawnSync,
  stdout = process.stdout,
  stderr = process.stderr,
  successLabel = 'Verification',
  reportPath = null
}) {
  const startedAt = Date.now()
  const stepReports = steps.map((step, index) => ({
    index: index + 1,
    name: step.name,
    command: step.command,
    args: step.args,
    status: 'skipped',
    durationSeconds: 0
  }))

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
    const stepDurationMs = Date.now() - stepStartedAt

    if (result.error) {
      stderr.write(`\n${prefix} Failed after ${formatDuration(stepStartedAt)} (${result.error.message})\n`)
      const failureResult = {
        ok: false,
        status,
        failedStep: step
      }
      stepReports[index] = {
        ...stepReports[index],
        status: 'failed',
        durationSeconds: secondsFromMilliseconds(stepDurationMs)
      }
      writeVerificationReport({
        reportPath,
        successLabel,
        startedAt,
        completedAt: Date.now(),
        result: failureResult,
        stepReports,
        env
      })
      return failureResult
    }

    if (status !== 0) {
      const signalMessage = result.signal ? ` (signal: ${result.signal})` : ''
      stderr.write(`\n${prefix} Failed after ${formatDuration(stepStartedAt)}${signalMessage}\n`)
      const failureResult = {
        ok: false,
        status,
        failedStep: step
      }
      stepReports[index] = {
        ...stepReports[index],
        status: 'failed',
        durationSeconds: secondsFromMilliseconds(stepDurationMs)
      }
      writeVerificationReport({
        reportPath,
        successLabel,
        startedAt,
        completedAt: Date.now(),
        result: failureResult,
        stepReports,
        env
      })
      return failureResult
    }

    stepReports[index] = {
      ...stepReports[index],
      status: 'passed',
      durationSeconds: secondsFromMilliseconds(stepDurationMs)
    }
    stdout.write(`${prefix} Completed in ${formatDuration(stepStartedAt)}\n`)
  }

  stdout.write(`\n${successLabel} completed in ${formatDuration(startedAt)}\n`)
  const successResult = {
    ok: true,
    status: 0,
    failedStep: null
  }
  writeVerificationReport({
    reportPath,
    successLabel,
    startedAt,
    completedAt: Date.now(),
    result: successResult,
    stepReports,
    env
  })
  return successResult
}

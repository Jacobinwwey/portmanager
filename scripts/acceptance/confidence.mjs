import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const CONFIDENCE_REPORT_VERSION = '0.2.0'
const CONFIDENCE_HISTORY_VERSION = '0.2.0'
const CONFIDENCE_READINESS_VERSION = '0.1.0'
const DEFAULT_HISTORY_LIMIT = 30
const READINESS_REQUIRED_REF = 'refs/heads/main'
const READINESS_QUALIFIED_EVENTS = ['push', 'workflow_dispatch', 'schedule']
const READINESS_MINIMUM_QUALIFIED_RUNS = 7
const READINESS_MINIMUM_CONSECUTIVE_PASSES = 3

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

function isQualifiedReadinessContext(context) {
  return (
    context.ref === READINESS_REQUIRED_REF &&
    READINESS_QUALIFIED_EVENTS.includes(context.eventName ?? '')
  )
}

function isQualifiedReadinessEntry(entry) {
  return entry.qualifiedForReadiness || isQualifiedReadinessContext(entry.context ?? {})
}

function buildVerificationReport({
  successLabel,
  startedAt,
  completedAt,
  result,
  stepReports,
  env
}) {
  const context = buildVerificationContext(env)

  return {
    reportVersion: CONFIDENCE_REPORT_VERSION,
    label: successLabel,
    ok: result.ok,
    status: result.status,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    totalDurationSeconds: secondsFromMilliseconds(completedAt - startedAt),
    context,
    qualifiedForReadiness: isQualifiedReadinessContext(context),
    failedStepName: result.failedStep?.name ?? null,
    steps: stepReports
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
  const report = buildVerificationReport({
    successLabel,
    startedAt,
    completedAt,
    result,
    stepReports,
    env
  })

  if (reportPath) {
    mkdirSync(path.dirname(reportPath), { recursive: true })
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  }

  return report
}

function resolveHistoryLimit(rawLimit) {
  const parsedLimit = Number.parseInt(String(rawLimit ?? DEFAULT_HISTORY_LIMIT), 10)

  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    return parsedLimit
  }

  return DEFAULT_HISTORY_LIMIT
}

function readHistoryEntries(historyPath) {
  if (!historyPath || !existsSync(historyPath)) {
    return []
  }

  try {
    const history = JSON.parse(readFileSync(historyPath, 'utf8'))

    if (Array.isArray(history.entries)) {
      return history.entries
    }
  } catch {
    return []
  }

  return []
}

function buildHistoryEntry(report) {
  const passedStepCount = report.steps.filter((step) => step.status === 'passed').length
  const failedStepCount = report.steps.filter((step) => step.status === 'failed').length
  const skippedStepCount = report.steps.filter((step) => step.status === 'skipped').length
  const runId = report.context.runId ?? 'local'
  const runAttempt = report.context.runAttempt ?? '0'

  return {
    id: `${report.completedAt}-${runId}-${runAttempt}`,
    reportVersion: report.reportVersion,
    ok: report.ok,
    status: report.status,
    startedAt: report.startedAt,
    completedAt: report.completedAt,
    totalDurationSeconds: report.totalDurationSeconds,
    failedStepName: report.failedStepName,
    passedStepCount,
    failedStepCount,
    skippedStepCount,
    stepCount: report.steps.length,
    qualifiedForReadiness: report.qualifiedForReadiness ?? isQualifiedReadinessContext(report.context),
    context: report.context
  }
}

function countConsecutivePasses(entries) {
  let total = 0

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (!entries[index].ok) {
      break
    }

    total += 1
  }

  return total
}

function countQualifiedConsecutivePasses(entries) {
  let total = 0

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index]

    if (!isQualifiedReadinessEntry(entry)) {
      continue
    }

    if (!entry.ok) {
      break
    }

    total += 1
  }

  return total
}

function buildReadinessSnapshot(entries) {
  const qualifiedEntries = entries.filter((entry) => isQualifiedReadinessEntry(entry))
  const qualifiedRuns = qualifiedEntries.length
  const qualifiedPasses = qualifiedEntries.filter((entry) => entry.ok).length
  const qualifiedFailures = qualifiedRuns - qualifiedPasses
  const qualifiedConsecutivePasses = countQualifiedConsecutivePasses(entries)
  const remainingQualifiedRuns = Math.max(
    READINESS_MINIMUM_QUALIFIED_RUNS - qualifiedRuns,
    0
  )
  const remainingConsecutivePasses = Math.max(
    READINESS_MINIMUM_CONSECUTIVE_PASSES - qualifiedConsecutivePasses,
    0
  )
  const status =
    qualifiedRuns === 0
      ? 'local-only'
      : remainingQualifiedRuns === 0 && remainingConsecutivePasses === 0
        ? 'promotion-ready'
        : 'building-history'

  return {
    readinessVersion: CONFIDENCE_READINESS_VERSION,
    status,
    requiredRef: READINESS_REQUIRED_REF,
    qualifiedEvents: READINESS_QUALIFIED_EVENTS,
    minimumQualifiedRuns: READINESS_MINIMUM_QUALIFIED_RUNS,
    minimumConsecutivePasses: READINESS_MINIMUM_CONSECUTIVE_PASSES,
    qualifiedRuns,
    qualifiedPasses,
    qualifiedFailures,
    qualifiedConsecutivePasses,
    remainingQualifiedRuns,
    remainingConsecutivePasses
  }
}

function buildHistorySnapshot({ report, historyPath, historyLimit }) {
  const previousEntries = readHistoryEntries(historyPath)
  const entries = [...previousEntries, buildHistoryEntry(report)].slice(-historyLimit)
  const passedRuns = entries.filter((entry) => entry.ok).length
  const failedRuns = entries.length - passedRuns

  return {
    historyVersion: CONFIDENCE_HISTORY_VERSION,
    label: report.label,
    updatedAt: report.completedAt,
    historyLimit,
    totalRuns: entries.length,
    passedRuns,
    failedRuns,
    consecutivePasses: countConsecutivePasses(entries),
    latestRun: entries.at(-1) ?? null,
    readiness: buildReadinessSnapshot(entries),
    entries
  }
}

function summarizeContext(entry) {
  return entry.context.eventName ?? 'local'
}

function summarizeRun(entry) {
  if (entry.context.runId) {
    return `${entry.context.runId}/${entry.context.runAttempt ?? '1'}`
  }

  return 'local'
}

function summarizeSha(entry) {
  return entry.context.sha ? entry.context.sha.slice(0, 12) : 'local'
}

function renderHistorySummary(snapshot) {
  const latestRun = snapshot.latestRun
  const readiness = snapshot.readiness
  const lines = [
    '# Milestone Confidence History',
    '',
    `Updated: ${snapshot.updatedAt}`,
    `Tracked runs: ${snapshot.totalRuns}`,
    `Passing runs: ${snapshot.passedRuns}`,
    `Failing runs: ${snapshot.failedRuns}`,
    `Consecutive passing runs: ${snapshot.consecutivePasses}`
  ]

  lines.push('')
  lines.push('## Promotion Readiness')
  lines.push(`- Status: ${readiness.status}`)
  lines.push(
    `- Qualified scope: ${readiness.qualifiedEvents.join(', ')} on ${readiness.requiredRef}`
  )
  lines.push(
    `- Qualified runs: ${readiness.qualifiedRuns}/${readiness.minimumQualifiedRuns}`
  )
  lines.push(
    `- Qualified consecutive passes: ${readiness.qualifiedConsecutivePasses}/${readiness.minimumConsecutivePasses}`
  )
  lines.push(`- Remaining qualified runs: ${readiness.remainingQualifiedRuns}`)
  lines.push(
    `- Remaining qualified pass streak: ${readiness.remainingConsecutivePasses}`
  )

  if (readiness.status === 'promotion-ready') {
    lines.push(
      '- Note: readiness thresholds are met; milestone wording can be reviewed with human judgment.'
    )
  } else {
    lines.push(
      '- Note: local and non-mainline runs are recorded for visibility but do not advance milestone-promotion readiness.'
    )
  }

  if (latestRun) {
    lines.push('')
    lines.push('## Latest Run')
    lines.push(`- Outcome: ${latestRun.ok ? 'passed' : 'failed'}`)
    lines.push(
      `- Qualified for readiness: ${latestRun.qualifiedForReadiness ? 'yes' : 'no'}`
    )
    lines.push(`- Event: ${summarizeContext(latestRun)}`)
    lines.push(`- Run: ${summarizeRun(latestRun)}`)
    lines.push(`- SHA: ${summarizeSha(latestRun)}`)
    lines.push(`- Workflow: ${latestRun.context.workflow ?? 'local'}`)
    lines.push(`- Completed: ${latestRun.completedAt}`)
    lines.push(`- Failed step: ${latestRun.failedStepName ?? 'none'}`)
  }

  lines.push('')
  lines.push('## Recent Runs')
  lines.push('| Completed | Outcome | Qualified | Event | Run | SHA | Duration (s) | Failed step |')
  lines.push('| --- | --- | --- | --- | --- | --- | ---: | --- |')

  for (const entry of [...snapshot.entries].reverse().slice(0, 10)) {
    lines.push(
      `| ${entry.completedAt} | ${entry.ok ? 'passed' : 'failed'} | ${entry.qualifiedForReadiness ? 'yes' : 'no'} | ${summarizeContext(entry)} | ${summarizeRun(entry)} | ${summarizeSha(entry)} | ${entry.totalDurationSeconds} | ${entry.failedStepName ?? 'none'} |`
    )
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

function writeConfidenceHistory({ historyPath, summaryPath, report, historyLimit }) {
  if (!historyPath && !summaryPath) {
    return
  }

  const snapshot = buildHistorySnapshot({
    report,
    historyPath,
    historyLimit
  })

  if (historyPath) {
    mkdirSync(path.dirname(historyPath), { recursive: true })
    writeFileSync(historyPath, JSON.stringify(snapshot, null, 2), 'utf8')
  }

  if (summaryPath) {
    mkdirSync(path.dirname(summaryPath), { recursive: true })
    writeFileSync(summaryPath, renderHistorySummary(snapshot), 'utf8')
  }
}

export function runVerificationSteps({
  steps,
  cwd = repoRoot,
  env = process.env,
  spawnSyncImpl = spawnSync,
  stdout = process.stdout,
  stderr = process.stderr,
  successLabel = 'Verification',
  reportPath = null,
  historyPath = null,
  summaryPath = null,
  historyLimit = resolveHistoryLimit(env.PORTMANAGER_CONFIDENCE_HISTORY_LIMIT)
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
      const report = writeVerificationReport({
        reportPath,
        successLabel,
        startedAt,
        completedAt: Date.now(),
        result: failureResult,
        stepReports,
        env
      })
      writeConfidenceHistory({
        historyPath,
        summaryPath,
        report,
        historyLimit
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
      const report = writeVerificationReport({
        reportPath,
        successLabel,
        startedAt,
        completedAt: Date.now(),
        result: failureResult,
        stepReports,
        env
      })
      writeConfidenceHistory({
        historyPath,
        summaryPath,
        report,
        historyLimit
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
  const report = writeVerificationReport({
    reportPath,
    successLabel,
    startedAt,
    completedAt: Date.now(),
    result: successResult,
    stepReports,
    env
  })
  writeConfidenceHistory({
    historyPath,
    summaryPath,
    report,
    historyLimit
  })
  return successResult
}

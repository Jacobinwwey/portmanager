import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  getAcceptanceVerificationSteps,
  getConfidenceVerificationSteps,
  runVerificationSteps
} from '../../scripts/acceptance/confidence.mjs'

test('confidence routine appends replay proof after standing acceptance steps', () => {
  const acceptanceSteps = getAcceptanceVerificationSteps()
  const confidenceSteps = getConfidenceVerificationSteps()

  assert.equal(confidenceSteps.length, acceptanceSteps.length + 1)
  assert.deepEqual(confidenceSteps.slice(0, acceptanceSteps.length), acceptanceSteps)
  assert.equal(
    confidenceSteps.at(-1)?.name,
    'Run reliability remote-backup replay proof'
  )
  assert.deepEqual(confidenceSteps.at(-1)?.args, [
    'milestone:verify:reliability-remote-backup-replay'
  ])
})

test('standing acceptance routine stays unchanged without replay proof', () => {
  const acceptanceSteps = getAcceptanceVerificationSteps()

  assert.equal(acceptanceSteps.length, 6)
  assert.equal(
    acceptanceSteps.some(
      (step) => step.args[0] === 'milestone:verify:reliability-remote-backup-replay'
    ),
    false
  )
  assert.deepEqual(acceptanceSteps.at(-1)?.args, ['milestone:verify'])
})

test('confidence routine stops before replay when acceptance step fails', () => {
  const calls: Array<{ command: string; args: string[] }> = []

  const result = runVerificationSteps({
    steps: getConfidenceVerificationSteps(),
    spawnSyncImpl(command, args) {
      calls.push({ command, args: [...args] })

      if (args.includes('typecheck')) {
        return { status: 2, signal: null }
      }

      return { status: 0, signal: null }
    },
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer()
  })

  assert.equal(result.ok, false)
  assert.equal(result.failedStep?.args.at(-1), 'typecheck')
  assert.equal(
    calls.some((call) => call.args.includes('milestone:verify:reliability-remote-backup-replay')),
    false
  )
})

test('confidence routine fails on replay after acceptance succeeds', () => {
  const calls: Array<{ command: string; args: string[] }> = []

  const result = runVerificationSteps({
    steps: getConfidenceVerificationSteps(),
    spawnSyncImpl(command, args) {
      calls.push({ command, args: [...args] })

      if (args.includes('milestone:verify:reliability-remote-backup-replay')) {
        return { status: 7, signal: null }
      }

      return { status: 0, signal: null }
    },
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer()
  })

  assert.equal(result.ok, false)
  assert.equal(
    result.failedStep?.args.at(-1),
    'milestone:verify:reliability-remote-backup-replay'
  )
  assert.equal(
    calls.at(-1)?.args.includes('milestone:verify:reliability-remote-backup-replay'),
    true
  )
  assert.equal(calls.length, getConfidenceVerificationSteps().length)
})

test('confidence routine writes success report with executed steps', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    const result = runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      summaryPath,
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      ok: boolean
      qualifiedForReadiness: boolean
      failedStepName: string | null
      steps: Array<{ status: string; name: string }>
    }
    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      historyVersion: string
      totalRuns: number
      passedRuns: number
      failedRuns: number
      consecutivePasses: number
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
      }
      latestRun: { ok: boolean } | null
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(result.ok, true)
    assert.equal(report.ok, true)
    assert.equal(report.qualifiedForReadiness, false)
    assert.equal(report.failedStepName, null)
    assert.equal(report.steps.length, getConfidenceVerificationSteps().length)
    assert.equal(report.steps.at(-1)?.status, 'passed')
    assert.equal(report.steps.at(-1)?.name, 'Run reliability remote-backup replay proof')
    assert.equal(history.historyVersion, '0.2.0')
    assert.equal(history.totalRuns, 1)
    assert.equal(history.passedRuns, 1)
    assert.equal(history.failedRuns, 0)
    assert.equal(history.consecutivePasses, 1)
    assert.equal(history.readiness.status, 'local-only')
    assert.equal(history.readiness.qualifiedRuns, 0)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 0)
    assert.equal(history.latestRun?.ok, true)
    assert.match(summary, /Consecutive passing runs: 1/)
    assert.match(summary, /Status: local-only/)
    assert.match(summary, /Qualified for readiness: no/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('confidence routine writes failure report with skipped trailing steps', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    const result = runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      summaryPath,
      spawnSyncImpl(_command, args) {
        if (args.includes('typecheck')) {
          return { status: 2, signal: null }
        }

        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      ok: boolean
      failedStepName: string | null
      steps: Array<{ status: string; name: string }>
    }
    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      totalRuns: number
      failedRuns: number
      consecutivePasses: number
      readiness: {
        status: string
      }
      latestRun: { failedStepName: string | null } | null
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(result.ok, false)
    assert.equal(report.ok, false)
    assert.equal(report.failedStepName, 'Run workspace type checks')
    assert.equal(report.steps[1]?.status, 'failed')
    assert.equal(report.steps.at(-1)?.status, 'skipped')
    assert.equal(history.totalRuns, 1)
    assert.equal(history.failedRuns, 1)
    assert.equal(history.consecutivePasses, 0)
    assert.equal(history.readiness.status, 'local-only')
    assert.equal(history.latestRun?.failedStepName, 'Run workspace type checks')
    assert.match(summary, /Outcome: failed/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('confidence routine writes CI context metadata into report', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')

  try {
    runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      env: {
        GITHUB_EVENT_NAME: 'schedule',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: 'abc123def456',
        GITHUB_RUN_ID: '55',
        GITHUB_RUN_ATTEMPT: '3',
        GITHUB_WORKFLOW: 'mainline-acceptance'
      },
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      reportVersion: string
      qualifiedForReadiness: boolean
      context: {
        eventName: string | null
        ref: string | null
        sha: string | null
        runId: string | null
        runAttempt: string | null
        workflow: string | null
      }
    }
    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
      }
      latestRun: {
        qualifiedForReadiness: boolean
        context: {
          eventName: string | null
          runId: string | null
          workflow: string | null
        }
      } | null
    }

    assert.equal(report.reportVersion, '0.2.0')
    assert.equal(report.qualifiedForReadiness, true)
    assert.equal(report.context.eventName, 'schedule')
    assert.equal(report.context.ref, 'refs/heads/main')
    assert.equal(report.context.sha, 'abc123def456')
    assert.equal(report.context.runId, '55')
    assert.equal(report.context.runAttempt, '3')
    assert.equal(report.context.workflow, 'mainline-acceptance')
    assert.equal(history.readiness.status, 'building-history')
    assert.equal(history.readiness.qualifiedRuns, 1)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 1)
    assert.equal(history.latestRun?.qualifiedForReadiness, true)
    assert.equal(history.latestRun?.context.eventName, 'schedule')
    assert.equal(history.latestRun?.context.runId, '55')
    assert.equal(history.latestRun?.context.workflow, 'mainline-acceptance')
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('confidence routine appends history and keeps latest consecutive pass count', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    writeFileSync(
      historyPath,
      JSON.stringify(
        {
          historyVersion: '0.2.0',
          label: 'Milestone confidence verification',
          updatedAt: '2026-04-17T00:00:00.000Z',
          historyLimit: 30,
          totalRuns: 2,
          passedRuns: 2,
          failedRuns: 0,
          consecutivePasses: 2,
          latestRun: createHistoryEntry({
            completedAt: '2026-04-17T00:00:00.000Z',
            startedAt: '2026-04-16T23:59:00.000Z',
            sha: 'oldsha222222',
            runId: '11'
          }),
          entries: [
            createHistoryEntry({
              completedAt: '2026-04-16T00:00:00.000Z',
              startedAt: '2026-04-15T23:59:00.000Z',
              sha: 'oldsha111111',
              runId: '10'
            }),
            createHistoryEntry({
              completedAt: '2026-04-17T00:00:00.000Z',
              startedAt: '2026-04-16T23:59:00.000Z',
              sha: 'oldsha222222',
              runId: '11'
            })
          ]
        },
        null,
        2
      ),
      'utf8'
    )

    runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      summaryPath,
      env: {
        GITHUB_EVENT_NAME: 'schedule',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: 'newsha333333',
        GITHUB_RUN_ID: '12',
        GITHUB_RUN_ATTEMPT: '2',
        GITHUB_WORKFLOW: 'mainline-acceptance'
      },
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      totalRuns: number
      passedRuns: number
      failedRuns: number
      consecutivePasses: number
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
      }
      latestRun: {
        context: { runId: string | null; runAttempt: string | null; sha: string | null }
      } | null
      entries: Array<unknown>
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(history.totalRuns, 3)
    assert.equal(history.passedRuns, 3)
    assert.equal(history.failedRuns, 0)
    assert.equal(history.consecutivePasses, 3)
    assert.equal(history.readiness.status, 'building-history')
    assert.equal(history.readiness.qualifiedRuns, 3)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 3)
    assert.equal(history.latestRun?.context.runId, '12')
    assert.equal(history.latestRun?.context.runAttempt, '2')
    assert.equal(history.latestRun?.context.sha, 'newsha333333')
    assert.equal(history.entries.length, 3)
    assert.match(summary, /Consecutive passing runs: 3/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('local runs stay visible without advancing qualified readiness streak', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    writeFileSync(
      historyPath,
      JSON.stringify(
        {
          historyVersion: '0.2.0',
          label: 'Milestone confidence verification',
          updatedAt: '2026-04-17T00:00:00.000Z',
          historyLimit: 30,
          totalRuns: 2,
          passedRuns: 2,
          failedRuns: 0,
          consecutivePasses: 2,
          latestRun: createHistoryEntry({
            completedAt: '2026-04-17T00:00:00.000Z',
            startedAt: '2026-04-16T23:59:00.000Z',
            sha: 'oldsha222222',
            runId: '11'
          }),
          entries: [
            createHistoryEntry({
              completedAt: '2026-04-16T00:00:00.000Z',
              startedAt: '2026-04-15T23:59:00.000Z',
              sha: 'oldsha111111',
              runId: '10'
            }),
            createHistoryEntry({
              completedAt: '2026-04-17T00:00:00.000Z',
              startedAt: '2026-04-16T23:59:00.000Z',
              sha: 'oldsha222222',
              runId: '11'
            })
          ]
        },
        null,
        2
      ),
      'utf8'
    )

    runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      summaryPath,
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      totalRuns: number
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
      }
      latestRun: {
        qualifiedForReadiness: boolean
        context: { eventName: string | null }
      } | null
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(history.totalRuns, 3)
    assert.equal(history.readiness.status, 'building-history')
    assert.equal(history.readiness.qualifiedRuns, 2)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 2)
    assert.equal(history.latestRun?.qualifiedForReadiness, false)
    assert.equal(history.latestRun?.context.eventName, null)
    assert.match(summary, /Status: building-history/)
    assert.match(summary, /Qualified for readiness: no/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('qualified mainline history becomes promotion-ready after thresholds are met', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    const seededEntries = Array.from({ length: 6 }, (_, index) =>
      createHistoryEntry({
        completedAt: `2026-04-${String(10 + index).padStart(2, '0')}T00:00:00.000Z`,
        startedAt: `2026-04-${String(9 + index).padStart(2, '0')}T23:59:00.000Z`,
        sha: `seedsha${index + 1}`.padEnd(12, '0'),
        runId: String(20 + index)
      })
    )

    writeFileSync(
      historyPath,
      JSON.stringify(
        {
          historyVersion: '0.2.0',
          label: 'Milestone confidence verification',
          updatedAt: seededEntries.at(-1)?.completedAt,
          historyLimit: 30,
          totalRuns: seededEntries.length,
          passedRuns: seededEntries.length,
          failedRuns: 0,
          consecutivePasses: seededEntries.length,
          latestRun: seededEntries.at(-1),
          entries: seededEntries
        },
        null,
        2
      ),
      'utf8'
    )

    runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      historyPath,
      summaryPath,
      env: {
        GITHUB_EVENT_NAME: 'push',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: 'readysha777777',
        GITHUB_RUN_ID: '26',
        GITHUB_RUN_ATTEMPT: '1',
        GITHUB_WORKFLOW: 'mainline-acceptance'
      },
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
        remainingQualifiedRuns: number
        remainingConsecutivePasses: number
      }
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(history.readiness.status, 'promotion-ready')
    assert.equal(history.readiness.qualifiedRuns, 7)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 7)
    assert.equal(history.readiness.remainingQualifiedRuns, 0)
    assert.equal(history.readiness.remainingConsecutivePasses, 0)
    assert.match(summary, /Status: promotion-ready/)
    assert.match(summary, /readiness thresholds are met/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

function createWritableBuffer() {
  return {
    chunks: [] as string[],
    write(chunk: string) {
      this.chunks.push(String(chunk))
    }
  }
}

function createHistoryEntry({
  completedAt,
  startedAt,
  sha,
  runId
}: {
  completedAt: string
  startedAt: string
  sha: string
  runId: string
}) {
  return {
    id: `${completedAt}-${runId}-1`,
    reportVersion: '0.2.0',
    ok: true,
    status: 0,
    startedAt,
    completedAt,
    totalDurationSeconds: 60,
    failedStepName: null,
    passedStepCount: 7,
    failedStepCount: 0,
    skippedStepCount: 0,
    stepCount: 7,
    qualifiedForReadiness: true,
    context: {
      eventName: 'schedule',
      ref: 'refs/heads/main',
      sha,
      runId,
      runAttempt: '1',
      workflow: 'mainline-acceptance'
    }
  }
}

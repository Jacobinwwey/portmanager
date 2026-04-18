import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { buildHistoryEntry } from '../../scripts/acceptance/confidence.mjs'
import { parseArgs, parseRepositorySpec, syncConfidenceHistory } from '../../scripts/acceptance/sync-confidence-history.mjs'

test('parseRepositorySpec handles GitHub HTTPS and SSH remotes', () => {
  assert.equal(
    parseRepositorySpec('https://github.com/Jacobinwwey/portmanager.git'),
    'Jacobinwwey/portmanager'
  )
  assert.equal(
    parseRepositorySpec('git@github.com:Jacobinwwey/portmanager.git'),
    'Jacobinwwey/portmanager'
  )
  assert.equal(parseRepositorySpec('https://example.com/not-github.git'), null)
})

test('parseArgs ignores pnpm passthrough separator before options', () => {
  const options = parseArgs(['--', '--limit', '20'])

  assert.equal(options.limit, 20)
})

test('syncConfidenceHistory imports qualified reports and writes readiness summary', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-sync-'))
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    const reportsByRunId = new Map([
      [
        101,
        [
          createReport({
            completedAt: '2026-04-17T10:00:00.000Z',
            startedAt: '2026-04-17T09:59:00.000Z',
            runId: '101',
            runAttempt: '1',
            sha: 'abc101abc101',
            eventName: 'push',
            ok: true
          })
        ]
      ],
      [
        102,
        [
          createReport({
            completedAt: '2026-04-17T11:00:00.000Z',
            startedAt: '2026-04-17T10:59:00.000Z',
            runId: '102',
            runAttempt: '1',
            sha: 'abc102abc102',
            eventName: 'workflow_dispatch',
            ok: false,
            failedStepName: 'Build docs-site publishing layer'
          })
        ]
      ]
    ])

    const result = syncConfidenceHistory({
      repo: 'Jacobinwwey/portmanager',
      historyPath,
      summaryPath,
      replace: true,
      listWorkflowRunsImpl() {
        return [
          { id: 101, event: 'push', conclusion: 'success', run_attempt: 1 },
          { id: 102, event: 'workflow_dispatch', conclusion: 'failure', run_attempt: 1 }
        ]
      },
      downloadRunReportsImpl({ run }) {
        return reportsByRunId.get(run.id) ?? []
      }
    })

    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      totalRuns: number
      failedRuns: number
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
      }
      latestRun: { failedStepName: string | null } | null
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(result.importedRunCount, 2)
    assert.equal(result.importedEntryCount, 2)
    assert.equal(history.totalRuns, 2)
    assert.equal(history.failedRuns, 1)
    assert.equal(history.readiness.status, 'building-history')
    assert.equal(history.readiness.qualifiedRuns, 2)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 0)
    assert.equal(history.latestRun?.failedStepName, 'Build docs-site publishing layer')
    assert.match(summary, /Status: building-history/)
    assert.match(summary, /Failed step: Build docs-site publishing layer/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('syncConfidenceHistory dedupes imported runs against existing history and reaches promotion-ready', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-sync-'))
  const historyPath = path.join(reportDirectory, 'milestone-confidence-history.json')
  const summaryPath = path.join(reportDirectory, 'milestone-confidence-summary.md')

  try {
    const existingEntries = Array.from({ length: 6 }, (_, index) =>
      buildHistoryEntry(
        createReport({
          completedAt: `2026-04-${String(10 + index).padStart(2, '0')}T00:00:00.000Z`,
          startedAt: `2026-04-${String(9 + index).padStart(2, '0')}T23:59:00.000Z`,
          runId: String(200 + index),
          runAttempt: '1',
          sha: `seedsha${index + 1}`.padEnd(12, '0'),
          eventName: 'push',
          ok: true
        })
      )
    )

    writeFileSync(
      historyPath,
      JSON.stringify(
        {
          historyVersion: '0.2.0',
          label: 'Milestone confidence verification',
          updatedAt: existingEntries.at(-1)?.completedAt,
          historyLimit: 30,
          totalRuns: existingEntries.length,
          passedRuns: existingEntries.length,
          failedRuns: 0,
          consecutivePasses: existingEntries.length,
          latestRun: existingEntries.at(-1),
          readiness: {
            readinessVersion: '0.1.0',
            status: 'building-history',
            requiredRef: 'refs/heads/main',
            qualifiedEvents: ['push', 'workflow_dispatch', 'schedule'],
            minimumQualifiedRuns: 7,
            minimumConsecutivePasses: 3,
            qualifiedRuns: existingEntries.length,
            qualifiedPasses: existingEntries.length,
            qualifiedFailures: 0,
            qualifiedConsecutivePasses: existingEntries.length,
            remainingQualifiedRuns: 1,
            remainingConsecutivePasses: 0
          },
          entries: existingEntries
        },
        null,
        2
      ),
      'utf8'
    )

    const duplicateReport = createReport({
      completedAt: existingEntries[5]!.completedAt,
      startedAt: existingEntries[5]!.startedAt,
      runId: existingEntries[5]!.context.runId ?? '205',
      runAttempt: existingEntries[5]!.context.runAttempt ?? '1',
      sha: existingEntries[5]!.context.sha ?? 'seedsha6',
      eventName: 'push',
      ok: true
    })
    const newReport = createReport({
      completedAt: '2026-04-16T00:00:00.000Z',
      startedAt: '2026-04-15T23:59:00.000Z',
      runId: '299',
      runAttempt: '1',
      sha: 'readysha2999',
      eventName: 'schedule',
      ok: true
    })

    const result = syncConfidenceHistory({
      repo: 'Jacobinwwey/portmanager',
      historyPath,
      summaryPath,
      listWorkflowRunsImpl() {
        return [
          { id: 205, event: 'push', conclusion: 'success', run_attempt: 1 },
          { id: 299, event: 'schedule', conclusion: 'success', run_attempt: 1 }
        ]
      },
      downloadRunReportsImpl({ run }) {
        if (run.id === 205) {
          return [duplicateReport]
        }

        if (run.id === 299) {
          return [newReport]
        }

        return []
      }
    })

    const history = JSON.parse(readFileSync(historyPath, 'utf8')) as {
      totalRuns: number
      readiness: {
        status: string
        qualifiedRuns: number
        qualifiedConsecutivePasses: number
        remainingQualifiedRuns: number
      }
    }
    const summary = readFileSync(summaryPath, 'utf8')

    assert.equal(result.importedRunCount, 2)
    assert.equal(result.importedEntryCount, 2)
    assert.equal(history.totalRuns, 7)
    assert.equal(history.readiness.status, 'promotion-ready')
    assert.equal(history.readiness.qualifiedRuns, 7)
    assert.equal(history.readiness.qualifiedConsecutivePasses, 7)
    assert.equal(history.readiness.remainingQualifiedRuns, 0)
    assert.match(summary, /Status: promotion-ready/)
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

function createReport({
  completedAt,
  startedAt,
  runId,
  runAttempt,
  sha,
  eventName,
  ok,
  failedStepName = null
}: {
  completedAt: string
  startedAt: string
  runId: string
  runAttempt: string
  sha: string
  eventName: string
  ok: boolean
  failedStepName?: string | null
}) {
  return {
    reportVersion: '0.2.0',
    label: 'Milestone confidence verification',
    ok,
    status: ok ? 0 : 1,
    startedAt,
    completedAt,
    totalDurationSeconds: 60,
    context: {
      eventName,
      ref: 'refs/heads/main',
      sha,
      runId,
      runAttempt,
      workflow: 'mainline-acceptance'
    },
    qualifiedForReadiness: true,
    failedStepName,
    steps: [
      {
        index: 1,
        name: 'Run JavaScript and TypeScript tests',
        command: 'pnpm',
        args: ['test'],
        status: ok ? 'passed' : 'failed',
        durationSeconds: 60
      }
    ]
  }
}

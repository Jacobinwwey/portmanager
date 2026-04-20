import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { buildHistoryEntry, buildHistorySnapshotFromEntries } from '../../scripts/acceptance/confidence.mjs'
import {
  buildConfidenceReview,
  parseArgs,
  parseGeneratedProgressArtifact,
  reviewConfidence
} from '../../scripts/acceptance/review-confidence.mjs'

test('parseArgs accepts strict published countdown matching flag', () => {
  const options = parseArgs(['--', '--require-published-countdown-match', '--print-digest'])

  assert.equal(options.requirePublishedCountdownMatch, true)
  assert.equal(options.printDigest, true)
})

test('parseGeneratedProgressArtifact reads generated milestone confidence data', () => {
  const artifact = parseGeneratedProgressArtifact(`/* generated */\nexport const milestoneConfidenceProgress = {\n  \"updatedAt\": \"2026-04-20T03:00:00.000Z\",\n  \"trackedRuns\": 5,\n  \"passedRuns\": 5,\n  \"failedRuns\": 0,\n  \"consecutivePasses\": 5,\n  \"readiness\": {\n    \"status\": \"building-history\",\n    \"minimumQualifiedRuns\": 7,\n    \"minimumConsecutivePasses\": 3,\n    \"qualifiedRuns\": 5,\n    \"qualifiedConsecutivePasses\": 5,\n    \"remainingQualifiedRuns\": 2,\n    \"remainingConsecutivePasses\": 0\n  },\n  \"visibility\": {\n    \"qualifiedRuns\": 5,\n    \"visibilityOnlyRuns\": 0,\n    \"localVisibilityOnlyRuns\": 0,\n    \"nonQualifiedRemoteRuns\": 0\n  },\n  \"latestRun\": null,\n  \"latestQualifiedRun\": null\n} as const\n`)

  assert.equal(artifact.readiness.qualifiedRuns, 5)
  assert.equal(artifact.visibility.qualifiedRuns, 5)
})

test('reviewConfidence writes aligned digest when local and published countdown match', () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-review-'))
  const historyPath = path.join(sandbox, 'milestone-confidence-history.json')
  const publishedDataPath = path.join(sandbox, 'milestone-confidence-progress.ts')
  const reviewPath = path.join(sandbox, 'milestone-confidence-review.md')

  try {
    const snapshot = buildHistorySnapshotFromEntries({
      label: 'Milestone confidence verification',
      entries: [
        buildHistoryEntry(createReport({
          completedAt: '2026-04-20T02:20:53.691Z',
          startedAt: '2026-04-20T02:20:11.000Z',
          runId: '24645377989',
          sha: 'cd255d438c7d4912',
          eventName: 'push',
          ok: true
        })),
        buildHistoryEntry(createReport({
          completedAt: '2026-04-20T02:36:18.876Z',
          startedAt: '2026-04-20T02:35:36.000Z',
          runId: '24645746838',
          sha: '1d34a96cd2242340',
          eventName: 'push',
          ok: true
        }))
      ],
      updatedAt: '2026-04-20T02:36:18.876Z'
    })

    writeFileSync(historyPath, JSON.stringify(snapshot, null, 2), 'utf8')
    writeFileSync(
      publishedDataPath,
      createPublishedArtifact(snapshotToPublished(snapshot)),
      'utf8'
    )

    const { review, digest } = reviewConfidence({
      historyPath,
      publishedDataPath,
      reviewPath,
      generatedAt: '2026-04-20T03:00:00.000Z'
    })

    assert.equal(review.countdownAligned, true)
    assert.equal(review.fullSnapshotAligned, true)
    assert.equal(review.publicationDriftKind, 'aligned')
    assert.match(digest, /Qualified countdown aligned: yes/)
    assert.match(digest, /Full snapshot aligned: yes/)
    assert.match(readFileSync(reviewPath, 'utf8'), /Milestone Confidence Review Digest/)
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

test('buildConfidenceReview distinguishes local visibility drift from countdown drift', () => {
  const baseSnapshot = buildHistorySnapshotFromEntries({
    label: 'Milestone confidence verification',
    entries: [
      buildHistoryEntry(createReport({
        completedAt: '2026-04-20T02:20:53.691Z',
        startedAt: '2026-04-20T02:20:11.000Z',
        runId: '24645377989',
        sha: 'cd255d438c7d4912',
        eventName: 'push',
        ok: true
      })),
      buildHistoryEntry(createReport({
        completedAt: '2026-04-20T02:36:18.876Z',
        startedAt: '2026-04-20T02:35:36.000Z',
        runId: '24645746838',
        sha: '1d34a96cd2242340',
        eventName: 'push',
        ok: true
      }))
    ],
    updatedAt: '2026-04-20T02:36:18.876Z'
  })
  const localSnapshot = buildHistorySnapshotFromEntries({
    label: 'Milestone confidence verification',
    entries: [
      ...baseSnapshot.entries,
      buildHistoryEntry(createReport({
        completedAt: '2026-04-20T03:10:00.000Z',
        startedAt: '2026-04-20T03:09:00.000Z',
        runId: null,
        sha: null,
        eventName: null,
        ok: true
      }))
    ],
    updatedAt: '2026-04-20T03:10:00.000Z'
  })

  const review = buildConfidenceReview({
    historySnapshot: localSnapshot,
    publishedProgress: snapshotToPublished(baseSnapshot),
    generatedAt: '2026-04-20T03:20:00.000Z'
  })

  assert.equal(review.countdownAligned, true)
  assert.equal(review.fullSnapshotAligned, false)
  assert.equal(review.publicationDriftKind, 'local-visibility-drift')
  assert.match(
    review.recommendation,
    /Published countdown still matches local mainline evidence/
  )
})

test('reviewConfidence strict mode fails when published countdown lags local synced history', () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-review-'))
  const historyPath = path.join(sandbox, 'milestone-confidence-history.json')
  const publishedDataPath = path.join(sandbox, 'milestone-confidence-progress.ts')

  try {
    const localSnapshot = buildHistorySnapshotFromEntries({
      label: 'Milestone confidence verification',
      entries: [
        buildHistoryEntry(createReport({
          completedAt: '2026-04-20T02:20:53.691Z',
          startedAt: '2026-04-20T02:20:11.000Z',
          runId: '24645377989',
          sha: 'cd255d438c7d4912',
          eventName: 'push',
          ok: true
        })),
        buildHistoryEntry(createReport({
          completedAt: '2026-04-20T02:36:18.876Z',
          startedAt: '2026-04-20T02:35:36.000Z',
          runId: '24645746838',
          sha: '1d34a96cd2242340',
          eventName: 'push',
          ok: true
        })),
        buildHistoryEntry(createReport({
          completedAt: '2026-04-20T02:42:53.420Z',
          startedAt: '2026-04-20T02:42:11.000Z',
          runId: '24645898239',
          sha: '22b7820ead23f72e',
          eventName: 'push',
          ok: true
        }))
      ],
      updatedAt: '2026-04-20T02:42:53.420Z'
    })
    const publishedSnapshot = buildHistorySnapshotFromEntries({
      label: 'Milestone confidence verification',
      entries: localSnapshot.entries.slice(0, 2),
      updatedAt: '2026-04-20T02:36:18.876Z'
    })

    writeFileSync(historyPath, JSON.stringify(localSnapshot, null, 2), 'utf8')
    writeFileSync(
      publishedDataPath,
      createPublishedArtifact(snapshotToPublished(publishedSnapshot)),
      'utf8'
    )

    assert.throws(
      () =>
        reviewConfidence({
          historyPath,
          publishedDataPath,
          requirePublishedCountdownMatch: true
        }),
      /Published countdown does not match local synced confidence history/
    )
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

function createReport({
  completedAt,
  startedAt,
  runId,
  sha,
  eventName,
  ok
}: {
  completedAt: string
  startedAt: string
  runId: string | null
  sha: string | null
  eventName: string | null
  ok: boolean
}) {
  return {
    reportVersion: '0.2.0',
    label: 'Milestone confidence verification',
    ok,
    status: ok ? 0 : 1,
    startedAt,
    completedAt,
    totalDurationSeconds: 42,
    context: {
      eventName,
      ref: eventName ? 'refs/heads/main' : null,
      sha,
      runId,
      runAttempt: runId ? '1' : null,
      workflow: runId ? 'mainline-acceptance' : 'local'
    },
    qualifiedForReadiness: Boolean(runId),
    failedStepName: null,
    steps: [
      {
        index: 1,
        name: 'Run JavaScript and TypeScript tests',
        command: 'pnpm',
        args: ['test'],
        status: ok ? 'passed' : 'failed',
        durationSeconds: 42
      }
    ]
  }
}

function snapshotToPublished(snapshot) {
  return {
    updatedAt: snapshot.updatedAt,
    trackedRuns: snapshot.totalRuns,
    passedRuns: snapshot.passedRuns,
    failedRuns: snapshot.failedRuns,
    consecutivePasses: snapshot.consecutivePasses,
    readiness: snapshot.readiness,
    visibility: snapshot.visibility,
    latestRun: snapshot.latestRun,
    latestQualifiedRun: snapshot.latestQualifiedRun,
    recentRuns: [...snapshot.entries].reverse().slice(0, 10),
    sourceFiles: {
      historyPath: '.portmanager/reports/milestone-confidence-history.json',
      summaryPath: '.portmanager/reports/milestone-confidence-summary.md',
      reportPath: '.portmanager/reports/milestone-confidence-report.json'
    },
    publication: {
      trackedDataPath: 'docs-site/data/milestone-confidence-progress.ts',
      defaultMode: 'reuse-committed-artifact',
      explicitRefreshFlag: '--refresh-confidence-progress',
      refreshCommand: 'pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence'
    }
  }
}

function createPublishedArtifact(progress) {
  return `/* generated */\n\nexport const milestoneConfidenceProgress = ${JSON.stringify(progress, null, 2)} as const\n`
}

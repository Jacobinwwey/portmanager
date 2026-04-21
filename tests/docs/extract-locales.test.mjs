import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateMilestoneConfidenceProgressData } from '../../scripts/docs/extract-locales.mjs'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

function buildHistoryFixture(updatedAt = '2026-04-18T06:14:08.370Z') {
  return {
    updatedAt,
    totalRuns: 4,
    passedRuns: 4,
    failedRuns: 0,
    consecutivePasses: 4,
    readiness: {
      readinessVersion: '0.1.0',
      status: 'building-history',
      requiredRef: 'refs/heads/main',
      qualifiedEvents: ['push', 'workflow_dispatch', 'schedule'],
      minimumQualifiedRuns: 7,
      minimumConsecutivePasses: 3,
      qualifiedRuns: 1,
      qualifiedPasses: 1,
      qualifiedFailures: 0,
      qualifiedConsecutivePasses: 1,
      remainingQualifiedRuns: 6,
      remainingConsecutivePasses: 2
    },
    visibility: {
      qualifiedRuns: 1,
      visibilityOnlyRuns: 3,
      localVisibilityOnlyRuns: 3,
      nonQualifiedRemoteRuns: 0
    },
    latestRun: {
      id: `${updatedAt}-local-0`,
      ok: true,
      qualifiedForReadiness: false,
      completedAt: updatedAt,
      totalDurationSeconds: 54.333,
      failedStepName: null,
      context: {
        eventName: null,
        ref: null,
        sha: null,
        runId: null,
        runAttempt: null,
        workflow: null
      }
    },
    latestQualifiedRun: {
      id: '2026-04-18T02:38:43.991Z-24595022905-1',
      ok: true,
      qualifiedForReadiness: true,
      completedAt: '2026-04-18T02:38:43.991Z',
      totalDurationSeconds: 41.196,
      failedStepName: null,
      context: {
        eventName: 'push',
        ref: 'refs/heads/main',
        sha: 'a5075a78c6f40ef27cf123c2a2e559c5044d6936',
        runId: '24595022905',
        runAttempt: '1',
        workflow: 'mainline-acceptance'
      }
    },
    entries: []
  }
}

async function createSandbox(t) {
  const sandboxRoot = await mkdtemp(path.join(repoRoot, '.tmp-extract-locales-'))
  t.after(async () => {
    await rm(sandboxRoot, { recursive: true, force: true })
  })

  const historyPath = path.join(sandboxRoot, 'reports', 'milestone-confidence-history.json')
  const wordingReviewPath = path.join(sandboxRoot, 'reports', 'milestone-wording-review.md')
  const reviewPackManifestPath = path.join(
    sandboxRoot,
    'reports',
    'current-ci-review-pack',
    'review-pack-manifest.json'
  )
  const generatedDataPath = path.join(sandboxRoot, 'docs-site', 'data', 'milestone-confidence-progress.ts')
  await mkdir(path.dirname(historyPath), { recursive: true })
  await mkdir(path.dirname(reviewPackManifestPath), { recursive: true })
  await mkdir(path.dirname(generatedDataPath), { recursive: true })

  return { historyPath, wordingReviewPath, reviewPackManifestPath, generatedDataPath }
}

test('default docs generation reuses the committed confidence artifact even when local history exists', async (t) => {
  const { historyPath, generatedDataPath } = await createSandbox(t)
  const committedArtifact = '/* committed artifact */\nexport const milestoneConfidenceProgress = { trackedRuns: 3 } as const\n'

  await writeFile(generatedDataPath, committedArtifact, 'utf8')
  await writeFile(historyPath, JSON.stringify(buildHistoryFixture(), null, 2), 'utf8')

  const status = await generateMilestoneConfidenceProgressData({
    refreshConfidenceProgress: false,
    confidenceHistorySourcePath: historyPath,
    generatedDataPath
  })

  assert.equal(status, 'reused')
  assert.equal(await readFile(generatedDataPath, 'utf8'), committedArtifact)
})

test('explicit confidence refresh regenerates the committed artifact from local history', async (t) => {
  const { historyPath, wordingReviewPath, reviewPackManifestPath, generatedDataPath } = await createSandbox(t)

  await writeFile(generatedDataPath, '/* stale artifact */\n', 'utf8')
  await writeFile(
    historyPath,
    JSON.stringify(buildHistoryFixture('2026-04-18T08:08:08.000Z'), null, 2),
    'utf8'
  )
  await writeFile(
    wordingReviewPath,
    [
      '# Milestone Wording Review Checklist',
      '',
      '## Confidence Gate',
      '- Wording review allowed: yes',
      '',
      '## Claim Posture',
      '- Public claim class: promotion-ready-reviewed',
      '- Required next action: Review milestone wording against helper outputs.',
      '',
      '## Source Surface Status',
      '| Surface | Claim status | Review instruction |',
      '| --- | --- | --- |',
      '| docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue | development-progress-counter-surface | Keep developer review guidance visible. |',
      '| docs-site/.vitepress/theme/components/RoadmapPage.vue | roadmap-preview-surface | Keep roadmap preview aligned. |',
      ''
    ].join('\n'),
    'utf8'
  )
  await writeFile(
    reviewPackManifestPath,
    JSON.stringify({
      manifestVersion: '0.1.0',
      fetchedAt: '2026-04-21T06:33:31.931Z',
      repo: 'Jacobinwwey/portmanager',
      workflowRef: 'mainline-acceptance.yml',
      branch: 'main',
      artifactPattern: 'milestone-confidence-bundle-*',
      outputDir: '/tmp/sandbox/.portmanager/reports/current-ci-review-pack',
      sourceRun: {
        id: 24706987559,
        attempt: 1,
        event: 'push',
        conclusion: 'success',
        status: 'completed',
        htmlUrl: 'https://github.com/Jacobinwwey/portmanager/actions/runs/24706987559',
        workflowUrl: 'https://api.github.com/repos/Jacobinwwey/portmanager/actions/workflows/262328672',
        headSha: '68d94be0e61b816a6294173e6c6ecbbe04495c28',
        createdAt: '2026-04-21T06:09:40Z',
        updatedAt: '2026-04-21T06:11:54Z'
      },
      files: {
        required: {
          'milestone-confidence-review.md': {
            localPath: '/tmp/sandbox/.portmanager/reports/current-ci-review-pack/milestone-confidence-review.md'
          },
          'milestone-wording-review.md': {
            localPath: '/tmp/sandbox/.portmanager/reports/current-ci-review-pack/milestone-wording-review.md'
          }
        },
        optional: {
          'milestone-confidence-summary.md': {
            localPath: '/tmp/sandbox/.portmanager/reports/current-ci-review-pack/milestone-confidence-summary.md'
          }
        }
      }
    }, null, 2),
    'utf8'
  )

  const status = await generateMilestoneConfidenceProgressData({
    refreshConfidenceProgress: true,
    confidenceHistorySourcePath: historyPath,
    wordingReviewSourcePath: wordingReviewPath,
    reviewPackManifestSourcePath: reviewPackManifestPath,
    generatedDataPath
  })

  const refreshedArtifact = await readFile(generatedDataPath, 'utf8')

  assert.equal(status, 'refreshed')
  assert.match(refreshedArtifact, /"updatedAt": "2026-04-18T08:08:08.000Z"/)
  assert.match(refreshedArtifact, /"defaultMode": "reuse-committed-artifact"/)
  assert.match(
    refreshedArtifact,
    /"refreshCommand": "pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence"/
  )
  assert.match(refreshedArtifact, /"publicClaimClass": "promotion-ready-reviewed"/)
  assert.match(refreshedArtifact, /"wordingReviewAllowed": true/)
  assert.match(refreshedArtifact, /"requiredNextAction": "Review milestone wording against helper outputs\."/)
  assert.match(refreshedArtifact, /"development-progress-counter-surface"/)
  assert.match(refreshedArtifact, /"currentReviewPack"/)
  assert.match(refreshedArtifact, /"manifestPath": "\.portmanager\/reports\/current-ci-review-pack\/review-pack-manifest\.json"/)
  assert.match(refreshedArtifact, /"helperCommand": "pnpm milestone:fetch:review-pack"/)
  assert.match(refreshedArtifact, /"id": 24706987559/)
  assert.match(refreshedArtifact, /"milestone-confidence-review\.md": "\.portmanager\/reports\/current-ci-review-pack\/milestone-confidence-review\.md"/)
})

test('explicit confidence refresh still succeeds when wording-review artifact is unavailable', async (t) => {
  const { historyPath, wordingReviewPath, reviewPackManifestPath, generatedDataPath } = await createSandbox(t)

  await writeFile(
    historyPath,
    JSON.stringify(buildHistoryFixture('2026-04-18T08:08:08.000Z'), null, 2),
    'utf8'
  )

  const status = await generateMilestoneConfidenceProgressData({
    refreshConfidenceProgress: true,
    confidenceHistorySourcePath: historyPath,
    wordingReviewSourcePath: wordingReviewPath,
    reviewPackManifestSourcePath: reviewPackManifestPath,
    generatedDataPath
  })

  const refreshedArtifact = await readFile(generatedDataPath, 'utf8')

  assert.equal(status, 'refreshed')
  assert.match(refreshedArtifact, /"wordingReview": null/)
  assert.match(refreshedArtifact, /"currentReviewPack": null/)
})

test('explicit confidence refresh fails when local history is unavailable', async (t) => {
  const { historyPath, generatedDataPath } = await createSandbox(t)

  await assert.rejects(
    generateMilestoneConfidenceProgressData({
      refreshConfidenceProgress: true,
      confidenceHistorySourcePath: historyPath,
      generatedDataPath
    }),
    /Explicit confidence progress refresh requested but \.portmanager milestone confidence history is unavailable/
  )
})

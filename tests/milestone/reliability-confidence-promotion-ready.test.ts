import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMilestoneWordingReview,
  parseArgs,
  renderPromotionReadyReview,
  reviewPromotionReady
} from '../../scripts/acceptance/review-promotion-ready.mjs'

test('parseArgs accepts wording-review flags, refresh flag, print flag, and limit override', () => {
  const options = parseArgs([
    '--',
    '--limit',
    '12',
    '--wording-review-path',
    'tmp/wording.md',
    '--refresh-published-artifact',
    '--print-digest',
    '--skip-wording-review'
  ])

  assert.equal(options.limit, 12)
  assert.equal(options.refreshPublishedArtifact, true)
  assert.equal(options.printDigest, true)
  assert.match(options.wordingReviewPath, /tmp\/wording\.md$/)
  assert.equal(options.skipWordingReview, true)
})

test('reviewPromotionReady syncs and reviews without refresh by default', () => {
  const calls = {
    sync: [],
    review: [],
    refresh: 0,
    wording: []
  }

  const initialReview = createReviewResult({
    publicationDriftKind: 'aligned',
    countdownAligned: true,
    fullSnapshotAligned: true
  })

  const result = reviewPromotionReady({
    limit: 14,
    syncConfidenceHistoryImpl(options) {
      calls.sync.push(options)
      return { snapshot: { readiness: { status: 'promotion-ready' } } }
    },
    reviewConfidenceImpl(options) {
      calls.review.push(options)
      return initialReview
    },
    refreshPublishedConfidenceArtifactImpl() {
      calls.refresh += 1
    },
    writeMilestoneWordingReviewImpl(options) {
      calls.wording.push(options)
      return { path: '/tmp/milestone-wording-review.md', content: '# wording\n', allowed: true }
    }
  })

  assert.equal(calls.sync.length, 1)
  assert.equal(calls.sync[0].limit, 14)
  assert.equal(calls.review.length, 1)
  assert.equal(calls.refresh, 0)
  assert.equal(calls.wording.length, 1)
  assert.equal(result.refreshedArtifact, false)
  assert.equal(result.finalReview.review.countdownAligned, true)
  assert.equal(result.wordingReview?.path, '/tmp/milestone-wording-review.md')
})

test('reviewPromotionReady refreshes published artifact and reruns strict review when requested', () => {
  const calls = {
    review: [],
    refresh: 0,
    wording: 0
  }

  const firstReview = createReviewResult({
    publicationDriftKind: 'countdown-drift',
    countdownAligned: false,
    fullSnapshotAligned: false
  })
  const secondReview = createReviewResult({
    publicationDriftKind: 'aligned',
    countdownAligned: true,
    fullSnapshotAligned: true
  })

  const result = reviewPromotionReady({
    refreshPublishedArtifact: true,
    syncConfidenceHistoryImpl() {
      return { snapshot: { readiness: { status: 'promotion-ready' } } }
    },
    reviewConfidenceImpl(options) {
      calls.review.push(options)
      return calls.review.length === 1 ? firstReview : secondReview
    },
    refreshPublishedConfidenceArtifactImpl() {
      calls.refresh += 1
    },
    writeMilestoneWordingReviewImpl() {
      calls.wording += 1
      return { path: '/tmp/milestone-wording-review.md', content: '# wording\n', allowed: true }
    }
  })

  assert.equal(calls.review.length, 2)
  assert.equal(calls.review[1].requirePublishedCountdownMatch, true)
  assert.equal(calls.refresh, 1)
  assert.equal(calls.wording, 1)
  assert.equal(result.refreshedArtifact, true)
  assert.equal(result.finalReview.review.countdownAligned, true)
})

test('reviewPromotionReady skips refresh when explicit publish flag is set but countdown is already aligned', () => {
  const calls = {
    review: [],
    refresh: 0,
    wording: 0
  }

  const alignedReview = createReviewResult({
    publicationDriftKind: 'aligned',
    countdownAligned: true,
    fullSnapshotAligned: true
  })

  const result = reviewPromotionReady({
    refreshPublishedArtifact: true,
    syncConfidenceHistoryImpl() {
      return { snapshot: { readiness: { status: 'promotion-ready' } } }
    },
    reviewConfidenceImpl(options) {
      calls.review.push(options)
      return alignedReview
    },
    refreshPublishedConfidenceArtifactImpl() {
      calls.refresh += 1
    },
    writeMilestoneWordingReviewImpl() {
      calls.wording += 1
      return { path: '/tmp/milestone-wording-review.md', content: '# wording\n', allowed: true }
    }
  })

  assert.equal(calls.review.length, 2)
  assert.equal(calls.refresh, 0)
  assert.equal(calls.wording, 1)
  assert.equal(result.refreshedArtifact, false)
  assert.match(renderPromotionReadyReview(result), /Qualified countdown aligned: yes/)
  assert.match(renderPromotionReadyReview(result), /Wording review path: \/tmp\/milestone-wording-review\.md/)
})

test('reviewPromotionReady can skip wording-review artifact writes for dry review runs', () => {
  const calls = {
    wording: 0
  }

  const result = reviewPromotionReady({
    skipWordingReview: true,
    syncConfidenceHistoryImpl() {
      return { snapshot: { readiness: { status: 'promotion-ready' } } }
    },
    reviewConfidenceImpl() {
      return createReviewResult({
        publicationDriftKind: 'aligned',
        countdownAligned: true,
        fullSnapshotAligned: true
      })
    },
    writeMilestoneWordingReviewImpl() {
      calls.wording += 1
      return { path: '/tmp/milestone-wording-review.md', content: '# wording\n', allowed: true }
    }
  })

  assert.equal(calls.wording, 0)
  assert.equal(result.wordingReview, null)
  assert.match(renderPromotionReadyReview(result), /Wording review path: skipped/)
})

test('buildMilestoneWordingReview renders human review checklist from aligned promotion-ready evidence', () => {
  const wordingReview = buildMilestoneWordingReview({
    review: createReviewResult({
      publicationDriftKind: 'aligned',
      countdownAligned: true,
      fullSnapshotAligned: true
    }).review,
    wordingReviewPath: '/tmp/milestone-wording-review.md',
    generatedAt: '2026-04-21T04:10:00.000Z'
  })

  assert.equal(wordingReview.allowed, true)
  assert.match(wordingReview.content, /Wording review allowed: yes/)
  assert.match(wordingReview.content, /Public claim class: promotion-ready-reviewed/)
  assert.match(
    wordingReview.content,
    /Public wording claim: Public roadmap wording may stay at promotion-ready while exact counters remain on the development-progress page and tracked confidence artifact\./
  )
  assert.match(wordingReview.content, /Do not claim Milestone 2 is complete solely from confidence thresholds\./)
  assert.match(wordingReview.content, /README\.md/)
  assert.match(wordingReview.content, /docs\/specs\/portmanager-milestones\.md/)
})

test('buildMilestoneWordingReview marks countdown drift as refresh-required public claim posture', () => {
  const wordingReview = buildMilestoneWordingReview({
    review: createReviewResult({
      publicationDriftKind: 'countdown-drift',
      countdownAligned: false,
      fullSnapshotAligned: false
    }).review,
    wordingReviewPath: '/tmp/milestone-wording-review.md',
    generatedAt: '2026-04-21T04:10:00.000Z'
  })

  assert.equal(wordingReview.allowed, false)
  assert.match(wordingReview.content, /Public claim class: promotion-ready-refresh-required/)
  assert.match(
    wordingReview.content,
    /Required next action: Refresh the tracked confidence artifact through `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` before narrowing public milestone wording\./
  )
  assert.match(
    wordingReview.content,
    /Blocked claim: Public pages already show the latest qualified run\./
  )
})

function createReviewResult({
  publicationDriftKind,
  countdownAligned,
  fullSnapshotAligned
}: {
  publicationDriftKind: string
  countdownAligned: boolean
  fullSnapshotAligned: boolean
}) {
  return {
    review: {
      reviewPath: '/tmp/milestone-confidence-review.md',
      verificationReportPath: '/tmp/verification.md',
      publicationDriftKind,
      countdownAligned,
      fullSnapshotAligned,
      local: {
        readiness: {
          status: 'promotion-ready',
          qualifiedRuns: 7,
          minimumQualifiedRuns: 7,
          qualifiedConsecutivePasses: 7,
          minimumConsecutivePasses: 3,
          remainingQualifiedRuns: 0,
          remainingConsecutivePasses: 0
        },
        latestQualifiedRun: {
          context: {
            runId: '401',
            runAttempt: '1',
            sha: 'abcdef1234567890'
          }
        }
      },
      publicClaimClass: countdownAligned
        ? 'promotion-ready-reviewed'
        : 'promotion-ready-refresh-required',
      wordingReviewAllowed: countdownAligned,
      requiredNextAction: countdownAligned
        ? 'Review milestone wording against the verification report and helper outputs before merging public wording changes.'
        : 'Refresh the tracked confidence artifact through `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` before narrowing public milestone wording.',
      published: {
        readiness: {
          status: 'promotion-ready',
          qualifiedRuns: 7,
          minimumQualifiedRuns: 7,
          qualifiedConsecutivePasses: 7,
          minimumConsecutivePasses: 3
        },
        latestQualifiedRun: {
          context: {
            runId: '401',
            runAttempt: '1',
            sha: 'abcdef1234567890'
          }
        },
        latestRun: {
          context: {
            runId: '401',
            runAttempt: '1',
            sha: 'abcdef1234567890'
          }
        }
      },
      latestQualifiedRun: {
        context: {
          runId: '401',
          runAttempt: '1',
          sha: 'abcdef1234567890'
        }
      },
      latestRun: {
        context: {
          runId: '401',
          runAttempt: '1',
          sha: 'abcdef1234567890'
        }
      }
    },
    digest: '# digest\n'
  }
}

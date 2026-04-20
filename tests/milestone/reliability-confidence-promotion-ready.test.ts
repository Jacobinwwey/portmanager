import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseArgs,
  renderPromotionReadyReview,
  reviewPromotionReady
} from '../../scripts/acceptance/review-promotion-ready.mjs'

test('parseArgs accepts refresh flag, print flag, and limit override', () => {
  const options = parseArgs([
    '--',
    '--limit',
    '12',
    '--refresh-published-artifact',
    '--print-digest'
  ])

  assert.equal(options.limit, 12)
  assert.equal(options.refreshPublishedArtifact, true)
  assert.equal(options.printDigest, true)
})

test('reviewPromotionReady syncs and reviews without refresh by default', () => {
  const calls = {
    sync: [],
    review: [],
    refresh: 0
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
    }
  })

  assert.equal(calls.sync.length, 1)
  assert.equal(calls.sync[0].limit, 14)
  assert.equal(calls.review.length, 1)
  assert.equal(calls.refresh, 0)
  assert.equal(result.refreshedArtifact, false)
  assert.equal(result.finalReview.review.countdownAligned, true)
})

test('reviewPromotionReady refreshes published artifact and reruns strict review when requested', () => {
  const calls = {
    review: [],
    refresh: 0
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
    }
  })

  assert.equal(calls.review.length, 2)
  assert.equal(calls.review[1].requirePublishedCountdownMatch, true)
  assert.equal(calls.refresh, 1)
  assert.equal(result.refreshedArtifact, true)
  assert.equal(result.finalReview.review.countdownAligned, true)
})

test('reviewPromotionReady skips refresh when explicit publish flag is set but countdown is already aligned', () => {
  const calls = {
    review: [],
    refresh: 0
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
    }
  })

  assert.equal(calls.review.length, 2)
  assert.equal(calls.refresh, 0)
  assert.equal(result.refreshedArtifact, false)
  assert.match(renderPromotionReadyReview(result), /Qualified countdown aligned: yes/)
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
      publicationDriftKind,
      countdownAligned,
      fullSnapshotAligned,
      local: {
        readiness: {
          status: 'promotion-ready',
          qualifiedRuns: 7,
          minimumQualifiedRuns: 7
        }
      }
    },
    digest: '# digest\n'
  }
}

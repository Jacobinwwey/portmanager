import test from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..', '..')
const reviewPackDataPath = path.join(repoRoot, 'docs-site', 'data', 'review-pack.ts')

test('review-pack completeness helper keeps required and optional file expectations explicit', async () => {
  const reviewPackData = await import(pathToFileURL(reviewPackDataPath).href)

  assert.deepEqual(reviewPackData.reviewPackRequiredFiles, [
    'milestone-confidence-review.md',
    'milestone-wording-review.md'
  ])
  assert.deepEqual(reviewPackData.reviewPackOptionalFiles, [
    'milestone-confidence-history.json',
    'milestone-confidence-report.json',
    'milestone-confidence-summary.md'
  ])

  assert.deepEqual(
    reviewPackData.summarizeReviewPackFiles(
      {
        'milestone-confidence-review.md': '.portmanager/reports/current-ci-review-pack/milestone-confidence-review.md'
      },
      reviewPackData.reviewPackRequiredFiles
    ),
    {
      expected: 2,
      available: 1,
      complete: false,
      missing: ['milestone-wording-review.md']
    }
  )

  assert.deepEqual(
    reviewPackData.summarizeReviewPackFiles(
      {
        'milestone-confidence-history.json': '.portmanager/reports/current-ci-review-pack/milestone-confidence-history.json',
        'milestone-confidence-report.json': '.portmanager/reports/current-ci-review-pack/milestone-confidence-report.json',
        'milestone-confidence-summary.md': '.portmanager/reports/current-ci-review-pack/milestone-confidence-summary.md'
      },
      reviewPackData.reviewPackOptionalFiles
    ),
    {
      expected: 3,
      available: 3,
      complete: true,
      missing: []
    }
  )

  assert.equal(
    reviewPackData.buildReviewPackWorkflowPageUrl(
      'Jacobinwwey/portmanager',
      'mainline-acceptance.yml'
    ),
    'https://github.com/Jacobinwwey/portmanager/actions/workflows/mainline-acceptance.yml'
  )
  assert.equal(reviewPackData.buildReviewPackWorkflowPageUrl(null, 'mainline-acceptance.yml'), null)
  assert.equal(reviewPackData.buildReviewPackWorkflowPageUrl('Jacobinwwey/portmanager', null), null)
})

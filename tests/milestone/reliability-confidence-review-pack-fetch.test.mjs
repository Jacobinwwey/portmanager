import test from 'node:test'
import assert from 'node:assert/strict'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  fetchReviewPack,
  parseArgs
} from '../../scripts/acceptance/fetch-review-pack.mjs'

test('parseArgs accepts run selection, output directory, and pnpm passthrough separator', () => {
  const options = parseArgs([
    '--',
    '--repo',
    'Jacobinwwey/portmanager',
    '--workflow',
    'mainline-acceptance.yml',
    '--branch',
    'main',
    '--limit',
    '12',
    '--pattern',
    'milestone-confidence-bundle-*',
    '--run-id',
    '24702941958',
    '--output-dir',
    'tmp/current-ci-review-pack',
    '--event',
    'push',
    '--event',
    'schedule'
  ])

  assert.equal(options.repo, 'Jacobinwwey/portmanager')
  assert.equal(options.workflowRef, 'mainline-acceptance.yml')
  assert.equal(options.branch, 'main')
  assert.equal(options.limit, 12)
  assert.equal(options.artifactPattern, 'milestone-confidence-bundle-*')
  assert.equal(options.runId, 24702941958)
  assert.match(options.outputDir, /tmp\/current-ci-review-pack$/)
  assert.deepEqual(options.events, ['push', 'schedule'])
})

test('fetchReviewPack stages required and optional review files from latest completed run', () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-review-pack-fetch-'))
  const outputDir = path.join(sandbox, 'current-ci-review-pack')

  try {
    const result = fetchReviewPack({
      repo: 'Jacobinwwey/portmanager',
      outputDir,
      listWorkflowRunsImpl() {
        return [
          {
            id: 24702941958,
            run_attempt: 1,
            event: 'push',
            conclusion: 'success',
            status: 'completed',
            html_url: 'https://github.com/Jacobinwwey/portmanager/actions/runs/24702941958',
            workflow_url:
              'https://api.github.com/repos/Jacobinwwey/portmanager/actions/workflows/123456'
          }
        ]
      },
      downloadArtifactImpl({ run, downloadRoot }) {
        const artifactRoot = path.join(downloadRoot, String(run.id), 'milestone-confidence-bundle')
        const reportsRoot = path.join(artifactRoot, '.portmanager', 'reports')

        mkdirSync(reportsRoot, { recursive: true })
        writeFileSync(path.join(reportsRoot, 'milestone-confidence-review.md'), '# current review\n', 'utf8')
        writeFileSync(path.join(reportsRoot, 'milestone-wording-review.md'), '# wording review\n', 'utf8')
        writeFileSync(
          path.join(reportsRoot, 'milestone-confidence-report.json'),
          JSON.stringify({ ok: true, context: { runId: String(run.id) } }, null, 2),
          'utf8'
        )
        writeFileSync(
          path.join(reportsRoot, 'milestone-confidence-history.json'),
          JSON.stringify({ totalRuns: 16 }, null, 2),
          'utf8'
        )
        writeFileSync(path.join(reportsRoot, 'milestone-confidence-summary.md'), '# summary\n', 'utf8')

        return artifactRoot
      }
    })

    assert.equal(result.run.id, 24702941958)
    assert.ok(existsSync(path.join(outputDir, 'milestone-confidence-review.md')))
    assert.ok(existsSync(path.join(outputDir, 'milestone-wording-review.md')))
    assert.ok(existsSync(path.join(outputDir, 'milestone-confidence-report.json')))
    assert.ok(existsSync(path.join(outputDir, 'milestone-confidence-history.json')))
    assert.ok(existsSync(path.join(outputDir, 'milestone-confidence-summary.md')))
    assert.ok(existsSync(path.join(outputDir, 'review-pack-manifest.json')))

    const manifest = JSON.parse(
      readFileSync(path.join(outputDir, 'review-pack-manifest.json'), 'utf8')
    )

    assert.equal(manifest.repo, 'Jacobinwwey/portmanager')
    assert.equal(manifest.sourceRun.id, 24702941958)
    assert.equal(
      manifest.files.required['milestone-confidence-review.md'].localPath,
      path.join(outputDir, 'milestone-confidence-review.md')
    )
    assert.equal(
      manifest.files.optional['milestone-confidence-summary.md'].localPath,
      path.join(outputDir, 'milestone-confidence-summary.md')
    )
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

test('fetchReviewPack fails clearly when selected run predates review-pack files', () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'portmanager-review-pack-fetch-'))
  const outputDir = path.join(sandbox, 'current-ci-review-pack')

  try {
    assert.throws(
      () =>
        fetchReviewPack({
          repo: 'Jacobinwwey/portmanager',
          runId: 24700000000,
          outputDir,
          getWorkflowRunImpl() {
            return {
              id: 24700000000,
              run_attempt: 1,
              event: 'push',
              conclusion: 'success',
              status: 'completed'
            }
          },
          downloadArtifactImpl({ run, downloadRoot }) {
            const artifactRoot = path.join(downloadRoot, String(run.id), 'milestone-confidence-bundle')
            const reportsRoot = path.join(artifactRoot, '.portmanager', 'reports')

            mkdirSync(reportsRoot, { recursive: true })
            writeFileSync(path.join(reportsRoot, 'milestone-confidence-summary.md'), '# summary\n', 'utf8')

            return artifactRoot
          }
        }),
      /predates the current-run review-pack slice/i
    )
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

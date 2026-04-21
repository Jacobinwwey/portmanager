import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { reviewConfidence } from './review-confidence.mjs'
import { syncConfidenceHistory } from './sync-confidence-history.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const defaultWordingReviewPath = path.join(
  repoRoot,
  '.portmanager',
  'reports',
  'milestone-wording-review.md'
)
const DEFAULT_LIMIT = 20
const DEFAULT_REFRESH_COMMAND = [
  'corepack',
  'pnpm',
  '--dir',
  'docs-site',
  '--ignore-workspace',
  'run',
  'docs:generate:refresh-confidence'
]
const DEFAULT_WORDING_SURFACES = [
  'README.md',
  'TODO.md',
  'Interface Document.md',
  'docs/specs/portmanager-milestones.md',
  'docs/specs/portmanager-v1-product-spec.md',
  'docs/operations/portmanager-real-machine-verification-report.md',
  'docs-site/data/roadmap.ts',
  'docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue',
  'docs-site/.vitepress/theme/components/RoadmapPage.vue'
]

export function parseArgs(argv) {
  const options = {
    limit: DEFAULT_LIMIT,
    refreshPublishedArtifact: false,
    printDigest: false,
    historyPath: undefined,
    summaryPath: undefined,
    publishedDataPath: undefined,
    reviewPath: undefined,
    verificationReportPath: undefined,
    wordingReviewPath: defaultWordingReviewPath,
    skipWordingReview: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--') {
      continue
    }

    if (current === '--limit') {
      options.limit = Number.parseInt(argv[index + 1] ?? String(DEFAULT_LIMIT), 10)
      index += 1
      continue
    }

    if (current === '--history-path') {
      options.historyPath = argv[index + 1]
      index += 1
      continue
    }

    if (current === '--summary-path') {
      options.summaryPath = argv[index + 1]
      index += 1
      continue
    }

    if (current === '--published-data-path') {
      options.publishedDataPath = argv[index + 1]
      index += 1
      continue
    }

    if (current === '--review-path') {
      options.reviewPath = argv[index + 1]
      index += 1
      continue
    }

    if (current === '--verification-report-path') {
      options.verificationReportPath = argv[index + 1]
      index += 1
      continue
    }

    if (current === '--wording-review-path') {
      options.wordingReviewPath = path.resolve(
        repoRoot,
        argv[index + 1] ?? defaultWordingReviewPath
      )
      index += 1
      continue
    }

    if (current === '--refresh-published-artifact') {
      options.refreshPublishedArtifact = true
      continue
    }

    if (current === '--print-digest') {
      options.printDigest = true
      continue
    }

    if (current === '--skip-wording-review') {
      options.skipWordingReview = true
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return options
}

export function refreshPublishedConfidenceArtifact({
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
} = {}) {
  const [command, ...args] = DEFAULT_REFRESH_COMMAND
  const result = spawnSyncImpl(command, args, {
    cwd,
    encoding: 'utf8'
  })

  if (result.error) {
    throw result.error
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(' ')}`,
        result.stdout?.trim(),
        result.stderr?.trim()
      ]
        .filter(Boolean)
        .join('\n')
    )
  }

  return result
}

function formatRun(run) {
  if (!run?.context?.runId) {
    return 'local'
  }

  return `${run.context.runId}/${run.context.runAttempt ?? '1'}`
}

function formatSha(run) {
  return run?.context?.sha ? run.context.sha.slice(0, 12) : 'local'
}

function readinessLine(review) {
  return `${review.local.readiness.qualifiedRuns}/${review.local.readiness.minimumQualifiedRuns}`
}

function consecutiveLine(review) {
  return `${review.local.readiness.qualifiedConsecutivePasses}/${review.local.readiness.minimumConsecutivePasses}`
}

export function buildMilestoneWordingReview({
  review,
  wordingReviewPath = defaultWordingReviewPath,
  generatedAt = new Date().toISOString(),
  wordingSurfaces = DEFAULT_WORDING_SURFACES
}) {
  const wordingReviewAllowed =
    review.local.readiness.status === 'promotion-ready' &&
    review.countdownAligned &&
    review.local.readiness.remainingQualifiedRuns === 0 &&
    review.local.readiness.remainingConsecutivePasses === 0
  const lines = [
    '# Milestone Wording Review Checklist',
    '',
    `Generated: ${generatedAt}`,
    `Confidence review: ${review.reviewPath}`,
    `Verification report: ${review.verificationReportPath}`,
    `Wording review path: ${wordingReviewPath}`,
    '',
    '## Confidence Gate',
    `- Status: ${review.local.readiness.status}`,
    `- Qualified runs: ${readinessLine(review)}`,
    `- Qualified consecutive passes: ${consecutiveLine(review)}`,
    `- Remaining qualified runs: ${review.local.readiness.remainingQualifiedRuns}`,
    `- Remaining qualified pass gap: ${review.local.readiness.remainingConsecutivePasses}`,
    `- Latest qualified run: ${formatRun(review.local.latestQualifiedRun)}`,
    `- Latest qualified SHA: ${formatSha(review.local.latestQualifiedRun)}`,
    `- Published countdown aligned: ${review.countdownAligned ? 'yes' : 'no'}`,
    `- Full snapshot aligned: ${review.fullSnapshotAligned ? 'yes' : 'no'}`,
    `- Wording review allowed: ${wordingReviewAllowed ? 'yes' : 'no'}`,
    '',
    '## Human Review Checklist',
    '- [ ] Keep Milestone 1 wording at accepted public-surface truth.',
    '- [ ] Keep Milestone 2 wording at promotion-ready until human review deliberately narrows it.',
    '- [ ] Do not claim Milestone 2 is complete solely from confidence thresholds.',
    '- [ ] Do not claim Toward C activation from promotion-ready evidence alone.',
    '- [ ] Keep exact counters on the development-progress page and tracked confidence artifact.',
    '- [ ] Re-run `pnpm milestone:review:promotion-ready -- --limit 20` before any public wording change.',
    '- [ ] Re-run `pnpm acceptance:verify` before merging wording changes.',
    '',
    '## Source Surfaces To Review',
    ...wordingSurfaces.map((surface) => `- [ ] ${surface}`),
    ''
  ]

  return {
    allowed: wordingReviewAllowed,
    path: wordingReviewPath,
    content: `${lines.join('\n')}\n`
  }
}

export function writeMilestoneWordingReview({
  review,
  wordingReviewPath = defaultWordingReviewPath,
  generatedAt = new Date().toISOString()
}) {
  const wordingReview = buildMilestoneWordingReview({
    review,
    wordingReviewPath,
    generatedAt
  })

  mkdirSync(path.dirname(wordingReviewPath), { recursive: true })
  writeFileSync(wordingReviewPath, wordingReview.content, 'utf8')

  return wordingReview
}

export function reviewPromotionReady({
  limit = DEFAULT_LIMIT,
  refreshPublishedArtifact = false,
  historyPath,
  summaryPath,
  publishedDataPath,
  reviewPath,
  verificationReportPath,
  wordingReviewPath = defaultWordingReviewPath,
  skipWordingReview = false,
  cwd = repoRoot,
  syncConfidenceHistoryImpl = syncConfidenceHistory,
  reviewConfidenceImpl = reviewConfidence,
  refreshPublishedConfidenceArtifactImpl = refreshPublishedConfidenceArtifact,
  writeMilestoneWordingReviewImpl = writeMilestoneWordingReview
} = {}) {
  const syncResult = syncConfidenceHistoryImpl({
    limit,
    historyPath,
    summaryPath,
    cwd
  })

  const reviewOptions = {
    historyPath,
    publishedDataPath,
    reviewPath,
    verificationReportPath
  }
  const initialReview = reviewConfidenceImpl(reviewOptions)
  let refreshedArtifact = false

  if (refreshPublishedArtifact && !initialReview.review.countdownAligned) {
    refreshPublishedConfidenceArtifactImpl({ cwd })
    refreshedArtifact = true
  }

  const finalReview =
    refreshPublishedArtifact
      ? reviewConfidenceImpl({
          ...reviewOptions,
          requirePublishedCountdownMatch: true
        })
      : initialReview
  const wordingReview = skipWordingReview
    ? null
    : writeMilestoneWordingReviewImpl({
        review: finalReview.review,
        wordingReviewPath
      })

  return {
    syncResult,
    initialReview,
    finalReview,
    refreshedArtifact,
    wordingReview
  }
}

export function renderPromotionReadyReview(result) {
  return [
    'Completed promotion-ready review flow',
    `Readiness status: ${result.finalReview.review.local.readiness.status}`,
    `Qualified runs: ${result.finalReview.review.local.readiness.qualifiedRuns}/${result.finalReview.review.local.readiness.minimumQualifiedRuns}`,
    `Initial drift kind: ${result.initialReview.review.publicationDriftKind}`,
    `Refreshed published artifact: ${result.refreshedArtifact ? 'yes' : 'no'}`,
    `Qualified countdown aligned: ${result.finalReview.review.countdownAligned ? 'yes' : 'no'}`,
    `Full snapshot aligned: ${result.finalReview.review.fullSnapshotAligned ? 'yes' : 'no'}`,
    `Review path: ${result.finalReview.review.reviewPath}`,
    `Wording review path: ${result.wordingReview?.path ?? 'skipped'}`
  ].join('\n')
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const result = reviewPromotionReady(options)

    console.log(renderPromotionReadyReview(result))

    if (options.printDigest) {
      console.log('')
      process.stdout.write(result.finalReview.digest)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}

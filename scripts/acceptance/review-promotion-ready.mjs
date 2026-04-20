import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { reviewConfidence } from './review-confidence.mjs'
import { syncConfidenceHistory } from './sync-confidence-history.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
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

export function parseArgs(argv) {
  const options = {
    limit: DEFAULT_LIMIT,
    refreshPublishedArtifact: false,
    printDigest: false,
    historyPath: undefined,
    summaryPath: undefined,
    publishedDataPath: undefined,
    reviewPath: undefined,
    verificationReportPath: undefined
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

    if (current === '--refresh-published-artifact') {
      options.refreshPublishedArtifact = true
      continue
    }

    if (current === '--print-digest') {
      options.printDigest = true
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

export function reviewPromotionReady({
  limit = DEFAULT_LIMIT,
  refreshPublishedArtifact = false,
  historyPath,
  summaryPath,
  publishedDataPath,
  reviewPath,
  verificationReportPath,
  cwd = repoRoot,
  syncConfidenceHistoryImpl = syncConfidenceHistory,
  reviewConfidenceImpl = reviewConfidence,
  refreshPublishedConfidenceArtifactImpl = refreshPublishedConfidenceArtifact
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

  return {
    syncResult,
    initialReview,
    finalReview,
    refreshedArtifact
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
    `Review path: ${result.finalReview.review.reviewPath}`
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

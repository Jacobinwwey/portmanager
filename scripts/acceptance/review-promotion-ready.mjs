import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildPromotionClaimPosture,
  reviewConfidence
} from './review-confidence.mjs'
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
  { path: 'README.md', kind: 'root-summary' },
  { path: 'TODO.md', kind: 'review-pack' },
  { path: 'Interface Document.md', kind: 'interface-contract' },
  { path: 'docs/specs/portmanager-milestones.md', kind: 'milestone-spec' },
  { path: 'docs/specs/portmanager-v1-product-spec.md', kind: 'product-spec' },
  { path: 'docs/operations/portmanager-real-machine-verification-report.md', kind: 'verification-report' },
  { path: 'docs-site/data/milestone-confidence-progress.ts', kind: 'tracked-counter-source' },
  { path: 'docs-site/data/roadmap.ts', kind: 'roadmap-data' },
  { path: 'docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue', kind: 'development-progress-page' },
  { path: 'docs-site/.vitepress/theme/components/RoadmapPage.vue', kind: 'roadmap-home-page' }
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

function rootSummaryClaimStatus(review) {
  return review.local.readiness.status === 'promotion-ready'
    ? 'promotion-ready-wording-only'
    : 'below-promotion-ready-wording-only'
}

function rootSummaryInstruction(review) {
  if (review.local.readiness.status === 'promotion-ready') {
    return 'Keep public wording at promotion-ready or below on this surface; exact counters stay on the development-progress page and tracked confidence artifact.'
  }

  return 'Keep public wording below promotion-ready on this surface; exact counters stay on the development-progress page and tracked confidence artifact.'
}

function buildSourceSurfaceStatuses(review, wordingSurfaces = DEFAULT_WORDING_SURFACES) {
  return wordingSurfaces.map((surface) => {
    switch (surface.kind) {
      case 'root-summary':
        return {
          path: surface.path,
          claimStatus: rootSummaryClaimStatus(review),
          reviewInstruction: rootSummaryInstruction(review)
        }
      case 'review-pack':
        return {
          path: surface.path,
          claimStatus: 'helper-review-pack',
          reviewInstruction:
            'Keep helper-first review steps plus `Public claim class` and `Source surface status` visible for developers.'
        }
      case 'interface-contract':
        return {
          path: surface.path,
          claimStatus: 'helper-contract',
          reviewInstruction:
            'Keep helper and publication rules exact on this surface; latest counters stay on the tracked confidence artifact instead of this interface summary.'
        }
      case 'milestone-spec':
        return {
          path: surface.path,
          claimStatus: rootSummaryClaimStatus(review),
          reviewInstruction:
            'Keep threshold-met milestone wording deliberate on this surface; exact counters stay on the development-progress page and tracked confidence artifact.'
        }
      case 'product-spec':
        return {
          path: surface.path,
          claimStatus: 'stable-product-boundary',
          reviewInstruction:
            'Keep the product boundary stable on this surface; do not introduce live readiness counters here.'
        }
      case 'verification-report':
        return {
          path: surface.path,
          claimStatus: review.countdownAligned
            ? 'published-evidence'
            : 'published-evidence-before-refresh',
          reviewInstruction: review.countdownAligned
            ? 'Freeze the reviewed published snapshot here and keep it aligned with the tracked confidence artifact.'
            : 'Freeze the last reviewed published snapshot here and record the refresh-required posture instead of inventing newer public counters.'
        }
      case 'tracked-counter-source':
        return {
          path: surface.path,
          claimStatus: review.countdownAligned
            ? 'tracked-counter-source'
            : 'tracked-counter-refresh-required',
          reviewInstruction: review.countdownAligned
            ? 'Exact published counters belong here and on the development-progress page, not in root-doc prose.'
            : 'Tracked public counters lag synced local evidence until the helper refreshes the published artifact.'
        }
      case 'roadmap-data':
        return {
          path: surface.path,
          claimStatus: 'roadmap-copy-review-pack',
          reviewInstruction:
            'Keep roadmap prose pointing developers to `Public claim class`, `Source surface status`, and the development-progress page instead of hard-coded counters.'
        }
      case 'development-progress-page':
        return {
          path: surface.path,
          claimStatus: review.countdownAligned
            ? 'development-progress-counter-surface'
            : 'development-progress-awaiting-refresh',
          reviewInstruction: review.countdownAligned
            ? 'This public page mirrors exact counters from the tracked confidence artifact and should keep developer review guidance visible.'
            : 'This public page mirrors the tracked artifact and therefore stays behind synced local evidence until refresh.'
        }
      case 'roadmap-home-page':
        return {
          path: surface.path,
          claimStatus: review.countdownAligned
            ? 'roadmap-preview-surface'
            : 'roadmap-preview-awaiting-refresh',
          reviewInstruction: review.countdownAligned
            ? 'This roadmap preview should mirror the tracked confidence artifact and link reviewers to the development-progress page plus review pack.'
            : 'This roadmap preview should mirror the tracked public snapshot and avoid implying newer local counters before refresh.'
        }
      default:
        return {
          path: surface.path,
          claimStatus: 'manual-review',
          reviewInstruction: 'Review this surface manually against the helper outputs.'
        }
    }
  })
}

export function buildMilestoneWordingReview({
  review,
  wordingReviewPath = defaultWordingReviewPath,
  generatedAt = new Date().toISOString(),
  wordingSurfaces = DEFAULT_WORDING_SURFACES
}) {
  const claimPosture = buildPromotionClaimPosture(review)
  const sourceSurfaceStatuses = buildSourceSurfaceStatuses(review, wordingSurfaces)
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
    `- Wording review allowed: ${claimPosture.wordingReviewAllowed ? 'yes' : 'no'}`,
    '',
    '## Claim Posture',
    `- Public claim class: ${claimPosture.publicClaimClass}`,
    `- Local evidence claim: ${claimPosture.localEvidenceClaim}`,
    `- Public wording claim: ${claimPosture.publicWordingClaim}`,
    `- Required next action: ${claimPosture.requiredNextAction}`,
    ...claimPosture.blockedClaims.map((claim) => `- Blocked claim: ${claim}`),
    '',
    '## Source Surface Status',
    '| Surface | Claim status | Review instruction |',
    '| --- | --- | --- |',
    ...sourceSurfaceStatuses.map((surface) =>
      `| ${surface.path} | ${surface.claimStatus} | ${surface.reviewInstruction} |`
    ),
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
    ...sourceSurfaceStatuses.map((surface) => `- [ ] ${surface.path}`),
    ''
  ]

  return {
    allowed: claimPosture.wordingReviewAllowed,
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
    `Public claim class: ${result.finalReview.review.publicClaimClass}`,
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

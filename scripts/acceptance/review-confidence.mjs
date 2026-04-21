import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const reportsDirectory = path.resolve(repoRoot, '.portmanager', 'reports')
const defaultHistoryPath = path.join(reportsDirectory, 'milestone-confidence-history.json')
const defaultReviewPath = path.join(reportsDirectory, 'milestone-confidence-review.md')
const defaultPublishedDataPath = path.join(
  repoRoot,
  'docs-site',
  'data',
  'milestone-confidence-progress.ts'
)
const defaultVerificationReportPath = path.join(
  repoRoot,
  'docs',
  'operations',
  'portmanager-real-machine-verification-report.md'
)
const DEFAULT_SYNC_COMMAND = 'pnpm milestone:sync:confidence-history -- --limit 20'
const DEFAULT_REFRESH_COMMAND =
  'pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence'
const DEFAULT_PROMOTION_REVIEW_COMMAND =
  'pnpm milestone:review:promotion-ready -- --limit 20'

export function parseArgs(argv) {
  const options = {
    historyPath: defaultHistoryPath,
    publishedDataPath: defaultPublishedDataPath,
    reviewPath: defaultReviewPath,
    verificationReportPath: defaultVerificationReportPath,
    requirePublishedCountdownMatch: false,
    printDigest: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--') {
      continue
    }

    if (current === '--history-path') {
      options.historyPath = path.resolve(repoRoot, argv[index + 1] ?? defaultHistoryPath)
      index += 1
      continue
    }

    if (current === '--published-data-path') {
      options.publishedDataPath = path.resolve(
        repoRoot,
        argv[index + 1] ?? defaultPublishedDataPath
      )
      index += 1
      continue
    }

    if (current === '--review-path') {
      options.reviewPath = path.resolve(repoRoot, argv[index + 1] ?? defaultReviewPath)
      index += 1
      continue
    }

    if (current === '--verification-report-path') {
      options.verificationReportPath = path.resolve(
        repoRoot,
        argv[index + 1] ?? defaultVerificationReportPath
      )
      index += 1
      continue
    }

    if (current === '--require-published-countdown-match') {
      options.requirePublishedCountdownMatch = true
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

function requireFile(filePath, guidance) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}\n${guidance}`)
  }
}

function readJsonFile(filePath, guidance) {
  requireFile(filePath, guidance)
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

export function parseGeneratedProgressArtifact(sourceText) {
  const match = sourceText.match(
    /export const milestoneConfidenceProgress = (\{[\s\S]*\}) as const/u
  )

  if (!match) {
    throw new Error('Unable to parse milestone confidence progress artifact')
  }

  return JSON.parse(match[1])
}

function readPublishedProgressArtifact(filePath) {
  requireFile(
    filePath,
    `Run \`${DEFAULT_REFRESH_COMMAND}\` after deliberate review if the tracked artifact is missing.`
  )

  return parseGeneratedProgressArtifact(readFileSync(filePath, 'utf8'))
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

function pickCountdownSnapshot(snapshot) {
  return {
    readiness: {
      status: snapshot.readiness.status,
      qualifiedRuns: snapshot.readiness.qualifiedRuns,
      qualifiedConsecutivePasses: snapshot.readiness.qualifiedConsecutivePasses,
      remainingQualifiedRuns: snapshot.readiness.remainingQualifiedRuns,
      remainingConsecutivePasses: snapshot.readiness.remainingConsecutivePasses,
      minimumQualifiedRuns: snapshot.readiness.minimumQualifiedRuns,
      minimumConsecutivePasses: snapshot.readiness.minimumConsecutivePasses
    },
    visibility: {
      qualifiedRuns: snapshot.visibility.qualifiedRuns,
      nonQualifiedRemoteRuns: snapshot.visibility.nonQualifiedRemoteRuns
    },
    latestQualifiedRun: snapshot.latestQualifiedRun
      ? {
          run: formatRun(snapshot.latestQualifiedRun),
          sha: formatSha(snapshot.latestQualifiedRun),
          completedAt: snapshot.latestQualifiedRun.completedAt
        }
      : null
  }
}

function pickFullSnapshot(snapshot) {
  return {
    trackedRuns: snapshot.trackedRuns,
    passedRuns: snapshot.passedRuns,
    failedRuns: snapshot.failedRuns,
    consecutivePasses: snapshot.consecutivePasses,
    visibility: {
      qualifiedRuns: snapshot.visibility.qualifiedRuns,
      visibilityOnlyRuns: snapshot.visibility.visibilityOnlyRuns,
      localVisibilityOnlyRuns: snapshot.visibility.localVisibilityOnlyRuns,
      nonQualifiedRemoteRuns: snapshot.visibility.nonQualifiedRemoteRuns
    },
    latestRun: snapshot.latestRun
      ? {
          run: formatRun(snapshot.latestRun),
          sha: formatSha(snapshot.latestRun),
          completedAt: snapshot.latestRun.completedAt
        }
      : null
  }
}

function buildPublicationDriftKind({ countdownAligned, fullSnapshotAligned }) {
  if (fullSnapshotAligned) {
    return 'aligned'
  }

  if (countdownAligned) {
    return 'local-visibility-drift'
  }

  return 'countdown-drift'
}

function promotionThresholdsMet(readiness) {
  return (
    readiness.status === 'promotion-ready' &&
    readiness.remainingQualifiedRuns === 0 &&
    readiness.remainingConsecutivePasses === 0
  )
}

export function buildPromotionClaimPosture(review) {
  const thresholdsMet = promotionThresholdsMet(review.local.readiness)
  const baseBlockedClaims = [
    'Milestone 2 is complete.',
    'Toward C is active.'
  ]

  if (!thresholdsMet) {
    return {
      publicClaimClass: review.local.readiness.status,
      wordingReviewAllowed: false,
      localEvidenceClaim: 'Milestone 2 is not promotion-ready in synced local evidence yet.',
      publicWordingClaim:
        'Public roadmap wording must stay below promotion-ready until the qualified-run gap reaches zero.',
      requiredNextAction:
        'Keep `pnpm milestone:verify:confidence` and `pnpm acceptance:verify` green until the remaining qualified-run gap closes.',
      blockedClaims: [
        'Milestone 2 is promotion-ready.',
        ...baseBlockedClaims
      ]
    }
  }

  if (!review.countdownAligned) {
    return {
      publicClaimClass: 'promotion-ready-refresh-required',
      wordingReviewAllowed: false,
      localEvidenceClaim: 'Milestone 2 is promotion-ready in synced local evidence.',
      publicWordingClaim:
        'Public roadmap wording must not imply the latest qualified counters until the tracked confidence artifact is refreshed.',
      requiredNextAction:
        `Refresh the tracked confidence artifact through \`${DEFAULT_PROMOTION_REVIEW_COMMAND} --refresh-published-artifact\` before narrowing public milestone wording.`,
      blockedClaims: [
        'Public pages already show the latest qualified run.',
        ...baseBlockedClaims
      ]
    }
  }

  if (!review.fullSnapshotAligned) {
    return {
      publicClaimClass: 'promotion-ready-local-visibility-drift',
      wordingReviewAllowed: true,
      localEvidenceClaim: 'Milestone 2 is promotion-ready in synced local evidence.',
      publicWordingClaim:
        'Public roadmap wording may stay at promotion-ready because the qualified countdown is aligned; refresh only if visibility-only details should match local review noise.',
      requiredNextAction:
        'Review milestone wording against the verification report and helper outputs before merging public wording changes.',
      blockedClaims: baseBlockedClaims
    }
  }

  return {
    publicClaimClass: 'promotion-ready-reviewed',
    wordingReviewAllowed: true,
    localEvidenceClaim: 'Milestone 2 is promotion-ready in synced local evidence.',
    publicWordingClaim:
      'Public roadmap wording may stay at promotion-ready while exact counters remain on the development-progress page and tracked confidence artifact.',
    requiredNextAction:
      'Review milestone wording against the verification report and helper outputs before merging public wording changes.',
    blockedClaims: baseBlockedClaims
  }
}

export function buildConfidenceReview({
  historySnapshot,
  publishedProgress,
  historyPath = defaultHistoryPath,
  publishedDataPath = defaultPublishedDataPath,
  reviewPath = defaultReviewPath,
  verificationReportPath = defaultVerificationReportPath,
  generatedAt = new Date().toISOString()
}) {
  const localSnapshot = {
    trackedRuns: historySnapshot.totalRuns,
    passedRuns: historySnapshot.passedRuns,
    failedRuns: historySnapshot.failedRuns,
    consecutivePasses: historySnapshot.consecutivePasses,
    visibility: historySnapshot.visibility,
    readiness: historySnapshot.readiness,
    latestRun: historySnapshot.latestRun,
    latestQualifiedRun: historySnapshot.latestQualifiedRun
  }

  const publishedSnapshot = {
    trackedRuns: publishedProgress.trackedRuns,
    passedRuns: publishedProgress.passedRuns,
    failedRuns: publishedProgress.failedRuns,
    consecutivePasses: publishedProgress.consecutivePasses,
    visibility: publishedProgress.visibility,
    readiness: publishedProgress.readiness,
    latestRun: publishedProgress.latestRun,
    latestQualifiedRun: publishedProgress.latestQualifiedRun
  }

  const localCountdown = pickCountdownSnapshot(localSnapshot)
  const publishedCountdown = pickCountdownSnapshot(publishedSnapshot)
  const localFullSnapshot = pickFullSnapshot(localSnapshot)
  const publishedFullSnapshot = pickFullSnapshot(publishedSnapshot)
  const countdownAligned =
    JSON.stringify(localCountdown) === JSON.stringify(publishedCountdown)
  const fullSnapshotAligned =
    JSON.stringify(localFullSnapshot) === JSON.stringify(publishedFullSnapshot)
  const publicationDriftKind = buildPublicationDriftKind({
    countdownAligned,
    fullSnapshotAligned
  })
  const claimPosture = buildPromotionClaimPosture({
    local: localSnapshot,
    published: publishedSnapshot,
    countdownAligned,
    fullSnapshotAligned
  })

  let recommendation =
    'Keep milestone wording conservative until remaining qualified runs reach zero.'

  if (historySnapshot.readiness.status === 'promotion-ready' && !countdownAligned) {
    recommendation =
      'Refresh the tracked confidence artifact before narrowing public milestone wording.'
  } else if (historySnapshot.readiness.status === 'promotion-ready') {
    recommendation =
      'Read the verification report and review milestone wording with human judgment.'
  } else if (publicationDriftKind === 'local-visibility-drift') {
    recommendation =
      'Published countdown still matches local mainline evidence. Refresh docs only if you want public visibility details to match local review noise.'
  } else if (publicationDriftKind === 'countdown-drift') {
    recommendation =
      'Published countdown lags local synced evidence. Refresh the tracked docs artifact after deliberate review if public progress should match local countdown state.'
  }

  return {
    generatedAt,
    historyPath,
    publishedDataPath,
    reviewPath,
    verificationReportPath,
    syncCommand: DEFAULT_SYNC_COMMAND,
    refreshCommand: DEFAULT_REFRESH_COMMAND,
    publicationDriftKind,
    countdownAligned,
    fullSnapshotAligned,
    local: localSnapshot,
    published: publishedSnapshot,
    recommendation,
    ...claimPosture
  }
}

export function renderConfidenceReview(review) {
  const lines = [
    '# Milestone Confidence Review Digest',
    '',
    `Generated: ${review.generatedAt}`,
    `History source: ${review.historyPath}`,
    `Published data source: ${review.publishedDataPath}`,
    `Verification report: ${review.verificationReportPath}`,
    `Review digest path: ${review.reviewPath}`,
    '',
    '## Local Synced State',
    `- Status: ${review.local.readiness.status}`,
    `- Qualified runs: ${review.local.readiness.qualifiedRuns}/${review.local.readiness.minimumQualifiedRuns}`,
    `- Qualified consecutive passes: ${review.local.readiness.qualifiedConsecutivePasses}/${review.local.readiness.minimumConsecutivePasses}`,
    `- Remaining qualified runs: ${review.local.readiness.remainingQualifiedRuns}`,
    `- Remaining qualified pass gap: ${review.local.readiness.remainingConsecutivePasses}`,
    `- Latest qualified run: ${formatRun(review.local.latestQualifiedRun)}`,
    `- Latest qualified SHA: ${formatSha(review.local.latestQualifiedRun)}`,
    `- Latest visible run: ${formatRun(review.local.latestRun)}`,
    '',
    '## Published Artifact Alignment',
    `- Drift kind: ${review.publicationDriftKind}`,
    `- Qualified countdown aligned: ${review.countdownAligned ? 'yes' : 'no'}`,
    `- Full snapshot aligned: ${review.fullSnapshotAligned ? 'yes' : 'no'}`,
    `- Published status: ${review.published.readiness.status}`,
    `- Published qualified runs: ${review.published.readiness.qualifiedRuns}/${review.published.readiness.minimumQualifiedRuns}`,
    `- Published qualified consecutive passes: ${review.published.readiness.qualifiedConsecutivePasses}/${review.published.readiness.minimumConsecutivePasses}`,
    `- Published latest qualified run: ${formatRun(review.published.latestQualifiedRun)}`,
    `- Published latest visible run: ${formatRun(review.published.latestRun)}`,
    '',
    '## Review Posture',
    `- Recommendation: ${review.recommendation}`,
    `- Human wording review allowed: ${review.wordingReviewAllowed ? 'yes' : 'no'}`,
    `- Public claim class: ${review.publicClaimClass}`,
    `- Local evidence claim: ${review.localEvidenceClaim}`,
    `- Public wording claim: ${review.publicWordingClaim}`,
    `- Next required action: ${review.requiredNextAction}`,
    `- Sync command: ${review.syncCommand}`,
    `- Refresh command: ${review.refreshCommand}`
  ]

  if (review.local.readiness.status !== 'promotion-ready') {
    lines.push(
      '- Milestone wording must stay conservative while `building-history` remains open.'
    )
  } else {
    lines.push(
      `- Promotion thresholds are met. Human milestone-language review is ${review.wordingReviewAllowed ? 'now allowed' : 'still blocked until the tracked public artifact is refreshed'}.`
    )
  }

  for (const blockedClaim of review.blockedClaims) {
    lines.push(`- Blocked claim: ${blockedClaim}`)
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

export function reviewConfidence({
  historyPath = defaultHistoryPath,
  publishedDataPath = defaultPublishedDataPath,
  reviewPath = defaultReviewPath,
  verificationReportPath = defaultVerificationReportPath,
  requirePublishedCountdownMatch = false,
  generatedAt = new Date().toISOString()
} = {}) {
  const historySnapshot = readJsonFile(
    historyPath,
    `Run \`${DEFAULT_SYNC_COMMAND}\` or \`pnpm milestone:verify:confidence\` first.`
  )
  const publishedProgress = readPublishedProgressArtifact(publishedDataPath)
  const review = buildConfidenceReview({
    historySnapshot,
    publishedProgress,
    historyPath,
    publishedDataPath,
    reviewPath,
    verificationReportPath,
    generatedAt
  })
  const digest = renderConfidenceReview(review)

  if (reviewPath) {
    mkdirSync(path.dirname(reviewPath), { recursive: true })
    writeFileSync(reviewPath, digest, 'utf8')
  }

  if (requirePublishedCountdownMatch && !review.countdownAligned) {
    throw new Error(
      `Published countdown does not match local synced confidence history. Review ${reviewPath} and run \`${DEFAULT_REFRESH_COMMAND}\` after deliberate publication review.`
    )
  }

  return {
    review,
    digest
  }
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const { review, digest } = reviewConfidence(options)

    console.log('Generated milestone confidence review digest')
    console.log(`Review path: ${review.reviewPath}`)
    console.log(`Readiness status: ${review.local.readiness.status}`)
    console.log(`Remaining qualified runs: ${review.local.readiness.remainingQualifiedRuns}`)
    console.log(
      `Qualified countdown aligned with published artifact: ${review.countdownAligned ? 'yes' : 'no'}`
    )
    console.log(
      `Full snapshot aligned with published artifact: ${review.fullSnapshotAligned ? 'yes' : 'no'}`
    )

    if (options.printDigest) {
      console.log('')
      process.stdout.write(digest)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}

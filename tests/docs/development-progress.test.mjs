import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const docsSiteRoot = path.join(repoRoot, 'docs-site')
const docsConfigPath = path.join(docsSiteRoot, '.vitepress', 'config.ts')
const generatedProgressDataPath = path.join(docsSiteRoot, 'data', 'milestone-confidence-progress.ts')
const roadmapDataPath = path.join(docsSiteRoot, 'data', 'roadmap.ts')
const milestoneConfidenceComponentPath = path.join(
  docsSiteRoot,
  '.vitepress',
  'theme',
  'components',
  'MilestoneConfidencePage.vue'
)
const roadmapComponentPath = path.join(
  docsSiteRoot,
  '.vitepress',
  'theme',
  'components',
  'RoadmapPage.vue'
)

test('roadmap publishes a development-progress page backed by live milestone confidence data', async () => {
  const enPagePath = path.join(docsSiteRoot, 'en', 'roadmap', 'development-progress.md')
  const zhPagePath = path.join(docsSiteRoot, 'zh', 'roadmap', 'development-progress.md')

  assert.ok(existsSync(enPagePath), 'missing English development-progress roadmap page')
  assert.ok(existsSync(zhPagePath), 'missing Chinese development-progress roadmap page')
  assert.ok(existsSync(generatedProgressDataPath), 'missing generated milestone confidence progress data file')
  assert.ok(existsSync(roadmapDataPath), 'missing roadmap data file')

  const enPage = readFileSync(enPagePath, 'utf8')
  const zhPage = readFileSync(zhPagePath, 'utf8')
  const docsConfig = readFileSync(docsConfigPath, 'utf8')
  const roadmapData = readFileSync(roadmapDataPath, 'utf8')
  const milestoneConfidenceComponent = readFileSync(milestoneConfidenceComponentPath, 'utf8')
  const roadmapComponent = readFileSync(roadmapComponentPath, 'utf8')

  assert.match(enPage, /<MilestoneConfidencePage locale="en" \/>/)
  assert.match(zhPage, /<MilestoneConfidencePage locale="zh" \/>/)
  assert.match(docsConfig, /roadmap\/development-progress/)
  assert.match(milestoneConfidenceComponent, /pnpm milestone:review:confidence/)
  assert.match(milestoneConfidenceComponent, /pnpm milestone:review:promotion-ready/)
  assert.match(milestoneConfidenceComponent, /pnpm milestone:fetch:review-pack/)
  assert.match(
    milestoneConfidenceComponent,
    /2026-04-21-portmanager-m3-toward-c-enablement-requirements\.md/
  )
  assert.match(
    milestoneConfidenceComponent,
    /2026-04-21-portmanager-m3-toward-c-enablement-plan\.md/
  )
  assert.match(milestoneConfidenceComponent, /Phase 0 enablement/)
  assert.match(milestoneConfidenceComponent, /Unit 57 audit\/event boundary/)
  assert.match(milestoneConfidenceComponent, /Unit 58 target-profile abstraction/)
  assert.match(milestoneConfidenceComponent, /Unit 60 consumer-boundary split criteria/)
  assert.match(milestoneConfidenceComponent, /Unit 61 deployment-boundary decision pack/)
  assert.match(milestoneConfidenceComponent, /Unit 62 second-target policy pack/)
  assert.match(milestoneConfidenceComponent, /consumer-boundary-decision-pack/)
  assert.match(milestoneConfidenceComponent, /deployment-boundary-decision-pack/)
  assert.match(milestoneConfidenceComponent, /persistence-decision-pack/)
  assert.match(milestoneConfidenceComponent, /second-target-policy-pack/)
  assert.match(milestoneConfidenceComponent, /debian-12-systemd-tailscale/)
  assert.match(
    milestoneConfidenceComponent,
    /\.portmanager\/reports\/milestone-wording-review\.md/
  )
  assert.match(roadmapData, /Units 51 through 62/)
  assert.match(roadmapData, /debian-12-systemd-tailscale/)
  assert.match(roadmapData, /consumer-boundary-decision-pack/)
  assert.match(roadmapData, /deployment-boundary-decision-pack/)
  assert.match(roadmapData, /consumer-boundary split criteria/)
  assert.match(roadmapData, /persistence-decision-pack/)
  assert.match(roadmapData, /second-target-policy-pack/)
  assert.match(milestoneConfidenceComponent, /--skip-sync/)
  assert.match(milestoneConfidenceComponent, /Public claim class/)
  assert.match(milestoneConfidenceComponent, /Source surface status/)
  assert.match(milestoneConfidenceComponent, /Required next action/)
  assert.match(milestoneConfidenceComponent, /Wording review allowed/)
  assert.match(
    milestoneConfidenceComponent,
    /sourceSurfaceStatus\('docs-site\/\.vitepress\/theme\/components\/MilestoneConfidencePage\.vue'\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /sourceSurfaceStatus\('docs-site\/\.vitepress\/theme\/components\/RoadmapPage\.vue'\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /sourceSurfaceInstruction\('docs-site\/\.vitepress\/theme\/components\/MilestoneConfidencePage\.vue'\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /sourceSurfaceInstruction\('docs-site\/\.vitepress\/theme\/components\/RoadmapPage\.vue'\)/
  )
  assert.match(milestoneConfidenceComponent, /progress\.currentReviewPack/)
  assert.match(
    milestoneConfidenceComponent,
    /summarizeReviewPackFiles\(progress\.currentReviewPack\?\.files\.required, reviewPackRequiredFiles\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /summarizeReviewPackFiles\(progress\.currentReviewPack\?\.files\.optional, reviewPackOptionalFiles\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /currentReviewPackRequiredFile\('milestone-confidence-review\.md'\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /currentReviewPackOptionalFile\('milestone-confidence-summary\.md'\)/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.sourceRun\.htmlUrl/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.workflowRef/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.repo/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.branch/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.artifactPattern/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.sourceRun\.headSha/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.sourceRun\.createdAt/
  )
  assert.match(
    milestoneConfidenceComponent,
    /progress\.currentReviewPack\.sourceRun\.updatedAt/
  )
  assert.match(milestoneConfidenceComponent, /Current CI required file coverage/)
  assert.match(milestoneConfidenceComponent, /Current CI optional file coverage/)
  assert.match(milestoneConfidenceComponent, /Current CI missing required files/)
  assert.match(milestoneConfidenceComponent, /Current CI missing optional files/)
  assert.match(milestoneConfidenceComponent, /Current CI source repo/)
  assert.match(milestoneConfidenceComponent, /Current CI source branch/)
  assert.match(milestoneConfidenceComponent, /Current CI artifact pattern/)
  assert.match(milestoneConfidenceComponent, /Current CI workflow page/)
  assert.match(
    milestoneConfidenceComponent,
    /buildReviewPackWorkflowPageUrl\(progress\.currentReviewPack\?\.repo, progress\.currentReviewPack\?\.workflowRef\)/
  )
  assert.match(milestoneConfidenceComponent, /promotion-ready-refresh-required/)
  assert.match(roadmapComponent, /pnpm milestone:review:promotion-ready/)
  assert.match(roadmapComponent, /pnpm milestone:fetch:review-pack/)
  assert.match(roadmapComponent, /2026-04-21-portmanager-m3-toward-c-enablement-plan\.md/)
  assert.match(roadmapComponent, /lane\.items\.length > 0/)
  assert.match(roadmapComponent, /milestone-confidence-bundle-\*/)
  assert.match(roadmapComponent, /Required next action/)
  assert.match(roadmapComponent, /Public claim class/)
  assert.match(
    roadmapComponent,
    /confidenceSurfaceStatus\('docs-site\/\.vitepress\/theme\/components\/MilestoneConfidencePage\.vue'\)/
  )
  assert.match(
    roadmapComponent,
    /confidenceSurfaceInstruction\('docs-site\/\.vitepress\/theme\/components\/MilestoneConfidencePage\.vue'\)/
  )
  assert.match(
    roadmapComponent,
    /confidenceSurfaceInstruction\('docs-site\/data\/milestone-confidence-progress\.ts'\)/
  )
  assert.match(roadmapComponent, /confidenceProgress\.currentReviewPack/)
  assert.match(
    roadmapComponent,
    /summarizeReviewPackFiles\(confidenceProgress\.currentReviewPack\?\.files\.required, reviewPackRequiredFiles\)/
  )
  assert.match(
    roadmapComponent,
    /summarizeReviewPackFiles\(confidenceProgress\.currentReviewPack\?\.files\.optional, reviewPackOptionalFiles\)/
  )
  assert.match(
    roadmapComponent,
    /currentReviewPackRequiredFile\('milestone-wording-review\.md'\)/
  )
  assert.match(
    roadmapComponent,
    /currentReviewPackOptionalFile\('milestone-confidence-summary\.md'\)/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.sourceRun\.htmlUrl/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.workflowRef/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.repo/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.branch/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.artifactPattern/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.sourceRun\.headSha/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.sourceRun\.createdAt/
  )
  assert.match(
    roadmapComponent,
    /confidenceProgress\.currentReviewPack\.sourceRun\.updatedAt/
  )
  assert.match(roadmapComponent, /Current CI required file coverage/)
  assert.match(roadmapComponent, /Current CI optional file coverage/)
  assert.match(roadmapComponent, /Current CI missing required files/)
  assert.match(roadmapComponent, /Current CI missing optional files/)
  assert.match(roadmapComponent, /Current CI source repo/)
  assert.match(roadmapComponent, /Current CI source branch/)
  assert.match(roadmapComponent, /Current CI artifact pattern/)
  assert.match(roadmapComponent, /Current CI workflow page/)
  assert.match(
    roadmapComponent,
    /buildReviewPackWorkflowPageUrl\(confidenceProgress\.currentReviewPack\?\.repo, confidenceProgress\.currentReviewPack\?\.workflowRef\)/
  )

  const { milestoneConfidenceProgress } = await import(pathToFileURL(generatedProgressDataPath).href)

  assert.equal(
    milestoneConfidenceProgress.sourceFiles.historyPath,
    '.portmanager/reports/milestone-confidence-history.json'
  )
  assert.equal(typeof milestoneConfidenceProgress.updatedAt, 'string')
  assert.equal(typeof milestoneConfidenceProgress.readiness.status, 'string')
  assert.equal(typeof milestoneConfidenceProgress.readiness.qualifiedRuns, 'number')
  assert.equal(typeof milestoneConfidenceProgress.visibility.localVisibilityOnlyRuns, 'number')
  assert.ok(Array.isArray(milestoneConfidenceProgress.recentRuns))
  assert.equal(typeof milestoneConfidenceProgress.readiness.minimumQualifiedRuns, 'number')
  assert.equal(typeof milestoneConfidenceProgress.readiness.minimumConsecutivePasses, 'number')
  assert.equal(typeof milestoneConfidenceProgress.sourceFiles.summaryPath, 'string')
  assert.equal(
    milestoneConfidenceProgress.publication.defaultMode,
    'reuse-committed-artifact'
  )
  assert.equal(
    milestoneConfidenceProgress.publication.explicitRefreshFlag,
    '--refresh-confidence-progress'
  )
  assert.equal(
    milestoneConfidenceProgress.publication.refreshCommand,
    'pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence'
  )
  assert.equal(typeof milestoneConfidenceProgress.wordingReview.publicClaimClass, 'string')
  assert.equal(typeof milestoneConfidenceProgress.wordingReview.wordingReviewAllowed, 'boolean')
  assert.equal(typeof milestoneConfidenceProgress.wordingReview.requiredNextAction, 'string')
  assert.equal(
    milestoneConfidenceProgress.wordingReview.sourceSurfaces['docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue'].claimStatus,
    'development-progress-counter-surface'
  )
  assert.equal(
    milestoneConfidenceProgress.wordingReview.sourceSurfaces['docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue'].reviewInstruction,
    'This public page mirrors exact counters from the tracked confidence artifact and should keep developer review guidance visible.'
  )
  assert.equal(
    milestoneConfidenceProgress.wordingReview.sourceSurfaces['docs-site/data/milestone-confidence-progress.ts'].reviewInstruction,
    'Exact published counters belong here and on the development-progress page, not in root-doc prose.'
  )
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.manifestPath, 'string')
  assert.equal(
    milestoneConfidenceProgress.currentReviewPack.helperCommand,
    'pnpm milestone:fetch:review-pack'
  )
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.repo, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.branch, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.artifactPattern, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.id, 'number')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.event, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.conclusion, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.headSha, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.htmlUrl, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.workflowRef, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.createdAt, 'string')
  assert.equal(typeof milestoneConfidenceProgress.currentReviewPack.sourceRun.updatedAt, 'string')
  assert.equal(
    milestoneConfidenceProgress.currentReviewPack.files.required['milestone-confidence-review.md'],
    '.portmanager/reports/current-ci-review-pack/milestone-confidence-review.md'
  )
  // The committed docs-site data is a publish artifact. An ignored local .portmanager
  // history may be newer than that artifact until docs:generate is rerun, so this
  // acceptance test validates publishable shape and route wiring rather than forcing
  // fresh local machine state to match committed generated docs.
  if (milestoneConfidenceProgress.latestQualifiedRun) {
    assert.equal(typeof milestoneConfidenceProgress.latestQualifiedRun.completedAt, 'string')
    assert.equal(
      typeof milestoneConfidenceProgress.latestQualifiedRun.context.workflow,
      'string'
    )
  }
})

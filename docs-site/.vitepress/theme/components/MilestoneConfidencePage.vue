<template>
  <section class="pm-roadmap-shell pm-confidence-shell">
    <article class="pm-callout-card pm-roadmap-hero pm-confidence-hero">
      <span class="pm-kicker">{{ copy.kicker }}</span>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lede }}</p>
      <div class="pm-doc-links">
        <span class="pm-pill" :class="readinessTone">{{ readinessStatusLabel }}</span>
        <span class="pm-pill now">{{ qualifiedRunsLabel }}</span>
        <span class="pm-pill next">{{ consecutivePassesLabel }}</span>
      </div>
      <div class="pm-doc-links">
        <VPLink class="pm-doc-link" :href="`/${props.locale}/roadmap/`">{{ copy.roadmapHome }}</VPLink>
        <VPLink class="pm-doc-link" :href="docMeta(props.locale, 'milestones').link">{{ copy.milestonesDetail }}</VPLink>
        <VPLink class="pm-doc-link" :href="docMeta(props.locale, 'real-machine-verification-report').link">{{ copy.verificationReport }}</VPLink>
      </div>
    </article>

    <div class="pm-docs-grid three pm-progress-grid">
      <section class="pm-progress-card">
        <div class="pm-progress-header">
          <h3>{{ copy.readinessCard }}</h3>
          <span class="pm-badge" :class="readinessTone">{{ readinessStatusLabel }}</span>
        </div>
        <ul class="pm-progress-list">
          <li>{{ copy.updatedAt }} {{ formatTimestamp(progress.updatedAt) }}</li>
          <li>{{ copy.qualifiedRuns }} {{ progress.readiness.qualifiedRuns }}/{{ progress.readiness.minimumQualifiedRuns }}</li>
          <li>
            {{ copy.qualifiedConsecutivePasses }}
            {{ progress.readiness.qualifiedConsecutivePasses }}/{{ progress.readiness.minimumConsecutivePasses }}
          </li>
          <li>{{ copy.remainingQualifiedRuns }} {{ progress.readiness.remainingQualifiedRuns }}</li>
          <li>{{ copy.remainingQualifiedPasses }} {{ progress.readiness.remainingConsecutivePasses }}</li>
        </ul>
      </section>

      <section class="pm-progress-card">
        <div class="pm-progress-header">
          <h3>{{ copy.visibilityCard }}</h3>
          <span class="pm-badge safe">{{ copy.reviewSignal }}</span>
        </div>
        <ul class="pm-progress-list">
          <li>{{ copy.qualifiedMainlineRuns }} {{ progress.visibility.qualifiedRuns }}</li>
          <li>{{ copy.visibilityOnlyRuns }} {{ progress.visibility.visibilityOnlyRuns }}</li>
          <li>{{ copy.localVisibilityOnlyRuns }} {{ progress.visibility.localVisibilityOnlyRuns }}</li>
          <li>{{ copy.nonQualifiedRemoteRuns }} {{ progress.visibility.nonQualifiedRemoteRuns }}</li>
        </ul>
      </section>

      <section class="pm-progress-card">
        <div class="pm-progress-header">
          <h3>{{ copy.verificationCard }}</h3>
          <span class="pm-badge safe">{{ copy.currentSnapshot }}</span>
        </div>
        <ul class="pm-progress-list">
          <li>{{ copy.trackedRuns }} {{ progress.trackedRuns }}</li>
          <li>{{ copy.passingRuns }} {{ progress.passedRuns }}</li>
          <li>{{ copy.failingRuns }} {{ progress.failedRuns }}</li>
          <li>{{ copy.consecutivePassingRuns }} {{ progress.consecutivePasses }}</li>
          <li>{{ copy.qualifiedScope }} <code>{{ qualifiedScopeLabel }}</code></li>
        </ul>
      </section>
    </div>

    <div class="pm-docs-grid two">
      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.latestRunKicker }}</span>
            <h3>{{ copy.latestRunTitle }}</h3>
          </div>
          <span class="pm-badge" :class="runTone(progress.latestRun)">{{ outcomeLabel(progress.latestRun?.outcome) }}</span>
        </div>
        <template v-if="progress.latestRun">
          <ul class="pm-progress-list">
            <li>{{ copy.outcome }} {{ outcomeLabel(progress.latestRun.outcome) }}</li>
            <li>{{ copy.qualifiedForReadiness }} {{ yesNo(progress.latestRun.qualifiedForReadiness) }}</li>
            <li>{{ copy.event }} {{ eventLabel(progress.latestRun) }}</li>
            <li>{{ copy.run }} {{ runLabel(progress.latestRun) }}</li>
            <li>{{ copy.sha }} <code>{{ shaLabel(progress.latestRun) }}</code></li>
            <li>{{ copy.workflow }} {{ workflowLabel(progress.latestRun) }}</li>
            <li>{{ copy.completed }} {{ formatTimestamp(progress.latestRun.completedAt) }}</li>
            <li>{{ copy.failedStep }} {{ failedStepLabel(progress.latestRun.failedStepName) }}</li>
          </ul>
        </template>
      </article>

      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.latestQualifiedKicker }}</span>
            <h3>{{ copy.latestQualifiedTitle }}</h3>
          </div>
          <span class="pm-badge" :class="runTone(progress.latestQualifiedRun)">{{ outcomeLabel(progress.latestQualifiedRun?.outcome) }}</span>
        </div>
        <template v-if="progress.latestQualifiedRun">
          <ul class="pm-progress-list">
            <li>{{ copy.outcome }} {{ outcomeLabel(progress.latestQualifiedRun.outcome) }}</li>
            <li>{{ copy.event }} {{ eventLabel(progress.latestQualifiedRun) }}</li>
            <li>{{ copy.run }} {{ runLabel(progress.latestQualifiedRun) }}</li>
            <li>{{ copy.sha }} <code>{{ shaLabel(progress.latestQualifiedRun) }}</code></li>
            <li>{{ copy.workflow }} {{ workflowLabel(progress.latestQualifiedRun) }}</li>
            <li>{{ copy.completed }} {{ formatTimestamp(progress.latestQualifiedRun.completedAt) }}</li>
            <li>{{ copy.failedStep }} {{ failedStepLabel(progress.latestQualifiedRun.failedStepName) }}</li>
          </ul>
        </template>
        <p v-else class="pm-doc-note">{{ copy.noQualifiedRun }}</p>
      </article>
    </div>

    <article class="pm-callout-card">
      <div class="pm-card-header">
        <div>
          <span class="pm-kicker">{{ copy.recentRunsKicker }}</span>
          <h3>{{ copy.recentRunsTitle }}</h3>
        </div>
      </div>
      <div class="pm-confidence-table-wrap">
        <table class="pm-confidence-table">
          <thead>
            <tr>
              <th>{{ copy.completed }}</th>
              <th>{{ copy.outcome }}</th>
              <th>{{ copy.qualified }}</th>
              <th>{{ copy.event }}</th>
              <th>{{ copy.run }}</th>
              <th>{{ copy.sha }}</th>
              <th>{{ copy.failedStep }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in progress.recentRuns" :key="run.id">
              <td>{{ formatTimestamp(run.completedAt) }}</td>
              <td>{{ outcomeLabel(run.outcome) }}</td>
              <td>{{ yesNo(run.qualifiedForReadiness) }}</td>
              <td>{{ eventLabel(run) }}</td>
              <td>{{ runLabel(run) }}</td>
              <td><code>{{ shaLabel(run) }}</code></td>
              <td>{{ failedStepLabel(run.failedStepName) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div class="pm-docs-grid three pm-progress-grid">
      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.reviewChecklistKicker }}</span>
            <h3>{{ copy.reviewChecklistTitle }}</h3>
          </div>
        </div>
        <ul class="pm-progress-list">
          <li v-for="item in reviewChecklist" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.currentDirectionKicker }}</span>
            <h3>{{ copy.currentDirectionTitle }}</h3>
          </div>
          <span class="pm-badge next">{{ copy.currentDirectionEvidence }}</span>
        </div>
        <ul class="pm-progress-list">
          <li v-for="item in currentDirectionSummary" :key="item">{{ item }}</li>
        </ul>
        <div class="pm-doc-links">
          <VPLink v-for="item in currentDirectionDocs" :key="item.href" class="pm-doc-link" :href="item.href">
            {{ item.label }}
          </VPLink>
        </div>
      </article>

      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.sourceFilesKicker }}</span>
            <h3>{{ copy.sourceFilesTitle }}</h3>
          </div>
        </div>
        <ul class="pm-progress-list">
          <li>{{ copy.summaryFile }} <code>{{ progress.sourceFiles.summaryPath }}</code></li>
          <li>{{ copy.historyFile }} <code>{{ progress.sourceFiles.historyPath }}</code></li>
          <li>{{ copy.reportFile }} <code>{{ progress.sourceFiles.reportPath }}</code></li>
          <li>{{ copy.reviewDigestFile }} <code>.portmanager/reports/milestone-confidence-review.md</code></li>
          <li>{{ copy.wordingReviewFile }} <code>.portmanager/reports/milestone-wording-review.md</code></li>
          <li>{{ copy.reviewCommandLabel }} <code>pnpm milestone:review:confidence</code></li>
          <li>{{ copy.publishedArtifact }} <code>{{ progress.publication.trackedDataPath }}</code></li>
          <li>{{ copy.refreshCommandLabel }} <code>{{ progress.publication.refreshCommand }}</code></li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VPLink } from 'vitepress/theme'

import { milestoneConfidenceProgress as progress } from '../../../data/milestone-confidence-progress'
import { docMeta, githubSourceLink, type LocaleCode } from '../../../data/docs'

type ProgressRun = (typeof progress.latestRun)

const props = defineProps<{ locale: LocaleCode }>()

const copy = computed(() => props.locale === 'zh'
  ? {
      kicker: 'Developer Progress',
      title: '把真实 confidence 历史直接公开给开发者复核。',
      lede: '这个页面直接发布当前同步后的 milestone confidence 进度，避免开发者只看 roadmap 叙述却看不到最新 qualified 主线证据、visibility-only 噪声拆分和 readiness 推进刻度。',
      roadmapHome: '返回 Roadmap',
      milestonesDetail: '查看里程碑明细',
      verificationReport: '真机验证报告',
      readinessCard: 'Readiness',
      visibilityCard: 'Visibility Breakdown',
      verificationCard: 'Current Snapshot',
      reviewSignal: 'Review Signal',
      currentSnapshot: 'Current Snapshot',
      latestRunKicker: 'Latest Run',
      latestRunTitle: '最新可见运行',
      latestQualifiedKicker: 'Latest Qualified Run',
      latestQualifiedTitle: '最新 qualified 主线运行',
      recentRunsKicker: 'Recent Runs',
      recentRunsTitle: '最近运行',
      reviewChecklistKicker: 'Developer Review',
      reviewChecklistTitle: '开发者复核动作',
      currentDirectionKicker: 'Current Direction',
      currentDirectionTitle: '当前复核方向',
      currentDirectionEvidence: 'Review Pack',
      currentDirectionRequirementsLink: '当前方向需求文档',
      currentDirectionPlanLink: '当前方向实现计划',
      currentDirectionVerificationLink: '真机验证报告',
      sourceFilesKicker: 'Source Files',
      sourceFilesTitle: '当前公开页面数据来源',
      summaryFile: 'Summary：',
      historyFile: 'History：',
      reportFile: 'Report：',
      reviewDigestFile: 'Review digest：',
      wordingReviewFile: 'Wording review：',
      reviewCommandLabel: 'Review command：',
      publishedArtifact: 'Published artifact：',
      refreshCommandLabel: 'Refresh command：',
      updatedAt: '更新于：',
      qualifiedRuns: 'Qualified runs：',
      qualifiedConsecutivePasses: 'Qualified consecutive passes：',
      remainingQualifiedRuns: '剩余 qualified runs：',
      remainingQualifiedPasses: '剩余 qualified 连续 pass：',
      qualifiedMainlineRuns: 'Qualified mainline runs：',
      visibilityOnlyRuns: 'Visibility-only runs：',
      localVisibilityOnlyRuns: '本地 visibility-only runs：',
      nonQualifiedRemoteRuns: '非 qualified 远端 runs：',
      trackedRuns: 'Tracked runs：',
      passingRuns: 'Passing runs：',
      failingRuns: 'Failing runs：',
      consecutivePassingRuns: '连续通过：',
      qualifiedScope: 'Qualified scope：',
      outcome: 'Outcome：',
      qualifiedForReadiness: 'Qualified for readiness：',
      qualified: 'Qualified',
      event: 'Event',
      run: 'Run',
      sha: 'SHA',
      workflow: 'Workflow：',
      completed: 'Completed',
      failedStep: 'Failed step',
      noQualifiedRun: '当前还没有 qualified 主线运行可公开显示。',
      none: 'none',
      yes: 'yes',
      no: 'no',
      local: 'local',
      passed: 'passed',
      failed: 'failed',
      unknown: 'unknown',
      statusLocalOnly: 'local-only',
      statusBuildingHistory: 'building-history',
      statusPromotionReady: 'promotion-ready'
    }
  : {
      kicker: 'Developer Progress',
      title: 'Publish real confidence history for developer review.',
      lede: 'This page exposes the synced milestone confidence progress directly, so developers do not have to rely on roadmap prose while the latest qualified mainline evidence, visibility-only noise split, and readiness counters keep moving.',
      roadmapHome: 'Back to Roadmap',
      milestonesDetail: 'Open Milestones Detail',
      verificationReport: 'Real-Machine Verification Report',
      readinessCard: 'Readiness',
      visibilityCard: 'Visibility Breakdown',
      verificationCard: 'Current Snapshot',
      reviewSignal: 'Review Signal',
      currentSnapshot: 'Current Snapshot',
      latestRunKicker: 'Latest Run',
      latestRunTitle: 'Latest visible run',
      latestQualifiedKicker: 'Latest Qualified Run',
      latestQualifiedTitle: 'Latest qualified mainline run',
      recentRunsKicker: 'Recent Runs',
      recentRunsTitle: 'Recent runs',
      reviewChecklistKicker: 'Developer Review',
      reviewChecklistTitle: 'Developer review actions',
      currentDirectionKicker: 'Current Direction',
      currentDirectionTitle: 'Current review direction',
      currentDirectionEvidence: 'Review Pack',
      currentDirectionRequirementsLink: 'Current-direction requirements',
      currentDirectionPlanLink: 'Current-direction plan',
      currentDirectionVerificationLink: 'Verification report',
      sourceFilesKicker: 'Source Files',
      sourceFilesTitle: 'Current public page inputs',
      summaryFile: 'Summary:',
      historyFile: 'History:',
      reportFile: 'Report:',
      reviewDigestFile: 'Review digest:',
      wordingReviewFile: 'Wording review:',
      reviewCommandLabel: 'Review command:',
      publishedArtifact: 'Published artifact:',
      refreshCommandLabel: 'Refresh command:',
      updatedAt: 'Updated:',
      qualifiedRuns: 'Qualified runs:',
      qualifiedConsecutivePasses: 'Qualified consecutive passes:',
      remainingQualifiedRuns: 'Remaining qualified runs:',
      remainingQualifiedPasses: 'Remaining qualified pass streak:',
      qualifiedMainlineRuns: 'Qualified mainline runs:',
      visibilityOnlyRuns: 'Visibility-only runs:',
      localVisibilityOnlyRuns: 'Local visibility-only runs:',
      nonQualifiedRemoteRuns: 'Non-qualified remote runs:',
      trackedRuns: 'Tracked runs:',
      passingRuns: 'Passing runs:',
      failingRuns: 'Failing runs:',
      consecutivePassingRuns: 'Consecutive passing runs:',
      qualifiedScope: 'Qualified scope:',
      outcome: 'Outcome:',
      qualifiedForReadiness: 'Qualified for readiness:',
      qualified: 'Qualified',
      event: 'Event',
      run: 'Run',
      sha: 'SHA',
      workflow: 'Workflow:',
      completed: 'Completed',
      failedStep: 'Failed step',
      noQualifiedRun: 'No qualified mainline run is available yet.',
      none: 'none',
      yes: 'yes',
      no: 'no',
      local: 'local',
      passed: 'passed',
      failed: 'failed',
      unknown: 'unknown',
      statusLocalOnly: 'local-only',
      statusBuildingHistory: 'building-history',
      statusPromotionReady: 'promotion-ready'
    }
)

const readinessTone = computed(() => {
  if (progress.readiness.status === 'promotion-ready') return 'safe'
  if (progress.readiness.status === 'building-history') return 'next'
  return 'planned'
})

const readinessStatusLabel = computed(() => {
  if (progress.readiness.status === 'promotion-ready') return copy.value.statusPromotionReady
  if (progress.readiness.status === 'building-history') return copy.value.statusBuildingHistory
  return copy.value.statusLocalOnly
})

const qualifiedRunsLabel = computed(
  () => `${copy.value.qualifiedRuns} ${progress.readiness.qualifiedRuns}/${progress.readiness.minimumQualifiedRuns}`
)

const consecutivePassesLabel = computed(
  () => `${copy.value.qualifiedConsecutivePasses} ${progress.readiness.qualifiedConsecutivePasses}/${progress.readiness.minimumConsecutivePasses}`
)

const qualifiedScopeLabel = computed(
  () => `${progress.readiness.qualifiedEvents.join(', ')} on ${progress.readiness.requiredRef}`
)

const latestQualifiedRunLabel = computed(() => {
  if (!progress.latestQualifiedRun) {
    return copy.value.noQualifiedRun
  }

  return runLabel(progress.latestQualifiedRun)
})

const reviewChecklist = computed(() => props.locale === 'zh'
  ? progress.readiness.status === 'promotion-ready'
    ? [
        '先在 GitHub Actions 查看 `mainline-acceptance` job summary，再回到这个页面核对同一份 promotion-ready 计数。',
        '如果第一问题是当前 CI run，就执行 `pnpm milestone:fetch:review-pack`，把上传的 `milestone-confidence-bundle-*` 落到 `.portmanager/reports/current-ci-review-pack/` 后再读当前 run review pack。',
        '在本地主线执行 `pnpm milestone:review:promotion-ready -- --limit 20`，用一条 repo-native helper 同步 completed mainline bundle 并写出 review digest。',
        '当前 confidence job 也会执行 `pnpm milestone:review:promotion-ready -- --skip-sync`，把当前 run 的 review digest 与 wording checklist 直接写进 uploaded bundle。',
        '先读 `.portmanager/reports/milestone-wording-review.md`，确认 `Public claim class`、`Source surface status`、`Wording review allowed` 与文案护栏。',
        '如果 checklist 或 digest 先暴露 countdown 漂移，再决定是否通过同一条 helper 加上 `--refresh-published-artifact` 推进公开快照。',
        '当 helper 给出 `promotion-ready-refresh-required` 时，先刷新被跟踪公开 artifact，再让人工里程碑文案继续收窄。',
        'promotion 门槛已经满足；继续保持 `pnpm milestone:verify:confidence` 与 `pnpm acceptance:verify` 为绿，同时让人工里程碑文案复核逐步收窄表述。'
      ]
    : [
        '先在 GitHub Actions 查看 `mainline-acceptance` job summary，再回到这个页面核对相同计数。',
        '在本地主线执行 `pnpm milestone:sync:confidence-history -- --limit 20`，把 completed mainline bundle 导回 `.portmanager/reports/`。',
        '执行 `pnpm milestone:review:confidence`，让 `.portmanager/reports/milestone-confidence-review.md` 先明确 countdown 是否与公开快照对齐。',
        '优先读取 `Latest Qualified Run`、review digest 与 visibility breakdown，再决定里程碑文案是否允许继续收窄。',
        `连续 pass 门槛已经满足；继续保持 \`pnpm milestone:verify:confidence\` 与 \`pnpm acceptance:verify\` 为绿，直到最后 ${progress.readiness.remainingQualifiedRuns} 次 qualified runs 到位。`
      ]
  : progress.readiness.status === 'promotion-ready'
    ? [
        'Read the GitHub Actions `mainline-acceptance` job summary first, then confirm the same promotion-ready counters on this page.',
        'If the current CI run is the first question, run `pnpm milestone:fetch:review-pack` so the uploaded `milestone-confidence-bundle-*` lands in `.portmanager/reports/current-ci-review-pack/` before reading the current-run review pack.',
        'Run `pnpm milestone:review:promotion-ready -- --limit 20` on local main to sync completed mainline bundles and write the review digest in one repo-native step.',
        'The confidence job now also runs `pnpm milestone:review:promotion-ready -- --skip-sync`, so the current run uploads the review digest and wording checklist directly in the bundle.',
        'Read `.portmanager/reports/milestone-wording-review.md` next, so `Public claim class`, `Source surface status`, `Wording review allowed`, and guardrails are frozen in one local checklist.',
        'If the checklist or digest exposes countdown drift first, decide whether the same helper should rerun with `--refresh-published-artifact` to move the public artifact.',
        'When the helper reports `promotion-ready-refresh-required`, refresh the tracked public artifact before narrowing milestone wording further.',
        'The promotion threshold is already met; keep both `pnpm milestone:verify:confidence` and `pnpm acceptance:verify` green while human milestone-language review narrows wording deliberately.'
      ]
    : [
        'Read the GitHub Actions `mainline-acceptance` job summary first, then confirm the same counters on this page.',
        'Run `pnpm milestone:sync:confidence-history -- --limit 20` on local main to pull completed mainline bundles back into `.portmanager/reports/`.',
        'Run `pnpm milestone:review:confidence` so `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned.',
        'Use `Latest Qualified Run`, the review digest, and the visibility breakdown before deciding whether milestone wording can narrow further.',
        `The pass-streak gate is already satisfied; keep both \`pnpm milestone:verify:confidence\` and \`pnpm acceptance:verify\` green until the final ${progress.readiness.remainingQualifiedRuns} qualified runs land.`
      ]
)

const currentDirectionSummary = computed(() => props.locale === 'zh'
  ? progress.readiness.status === 'promotion-ready'
    ? [
        `当前公开状态已经是 \`${progress.readiness.status}\`，qualified 进度为 ${progress.readiness.qualifiedRuns}/${progress.readiness.minimumQualifiedRuns}。`,
        `qualified consecutive passes 已达到 ${progress.readiness.qualifiedConsecutivePasses}/${progress.readiness.minimumConsecutivePasses}；promotion 门槛已经满足。`,
        '默认复核顺序已经收敛为先执行 `pnpm milestone:fetch:review-pack` 读取当前 CI run，再执行 `pnpm milestone:review:promotion-ready -- --limit 20` 做同步后的本地复核；`mainline-acceptance` confidence job 仍会通过 `--skip-sync` 产出这组 uploaded bundle。',
        'helper 现在会把 `promotion-ready-reviewed` 与 `promotion-ready-refresh-required` 明确区分开，避免把本地 promotion-ready 证据误读成公开页面已经同步到最新 counters。',
        `当前最新 qualified 主线 run 为 ${latestQualifiedRunLabel.value}；当前主线已从倒计时积累收窄为文案复核与 gate 持续健康，而不是继续补 readiness 脚手架。`
      ]
    : [
        `当前公开状态仍为 \`${progress.readiness.status}\`，qualified 进度为 ${progress.readiness.qualifiedRuns}/${progress.readiness.minimumQualifiedRuns}。`,
        `qualified consecutive passes 已达到 ${progress.readiness.qualifiedConsecutivePasses}/${progress.readiness.minimumConsecutivePasses}；连续 pass 门槛已经满足。`,
        `默认复核顺序已经变成先同步 history、再执行 \`pnpm milestone:review:confidence\`，然后才判断是否需要刷新公开快照。`,
        `当前最新 qualified 主线 run 为 ${latestQualifiedRunLabel.value}，还剩 ${progress.readiness.remainingQualifiedRuns} 次 qualified runs；里程碑文案只能在 qualified-run 计数达到 7/7 之后继续收窄。`
      ]
  : progress.readiness.status === 'promotion-ready'
    ? [
        `Current public status is now \`${progress.readiness.status}\` with qualified progress at ${progress.readiness.qualifiedRuns}/${progress.readiness.minimumQualifiedRuns}.`,
        `Qualified consecutive passes are already at ${progress.readiness.qualifiedConsecutivePasses}/${progress.readiness.minimumConsecutivePasses}; the promotion threshold is met.`,
        'The default review flow now stages the current CI bundle with `pnpm milestone:fetch:review-pack`, then runs `pnpm milestone:review:promotion-ready -- --limit 20` for synced local review; `mainline-acceptance` still produces that uploaded bundle through `--skip-sync`.',
        'The helper now separates `promotion-ready-reviewed` from `promotion-ready-refresh-required`, so local promotion-ready evidence cannot be misread as public-artifact alignment.',
        `The latest qualified mainline run is ${latestQualifiedRunLabel.value}; the active lane has narrowed from countdown accumulation to wording review plus sustained gate health.`
      ]
    : [
        `Current public status remains \`${progress.readiness.status}\` with qualified progress at ${progress.readiness.qualifiedRuns}/${progress.readiness.minimumQualifiedRuns}.`,
        `Qualified consecutive passes are already at ${progress.readiness.qualifiedConsecutivePasses}/${progress.readiness.minimumConsecutivePasses}; the pass-streak gate is satisfied.`,
        'The default review flow is now sync history, run `pnpm milestone:review:confidence`, then decide whether the public snapshot should move.',
        `The latest qualified mainline run is ${latestQualifiedRunLabel.value}, ${progress.readiness.remainingQualifiedRuns} qualified runs still remain, and milestone wording should narrow only after the qualified-run counter reaches 7/7.`
      ]
)

const currentDirectionDocs = computed(() => [
  {
    href: githubSourceLink('docs/brainstorms/2026-04-21-portmanager-m2-confidence-review-pack-fetch-requirements.md'),
    label: copy.value.currentDirectionRequirementsLink
  },
  {
    href: githubSourceLink('docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-fetch-plan.md'),
    label: copy.value.currentDirectionPlanLink
  },
  {
    href: docMeta(props.locale, 'real-machine-verification-report').link,
    label: copy.value.currentDirectionVerificationLink
  }
])

function formatTimestamp(value: string | null) {
  if (!value) {
    return copy.value.unknown
  }

  return value.replace('T', ' ').replace(/\.?\d{0,3}Z$/, ' UTC')
}

function yesNo(value: boolean) {
  return value ? copy.value.yes : copy.value.no
}

function outcomeLabel(value?: string | null) {
  if (value === 'passed') return copy.value.passed
  if (value === 'failed') return copy.value.failed
  return copy.value.unknown
}

function runTone(run: ProgressRun) {
  if (!run) return 'planned'
  return run.outcome === 'passed' ? 'safe' : 'next'
}

function eventLabel(run: NonNullable<ProgressRun>) {
  return run.context.eventName ?? copy.value.local
}

function runLabel(run: NonNullable<ProgressRun>) {
  if (!run.context.runId) {
    return copy.value.local
  }

  return `${run.context.runId}/${run.context.runAttempt ?? '1'}`
}

function shaLabel(run: NonNullable<ProgressRun>) {
  return run.context.sha ? run.context.sha.slice(0, 12) : copy.value.local
}

function workflowLabel(run: NonNullable<ProgressRun>) {
  return run.context.workflow ?? copy.value.local
}

function failedStepLabel(value: string | null) {
  return value ?? copy.value.none
}
</script>

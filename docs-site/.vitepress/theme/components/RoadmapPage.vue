<template>
  <section class="pm-roadmap-shell">
    <article class="pm-callout-card pm-roadmap-hero">
      <span class="pm-kicker">{{ copy.kicker }}</span>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lede }}</p>
      <div class="pm-doc-links">
        <span class="pm-pill now">{{ copy.now }}</span>
        <span class="pm-pill next">{{ copy.next }}</span>
        <span class="pm-pill later">{{ copy.later }}</span>
      </div>
    </article>

    <div class="pm-docs-grid two">
      <article class="pm-lane-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.productTrack }}</span>
            <h3>{{ copy.productTitle }}</h3>
          </div>
        </div>
        <ul>
          <li v-for="item in tracks.product[locale]" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="pm-lane-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.engineeringTrack }}</span>
            <h3>{{ copy.engineeringTitle }}</h3>
          </div>
        </div>
        <ul>
          <li v-for="item in tracks.engineering[locale]" :key="item">{{ item }}</li>
        </ul>
      </article>
    </div>

    <div class="pm-docs-grid two">
      <article class="pm-lane-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.principlesLabel }}</span>
            <h3>{{ copy.principlesTitle }}</h3>
          </div>
        </div>
        <ul>
          <li v-for="item in principles[locale]" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="pm-lane-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.progressionLabel }}</span>
            <h3>{{ copy.progressionTitle }}</h3>
          </div>
        </div>
        <section v-for="step in progression" :key="step.id" style="margin-top: 0.85rem;">
          <h4>{{ step.label[locale] }} · {{ step.title[locale] }}</h4>
          <p>{{ step.description[locale] }}</p>
        </section>
      </article>
    </div>

    <section class="pm-docs-grid">
      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.schemeCLabel }}</span>
            <h3>{{ schemeC.title[locale] }}</h3>
          </div>
          <span class="pm-badge planned">{{ copy.later }}</span>
        </div>

        <p>{{ schemeC.summary[locale] }}</p>

        <section>
          <h4>{{ copy.advantagesLabel }}</h4>
          <ul>
            <li v-for="item in schemeC.advantages[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.costsLabel }}</h4>
          <ul>
            <li v-for="item in schemeC.costs[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.suitableWhenLabel }}</h4>
          <ul>
            <li v-for="item in schemeC.suitableWhen[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.notForLabel }}</h4>
          <ul>
            <li v-for="item in schemeC.notFor[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.linkedDocsLabel }}</h4>
          <div class="pm-doc-links">
            <VPLink v-for="docId in schemeC.docs" :key="docId" class="pm-doc-link" :href="docMeta(locale, docId).link">
              {{ docMeta(locale, docId).title }}
            </VPLink>
          </div>
        </section>
      </article>
    </section>

    <section class="pm-roadmap-lanes">
      <article v-for="lane in lanes" :key="lane.stage" class="pm-lane-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ lane.label }}</span>
            <h3>{{ lane.title }}</h3>
          </div>
        </div>
        <ul>
          <li v-for="item in lane.items" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <section class="pm-docs-grid">
      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.developerProgressLabel }}</span>
            <h3>{{ developerProgress.title[locale] }}</h3>
          </div>
        </div>
        <p>{{ developerProgress.lede[locale] }}</p>

        <div class="pm-docs-grid three pm-progress-grid">
          <section v-for="bucket in developerProgress.buckets" :key="bucket.id" class="pm-progress-card">
            <div class="pm-progress-header">
              <h4>{{ bucket.label[locale] }}</h4>
              <span class="pm-badge" :class="bucket.tone">{{ progressToneLabel(bucket.tone) }}</span>
            </div>
            <ul class="pm-progress-list">
              <li v-for="item in bucket.items[locale]" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
      </article>
    </section>

    <section class="pm-docs-grid">
      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.liveConfidenceLabel }}</span>
            <h3>{{ copy.liveConfidenceTitle }}</h3>
          </div>
          <span class="pm-badge" :class="confidenceReadinessTone">{{ confidenceReadinessLabel }}</span>
        </div>
        <p>{{ copy.liveConfidenceBody }}</p>

        <div class="pm-docs-grid three pm-progress-grid">
          <section class="pm-progress-card">
            <div class="pm-progress-header">
              <h4>{{ copy.liveConfidenceReadiness }}</h4>
              <span class="pm-badge" :class="confidenceReadinessTone">{{ confidenceReadinessLabel }}</span>
            </div>
            <ul class="pm-progress-list">
              <li>{{ copy.liveQualifiedRuns }} {{ confidenceProgress.readiness.qualifiedRuns }}/{{ confidenceProgress.readiness.minimumQualifiedRuns }}</li>
              <li>
                {{ copy.liveQualifiedPasses }}
                {{ confidenceProgress.readiness.qualifiedConsecutivePasses }}/{{ confidenceProgress.readiness.minimumConsecutivePasses }}
              </li>
              <li>{{ copy.liveRemainingQualifiedRuns }} {{ confidenceProgress.readiness.remainingQualifiedRuns }}</li>
              <li>{{ copy.liveRemainingQualifiedPassGap }} {{ confidenceProgress.readiness.remainingConsecutivePasses }}</li>
              <li>{{ copy.liveUpdatedAt }} {{ confidenceUpdatedAt }}</li>
            </ul>
          </section>

          <section class="pm-progress-card">
            <div class="pm-progress-header">
              <h4>{{ copy.liveConfidenceLatest }}</h4>
              <span class="pm-badge safe">{{ copy.liveConfidenceEvidence }}</span>
            </div>
            <ul class="pm-progress-list">
              <li>{{ copy.liveLatestQualifiedRun }} {{ confidenceLatestQualifiedRun }}</li>
              <li>{{ copy.liveLatestQualifiedSha }} <code>{{ confidenceLatestQualifiedSha }}</code></li>
              <li>{{ copy.liveLatestVisibleRun }} {{ confidenceLatestVisibleRun }}</li>
            </ul>
          </section>

          <section class="pm-progress-card">
            <div class="pm-progress-header">
              <h4>{{ copy.liveConfidenceNoise }}</h4>
              <span class="pm-badge next">{{ copy.liveConfidenceReview }}</span>
            </div>
            <ul class="pm-progress-list">
              <li>{{ copy.liveQualifiedMainlineRuns }} {{ confidenceProgress.visibility.qualifiedRuns }}</li>
              <li>{{ copy.liveLocalVisibilityRuns }} {{ confidenceProgress.visibility.localVisibilityOnlyRuns }}</li>
              <li>{{ copy.liveRemoteNoiseRuns }} {{ confidenceProgress.visibility.nonQualifiedRemoteRuns }}</li>
            </ul>
          </section>
        </div>

        <div class="pm-doc-links">
          <VPLink class="pm-doc-link" :href="`/${props.locale}/roadmap/development-progress`">{{ copy.liveConfidenceLink }}</VPLink>
          <VPLink class="pm-doc-link" :href="docMeta(locale, 'milestones').link">{{ copy.liveConfidenceMilestonesLink }}</VPLink>
          <VPLink class="pm-doc-link" :href="docMeta(locale, 'real-machine-verification-report').link">{{ copy.liveConfidenceVerificationLink }}</VPLink>
          <VPLink class="pm-doc-link" :href="reviewDigestPlanSourceLink">{{ copy.liveConfidencePlanLink }}</VPLink>
        </div>
      </article>
    </section>

    <section class="pm-docs-grid">
      <article v-for="milestone in milestones" :key="milestone.id" class="pm-roadmap-card">
        <div class="pm-roadmap-header">
          <div>
            <span class="pm-kicker">{{ stageLabel(milestone.stage) }}</span>
            <h3>{{ milestone.title[locale] }}</h3>
          </div>
          <span class="pm-badge" :class="badgeTone(milestone.stage)">{{ milestone.status[locale] }}</span>
        </div>

        <p>{{ milestone.summary[locale] }}</p>

        <section>
          <h4>{{ copy.decisionLabel }}</h4>
          <p>{{ milestone.decision[locale] }}</p>
        </section>

        <section v-if="milestone.focus">
          <h4>{{ milestone.focus.label[locale] }}</h4>
          <p>{{ milestone.focus.body[locale] }}</p>
        </section>

        <section>
          <h4>{{ copy.productOutcomeLabel }}</h4>
          <ul>
            <li v-for="item in milestone.productOutcomes[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.engineeringWorkLabel }}</h4>
          <ul>
            <li v-for="item in milestone.engineeringWork[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.entryCriteriaLabel }}</h4>
          <ul>
            <li v-for="item in milestone.entryCriteria[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.tradeoffsLabel }}</h4>
          <ul>
            <li v-for="item in milestone.tradeoffs[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.verifiedNowLabel }}</h4>
          <ul>
            <li v-for="item in milestone.verifiedNow[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.blockingGapsLabel }}</h4>
          <ul>
            <li v-for="item in milestone.blockingGaps[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.developerFocusLabel }}</h4>
          <ul>
            <li v-for="item in milestone.developerFocus[locale]" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h4>{{ copy.linkedDocsLabel }}</h4>
          <div class="pm-doc-links">
            <VPLink v-for="docId in milestone.docs" :key="docId" class="pm-doc-link" :href="docMeta(locale, docId).link">
              {{ docMeta(locale, docId).title }}
            </VPLink>
          </div>
        </section>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VPLink } from 'vitepress/theme'
import { roadmapDeveloperProgress as developerProgress, roadmapMilestones, roadmapPrinciples as principles, roadmapProgression as progression, roadmapTracks as tracks, schemeCProfile as schemeC } from '../../../data/roadmap'
import { milestoneConfidenceProgress as confidenceProgress } from '../../../data/milestone-confidence-progress'
import { docMeta, githubSourceLink, type LocaleCode } from '../../../data/docs'

const props = defineProps<{ locale: LocaleCode }>()
const locale = computed(() => props.locale)
const milestones = roadmapMilestones

const copy = computed(() => props.locale === 'zh'
  ? {
      kicker: 'Roadmap',
      title: '把路线排序、判定权衡与 Toward C 的边界放到同一页。',
      lede: '这不是营销页，也不是 TODO 清单。Roadmap 必须同时说明为什么先做什么、什么被刻意延后，以及 Toward C 到底意味着哪一种架构方向。',
      now: 'Now',
      next: 'Next',
      later: 'Later',
      productTrack: 'Product Track',
      productTitle: '对采用者可见的能力演进',
      engineeringTrack: 'Engineering Track',
      engineeringTitle: '对实施者可执行的依赖链',
      principlesLabel: 'Ordering Rules',
      principlesTitle: '路线排序原则',
      progressionLabel: 'A / B / C',
      progressionTitle: '递进状态定义',
      schemeCLabel: 'Scheme C',
      developerProgressLabel: 'Developer Progress',
      liveConfidenceLabel: 'Live Confidence',
      liveConfidenceTitle: '当前公开进度',
      liveConfidenceBody: 'Roadmap 首页现在直接显示已经进入 `promotion-ready` 的公开进度快照，开发者无需离开页面就能看到最新 qualified 主线证据、最新可见 run、visibility-only 噪声拆分，而且当第一问题是当前 CI run 时，可以先执行 `pnpm milestone:fetch:review-pack` 把 `milestone-confidence-bundle-*` 落到 `.portmanager/reports/current-ci-review-pack/`；默认同步复核链路仍然经过 `pnpm milestone:review:promotion-ready -- --limit 20`，然后才按需显式刷新公开 artifact。',
      liveConfidenceReadiness: 'Readiness',
      liveQualifiedRuns: 'Qualified runs：',
      liveQualifiedPasses: 'Qualified consecutive passes：',
      liveRemainingQualifiedRuns: 'Remaining qualified runs：',
      liveRemainingQualifiedPassGap: 'Remaining qualified pass gap：',
      liveUpdatedAt: 'Updated：',
      liveConfidenceLatest: 'Latest Evidence',
      liveConfidenceEvidence: 'Mainline evidence',
      liveLatestQualifiedRun: 'Latest qualified run：',
      liveLatestQualifiedSha: 'Latest qualified SHA：',
      liveLatestVisibleRun: 'Latest visible run：',
      liveConfidenceNoise: 'Visibility Breakdown',
      liveConfidenceReview: 'Review signal',
      liveQualifiedMainlineRuns: 'Qualified mainline runs：',
      liveLocalVisibilityRuns: 'Local visibility-only runs：',
      liveRemoteNoiseRuns: 'Non-qualified remote runs：',
      liveConfidenceLink: '打开开发进度页',
      liveConfidenceMilestonesLink: '查看里程碑明细',
      liveConfidenceVerificationLink: '真机验证报告',
      liveConfidencePlanLink: '当前方向实现计划',
      decisionLabel: '判定与取舍',
      advantagesLabel: '优势',
      costsLabel: '成本 / 风险',
      suitableWhenLabel: '适用阶段',
      notForLabel: '不适合用于',
      productOutcomeLabel: '产品结果',
      engineeringWorkLabel: '工程工作',
      entryCriteriaLabel: '进入门槛',
      tradeoffsLabel: '明确延后 / 权衡',
      verifiedNowLabel: '当前已验证',
      blockingGapsLabel: '阻塞缺口',
      developerFocusLabel: '开发者下一步',
      linkedDocsLabel: '关联文档'
    }
  : {
      kicker: 'Roadmap',
      title: 'Put sequencing, trade-offs, and the boundary of Toward C on one page.',
      lede: 'This is neither a marketing page nor a TODO dump. The roadmap has to explain why certain work comes first, what is deliberately deferred, and what architectural direction Toward C actually names.',
      now: 'Now',
      next: 'Next',
      later: 'Later',
      productTrack: 'Product Track',
      productTitle: 'Capabilities visible to adopters',
      engineeringTrack: 'Engineering Track',
      engineeringTitle: 'Dependencies executable by builders',
      principlesLabel: 'Ordering Rules',
      principlesTitle: 'Roadmap sequencing principles',
      progressionLabel: 'A / B / C',
      progressionTitle: 'Progression-state definitions',
      schemeCLabel: 'Scheme C',
      developerProgressLabel: 'Developer Progress',
      liveConfidenceLabel: 'Live Confidence',
      liveConfidenceTitle: 'Current published progress',
      liveConfidenceBody: 'The roadmap home page now exposes the published `promotion-ready` confidence snapshot directly, so developers can see the latest qualified mainline evidence, latest visible run, and visibility-only noise split; when the first question is the current CI run, they can stage `milestone-confidence-bundle-*` locally with `pnpm milestone:fetch:review-pack` into `.portmanager/reports/current-ci-review-pack/`, while the default synced review chain still runs `pnpm milestone:review:promotion-ready -- --limit 20` before any explicit artifact refresh is considered.',
      liveConfidenceReadiness: 'Readiness',
      liveQualifiedRuns: 'Qualified runs:',
      liveQualifiedPasses: 'Qualified consecutive passes:',
      liveRemainingQualifiedRuns: 'Remaining qualified runs:',
      liveRemainingQualifiedPassGap: 'Remaining qualified pass gap:',
      liveUpdatedAt: 'Updated:',
      liveConfidenceLatest: 'Latest Evidence',
      liveConfidenceEvidence: 'Mainline evidence',
      liveLatestQualifiedRun: 'Latest qualified run:',
      liveLatestQualifiedSha: 'Latest qualified SHA:',
      liveLatestVisibleRun: 'Latest visible run:',
      liveConfidenceNoise: 'Visibility Breakdown',
      liveConfidenceReview: 'Review signal',
      liveQualifiedMainlineRuns: 'Qualified mainline runs:',
      liveLocalVisibilityRuns: 'Local visibility-only runs:',
      liveRemoteNoiseRuns: 'Non-qualified remote runs:',
      liveConfidenceLink: 'Open Development Progress',
      liveConfidenceMilestonesLink: 'Open Milestones Detail',
      liveConfidenceVerificationLink: 'Open Verification Report',
      liveConfidencePlanLink: 'Open Current-Direction Plan',
      decisionLabel: 'Decision and trade-off',
      advantagesLabel: 'Advantages',
      costsLabel: 'Costs / Risks',
      suitableWhenLabel: 'Suitable When',
      notForLabel: 'Not For',
      productOutcomeLabel: 'Product Outcomes',
      engineeringWorkLabel: 'Engineering Work',
      entryCriteriaLabel: 'Entry Criteria',
      tradeoffsLabel: 'Deliberately Deferred / Trade-Offs',
      verifiedNowLabel: 'Verified Now',
      blockingGapsLabel: 'Blocking Gaps',
      developerFocusLabel: 'Developer Focus',
      linkedDocsLabel: 'Linked Docs'
    }
)

const lanes = computed(() => {
  const labels = props.locale === 'zh'
    ? {
        now: { label: 'Now', title: '当前主线' },
        next: { label: 'Next', title: '下一阶段' },
        later: { label: 'Later', title: '后续方向' }
      }
    : {
        now: { label: 'Now', title: 'Current line' },
        next: { label: 'Next', title: 'Next phase' },
        later: { label: 'Later', title: 'Later expansion' }
      }

  return (['now', 'next', 'later'] as const).map((stage) => ({
    stage,
    label: labels[stage].label,
    title: labels[stage].title,
    items: roadmapMilestones
      .filter((milestone) => milestone.stage === stage)
      .map((milestone) => milestone.title[props.locale])
  }))
})

const confidenceReadinessTone = computed(() => {
  if (confidenceProgress.readiness.status === 'promotion-ready') return 'safe'
  if (confidenceProgress.readiness.status === 'building-history') return 'next'
  return 'planned'
})

const confidenceReadinessLabel = computed(() => {
  if (confidenceProgress.readiness.status === 'promotion-ready') return 'promotion-ready'
  if (confidenceProgress.readiness.status === 'building-history') return 'building-history'
  return 'local-only'
})

const confidenceUpdatedAt = computed(() => formatTimestamp(confidenceProgress.updatedAt))
const confidenceLatestQualifiedRun = computed(() => formatRun(confidenceProgress.latestQualifiedRun))
const confidenceLatestQualifiedSha = computed(() => formatSha(confidenceProgress.latestQualifiedRun))
const confidenceLatestVisibleRun = computed(() => formatRun(confidenceProgress.latestRun))
const reviewDigestPlanSourceLink = githubSourceLink(
  'docs/plans/2026-04-21-portmanager-m2-confidence-publication-refresh-maintenance-plan.md'
)

function stageLabel(stage: string) {
  if (stage === 'now') return 'Now'
  if (stage === 'next') return 'Next'
  return 'Later'
}

function formatTimestamp(value: string | null) {
  if (!value) return props.locale === 'zh' ? 'unknown' : 'unknown'
  return value.replace('T', ' ').replace(/\.?\d{0,3}Z$/, ' UTC')
}

function formatRun(run: (typeof confidenceProgress.latestRun)) {
  if (!run?.context.runId) return props.locale === 'zh' ? 'local' : 'local'
  return `${run.context.runId}/${run.context.runAttempt ?? '1'}`
}

function formatSha(run: (typeof confidenceProgress.latestRun)) {
  return run?.context.sha ? run.context.sha.slice(0, 12) : 'local'
}

function badgeTone(stage: string) {
  if (stage === 'now') return 'safe'
  if (stage === 'next') return 'next'
  return 'planned'
}

function progressToneLabel(tone: string) {
  if (props.locale === 'zh') {
    if (tone === 'safe') return '已验证'
    if (tone === 'next') return '进行中'
    return '下一步'
  }

  if (tone === 'safe') return 'Verified'
  if (tone === 'next') return 'In Progress'
  return 'Next'
}
</script>

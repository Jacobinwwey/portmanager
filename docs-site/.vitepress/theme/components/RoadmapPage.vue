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
      <article v-for="milestone in milestones" :key="milestone.id" class="pm-roadmap-card">
        <div class="pm-roadmap-header">
          <div>
            <span class="pm-kicker">{{ stageLabel(milestone.stage) }}</span>
            <h3>{{ milestone.title[locale] }}</h3>
          </div>
          <span class="pm-badge planned">{{ milestone.status[locale] }}</span>
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
import { roadmapMilestones, roadmapPrinciples as principles, roadmapProgression as progression, roadmapTracks as tracks, schemeCProfile as schemeC } from '../../../data/roadmap'
import { docMeta, type LocaleCode } from '../../../data/docs'

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
      decisionLabel: '判定与取舍',
      advantagesLabel: '优势',
      costsLabel: '成本 / 风险',
      suitableWhenLabel: '适用阶段',
      notForLabel: '不适合用于',
      productOutcomeLabel: '产品结果',
      engineeringWorkLabel: '工程工作',
      entryCriteriaLabel: '进入门槛',
      tradeoffsLabel: '明确延后 / 权衡',
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
      decisionLabel: 'Decision and trade-off',
      advantagesLabel: 'Advantages',
      costsLabel: 'Costs / Risks',
      suitableWhenLabel: 'Suitable When',
      notForLabel: 'Not For',
      productOutcomeLabel: 'Product Outcomes',
      engineeringWorkLabel: 'Engineering Work',
      entryCriteriaLabel: 'Entry Criteria',
      tradeoffsLabel: 'Deliberately Deferred / Trade-Offs',
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

function stageLabel(stage: string) {
  if (stage === 'now') return 'Now'
  if (stage === 'next') return 'Next'
  return 'Later'
}
</script>

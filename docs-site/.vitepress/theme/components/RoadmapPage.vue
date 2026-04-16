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
          <h4>{{ copy.linkedDocsLabel }}</h4>
          <div class="pm-doc-links">
            <a v-for="docId in milestone.docs" :key="docId" class="pm-doc-link" :href="docLink(locale, docId)">
              {{ docMeta(locale, docId).title }}
            </a>
          </div>
        </section>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { roadmapMilestones, roadmapTracks as tracks } from '../../../data/roadmap'
import { docLink, docMeta, type LocaleCode } from '../../../data/docs'

const props = defineProps<{ locale: LocaleCode }>()
const locale = computed(() => props.locale)
const milestones = roadmapMilestones

const copy = computed(() => props.locale === 'zh'
  ? {
      kicker: 'Roadmap',
      title: '把产品演进、工程依赖与交付顺序放到同一条页面里。',
      lede: '这不是营销页，也不是内部 TODO 清单。Roadmap 需要同时回答两件事：PortManager 正在成为什么，以及在那之前哪些依赖必须先落地。',
      now: 'Now',
      next: 'Next',
      later: 'Later',
      productTrack: 'Product Track',
      productTitle: '对采用者可见的能力演进',
      engineeringTrack: 'Engineering Track',
      engineeringTitle: '对实施者可执行的依赖链',
      productOutcomeLabel: '产品结果',
      engineeringWorkLabel: '工程工作',
      linkedDocsLabel: '关联文档'
    }
  : {
      kicker: 'Roadmap',
      title: 'Put product evolution, engineering dependency, and delivery order on the same page.',
      lede: 'This is neither a marketing page nor an internal TODO dump. The roadmap has to answer two things at once: what PortManager is becoming, and which dependencies must land first.',
      now: 'Now',
      next: 'Next',
      later: 'Later',
      productTrack: 'Product Track',
      productTitle: 'Capabilities visible to adopters',
      engineeringTrack: 'Engineering Track',
      engineeringTitle: 'Dependencies executable by builders',
      productOutcomeLabel: 'Product Outcomes',
      engineeringWorkLabel: 'Engineering Work',
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

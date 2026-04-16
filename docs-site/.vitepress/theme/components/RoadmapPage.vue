<template>
  <section class="pm-shell">
    <div class="pm-roadmap" style="padding: 1.5rem;">
      <span class="pm-eyebrow">{{ copy.eyebrow }}</span>
      <h1 class="pm-title">{{ copy.title }}</h1>
      <p class="pm-lede">{{ copy.lede }}</p>
      <div class="pm-statline">
        <span class="pm-pill primary">{{ copy.stageNow }}</span>
        <span class="pm-pill warn">{{ copy.stageNext }}</span>
        <span class="pm-pill success">{{ copy.stageLater }}</span>
      </div>
    </div>

    <div class="pm-grid two">
      <section class="pm-panel" style="padding: 1.25rem;">
        <h2 class="pm-section-title">{{ copy.productTrack }}</h2>
        <div class="pm-lane">
          <div class="pm-chip-row">
            <span v-for="item in tracks.product[locale]" :key="item" class="pm-chip">{{ item }}</span>
          </div>
        </div>
      </section>
      <section class="pm-panel" style="padding: 1.25rem;">
        <h2 class="pm-section-title">{{ copy.engineeringTrack }}</h2>
        <div class="pm-lane">
          <div class="pm-chip-row">
            <span v-for="item in tracks.engineering[locale]" :key="item" class="pm-chip">{{ item }}</span>
          </div>
        </div>
      </section>
    </div>

    <section class="pm-panel" style="padding: 1.35rem;">
      <h2 class="pm-section-title">{{ copy.timelineTitle }}</h2>
      <div class="pm-grid three">
        <article v-for="milestone in milestones" :key="milestone.id" class="pm-card">
          <span class="pm-eyebrow">{{ stageLabel(milestone.stage) }}</span>
          <div class="pm-card-title">
            <h3>{{ milestone.title[locale] }}</h3>
            <span class="pm-pill primary">{{ milestone.status[locale] }}</span>
          </div>
          <p>{{ milestone.summary[locale] }}</p>
          <h4 style="margin-top: 1rem;">{{ copy.productOutcomeLabel }}</h4>
          <ul class="pm-list">
            <li v-for="item in milestone.productOutcomes[locale]" :key="item">{{ item }}</li>
          </ul>
          <h4 style="margin-top: 1rem;">{{ copy.engineeringWorkLabel }}</h4>
          <ul class="pm-list">
            <li v-for="item in milestone.engineeringWork[locale]" :key="item">{{ item }}</li>
          </ul>
          <h4 style="margin-top: 1rem;">{{ copy.linkedDocsLabel }}</h4>
          <div class="pm-statline">
            <a v-for="docId in milestone.docs" :key="docId" :href="docLink(locale, docId)" class="pm-pill primary">{{ docMeta(locale, docId).title }}</a>
          </div>
        </article>
      </div>
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
      eyebrow: 'Roadmap',
      title: '把产品演进和工程依赖放在同一条可读的时间线上。',
      lede: 'Roadmap 不只是对外叙事页，也不是仅供内部看的 TODO 清单。它同时回答：PortManager 正在成为什么，以及接下来必须先完成什么。',
      stageNow: 'Now',
      stageNext: 'Next',
      stageLater: 'Later',
      productTrack: 'Product Track',
      engineeringTrack: 'Engineering Track',
      timelineTitle: 'Milestone Cards',
      productOutcomeLabel: '产品结果',
      engineeringWorkLabel: '工程工作',
      linkedDocsLabel: '关联文档'
    }
  : {
      eyebrow: 'Roadmap',
      title: 'Read product evolution and engineering dependency in the same timeline.',
      lede: 'The roadmap is not only a public narrative page, and not only an internal TODO stack. It answers both: what PortManager is becoming, and what must be completed first.',
      stageNow: 'Now',
      stageNext: 'Next',
      stageLater: 'Later',
      productTrack: 'Product Track',
      engineeringTrack: 'Engineering Track',
      timelineTitle: 'Milestone Cards',
      productOutcomeLabel: 'Product Outcomes',
      engineeringWorkLabel: 'Engineering Work',
      linkedDocsLabel: 'Linked Docs'
    }
)

function stageLabel(stage: string) {
  if (props.locale === 'zh') {
    if (stage === 'now') return 'Now'
    if (stage === 'next') return 'Next'
    return 'Later'
  }
  if (stage === 'now') return 'Now'
  if (stage === 'next') return 'Next'
  return 'Later'
}
</script>

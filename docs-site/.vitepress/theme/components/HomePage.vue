<template>
  <section class="pm-shell">
    <div class="pm-hero">
      <span class="pm-eyebrow">{{ copy.eyebrow }}</span>
      <h1 class="pm-title">{{ copy.title }}</h1>
      <p class="pm-lede">{{ copy.lede }}</p>
      <div class="pm-statline">
        <span class="pm-pill primary">{{ copy.pills[0] }}</span>
        <span class="pm-pill success">{{ copy.pills[1] }}</span>
        <span class="pm-pill warn">{{ copy.pills[2] }}</span>
      </div>
    </div>

    <div class="pm-grid two">
      <a v-for="card in copy.audiences" :key="card.href" class="pm-link-card" :href="card.href">
        <article class="pm-card">
          <span class="pm-eyebrow">{{ card.eyebrow }}</span>
          <div class="pm-card-title">
            <h3>{{ card.title }}</h3>
            <span class="pm-pill primary">{{ card.cta }}</span>
          </div>
          <p>{{ card.description }}</p>
        </article>
      </a>
    </div>

    <QuickStartCards :locale="locale" />

    <section class="pm-panel" style="padding: 1.4rem;">
      <h2 class="pm-section-title">{{ copy.sectionTitle }}</h2>
      <div class="pm-grid three">
        <a v-for="card in copy.sections" :key="card.href" class="pm-link-card" :href="card.href">
          <article class="pm-card">
            <span class="pm-eyebrow">{{ card.eyebrow }}</span>
            <div class="pm-card-title">
              <h3>{{ card.title }}</h3>
            </div>
            <p>{{ card.description }}</p>
          </article>
        </a>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QuickStartCards from './QuickStartCards.vue'

const props = defineProps<{ locale: 'en' | 'zh' }>()

const copy = computed(() => {
  if (props.locale === 'zh') {
    return {
      eyebrow: 'PortManager Docs',
      title: '把规范、角色入口与 agent 契约整合成同一个发布层。',
      lede: '这是 PortManager 的正式文档站发布层。它从仓库中的双语原始规范提取内容，并重新组织为 Human / Agent 双入口、Reference、Architecture、Operations 与 Roadmap。',
      pills: ['GitHub Pages', 'Human / Agent Split', 'Docs-First Truth'],
      audiences: [
        { eyebrow: 'Human', title: '给操作者、部署者与贡献者的入口', description: '从 Quick Start、角色入口和风险边界开始，再进入架构、运维与参考文档。', href: '/zh/human/', cta: '进入 Human' },
        { eyebrow: 'Agent', title: '给自动化代理与非交互工作流的入口', description: '优先阅读确定性输入输出、JSON / wait 语义、REST + SSE 与契约参考。', href: '/zh/agent/', cta: '进入 Agent' }
      ],
      sectionTitle: '核心栏目',
      sections: [
        { eyebrow: 'Reference', title: '公共契约与接口参考', description: 'OpenAPI、JSON Schema 与公共结果模型的入口。', href: '/zh/reference/' },
        { eyebrow: 'Architecture', title: '系统决策与设计基线', description: 'V1 架构、契约策略、UI 信息架构与设计母版。', href: '/zh/architecture/' },
        { eyebrow: 'Operations', title: '部署、安装与恢复边界', description: '安装契约、快照诊断、备份与回滚策略。', href: '/zh/operations/' },
        { eyebrow: 'Roadmap', title: '双层路线图', description: '同一页同时查看产品演进和工程实施路线。', href: '/zh/roadmap' },
        { eyebrow: 'Overview', title: '基线与规格总览', description: '产品规格、仓库基线与首次验收清单。', href: '/zh/overview/product-spec' },
        { eyebrow: 'Archive', title: '归档与稳定接口', description: '当前暂无版本切换，但已预留归档区与稳定路由。', href: '/zh/archive/' }
      ]
    }
  }

  return {
    eyebrow: 'PortManager Docs',
    title: 'One publishing layer for specs, role guides, and agent-facing contracts.',
    lede: 'This site is the public documentation layer for PortManager. It extracts bilingual raw specs from the repository and reorganizes them into Human / Agent entrypoints, Reference, Architecture, Operations, and Roadmap.',
    pills: ['GitHub Pages', 'Human / Agent Split', 'Docs-First Truth'],
    audiences: [
      { eyebrow: 'Human', title: 'For operators, self-hosters, and contributors', description: 'Start from Quick Start, role entry pages, and operational boundaries before diving into architecture and reference docs.', href: '/en/human/', cta: 'Enter Human' },
      { eyebrow: 'Agent', title: 'For automation, non-interactive flows, and future agent consumers', description: 'Prioritize deterministic inputs and outputs, JSON / wait semantics, REST + SSE, and contract reference.', href: '/en/agent/', cta: 'Enter Agent' }
    ],
    sectionTitle: 'Core Sections',
    sections: [
      { eyebrow: 'Reference', title: 'Public contracts and interface reference', description: 'Entry points for OpenAPI, JSON Schema, and result-shape reference.', href: '/en/reference/' },
      { eyebrow: 'Architecture', title: 'System decisions and design baseline', description: 'V1 architecture, contract strategy, UI information architecture, and design mother-template.', href: '/en/architecture/' },
      { eyebrow: 'Operations', title: 'Deployment, install, and recovery boundaries', description: 'Install contract, diagnostics, snapshots, backup, and rollback policy.', href: '/en/operations/' },
      { eyebrow: 'Roadmap', title: 'Dual-track roadmap', description: 'See product evolution and engineering delivery in the same page.', href: '/en/roadmap' },
      { eyebrow: 'Overview', title: 'Baseline and specification overview', description: 'Product specification, repository baseline, and first acceptance checklist.', href: '/en/overview/product-spec' },
      { eyebrow: 'Archive', title: 'Archive and stable route surface', description: 'No version switcher yet, but the archive area and stable routes are already reserved.', href: '/en/archive/' }
    ]
  }
})
</script>

<template>
  <section class="pm-shell">
    <div class="pm-hero">
      <span class="pm-eyebrow">{{ copy.eyebrow }}</span>
      <h1 class="pm-title">{{ copy.title }}</h1>
      <p class="pm-lede">{{ copy.lede }}</p>
    </div>

    <section class="pm-panel" style="padding: 1.35rem;">
      <h2 class="pm-section-title">{{ copy.sectionTitle }}</h2>
      <div v-if="copy.links.length > 0" class="pm-grid two">
        <a v-for="link in copy.links" :key="link.href" class="pm-link-card" :href="link.href">
          <article class="pm-card">
            <span class="pm-eyebrow">{{ link.eyebrow }}</span>
            <div class="pm-card-title"><h3>{{ link.title }}</h3></div>
            <p>{{ link.description }}</p>
          </article>
        </a>
      </div>
      <div v-else class="pm-empty">{{ copy.empty }}</div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale: 'en' | 'zh'; section: 'reference' | 'architecture' | 'operations' | 'archive' }>()

const sectionContent = {
  en: {
    reference: {
      eyebrow: 'Reference',
      title: 'Stable interface and contract reference.',
      lede: 'Use this section when you need to inspect what the system publishes: OpenAPI, JSON Schema, contract ownership, and future SDK-facing shapes.',
      sectionTitle: 'Reference Entry Points',
      links: [
        { eyebrow: 'Contracts', title: 'Contracts Baseline', description: 'Shared contract ownership for Web, controller, CLI, agent, and SDKs.', href: '/en/reference/contracts-baseline' },
        { eyebrow: 'OpenAPI', title: 'OpenAPI Reference', description: 'Controller API draft and route surface.', href: '/en/reference/openapi' },
        { eyebrow: 'JSON Schema', title: 'JSON Schema Reference', description: 'Runtime, operation, rollback, and diagnostics result shapes.', href: '/en/reference/json-schemas' }
      ]
    },
    architecture: {
      eyebrow: 'Architecture',
      title: 'The system decisions that the implementation must honor.',
      lede: 'Architecture is where PortManager records invariants: service split, state ownership, contract strategy, bootstrap order, and the frozen UI language.',
      sectionTitle: 'Architecture Documents',
      links: [
        { eyebrow: 'Core', title: 'V1 Architecture', description: 'Top-level service split, topology, and lifecycle model.', href: '/en/architecture/v1-architecture' },
        { eyebrow: 'Contracts', title: 'Contract Strategy', description: 'Why OpenAPI + JSON Schema + codegen is non-negotiable.', href: '/en/architecture/contract-strategy' },
        { eyebrow: 'Bootstrap', title: 'Agent Bootstrap', description: 'Ordered bootstrap flow and rescue boundary.', href: '/en/architecture/agent-bootstrap' },
        { eyebrow: 'Design', title: 'Overview Design Baseline', description: 'The official mother-template and layout language.', href: '/en/architecture/overview-design-baseline' },
        { eyebrow: 'Publishing', title: 'Docs Site Architecture', description: 'How raw bilingual truth becomes the published docs site.', href: '/en/architecture/docs-site-architecture' }
      ]
    },
    operations: {
      eyebrow: 'Operations',
      title: 'Install, diagnose, back up, and recover without ambiguity.',
      lede: 'Operations documents define how the system is installed, how diagnostics are interpreted, and what safety guarantees exist around mutation and rollback.',
      sectionTitle: 'Operations Documents',
      links: [
        { eyebrow: 'Install', title: 'Install and Distribution Contract', description: 'One-line installation contract for Human and Agent entrypoints.', href: '/en/operations/install-distribution-contract' },
        { eyebrow: 'Diagnostics', title: 'Snapshot and Diagnostics', description: 'Controller-side capture expectations and artifact handling.', href: '/en/operations/snapshot-diagnostics' },
        { eyebrow: 'Safety', title: 'Backup and Rollback Policy', description: 'Backup classes, policy levels, and rollback boundaries.', href: '/en/operations/backup-rollback-policy' },
        { eyebrow: 'Deployment', title: 'SDK and Docker Boundary', description: 'Self-hosted control-plane deployment limits for V1.', href: '/en/operations/sdk-and-docker-boundary' }
      ]
    },
    archive: {
      eyebrow: 'Archive',
      title: 'No version switcher yet, but the archive boundary is already reserved.',
      lede: 'The first release does not ship multiple active versions. This area is intentionally present so future archived documentation has a stable home.',
      sectionTitle: 'Archive Status',
      empty: 'No archived documentation is published yet.',
      links: []
    }
  },
  zh: {
    reference: {
      eyebrow: 'Reference',
      title: '稳定接口与契约参考。',
      lede: '当你需要看清系统到底对外发布什么时，请先进入这里：OpenAPI、JSON Schema、契约归属与未来 SDK 形态。',
      sectionTitle: 'Reference 入口',
      links: [
        { eyebrow: 'Contracts', title: '契约基线', description: 'Web、controller、CLI、agent 与 SDK 共享的契约归属。', href: '/zh/reference/contracts-baseline' },
        { eyebrow: 'OpenAPI', title: 'OpenAPI 参考', description: 'Controller API 草案与路由面。', href: '/zh/reference/openapi' },
        { eyebrow: 'JSON Schema', title: 'JSON Schema 参考', description: 'Runtime、operation、rollback 与 diagnostics 结果模型。', href: '/zh/reference/json-schemas' }
      ]
    },
    architecture: {
      eyebrow: 'Architecture',
      title: '实现必须尊重的系统决策。',
      lede: 'Architecture 用来记录 PortManager 的不变量：服务拆分、状态归属、契约策略、bootstrap 顺序，以及冻结的 UI 语言。',
      sectionTitle: 'Architecture 文档',
      links: [
        { eyebrow: 'Core', title: 'V1 架构', description: '顶层服务拆分、拓扑与生命周期模型。', href: '/zh/architecture/v1-architecture' },
        { eyebrow: 'Contracts', title: '契约策略', description: '为什么 OpenAPI + JSON Schema + codegen 不可谈判。', href: '/zh/architecture/contract-strategy' },
        { eyebrow: 'Bootstrap', title: 'Agent Bootstrap', description: '按顺序的 bootstrap 流程与 rescue 边界。', href: '/zh/architecture/agent-bootstrap' },
        { eyebrow: 'Design', title: 'Overview 设计基线', description: '官方视觉母版与布局语言。', href: '/zh/architecture/overview-design-baseline' },
        { eyebrow: 'Publishing', title: '文档站架构', description: '双语原始真源如何变成公开文档站。', href: '/zh/architecture/docs-site-architecture' }
      ]
    },
    operations: {
      eyebrow: 'Operations',
      title: '安装、诊断、备份与恢复都不再模糊。',
      lede: 'Operations 文档定义系统如何安装、诊断如何解释，以及 destructive mutation 与 rollback 周围有哪些安全保证。',
      sectionTitle: 'Operations 文档',
      links: [
        { eyebrow: 'Install', title: '安装与分发契约', description: 'Human 与 Agent 一行入口的公共契约。', href: '/zh/operations/install-distribution-contract' },
        { eyebrow: 'Diagnostics', title: '快照与诊断', description: 'controller-side capture 的预期与产物处理。', href: '/zh/operations/snapshot-diagnostics' },
        { eyebrow: 'Safety', title: '备份与回滚策略', description: '备份类别、策略级别与回滚边界。', href: '/zh/operations/backup-rollback-policy' },
        { eyebrow: 'Deployment', title: 'SDK 与 Docker 边界', description: 'V1 的 self-hosted control-plane 部署边界。', href: '/zh/operations/sdk-and-docker-boundary' }
      ]
    },
    archive: {
      eyebrow: 'Archive',
      title: '首版没有版本切换器，但归档边界已经预留。',
      lede: '第一次发布不会同时维护多个活跃版本。这里被刻意保留下来，作为未来归档文档的稳定入口。',
      sectionTitle: 'Archive 状态',
      empty: '当前还没有公开归档文档。',
      links: []
    }
  }
}

const copy = computed(() => sectionContent[props.locale][props.section])
</script>

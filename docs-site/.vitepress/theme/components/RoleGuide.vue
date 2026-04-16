<template>
  <section class="pm-shell">
    <div class="pm-hero">
      <span class="pm-eyebrow">{{ copy.eyebrow }}</span>
      <h1 class="pm-title">{{ copy.title }}</h1>
      <p class="pm-lede">{{ copy.lede }}</p>
      <div class="pm-statline">
        <span v-for="pill in copy.pills" :key="pill" class="pm-pill primary">{{ pill }}</span>
      </div>
    </div>

    <section class="pm-panel" style="padding: 1.35rem;">
      <h2 class="pm-section-title">{{ copy.startTitle }}</h2>
      <div class="pm-grid two">
        <a v-for="link in copy.links" :key="link.href" class="pm-link-card" :href="link.href">
          <article class="pm-card">
            <span class="pm-eyebrow">{{ link.eyebrow }}</span>
            <div class="pm-card-title"><h3>{{ link.title }}</h3></div>
            <p>{{ link.description }}</p>
          </article>
        </a>
      </div>
    </section>

    <section class="pm-panel" style="padding: 1.35rem;">
      <h2 class="pm-section-title">{{ copy.expectationTitle }}</h2>
      <ul class="pm-list">
        <li v-for="item in copy.expectations" :key="item">{{ item }}</li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale: 'en' | 'zh'; role: 'operator' | 'self-host-admin' | 'sdk-integrator' | 'contributor' }>()

const roleContent = {
  en: {
    operator: {
      eyebrow: 'Human / Operator',
      title: 'Observe health, verify rules, and recover safely.',
      lede: 'Operator docs focus on what the system is doing now: host state, rule state, diagnostics evidence, operations, and rollback confidence.',
      pills: ['Diagnostics', 'Operations', 'Rollback'],
      startTitle: 'Start Here',
      expectationTitle: 'What this role needs',
      expectations: ['See whether a rule is active or degraded.', 'Inspect snapshots, TCP reachability, HTTP/TLS basics.', 'Understand what backup and rollback evidence means.'],
      links: [
        { eyebrow: 'Operations', title: 'Snapshot and Diagnostics', description: 'Read the evidence model for page snapshots and transport checks.', href: '/en/operations/snapshot-diagnostics' },
        { eyebrow: 'Operations', title: 'Backup and Rollback Policy', description: 'Understand the safety boundary around destructive change.', href: '/en/operations/backup-rollback-policy' },
        { eyebrow: 'Architecture', title: 'UI Information Architecture', description: 'See where diagnostics, health, and event-stream surfaces live in the UI.', href: '/en/architecture/ui-information-architecture' }
      ]
    },
    'self-host-admin': {
      eyebrow: 'Human / Self-Host Admin',
      title: 'Deploy the control plane without losing the operational boundaries.',
      lede: 'Admin docs focus on installation shape, self-hosted deployment, host bootstrap, and what stays native versus containerized.',
      pills: ['Quick Start', 'Bootstrap', 'Self-Hosted'],
      startTitle: 'Start Here',
      expectationTitle: 'What this role needs',
      expectations: ['Understand the one-line install contract.', 'Know what Docker covers and what stays outside containers.', 'Know the bootstrap preconditions for managed hosts.'],
      links: [
        { eyebrow: 'Operations', title: 'Install and Distribution Contract', description: 'See the preferred and fastest one-line install shapes.', href: '/en/operations/install-distribution-contract' },
        { eyebrow: 'Operations', title: 'SDK and Docker Boundary', description: 'Read the self-hosted control-plane deployment boundary.', href: '/en/operations/sdk-and-docker-boundary' },
        { eyebrow: 'Architecture', title: 'Agent Bootstrap', description: 'Read the ordered bootstrap flow and rescue boundary.', href: '/en/architecture/agent-bootstrap' }
      ]
    },
    'sdk-integrator': {
      eyebrow: 'Human / SDK Integrator',
      title: 'Start from contracts, not from guessed DTOs.',
      lede: 'Integrator docs focus on OpenAPI, JSON Schema, generated types, and stable result shapes across Web, CLI, and future SDKs.',
      pills: ['OpenAPI', 'JSON Schema', 'Codegen'],
      startTitle: 'Start Here',
      expectationTitle: 'What this role needs',
      expectations: ['Know which contract owns which surface.', 'Consume operation, diagnostic, and rollback shapes consistently.', 'Avoid hand-maintained parallel DTO trees.'],
      links: [
        { eyebrow: 'Reference', title: 'Contracts Baseline', description: 'Read the public contract ownership split.', href: '/en/reference/contracts-baseline' },
        { eyebrow: 'Reference', title: 'OpenAPI Reference', description: 'Inspect the controller-side API draft and route surface.', href: '/en/reference/openapi' },
        { eyebrow: 'Architecture', title: 'Contract Strategy', description: 'Understand why codegen is a hard rule.', href: '/en/architecture/contract-strategy' }
      ]
    },
    contributor: {
      eyebrow: 'Human / Contributor',
      title: 'Change docs, design, and contracts without creating a second truth layer.',
      lede: 'Contributor docs focus on docs-first rules, raw-source ownership, design baseline, roadmap, and the implementation handoff surface.',
      pills: ['Docs-First', 'Design Baseline', 'Roadmap'],
      startTitle: 'Start Here',
      expectationTitle: 'What this role needs',
      expectations: ['Keep raw bilingual docs as the truth layer.', 'Update docs-site mappings when public docs change.', 'Treat design baseline and contract changes as first-class decisions.'],
      links: [
        { eyebrow: 'Architecture', title: 'Docs Site Architecture', description: 'Read the publishing model and governance rules.', href: '/en/architecture/docs-site-architecture' },
        { eyebrow: 'Architecture', title: 'Overview Design Baseline', description: 'Stay aligned with the frozen visual mother-template.', href: '/en/architecture/overview-design-baseline' },
        { eyebrow: 'Roadmap', title: 'Milestones Detail', description: 'Track implementation sequencing and future expansion.', href: '/en/roadmap/milestones' }
      ]
    }
  },
  zh: {
    operator: {
      eyebrow: 'Human / Operator',
      title: '看清健康状态、验证规则，并且可安全恢复。',
      lede: 'Operator 文档聚焦系统当前在做什么：主机状态、规则状态、诊断证据、operations 与 rollback 信心。',
      pills: ['Diagnostics', 'Operations', 'Rollback'],
      startTitle: '先看这些',
      expectationTitle: '这个角色真正关心什么',
      expectations: ['看清一条规则是 active 还是 degraded。', '检查网页快照、TCP 可达性、HTTP/TLS 基础信息。', '理解 backup 与 rollback 证据意味着什么。'],
      links: [
        { eyebrow: 'Operations', title: '快照与诊断', description: '阅读页面快照与传输检查的证据模型。', href: '/zh/operations/snapshot-diagnostics' },
        { eyebrow: 'Operations', title: '备份与回滚策略', description: '理解 destructive change 周围的安全边界。', href: '/zh/operations/backup-rollback-policy' },
        { eyebrow: 'Architecture', title: 'UI 信息架构', description: '查看 diagnostics、health 与 event stream 在界面中的位置。', href: '/zh/architecture/ui-information-architecture' }
      ]
    },
    'self-host-admin': {
      eyebrow: 'Human / Self-Host Admin',
      title: '在不丢掉运维边界的前提下部署控制平面。',
      lede: 'Admin 文档聚焦安装形态、自托管部署、主机 bootstrap，以及哪些部分容器化、哪些部分保持原生。',
      pills: ['Quick Start', 'Bootstrap', 'Self-Hosted'],
      startTitle: '先看这些',
      expectationTitle: '这个角色真正关心什么',
      expectations: ['理解一行安装契约。', '知道 Docker 覆盖什么、什么不进入容器。', '知道受管主机 bootstrap 的前置条件。'],
      links: [
        { eyebrow: 'Operations', title: '安装与分发契约', description: '查看 preferred / fastest 两类一行安装形态。', href: '/zh/operations/install-distribution-contract' },
        { eyebrow: 'Operations', title: 'SDK 与 Docker 边界', description: '阅读 self-hosted control plane 的部署边界。', href: '/zh/operations/sdk-and-docker-boundary' },
        { eyebrow: 'Architecture', title: 'Agent Bootstrap', description: '阅读按顺序的 bootstrap 流程与 rescue 边界。', href: '/zh/architecture/agent-bootstrap' }
      ]
    },
    'sdk-integrator': {
      eyebrow: 'Human / SDK Integrator',
      title: '从契约开始，而不是从猜测 DTO 开始。',
      lede: 'Integrator 文档聚焦 OpenAPI、JSON Schema、生成类型，以及 Web、CLI 与未来 SDK 共享的稳定结果模型。',
      pills: ['OpenAPI', 'JSON Schema', 'Codegen'],
      startTitle: '先看这些',
      expectationTitle: '这个角色真正关心什么',
      expectations: ['知道哪套契约负责哪一层接口。', '统一消费 operation、diagnostic 与 rollback 结构。', '避免维护平行的手写 DTO 树。'],
      links: [
        { eyebrow: 'Reference', title: '契约基线', description: '阅读公共契约的归属拆分。', href: '/zh/reference/contracts-baseline' },
        { eyebrow: 'Reference', title: 'OpenAPI 参考', description: '查看 controller API 草案与路由面。', href: '/zh/reference/openapi' },
        { eyebrow: 'Architecture', title: '契约策略', description: '理解为何 codegen 是硬规则。', href: '/zh/architecture/contract-strategy' }
      ]
    },
    contributor: {
      eyebrow: 'Human / Contributor',
      title: '改动文档、设计与契约时，不要制造第二层真源。',
      lede: 'Contributor 文档聚焦 docs-first 规则、原始真源归属、设计基线、roadmap 与实现交接边界。',
      pills: ['Docs-First', 'Design Baseline', 'Roadmap'],
      startTitle: '先看这些',
      expectationTitle: '这个角色真正关心什么',
      expectations: ['保持双语原始文档为真源。', '公共文档变更时同步更新 docs-site 映射。', '把设计基线与契约变更视为一等决策。'],
      links: [
        { eyebrow: 'Architecture', title: '文档站架构', description: '阅读发布模型与治理规则。', href: '/zh/architecture/docs-site-architecture' },
        { eyebrow: 'Architecture', title: 'Overview 设计基线', description: '与已冻结的视觉母版保持对齐。', href: '/zh/architecture/overview-design-baseline' },
        { eyebrow: 'Roadmap', title: '里程碑明细', description: '跟踪实现顺序与后续扩展。', href: '/zh/roadmap/milestones' }
      ]
    }
  }
}

const copy = computed(() => roleContent[props.locale][props.role])
</script>

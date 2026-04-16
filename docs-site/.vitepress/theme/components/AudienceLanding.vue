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

    <QuickStartCards v-if="audience === 'human'" :locale="locale" />

    <section class="pm-panel" style="padding: 1.35rem;">
      <h2 class="pm-section-title">{{ copy.sectionTitle }}</h2>
      <div class="pm-grid two">
        <a v-for="card in copy.cards" :key="card.href" class="pm-link-card" :href="card.href">
          <article class="pm-card">
            <span class="pm-eyebrow">{{ card.eyebrow }}</span>
            <div class="pm-card-title"><h3>{{ card.title }}</h3></div>
            <p>{{ card.description }}</p>
            <span class="pm-pill success">{{ card.cta }}</span>
          </article>
        </a>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QuickStartCards from './QuickStartCards.vue'

const props = defineProps<{ locale: 'en' | 'zh'; audience: 'human' | 'agent' }>()

const copy = computed(() => {
  const zh = props.locale === 'zh'
  if (props.audience === 'human') {
    return zh
      ? {
          eyebrow: 'Human',
          title: '从角色入口进入，而不是从零散规范里硬找。',
          lede: 'Human 文档面向真实操作者、self-host admin、SDK 集成者与贡献者。这里允许叙事、上下文和边界说明，但不能丢失工程精度。',
          pills: ['Operator', 'Self-Host Admin', 'SDK Integrator'],
          sectionTitle: '角色入口',
          cards: [
            { eyebrow: 'Operator', title: 'Operator', description: '先看系统怎么被观察、诊断和回滚。', href: '/zh/human/operator', cta: '进入角色页' },
            { eyebrow: 'Admin', title: 'Self-Host Admin', description: '先看部署、安装、一行入口与 bootstrap 边界。', href: '/zh/human/self-host-admin', cta: '进入角色页' },
            { eyebrow: 'Integrator', title: 'SDK Integrator', description: '先看契约、API 与代码生成边界。', href: '/zh/human/sdk-integrator', cta: '进入角色页' },
            { eyebrow: 'Contributor', title: 'Contributor', description: '先看 docs-first、设计基线与实现里程碑。', href: '/zh/human/contributor', cta: '进入角色页' }
          ]
        }
      : {
          eyebrow: 'Human',
          title: 'Enter through roles instead of scavenging through raw specs.',
          lede: 'Human docs are for real operators, self-host admins, SDK integrators, and contributors. They can carry narrative and context, but they still keep engineering precision.',
          pills: ['Operator', 'Self-Host Admin', 'SDK Integrator'],
          sectionTitle: 'Role Entry Points',
          cards: [
            { eyebrow: 'Operator', title: 'Operator', description: 'Start with how the system is observed, diagnosed, and rolled back.', href: '/en/human/operator', cta: 'Open role page' },
            { eyebrow: 'Admin', title: 'Self-Host Admin', description: 'Start with deployment, install, one-line entrypoints, and bootstrap boundaries.', href: '/en/human/self-host-admin', cta: 'Open role page' },
            { eyebrow: 'Integrator', title: 'SDK Integrator', description: 'Start with contracts, APIs, and codegen boundaries.', href: '/en/human/sdk-integrator', cta: 'Open role page' },
            { eyebrow: 'Contributor', title: 'Contributor', description: 'Start with docs-first rules, design baseline, and implementation milestones.', href: '/en/human/contributor', cta: 'Open role page' }
          ]
        }
  }

  return zh
    ? {
        eyebrow: 'Agent',
        title: '先给确定性入口，再给解释。',
        lede: 'Agent 页面不和 Human 页面混写。它们优先暴露 machine-readable 的命令、输入输出语义、事件流、契约与状态模型。',
        pills: ['Deterministic', 'Non-Interactive', 'Contract-Driven'],
        sectionTitle: 'Agent 工作流入口',
        cards: [
          { eyebrow: 'Quickstart', title: 'Agent Quickstart', description: '从最短命令形态与 prerequisites 开始。', href: '/zh/agent/quickstart', cta: '打开页面' },
          { eyebrow: 'Flows', title: 'Non-Interactive Flows', description: '阅读 wait、JSON、event stream 与错误边界。', href: '/zh/agent/non-interactive', cta: '打开页面' },
          { eyebrow: 'Reference', title: 'Reference', description: '直接进入 OpenAPI、JSON Schema 与结果模型。', href: '/zh/reference/', cta: '查看参考' },
          { eyebrow: 'Architecture', title: 'Architecture', description: '查看 agent 在系统中的职责与边界。', href: '/zh/architecture/agent-bootstrap', cta: '查看架构' }
        ]
      }
    : {
        eyebrow: 'Agent',
        title: 'Deterministic entrypoints first, explanation second.',
        lede: 'Agent pages do not mingle with Human pages. They prioritize machine-readable command shapes, input/output semantics, event streams, contracts, and state models.',
        pills: ['Deterministic', 'Non-Interactive', 'Contract-Driven'],
        sectionTitle: 'Agent Entry Points',
        cards: [
          { eyebrow: 'Quickstart', title: 'Agent Quickstart', description: 'Start from shortest command shapes and prerequisites.', href: '/en/agent/quickstart', cta: 'Open page' },
          { eyebrow: 'Flows', title: 'Non-Interactive Flows', description: 'Read wait, JSON, event-stream, and error semantics.', href: '/en/agent/non-interactive', cta: 'Open page' },
          { eyebrow: 'Reference', title: 'Reference', description: 'Jump directly to OpenAPI, JSON Schema, and result shapes.', href: '/en/reference/', cta: 'View reference' },
          { eyebrow: 'Architecture', title: 'Architecture', description: 'See the agent role and boundaries in the system.', href: '/en/architecture/agent-bootstrap', cta: 'View architecture' }
        ]
      }
})
</script>

<template>
  <section class="pm-docs-section">
    <div class="pm-docs-grid two">
      <article class="pm-doc-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.preferred.kicker }}</span>
            <h3>{{ copy.preferred.title }}</h3>
          </div>
          <span class="pm-badge planned">{{ copy.statusPlanned }}</span>
        </div>
        <p>{{ copy.preferred.description }}</p>
        <pre><code>{{ copy.preferred.command }}</code></pre>
        <ul>
          <li v-for="item in copy.preferred.notes" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="pm-callout-card">
        <div class="pm-card-header">
          <div>
            <span class="pm-kicker">{{ copy.reality.kicker }}</span>
            <h3>{{ copy.reality.title }}</h3>
          </div>
          <span class="pm-badge safe">{{ copy.reality.label }}</span>
        </div>
        <p>{{ copy.reality.description }}</p>
        <div class="pm-doc-links">
          <a class="pm-doc-link" :href="copy.reality.humanHref">{{ copy.reality.humanLink }}</a>
          <a class="pm-doc-link" :href="copy.reality.agentHref">{{ copy.reality.agentLink }}</a>
          <a class="pm-doc-link" :href="copy.reality.installHref">{{ copy.reality.installLink }}</a>
        </div>
      </article>
    </div>

    <details class="pm-doc-details">
      <summary>{{ copy.fastest.summary }}</summary>
      <p class="pm-doc-note">{{ copy.fastest.description }}</p>
      <pre><code>{{ copy.fastest.command }}</code></pre>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale: 'en' | 'zh' }>()

const copy = computed(() => {
  if (props.locale === 'zh') {
    return {
      statusPlanned: 'Planned',
      preferred: {
        kicker: 'Preferred',
        title: '默认展示的安全型一行安装入口',
        description: 'Human 文档默认暴露更可审计的 control plane 安装形态。当前产品仍处于 docs-first 阶段，所以命令契约已经冻结，但状态必须明确标记为 Planned。',
        command: 'docker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d',
        notes: [
          '目标形态是 self-hosted control plane 的标准入口。',
          '实现未发布前，文档只能固化命令形态与约束，不能假装它已可用。'
        ]
      },
      reality: {
        kicker: 'Contract',
        title: '先锁定入口，再锁定实现',
        label: 'Docs-First',
        description: '安装页、角色页、Agent 入口和 Reference 采用同一套发布层边界。Human 负责上手和运维边界，Agent 负责非交互契约与机器可读语义。',
        humanHref: '/zh/human/',
        humanLink: '进入 Human',
        agentHref: '/zh/agent/',
        agentLink: '进入 Agent',
        installHref: '/zh/operations/install-distribution-contract',
        installLink: '查看安装契约'
      },
      fastest: {
        summary: 'Fastest: 极简引导型入口（更高风险，保持折叠）',
        description: '这条命令刻意作为补充入口存在，而不是首页主入口。它必须始终被视为高风险 bootstrap 形态，并保持 Planned 状态。',
        command: 'curl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash'
      }
    }
  }

  return {
    statusPlanned: 'Planned',
    preferred: {
      kicker: 'Preferred',
      title: 'Default safe one-line install entrypoint',
      description: 'Human documentation defaults to the more auditable control-plane install shape. PortManager is still in the docs-first stage, so the command contract is frozen while the runtime status remains explicitly marked as Planned.',
      command: 'docker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d',
      notes: [
        'This is the target standard entrypoint for the self-hosted control plane.',
        'Before implementation ships, the docs can freeze the command shape and constraints, but must not pretend it is already available.'
      ]
    },
    reality: {
      kicker: 'Contract',
      title: 'Freeze the entrypoint before the runtime exists',
      label: 'Docs-First',
      description: 'Install guidance, role pages, Agent entrypoints, and Reference all follow the same publishing boundary. Human pages optimize for onboarding and operational boundaries. Agent pages optimize for non-interactive contracts and machine-readable semantics.',
      humanHref: '/en/human/',
      humanLink: 'Open Human',
      agentHref: '/en/agent/',
      agentLink: 'Open Agent',
      installHref: '/en/operations/install-distribution-contract',
      installLink: 'Read install contract'
    },
    fastest: {
      summary: 'Fastest: ultra-short bootstrap path (higher risk, kept collapsed)',
      description: 'This command intentionally exists as the secondary path rather than the homepage default. It must always be treated as the higher-risk bootstrap form and stay marked as Planned.',
      command: 'curl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash'
    }
  }
})
</script>

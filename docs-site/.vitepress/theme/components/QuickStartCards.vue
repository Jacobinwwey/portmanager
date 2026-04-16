<template>
  <section class="pm-panel" style="padding: 1.4rem;">
    <div class="pm-grid two">
      <article class="pm-card">
        <span class="pm-eyebrow">{{ copy.preferred.eyebrow }}</span>
        <div class="pm-card-title">
          <h3>{{ copy.preferred.title }}</h3>
          <span class="pm-pill warn">{{ copy.statusPlanned }}</span>
        </div>
        <p>{{ copy.preferred.description }}</p>
        <pre class="pm-code"><code>{{ copy.preferred.command }}</code></pre>
      </article>
      <article class="pm-card">
        <span class="pm-eyebrow">{{ copy.fastest.eyebrow }}</span>
        <div class="pm-card-title">
          <h3>{{ copy.fastest.title }}</h3>
          <span class="pm-pill danger">{{ copy.statusPlanned }}</span>
        </div>
        <p>{{ copy.fastest.description }}</p>
        <pre class="pm-code"><code>{{ copy.fastest.command }}</code></pre>
      </article>
    </div>
    <div class="pm-callout" style="margin-top: 1rem;">
      <strong>{{ copy.noteTitle }}</strong>
      <p class="pm-muted" style="margin: 0.45rem 0 0;">{{ copy.noteBody }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ locale: 'en' | 'zh' }>()

const copy = computed(() => {
  if (props.locale === 'zh') {
    return {
      statusPlanned: 'Planned',
      noteTitle: '安装状态说明',
      noteBody: '这些一行入口属于已冻结的公共分发契约，但当前产品实现尚未落地，因此必须标记为 Planned，而不是 Available。',
      preferred: {
        eyebrow: 'Preferred',
        title: '更安全的单命令安装形态',
        description: '目标是一条更可审计、可复现的 control plane 安装入口，优先对齐 self-hosted Docker 形态。',
        command: '# Planned\n\ndocker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d'
      },
      fastest: {
        eyebrow: 'Fastest',
        title: '最短 bootstrap 形态',
        description: '目标是一条极简引导入口，但在文档中必须始终明确标记为更高风险。',
        command: '# Planned\ncurl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash'
      }
    }
  }

  return {
    statusPlanned: 'Planned',
    noteTitle: 'Install Status',
    noteBody: 'These one-line entrypoints are frozen as public distribution contracts, but the product implementation is not shipped yet, so they must remain marked as Planned rather than Available.',
    preferred: {
      eyebrow: 'Preferred',
      title: 'Safer one-command install shape',
      description: 'The target is an auditable, reproducible control-plane install path aligned with the self-hosted Docker form factor.',
      command: '# Planned\n\ndocker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d'
    },
    fastest: {
      eyebrow: 'Fastest',
      title: 'Shortest bootstrap shape',
      description: 'The target is an ultra-short bootstrap entrypoint, but the docs must always label it as the higher-risk path.',
      command: '# Planned\ncurl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash'
    }
  }
})
</script>

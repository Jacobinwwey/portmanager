import { defineConfig } from 'vitepress'
import { contentMap } from '../content-map.js'

const docsBase = process.env.PORTMANAGER_DOCS_BASE ?? '/'

function doc(locale: 'en' | 'zh', id: string) {
  const entry = contentMap.find((item) => item.id === id)
  if (!entry) {
    throw new Error(`Unknown sidebar doc: ${id}`)
  }
  return `/${locale}/${entry.route}`
}

function nav(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return [
      { text: 'Overview', link: '/zh/' },
      { text: 'Human', link: '/zh/human/' },
      { text: 'Agent', link: '/zh/agent/' },
      { text: 'Reference', link: '/zh/reference/' },
      { text: 'Architecture', link: '/zh/architecture/' },
      { text: 'Operations', link: '/zh/operations/' },
      { text: 'Roadmap', link: '/zh/roadmap' },
      { text: 'Archive', link: '/zh/archive/' }
    ]
  }

  return [
    { text: 'Overview', link: '/en/' },
    { text: 'Human', link: '/en/human/' },
    { text: 'Agent', link: '/en/agent/' },
    { text: 'Reference', link: '/en/reference/' },
    { text: 'Architecture', link: '/en/architecture/' },
    { text: 'Operations', link: '/en/operations/' },
    { text: 'Roadmap', link: '/en/roadmap' },
    { text: 'Archive', link: '/en/archive/' }
  ]
}

function sidebar(locale: 'en' | 'zh') {
  const isZh = locale === 'zh'
  return [
    {
      text: 'Overview',
      items: [
        { text: isZh ? '总览首页' : 'Overview Home', link: `/${locale}/` },
        { text: isZh ? '产品规格' : 'Product Specification', link: doc(locale, 'product-spec') },
        { text: isZh ? '仓库基线' : 'Repository Baseline', link: doc(locale, 'repo-baseline') },
        { text: isZh ? '基线清单' : 'Baseline Checklist', link: doc(locale, 'baseline-checklist') }
      ]
    },
    {
      text: 'Human',
      items: [
        { text: isZh ? 'Human 入口' : 'Human Entry', link: `/${locale}/human/` },
        { text: isZh ? 'Operator' : 'Operator', link: `/${locale}/human/operator` },
        { text: isZh ? 'Self-Host Admin' : 'Self-Host Admin', link: `/${locale}/human/self-host-admin` },
        { text: isZh ? 'SDK Integrator' : 'SDK Integrator', link: `/${locale}/human/sdk-integrator` },
        { text: isZh ? 'Contributor' : 'Contributor', link: `/${locale}/human/contributor` }
      ]
    },
    {
      text: 'Agent',
      items: [
        { text: isZh ? 'Agent 入口' : 'Agent Entry', link: `/${locale}/agent/` },
        { text: isZh ? 'Agent Quickstart' : 'Agent Quickstart', link: `/${locale}/agent/quickstart` },
        { text: isZh ? '非交互工作流' : 'Non-Interactive Flows', link: `/${locale}/agent/non-interactive` }
      ]
    },
    {
      text: 'Reference',
      items: [
        { text: isZh ? 'Reference 首页' : 'Reference Home', link: `/${locale}/reference/` },
        { text: isZh ? '契约基线' : 'Contracts Baseline', link: doc(locale, 'contracts-baseline') },
        { text: isZh ? 'OpenAPI 参考' : 'OpenAPI Reference', link: `/${locale}/reference/openapi` },
        { text: isZh ? 'JSON Schema 参考' : 'JSON Schema Reference', link: `/${locale}/reference/json-schemas` }
      ]
    },
    {
      text: 'Architecture',
      items: [
        { text: isZh ? 'Architecture 首页' : 'Architecture Home', link: `/${locale}/architecture/` },
        { text: isZh ? 'V1 架构' : 'V1 Architecture', link: doc(locale, 'v1-architecture') },
        { text: isZh ? '契约策略' : 'Contract Strategy', link: doc(locale, 'contract-strategy') },
        { text: isZh ? 'Agent Bootstrap' : 'Agent Bootstrap', link: doc(locale, 'agent-bootstrap') },
        { text: isZh ? '产品 Web UI 信息架构' : 'Product Web UI Information Architecture', link: doc(locale, 'ui-information-architecture') },
        { text: isZh ? '产品控制台设计基线' : 'Product Console Design Baseline', link: doc(locale, 'overview-design-baseline') },
        { text: isZh ? '产品控制台语义映射' : 'Product Console Semantic Mapping', link: doc(locale, 'overview-semantic-mapping') },
        { text: isZh ? '文档站设计基线' : 'Docs Site Design Baseline', link: doc(locale, 'docs-site-design-baseline') },
        { text: isZh ? '文档站架构' : 'Docs Site Architecture', link: doc(locale, 'docs-site-architecture') }
      ]
    },
    {
      text: 'Operations',
      items: [
        { text: isZh ? 'Operations 首页' : 'Operations Home', link: `/${locale}/operations/` },
        { text: isZh ? '安装与分发契约' : 'Install Contract', link: doc(locale, 'install-distribution-contract') },
        { text: isZh ? '快照与诊断' : 'Snapshot and Diagnostics', link: doc(locale, 'snapshot-diagnostics') },
        { text: isZh ? '备份与回滚策略' : 'Backup and Rollback', link: doc(locale, 'backup-rollback-policy') },
        { text: isZh ? 'SDK 与 Docker 边界' : 'SDK and Docker Boundary', link: doc(locale, 'sdk-docker') }
      ]
    },
    {
      text: 'Roadmap',
      items: [
        { text: isZh ? 'Roadmap 首页' : 'Roadmap Home', link: `/${locale}/roadmap` },
        { text: isZh ? '里程碑明细' : 'Milestones Detail', link: doc(locale, 'milestones') }
      ]
    },
    {
      text: 'Archive',
      items: [{ text: isZh ? '归档说明' : 'Archive Notes', link: `/${locale}/archive/` }]
    }
  ]
}

export default defineConfig({
  title: 'PortManager Docs',
  description: 'Human and agent-facing documentation for PortManager.',
  base: docsBase,
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  head: [
    ['meta', { name: 'theme-color', content: '#0d4f96' }]
  ],
  themeConfig: {
    logo: '/mark.svg',
    search: {
      provider: 'local'
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Jacobinwwey/portmanager' }],
    footer: {
      message: 'PortManager docs-first publishing layer',
      copyright: 'Copyright 2026 PortManager contributors'
    }
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: nav('en'),
        sidebar: sidebar('en')
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: nav('zh'),
        sidebar: sidebar('zh'),
        footer: {
          message: 'PortManager 文档优先发布层',
          copyright: 'Copyright 2026 PortManager contributors'
        }
      }
    }
  }
})

# PortManager Docs Site Architecture and Governance

Updated: 2026-04-16
Version: v0.3.1-docs-site-rebuild

## English

### Purpose
This document locks the documentation publishing architecture for PortManager.
The repository keeps raw bilingual specifications as the source of truth, while VitePress acts as the public publishing layer for GitHub Pages.

### Publishing model
- raw source of truth: `docs/` and `packages/contracts/`
- publishing layer: `docs-site/`
- locale generation: `scripts/docs/extract-locales.mjs`
- public hosting: GitHub Pages
- deployment flow: `main -> GitHub Actions -> GitHub Pages`

### Design baseline boundary
- Product control-plane baseline: `docs/design/portmanager-overview-design-baseline.md`
- Product control-plane semantic mapping: `docs/design/portmanager-overview-semantic-mapping.md`
- Docs-site publishing baseline: `docs/design/portmanager-docs-site-design-baseline.md`
- The docs site may reference the VitePress structure used by `OpenAvatarChat`, but only as a design reference rather than a cloning target.
- The docs site should prefer standard VitePress `home` and `doc` layouts before custom wrappers.
- The docs site should keep custom Vue components to the minimum set needed for `Quick Start` and `Roadmap`.

### Route contract
The public site treats the following route families as stable interfaces:
- `/en/`
- `/zh/`
- `/en/human/...`
- `/zh/human/...`
- `/en/agent/...`
- `/zh/agent/...`
- `/en/reference/...`
- `/zh/reference/...`
- `/en/architecture/...`
- `/zh/architecture/...`
- `/en/operations/...`
- `/zh/operations/...`
- `/en/roadmap/`
- `/zh/roadmap/`
- `/en/archive`
- `/zh/archive`

Section landing pages that also own child pages should publish through nested `index` routes.
This avoids static-host conflicts between a page and a folder with the same public path.
Custom Vue components must follow one of two valid patterns and may not mix them:
- pass raw site-relative paths such as `/en/roadmap/milestones` into VitePress navigation components such as `VPLink`
- or, if a plain anchor must be used, expand the path through a VitePress base-aware helper first
Applying both `VPLink` and a pre-expanded `withBase(...)` path at the same time is invalid because it double-prefixes Project Pages bases such as `/portmanager/`.

### Audience split
The docs site must separate `Human` and `Agent` audiences at the top level.
This split is structural, not cosmetic.
Human pages prioritize onboarding, context, workflows, and operational guidance.
Agent pages prioritize deterministic inputs, outputs, state transitions, and copy-paste examples.

### Source-of-truth rules
- Raw bilingual documents remain authoritative.
- The docs site may reorganize, summarize, and route documents.
- The docs site must not silently fork or rewrite core specifications into a second long-term truth layer.
- Any new public document must land in raw source form first, then be mapped into the docs site.

### Generation rules
The locale extraction pipeline must fail when:
- a mapped source file is missing
- `## English` is missing
- `## 中文` is missing
- a publishable raw doc is not represented in the mapping table

### Archive rule
The first docs site release includes an `Archive` area, but not a full version-switching system.
Archived pages remain static references rather than active version branches.

## 中文

### 用途
这份文档锁定 PortManager 的文档发布架构。
仓库继续保留双语原始规范作为真源，而 VitePress 作为 GitHub Pages 的公共发布层。

### 发布模型
- 原始真源：`docs/` 与 `packages/contracts/`
- 发布层：`docs-site/`
- 语言拆分生成：`scripts/docs/extract-locales.mjs`
- 公共托管：GitHub Pages
- 部署流：`main -> GitHub Actions -> GitHub Pages`

### 设计基线边界
- 产品控制平面基线：`docs/design/portmanager-overview-design-baseline.md`
- 产品控制平面语义映射：`docs/design/portmanager-overview-semantic-mapping.md`
- 文档站发布基线：`docs/design/portmanager-docs-site-design-baseline.md`
- 文档站可以参考 `OpenAvatarChat` 使用的 VitePress 结构，但只能作为设计参考，而不是克隆目标。
- 在引入自定义包装层之前，文档站应优先使用标准 VitePress `home` 与 `doc` 布局。
- 文档站应把自定义 Vue 组件控制在 `Quick Start` 与 `Roadmap` 所需的最小集合内。

### 路由契约
公共站点将以下路由族视为稳定接口：
- `/en/`
- `/zh/`
- `/en/human/...`
- `/zh/human/...`
- `/en/agent/...`
- `/zh/agent/...`
- `/en/reference/...`
- `/zh/reference/...`
- `/en/architecture/...`
- `/zh/architecture/...`
- `/en/operations/...`
- `/zh/operations/...`
- `/en/roadmap/`
- `/zh/roadmap/`
- `/en/archive`
- `/zh/archive`

当某个分区首页同时拥有子页面时，应通过嵌套 `index` 路由发布。
这样可以避免静态托管环境中“页面路径”和“目录路径”同名而发生冲突。
自定义 Vue 组件中的内部链接必须通过 VitePress 的 base-aware 路径辅助生成，而不能手写根路径 href。
这样可以避免在 GitHub Project Pages 的 `/portmanager/` 这类 base path 下出现跳转失效。

### 受众分流
文档站必须在顶层明确区分 `Human` 与 `Agent`。
这种区分是结构性的，不是视觉上的装饰。
Human 页面优先服务于上手、上下文、工作流与运维指导。
Agent 页面优先服务于确定性输入输出、状态迁移与可复制的示例。

### 真源规则
- 双语原始文档继续是权威真源。
- 文档站可以对文档做重组、摘要和路由编排。
- 文档站不能静默地把核心规范改写成另一套长期并行真源。
- 任何新的公共文档都必须先落到原始真源，再进入文档站映射。

### 生成规则
语言拆分流水线在以下情况必须失败：
- 映射的源文件不存在
- 缺失 `## English`
- 缺失 `## 中文`
- 需要公开发布的原始文档没有进入映射表

### Archive 规则
首版文档站包含 `Archive` 区，但不做完整版本切换系统。
归档内容保持为静态参考页，而不是活跃版本分支。

---
title: "文档站设计基线"
audience: shared
persona:
  - contributor
  - admin
section: architecture
sourcePath: "docs/design/portmanager-docs-site-design-baseline.md"
status: active
---
> 真源文档：`docs/design/portmanager-docs-site-design-baseline.md`
> Audience：`shared` | Section：`architecture` | Status：`active`
> Updated：2026-04-16 | Version：v0.3.1-docs-site-rebuild
### 目的
本文档冻结 PortManager 公共文档站的视觉与结构基线。
它与产品控制平面的设计基线是两套不同的约束。

### 参考立场
文档站基线可以参考 `OpenAvatarChat` 使用的 VitePress 信息架构，尤其包括：
- 标准 `layout: home` 首页组合方式
- 清晰的 `nav + sidebar + locale` 结构
- 以内容为中心的 hero、actions 与 feature blocks
- 优先服务阅读与导航、而不是仪表盘表演感的克制视觉语言

这是一种参考立场，不代表要像素级复制该站点。

### 文档站必须是什么
- 一个面向双语发布的 docs-first VitePress 站点
- 在顶层清晰区分 `Human` 与 `Agent`
- 为 `Reference`、`Architecture`、`Operations`、`Roadmap` 与 `Archive` 提供稳定路由面
- 作为把读者引回原始真源文档的发布层
- 首屏应该告诉读者“从哪里开始”，而不是模拟一个运维控制台

### 文档站不能是什么
- 不能把自己当成 PortManager 产品 UI
- 不能做成伪造的 operations dashboard
- 首页不能用高密度主机表、遥测墙或事件流隐喻来冒充“专业感”
- 不能让文档视觉静默地反过来重定义产品 UI 预期

### 布局与组件规则
- 在引入自定义包装层之前，优先使用 VitePress 原生 `home` 与 `doc` 布局。
- 只有在 Markdown 与内建 VitePress 区块不足以表达时，才引入自定义 Vue 组件。
- 首页区块应优先强调快速定位、受众入口与关键文档族。
- 次级页面应优先使用标题、列表、代码块、callout 与轻量文档卡片。
- Roadmap 可以继续保留为自定义页面，因为它表达的是结构化里程碑数据，而不是普通长文。
- 文档站应把自定义组件集控制在最小范围内；当前允许保留的是 quick-start 卡片区块与 roadmap 渲染组件。
- 如果某个分区首页同时还拥有子页面，则应使用嵌套 `index` 路由，例如 `/en/roadmap/`，而不是与目录发生冲突的同名顶层页面路由。

### 视觉语言规则
- 保持界面轻、稳、可读。
- 品牌样式应服务于导航与层级，而不是压倒内容。
- 使用充足留白、清晰链接目标与克制的表面装饰。
- 两种语言页面必须保持视觉与结构上的对等。

### 必须保留的边界
- 产品控制平面 UI 基线：`docs/design/portmanager-overview-design-baseline.md`
- 产品控制平面语义映射：`docs/design/portmanager-overview-semantic-mapping.md`
- 文档站基线：本文档

后续任何工作都不得再把这三者混用。

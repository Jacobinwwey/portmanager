---
title: Contributor
---

# Contributor

这个页面面向会修改文档、契约、生成规则或未来实现基线的人。

## 先看这里

1. 阅读 [文档站架构](/zh/architecture/docs-site-architecture)。
2. 阅读 [文档站设计基线](/zh/architecture/docs-site-design-baseline)。
3. 阅读 [产品控制台设计基线](/zh/architecture/overview-design-baseline)。
4. 阅读 [里程碑明细](/zh/roadmap/milestones)。

## 这个角色必须守住什么

- 双语原始文档始终是真源
- docs-site 只是发布层，而不是第二套规范层
- 产品控制台基线与文档站基线永远不能塌缩成同一套设计系统
- 路由稳定性很重要，因为 Human 与 Agent 本身就是公共文档接口

## 边界

如果某个公开页面的含义发生变化，先修改原始真源，再重新生成。不要让生成后的站点静默地变成权威来源。

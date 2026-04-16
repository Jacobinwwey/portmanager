---
title: "仓库基线"
audience: shared
persona:
  - contributor
  - admin
section: overview
sourcePath: "docs/specs/portmanager-repo-baseline.md"
status: active
---
> 真源文档：`docs/specs/portmanager-repo-baseline.md`
> Audience：`shared` | Section：`overview` | Status：`active`
> Updated：2026-04-16 | Version：v0.2.0-docs-site-baseline
本仓库以 docs-first 基线启动。
首次上传刻意只包含文档、设计资产与契约草案。
业务实现代码将在这份基线提交并评审后再开始。
后续里程碑分支可以加入实现基础设施，但这不会改变首次基线上传的含义。

### 初始目录
- docs/specs
- docs/architecture
- docs/operations
- docs/design
- docs-site
- scripts/docs
- .github/workflows
- packages/contracts/openapi
- packages/contracts/jsonschema

### Milestone 1 基础目录
- apps/controller
- apps/web
- crates/portmanager-agent
- crates/portmanager-cli
- packages/typescript-contracts
- scripts/contracts

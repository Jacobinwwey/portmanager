---
layout: home
title: Agent
hero:
  name: Agent
  text: 面向自动化的确定性入口
  tagline: Agent 页面优先服务于可复制命令、稳定标题、机器可读语义与显式状态迁移。除非能提升确定性，否则它不借用 Human 的叙事结构。
  actions:
    - theme: brand
      text: Agent Quickstart
      link: /zh/agent/quickstart
    - theme: alt
      text: 非交互工作流
      link: /zh/agent/non-interactive
    - theme: alt
      text: OpenAPI
      link: /zh/reference/openapi
features:
  - title: Quickstart
    details: 用计划中的命令形态表达最短的确定性起点。
    link: /zh/agent/quickstart
    linkText: 打开 Quickstart
  - title: JSON 与 wait 语义
    details: 使用可非交互消费且可安全观察的 CLI / API 工作流。
    link: /zh/agent/non-interactive
    linkText: 打开非交互工作流
  - title: Contracts
    details: 从 OpenAPI 与 JSON Schema 开始，而不是只从 prose 文档开始。
    link: /zh/reference/
    linkText: 打开 Reference
---

## Agent 原则

- 先给确定性入口
- 先给可复制样例，再给解释
- 状态、错误与幂等性语言必须显式
- CLI JSON、REST、SSE 与未来 SDK 表面需要保持一致

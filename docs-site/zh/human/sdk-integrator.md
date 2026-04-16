---
title: SDK Integrator
---

# SDK Integrator

这个页面面向通过生成客户端、自动化代码或未来 SDK 面来集成 PortManager 的人。

## 先看这里

1. 阅读 [契约基线](/zh/reference/contracts-baseline)。
2. 阅读 [OpenAPI 参考](/zh/reference/openapi)。
3. 阅读 [契约策略](/zh/architecture/contract-strategy)。

## 这个角色必须守住什么

- 生成客户端来自 `OpenAPI + JSON Schema + codegen`
- 不能长期维护手写 DTO 分叉
- CLI 的 JSON 输出、API 输出与未来 SDK 结构需要保持一致
- operation、diagnostic 与 rollback 的结果语义要跨表面稳定

## 边界

Human 集成文档可以解释为什么契约长这样，但契约本身仍然由 `docs/` 与 `packages/contracts/` 下的原始真源拥有。

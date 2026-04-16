---
title: JSON Schema Reference
---

# JSON Schema Reference

JSON Schema 的原始真源位于 `packages/contracts/jsonschema/` 目录下。

## 已发布 Schema

- `apply-desired-state.schema.json`
- `operation-result.schema.json`
- `port-diagnostic-result.schema.json`
- `rollback-result.schema.json`
- `runtime-state.schema.json`
- `snapshot-manifest.schema.json`
- `web-snapshot-result.schema.json`

## 为什么需要这个页面

这个页面是入口，而不是复制一份 schema 目录。真正的权威仍然是 schema 文件本身，它们应该驱动类型生成与校验链路。

## 建议一起阅读

- [OpenAPI Reference](/zh/reference/openapi)
- [契约基线](/zh/reference/contracts-baseline)
- [快照与诊断](/zh/operations/snapshot-diagnostics)

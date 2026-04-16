---
title: Operator
---

# Operator

这个页面面向需要判断某台主机或某条 bridge rule 是健康、退化还是可恢复的人。

## 先看这里

1. 阅读 [快照与诊断](/zh/operations/snapshot-diagnostics)。
2. 阅读 [备份与回滚策略](/zh/operations/backup-rollback-policy)。
3. 阅读 [产品 Web UI 信息架构](/zh/architecture/ui-information-architecture)。

## 这个角色必须看清楚什么

- 主机是 `draft`、`ready` 还是 `degraded`
- bridge rule 是 `desired`、`active` 还是 `degraded`
- TCP、HTTP、TLS 与网页快照检查留下了哪些证据
- destructive mutation 前是否创建了 rollback point

## 边界

Operator 页面可以解释上下文与意图，但不能越过原始真源去改写运行时契约，也不能发明新的状态名称。

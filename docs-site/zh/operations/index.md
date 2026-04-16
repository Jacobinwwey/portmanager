---
title: Operations
---

# Operations

Operations 定义 PortManager 如何被安装、诊断、保护与恢复。

## 先看这里

- [安装与分发契约](/zh/operations/install-distribution-contract)
- [快照与诊断](/zh/operations/snapshot-diagnostics)
- [备份与回滚策略](/zh/operations/backup-rollback-policy)
- [SDK 与 Docker 边界](/zh/operations/sdk-and-docker-boundary)

## 这个分区必须守住什么

- 安装命令必须清楚标记 `Available` 与 `Planned`
- 诊断必须是可观察证据，而不是模糊健康描述
- destructive change 必须带着 backup 与 rollback 意识

---
title: Self-Host Admin
---

# Self-Host Admin

这个页面面向在真实 self-hosted 环境中部署或维护 PortManager control plane 的人类维护者。

## 先看这里

1. 阅读 [安装与分发契约](/zh/operations/install-distribution-contract)。
2. 阅读 [SDK 与 Docker 边界](/zh/operations/sdk-and-docker-boundary)。
3. 阅读 [Agent Bootstrap](/zh/architecture/agent-bootstrap)。

## 这个角色必须守住什么

- 默认安装入口必须保持为更安全的一行契约
- Docker 覆盖的是 `controller + web`，而不是 agent
- bootstrap 与 rescue 必须显式存在，不能藏进便利脚本里
- 在实现不存在前，计划中的命令必须保持 `Planned` 标记

## 边界

Human 安装指导可以简化阅读顺序，但不能抹掉前置条件、回退路径和恢复假设。

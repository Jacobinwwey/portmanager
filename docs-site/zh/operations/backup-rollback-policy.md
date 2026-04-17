---
title: "备份与回滚策略"
audience: shared
persona:
  - operator
  - admin
  - contributor
section: operations
sourcePath: "docs/operations/portmanager-backup-rollback-policy.md"
status: active
---
> 真源文档：`docs/operations/portmanager-backup-rollback-policy.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-17 | Version：v0.2.0-github-backup
### 硬安全规则
所有 destructive operation 在变更前都必须先完成备份。
Rollback 本身同样属于 destructive operation，因此也遵循同样规则。

### 备份类别
- `local`：V1 必需，失败则阻断 mutation
- `github`：V1 支持，作为可选的第二持久化目标

### 策略级别
- `best_effort`：本地备份必需，GitHub 备份会尝试但不阻断
- `required`：本地与远端备份都必须成功，变更才能继续

### 认证基线
- V1 中 GitHub 私有备份使用 fine-grained PAT。
- Token 只存在于 controller 侧，不向 agent 扩散。

### 当前 controller 实现
- controller 总是先写本地 backup 产物，并把 manifest 路径保留为 rollback 锚点。
- 当 `PORTMANAGER_GITHUB_BACKUP_ENABLED`、`PORTMANAGER_GITHUB_BACKUP_REPO`、`PORTMANAGER_GITHUB_BACKUP_TOKEN` 已配置时，controller 会通过 GitHub Contents API 把一份 JSON bundle 上传到 `portmanager-backups/{hostId}/{backupId}.bundle.json`。
- 上传 bundle 同时包含 manifest 与本地产物文件的序列化内容，用来保证 rollback 证据与远端冗余保持对齐。
- `required` 在 GitHub 上传缺失或失败时会进入 degraded。
- `best_effort` 在本地 backup 成功后仍保持 operation succeeded，但会继续显式发布远端失败或配置指引。

### 受管回滚边界
Rollback 只恢复 PortManager 管理边界内的内容，包括：
- agent 管理配置
- PortManager 自有运行态元数据
- bridge 相关数据包过滤规则
- PortManager 管理的 systemd 或 sysctl 产物

Rollback 不对无关工作负载、用户应用或任意主机变更宣称所有权。

### 最小备份包内容
- manifest
- desired-state 快照
- runtime-state 快照
- 关联 operation 元数据
- health summary
- checksums
- 如果变更路径中涉及诊断或快照，则包含相关 artifact 引用

### 必须提供给操作员的可见性
产品必须展示：
- 本地备份是否成功
- GitHub 备份是否尝试且是否成功
- 远端 bundle 最终进入哪个 GitHub repo/path，或者为什么上传失败
- 哪些 rollback points 是有效候选
- 每个 backup 与 rollback point 由哪个 operation 产生

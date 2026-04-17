---
title: "SDK 与 Docker 边界"
audience: shared
persona:
  - admin
  - integrator
  - contributor
section: operations
sourcePath: "docs/specs/portmanager-sdk-and-docker.md"
status: active
---
> 真源文档：`docs/specs/portmanager-sdk-and-docker.md`
> Audience：`shared` | Section：`operations` | Status：`active`
> Updated：2026-04-17 | Version：v0.1.1-github-backup
### V1 锁定的 SDK
- `TypeScript SDK`：面向 Web、Node 脚本、自动化与未来外部工具
- `Rust crate`：面向 CLI、agent 复用与后续基础设施集成

### SDK 契约规则
- SDK 必须与 Web、controller、CLI、agent 一样，派生自同一套公共契约。
- SDK 不是拥有独立 DTO 词汇表的平行产品面。
- CLI 的 JSON 输出必须在结构上与 SDK 响应模型保持一致。
- 禁止长期维护重复 DTO 树。

### 建议的包边界
- TypeScript SDK：controller REST client、SSE 辅助、领域类型、operation wait helpers
- Rust crate：领域模型、API 绑定、流式辅助、与校验对齐的结果类型

### V1 锁定的 Docker 范围
- 支持容器化的服务：`controller`、`web`
- 部署模式：`self-hosted control plane`
- Agent 明确不进入 V1 容器范围，继续原生安装在主机上
- SQLite 与 artifact storage 保持文件后端，并必须通过卷挂载持久化

### 后续实现阶段必须保留的部署决策
- controller 镜像边界与环境变量
- web 镜像边界与 controller base URL 绑定方式
- SQLite 卷路径
- artifact-store 卷路径
- 日志策略
- 控制平面容器升级 / 回滚预期

### 当前已经被 controller backup 流程使用的环境变量契约
- `PORTMANAGER_CONTROLLER_PORT`
- `PORTMANAGER_CONTROLLER_BASE_URL`
- `PORTMANAGER_SQLITE_PATH`
- `PORTMANAGER_ARTIFACTS_PATH`
- `PORTMANAGER_GITHUB_BACKUP_ENABLED`
- `PORTMANAGER_GITHUB_BACKUP_REPO`
- `PORTMANAGER_GITHUB_BACKUP_TOKEN`

controller 现在已经真实消费 GitHub backup 三个变量来交付远端备份：
- `PORTMANAGER_GITHUB_BACKUP_ENABLED`：打开或关闭远端上传行为。
- `PORTMANAGER_GITHUB_BACKUP_REPO`：指定 GitHub Contents 上传目标的 `owner/repo`。
- `PORTMANAGER_GITHUB_BACKUP_TOKEN`：为 controller 侧上传提供认证，并且必须继续留在 agent 作用域之外。

### 未来迁移说明
PostgreSQL 是明确保留的未来可靠性迁移方向，但它不应反过来扭曲 V1 的默认部署形态。
Docker 基线当前刻意优先服务于快速 self-hosted 落地，再为未来迁移留好口子。

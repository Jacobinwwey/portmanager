# PortManager SDK and Docker Boundary

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### SDKs locked for V1
- `TypeScript SDK`: for Web, Node scripts, automation, and future external tooling
- `Rust crate`: for CLI, agent reuse, and later infrastructure integrations

### SDK contract rules
- SDKs are derived from the same public contracts as Web, controller, CLI, and agent.
- SDKs are not independent product surfaces with their own DTO vocabulary.
- CLI JSON output must remain structurally aligned with SDK response models.
- Long-term hand-maintained duplicate DTO trees are prohibited.

### Suggested package boundaries
- TypeScript SDK: controller REST client, SSE helpers, domain types, operation wait helpers
- Rust crate: domain models, API bindings, streaming helpers, validation-aligned result types

### Docker scope locked for V1
- Supported containerized services: `controller`, `web`
- Deployment mode: `self-hosted control plane`
- Agent is explicitly out of container scope for V1 and remains a native host installation
- SQLite and artifact storage remain file-backed and must use volume mounts

### Required deployment documentation decisions
- controller image boundary and env vars
- web image boundary and controller base URL binding
- SQLite volume path
- artifact-store volume path
- log strategy
- upgrade / rollback expectations for control plane containers

### Environment variable contract to preserve for later implementation
- `PORTMANAGER_CONTROLLER_PORT`
- `PORTMANAGER_CONTROLLER_BASE_URL`
- `PORTMANAGER_SQLITE_PATH`
- `PORTMANAGER_ARTIFACTS_PATH`
- `PORTMANAGER_GITHUB_BACKUP_ENABLED`
- `PORTMANAGER_GITHUB_BACKUP_REPO`
- `PORTMANAGER_GITHUB_BACKUP_TOKEN`

### Future migration note
PostgreSQL is a deliberate future reliability path, but it must not distort the V1 default deployment shape.
The Docker baseline is intentionally optimized for fast self-hosted adoption before that migration.

## 中文

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

### 需要保留的环境变量契约
- `PORTMANAGER_CONTROLLER_PORT`
- `PORTMANAGER_CONTROLLER_BASE_URL`
- `PORTMANAGER_SQLITE_PATH`
- `PORTMANAGER_ARTIFACTS_PATH`
- `PORTMANAGER_GITHUB_BACKUP_ENABLED`
- `PORTMANAGER_GITHUB_BACKUP_REPO`
- `PORTMANAGER_GITHUB_BACKUP_TOKEN`

### 未来迁移说明
PostgreSQL 是明确保留的未来可靠性迁移方向，但它不应反过来扭曲 V1 的默认部署形态。
Docker 基线当前刻意优先服务于快速 self-hosted 落地，再为未来迁移留好口子。

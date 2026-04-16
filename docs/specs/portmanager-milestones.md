# PortManager Milestones

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### Milestone 1: One Host, One Rule, One Rollback
1. contracts foundation
2. controller skeleton with SQLite state store
3. Rust agent skeleton with apply, collect, snapshot, rollback primitives
4. Rust CLI skeleton with `--json` and `--wait`
5. React SPA overview and host detail skeleton based on the locked design baseline
6. bootstrap gold path for one Ubuntu 24.04 host
7. single bridge-rule apply plus verification
8. required local backup before mutation
9. controller-side diagnostics and webpage snapshot flow
10. unified operations and event stream visibility across Web, CLI, and API

### Milestone 2: Engineering Reliability
- GitHub private backup integration with visible status
- policy levels: `best_effort` and `required`
- drift detection and explicit degraded handling
- stronger rollback UX
- fuller Backups / Operations / Diagnostics pages
- artifact retention policy and cleanup policy

### Milestone 3: Toward C
- stronger agent reporting and event model
- batch host management and orchestration
- PostgreSQL migration or migration-readiness work
- broader platform abstraction
- preparation for macOS, mobile, and wider Linux support

## 中文

### 里程碑 1：One Host, One Rule, One Rollback
1. 契约基础设施
2. 带 SQLite 状态库的 controller 骨架
3. 具备 apply、collect、snapshot、rollback 原语的 Rust agent 骨架
4. 强制支持 `--json` 与 `--wait` 的 Rust CLI 骨架
5. 基于已锁定设计基线实现 React SPA 的 overview 与 host detail 骨架
6. 一台 Ubuntu 24.04 主机的 bootstrap 金路径
7. 单条 bridge rule 的 apply 与验证
8. mutation 前必须完成的本地备份
9. controller 侧诊断与网页快照链路
10. Web、CLI 与 API 共享的 operations 与事件流可见性

### 里程碑 2：Engineering Reliability
- 带可见状态的 GitHub 私有备份接入
- `best_effort` 与 `required` 两级策略
- drift detection 与显式 degraded 处理
- 更强的 rollback UX
- 更完整的 Backups / Operations / Diagnostics 页面
- 产物保留与清理策略

### 里程碑 3：Toward C
- 更强的 agent 上报与事件模型
- 批量主机管理与编排
- PostgreSQL 迁移或迁移就绪工作
- 更广的平台抽象
- 为 macOS、移动端与更宽 Linux 支持做准备

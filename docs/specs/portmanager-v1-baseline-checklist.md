# PortManager V1 Baseline Checklist

Updated: 2026-04-16
Version: v0.1.0-docs-baseline

## English

### Purpose
This checklist is the formal verification matrix for the first `docs-first` upload.
Every locked decision from the agreed V1 plan must map to a concrete repository artifact before the first push to `main`.

### Ordered completion matrix
1. Repository baseline
   - `README.md`
   - `docs/specs/portmanager-repo-baseline.md`
   - `packages/contracts/openapi/openapi.yaml`
   - `packages/contracts/jsonschema/`
   - Status: complete
2. Core product and architecture decisions
   - `docs/specs/portmanager-v1-product-spec.md`
   - `docs/architecture/portmanager-v1-architecture.md`
   - `docs/architecture/portmanager-contract-strategy.md`
   - `docs/architecture/portmanager-agent-bootstrap.md`
   - Status: complete
3. Frontend design baseline
   - `docs/design/assets/original-onesync-reference.html`
   - `docs/design/assets/portmanager-overview-reference.html`
   - `docs/design/portmanager-overview-design-baseline.md`
   - `docs/design/portmanager-overview-semantic-mapping.md`
   - `docs/specs/portmanager-ui-information-architecture.md`
   - Status: complete
4. Diagnostics, snapshots, backup, rollback
   - `docs/specs/portmanager-snapshot-diagnostics.md`
   - `docs/operations/portmanager-backup-rollback-policy.md`
   - Status: complete
5. SDK, Docker, and deployment boundary
   - `docs/specs/portmanager-sdk-and-docker.md`
   - `packages/contracts/README.md`
   - Status: complete
6. Milestones and acceptance
   - `docs/specs/portmanager-milestones.md`
   - `TODO.md`
   - Status: complete
7. Shared contracts
   - `packages/contracts/openapi/openapi.yaml`
   - `packages/contracts/jsonschema/runtime-state.schema.json`
   - `packages/contracts/jsonschema/apply-desired-state.schema.json`
   - `packages/contracts/jsonschema/snapshot-manifest.schema.json`
   - `packages/contracts/jsonschema/rollback-result.schema.json`
   - `packages/contracts/jsonschema/operation-result.schema.json`
   - `packages/contracts/jsonschema/port-diagnostic-result.schema.json`
   - `packages/contracts/jsonschema/web-snapshot-result.schema.json`
   - Status: complete

### Locked decisions verified
- Docs-first baseline only, with no business implementation code in the initial upload.
- Split services architecture: `web + controller + cli + agent`.
- `web` and `controller` are TypeScript; `cli` and `agent` are Rust.
- `OpenAPI + JSON Schema + codegen` is a hard rule.
- Controller API uses `REST + SSE`.
- Controller-agent link uses `HTTP over Tailscale` after bootstrap.
- SSH is bootstrap and rescue only.
- Human-maintained config uses `TOML`.
- Protocol payloads, snapshots, and exports use `JSON`.
- V1 state store is `SQLite`; `PostgreSQL` is a future migration target.
- Snapshot and diagnostics use controller-side capture.
- Frontend must expose page snapshot, connectivity, HTTP/TLS basics.
- SDKs are `TypeScript SDK + Rust crate`.
- Docker scope is self-hosted control plane only for `controller + web`.
- Agent remains native on managed hosts.
- Local backup is mandatory before destructive mutation.
- GitHub private backup is supported with fine-grained PAT as the V1 default credential shape.

### Verification expectation before push
- All files above exist locally.
- All `docs/` markdown files use explicit English and Chinese sections.
- OpenAPI parses as YAML.
- JSON Schema files parse as JSON.
- The repository is still docs-first and intentionally lacks milestone implementation code.

## 中文

### 用途
这份清单是首次 `docs-first` 上传的正式验收矩阵。
已确认的 V1 方案中的每一条锁定决策，都必须在首次推送到 `main` 前映射到仓库中的具体产物。

### 按顺序完成矩阵
1. 仓库基线
   - `README.md`
   - `docs/specs/portmanager-repo-baseline.md`
   - `packages/contracts/openapi/openapi.yaml`
   - `packages/contracts/jsonschema/`
   - 状态：完成
2. 核心产品与架构决策
   - `docs/specs/portmanager-v1-product-spec.md`
   - `docs/architecture/portmanager-v1-architecture.md`
   - `docs/architecture/portmanager-contract-strategy.md`
   - `docs/architecture/portmanager-agent-bootstrap.md`
   - 状态：完成
3. 前端设计基线
   - `docs/design/assets/original-onesync-reference.html`
   - `docs/design/assets/portmanager-overview-reference.html`
   - `docs/design/portmanager-overview-design-baseline.md`
   - `docs/design/portmanager-overview-semantic-mapping.md`
   - `docs/specs/portmanager-ui-information-architecture.md`
   - 状态：完成
4. 诊断、快照、备份、回滚
   - `docs/specs/portmanager-snapshot-diagnostics.md`
   - `docs/operations/portmanager-backup-rollback-policy.md`
   - 状态：完成
5. SDK、Docker 与部署边界
   - `docs/specs/portmanager-sdk-and-docker.md`
   - `packages/contracts/README.md`
   - 状态：完成
6. 里程碑与验收
   - `docs/specs/portmanager-milestones.md`
   - `TODO.md`
   - 状态：完成
7. 共享契约
   - `packages/contracts/openapi/openapi.yaml`
   - `packages/contracts/jsonschema/runtime-state.schema.json`
   - `packages/contracts/jsonschema/apply-desired-state.schema.json`
   - `packages/contracts/jsonschema/snapshot-manifest.schema.json`
   - `packages/contracts/jsonschema/rollback-result.schema.json`
   - `packages/contracts/jsonschema/operation-result.schema.json`
   - `packages/contracts/jsonschema/port-diagnostic-result.schema.json`
   - `packages/contracts/jsonschema/web-snapshot-result.schema.json`
   - 状态：完成

### 已锁定决策核验
- 首次上传严格是 docs-first 基线，不包含业务实现代码。
- 服务拆分架构为 `web + controller + cli + agent`。
- `web` 与 `controller` 使用 TypeScript；`cli` 与 `agent` 使用 Rust。
- `OpenAPI + JSON Schema + codegen` 是硬规则。
- Controller API 使用 `REST + SSE`。
- Bootstrap 之后 controller 与 agent 通过 `HTTP over Tailscale` 通信。
- SSH 仅用于 bootstrap 与救援。
- 人类维护配置使用 `TOML`。
- 协议载荷、快照与导出使用 `JSON`。
- V1 状态库为 `SQLite`，`PostgreSQL` 是未来迁移目标。
- 快照与诊断采用 controller-side capture。
- 前端必须可查看页面快照、连通性、HTTP/TLS 基础结果。
- SDK 形态为 `TypeScript SDK + Rust crate`。
- Docker 范围仅限 `controller + web` 的 self-hosted control plane。
- Agent 在受管主机上保持原生安装。
- destructive mutation 前必须先完成本地备份。
- GitHub 私有备份受支持，V1 默认认证形态为 fine-grained PAT。

### 推送前验证要求
- 上述全部文件在本地存在。
- `docs/` 下的 Markdown 文档均显式包含 English 与 中文分段。
- OpenAPI 可作为 YAML 解析。
- JSON Schema 文件可作为 JSON 解析。
- 仓库仍然保持 docs-first 形态，并有意缺少里程碑实现代码。

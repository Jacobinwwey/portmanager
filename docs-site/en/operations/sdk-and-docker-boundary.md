---
title: "SDK and Docker Boundary"
audience: shared
persona:
  - admin
  - integrator
  - contributor
section: operations
sourcePath: "docs/specs/portmanager-sdk-and-docker.md"
status: active
---
> Source of truth: `docs/specs/portmanager-sdk-and-docker.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
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

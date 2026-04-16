---
title: "Baseline Checklist"
audience: shared
persona:
  - contributor
  - admin
section: overview
sourcePath: "docs/specs/portmanager-v1-baseline-checklist.md"
status: active
---
> Source of truth: `docs/specs/portmanager-v1-baseline-checklist.md`
> Audience: `shared` | Section: `overview` | Status: `active`
> Updated: 2026-04-16 | Version: v0.3.0-docs-site-design-alignment
### Purpose
This checklist is the formal verification matrix for the first `docs-first` upload.
Every locked decision from the agreed V1 plan must map to a concrete repository artifact before the first push to `main`.
Later milestone branches may add implementation foundations; this checklist still describes the baseline upload gate.

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
3. Product web design baseline
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
8. Documentation publishing layer
   - `docs-site/`
   - `docs/specs/portmanager-docs-site-architecture.md`
   - `docs/specs/portmanager-install-distribution-contract.md`
   - `docs/design/portmanager-docs-site-design-baseline.md`
   - `scripts/docs/extract-locales.mjs`
   - `.github/workflows/docs-pages.yml`
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
- GitHub Pages + VitePress is the official docs publishing layer.
- The docs site splits `Human` and `Agent` at the top level.
- The docs-site publishing baseline is separate from the product-console baseline.
- One-line install entrypoints are public contracts and must be marked `Planned` until implemented.

### Verification expectation before push
- All files above exist locally.
- All `docs/` markdown files use explicit English and Chinese sections.
- OpenAPI parses as YAML.
- JSON Schema files parse as JSON.
- Locale generation succeeds for the docs publishing layer.
- The repository preserves the docs-first baseline and may add milestone implementation foundations in later branches.

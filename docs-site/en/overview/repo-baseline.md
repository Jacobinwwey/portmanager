---
title: "Repository Baseline"
audience: shared
persona:
  - contributor
  - admin
section: overview
sourcePath: "docs/specs/portmanager-repo-baseline.md"
status: active
---
> Source of truth: `docs/specs/portmanager-repo-baseline.md`
> Audience: `shared` | Section: `overview` | Status: `active`
> Updated: 2026-04-16 | Version: v0.2.0-docs-site-baseline
This repository starts as a docs-first baseline.
The first upload intentionally contains documentation, design assets, and contract drafts only.
Business implementation code begins after this baseline is committed and reviewed.
Later milestone branches may add implementation foundations without changing the meaning of the initial baseline upload.

### Initial directories
- docs/specs
- docs/architecture
- docs/operations
- docs/design
- docs-site
- scripts/docs
- .github/workflows
- packages/contracts/openapi
- packages/contracts/jsonschema

### Milestone 1 foundation directories
- apps/controller
- apps/web
- crates/portmanager-agent
- crates/portmanager-cli
- packages/typescript-contracts
- scripts/contracts

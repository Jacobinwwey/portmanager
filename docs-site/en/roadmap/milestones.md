---
title: "Milestones"
audience: shared
persona:
  - contributor
  - admin
  - operator
section: roadmap
sourcePath: "docs/specs/portmanager-milestones.md"
status: active
---
> Source of truth: `docs/specs/portmanager-milestones.md`
> Audience: `shared` | Section: `roadmap` | Status: `active`
> Updated: 2026-04-16 | Version: v0.3.0-docs-site-design-alignment
### Milestone 1: One Host, One Rule, One Rollback
1. contracts foundation
2. controller skeleton with SQLite state store
3. Rust agent skeleton with apply, collect, snapshot, rollback primitives
4. Rust CLI skeleton with `--json` and `--wait`
5. React SPA overview and host detail skeleton based on the locked product-console design baseline
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

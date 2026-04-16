---
title: "Install and Distribution Contract"
audience: shared
persona:
  - admin
  - automation
section: operations
sourcePath: "docs/specs/portmanager-install-distribution-contract.md"
status: active
---
> Source of truth: `docs/specs/portmanager-install-distribution-contract.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-16 | Version: v0.2.0-docs-site-baseline
### Purpose
This document freezes the public shape of the shortest installation and bootstrap entrypoints before the product implementation exists.
The commands below are distribution contracts, not claims of current availability.
Any not-yet-implemented command must be labeled `Planned` in the docs site.

### Human quick-start contract
The human-facing docs site must expose two top-level one-line entrypoints for control-plane installation:
- `Preferred`: safe, auditable, one-command installation shape
- `Fastest`: shortest bootstrap shape, explicitly marked as higher-risk

### Planned command shapes
Preferred:
```bash
# Planned

docker compose -f https://jacobinwwey.github.io/portmanager/install/control-plane.compose.yaml up -d
```

Fastest:
```bash
# Planned
curl -fsSL https://jacobinwwey.github.io/portmanager/install/bootstrap-control-plane.sh | bash
```

### Agent quick-start contract
Agent-facing docs must not pretend to install the control plane.
They must instead expose non-interactive consumption shapes such as:
```bash
# Planned
portmanager operation get op_123 --json --wait
```

```bash
# Planned
curl -fsSL https://controller.example/api/operations/events
```

### Status rule
Until an install or bootstrap path truly exists in-repo and is testable, the docs site must mark it `Planned`.
It must not present planned commands as already available.

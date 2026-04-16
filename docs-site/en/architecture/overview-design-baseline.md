---
title: "Overview Design Baseline"
audience: human
persona:
  - contributor
  - operator
section: architecture
sourcePath: "docs/design/portmanager-overview-design-baseline.md"
status: active
---
> Source of truth: `docs/design/portmanager-overview-design-baseline.md`
> Audience: `human` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Design source of truth
The provided HTML design is the official visual mother template for the V1 Overview console.
The repository preserves:
- the original supplied HTML in `docs/design/assets/original-onesync-reference.html`
- a PortManager semantic reinterpretation in `docs/design/assets/portmanager-overview-reference.html`
- this design-baseline document
- a dedicated semantic mapping document

### What is frozen
The following layout language is now official for the first implementation milestone:
- compact operational header with summary metrics
- left sidebar with strong navigation rhythm and one primary action area
- dense main table as the dominant operational surface
- right context rail for selected entity state
- bottom terminal-style stream for event visibility

### What must change semantically
The original asset-management semantics must be removed.
The UI must speak in PortManager concepts such as:
- control plane health
- managed hosts
- bridge rules
- exposure policy
- operations
- backups
- rollback points
- diagnostics and snapshots

### What must not drift
- no generic SaaS admin-panel flattening
- no replacing the dense host table with oversized marketing cards
- no fake telemetry labels that have no model counterpart
- no divergence from the mother-template layout without revising this document first

### Required implementation alignment
The first real UI implementation must map to this baseline before secondary pages are styled more freely.
If a later implementation needs to depart from this language, the document update must happen first and the change must be treated as a design decision, not a coding convenience.

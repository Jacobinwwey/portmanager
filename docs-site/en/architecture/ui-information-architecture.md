---
title: "Product Web UI Information Architecture"
audience: human
persona:
  - operator
  - contributor
section: architecture
sourcePath: "docs/specs/portmanager-ui-information-architecture.md"
status: active
---
> Source of truth: `docs/specs/portmanager-ui-information-architecture.md`
> Audience: `human` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.4.0-mainline-progress-sync
### Scope boundary
This document defines the product web control-plane information architecture.
It does not define the public VitePress docs site.
The docs-site publishing baseline lives in `docs/design/portmanager-docs-site-design-baseline.md`.

### Baseline direction
The UI baseline reuses the supplied operations-console visual language, but the semantics are fully rewritten for PortManager.
The baseline is not allowed to drift into asset-management vocabulary, synthetic telemetry, or dashboard theater.

### Primary navigation
- `Overview`
- `Hosts`
- `Bridge Rules`
- `Operations`
- `Backups`
- `Console`

### Header
The header is the control-plane status band.
It must show:
- global controller health
- managed host count and readiness summary
- active operations summary
- degraded count
- quick search
- settings / profile entry points

### Overview page
The overview page is the canonical first screen.
Its sections are locked as:
- Header: control-plane total state
- Sidebar: primary navigation and main action
- Main table: `Managed Hosts`
- Right rail: `Selected Host` and `Effective Policy`
- Bottom panel: `Event Stream`

### Hosts page
The hosts page deepens the overview table into a management surface.
Required modules:
- host identity and labels
- Tailscale identity
- readiness and degraded state
- bootstrap status
- agent version and heartbeat
- last successful backup
- last successful diagnostics run

### Host detail page
Required sections:
- identity and readiness summary
- effective exposure policy
- bridge rules table
- recent health checks
- recent operations
- backup and rollback history
- latest diagnostics and snapshots
- local artifact references

### Bridge rule detail page
Required sections:
- desired state vs runtime state
- listen and target coordinates
- policy evaluation result
- last apply operation
- verification result
- last rollback point touching the rule

### Port diagnostics detail page
This page is mandatory in V1 information architecture.
Required sections:
- latest webpage snapshot preview
- capture timestamp and operation link
- TCP reachability result
- HTTP status, page title, and final URL when applicable
- TLS basics: enabled, subject, issuer, expiry, validity note
- recent diagnostic history list
- artifact download links or references

### Operations page
Required sections:
- active and recent operations list
- operation state timeline
- initiator and request source
- linked host, rule, backup, rollback, and diagnostic artifacts
- terminal-style event stream for the selected operation

### Backups page
Required sections:
- local backup inventory
- GitHub backup status
- backup policy mode
- restore eligibility
- rollback point association

### Console page
The console is a human-readable stream of events and operator evidence.
It is not a shell replacement.
It must aggregate:
- controller events
- operation state transitions
- host degraded signals
- diagnostics completion events
- backup / rollback outcomes

### Design rule
The provided HTML remains the product web visual mother template.
This rule applies to the future React SPA control plane, not to `docs-site/`.
Any deviation from its core layout language must be preceded by a design baseline update in `docs/design/`.

### Current implementation parity snapshot
- `Overview`: shell exists and follows the intended visual language, but currently renders mock state rather than controller-backed data.
- `Hosts`: present only as navigation text; dedicated page and live host inventory are still missing.
- `Bridge Rules`: present only as navigation text; dedicated rule list and rule-detail surfaces are still missing.
- `Host detail`: shell exists with policy, health, backups, rollback, diagnostics, and artifact cards, but all content is still mock data.
- `Port diagnostics detail`: required by the architecture, but still missing as a dedicated route or view.
- `Operations`: shell exists, including selected-operation timeline and replay references, but it still uses mock data instead of controller responses and live SSE updates.
- `Backups`: represented only as a subsection inside mock host detail; dedicated page is still missing.
- `Console`: represented only as the bottom stream inside current shells; dedicated evidence console is still missing.

---
title: "UI Information Architecture"
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
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
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
The provided HTML remains the visual mother template.
Any deviation from its core layout language must be preceded by a design baseline update in `docs/design/`.

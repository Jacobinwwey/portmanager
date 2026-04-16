---
title: "Overview Semantic Mapping"
audience: human
persona:
  - contributor
  - operator
section: architecture
sourcePath: "docs/design/portmanager-overview-semantic-mapping.md"
status: active
---
> Source of truth: `docs/design/portmanager-overview-semantic-mapping.md`
> Audience: `human` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Purpose
This document maps the provided HTML console skeleton into PortManager domain semantics so future UI work does not preserve the wrong nouns.

### Header mapping
- `OneSync` -> `PortManager`
- search box -> cross-surface quick search for host, rule, operation, backup
- total / up / updates / off -> managed hosts / ready / active operations / degraded
- profile area -> operator identity and workspace or environment context

### Sidebar mapping
- `Dashboard` -> `Overview`
- `Software Assets` -> `Hosts`
- `Inventory` -> `Bridge Rules`
- `Debug Log` -> `Console`
- `Nodes` -> `Operations` or host-oriented navigation depending on final routing
- bottom CTA -> `Add Host` or `Apply Desired State` depending on page context

### Main content mapping
- `Operations Overview` -> `Control Plane Overview`
- `Active Node` -> current selected host or current focused environment
- `Critical Software Assets` -> `Managed Hosts`
- table rows -> host rows, not software package rows
- status pills -> readiness, policy, or health states tied to the domain model
- right metadata card -> `Selected Host`
- right skills card -> `Effective Policy`
- bottom debug stream -> `Event Stream`

### PortManager-only additions required by V1
The original reference does not include enough semantics for PortManager V1, so the following must be added in actual implementation while preserving the layout language:
- host readiness and Tailscale identity
- backup and rollback visibility
- diagnostics and snapshot visibility
- per-port reachability and HTTP/TLS detail
- operation traceability

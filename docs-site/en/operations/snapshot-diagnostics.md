---
title: "Snapshot and Diagnostics"
audience: shared
persona:
  - operator
  - admin
  - automation
section: operations
sourcePath: "docs/specs/portmanager-snapshot-diagnostics.md"
status: active
---
> Source of truth: `docs/specs/portmanager-snapshot-diagnostics.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Locked capture model
V1 uses `controller-side capture`.
The controller reaches `host:port` over Tailscale and performs transport checks, HTTP inspection, TLS inspection, and webpage screenshot capture without turning the agent into a browser runtime.

### Why this choice is preferred
- keeps the agent small and execution-oriented
- keeps screenshots and diagnostics in the same control-plane evidence system
- makes Web, CLI, and future SDKs consume the same artifact model
- reduces remote runtime dependency complexity

### Minimum diagnostic outputs
- host and rule context
- target port and scheme assumptions
- TCP reachability result
- HTTP result when applicable
- page title and basic metadata
- final URL when a redirect chain exists
- TLS basics when applicable: enabled, subject, issuer, expiry, validity summary
- capture timestamp
- operation linkage
- artifact linkage

### Minimum snapshot outputs
- screenshot artifact path or object key
- preview-ready metadata
- viewport and capture mode metadata
- operation linkage
- target host/rule/port context

### Artifact handling
- Results must be stored in the controller-side artifact store.
- Operation detail must link to diagnostics and snapshot artifacts.
- Host and rule views must surface the latest known result and recent history.
- Missing artifacts are a degraded or failed result, not a silent omission.

### UX expectation
The frontend must support:
- latest preview image for a port
- diagnostic summary card
- recent run history
- operation traceability
- explicit error state when capture fails

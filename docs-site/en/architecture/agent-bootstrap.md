---
title: "Agent Bootstrap"
audience: shared
persona:
  - admin
  - contributor
  - automation
section: architecture
sourcePath: "docs/architecture/portmanager-agent-bootstrap.md"
status: active
---
> Source of truth: `docs/architecture/portmanager-agent-bootstrap.md`
> Audience: `shared` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Bootstrap objective
Convert a supported remote Ubuntu 24.04 host from unmanaged state into a `ready` PortManager host without making SSH the long-term control plane.

### Ordered bootstrap flow
1. Create a `Host` record in controller.
2. Run probe over SSH with read-only capability checks.
3. Refuse bootstrap if mandatory prerequisites fail.
4. Upload bootstrap bundle over SSH.
5. Install Rust agent binary and supporting unit files.
6. Write `/etc/portmanager/agent.toml`.
7. Initialize `/var/lib/portmanager/desired-state.toml`, runtime directories, and ownership.
8. Register and start the `systemd` service.
9. Verify HTTP reachability over Tailscale.
10. Collect first runtime state and persist it in controller.
11. Mark host `ready` only after validation passes.

### Probe requirements
- Ubuntu 24.04
- `systemd` available
- `sudo` available
- `tailscale` installed and operational
- packet-filter dependency available for V1 rule model
- target directories writable
- non-interactive SSH commands succeed
- host identity and Tailscale address discoverable

### Rescue boundary
- SSH remains the recovery path if the agent is not reachable.
- Rescue does not redefine the steady-state architecture.
- Rescue commands must still be surfaced as operations when executed through controller workflows later.

### Agent responsibilities after bootstrap
- expose minimal HTTP API over Tailscale
- apply desired bridge rules
- report runtime state
- create local snapshots and rollback primitives
- return machine-readable execution results

### Configuration split
- Human-maintained configuration: TOML under `/etc/portmanager`
- Runtime payloads, manifests, and diagnostics: JSON under `/var/lib/portmanager` and controller artifact paths

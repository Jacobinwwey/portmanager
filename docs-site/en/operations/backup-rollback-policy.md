---
title: "Backup and Rollback Policy"
audience: shared
persona:
  - operator
  - admin
  - contributor
section: operations
sourcePath: "docs/operations/portmanager-backup-rollback-policy.md"
status: active
---
> Source of truth: `docs/operations/portmanager-backup-rollback-policy.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-17 | Version: v0.2.0-github-backup
### Hard safety rule
Every destructive operation must create a backup before mutation.
Rollback itself is also a destructive operation and therefore follows the same rule.

### Backup classes
- `local`: required in V1 and blocks mutation if it fails
- `github`: supported in V1 as an optional secondary durability target

### Policy levels
- `best_effort`: local backup required, GitHub backup attempted but not blocking
- `required`: both local and remote backup required before mutation can continue

### Authentication baseline
- GitHub private backup uses a fine-grained PAT in V1.
- The token is controller-side only and must not be propagated to agents.

### Current controller implementation
- Controller always writes the local backup artifacts first and preserves the manifest path as the rollback anchor.
- When `PORTMANAGER_GITHUB_BACKUP_ENABLED`, `PORTMANAGER_GITHUB_BACKUP_REPO`, and `PORTMANAGER_GITHUB_BACKUP_TOKEN` are configured, controller uploads one JSON bundle through the GitHub Contents API to `portmanager-backups/{hostId}/{backupId}.bundle.json`.
- The uploaded bundle contains the manifest plus the serialized local artifact files so rollback evidence and remote redundancy stay aligned.
- `required` degrades when GitHub upload is missing or fails.
- `best_effort` keeps the operation succeeded on local backup success while still publishing explicit remote failure or setup guidance.

### Managed rollback boundary
Rollback restores only PortManager-managed assets, including:
- agent-managed configuration
- PortManager-owned runtime metadata
- bridge-related packet-filter rules
- PortManager-managed systemd or sysctl artifacts

Rollback does not claim ownership over unrelated workloads, user applications, or arbitrary host changes.

### Minimum backup bundle contents
- manifest
- desired-state snapshot
- runtime-state snapshot
- related operation metadata
- health summary
- checksums
- artifact references if diagnostics or snapshots were part of the mutation path

### Required operator visibility
The product must show:
- whether a local backup succeeded
- whether GitHub backup was attempted and succeeded
- which GitHub repo/path received the remote bundle or why upload failed
- which rollback points are valid candidates
- which operation created each backup and rollback point

---
title: Operations
---

# Operations

Operations defines how PortManager is installed, diagnosed, protected, and recovered.

## Start here

- [Install and Distribution Contract](/en/operations/install-distribution-contract)
- [Snapshot and Diagnostics](/en/operations/snapshot-diagnostics)
- [Backup and Rollback Policy](/en/operations/backup-rollback-policy)
- [SDK and Docker Boundary](/en/operations/sdk-and-docker-boundary)

## What this section must preserve

- install commands stay explicit about `Available` versus `Planned`
- diagnostics remain observable evidence rather than vague health text
- destructive change must remain backup-aware and rollback-aware

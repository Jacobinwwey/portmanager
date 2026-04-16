---
title: Operator
---

# Operator

This page is for the person who needs to decide whether a host or bridge rule is healthy, degraded, or recoverable.

## Start here

1. Read [Snapshot and Diagnostics](/en/operations/snapshot-diagnostics).
2. Read [Backup and Rollback Policy](/en/operations/backup-rollback-policy).
3. Read [Product Web UI Information Architecture](/en/architecture/ui-information-architecture).

## What this role must see clearly

- whether a host is `draft`, `ready`, or `degraded`
- whether a bridge rule is `desired`, `active`, or `degraded`
- what evidence exists for TCP, HTTP, TLS, and web snapshot checks
- what rollback point was created before destructive mutation

## Boundary

Operator pages may explain context and intent, but they cannot redefine the runtime contract or invent new state names beyond the raw source documents.

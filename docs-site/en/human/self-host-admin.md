---
title: Self-Host Admin
---

# Self-Host Admin

This page is for the human who deploys or maintains the PortManager control plane in a real self-hosted environment.

## Start here

1. Read [Install and Distribution Contract](/en/operations/install-distribution-contract).
2. Read [SDK and Docker Boundary](/en/operations/sdk-and-docker-boundary).
3. Read [Agent Bootstrap](/en/architecture/agent-bootstrap).

## What this role must preserve

- the default install surface stays the safer one-line contract
- Docker covers `controller + web`, not the agent
- bootstrap and rescue remain explicit instead of hidden inside convenience scripts
- planned commands stay labeled `Planned` until implementation exists

## Boundary

Human install guidance is allowed to simplify reading order, but it must not erase operational prerequisites, fallback paths, or recovery assumptions.

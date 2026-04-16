---
title: SDK Integrator
---

# SDK Integrator

This page is for the person integrating PortManager through generated clients, automation code, or future SDK surfaces.

## Start here

1. Read [Contracts Baseline](/en/reference/contracts-baseline).
2. Read [OpenAPI Reference](/en/reference/openapi).
3. Read [Contract Strategy](/en/architecture/contract-strategy).

## What this role must preserve

- generated clients come from `OpenAPI + JSON Schema + codegen`
- long-term hand-written DTO forks are not acceptable
- CLI JSON output, API output, and future SDK shapes stay aligned
- operation, diagnostic, and rollback result semantics stay stable across surfaces

## Boundary

Human integration docs can explain why the contract is shaped this way, but the contract itself remains owned by the raw source under `docs/` and `packages/contracts/`.

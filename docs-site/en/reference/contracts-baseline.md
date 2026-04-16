---
title: "Contracts Baseline"
audience: shared
persona:
  - integrator
  - automation
  - contributor
section: reference
sourcePath: "packages/contracts/README.md"
status: active
---
> Source of truth: `packages/contracts/README.md`
> Audience: `shared` | Section: `reference` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Purpose
This directory contains the shared public contract baseline for PortManager V1.
It exists so the future controller, web, CLI, agent, and SDKs all grow from one reviewed interface definition.

### Contents
- `openapi/openapi.yaml`: controller REST + SSE contract draft
- `jsonschema/runtime-state.schema.json`: agent-reported runtime state
- `jsonschema/apply-desired-state.schema.json`: desired state payload applied to a host
- `jsonschema/snapshot-manifest.schema.json`: backup / artifact manifest
- `jsonschema/rollback-result.schema.json`: rollback execution result
- `jsonschema/operation-result.schema.json`: operation status and summary result
- `jsonschema/port-diagnostic-result.schema.json`: port connectivity and HTTP/TLS diagnostic result
- `jsonschema/web-snapshot-result.schema.json`: webpage screenshot result metadata

### Ownership rules
- OpenAPI owns controller API resources and SSE events.
- JSON Schema owns agent payloads and artifact/result documents.
- Future code generation must treat these files as the canonical interface baseline.

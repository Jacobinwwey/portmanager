---
title: "Contract Strategy"
audience: shared
persona:
  - integrator
  - contributor
  - automation
section: architecture
sourcePath: "docs/architecture/portmanager-contract-strategy.md"
status: active
---
> Source of truth: `docs/architecture/portmanager-contract-strategy.md`
> Audience: `shared` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-docs-baseline
### Hard rule
`OpenAPI + JSON Schema + code generation` is a non-negotiable foundation for PortManager V1.

### Contract ownership
- OpenAPI owns controller API resources, request bodies, response bodies, and SSE event shapes.
- JSON Schema owns agent-facing payloads, runtime snapshots, diagnostic evidence, rollback results, and backup manifests.
- Generated SDKs and generated models must be derived from these contracts rather than maintained as parallel hand-written truth.

### Why this is locked
- Prevent DTO drift between Web, controller, CLI, agent, and SDKs.
- Make CLI output and Web/API state semantics converge instead of diverge.
- Keep future language expansion bounded by codegen rather than re-interpretation.
- Allow contract review before implementation review.

### Codegen rule set
- Web, controller, and TypeScript SDK use generated TypeScript types from OpenAPI and JSON Schema.
- CLI and agent use generated or schema-aligned Rust models.
- Temporary hand-written adapters are allowed only as thin integration code around generated types.
- Long-term parallel DTO ownership is prohibited.

### Versioning rule set
- Contract versions advance through repository review, not ad-hoc runtime drift.
- Breaking contract changes require explicit version bump and docs update.
- Event stream payloads must be versioned with the same discipline as REST resources.

### Review expectation in later milestones
Any implementation PR that changes resource shape, operation state shape, diagnostic payloads, or rollback artifacts must update the contracts first or in the same change.

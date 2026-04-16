---
title: "Toward C Strategy"
audience: shared
persona:
  - contributor
  - admin
  - operator
  - automation
section: roadmap
sourcePath: "docs/specs/portmanager-toward-c-strategy.md"
status: active
---
> Source of truth: `docs/specs/portmanager-toward-c-strategy.md`
> Audience: `shared` | Section: `roadmap` | Status: `active`
> Updated: 2026-04-16 | Version: v0.1.0-roadmap-solidification
### Purpose
This document turns `Toward C` from a loose label into a recorded strategic direction.
It exists so Milestone 3 is not read as “more scale later,” but as a specific broadening of PortManager's product and engineering posture.

### What C is
`C` is specifically **Scheme C: Agent-First Distributed Platform**.
It is not merely “broader platform support later.”
In this scheme:
- controller, agent, event stream, policy layer, and audit layer are split from the beginning
- UI, CLI, and automation all talk to an API gateway
- remote agents are treated as first-class citizens rather than thin edge helpers

This is the most architecturally complete direction under discussion.

### What C is not
- not a pivot to arbitrary shell automation as the primary operating model
- not a promise to support every client and every host in one release
- not a rewrite mandate driven by language ideology
- not a hosted SaaS or multi-tenant platform commitment by default
- not an excuse to bypass contract governance
- not the correct starting point for a V1 empty-repository build that still needs to prove practical value and robustness quickly

### Relationship to A and B
- `A` freezes the docs-first baseline, contracts, and design boundaries.
- `B` proves the first trusted control-plane slice and absorbs the minimum current agent-service behavior into that model.
- `C` only becomes responsible work once both `A` and `B` are already real enough that broader scope will not dissolve the product into ambiguity.

### Why keep C at all
Even though C is too heavy for the V1 starting point, it remains important because it captures the most complete long-term architecture direction:
- strongest theoretical extensibility
- cleanest first-class-agent posture
- cleanest long-term separation between policy, execution, events, and audit

The roadmap keeps C not because it should be started immediately, but because it should remain visible as an intentional later option once the system earns the right to broaden.

### Why C matters
Without C, PortManager risks remaining only a narrow single-purpose exposure tool.
With C, PortManager can become a more durable foundation for:
- multi-host operations
- richer agent reporting and event semantics
- future agent-consumer workflows
- broader operating-system reach
- wider developer and operator integration surfaces

### Trade-off summary
Advantages of Scheme C:
- most “complete” architecture on paper
- strongest theoretical extensibility
- strongest first-class-agent posture

Costs of Scheme C at V1 time:
- obvious over-design risk
- too much time can be spent on infrastructure instead of delivered value
- V1 can lose the practical implementation and robustness focus that matters most right now

Suitability:
- a better fit when there is already a team, product validation, and multiple deployment environments advancing in parallel
- a poor fit for the first proof slice of an empty-repository control plane

### Engineering implications locked for C
- `controller`: must grow stronger orchestration, operation graphing, and event indexing semantics rather than merely more CRUD endpoints
- `web`: must evolve from single-host inspection to multi-host and multi-operation coordination without losing the operator-first model
- `cli`: must remain deterministic and agent-friendly while supporting broader orchestration flows
- `agent`: must report richer runtime evidence and event structure, but remain bounded rather than becoming an ungoverned strategy peer
- `shared contracts`: must continue to govern every surface expansion so platform breadth does not become DTO drift

### Language and boundary decisions carried into C
- The current split of `TypeScript web/controller` plus `Rust CLI/agent` remains valid until measured pressure proves otherwise.
- `OpenAPI + JSON Schema + codegen` stays non-negotiable.
- `TOML` remains the preferred human-maintained config format, while `JSON` remains the transport, snapshot, and export format.
- `PostgreSQL` is a migration path for reliability and concurrency pressure, not a symbolic prerequisite for seriousness.

### Platform-expansion rule
C can broaden support to additional targets such as macOS, wider Linux profiles, Windows remote, and future mobile-adjacent consumer surfaces.
But each target must enter through an explicit support boundary and platform abstraction layer.
C is not allowed to grow by piling undocumented target-specific exceptions into the controller or agent.

### Entry criteria for real C execution
- B-state operations are trusted in repeated use
- drift, degraded, backup, and rollback semantics are operationally credible
- minimal agent-service migration is complete enough that the legacy behavior is no longer the true center of gravity
- contract surfaces are stable enough that new SDK and agent-consumer flows do not cause semantic divergence

### Strategy risk to watch
The biggest risk in C is premature generalization.
If PortManager broadens platform and orchestration scope before the operational model is trusted, the product will become broader and weaker at the same time.
The antidote is to treat C as a gated expansion, not a default appetite for abstraction.

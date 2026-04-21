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
> Updated: 2026-04-21 | Version: v0.2.0-m3-phase0-enablement
### Purpose
This document keeps `Toward C` specific.
Milestone 3 is not “more scale later.”
It is the bounded path from PortManager's accepted `B` state toward **Scheme C: Agent-First Distributed Platform**.

### Readiness update on 2026-04-21
PortManager is no longer in the old posture where `Toward C` had to stay purely theoretical.
The repo now has:

- an accepted Milestone 1 public slice
- a promotion-ready Milestone 2 confidence lane with deliberate wording review
- one verified live evidence model across controller, CLI, web, agent, docs, and CI review surfaces

That means Milestone 3 can start as `Phase 0 enablement`.
It does **not** mean Scheme C is already implemented.

### What C is
`C` is specifically **Scheme C: Agent-First Distributed Platform**.
In that scheme:

- controller, agent, event stream, policy layer, and audit layer become explicit architecture seams
- UI, CLI, and automation converge on a gateway-ready API boundary instead of ad-hoc local surface growth
- remote agents remain bounded, but become first-class evidence and orchestration participants

### What C is not
- not a pivot to arbitrary shell automation as the operating model
- not a promise to support every client and every host in one release
- not a rewrite mandate driven by language ideology
- not hosted SaaS or multi-tenant scope by default
- not permission to bypass contract governance
- not proof that the repo already contains a gateway, split audit service, batch orchestration, or PostgreSQL readiness

### Relationship to A and B
- `A` freezes the docs-first baseline, contracts, and design boundaries.
- `B` proves the first trusted control-plane slice and absorbs the minimum current agent-service behavior into that model.
- `C` starts only after `A` and `B` are real enough that broader scope will not dissolve the product back into ambiguity.

### Current architecture gap map

| Scheme C expectation | Current verified state | Gap posture |
| --- | --- | --- |
| Gateway-ready consumer boundary | Web and CLI still call the controller directly over `REST + SSE` | Not started |
| Explicit event/policy/audit seams | `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still concentrate most of that work | Not started |
| First-class bounded agent role | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback` with live controller sync | Partially earned |
| Batch host orchestration | Proof slice still centers on one host / one rule plus reliability replay | Not started |
| Persistence readiness beyond SQLite | SQLite remains the only real store | Not started |
| Platform abstraction for second targets | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started |

### Why keep C
Without C, PortManager risks staying only a narrow single-purpose exposure tool.
With C, PortManager can become a stronger foundation for:

- multi-host operations
- richer agent reporting and event semantics
- future agent-consumer workflows
- broader operating-system reach
- wider developer and operator integration surfaces

### Trade-off summary
Advantages of Scheme C:

- strongest long-term extensibility
- clearest first-class-agent posture
- cleanest long-term separation between policy, execution, events, and audit

Costs of Scheme C if started carelessly:

- easy over-design
- infrastructure work can outrun delivered value
- reliability truth can get diluted while scope broadens

### Phase 0 enablement workstreams
Milestone 3 starts with bounded enablement work, not full distributed separation:

- gateway-ready consumer boundary
- controller seam extraction for policy, orchestration, read models, and audit/event indexing
- bounded batch host and multi-operation primitives on the same evidence model
- persistence seams and PostgreSQL readiness criteria
- explicit target-abstraction rules before second-target claims

### Language and boundary decisions carried into C
- The current `TypeScript web/controller + Rust CLI/agent` split remains valid until measured pressure proves otherwise.
- `OpenAPI + JSON Schema + codegen` stays non-negotiable.
- `TOML` remains the preferred human-maintained config format, while `JSON` remains the transport, snapshot, and export format.
- `PostgreSQL` is still a migration path for real concurrency or reliability pressure, not a symbolic prerequisite.

### Entry criteria for real C execution
- B-state operations are trusted in repeated use.
- Drift, degraded, backup, and rollback semantics are operationally credible.
- Minimal agent-service migration is complete enough that legacy behavior is no longer the true center of gravity.
- Contract surfaces are stable enough that new SDK and agent-consumer flows do not cause semantic divergence.

### Strategy risk to watch
The biggest Milestone 3 risk is premature generalization.
If PortManager broadens platform and orchestration scope before the operational model is trusted, the product becomes broader and weaker at the same time.
The antidote is to treat C as a gated expansion and to keep the Milestone 2 guardrail active while C begins.

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
- not proof that the repo already contains a standalone gateway app, standalone audit service, broad fleet orchestration, or a PostgreSQL backend

### Relationship to A and B
- `A` freezes the docs-first baseline, contracts, and design boundaries.
- `B` proves the first trusted control-plane slice and absorbs the minimum current agent-service behavior into that model.
- `C` starts only after `A` and `B` are real enough that broader scope will not dissolve the product back into ambiguity.

### Current architecture gap map

| Scheme C expectation | Current verified state | Gap posture |
| --- | --- | --- |
| Gateway-ready consumer boundary | Controller now serves `/api/controller` as a consumer-prefixed boundary while keeping legacy direct routes compatible; Web preserves prefixed base URLs and CLI accepts `PORTMANAGER_CONSUMER_BASE_URL`, even though no standalone gateway app exists yet | Phase 0 baseline landed |
| Explicit event/policy/audit seams | `controller-read-model`, `controller-domain-service`, `/event-audit-index`, and the persistence adapter now extract the first seam set, even though controller transport and store still centralize too much work | Phase 0 baseline landed |
| First-class bounded agent role | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback` with live controller sync | Partially earned |
| Batch host orchestration | One bounded batch exposure-policy envelope now lands as an auditable parent operation with host-scoped child outcomes across controller, CLI, and Web | Phase 0 baseline landed |
| Persistence readiness beyond SQLite | `operation-store` now runs behind a SQLite-backed persistence adapter seam, publishes measurable PostgreSQL readiness pressure from live store counts, and exposes `/persistence-decision-pack` so cutover review pressure is explicit while SQLite stays active | Phase 0 baseline landed |
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

### Phase 0 continuation workstreams
Milestone 3 now continues from landed seams instead of restarting them:

- keep the landed `/api/controller` consumer boundary stable while defining future split criteria
- Unit 57: complete. one explicit `audit-review-service` owner now governs the current replay plus indexed review surfaces without changing route contracts
- Unit 58: complete. explicit target-profile registry and target-abstraction rules now lock the Ubuntu 24.04 + systemd + Tailscale contract before any second-target claim
- Unit 59: complete. persistence promotion decision surface now turns measured readiness criteria into `/persistence-decision-pack` with explicit next actions while SQLite stays active
- Next queue: later standalone split criteria and broader second-target policy work, not a PostgreSQL default-store claim
- keep bounded batch work on the same evidence model instead of inventing a second orchestration path

### Language and boundary decisions carried into C
- The current `TypeScript web/controller + Rust CLI/agent` split remains valid until measured pressure proves otherwise.
- `OpenAPI + JSON Schema + codegen` stays non-negotiable.
- `TOML` remains the preferred human-maintained config format, while `JSON` remains the transport, snapshot, and export format.
- `PostgreSQL` is still a migration path for real concurrency or reliability pressure, not a symbolic prerequisite; the new persistence adapter, readiness report, explicit `/persistence-readiness` contract, and `/persistence-decision-pack` review surface exist to measure and review that pressure before any default-store change.

### Entry criteria for real C execution
- B-state operations are trusted in repeated use.
- Drift, degraded, backup, and rollback semantics are operationally credible.
- Minimal agent-service migration is complete enough that legacy behavior is no longer the true center of gravity.
- Contract surfaces are stable enough that new SDK and agent-consumer flows do not cause semantic divergence.

### Strategy risk to watch
The biggest Milestone 3 risk is premature generalization.
If PortManager broadens platform and orchestration scope before the operational model is trusted, the product becomes broader and weaker at the same time.
The antidote is to treat C as a gated expansion and to keep the Milestone 2 guardrail active while C begins.

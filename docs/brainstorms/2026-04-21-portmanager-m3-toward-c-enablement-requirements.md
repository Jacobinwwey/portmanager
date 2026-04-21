---
date: 2026-04-21
topic: portmanager-m3-toward-c-enablement
---

# PortManager Milestone 3 Toward C Enablement Requirements

Status note on `2026-04-21`: deep comparison now shows Milestone 1 accepted, Milestone 2 promotion-ready thresholds met, and the current implementation still centered on one controller service plus one bounded agent service. PortManager has earned Milestone 3 entry planning, but it has not earned full Scheme C claims yet.

## Problem Frame
Current repo truth has shifted again:

- the accepted live host / rule / policy slice is real across controller, CLI, web, agent, and docs
- the reliability confidence lane is no longer missing history, review, or publication machinery
- the roadmap still mostly frames `Toward C` as a distant direction instead of a bounded next-phase execution lane

That creates a new gap.
Developers now need one concrete Milestone 3 entry posture that does three things at once:

- preserves the Milestone 2 guardrail and evidence model
- explains exactly what current code already satisfies from prior `Toward C` expectations
- names the first bounded enablement workstreams without pretending the repo already has an API gateway, split event/audit services, fleet orchestration, or PostgreSQL readiness

## Comparison Against Prior Plans And Scheme C

| Prior Scheme C expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| UI, CLI, and automation speak through an API gateway | Web and CLI still call the controller directly over `REST + SSE`; repo has no dedicated gateway app or service boundary | Not started | Milestone 3 must begin with a gateway-ready boundary plan, not a fake gateway claim |
| Controller, event, policy, and audit layers are explicitly separated | `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still hold most orchestration, persistence, event, and policy responsibilities inside one TypeScript service | Not started | Phase 0 should extract seams before any deployment split |
| Remote agent acts as a first-class architecture participant | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback`, and controller syncs desired state against that live boundary | Partially earned | Milestone 3 can deepen event semantics and orchestration on top of this bounded agent role |
| Batch host management and bounded orchestration primitives | Current verified proof remains one host / one rule plus reliability replay on the same accepted slice | Not started | Phase 0 needs explicit multi-host and batch-operation design work without bypassing evidence rules |
| Persistence can grow past SQLite when real pressure appears | Current state store remains SQLite and no adapter or migration-readiness seam is yet verified | Not started | Phase 0 should isolate persistence seams before any PostgreSQL move |
| Platform breadth grows through explicit abstractions | Supported target still remains `Ubuntu 24.04 + systemd + Tailscale` | Not started | Milestone 3 should define target-abstraction rules before second-target claims appear |

## Requirements

**Entry Posture**
- R1. Milestone 3 must enter as `Phase 0 enablement` on top of the accepted Milestone 1 slice and the promotion-ready Milestone 2 guardrail; docs must not imply that full Scheme C delivery already exists.
- R2. Public and maintainer-facing progress docs must explicitly compare current code against prior Scheme C expectations so contributors can see what is real, partial, and still missing.
- R3. The Milestone 2 maintenance gate remains mandatory while Milestone 3 begins; `pnpm acceptance:verify`, `pnpm milestone:verify:confidence`, and the wording-review flow stay active guardrails rather than “finished and forgotten” chores.

**Phase 0 Workstreams**
- R4. Milestone 3 Phase 0 must define bounded workstreams for a gateway-ready consumer boundary, controller seam extraction, richer event/audit indexing, bounded batch orchestration primitives, and persistence-readiness seams.
- R5. Those workstreams must keep one contract truth and one evidence model across controller, CLI, web, and agent rather than introducing side channels or surface-specific DTO drift.
- R6. Phase 0 must keep the agent bounded as execution and evidence plane; Milestone 3 is not permission to pivot into arbitrary shell orchestration or an ungoverned strategy peer.
- R7. PostgreSQL default-switching, broader platform targets, and broad productization of C-shaped capabilities remain follow-on work after Phase 0 seams prove credible.

**Documentation And Developer Guidance**
- R8. `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, `docs/specs/portmanager-v1-product-spec.md`, `docs/specs/portmanager-toward-c-strategy.md`, and `docs/architecture/portmanager-v1-architecture.md` must all describe the same Milestone 3 truth: next-phase enablement has started, but the repo still lacks the full Scheme C runtime shape.
- R9. Roadmap and development-progress pages must surface one new requirements/plan pair for Milestone 3 entry, explain the current architecture gap map, and keep the Milestone 2 review commands visible for developers.
- R10. Docs regression coverage must lock the new roadmap/development-progress direction docs and the Milestone 3 phase wording so future copy drift cannot silently move the repo back to either “Toward C is only later” or “Toward C is already delivered”.

## Success Criteria
- Contributors can explain why Milestone 3 starts now, why it is still bounded, and what concrete architecture work comes first.
- Public roadmap and development-progress pages show Milestone 3 as the next execution phase without overstating distributed-platform delivery.
- Root docs, milestone docs, strategy docs, and architecture docs all agree on the same posture: Milestone 2 remains a guardrail, and Milestone 3 starts as enablement rather than full separation.

## Scope Boundaries
- Do not claim that an API gateway, split event/audit services, batch orchestration, PostgreSQL readiness, or multi-platform abstractions are already implemented.
- Do not weaken the accepted Milestone 1 and Milestone 2 evidence model while opening Milestone 3.
- Do not broaden supported-target claims beyond the first Ubuntu 24.04 profile.
- Do not rewrite the product boundary or drop contract-first governance in the name of speed.

## Key Decisions
- Treat Milestone 3 as a bounded enablement phase instead of a binary “later” bucket or a premature distributed rewrite.
- Keep Milestone 2 maintenance commands and review surfaces visible inside Milestone 3 docs because they still guard public truth.
- Use a gap-map comparison against prior Scheme C expectations as the main way to keep Milestone 3 honest.

## Dependencies / Assumptions
- The current promotion-ready confidence artifact and development-progress page remain the published proof source for Milestone 2 guardrail health.
- Current controller, web, CLI, and agent code stays the verified base while Milestone 3 Phase 0 planning begins.
- The roadmap page can move Milestone 3 forward only if its copy also keeps explicit “not yet delivered” gaps visible.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` for the Phase 0 execution sequence.

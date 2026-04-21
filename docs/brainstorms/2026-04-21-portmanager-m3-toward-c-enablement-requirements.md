---
date: 2026-04-21
topic: portmanager-m3-toward-c-enablement
---

# PortManager Milestone 3 Toward C Enablement Requirements

Status note on `2026-04-21`: deep comparison now shows Milestone 1 accepted, Milestone 2 promotion-ready thresholds met, and Units 51 through 60 already landed. PortManager is no longer only entering Milestone 3; it is now inside Milestone 3 `Phase 0 enablement` with consumer-boundary, audit-index, target-profile, persistence, and split-criteria baselines in code. PortManager still has not earned full Scheme C claims because no standalone gateway deployment boundary, no broader second-target policy, and no real PostgreSQL backend path exist yet.

## Problem Frame
Current repo truth has shifted again:

- the accepted live host / rule / policy slice is real across controller, CLI, web, agent, and docs
- the reliability confidence lane is no longer missing history, review, or publication machinery
- the first Milestone 3 seams are now real: `/api/controller`, `/consumer-boundary-decision-pack`, `controller-domain-service`, `controller-read-model`, `/event-audit-index`, `/persistence-readiness`, the target-profile registry, and the SQLite-backed persistence adapter all landed without changing the accepted evidence model
- roadmap and progress docs still need one refreshed gap map that distinguishes landed Phase 0 baselines from the still-missing standalone boundaries and abstraction rules

That creates a new gap.
Developers now need one concrete Milestone 3 entry posture that does three things at once:

- preserves the Milestone 2 guardrail and evidence model
- explains exactly what current code already satisfies from prior `Toward C` expectations
- names the next bounded enablement workstreams without pretending the repo already has a standalone gateway app, split audit/event services, broad fleet orchestration, second-target support, or a PostgreSQL backend

## Comparison Against Prior Plans And Scheme C

| Prior Scheme C expectation | Current code and docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| UI, CLI, and automation speak through an API gateway | Controller now serves `/api/controller/*` as a compatibility-safe consumer boundary, Web preserves prefixed base URLs, and CLI accepts `PORTMANAGER_CONSUMER_BASE_URL`, but there is still no standalone gateway app or deployment boundary | Phase 0 baseline landed | Next phase should define consumer-boundary split criteria and review ownership instead of reopening routing-alias work |
| Controller, event, policy, and audit layers are explicitly separated | `controller-domain-service`, `controller-read-model`, `event-audit-index`, and the persistence adapter now carve initial seams, but `apps/controller/src/controller-server.ts` and `apps/controller/src/operation-store.ts` still centralize too much transport, review, and storage work | Partial boundary extraction | Milestone 3 now needs a standalone audit/event decision pack and slimmer controller composition before service-split claims |
| Remote agent acts as a first-class architecture participant | Agent already serves `/health`, `/runtime-state`, `/apply`, `/snapshot`, and `/rollback`, and controller syncs desired state against that live boundary | Partially earned | Milestone 3 can deepen evidence semantics and orchestration on top of this bounded agent role without turning the agent into a strategy peer |
| Batch host management and bounded orchestration primitives | One bounded exposure-policy batch envelope now exists with auditable parent/child outcomes across controller, CLI, and Web | Phase 0 baseline landed | The next gap is a broader audited operation taxonomy and review boundary, not another proof that a batch envelope can exist |
| Persistence can grow past SQLite when real pressure appears | `operation-store` now runs behind a SQLite-backed persistence adapter seam and publishes measurable PostgreSQL readiness pressure from live store counts, but PostgreSQL is still a disabled target path | Phase 0 baseline landed | Milestone 3 now needs a migration decision surface and cutover criteria, not a default-store claim |
| Platform breadth grows through explicit abstractions | Supported target still remains `Ubuntu 24.04 + systemd + Tailscale`, and that locked profile is now explicit through one registry published across controller, CLI, and Web | Phase 0 baseline landed | Milestone 3 now needs broader second-target policy rules rather than more first-target registry work |

## Requirements

**Entry Posture**
- R1. Milestone 3 must enter as `Phase 0 enablement` on top of the accepted Milestone 1 slice and the promotion-ready Milestone 2 guardrail; docs must not imply that full Scheme C delivery already exists.
- R2. Public and maintainer-facing progress docs must explicitly compare current code against prior Scheme C expectations so contributors can see what is real, partial, and still missing.
- R3. The Milestone 2 maintenance gate remains mandatory while Milestone 3 begins; `pnpm acceptance:verify`, `pnpm milestone:verify:confidence`, and the wording-review flow stay active guardrails rather than “finished and forgotten” chores.

**Phase 0 Continuation Workstreams**
- R4. Milestone 3 continuation must define bounded workstreams for standalone audit/event boundary decisions, consumer-boundary split criteria, persistence migration decision criteria, and target-profile abstraction rules on top of the already landed Units 51 through 60 baselines.
- R5. Those workstreams must keep one contract truth and one evidence model across controller, CLI, web, and agent rather than introducing side channels or surface-specific DTO drift; the landed `/api/controller`, `/event-audit-index`, and `/persistence-readiness` surfaces remain the canonical baseline while the next decisions are made.
- R6. Phase 0 must keep the agent bounded as execution and evidence plane; Milestone 3 is not permission to pivot into arbitrary shell orchestration or an ungoverned strategy peer.
- R7. Standalone gateway deployment, PostgreSQL default switching, broader platform targets, and broad productization of C-shaped capabilities remain follow-on work after the new decision packs and abstraction rules prove credible.

**Documentation And Developer Guidance**
- R8. `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, `docs/specs/portmanager-v1-product-spec.md`, `docs/specs/portmanager-toward-c-strategy.md`, and `docs/architecture/portmanager-v1-architecture.md` must all describe the same Milestone 3 truth: Units 51 through 60 are landed, but the repo still lacks the full Scheme C runtime shape.
- R9. Roadmap and development-progress pages must surface the refreshed requirements/plan pair, show landed Units 51 through 60 for developers, explain the current architecture gap map, and keep the Milestone 2 review commands visible.
- R10. Docs regression coverage must lock the roadmap/development-progress direction docs and Milestone 3 continuation wording so future copy drift cannot silently move the repo back to either “Toward C is only later,” “routing split is still unfinished,” or “Toward C is already delivered”.

## Success Criteria
- Contributors can explain why Milestone 3 started now, what Units 51 through 60 already delivered, why the phase is still bounded, and what concrete architecture work comes next.
- Public roadmap and development-progress pages show Milestone 3 as the active execution phase without overstating distributed-platform delivery.
- Root docs, milestone docs, strategy docs, and architecture docs all agree on the same posture: Milestone 2 remains a guardrail, Units 51 through 60 are landed baselines, and the next bounded continuation lane is later standalone deployment-boundary evidence plus broader second-target policy work.

## Scope Boundaries
- Do not claim that an API gateway, split event/audit services, batch orchestration, PostgreSQL readiness, or multi-platform abstractions are already implemented.
- Do not weaken the accepted Milestone 1 and Milestone 2 evidence model while opening Milestone 3.
- Do not broaden supported-target claims beyond the first Ubuntu 24.04 profile.
- Do not reopen the already landed consumer boundary, indexed audit surface, or persistence seam as if they were still absent.
- Do not rewrite the product boundary or drop contract-first governance in the name of speed.

## Key Decisions
- Treat Milestone 3 as a bounded enablement phase instead of a binary “later” bucket or a premature distributed rewrite.
- Treat Units 51 through 60 as landed baselines and move the next implementation map to later standalone deployment-boundary evidence plus broader second-target policy work rather than restarting earlier seam work.
- Keep Milestone 2 maintenance commands and review surfaces visible inside Milestone 3 docs because they still guard public truth.
- Use a gap-map comparison against prior Scheme C expectations as the main way to keep Milestone 3 honest.

## Dependencies / Assumptions
- The current promotion-ready confidence artifact and development-progress page remain the published proof source for Milestone 2 guardrail health.
- Current controller, web, CLI, and agent code stays the verified base while Milestone 3 Phase 0 continuation planning advances.
- The roadmap page can move Milestone 3 forward only if its copy also keeps explicit “not yet delivered” gaps visible.
- Existing `/api/controller`, `/consumer-boundary-decision-pack`, `/event-audit-index`, and `/persistence-readiness` routes remain the real starting point for the next continuation units.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md` for the Phase 0 continuation sequence covering Units 57 through 60 plus the next bounded post-Unit-60 queue.

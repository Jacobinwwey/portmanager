---
title: "Milestones"
audience: shared
persona:
  - contributor
  - admin
  - operator
section: roadmap
sourcePath: "docs/specs/portmanager-milestones.md"
status: active
---
> Source of truth: `docs/specs/portmanager-milestones.md`
> Audience: `shared` | Section: `roadmap` | Status: `active`
> Updated: 2026-04-17 | Version: v0.4.6-unit1-focus
### Roadmap sequencing rules
- Freeze contracts, design baselines, and publishing rules before implementation breadth.
- Prove one trusted operational slice before expanding reliability or platform reach.
- Reliability work comes before platform breadth, because unstable multi-host expansion only amplifies ambiguity.
- `Toward C` is an earned phase, not a placeholder slogan. It begins only after the `B` validation state is credible.

### A / B / C progression model
- `A`: docs-first baseline. Contracts, design baselines, route contracts, install contract, and publishing rules are frozen and reviewable.
- `B`: trusted validation state. PortManager proves one real control-plane slice end to end: one host, one rule, one rollback, plus the minimum migration of current agent-service settings and capabilities needed to stop the product from remaining a paper design.
- `C`: broader platform state. PortManager grows from a narrow single-host bridge control plane into a more general terminal-side management substrate for both human and agent consumers, without abandoning contract-first governance.

### Milestone 1: One Host, One Rule, One Rollback

#### Why this milestone exists
Milestone 1 is intentionally narrow.
Its job is to prove that PortManager is a real control plane rather than a collection of docs, shell glue, screenshots, and future promises.
This milestone is also where the `B` validation state starts: the smallest credible migration of current agent-service behavior into the new control-plane model.

#### Locked choices
- split services: `controller API + React SPA web`
- execution layers: `Rust CLI + Rust agent`
- `SQLite` as the V1 state-store default
- `OpenAPI + JSON Schema + codegen` as the public contract foundation
- controller-side snapshot and diagnostics, not agent-side browser capture
- bootstrap and rescue over SSH, steady-state communication over `HTTP over Tailscale`

#### Acceptance gate
Milestone 1 is only accepted when all of the following become true:
- one host can move from `draft` to `ready`
- one bridge rule can move from `desired` to `active`
- destructive mutation always creates a required local backup first
- failure leaves both an operation record and a usable rollback point
- diagnostics produce both machine-readable results and webpage snapshot artifacts
- Web, CLI, and API observe the same host, rule, operation, and degraded-state model

#### Current verified status
- Progress is real, but acceptance is still open.
- Verified now: backup-before-mutation, rollback evidence, diagnostics capture, drift-driven degraded state, filtered operation history, event replay, and controller/CLI inspection surfaces for operations, backups, diagnostics, health checks, and rollback points.
- Acceptance evidence re-ran successfully on a Windows real machine on `2026-04-17`: `pnpm test`, `pnpm typecheck`, `cargo test --workspace`, `pnpm --dir docs-site --ignore-workspace run docs:build`, and `pnpm milestone:verify` all passed after closing Windows-specific validation blockers in contract generation, SQLite test cleanup, CLI transport classification, and mock-server socket handling.
- Mainline acceptance is now formalized as a repeatable gate through `pnpm acceptance:verify` and the `mainline-acceptance` GitHub Actions workflow. This improves delivery rigor, but it does not change Milestone 1 acceptance status by itself.
- GitHub Actions already proved Unit 0 green on `main` on `2026-04-17`, so it should be treated as standing branch discipline rather than active recovery work.
- Verified now from Unit 1: controller-backed `/hosts`, `/hosts/{hostId}`, `/hosts/{hostId}/probe`, `/hosts/{hostId}/bootstrap`, `/bridge-rules`, `/bridge-rules/{ruleId}`, and `GET/PUT /exposure-policies/{hostId}` are now real, and destructive rule mutation preserves backup and rollback evidence before state changes.
- Verified now from Unit 2: CLI `hosts`, `bridge-rules`, and `exposure-policies` read/write flows now mirror those controller resources with the existing `--json` and wait-aware conventions, and `crates/portmanager-cli/tests/host_rule_policy_cli.rs` proves the public command surface end to end.
- Still missing before acceptance: the steady-state controller-agent `HTTP over Tailscale` service boundary plus the final acceptance/doc resync pass.

#### Current development sequence
- `Unit 0`: complete and mandatory. Keep the gate green while later units land, but do not treat gate work as the current milestone-closure objective.
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now run through the shared store and runner with host lifecycle and backup-aware rule mutation.
- `Unit 2`: complete. CLI now mirrors those same resources so controller and CLI share one truthful public surface.
- `Unit 3`: complete. Web now renders controller-backed views and diagnostics detail across overview, host detail, hosts, bridge rules, operations, backups, and console.
- `Unit 4`: move the agent toward the minimum `HTTP over Tailscale` steady-state service boundary without breaking current artifact compatibility.
- `Unit 5`: rerun `pnpm acceptance:verify`, sync roadmap and product docs, and only then reassess Milestone 1 wording.

#### What remains intentionally deferred
- PostgreSQL as the default store
- batch orchestration and fleet management
- broader platform support beyond the first Ubuntu 24.04 target
- turning agent into a browser runtime or shell-orchestrator substitute
- broad productization of C-shaped capabilities before the first trusted slice is real

### Milestone 2: Engineering Reliability

#### Why this milestone exists
Milestone 2 exists to make the `B` validation state trustworthy in repeated real use.
The order is deliberate: PortManager should not broaden scope while backup, rollback, drift visibility, and degraded-state handling are still weak.
This milestone is about survivability, inspectability, and operational confidence rather than adding the most exciting new surfaces.

#### Locked choices
- reliability is treated as first-class product behavior, not merely internal engineering hygiene
- degraded state must become explicit and user-visible rather than inferred away
- backup policy must become an enforceable part of operations, not a soft convention
- GitHub private backup integration is additive safety, not a replacement for required local backup
- stronger rollback UX only matters if rollback evidence remains contract-aligned and auditable

#### Acceptance gate
Milestone 2 is only accepted when all of the following become true:
- degraded state is explicit in Web, CLI, and API rather than hidden behind generic failure text
- backup policy modes such as `best_effort` and `required` are visible and behaviorally meaningful
- drift detection can move a resource into `degraded` without semantic ambiguity
- rollback flows are easier to inspect and execute without weakening evidence trails
- diagnostics, backups, and operations surfaces are materially more complete than the Milestone 1 skeleton

#### Current verified status
- Reliability work has already started on this branch.
- Verified now: backup-policy visibility, drift-driven degraded records, recovery-linked operation summaries, rollback inspection, and richer event history flows in controller and CLI tests.
- Verified now from the Windows acceptance pass: upstream disconnects that surface as `502` are still treated as transport-level failures rather than controller business-state failures, and the CLI test harness no longer flakes on Windows nonblocking accepted sockets.
- Milestone 2 still remains in progress because the steady-state agent boundary and final acceptance replay still prevent full cross-interface reliability claims.

#### Reliability sequencing rule
- Milestone 2 work should continue only on top of the same host/rule/policy public model that closes Milestone 1.
- The Unit 0 acceptance gate stays mandatory, but it is still not a substitute for Unit 1 through Unit 4 parity work.
- Reliability status can move only after live Web, CLI, API, and agent evidence all tell the same story.

#### What remains intentionally deferred
- full broad-platform support
- generic orchestration across many heterogeneous host classes
- mandatory PostgreSQL migration before real concurrency and reliability pressure exists
- rewriting the product around future C concerns before reliability is actually earned

### Milestone 3: Toward C

#### What C means
`C` is not “more features.”
It specifically means moving toward **Scheme C: Agent-First Distributed Platform**.
In that scheme:
- controller, agent, event stream, policy layer, and audit layer are split from the beginning
- UI, CLI, and automation interfaces all face an API gateway rather than speaking to ad-hoc local surfaces
- the remote agent becomes a true first-class actor in the architecture

The attraction of C is architectural completeness and long-term extensibility.
The danger of C is equally real: at empty-repository time, it can spend too much effort on infrastructure shape before PortManager has earned its first reliable value slice.

#### Why C is not Milestone 1 or Milestone 2
- If Milestone 1 is not real, C is only architecture theater.
- If Milestone 2 is not real, C only multiplies unreliability across more hosts and more surfaces.
- C must therefore build on a trusted `B` state plus explicit reliability work, rather than skipping those gates.
- C is retained as a later direction precisely because its upside is strategic, while its downside at V1 time is over-design and delayed practical delivery.

#### Entry gate into C
Milestone 3 can only begin as a real execution phase when all of the following are true:
- the `B` validation state is trusted in real use
- backup, rollback, and degraded handling are stable enough that scope expansion does not erase accountability
- shared contracts are already governing Web, controller, CLI, agent, and SDK-facing shapes
- minimal agent-service migration has proven the product can absorb existing behavior without losing control-plane semantics

#### Locked C workstreams
- stronger agent reporting and event semantics
- batch host management and bounded orchestration primitives
- PostgreSQL migration or migration-readiness once SQLite becomes a real concurrency or reliability constraint
- broader platform abstraction, but still through explicit supported-target layers
- preparation for macOS, mobile, wider Linux, Windows remote, and more general consumer surfaces only after the abstraction layer is credible
- progressive movement toward the Agent-First Distributed Platform shape only after the value-delivery and robustness gates have already been earned

#### Explicit non-goals for C
- C is not a pivot to arbitrary shell orchestration as the operating model
- C is not an excuse to become a generic MDM platform in one jump
- C is not a requirement to rewrite everything into one language for ideological purity
- C is not simultaneous support for every platform before support boundaries are explicit
- C is not permission to weaken contract review discipline in the name of speed
- C is not the right starting posture for an empty-repository V1 that is supposed to prove practical robustness quickly

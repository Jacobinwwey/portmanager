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
> Updated: 2026-04-21 | Version: v0.6.0-m3-phase0-enablement
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
- Milestone 1 public-surface acceptance is now closed on `2026-04-17`.
- Verified now: backup-before-mutation, rollback evidence, diagnostics capture, drift-driven degraded state, filtered operation history, event replay, and controller/CLI inspection surfaces for operations, backups, diagnostics, health checks, and rollback points.
- Verified now from Unit 1: controller-backed `/hosts`, `/hosts/{hostId}`, `/hosts/{hostId}/probe`, `/hosts/{hostId}/bootstrap`, `/bridge-rules`, `/bridge-rules/{ruleId}`, and `GET/PUT /exposure-policies/{hostId}` are now real, and destructive rule mutation preserves backup and rollback evidence before state changes.
- Verified now from Unit 2: CLI `hosts`, `bridge-rules`, and `exposure-policies` read/write flows now mirror those controller resources with the existing `--json` and wait-aware conventions, and `crates/portmanager-cli/tests/host_rule_policy_cli.rs` proves the public command surface end to end.
- Verified now from Unit 3: Web renders live controller-backed overview, host detail, hosts, bridge rules, backups, console, and diagnostics detail across the locked information architecture.
- Verified now from Unit 4: the agent now exposes the steady-state controller-agent `HTTP over Tailscale` service boundary, controller pushes desired state across that boundary, and unreachable agents degrade affected hosts and rules explicitly.
- Fresh acceptance evidence on `2026-04-17`: `pnpm acceptance:verify` now passes after Unit 4 delivery and Unit 5 docs sync; the embedded milestone proof shows host `draft -> ready`, bridge rule `desired -> active`, live agent HTTP bootstrap/apply/runtime collection, snapshot evidence, and preserved backup/rollback artifacts.
- Fresh Windows real-machine acceptance on `2026-04-18`: `pnpm acceptance:verify` passed again on the latest `main`, and development-progress docs validation now honors the committed generated confidence fallback when local `.portmanager` history is absent, matching the docs publication contract on a fresh machine.
- Fresh acceptance hardening on `2026-04-18`: that same development-progress docs validation now also stays stable when ignored local `.portmanager` history is newer than committed docs-site progress data, so acceptance no longer depends on local hidden-state freshness unless docs generation is intentionally rerun.
- Fresh promotion-ready maintenance checkpoint on `2026-04-21`: local `corepack pnpm acceptance:verify` still passed, the latest synced `mainline-acceptance` evidence now reaches run `24707884501`, the last published `docs-pages` proof before this refresh remained healthy at run `24707884469`, and the tracked confidence-progress artifact has now been deliberately refreshed to the latest reviewed `23/7` promotion-ready snapshot before publication. The standing acceptance gate therefore remains healthy, and the next publication proof should be rechecked after this refresh lands on `main`.
- Controller-side rule truth intentionally becomes `active` only after diagnostics while raw agent runtime remains `applied_unverified` until verification. That separation is now shipped behavior, not a Milestone 1 gap.

#### Current development sequence
- `Unit 0`: complete and mandatory. Keep the gate green while later units land, but do not treat gate work as the current milestone-closure objective.
- `Unit 1`: complete. Controller `hosts`, `bridge-rules`, and `exposure-policies` now run through the shared store and runner with host lifecycle and backup-aware rule mutation.
- `Unit 2`: complete. CLI now mirrors those same resources so controller and CLI share one truthful public surface.
- `Unit 3`: complete. Web now renders controller-backed views and diagnostics detail across overview, host detail, hosts, bridge rules, operations, backups, and console.
- `Unit 4`: complete. The agent now serves the minimum `HTTP over Tailscale` steady-state boundary without breaking current artifact compatibility.
- `Unit 5`: complete. `pnpm acceptance:verify` was replayed, roadmap and product docs were synced, and Milestone 1 wording moved only after proof stayed green.
- `Heartbeat/version slice`: complete. Agent `/health` + `/runtime-state`, controller host summary/detail, CLI host output, and Web host detail now share `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics.
- `Diagnostics-history slice`: complete. Controller `GET /diagnostics` now filters by `state`, and Web host detail now groups latest diagnostics, degraded diagnostics history, and recovery-ready successful evidence on the same live host / rule / policy slice.
- `GitHub-backup slice`: complete. Controller backup bundles now upload through the GitHub Contents API when configured, and required-mode success/failure paths stay explicit across API, CLI, Web, and dedicated reliability proof.
- `Remote-backup replay slice`: complete. `scripts/milestone/verify-reliability-remote-backup-replay.ts` now replays local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule flow, and the evidence stays aligned across API, CLI, Web backup views, and agent runtime.
- `Confidence-history bundle slice`: complete. `pnpm milestone:verify:confidence` now writes `.portmanager/reports/milestone-confidence-report.json`, appends `.portmanager/reports/milestone-confidence-history.json`, renders `.portmanager/reports/milestone-confidence-summary.md`, and CI restores/saves that bundle across runs before uploading `milestone-confidence-bundle-*` for direct inspection.
- `Confidence-readiness slice`: complete. Persisted history now classifies `local-only`, `building-history`, and `promotion-ready`, tracks qualified readiness runs, and publishes the same summary in the GitHub Actions run page.
- `Confidence-history sync slice`: complete. `pnpm milestone:sync:confidence-history` now imports completed `mainline-acceptance` bundle history from GitHub Actions into local readiness review with deduped entries and the same shared readiness math.
- `Confidence-review-signal slice`: complete. Synced and local confidence summaries now separate `Latest Run` from `Latest Qualified Run` and count visibility-only local versus non-qualified remote noise, so developer review keeps real mainline evidence visible after local reruns.
- `Confidence-progress-page slice`: complete. The docs site now publishes a first-class development-progress page from generated confidence data and surfaces the same live counters on roadmap home.
- `Confidence-review-digest slice`: complete. `pnpm milestone:review:confidence` now compares synced local readiness with the tracked public progress artifact, writes `.portmanager/reports/milestone-confidence-review.md`, separates countdown drift from visibility-only drift, and keeps strict published-countdown failure opt-in.
- `Confidence-review-pack CI slice`: complete. `pnpm milestone:review:promotion-ready -- --skip-sync` now lets `mainline-acceptance` publish the current-run `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` inside `milestone-confidence-bundle-*`.
- `Confidence-review-pack fetch slice`: complete. `pnpm milestone:fetch:review-pack` now stages the uploaded current-run review bundle into `.portmanager/reports/current-ci-review-pack/` and writes `review-pack-manifest.json` for CI-first review.
- `Next lane`: Milestone 3 now opens as bounded `Phase 0 enablement` on top of the same live host / rule / policy slice. Milestone 2 review helpers remain mandatory guardrails: keep `pnpm milestone:review:promotion-ready -- --limit 20` as the default completed-mainline review entrypoint, use `pnpm milestone:fetch:review-pack` when the current CI run is the first question, keep the public development-progress page plus `.portmanager/reports/milestone-wording-review.md` as the wording-truth bundle, and only move the tracked public snapshot through the same helper plus `--refresh-published-artifact` when review agrees. Units 57 through 59 are now landed, including the explicit `/persistence-decision-pack` migration review surface, so new implementation energy now shifts toward later standalone split criteria and second-target policy work while the locked target-profile registry and persistence decision pack remain the truthful platform contract.

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
- Verified now: remote-backup guidance is now explicit across Web, CLI, API, and proof output; backup summaries now publish remote target, setup state, status summary, and operator action instead of only raw `not_configured` state.
- Verified now: configured GitHub backup now uploads controller backup bundles through the GitHub Contents API and reports explicit remote redundancy success/failure state across API, CLI, Web, and `tests/milestone/reliability-github-backup.test.ts`.
- Verified now: repeated remote-backup replay is durable in repo. `scripts/milestone/verify-reliability-remote-backup-replay.ts` plus `tests/milestone/reliability-remote-backup-replay.test.ts` now prove local-only, configured-success, and configured-failure required backups on the same live agent-backed host / rule slice while `tests/web/live-controller-shell.test.ts` keeps the Web backup surface aligned.
- Verified now: agent `/health` + `/runtime-state`, controller host summaries/details, CLI host output, and Web host detail now publish `agentVersion` plus `live` / `stale` / `unreachable` heartbeat semantics on the accepted live slice.
- Verified now from the accepted Milestone 1 slice: upstream disconnects that surface as `502` are still treated as transport-level failures rather than controller business-state failures; live unreachable-agent paths now degrade hosts and rules explicitly; controller-side diagnostics promote rules to `active` after real verification.
- Verified now: `pnpm milestone:verify:confidence` now composes the standing `pnpm acceptance:verify` gate with the remote-backup replay proof, and `.github/workflows/mainline-acceptance.yml` now collects that heavier routine on `push main`, `workflow_dispatch`, and the daily scheduled history run.
- Verified now: the canonical routine now writes `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, and `.portmanager/reports/milestone-confidence-summary.md` with CI traceability fields for `eventName`, `ref`, `sha`, `runId`, `runAttempt`, and `workflow`, and the confidence workflow restores/saves that bundle before uploading it for developer review.
- Verified now: the persisted confidence history now classifies `local-only`, `building-history`, and `promotion-ready`, measures progress against `7` qualified runs plus `3` consecutive qualified passes from `push`, `workflow_dispatch`, and `schedule` on `refs/heads/main`, and publishes the same summary in the workflow run page for developers.
- Verified now: `pnpm milestone:sync:confidence-history` now lets developers import those completed GitHub Actions bundles back into local readiness review with authenticated `gh`, deduped entries, and the same shared readiness summary.
- Verified now: the synced/local summary now persists `latestQualifiedRun`, shows a visibility breakdown for qualified mainline versus visibility-only noise, and keeps the latest mainline evidence readable even when newer local runs exist.
- Verified now: the docs site now publishes `/en/roadmap/development-progress` and `/zh/roadmap/development-progress` from generated milestone confidence data, and roadmap home previews the same readiness snapshot for public developer review.
- Verified now: `mainline-acceptance` confidence collection now runs `pnpm milestone:review:promotion-ready -- --skip-sync`, so the uploaded `milestone-confidence-bundle-*` also carries `.portmanager/reports/milestone-confidence-review.md` plus `.portmanager/reports/milestone-wording-review.md` for the current run.
- Fresh promotion-ready publication refresh on `2026-04-21`: after pulling the latest `main`, `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` synced completed `mainline-acceptance` runs through authenticated `gh`, wrote the review digest, and republished the tracked docs artifact from the same completed workflow evidence. Exact live counters and the latest qualified run still live on the generated development-progress page and tracked confidence artifact, while this roadmap spec keeps the broader threshold-met conclusion stable.
- Fresh runtime-transition proof on `2026-04-20`: forcing GitHub workflow JavaScript actions onto Node 24 did not break `mainline-acceptance` or `docs-pages`; the remaining Node 20 deprecation annotations now come from GitHub official action metadata rather than repo-local workflow drift.
- Deep compare against the completed `2026-04-16` reconciliation plan now shows that the old parity, steady-state delivery, and proof-orchestration gaps are closed; the remaining architecture gap is now the explicit Milestone 3 seams that Scheme C still requires rather than invention of more reporting surfaces or review-signal repair.
- Milestone 2 remains an active guardrail lane while human milestone-language review deliberately keeps public wording honest on top of the now promotion-ready evidence. That guardrail no longer blocks Milestone 3 Phase 0 enablement; it is the proof discipline Milestone 3 must keep.

#### Reliability sequencing rule
- Milestone 2 work should continue only on top of the same host/rule/policy public model that closes Milestone 1.
- The Unit 0 acceptance gate stays mandatory, but it is now protecting a completed Unit 1 through Unit 5 base rather than standing in for missing parity work.
- Reliability status can move only after live Web, CLI, API, and agent evidence keep telling the same story across repeated proof runs.

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

#### Current verified entry signal
Milestone 3 can now begin as a bounded execution phase because all of the following are already true:
- the `B` validation state is credible enough that Milestone 3 no longer needs to stay purely theoretical
- backup, rollback, degraded handling, and public review surfaces are already protected by the same accepted live slice
- shared contracts already govern Web, controller, CLI, agent, and docs-site publication surfaces
- minimal agent-service migration is complete enough that the product no longer revolves around shell-only behavior

#### Deep compare against current code

| Scheme C expectation | Current verified state | Gap classification |
| --- | --- | --- |
| Gateway-ready consumer boundary | Controller now serves a consumer-prefixed `/api/controller` boundary while keeping legacy direct routes compatible; Web preserves prefixed base URLs and CLI accepts `PORTMANAGER_CONSUMER_BASE_URL`, even though no separate gateway app exists yet | Phase 0 baseline landed |
| Explicit controller / policy / event / audit separation | `controller-read-model`, `controller-domain-service`, `/event-audit-index`, and the persistence adapter now extract the first read/write seams, even though transport and persistence still centralize too much work | Phase 0 baseline landed |
| First-class bounded remote agent | Live agent service boundary already exists with `/health`, `/runtime-state`, `/apply`, `/snapshot`, `/rollback` | Partially earned |
| Batch host management | One bounded batch exposure-policy envelope now lands as an auditable parent operation with host-scoped child outcomes across controller, CLI, and Web | Phase 0 baseline landed |
| Persistence readiness beyond SQLite | `operation-store` now runs behind a SQLite-backed persistence adapter seam, publishes measurable PostgreSQL readiness pressure from live store counts, and now exposes an explicit `/persistence-decision-pack` review surface with next actions while SQLite stays active | Phase 0 baseline landed |
| Platform abstraction for additional targets | Ubuntu 24.04 + systemd + Tailscale remains the only credible target | Not started |

#### Milestone 3 Phase 0 continuation workstreams
- keep the landed `/api/controller` consumer boundary stable while defining future split criteria
- Unit 57: complete. one explicit `audit-review-service` owner now sits behind `/events`, `/operations/events`, and `/event-audit-index` while preserving legacy and consumer-prefixed route compatibility
- Unit 58: complete. explicit target-profile registry and target-abstraction rules now publish the locked Ubuntu 24.04 + systemd + Tailscale contract before second-target claims
- Unit 59: complete. persistence promotion decision surface now turns landed readiness metrics into an explicit `/persistence-decision-pack` review surface with next actions while SQLite stays active
- Next queue: keep the landed consumer boundary, audit-review boundary, target-profile registry, and persistence decision pack stable while defining later standalone split criteria and broader second-target policy work
- continue using the same bounded batch-operation envelope and evidence model rather than inventing a second orchestration path

#### Guardrails that still stay in force
- keep `pnpm acceptance:verify` green
- keep `pnpm milestone:verify:confidence` green
- keep `pnpm milestone:review:promotion-ready -- --limit 20` and `.portmanager/reports/milestone-wording-review.md` as the wording-truth bundle
- do not create a second evidence model while opening Milestone 3
- do not weaken backup, rollback, degraded, or contract governance semantics in the name of distribution

#### Explicit non-goals for C
- C is not a pivot to arbitrary shell orchestration as the operating model
- C is not an excuse to become a generic MDM platform in one jump
- C is not a requirement to rewrite everything into one language for ideological purity
- C is not simultaneous support for every platform before support boundaries are explicit
- C is not permission to weaken contract review discipline in the name of speed
- C is not permission to claim a gateway, split audit service, fleet orchestration, PostgreSQL default, or broader platform support before those seams are real

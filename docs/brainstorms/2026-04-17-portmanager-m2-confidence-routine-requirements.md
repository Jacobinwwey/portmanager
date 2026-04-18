---
date: 2026-04-17
topic: portmanager-m2-confidence-routine
---

# PortManager Milestone 2 Confidence Routine Requirements

Status note on `2026-04-17`: requirements baseline is now satisfied in `main`.
`pnpm milestone:verify:confidence` closes proof orchestration, and remaining work has narrowed to repeat-green history accumulation on top of a now-persisted developer-facing confidence history bundle.

## Problem Frame
The `2026-04-16` mainline reconciliation requirements and implementation plan are now substantially executed.
The repo no longer has the old Milestone 1 parity gap between frozen contracts and shipped code: controller, CLI, Web, and the steady-state agent boundary are now aligned on one live host / rule / policy slice, and later Milestone 2 slices already cover heartbeat/version semantics, diagnostics history, GitHub backup delivery, and remote-backup replay.

That progress changes the shape of the remaining problem.
The next blocker is no longer missing product surface area; it is proof orchestration and milestone-promotion discipline.
Current docs say to keep the combined replay and acceptance gate green, but the codebase still splits those proofs across two separate entrypoints:

- `pnpm acceptance:verify` runs tests, type checks, Rust workspace tests, contract drift checks, docs build, and the one-host / one-rule milestone proof.
- `pnpm milestone:verify:reliability-remote-backup-replay` separately runs the multi-state local-only / configured-success / configured-failure remote-backup replay on the same accepted live slice.

Because Milestone 2 wording currently depends on both proofs rather than either command alone, the repo still lacks one canonical confidence routine that matches its own roadmap and progress language.

## Comparison Against Prior Requirements and Plan

| Prior requirement or unit | Current code evidence | Architectural result | Remaining implication |
| --- | --- | --- | --- |
| `2026-04-16` R6 / Units 1-4: close `hosts`, `bridge-rules`, `exposure-policies`, Web parity, and the steady-state agent boundary before Milestone 3 | `apps/controller/src/controller-server.ts`, `apps/controller/src/operation-store.ts`, `crates/portmanager-cli/src/main.rs`, `apps/web/src/main.ts`, `apps/controller/src/agent-client.ts`, `crates/portmanager-agent/src/main.rs`, plus `tests/controller/host-rule-policy.test.ts`, `crates/portmanager-cli/tests/host_rule_policy_cli.rs`, `tests/web/live-controller-shell.test.ts`, and `tests/controller/agent-service.test.ts` | One accepted host / rule / policy model now exists across controller, CLI, Web, and agent | Do not reopen parity recovery as the next lane |
| `2026-04-16` R7: preserve reliability work while parity closes | `apps/controller/src/local-backup-primitive.ts`, `apps/controller/src/github-backup-client.ts`, `tests/milestone/reliability-*.test.ts`, and `scripts/milestone/verify-reliability-*.ts` | Reliability hardening now layers on the accepted Milestone 1 slice instead of living beside it | Future work must extend this same evidence model rather than fork a new one |
| `2026-04-16` R8 / Unit 0: keep a standing mainline gate | `package.json`, `scripts/acceptance/verify.mjs`, `.github/workflows/mainline-acceptance.yml` | Branch-discipline automation is real and stable | The gate still stops short of the remote-backup replay proof that current Milestone 2 wording depends on |
| Unit 5: sync roadmap and progress truth after proof stays green | `README.md`, `TODO.md`, `Interface Document.md`, `docs/specs/portmanager-milestones.md`, `docs/specs/portmanager-v1-product-spec.md`, `docs-site/data/roadmap.ts` | Repo docs now describe the accepted Milestone 1 slice and current Milestone 2 slices accurately | The next doc sync should focus on a concrete confidence routine and promotion rule instead of generic “repeat more” language |

## Current Architecture Advancement
- Controller state is still centralized in `apps/controller/src/operation-store.ts`; the repo did not introduce a second runtime truth path while closing parity and reliability follow-through.
- CLI and Web now consume the same controller-backed host / rule / policy model instead of parallel mock models; preview-mode mock data remains only as a fallback shell when no controller base URL is configured.
- The agent is now a long-lived steady-state HTTP service over the locked `HTTP over Tailscale` boundary while preserving runtime-state, snapshot, and rollback artifact formats.
- Reliability behavior now extends the same accepted slice through heartbeat/version, diagnostics-history, GitHub-backup, and remote-backup replay proofs rather than through unrelated experimental paths.
- The remaining architectural gap is orchestration, not behavior: the accepted slice and the reliability replay both exist, but they are not yet packaged into one canonical Milestone 2 confidence routine.

## Requirements

**Progress Accounting**
- R1. Progress documents must explicitly mark the `2026-04-16` reconciliation work as completed history and the confidence-routine work as the new active lane.
- R2. Progress language must describe the remaining Milestone 2 gap as proof orchestration and green-history accumulation, not as missing parity or missing remote-backup states.

**Confidence Routine**
- R3. The repository must expose one canonical Milestone 2 confidence routine that composes the standing acceptance gate with the remote-backup replay proof while preserving the distinction between branch discipline and milestone promotion.
- R4. The next implementation plan must resolve where that routine lives in code, how it is triggered locally, and how it is collected on `main` without turning every docs sentence into shell choreography.

**Roadmap and Promotion Discipline**
- R5. `README.md`, `TODO.md`, `Interface Document.md`, milestone/spec docs, and roadmap-facing docs must all point at the same next lane and the same active direction documents.
- R6. Milestone 2 status language must state what additional evidence is still needed before wording can simplify again.

## Success Criteria
- A contributor can compare the completed `2026-04-16` plan with current code reality and understand that Milestone 1 closure work is done.
- A contributor can identify the one remaining Milestone 2 technical gap from docs alone: the acceptance gate and the remote-backup replay proof are still separate orchestration surfaces.
- A follow-up implementation plan gives concrete file targets, sequencing, and verification expectations for introducing the canonical confidence routine and syncing progress docs around it.

## Scope Boundaries
- This requirements doc does not reopen the accepted Milestone 1 public slice.
- This requirements doc does not introduce new product-surface work, new platform support, or `Toward C` execution.
- This requirements doc does not redefine the locked host / rule / policy / agent architecture; it only narrows the remaining Milestone 2 delivery lane.

## Key Decisions
- Treat the `2026-04-16` reconciliation requirements and plan as completed baseline history, not as the active open lane.
- Keep the accepted live host / rule / policy slice as the only foundation for Milestone 2 work.
- Define the next lane around confidence routine unification and promotion discipline before inventing more reliability subfeatures.
- Preserve the current distinction between “branch gate is green” and “Milestone 2 is accepted”; the new routine should clarify that distinction, not blur it.

## Dependencies / Assumptions
- `pnpm acceptance:verify` remains the standing Unit 0 branch-discipline gate.
- `scripts/milestone/verify-one-host-one-rule.ts` and `scripts/milestone/verify-reliability-remote-backup-replay.ts` remain trustworthy proof sources for the accepted live slice.
- Current roadmap and progress docs already reflect the shipped Milestone 1 closure and current Milestone 2 slices accurately enough to serve as the baseline for this follow-up work.

## Outstanding Questions

### Resolve Before Planning
- None.

### Resolved in Delivered Slice
- [Affects R3][Technical] The canonical confidence routine now ships as sibling command `pnpm milestone:verify:confidence`, reusing the shared step runner while composing the standing acceptance gate with the replay proof.
- [Affects R4][Technical] CI now keeps the lighter gate on PRs, runs the full confidence routine on `push main`, `workflow_dispatch`, and the daily scheduled history path while green history is being earned, and persists the history bundle across runs for developer review.

## Next Steps
- Move to `docs/plans/2026-04-17-portmanager-m2-confidence-routine-plan.md` for the concrete implementation sequence.

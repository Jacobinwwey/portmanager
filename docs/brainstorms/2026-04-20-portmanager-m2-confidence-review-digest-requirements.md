---
date: 2026-04-20
topic: portmanager-m2-confidence-review-digest
---

# PortManager Milestone 2 Confidence Review Digest Requirements

Status note on `2026-04-20`: the countdown state is now `building-history` with `5/7` qualified runs and `2` remaining qualified runs.
The repo already has the evidence.
The missing piece is one repo-native developer-review command that reads the existing evidence bundle and tells a contributor whether local synced history, the tracked public artifact, and the milestone-language review posture still agree.

## Problem Frame
The prior confidence slices already shipped:

- one canonical confidence routine
- one durable history bundle
- one repo-native sync path
- one truthful latest-qualified review signal
- one public development-progress page
- one real-machine verification report

Developer review still requires manual comparison across multiple places:

- `.portmanager/reports/milestone-confidence-history.json`
- `.portmanager/reports/milestone-confidence-summary.md`
- `docs-site/data/milestone-confidence-progress.ts`
- `docs/operations/portmanager-real-machine-verification-report.md`

That manual review is now the active Milestone 2 lane.
The project needs one local command that packages those existing signals into one digest without inventing another readiness calculator.

## Requirements

**Review Command**
- R1. The repo must expose one repo-native command for confidence review, aimed at contributors working through the final Milestone 2 countdown.
- R2. The command must read the local synced confidence history snapshot plus the tracked public confidence progress artifact and compare the existing readiness state without recalculating thresholds in a second code path.
- R3. The command must render the current readiness status, remaining qualified runs, latest qualified run, and whether the tracked public artifact still matches local countdown evidence.

**Review Output**
- R4. The command must write one durable local review digest under `.portmanager/reports/` and print a concise terminal summary that points developers to the digest path.
- R5. The digest must distinguish between countdown alignment and full local snapshot drift, so local visibility-only reruns do not get mistaken for mainline-readiness regressions.
- R6. The digest must include a clear recommendation about milestone wording posture: stay conservative while `building-history` remains open; allow human milestone-language review only after `promotion-ready`.

**Workflow Continuity**
- R7. Root docs, progress docs, and verification docs must mention the new review command as the default developer-review entrypoint after `pnpm milestone:sync:confidence-history`.
- R8. Tests must cover aligned countdown data, local-only drift against the tracked public artifact, and strict failure when the user explicitly requires published countdown alignment.

## Success Criteria
- A contributor can run one command and understand the current local synced countdown plus public-artifact alignment without opening four files first.
- The command does not create a second readiness calculation or a competing milestone signal.
- Developer-review docs converge on one repeatable review path for the last Milestone 2 countdown leg.

## Scope Boundaries
- Do not change readiness thresholds.
- Do not auto-refresh `docs-site/data/milestone-confidence-progress.ts`.
- Do not invent a new public page or new GitHub workflow.
- Do not auto-promote milestone wording from the command itself.

## Key Decisions
- Reuse the persisted history snapshot as the single readiness truth source.
- Treat the tracked docs artifact as publication state, not as the primary readiness calculator.
- Make strict published-alignment checking opt-in so normal local review still works when the public artifact intentionally lags behind local visibility-only reruns.

## Dependencies / Assumptions
- `.portmanager/reports/milestone-confidence-history.json` exists after `pnpm milestone:verify:confidence` or `pnpm milestone:sync:confidence-history`.
- `docs-site/data/milestone-confidence-progress.ts` remains the tracked public progress artifact.

## Next Steps
- Move to `docs/plans/2026-04-20-portmanager-m2-confidence-review-digest-plan.md` for implementation.

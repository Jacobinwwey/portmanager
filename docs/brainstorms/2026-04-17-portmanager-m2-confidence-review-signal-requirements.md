---
date: 2026-04-17
topic: portmanager-m2-confidence-review-signal
---

# PortManager Milestone 2 Confidence Review Signal Requirements

Status note on `2026-04-17`: requirements baseline is now satisfied in `main`.
The repo already had a canonical confidence routine, persisted history bundle, explicit readiness math, GitHub Actions summary publication, and repo-native CI history import.
The remaining review gap was narrower: once developers ran new local verification after syncing CI history, the latest visible run in `.portmanager/reports/milestone-confidence-summary.md` often became local noise instead of the latest qualified mainline evidence that actually mattered for milestone review.

## Problem Frame
The readiness slice made milestone math truthful.
The history-sync slice made real CI-earned evidence available in local files.
But developer review still had one misleading surface:

- the summary highlighted only `Latest Run`
- that run could be a newer local verification entry
- the actual latest qualified `push` / `workflow_dispatch` / `schedule` evidence could be buried lower in the table
- milestone review still required manual scanning instead of one obvious qualified signal

This was not a readiness-math bug.
It was a review-signal bug.

## Comparison Against Prior Requirements And Plan

| Prior slice | Current evidence | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence readiness | `scripts/acceptance/confidence.mjs`, `.github/workflows/mainline-acceptance.yml` | Qualified readiness math is already explicit | Developers still need a clearer qualified review signal |
| Confidence history sync | `scripts/acceptance/sync-confidence-history.mjs`, `.portmanager/reports/` | Real CI history can now be imported locally | Latest local runs can still obscure latest qualified evidence |
| Roadmap and progress docs | `README.md`, `TODO.md`, `Interface Document.md`, `docs-site/data/roadmap.ts` | Developer progress surfaces already mention sync and readiness thresholds | They should now describe how review stays truthful after local reruns |

## Requirements

**Qualified Review Signal**
- R1. Persisted confidence history must expose the latest readiness-qualified run separately from the latest visible run.
- R2. The markdown summary must render the latest qualified run explicitly so developers can see the current mainline evidence even when newer local runs exist.

**Visibility Breakdown**
- R3. Persisted confidence history must expose a breakdown of qualified runs versus visibility-only local runs and visibility-only non-qualified remote runs.
- R4. The markdown summary must render that breakdown in developer-facing language so local noise is easy to distinguish from milestone evidence.

**Readiness Stability**
- R5. This slice must not change readiness qualification rules, thresholds, or promotion status math.
- R6. Existing import, dedupe, and history merge behavior must stay intact.

**Documentation**
- R7. Root docs, milestone docs, product spec, and roadmap progress content must explain that developer review now separates latest qualified mainline evidence from local visibility-only runs.

## Success Criteria
- After local verification runs occur, developers can still see the latest qualified mainline run without manually scanning the full recent-runs table.
- Synced summaries tell developers how much tracked history is qualified evidence versus local-only visibility noise.
- Readiness status and thresholds remain unchanged.
- Docs and roadmap wording point developers at the upgraded review surface.

## Scope Boundaries
- Do not change which runs qualify for readiness.
- Do not auto-promote milestone wording from summary output.
- Do not remove local visibility-only runs from tracked history.
- Do not add a second readiness calculator or alternate summary format.

## Key Decisions
- Keep one persisted history file and one markdown summary rather than creating a separate developer-only artifact.
- Treat latest-qualified evidence and visibility breakdown as review metadata, not as new readiness math.
- Keep local visibility-only runs visible for debugging, but stop letting them dominate milestone-review interpretation.

## Outstanding Questions

### Resolved During Implementation
- [Affects R1][Technical] The history snapshot now persists `latestQualifiedRun` beside `latestRun`.
- [Affects R3][Technical] The snapshot now persists a visibility breakdown covering qualified runs, local visibility-only runs, and non-qualified remote runs.
- [Affects R7][Documentation] Root docs and roadmap progress text now point developers at the updated summary behavior.

## Next Steps
- Move to `docs/plans/2026-04-17-portmanager-m2-confidence-review-signal-plan.md` for the implementation sequence.

---
date: 2026-04-17
topic: portmanager-m2-confidence-history-sync
---

# PortManager Milestone 2 Confidence History Sync Requirements

Status note on `2026-04-17`: requirements baseline is now satisfied in `main`.
The repo already has a canonical confidence routine, persisted history bundle, explicit readiness math, and a workflow-run summary.
The next delivery gap was narrower: developers still could not easily pull the real qualified GitHub Actions history back into local readiness review.

## Problem Frame
The readiness slice made local summaries honest, but still incomplete.
`pnpm milestone:verify:confidence` writes local runs as `local-only`, and that is correct.
However, real Milestone 2 progress is being earned on completed `mainline-acceptance` workflow runs on `main`, not inside one developer shell.

That left one operational gap:

- qualified `push` / `workflow_dispatch` / `schedule` history was visible in GitHub Actions
- local readiness files still defaulted to local-only unless developers manually downloaded and merged artifacts
- the repo had no first-class command to import completed CI evidence while preserving failure history and streak truth

## Comparison Against Prior Requirements And Plan

| Prior slice | Current evidence | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence routine | `scripts/acceptance/verify-confidence.mjs`, `.github/workflows/mainline-acceptance.yml` | Canonical routine exists | Need local sync for real CI-earned history |
| Confidence history bundle | `.portmanager/reports/milestone-confidence-report.json`, `.portmanager/reports/milestone-confidence-history.json`, `.portmanager/reports/milestone-confidence-summary.md` | Durable artifacts exist | Developers still need a repo-native import path |
| Confidence readiness | `scripts/acceptance/confidence.mjs`, roadmap/docs wording | Threshold math is explicit | Need actual mainline run import so local readiness can reflect reality |

## Requirements

**History Sync**
- R1. The repo must expose one developer-facing command that imports completed `mainline-acceptance` bundle artifacts from GitHub Actions into local confidence history files.
- R2. The sync path must include completed qualified runs regardless of success or failure so consecutive-pass math remains truthful.
- R3. Imported entries must dedupe against existing history instead of duplicating the same run.

**Readiness Preservation**
- R4. The sync path must reuse the same readiness classification and summary rendering logic already used by the canonical confidence routine.
- R5. Local visibility-only runs must remain visible, but imported qualified CI runs must be able to advance readiness when they are real.

**Developer Guidance**
- R6. Root docs, milestone docs, product spec, and roadmap progress text must describe the new sync command, its GitHub CLI dependency, and the fact that it pulls real mainline evidence into local review.

## Success Criteria
- A developer can run one repo-native command and have local confidence history reflect completed qualified workflow runs from GitHub Actions.
- Failed qualified runs remain part of the imported history so streak math is not inflated.
- Duplicates do not appear when the same run is imported twice.
- Docs point developers at the sync command as the bridge between local review and CI-earned readiness.

## Scope Boundaries
- Do not auto-edit milestone wording based on imported readiness.
- Do not fake or seed history that GitHub Actions did not actually produce.
- Do not replace the canonical verification routine.
- Do not make workflow success depend on the sync command.

## Key Decisions
- Use authenticated `gh` CLI reads instead of inventing a new API client.
- Import completed runs, not only successful runs, so readiness streaks stay honest.
- Reuse the existing confidence-history math and summary renderer instead of creating a second reporting format.
- Keep the sync command developer-invoked and local; CI continues to own primary evidence production.

## Outstanding Questions

### Resolved During Implementation
- [Affects R1][Technical] The sync command ships as `pnpm milestone:sync:confidence-history`.
- [Affects R2][Technical] The importer reads completed `mainline-acceptance` runs on `main`, then downloads `milestone-confidence-bundle-*` artifacts from each run.
- [Affects R6][Technical] Docs now tell developers that `gh` auth with `repo` scope is required for the sync command.

## Next Steps
- Move to `docs/plans/2026-04-17-portmanager-m2-confidence-history-sync-plan.md` for the implementation sequence.

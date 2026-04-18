---
title: "Real-Machine Verification Report"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-real-machine-verification-report.md"
status: active
---
> Source of truth: `docs/operations/portmanager-real-machine-verification-report.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-18 | Version: v0.1.0-real-machine-verification-report
### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded real-machine verification session for this report happened on `2026-04-18` on a Windows development machine against the latest local `main`.

Commands executed:
- `pnpm acceptance:verify`
- `pnpm milestone:verify:confidence`
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`

### What each command proves
- `pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:verify:confidence`
  - proves the heavier Milestone 2 confidence routine still passes on top of the accepted live slice
  - writes `.portmanager/reports/milestone-confidence-report.json`
  - appends `.portmanager/reports/milestone-confidence-history.json`
  - renders `.portmanager/reports/milestone-confidence-summary.md`
- `pnpm milestone:sync:confidence-history -- --limit 20`
  - imports completed `mainline-acceptance` confidence bundles from GitHub Actions into local `.portmanager/reports/`
  - keeps local developer review aligned with mainline evidence rather than local-only reruns
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` from the synced local history
  - records the current published readiness snapshot without letting normal docs builds drift every time local `.portmanager` history changes

### Evidence frozen by this report
- Local acceptance gate: passed
- Local confidence routine: passed
- Synced mainline evidence: imported successfully
- Imported qualified workflow run: `24595022905/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified event: `push`
- Current published readiness state: `building-history`
- Current published qualified runs: `1/7`
- Current published qualified consecutive passes: `1/3`
- Current published tracked runs: `5`
- Current published local visibility-only runs: `4`

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- Milestone 2 confidence maintenance is real and operational, but promotion criteria are not yet met.
- The current truthful public wording remains `building-history`, not `promotion-ready`.
- The latest visible local run is intentionally separated from the latest qualified mainline run, so local reruns no longer erase mainline review evidence.

### Docs publication contract for confidence progress
- Default docs generation must reuse the committed artifact at `docs-site/data/milestone-confidence-progress.ts`.
- Normal commands:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate`
  - `pnpm --dir docs-site --ignore-workspace run docs:build`
- Explicit refresh command:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- Publication rule:
  - only run the explicit refresh command after a deliberate verification or sync step whose evidence should become the new public snapshot
- Why this rule exists:
  - local `.portmanager` history is machine-local and intentionally ignored by Git
  - allowing every docs build to rewrite the tracked confidence artifact from local history causes noisy diffs and publication drift
  - the tracked docs artifact must change only when publication intent is explicit

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Sync completed confidence history back into local `.portmanager/reports/`.
- Compare the synced local summary, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

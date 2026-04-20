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
> Updated: 2026-04-20 | Version: v0.2.3-confidence-promotion-ready
### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-20`.
It combined a Windows development-machine replay against the latest local `main` with a GitHub-hosted confirmation pass after forcing JavaScript-based workflow actions onto Node 24, then a latest-main sync refresh that republished the tracked confidence-progress artifact from the completed `mainline-acceptance` history.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:verify:confidence`
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- GitHub Actions run `24645898239` for `mainline-acceptance`
- GitHub Actions run `24645898212` for `docs-pages`

### What each command proves
- `corepack pnpm acceptance:verify`
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
- GitHub Actions run `24645898239` for `mainline-acceptance`
  - proves the standing CI acceptance gate still passes after the workflow migration away from `pnpm/action-setup`
  - proves `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` does not break the accepted control-plane proof or the confidence routine
- GitHub Actions run `24645898212` for `docs-pages`
  - proves the published docs build and Pages deployment still succeed after the same Node 24 forcing change
  - proves the docs publication workflow remains operational alongside the standing acceptance gate

### Evidence frozen by this report
- Local acceptance gate: passed
- Local confidence routine: passed
- Synced mainline evidence: imported successfully
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`, `24646810439/1`, `24647442700/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified event: `push`
- Current published readiness state: `promotion-ready`
- Current published qualified runs: `7/7`
- Current published qualified consecutive passes: `7/3`
- Current published remaining qualified runs: `0`
- Current published tracked runs: `13`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24647442700/1`
- Current published latest qualified SHA: `ddc15a3116d3`
- GitHub-hosted `mainline-acceptance` run: `24647442700` passed
- GitHub-hosted `docs-pages` run: `24645898212` passed
- Node 24 forced-action trial: passed
- Remaining warning source: GitHub official action metadata still declaring `node20`
- Review digest after explicit refresh: aligned

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate is also complete and currently healthy on GitHub Pages after the Node 24 forcing trial.
- Milestone 2 confidence maintenance is real and operational, and promotion criteria are now met.
- The current truthful public wording is now `promotion-ready` after the explicit refresh path republished the tracked artifact.
- Human milestone-language review is now allowed; the remaining public lane is deliberate wording tightening plus sustained gate health.
- The latest visible local run is intentionally separated from the latest qualified mainline run, so local reruns no longer erase mainline review evidence.
- The remaining Node 20 deprecation annotations are now upstream-only warning debt in GitHub official actions; they no longer indicate a repo-local acceptance or publication failure.

### Docs publication contract for confidence progress
- Default docs generation must reuse the committed artifact at `docs-site/data/milestone-confidence-progress.ts`.
- Normal commands:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate`
  - `pnpm --dir docs-site --ignore-workspace run docs:build`
- Explicit refresh command:
  - `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence`
- Publication rule:
  - only run the explicit refresh command after a deliberate verification or sync step whose evidence should become the new public snapshot
  - use `pnpm milestone:review:confidence` first if you need one repo-native comparison between synced local history and the tracked public artifact before deciding whether publication should move
- Why this rule exists:
  - local `.portmanager` history is machine-local and intentionally ignored by Git
  - allowing every docs build to rewrite the tracked confidence artifact from local history causes noisy diffs and publication drift
  - the tracked docs artifact must change only when publication intent is explicit

### Default developer review digest
- Default local review sequence after sync:
  - `pnpm milestone:sync:confidence-history -- --limit 20`
  - `pnpm milestone:review:confidence`
- What the review-digest command adds:
  - writes `.portmanager/reports/milestone-confidence-review.md`
  - compares synced local readiness with tracked `docs-site/data/milestone-confidence-progress.ts`
  - reports countdown alignment separately from full local visibility-only drift
  - keeps strict published-countdown failure opt-in behind `--require-published-countdown-match`
- Publication rule after that digest:
  - after the digest exposes drift and human review agrees, refresh the tracked docs artifact explicitly; this exact order republished the `promotion-ready` snapshot on `2026-04-20`

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Sync completed confidence history back into local `.portmanager/reports/`.
- Run `pnpm milestone:review:confidence` so `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned or only visibility-drifted.
- Compare the synced local summary, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

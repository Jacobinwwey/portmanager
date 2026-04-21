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
> Updated: 2026-04-21 | Version: v0.2.6-confidence-progress-refresh
### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-21`.
It combined a fresh local replay of the standing acceptance gate, a latest-main helper refresh that used `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact` to sync completed `mainline-acceptance` history, write the review digest, and republish the tracked confidence-progress artifact from the same completed workflow evidence, plus a GitHub-hosted confirmation pair after that refreshed artifact landed on `main`.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
- GitHub Actions run `24702539213` for `mainline-acceptance`
- GitHub Actions run `24702539212` for `docs-pages`

### What each command proves
- `corepack pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`
  - syncs completed `mainline-acceptance` confidence bundles from GitHub Actions into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing review-digest path
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` only through the explicit refresh contract behind the helper flag
  - proves the synced local review and the published confidence snapshot now match on the same completed workflow evidence
  - proves the tracked public artifact now carries latest qualified run `24702539213/1` and `15/7` qualified runs
- GitHub Actions run `24702539213` for `mainline-acceptance`
  - proves the standing CI acceptance gate still passes after the refreshed confidence-progress artifact lands on `main`
  - proves the heavier confidence collection lane remains healthy alongside the refreshed public snapshot
- GitHub Actions run `24702539212` for `docs-pages`
  - proves the published docs build and Pages deployment still succeed after the refreshed confidence-progress artifact lands on `main`
  - proves the docs publication workflow remains operational alongside the standing acceptance gate

### Evidence frozen by this report
- Local acceptance gate: passed
- Helper sync and explicit refresh: passed
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`, `24646810439/1`, `24647442700/1`, `24648118236/1`, `24648519364/1`, `24648911705/1`, `24650868231/1`, `24699338529/1`, `24699564258/1`, `24701682768/1`, `24702539213/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified events: `push`, `schedule`
- Current published readiness state: `promotion-ready`
- Current published qualified runs: `15/7`
- Current published qualified consecutive passes: `15/3`
- Current published remaining qualified runs: `0`
- Current published tracked runs: `21`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24702539213/1`
- Current published latest qualified SHA: `6ecfa79b98d5`
- GitHub-hosted `mainline-acceptance` run: `24702539213` passed
- GitHub-hosted `docs-pages` run: `24702539212` passed
- Prior Node 24 forced-action trial: still passed
- Remaining warning source: GitHub official action metadata still declaring `node20`
- Review digest after explicit refresh: aligned

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate is also complete and currently healthy on GitHub Pages after the refreshed artifact replay.
- Milestone 2 confidence maintenance is real and operational, and promotion criteria are now met.
- The current truthful public wording is now `promotion-ready` after the helper-driven explicit refresh path republished the tracked artifact to the latest synced `15/7` snapshot.
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
  - use `pnpm milestone:review:promotion-ready -- --limit 20` as the default helper before deciding whether publication should move; use `pnpm milestone:review:confidence` directly only when local history is already synced and you want the digest alone
- Why this rule exists:
  - local `.portmanager` history is machine-local and intentionally ignored by Git
  - allowing every docs build to rewrite the tracked confidence artifact from local history causes noisy diffs and publication drift
  - the tracked docs artifact must change only when publication intent is explicit

### Default developer review helper
- Default local review sequence after completed mainline runs:
  - `pnpm milestone:review:promotion-ready -- --limit 20`
- What the helper adds:
  - syncs completed `mainline-acceptance` history back into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing `pnpm milestone:review:confidence` path
  - reports countdown alignment separately from full local visibility-only drift
  - keeps tracked-artifact publication behind the explicit `--refresh-published-artifact` flag
- Publication rule after that helper review:
  - when the helper exposes countdown drift and human review agrees, rerun `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`; this exact order republished the aligned `promotion-ready` snapshot on `2026-04-21`

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Run `pnpm milestone:review:promotion-ready -- --limit 20` so completed mainline history syncs back into local `.portmanager/reports/` and `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned or only visibility-drifted.
- If the public snapshot should move, rerun the same helper with `--refresh-published-artifact`.
- Compare the synced local summary, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

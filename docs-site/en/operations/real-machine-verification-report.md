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
> Updated: 2026-04-21 | Version: v0.2.8-confidence-refresh-maintenance
### Purpose
This document freezes the current real-machine verification report for PortManager.
It exists so that acceptance truth, confidence truth, and docs-publication truth are recorded in one place instead of being inferred from scattered progress notes.

### Verification session
The latest recorded verification session for this report happened on `2026-04-21`.
It combined a fresh local replay of the standing acceptance gate, an explicit tracked-artifact refresh through `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact` against already-synced local confidence history, the latest imported qualified `mainline-acceptance` evidence at run `24707884501/1`, and the last published `docs-pages` proof before this refresh at run `24707884469`.

Commands executed:
- `corepack pnpm acceptance:verify`
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
- Latest imported `mainline-acceptance` evidence: `24707884501/1`
- Last published `docs-pages` proof before this refresh: `24707884469`

### What each command proves
- `corepack pnpm acceptance:verify`
  - proves the standing local acceptance gate still passes across tests, type checks, Rust workspace checks, contract drift checks, docs build, and milestone verification
- `pnpm milestone:review:promotion-ready -- --skip-sync --refresh-published-artifact`
  - reuses the already-synced local `.portmanager/reports/` bundle instead of re-importing history again
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing review-digest path
  - writes `.portmanager/reports/milestone-wording-review.md` as the local wording-review checklist for human milestone-language decisions, including `Public claim class`, `Source surface status`, and `Required next action`
  - intentionally republishes the tracked docs artifact `docs-site/data/milestone-confidence-progress.ts` only through the explicit refresh contract behind the helper flag
  - proves the synced local review and the published confidence snapshot now match on the same reviewed evidence bundle
  - proves the tracked public artifact now carries latest qualified run `24707884501/1` and `23/7` qualified runs
- `pnpm milestone:review:promotion-ready -- --skip-sync`
  - reuses the current local confidence history/report/summary without reaching back to older completed workflow runs
  - writes the same `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` pair for the current run
  - is the mode `mainline-acceptance` now uses before uploading `milestone-confidence-bundle-*`
- Latest imported `mainline-acceptance` evidence `24707884501/1`
  - proves the synced local history now reaches the latest reviewed qualified mainline run before this refresh
  - proves the heavier confidence collection lane stayed healthy through the latest imported mainline evidence
- Last published `docs-pages` proof before this refresh `24707884469`
  - proves the docs publication workflow remained healthy on the last published snapshot before this deliberate refresh
  - marks the publication baseline that should be rechecked again after this refreshed artifact lands on `main`

### Evidence frozen by this report
- Local acceptance gate: passed
- Helper sync and explicit refresh: passed
- Imported qualified workflow runs now tracked: `24595022905/1`, `24645377989/1`, `24645746838/1`, `24645898239/1`, `24646210070/1`, `24646810439/1`, `24647442700/1`, `24648118236/1`, `24648519364/1`, `24648911705/1`, `24650868231/1`, `24699338529/1`, `24699564258/1`, `24701682768/1`, `24702539213/1`, `24702941958/1`, `24703457084/1`, `24704483563/1`, `24705233374/1`, `24705969182/1`, `24706180264/1`, `24706987559/1`, `24707884501/1`
- Imported qualified workflow: `mainline-acceptance`
- Imported qualified events: `push`, `schedule`
- Current published readiness state: `promotion-ready`
- Current published qualified runs: `23/7`
- Current published qualified consecutive passes: `23/3`
- Current published remaining qualified runs: `0`
- Current published tracked runs: `29`
- Current published local visibility-only runs: `6`
- Current published latest qualified run: `24707884501/1`
- Current published latest qualified SHA: `ca6dbe919157`
- Latest imported `mainline-acceptance` run: `24707884501` passed
- Last published `docs-pages` run before this refresh: `24707884469` passed
- Prior Node 24 forced-action trial: still passed
- Remaining warning source: GitHub official action metadata still declaring `node20`
- Review digest after explicit refresh: aligned

### Current conclusion
- Milestone 1 accepted public-surface truth still holds.
- The standing acceptance contract is now complete and currently healthy across both the local gate and the GitHub-hosted gate.
- The docs publication gate remained healthy on the last published snapshot before this refresh, and the refreshed snapshot is now ready to be rechecked after it lands on `main`.
- Milestone 2 confidence maintenance is real and operational, and promotion criteria are now met.
- The current truthful public wording is now `promotion-ready` after the helper-driven explicit refresh path republished the tracked artifact to the latest reviewed `23/7` snapshot.
- Human milestone-language review is now allowed because the helper posture is `promotion-ready-reviewed`; the remaining public lane is deliberate wording tightening plus sustained gate health, guided by `.portmanager/reports/milestone-wording-review.md`, `Public claim class`, `Source surface status`, and `Required next action`.
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
- Default current-run CI review-pack sequence:
  - `pnpm milestone:fetch:review-pack`
- What the helper adds:
  - syncs completed `mainline-acceptance` history back into local `.portmanager/reports/`
  - writes `.portmanager/reports/milestone-confidence-review.md` through the existing `pnpm milestone:review:confidence` path
  - writes `.portmanager/reports/milestone-wording-review.md` so human wording review sees the latest gate, guardrails, `Source surface status`, source surfaces, and claim posture in one local artifact
  - reports countdown alignment separately from full local visibility-only drift
  - keeps tracked-artifact publication behind the explicit `--refresh-published-artifact` flag
- What the CI review-pack mode adds:
  - downloads the latest completed uploaded `milestone-confidence-bundle-*` into `.portmanager/reports/current-ci-review-pack/`
  - stages `.portmanager/reports/milestone-confidence-review.md`, `.portmanager/reports/milestone-wording-review.md`, and companion summary/history/report files when present
  - writes `.portmanager/reports/current-ci-review-pack/review-pack-manifest.json` so developers who need the current run before a local sync keep run metadata plus local file paths
- Publication rule after that helper review:
  - when the helper exposes countdown drift and human review agrees, rerun `pnpm milestone:review:promotion-ready -- --limit 20 --refresh-published-artifact`; this exact order republished the aligned `promotion-ready` snapshot on `2026-04-21`

### Review protocol
- Read the GitHub Actions `mainline-acceptance` summary first when reviewing readiness accumulation.
- Run `pnpm milestone:fetch:review-pack` and read `.portmanager/reports/current-ci-review-pack/` when the first question is the current CI run rather than a locally synced view.
- Run `pnpm milestone:review:promotion-ready -- --limit 20` so completed mainline history syncs back into local `.portmanager/reports/`, `.portmanager/reports/milestone-confidence-review.md` records whether the published countdown is aligned or only visibility-drifted, and `.portmanager/reports/milestone-wording-review.md` freezes the wording-review checklist plus `Public claim class` and `Source surface status`.
- If the helper reports `promotion-ready-refresh-required` and the public snapshot should move, rerun the same helper with `--refresh-published-artifact`.
- Compare the synced local summary, the wording-review checklist, the tracked docs confidence artifact, and the public development-progress page together.
- Use `Latest Qualified Run` plus the visibility breakdown for milestone-language review, not raw local rerun recency.

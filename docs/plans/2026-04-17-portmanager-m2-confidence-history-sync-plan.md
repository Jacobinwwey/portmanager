---
title: PortManager Milestone 2 Confidence History Sync Plan
type: hardening
status: completed
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-portmanager-m2-confidence-history-sync-requirements.md
---

# PortManager Milestone 2 Confidence History Sync Plan

Updated: 2026-04-17
Version: v0.1.0-completed

## Overview
This plan starts after the completed confidence-readiness slice.
Its job is not to change readiness math again.
Its job is to let developers import real completed GitHub Actions bundle history into local readiness review without hand-merging artifacts.

Status note: all units below are now completed in `main`.

## Problem Frame
PortManager already has truthful local readiness math, but local summaries still stay `local-only` until real CI history is imported.
The next practical gap was developer workflow: bridge the persisted CI bundle back into local files with one canonical command.

## Requirements Trace
- R1. Add one developer-facing sync command.
- R2. Import completed qualified runs, including failures.
- R3. Deduplicate imported and existing entries.
- R4. Reuse existing readiness math and summary rendering.
- R5. Preserve local visibility-only entries without letting them distort qualified readiness.
- R6. Sync docs and roadmap wording around the new command.

## Key Technical Decisions
- Use `gh` CLI with authenticated `repo` scope for GitHub Actions reads.
- Query completed workflow runs, not only successful ones, so streak truth survives import.
- Download `milestone-confidence-bundle-*` artifacts per run, then rebuild entries from `milestone-confidence-report.json`.
- Reuse shared history merge and snapshot helpers from `scripts/acceptance/confidence.mjs`.

## Implementation Units

- [x] **Unit 12: Confidence History Sync Command**

**Goal:** Import completed CI bundle history into local readiness files.

**Files:**
- Modify: `scripts/acceptance/confidence.mjs`
- Create: `scripts/acceptance/sync-confidence-history.mjs`
- Modify: `package.json`
- Create: `tests/milestone/reliability-confidence-sync.test.ts`

**Approach:**
- Export reusable history merge and snapshot helpers.
- Add a sync command that lists completed `mainline-acceptance` runs on `main`, downloads bundle artifacts with `gh`, dedupes entries, and rewrites local history plus summary.
- Test import, dedupe, and promotion-ready threshold behavior without live network dependencies.

- [x] **Unit 13: Progress Surface Sync**

**Goal:** Tell developers how to use the new sync path and why it exists.

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `Interface Document.md`
- Modify: `docs/specs/portmanager-milestones.md`
- Modify: `docs/specs/portmanager-v1-product-spec.md`
- Modify: `docs-site/data/roadmap.ts`
- Regenerate: `docs-site/en/roadmap/milestones.md`
- Regenerate: `docs-site/zh/roadmap/milestones.md`
- Regenerate: `docs-site/en/overview/product-spec.md`
- Regenerate: `docs-site/zh/overview/product-spec.md`

**Approach:**
- Add `pnpm milestone:sync:confidence-history` to developer guidance.
- State that the command imports real completed GitHub Actions evidence and requires authenticated `gh`.
- Keep next-lane wording tied to qualified readiness, not to local-only runs.

## Verification Strategy
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-sync.test.ts`
- `pnpm exec node --experimental-strip-types --test tests/milestone/reliability-confidence-routine.test.ts`
- `corepack pnpm --dir docs-site --ignore-workspace run docs:generate`
- `pnpm milestone:sync:confidence-history -- --limit 20`
- `pnpm test`
- `pnpm milestone:verify:confidence`
- `pnpm acceptance:verify`

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Importer overstates streaks by ignoring failed runs | Query completed runs and import failed bundles when artifacts exist |
| Re-import duplicates history entries | Deduplicate by stable history entry id before snapshot rebuild |
| Docs imply auto-promotion after sync | Keep wording explicit that sync informs human review; it does not auto-change milestone status |

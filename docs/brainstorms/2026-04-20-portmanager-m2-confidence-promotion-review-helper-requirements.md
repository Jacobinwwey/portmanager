---
date: 2026-04-20
topic: portmanager-m2-confidence-promotion-review-helper
---

# PortManager Milestone 2 Confidence Promotion Review Helper Requirements

Status note on `2026-04-20`: the helper slice is already shipped on `main` through `pnpm milestone:review:promotion-ready -- --limit 20`, backed by `scripts/acceptance/review-promotion-ready.mjs` and `tests/milestone/reliability-confidence-promotion-ready.test.ts`.
The synced local and published confidence surfaces both remain `promotion-ready`; exact live counters stay on `.portmanager/reports/milestone-confidence-summary.md` and `docs-site/data/milestone-confidence-progress.ts`.
The remaining gap is current-direction drift: developer-facing roadmap and development-progress links still point at the older wording-review docs instead of the helper slice that now drives review discipline.

## Problem Frame
The prior Milestone 2 slices already closed the core mechanics:

- sync completed mainline confidence history from GitHub Actions into local review
- compare synced local truth against the tracked public artifact
- refresh the public artifact only through the explicit docs command
- narrow durable wording once the promotion threshold is met

The new helper closes an operator-flow gap:

- one repo-native command now performs sync plus digest generation
- one optional flag controls whether the published artifact is refreshed
- one printed summary tells developers whether countdown alignment and full snapshot alignment match

The remaining docs problem is direction drift.
Roadmap readers can now run the helper, but the public current-direction links still send them to the earlier wording-review doc pair instead of the helper-specific requirements and plan that explain the new control flow.

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / workflow state | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence history sync | `scripts/acceptance/sync-confidence-history.mjs`, `pnpm milestone:sync:confidence-history -- --limit 20` | Closed | Helper should reuse this path rather than fork it |
| Confidence review digest | `scripts/acceptance/review-confidence.mjs`, `pnpm milestone:review:confidence` | Closed | Helper should keep digest semantics and strict-review option unchanged |
| Promotion-ready wording | Root/spec/roadmap docs already describe thresholds as met and keep exact counters on live confidence surfaces | Closed | Do not reopen readiness math or publication rule |
| Promotion review helper | `scripts/acceptance/review-promotion-ready.mjs`, package script, dedicated test | Closed in code | Land a matching current-direction doc pair and repoint developer-facing links/tests |

## Requirements

**Helper Contract**
- R1. The active current-direction requirements document and matching implementation plan must describe `pnpm milestone:review:promotion-ready -- --limit 20` as one repo-native helper that syncs completed mainline bundle history, writes the review digest, and only refreshes the tracked public artifact when the explicit `--refresh-published-artifact` flag is passed.
- R2. The helper docs must state that the helper reuses existing `sync-confidence-history` and `review-confidence` behavior rather than introducing a new readiness model, a second digest format, or a second publication path.
- R3. The helper docs must preserve the existing publication rule: only `pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence` is allowed to republish `docs-site/data/milestone-confidence-progress.ts`.

**Developer-Facing Direction**
- R4. `README.md`, `TODO.md`, the roadmap home page, and the development-progress page must treat the helper doc pair as the active current-direction documents for this lane.
- R5. Developer-facing copy must explain that the active lane is still promotion-ready wording review plus sustained gate health, but the default review entrypoint is now the helper command rather than manual multi-command choreography.
- R6. The development-progress regression test must guard the new helper plan link so future edits cannot silently point the public page back at stale direction docs.

**Scope Boundaries**
- R7. Do not change readiness thresholds, latest-qualified calculations, or the underlying `.portmanager` report format.
- R8. Do not make normal docs generation republish the tracked confidence artifact.
- R9. Do not claim Toward C activation or Milestone 2 completion just because the helper exists.

## Success Criteria
- A developer can open `README.md`, `TODO.md`, roadmap home, or the development-progress page and land on helper-specific direction docs instead of outdated wording-review docs.
- The helper docs explain exactly when sync, digest, and optional refresh happen.
- Existing tests still prove helper behavior and docs-site developer progress wiring.

## Key Decisions
- Make helper docs additive after the wording-review docs instead of replacing prior slice history.
- Keep exact live counters on generated confidence surfaces and verification artifacts, not in broad root-doc prose.
- Use current-direction links to steer developers to helper docs while leaving previous docs in the historical chain.

## Dependencies / Assumptions
- `pnpm milestone:review:promotion-ready` remains the supported public entrypoint for this lane.
- `pnpm milestone:review:confidence` and `pnpm milestone:sync:confidence-history` continue to be the underlying primitives.
- The tracked docs artifact and `.portmanager` summary remain aligned before the docs link retarget is merged.

## Next Steps
- Move to `docs/plans/2026-04-20-portmanager-m2-confidence-promotion-review-helper-plan.md` for the implementation sequence.

---
date: 2026-04-19
topic: portmanager-m2-confidence-promotion-countdown
---

# PortManager Milestone 2 Confidence Promotion Countdown Requirements

Status note on `2026-04-20`: after pulling the latest `main`, syncing completed `mainline-acceptance` bundles, and refreshing the tracked docs snapshot, the public readiness truth is now `building-history` with `5/7` qualified runs, `5/3` qualified consecutive passes, and `2` remaining qualified runs.
The pass-streak gate is already satisfied.
The remaining work is countdown governance, public progress truth, and milestone-language discipline rather than more proof plumbing.

## Problem Frame
The prior `2026-04-17` slices already closed the important Milestone 2 infrastructure gaps:

- one canonical confidence routine exists
- one durable confidence history bundle exists
- one repo-native sync path exists for completed GitHub Actions evidence
- one truthful review signal exists that separates latest qualified mainline evidence from local visibility-only noise
- one public development-progress page already exists on the docs site

After the latest `main` pull and sync refresh, the problem changed again.
The project is no longer waiting for confidence-readiness machinery.
It is waiting for the last countdown leg toward `promotion-ready`, and the docs stack needs to expose that state precisely so developers do not keep reviewing the branch as if it were still at the earlier `1/7` checkpoint.

## Comparison Against Prior Requirements And Plan

| Prior slice | Current evidence after latest sync | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence routine | `pnpm milestone:verify:confidence`, `.github/workflows/mainline-acceptance.yml` | Closed | Do not redesign the routine; keep it green |
| Confidence readiness | `.portmanager/reports/milestone-confidence-summary.md`, readiness counters | Closed | Public copy must acknowledge that the pass-streak gate is already satisfied |
| Confidence history sync | `pnpm milestone:sync:confidence-history -- --limit 20` imported 5 qualified runs | Closed | Docs and roadmap now need to reflect the synced countdown truth |
| Confidence review signal | `Latest Qualified Run`, visibility breakdown, tracked docs progress artifact | Closed | Developer review should focus on latest qualified evidence, not raw recency |
| Confidence progress page | `/en/roadmap/development-progress`, `/zh/roadmap/development-progress` | Closed | The page must show the current countdown and current direction docs |
| Node 24 workflow trial | `mainline-acceptance` and `docs-pages` stayed green after forcing JavaScript actions to Node 24 | Closed | Remaining warning debt is upstream metadata, not repo-local workflow drift |

## Requirements

**Progress Truth**
- R1. Root docs, interface docs, product spec, milestone spec, and verification report must state the current synced readiness truth as `building-history` with `5/7` qualified runs, `5/3` qualified consecutive passes, and `2` remaining qualified runs.
- R2. The same docs must explicitly state that the consecutive-pass gate is already satisfied and that milestone wording still cannot narrow until the minimum qualified-run count reaches `7/7`.
- R3. The repo must land one new current-direction requirements document and one matching implementation plan that capture the deep compare between prior Milestone 2 slices and the new countdown state.

**Roadmap And Developer Review Visibility**
- R4. Roadmap home and the public development-progress page must visibly expose the current countdown truth, the latest qualified mainline run, and the fact that only the qualified-run counter remains open.
- R5. The public developer-review surface must link the real-machine verification report plus the new current-direction requirement and plan docs so developers can inspect both the proof state and the next-step rationale from one place.

**Direction Discipline**
- R6. Current-direction copy must make clear that the next lane is not more reporting infrastructure, not another readiness calculator, and not a premature `promotion-ready` narration.
- R7. Current-direction copy must lock the remaining implementation focus to: keep Unit 0 green, keep the canonical confidence routine green, sync completed mainline evidence, and reevaluate milestone wording only after the qualified-run count reaches `7/7`.

## Success Criteria
- A developer can read the root docs or the public roadmap surfaces and see the same current truth: `building-history`, pass streak satisfied, `2` qualified runs still needed.
- The roadmap page and development-progress page both expose enough evidence and links that developer review no longer depends on guessing which doc is freshest.
- The repo has a durable current-direction doc pair that explains why the remaining gap is a promotion countdown rather than another missing architecture slice.

## Scope Boundaries
- Do not change the readiness thresholds.
- Do not auto-promote Milestone 2 wording just because the consecutive-pass gate is already satisfied.
- Do not invent new CI workflows, new review signals, or another public dashboard.
- Do not reopen Toward C or multi-host expansion while Milestone 2 countdown work is still active.

## Key Decisions
- Keep `building-history` as the truthful public wording until the qualified-run gate reaches `7/7`.
- Treat the satisfied pass-streak gate as countdown evidence, not as permission to compress milestone wording early.
- Use the existing verification report, synced summary, and public development-progress page as the shared developer-review bundle instead of adding new reporting surfaces.

## Dependencies / Assumptions
- Authenticated `gh` access with `repo` scope remains available for `pnpm milestone:sync:confidence-history`.
- The canonical confidence routine and docs publication workflows remain green on `main`.

## Next Steps
- Move to `docs/plans/2026-04-19-portmanager-m2-confidence-promotion-countdown-plan.md` for the implementation sequence.

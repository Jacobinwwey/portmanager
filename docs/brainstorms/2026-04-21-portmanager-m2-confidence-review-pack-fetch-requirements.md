---
date: 2026-04-21
topic: portmanager-m2-confidence-review-pack-fetch
---

# PortManager Milestone 2 Confidence Review Pack Fetch Requirements

Status note on `2026-04-21`: the repo now publishes the current-run promotion review pack in `mainline-acceptance`, and roadmap/development-progress guidance tells developers to look at that uploaded pack when the first question is CI state. That closes review-pack publication. It does not yet close review-pack access, because the only path to that same evidence is still manual GitHub UI browsing or ad-hoc `gh run download` usage outside repo-native commands.

## Problem Frame
Developers already have two trustworthy review surfaces:

- `pnpm milestone:review:promotion-ready -- --limit 20` for synced local review
- the uploaded `milestone-confidence-bundle-*` current-run review pack from `mainline-acceptance`

The remaining drift is access ergonomics:

- current docs tell reviewers to use the uploaded current-run review pack, but the repo has no single helper command that downloads it
- developers must remember workflow names, artifact patterns, and `gh run download` details when the current CI run is the first question
- next-lane wording review still depends on manually stitching GitHub artifact clicks together before local synced review even starts

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence history sync | `pnpm milestone:sync:confidence-history` imports completed bundle history into local readiness review | Closed for history math | Does not expose the current-run review digest + wording checklist as a stable local developer surface |
| Promotion review helper | `pnpm milestone:review:promotion-ready` writes the synced local digest and wording checklist | Closed for local review | Still starts from synced history, not the uploaded current-run bundle |
| Review-pack CI publication | `mainline-acceptance` uploads the current-run digest + wording checklist in `milestone-confidence-bundle-*` | Closed for CI durability | Developers still need manual GitHub artifact access to use it |
| Docs guidance | Roadmap/home/progress now tell developers to inspect the uploaded current-run review pack | Partially closed | Guidance should point to one repo-native fetch command instead of manual GitHub browsing |

## Requirements

**Repo-Native Fetch Helper**
- R1. The repo must expose one command that downloads the latest completed current-run review pack from `mainline-acceptance` without forcing developers to handcraft `gh run download`.
- R2. That command must support an explicit `--run-id` override so reviewers can fetch one specific CI run when needed.
- R3. The command must infer the GitHub repository from `remote.origin.url` by default, while still allowing an explicit `--repo` override.

**Fetched Review Surface**
- R4. The helper must copy `.portmanager/reports/milestone-confidence-review.md` and `.portmanager/reports/milestone-wording-review.md` into one stable local output directory.
- R5. The helper should also preserve the current-run confidence report/history/summary files from the same artifact when they are present, so developers can compare the whole review pack locally.
- R6. The helper must write one local manifest with run metadata plus copied file paths, so the fetched review surface is durable and inspectable after the command exits.

**Developer Guidance**
- R7. `README.md`, `TODO.md`, `Interface Document.md`, roadmap data, and the real-machine verification report must describe the current-run review-pack path through the new repo-native fetch helper instead of only telling developers to browse the uploaded artifact manually.
- R8. Development-progress and roadmap current-direction links must point to one new requirements/plan pair for this fetch-helper slice.

**Verification Coverage**
- R9. Tests must lock command parsing, run selection, required review-pack file copying, and manifest output.
- R10. Docs regression coverage must lock the new command and updated current-direction links on the development-progress surface and interface docs.

## Success Criteria
- Developers can answer “what does the latest CI review pack say?” through one repo-native command before or without doing a synced local history review.
- The uploaded current-run review pack stays additive: it does not replace the synced local helper, readiness math, or publication-refresh rules.
- Roadmap/development-progress guidance stops requiring manual GitHub artifact browsing as the default current-run review path.

## Scope Boundaries
- Do not change readiness math, review digest logic, or wording-review logic.
- Do not replace `pnpm milestone:review:promotion-ready -- --limit 20` as the default synced local review helper.
- Do not auto-refresh the tracked public confidence artifact from the fetch command.
- Do not create a new public docs page for fetched review-pack output.

## Key Decisions
- Treat current-run review-pack access as an artifact-fetch ergonomics gap, not as a new review model.
- Keep the source of truth in the uploaded `milestone-confidence-bundle-*` artifact; the helper only fetches and stages it locally.
- Preserve one stable local output directory plus a manifest so review evidence survives after the terminal output scrolls away.

## Dependencies / Assumptions
- `mainline-acceptance` continues to upload `milestone-confidence-bundle-*`.
- Developers already have authenticated `gh` access when they use repo-native CI review helpers.
- `.portmanager/` remains ignored, so fetched review-pack output does not dirty tracked repo state.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-review-pack-fetch-plan.md` for the implementation sequence.

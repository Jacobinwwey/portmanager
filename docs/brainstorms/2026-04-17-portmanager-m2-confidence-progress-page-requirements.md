---
date: 2026-04-17
topic: portmanager-m2-confidence-progress-page
---

# PortManager Milestone 2 Confidence Progress Page Requirements

Status note on `2026-04-17`: requirements baseline is now satisfied in `main`.
The repo already had a truthful synced confidence summary for developer review.
The remaining publication gap was public visibility: roadmap prose had been updated, but the docs site still lacked a first-class page that surfaced the current readiness counters, latest qualified mainline evidence, and local visibility-only noise split.

## Problem Frame
The confidence review-signal slice fixed the summary itself.
The docs site still left one blind spot:

- `/en/roadmap/` and `/zh/roadmap/` described the review signal in prose
- developers still needed local repo access or GitHub Actions job summaries to see the current numbers
- roadmap readers could not inspect the synced readiness state directly in the public docs site
- progress communication therefore remained partially indirect

This was not a readiness-math gap.
It was a publication gap.

## Comparison Against Prior Requirements And Plan

| Prior slice | Current evidence | Result | Remaining implication |
| --- | --- | --- | --- |
| Confidence readiness | `.portmanager/reports/milestone-confidence-history.json`, `.portmanager/reports/milestone-confidence-summary.md` | Readiness math is already explicit and stable | Public docs site still needs a first-class surface for that state |
| Confidence history sync | `pnpm milestone:sync:confidence-history`, synced local summary | Developers can import real mainline history into local review | Public readers still cannot inspect synced counters on the docs site |
| Confidence review-signal | `latestQualifiedRun`, visibility breakdown, truthful summary rendering | Local review now stays truthful after reruns | Roadmap home still needs visible publication of that truthful state |

## Requirements

**Public Progress Surface**
- R1. The docs site must publish a first-class development-progress page under the roadmap section in both English and Chinese.
- R2. The published page must expose the current readiness status, qualified-run counters, latest visible run, latest qualified run, and visibility breakdown.

**Roadmap Home Visibility**
- R3. `/en/roadmap/` and `/zh/roadmap/` must show a live preview of the same synced confidence snapshot so readers can see progress without leaving the roadmap home page.
- R4. Roadmap navigation must include the new development-progress route.

**Data Integrity**
- R5. The public page must be generated from the synced milestone confidence data rather than duplicated hand-written prose.
- R6. Docs generation must remain buildable when the local `.portmanager` report files are unavailable, by reusing the last committed generated progress snapshot.

**Documentation Continuity**
- R7. Root docs, milestone docs, interface docs, product spec, and roadmap progress content must explain that the docs site now publishes the live developer-progress surface.

## Success Criteria
- A roadmap reader can open one public page and immediately see the current readiness counters and latest qualified mainline evidence.
- Roadmap home shows current progress at a glance and links to the detailed page.
- Docs generation keeps the public progress page in sync when `.portmanager` data is available, without breaking clean-clone docs builds.
- Progress docs stop implying that GitHub Actions or local files are the only developer-review surface.

## Scope Boundaries
- Do not change readiness thresholds or qualification rules.
- Do not invent a second readiness calculator.
- Do not hide local visibility-only runs from the public snapshot.
- Do not turn the docs site into a writable dashboard.

## Key Decisions
- Generate one committed docs-site data snapshot from `.portmanager/reports/milestone-confidence-history.json`.
- Publish one detailed route plus one roadmap-home preview sourced from the same generated data.
- Keep public copy explicit that this slice improves developer visibility, not milestone readiness itself.

## Next Steps
- Move to `docs/plans/2026-04-17-portmanager-m2-confidence-progress-page-plan.md` for the implementation sequence.

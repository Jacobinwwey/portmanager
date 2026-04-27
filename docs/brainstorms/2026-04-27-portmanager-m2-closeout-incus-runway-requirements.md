---
date: 2026-04-27
topic: portmanager-m2-closeout-incus-runway
---

# PortManager Milestone 2 Closeout And Incus Runway Requirements

Status note on `2026-04-27`: Milestone 2 confidence is already `promotion-ready`, `pnpm milestone:review:promotion-ready` plus `pnpm milestone:fetch:review-pack` already hold the wording guardrail line, and Milestone 3 preview-before-capture tooling is already landed. The current gap is narrower: developers still lack one repo-native disposable Debian 12 staging helper for fast rehearsal, and the current frontend surfaces still do not present Milestone 2 closeout discipline plus the Toward C next queue in one obvious operator-visible runway.

## Problem Frame
Current repo truth is already stronger than the older “helper plumbing first” posture:

- Milestone 2 no longer needs more readiness scaffolding before work can move
- `pnpm milestone:preview:live-packet` already exposes the preferred read-only preflight for the current bounded second-target queue
- `/second-target-policy-pack` already keeps `review_open`, `reviewAdjudication.blockingDeltas`, `container_bridge_transport_substitution`, and `liveTransportFollowUp.state: capture_required` explicit
- docs-site already publishes roadmap plus development-progress surfaces, and the Web shell already renders controller-backed operator views

Two friction points still remain:

1. Local Debian 12 rehearsal is still documented mostly as a raw `incus launch` suggestion instead of one repo-native helper that stages the same bounded review-prep lane quickly.
2. Frontend surfaces still make developers mentally join Milestone 2 closeout discipline with the Toward C next queue instead of showing one explicit runway.

## Requirements

**Repo-Native Incus Rehearsal**
- R1. Add one repo-native helper command for disposable Debian 12 rehearsal: `pnpm milestone:rehearse:debian12-incus`.
- R2. The helper must keep scope bounded: launch one Debian 12 instance, mount the repo, install only minimal inspection packages, print next commands, and expose cleanup, but it must not claim second-target support or mutate milestone wording by itself.
- R3. The helper must teach the same next actions the repo already expects: `pnpm acceptance:verify`, `pnpm milestone:fetch:review-pack`, `pnpm milestone:review:promotion-ready -- --limit 20`, and `pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url <url>`.
- R4. The helper must stay testable without a live `incus` daemon by exporting parsing and command-plan functions.

**Frontend Runway**
- R5. The first frontend runway slice must surface Milestone 2 closeout discipline and Toward C bounded follow-up together instead of burying them in prose only.
- R6. The Web overview shell must show one closeout card and one bounded Toward C runway card with the repo-native incus helper, preview-first flow, capture flow, validator flow, and current second-target policy state.
- R7. The docs-site development-progress page and roadmap page must mention the new closeout slice, the repo-native incus helper, and the same preview-before-capture progression.

**Docs And Plan Sync**
- R8. Raw docs remain the source of truth. Update the acceptance recipe plus progress docs before regenerating the publishing layer.
- R9. Land one requirements doc and one implementation plan doc for this closeout slice so the active direction remains reviewable in-repo.

**Regression Coverage**
- R10. Add coverage for helper parsing / command-plan output, Web overview runway rendering, and docs-site wording that mentions the new helper and new requirements-plan pair.

## Success Criteria
- Developers can run one repo-native incus staging helper instead of copying a raw `incus launch` note by hand.
- Web and docs-site frontend surfaces both show the same operator/developer runway: Milestone 2 guardrail first, bounded Toward C follow-up second.
- The repo keeps one truthful story: Milestone 2 stays closed-but-guarding, Toward C stays bounded, and incus staging accelerates rehearsal without widening claims.

## Scope Boundaries
- Do not treat incus staging as support proof by itself.
- Do not change controller-agent contracts in this slice.
- Do not fabricate or commit live Tailscale packet evidence.
- Do not reopen landed Milestone 3 preflight or source-auto-resolution behavior unless regressions appear.

## Dependencies / Assumptions
- `docs/operations/portmanager-debian-12-acceptance-recipe.md` remains the bounded operator recipe baseline.
- `apps/web/src/main.ts` remains the first operator-facing Web shell surface.
- `docs-site/data/roadmap.ts` plus `docs-site/.vitepress/theme/components/MilestoneConfidencePage.vue` remain the public developer-progress source surfaces.

## Next Steps
- Move to `docs/plans/2026-04-27-portmanager-m2-closeout-incus-runway-plan.md` for the bounded helper, frontend runway, and docs sync implementation units.

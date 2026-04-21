---
date: 2026-04-21
topic: portmanager-m2-confidence-wording-claim-matrix
---

# PortManager Milestone 2 Confidence Wording Claim Matrix Requirements

Status note on `2026-04-21`: the repo already has one default promotion-review helper, one confidence digest, and one wording-review checklist, but the newest synced helper run can still move ahead of the tracked public confidence artifact. That means developers now need one explicit claim posture instead of inferring safe milestone wording from a mix of counters, drift kinds, and human checklist bullets.

## Problem Frame
Prior slices already closed:

- one canonical confidence routine
- one synced confidence-history import path
- one repo-native review digest for local versus published drift
- one helper that composes sync, digest generation, and optional publication refresh
- one wording-review checklist that freezes guardrails and source surfaces
- one public development-progress page plus roadmap preview for developer review

That closes the evidence plumbing.
It does not yet close wording semantics.

Current code still leaves one developer-facing ambiguity:

- the digest can still say human milestone-language review is allowed even when countdown drift means public wording must not narrow yet
- the wording-review checklist freezes guardrails, but it does not classify which claims are safe locally, which claims are safe publicly, and which claims stay blocked
- roadmap and developer-progress surfaces still tell developers to read the helper pack, but they do not name the claim posture they should look for

## Comparison Against Prior Requirements And Plan

| Prior slice | Current code / docs state | Result | Remaining implication |
| --- | --- | --- | --- |
| Promotion-review helper | `pnpm milestone:review:promotion-ready -- --limit 20` syncs history, writes digest, writes wording checklist, and can refresh publication | Closed | Keep one helper entrypoint |
| Wording-review checklist | `.portmanager/reports/milestone-wording-review.md` freezes gate state, guardrails, and source surfaces | Partially closed | Add explicit claim posture so wording decisions stop relying on inference |
| Confidence review digest | `.portmanager/reports/milestone-confidence-review.md` records countdown drift versus full-snapshot drift | Partially closed | Digest must state whether public wording can move or refresh must happen first |
| Public developer progress | `/en/roadmap/development-progress` and `/zh/roadmap/development-progress` expose the published confidence snapshot | Closed in surface | Developer-facing docs still need explicit claim-class guidance |

## Requirements

**Claim Posture Logic**
- R1. `pnpm milestone:review:confidence` must publish one explicit claim posture alongside the existing digest: `Public claim class`, `Human wording review allowed`, and `Next required action`.
- R2. That posture must distinguish at least `promotion-ready-reviewed`, `promotion-ready-refresh-required`, and the non-promotion-ready states already used by readiness review.
- R3. When local synced evidence is `promotion-ready` but the published countdown lags, the digest must classify that state as `promotion-ready-refresh-required`, keep wording review blocked, and tell developers to refresh the tracked public artifact before narrowing public wording.

**Wording Review Artifact**
- R4. `.portmanager/reports/milestone-wording-review.md` must include one explicit claim matrix: local evidence claim, public wording claim, required next action, and blocked claims.
- R5. That claim matrix must keep `Milestone 2 is complete` and `Toward C is active` blocked even when promotion thresholds are already met.
- R6. The wording-review artifact must stay helper-native and local-only under `.portmanager/reports/`; do not add a second helper or a second publication path.

**Developer-Facing Docs**
- R7. `README.md`, `TODO.md`, `Interface Document.md`, and `docs/operations/portmanager-real-machine-verification-report.md` must describe the claim-matrix addition as the next shipped review aid on the same promotion-ready lane.
- R8. The public development-progress page and roadmap home must tell developers to inspect `Public claim class` inside `.portmanager/reports/milestone-wording-review.md` and point current-direction links at one new requirements/plan pair for this slice.

**Verification Coverage**
- R9. Confidence-review and promotion-review helper tests must guard the new claim posture for both aligned promotion-ready review and promotion-ready countdown drift.
- R10. Docs regression coverage must guard the new current-direction links and the public mention of `Public claim class`.

## Success Criteria
- A developer can run one helper command and immediately see whether wording review is fully allowed, refresh-required, or still below promotion-ready.
- The digest and wording-review checklist no longer disagree about whether public wording may narrow.
- Root docs, roadmap home, and development-progress docs all point developers at the same claim-matrix slice and the same helper-first workflow.

## Scope Boundaries
- Do not change readiness thresholds or qualification rules.
- Do not create another public page, another helper, or another publication command.
- Do not hard-code live counters into root docs; exact live counts still belong to the generated confidence artifact and development-progress page.
- Do not treat claim-matrix guidance as automatic Milestone 2 completion or Toward C activation.

## Key Decisions
- Keep one review helper and enrich its outputs instead of inventing another review path.
- Make claim posture explicit in both the digest and the wording-review checklist so the developer can reason from one consistent story.
- Treat countdown drift inside `promotion-ready` as a public-wording blocker even though local promotion thresholds are already met.

## Dependencies / Assumptions
- `pnpm milestone:review:promotion-ready` remains the default review entrypoint on `main`.
- The tracked public confidence artifact still moves only through the same helper plus `--refresh-published-artifact`.
- The docs site keeps using the same roadmap and development-progress components for public developer review.

## Next Steps
- Move to `docs/plans/2026-04-21-portmanager-m2-confidence-wording-claim-matrix-plan.md` for the implementation sequence.

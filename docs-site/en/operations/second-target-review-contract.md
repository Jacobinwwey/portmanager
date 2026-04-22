---
title: "Second-Target Review Contract"
audience: shared
persona:
  - operator
  - admin
  - contributor
  - automation
section: operations
sourcePath: "docs/operations/portmanager-second-target-review-contract.md"
status: active
---
> Source of truth: `docs/operations/portmanager-second-target-review-contract.md`
> Audience: `shared` | Section: `operations` | Status: `active`
> Updated: 2026-04-21 | Version: v0.1.0
### Purpose
Freeze the public wording and maintainer wording for the declared bounded-review candidate `debian-12-systemd-tailscale`.

### Current claim posture
- `ubuntu-24.04-systemd-tailscale` remains the only supported target profile.
- `debian-12-systemd-tailscale` is the bounded-review candidate, not a supported target.
- `/second-target-policy-pack` is the canonical controller contract for second-target expansion truth.
- The preserved packet root is `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`, and current controller truth is guide coverage `6/6`, artifact coverage `20/20`, `decisionState: review_required`, and `reviewAdjudication.state: review_open`.
- The current blocking delta is `container_bridge_transport_substitution`: the preserved packet still uses Docker bridge address `172.17.0.2` instead of live Tailscale transport, so broader support stays locked.
- No wider platform claim, gateway deployment claim, or PostgreSQL-default claim is allowed through this document.

### Required wording rules
- Say `candidate` or `bounded-review candidate`, never `supported`, `available`, or `shipped`.
- Keep support claims locked to Ubuntu while bounded second-target review remains open.
- Keep docs, CLI, Web, controller contract, and roadmap pages aligned with the same `review_required`, `review_open`, and `blockingDeltas` posture.
- If packet evidence regresses, drifts, or review finds a real delta, update `/second-target-policy-pack` first and move the blocking truth there before changing any prose.
- Keep `container_bridge_transport_substitution` explicit until one live Tailscale-backed bounded packet lands or bounded review deliberately stays locked.

### Required source surfaces
- `README.md`
- `TODO.md`
- `Interface Document.md`
- `docs/specs/portmanager-milestones.md`
- `docs/specs/portmanager-v1-product-spec.md`
- `docs/specs/portmanager-toward-c-strategy.md`
- `docs/architecture/portmanager-v1-architecture.md`
- `docs/operations/portmanager-debian-12-review-packet-template.md`
- `docs/operations/portmanager-debian-12-operator-ownership.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/README.md`
- `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/packet-ready-policy-pack.json`
- `docs-site/data/roadmap.ts`
- `apps/controller/src/second-target-policy-pack.ts`

### Current review boundary
- Review owner: `controller`
- Candidate target: `debian-12-systemd-tailscale`
- Preserved packet root: `docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/`
- Open adjudication verdicts: `packet_integrity`, `drift_acknowledged`, `support_lock_confirmed`, `operator_signoff`, `follow_up_scope_bounded`
- Current blocking delta: `container_bridge_transport_substitution`
- Required follow-up: capture one live Tailscale-backed bounded packet for `debian-12-systemd-tailscale`, or keep support locked to Ubuntu with the delta still published
- Landed governance artifacts today: docs contract, acceptance recipe, review-packet template, operator ownership definition, and review-delta contract data
- Broader support still remains locked to `ubuntu-24.04-systemd-tailscale`

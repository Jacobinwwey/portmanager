---
title: "Docs Site Architecture"
audience: shared
persona:
  - contributor
  - admin
section: architecture
sourcePath: "docs/specs/portmanager-docs-site-architecture.md"
status: active
---
> Source of truth: `docs/specs/portmanager-docs-site-architecture.md`
> Audience: `shared` | Section: `architecture` | Status: `active`
> Updated: 2026-04-18 | Version: v0.3.2-docs-site-confidence-publication
### Purpose
This document locks the documentation publishing architecture for PortManager.
The repository keeps raw bilingual specifications as the source of truth, while VitePress acts as the public publishing layer for GitHub Pages.

### Publishing model
- raw source of truth: `docs/` and `packages/contracts/`
- publishing layer: `docs-site/`
- locale generation: `scripts/docs/extract-locales.mjs`
- public hosting: GitHub Pages
- deployment flow: `main -> GitHub Actions -> GitHub Pages`

### Design baseline boundary
- Product control-plane baseline: `docs/design/portmanager-overview-design-baseline.md`
- Product control-plane semantic mapping: `docs/design/portmanager-overview-semantic-mapping.md`
- Docs-site publishing baseline: `docs/design/portmanager-docs-site-design-baseline.md`
- The docs site may reference the VitePress structure used by `OpenAvatarChat`, but only as a design reference rather than a cloning target.
- The docs site should prefer standard VitePress `home` and `doc` layouts before custom wrappers.
- The docs site should keep custom Vue components to the minimum set needed for `Quick Start` and `Roadmap`.

### Route contract
The public site treats the following route families as stable interfaces:
- `/en/`
- `/zh/`
- `/en/human/...`
- `/zh/human/...`
- `/en/agent/...`
- `/zh/agent/...`
- `/en/reference/...`
- `/zh/reference/...`
- `/en/architecture/...`
- `/zh/architecture/...`
- `/en/operations/...`
- `/zh/operations/...`
- `/en/roadmap/`
- `/zh/roadmap/`
- `/en/archive`
- `/zh/archive`

Section landing pages that also own child pages should publish through nested `index` routes.
This avoids static-host conflicts between a page and a folder with the same public path.
Custom Vue components must follow one of two valid patterns and may not mix them:
- pass raw site-relative paths such as `/en/roadmap/milestones` into VitePress navigation components such as `VPLink`
- or, if a plain anchor must be used, expand the path through a VitePress base-aware helper first
Applying both `VPLink` and a pre-expanded `withBase(...)` path at the same time is invalid because it double-prefixes Project Pages bases such as `/portmanager/`.

### Audience split
The docs site must separate `Human` and `Agent` audiences at the top level.
This split is structural, not cosmetic.
Human pages prioritize onboarding, context, workflows, and operational guidance.
Agent pages prioritize deterministic inputs, outputs, state transitions, and copy-paste examples.

### Source-of-truth rules
- Raw bilingual documents remain authoritative.
- The docs site may reorganize, summarize, and route documents.
- The docs site must not silently fork or rewrite core specifications into a second long-term truth layer.
- Any new public document must land in raw source form first, then be mapped into the docs site.

### Generation rules
The locale extraction pipeline must fail when:
- a mapped source file is missing
- `## English` is missing
- `

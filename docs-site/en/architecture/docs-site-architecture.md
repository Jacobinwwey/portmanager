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
> Updated: 2026-04-16 | Version: v0.2.0-docs-site-baseline
### Purpose
This document locks the documentation publishing architecture for PortManager.
The repository keeps raw bilingual specifications as the source of truth, while VitePress acts as the public publishing layer for GitHub Pages.

### Publishing model
- raw source of truth: `docs/` and `packages/contracts/`
- publishing layer: `docs-site/`
- locale generation: `scripts/docs/extract-locales.mjs`
- public hosting: GitHub Pages
- deployment flow: `main -> GitHub Actions -> GitHub Pages`

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
- `/en/roadmap`
- `/zh/roadmap`
- `/en/archive`
- `/zh/archive`

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

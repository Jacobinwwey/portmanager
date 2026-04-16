---
title: "Docs Site Design Baseline"
audience: shared
persona:
  - contributor
  - admin
section: architecture
sourcePath: "docs/design/portmanager-docs-site-design-baseline.md"
status: active
---
> Source of truth: `docs/design/portmanager-docs-site-design-baseline.md`
> Audience: `shared` | Section: `architecture` | Status: `active`
> Updated: 2026-04-16 | Version: v0.3.0-docs-site-design-alignment
### Purpose
This document freezes the visual and structural baseline for the public PortManager documentation site.
It is separate from the product control-plane design baseline.

### Reference stance
The docs-site baseline may reference the VitePress information architecture used by `OpenAvatarChat`, especially:
- standard `layout: home` homepage composition
- clear `nav + sidebar + locale` structure
- content-first hero, actions, and feature blocks
- restrained visual treatment that prioritizes reading and navigation over dashboard theatrics

This is a reference posture, not a requirement to clone that site pixel-for-pixel.

### What the docs site must be
- a docs-first VitePress site for bilingual publishing
- a clear top-level split between `Human` and `Agent`
- a stable route surface for `Reference`, `Architecture`, `Operations`, `Roadmap`, and `Archive`
- a publishing layer that points readers back to raw source-of-truth documents
- a site whose first screen explains where to start, not a simulated operational console

### What the docs site must not be
- not the PortManager product UI
- not a fake operations dashboard
- not a dense host table, telemetry wall, or event-stream metaphor on the homepage
- not a place where docs visuals silently redefine product UI expectations

### Layout and component rules
- Prefer native VitePress `home` and `doc` layouts before introducing custom wrappers.
- Use custom Vue components only when Markdown and built-in VitePress blocks are insufficient.
- Homepage sections should emphasize quick orientation, audience entry, and key document families.
- Secondary pages should favor headings, lists, code blocks, callouts, and lightweight doc cards.
- Roadmap may remain a custom page because it expresses structured milestone data rather than ordinary prose.

### Visual language rules
- Keep chrome light, calm, and readable.
- Brand styling should support navigation and hierarchy, not dominate the page.
- Use generous whitespace, obvious link targets, and restrained surfaces.
- Preserve bilingual parity across both locales.

### Boundary to preserve
- Product control-plane UI baseline: `docs/design/portmanager-overview-design-baseline.md`
- Product control-plane semantic mapping: `docs/design/portmanager-overview-semantic-mapping.md`
- Docs-site baseline: this document

No future work may treat these as interchangeable.

---
title: Contributor
---

# Contributor

This page is for the person changing docs, contracts, generation rules, or the future implementation baseline.

## Start here

1. Read [Docs Site Architecture](/en/architecture/docs-site-architecture).
2. Read [Docs Site Design Baseline](/en/architecture/docs-site-design-baseline).
3. Read [Product Console Design Baseline](/en/architecture/overview-design-baseline).
4. Read [Milestones Detail](/en/roadmap/milestones).

## What this role must preserve

- raw bilingual docs remain the source of truth
- docs-site remains a publishing layer, not a second spec layer
- the product console baseline and the docs-site baseline never collapse into one design system
- route stability matters because Human and Agent act as public documentation interfaces

## Boundary

If a public page changes meaning, update the raw source first and regenerate. Never let the generated site silently become the canonical source.

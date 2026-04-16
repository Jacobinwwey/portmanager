---
title: Agent Quickstart
---

# Agent Quickstart

The product implementation is not shipped yet, so this page freezes the intended non-interactive entry shape instead of pretending the command already works.

## Status

`Planned`

## Target command shape

```bash
pmctl host probe --host demo-host --json --wait
```

## Required behavior

- machine-readable output by default when `--json` is present
- explicit `--wait` semantics rather than hidden polling
- stable exit codes for success, degraded, and failure
- no hidden prompts in non-interactive mode

## Next reads

- [Non-Interactive Flows](/en/agent/non-interactive)
- [OpenAPI Reference](/en/reference/openapi)
- [Contracts Baseline](/en/reference/contracts-baseline)

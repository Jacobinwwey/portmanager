---
title: Agent Quickstart
---

# Agent Quickstart

The full product implementation is not shipped yet, but the first CLI read path now exists in-repo.

## Status

`Partial`

## Target command shape

```bash
portmanager operation get op_123 --json --wait
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

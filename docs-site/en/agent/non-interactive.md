---
title: Non-Interactive Flows
---

# Non-Interactive Flows

This page defines the contract posture expected by automation, agent consumers, and future SDK wrappers.
The first implemented CLI read path is now available in-repo.

## CLI expectations

```bash
portmanager operation get op_123 --json --wait
```

- `--json` returns structured output only
- `--wait` blocks until the operation reaches a terminal state or timeout
- transport failures emit explicit machine-readable error payloads
- degraded operation state stays visible instead of collapsing into a generic transport error

## API expectations

- REST owns request / response mutation entrypoints
- SSE owns live operation progress and event stream updates
- operation ids remain the join key across CLI, API, and web views

## Failure semantics

- transport failure is not the same as degraded state
- timeout is reported explicitly rather than rewritten as a generic error
- rollback availability is part of the result contract

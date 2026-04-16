---
title: Non-Interactive Flows
---

# Non-Interactive Flows

This page defines the contract posture expected by automation, agent consumers, and future SDK wrappers.

## CLI expectations

```bash
pmctl bridge apply --host alpha --file desired-state.toml --json --wait
```

- `--json` returns structured output only
- `--wait` blocks until the operation reaches a terminal state or timeout
- command output must point to operation ids and rollback points instead of hiding them

## API expectations

- REST owns request / response mutation entrypoints
- SSE owns live operation progress and event stream updates
- operation ids remain the join key across CLI, API, and web views

## Failure semantics

- transport failure is not the same as degraded state
- timeout is reported explicitly rather than rewritten as a generic error
- rollback availability is part of the result contract

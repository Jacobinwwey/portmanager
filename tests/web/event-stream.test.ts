import test from 'node:test'
import assert from 'node:assert/strict'

import { eventEntryFromOperationEvent } from '../../apps/web/src/main.ts'

test('web event stream entries derive from shared operation event contract', () => {
  const entry = eventEntryFromOperationEvent({
    id: 'evt_001',
    kind: 'operation_state_changed',
    operationId: 'op_apply_001',
    operationType: 'apply_policy',
    state: 'degraded',
    level: 'warn',
    summary: 'apply_policy degraded after drift detection',
    hostId: 'host_alpha',
    ruleId: 'rule_alpha_https',
    emittedAt: '2026-04-16T18:30:00.000Z'
  })

  assert.equal(entry.id, 'evt_001')
  assert.equal(entry.level, 'warn')
  assert.equal(entry.timestamp, '18:30')
  assert.equal(entry.summary, 'apply_policy degraded after drift detection')
})

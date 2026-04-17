import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityEventHistoryFlow } from '../../scripts/milestone/verify-reliability-event-history.ts'

test('reliability event history verification proves selected operation timeline across API and CLI', async () => {
  const result = await verifyReliabilityEventHistoryFlow()

  assert.equal(result.apiEvents.items.length, 2)
  assert.equal(
    result.apiEvents.items.every((event) => event.operationId === 'op_backup_required_001'),
    true
  )
  assert.equal(result.apiEvents.items[0]?.state, 'degraded')
  assert.equal(result.apiEvents.items[1]?.state, 'running')
  assert.equal(result.cliEvents.items[0]?.operationId, 'op_backup_required_001')
  assert.equal(result.cliEvents.items[0]?.level, 'warn')
})

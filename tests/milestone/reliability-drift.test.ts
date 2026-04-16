import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityDriftFlow } from '../../scripts/milestone/verify-reliability-drift.ts'

test('reliability drift verification proves explicit degraded state across API CLI and web shell', async () => {
  const result = await verifyReliabilityDriftFlow()

  assert.equal(result.driftOperation.state, 'degraded')
  assert.equal(result.driftOperation.type, 'verify_rule')
  assert.equal(result.healthChecks.items[0]?.status, 'degraded')
  assert.equal(result.healthChecks.items[0]?.backupPolicy, 'required')
  assert.equal(result.cliHealthChecks.items[0]?.status, 'degraded')
  assert.equal(result.eventHistory.items[0]?.operationType, 'verify_rule')
  assert.equal(result.eventHistory.items[0]?.level, 'warn')
})

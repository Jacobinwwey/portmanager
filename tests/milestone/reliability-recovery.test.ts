import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityRecoveryFlow } from '../../scripts/milestone/verify-reliability-recovery.ts'

test('reliability recovery verification proves filtered inspection and CLI rollback execution', async () => {
  const result = await verifyReliabilityRecoveryFlow()

  assert.equal(result.apiBackups.items.length, 1)
  assert.equal(result.apiBackups.items[0]?.hostId, 'host_alpha')
  assert.equal(result.cliBackups.items[0]?.hostId, 'host_alpha')
  assert.equal(result.apiDiagnostics.items.length, 1)
  assert.equal(result.apiDiagnostics.items[0]?.ruleId, 'rule_alpha_https')
  assert.equal(result.cliDiagnostics.items[0]?.snapshotResult?.pageTitle, 'Alpha Relay Healthy')
  assert.equal(result.cliRollbackOperation.state, 'succeeded')
  assert.equal(result.cliRollbackOperation.rollbackPointId, result.rollbackPointId)
  assert.equal(result.apiRollbackPoints.items.length, 1)
  assert.equal(result.apiRollbackPoints.items[0]?.state, 'applied')
  assert.equal(result.cliRollbackPoints.items[0]?.id, result.rollbackPointId)
})

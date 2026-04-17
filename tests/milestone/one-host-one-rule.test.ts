import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyOneHostOneRuleFlow } from '../../scripts/milestone/verify-one-host-one-rule.ts'

test('one host bootstrap and one rule apply verification proves milestone slice', async () => {
  const result = await verifyOneHostOneRuleFlow()
  const hostId = result.bootstrapResult.hostId

  assert.equal(result.bootstrapResult.state, 'succeeded')
  assert.equal(result.applyResult.state, 'succeeded')
  assert.equal(result.runtimeState.hostId, hostId)
  assert.equal(result.runtimeState.appliedRules.length, 1)
  assert.equal(result.runtimeState.appliedRules[0]?.id, result.applyResult.ruleId)
  assert.equal(result.runtimeState.appliedRules[0]?.status, 'applied_unverified')
  assert.equal(result.cliOperation.state, 'succeeded')
  assert.equal(result.cliOperation.ruleId, result.applyResult.ruleId)
  assert.equal(result.diagnosticsOperation.state, 'succeeded')
  assert.equal(result.diagnosticsOperation.diagnosticResult?.tcpReachable, true)
  assert.equal(result.diagnosticsOperation.diagnosticResult?.httpStatus, 200)
  assert.equal(result.diagnosticsOperation.diagnosticResult?.pageTitle, 'Alpha Relay Healthy')
  assert.match(result.diagnosticsOperation.diagnosticResult?.finalUrl ?? '', /\/status$/)
  assert.equal(result.diagnosticsOperation.snapshotResult?.pageTitle, 'Alpha Relay Healthy')
  assert.equal(result.diagnosticsSnapshotArtifactExists, true)
  assert.equal(result.apiRuleDetail.lifecycleState, 'active')
  assert.equal(result.apiEventHistory.items.length >= 4, true)
  assert.equal(result.apiEventHistory.items[0]?.operationType, 'rollback')
  assert.equal(result.apiEventHistory.items[0]?.state, 'succeeded')
  assert.equal(result.apiEventHistory.items.some((item) => item.operationType === 'diagnostics'), true)
  assert.equal(result.cliEventHistory.items[0]?.operationType, 'rollback')
  assert.equal(result.cliEventHistory.items[0]?.level, 'success')
  assert.equal(result.backups.items.length >= 1, true)
  assert.equal(result.backups.items[0]?.hostId, hostId)
  assert.equal(result.backups.items[0]?.localStatus, 'succeeded')
  assert.equal(result.backups.items[0]?.remoteConfigured, false)
  assert.match(result.backups.items[0]?.remoteAction ?? '', /configure github backup/i)
  assert.equal(result.rollbackPoints.items[0]?.state, 'applied')
  assert.equal(result.rollbackOperation.state, 'succeeded')
  assert.equal(result.controllerBaseUrl.startsWith('http://127.0.0.1:'), true)
})

import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyOneHostOneRuleFlow } from '../../scripts/milestone/verify-one-host-one-rule.ts'

test('one host bootstrap and one rule apply verification proves milestone slice', async () => {
  const result = await verifyOneHostOneRuleFlow()

  assert.equal(result.bootstrapResult.state, 'succeeded')
  assert.equal(result.applyResult.state, 'succeeded')
  assert.equal(result.runtimeState.hostId, 'host_alpha')
  assert.equal(result.runtimeState.appliedRules.length, 1)
  assert.equal(result.runtimeState.appliedRules[0]?.id, 'rule_alpha_https')
  assert.equal(result.runtimeState.appliedRules[0]?.status, 'applied_unverified')
  assert.equal(result.cliOperation.state, 'succeeded')
  assert.equal(result.cliOperation.ruleId, 'rule_alpha_https')
  assert.equal(result.diagnosticsOperation.state, 'succeeded')
  assert.equal(result.diagnosticsOperation.diagnosticResult?.tcpReachable, true)
  assert.equal(result.diagnosticsOperation.diagnosticResult?.httpStatus, 200)
  assert.equal(result.diagnosticsOperation.diagnosticResult?.pageTitle, 'Alpha Relay Healthy')
  assert.match(result.diagnosticsOperation.diagnosticResult?.finalUrl ?? '', /\/status$/)
  assert.equal(result.diagnosticsOperation.snapshotResult?.pageTitle, 'Alpha Relay Healthy')
  assert.equal(result.diagnosticsSnapshotArtifactExists, true)
  assert.equal(result.backups.items.length >= 1, true)
  assert.equal(result.backups.items[0]?.hostId, 'host_alpha')
  assert.equal(result.backups.items[0]?.localStatus, 'succeeded')
  assert.equal(result.rollbackPoints.items[0]?.state, 'applied')
  assert.equal(result.rollbackOperation.state, 'succeeded')
  assert.equal(result.controllerBaseUrl.startsWith('http://127.0.0.1:'), true)
})

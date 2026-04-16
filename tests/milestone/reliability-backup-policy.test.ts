import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityBackupPolicyFlow } from '../../scripts/milestone/verify-reliability-backup-policy.ts'

test('reliability backup policy verification proves best_effort and required behave differently', async () => {
  const result = await verifyReliabilityBackupPolicyFlow()

  assert.equal(result.bestEffortOperation.state, 'succeeded')
  assert.match(result.bestEffortOperation.resultSummary ?? '', /best_effort/i)
  assert.equal(result.requiredOperation.state, 'degraded')
  assert.match(result.requiredOperation.resultSummary ?? '', /required/i)
  assert.equal(result.apiBackups.items.length, 2)
  assert.equal(result.apiBackups.items[0]?.backupMode, 'required')
  assert.equal(result.apiBackups.items[0]?.githubStatus, 'not_configured')
  assert.equal(result.apiBackups.items[1]?.backupMode, 'best_effort')
  assert.equal(result.cliBackups.items[0]?.backupMode, 'required')
  assert.equal(result.cliBackups.items[1]?.backupMode, 'best_effort')
})

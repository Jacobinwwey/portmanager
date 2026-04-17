import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityGitHubBackupFlow } from '../../scripts/milestone/verify-reliability-github-backup.ts'

test('reliability github backup verification proves configured remote backup succeeds across API and CLI', async () => {
  const result = await verifyReliabilityGitHubBackupFlow()

  assert.equal(result.requiredOperation.state, 'succeeded')
  assert.match(result.requiredOperation.resultSummary ?? '', /github backup uploaded/i)
  assert.equal(result.apiBackups.items[0]?.githubStatus, 'succeeded')
  assert.equal(result.apiBackups.items[0]?.remoteConfigured, true)
  assert.match(result.apiBackups.items[0]?.remoteStatusSummary ?? '', /remote redundancy is available/i)
  assert.match(result.apiBackups.items[0]?.remoteAction ?? '', /no remote action required/i)
  assert.equal(result.cliBackups.items[0]?.githubStatus, 'succeeded')
  assert.equal(result.cliBackups.items[0]?.remoteConfigured, true)
})

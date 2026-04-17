import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityRemoteBackupReplayFlow } from '../../scripts/milestone/verify-reliability-remote-backup-replay.ts'

test('reliability remote-backup replay proves configured failed and local-only states stay aligned across API CLI web and agent', async () => {
  const result = await verifyReliabilityRemoteBackupReplayFlow()

  assert.equal(result.localOnly.runtimeState.agentState, 'ready')
  assert.equal(result.localOnly.backupOperation.state, 'degraded')
  assert.equal(result.localOnly.apiBackups.items[0]?.githubStatus, 'not_configured')
  assert.equal(result.localOnly.cliBackups.items[0]?.githubStatus, 'not_configured')
  assert.match(result.localOnly.backupsPageHtml, /configure github backup/i)
  assert.match(result.localOnly.apiEvents.items[0]?.summary ?? '', /required GitHub backup is not configured/i)
  assert.match(result.localOnly.cliEvents.items[0]?.summary ?? '', /required GitHub backup is not configured/i)

  assert.equal(result.configuredSuccess.runtimeState.agentState, 'ready')
  assert.equal(result.configuredSuccess.backupOperation.state, 'succeeded')
  assert.equal(result.configuredSuccess.apiBackups.items[0]?.githubStatus, 'succeeded')
  assert.equal(result.configuredSuccess.cliBackups.items[0]?.githubStatus, 'succeeded')
  assert.match(result.configuredSuccess.backupsPageHtml, /remote redundancy is available/i)
  assert.match(result.configuredSuccess.apiEvents.items[0]?.summary ?? '', /GitHub backup uploaded/i)
  assert.match(result.configuredSuccess.cliEvents.items[0]?.summary ?? '', /GitHub backup uploaded/i)

  assert.equal(result.configuredFailure.runtimeState.agentState, 'ready')
  assert.equal(result.configuredFailure.backupOperation.state, 'degraded')
  assert.equal(result.configuredFailure.apiBackups.items[0]?.githubStatus, 'failed')
  assert.equal(result.configuredFailure.cliBackups.items[0]?.githubStatus, 'failed')
  assert.match(result.configuredFailure.backupsPageHtml, /remote redundancy is missing/i)
  assert.match(result.configuredFailure.backupsPageHtml, /inspect github backup credentials/i)
  assert.match(result.configuredFailure.apiEvents.items[0]?.summary ?? '', /GitHub backup upload failed/i)
  assert.match(result.configuredFailure.cliEvents.items[0]?.summary ?? '', /GitHub backup upload failed/i)
})

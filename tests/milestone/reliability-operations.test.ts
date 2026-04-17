import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyReliabilityOperationsFlow } from '../../scripts/milestone/verify-reliability-operations.ts'

test('reliability operations verification proves filtered operation inventory across API and CLI', async () => {
  const result = await verifyReliabilityOperationsFlow()

  assert.equal(result.apiOperations.items.length, 1)
  assert.equal(result.apiOperations.items[0]?.state, 'degraded')
  assert.equal(result.apiOperations.items[0]?.backupId, 'backup_alpha_002')
  assert.equal(result.apiOperations.items[0]?.rollbackPointId, 'rp_alpha_002')
  assert.equal(result.cliOperations.items[0]?.id, result.apiOperations.items[0]?.id)
  assert.match(result.cliOperations.items[0]?.resultSummary ?? '', /required github backup is not configured/i)
  assert.equal(
    result.apiOperationDetail.eventStreamUrl,
    `/operations/events?operationId=${result.apiOperationDetail.id}`
  )
  assert.equal(
    result.cliOperationDetail.eventStreamUrl,
    result.apiOperationDetail.eventStreamUrl
  )
  assert.equal(result.cliOperationDetail.backupId, result.apiOperationDetail.backupId)
  assert.equal(
    result.cliOperationDetail.rollbackPointId,
    result.apiOperationDetail.rollbackPointId
  )
})

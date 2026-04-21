import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildConsumerBoundaryDecisionPack,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-consumer-boundary-decision-pack-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('consumer boundary decision pack keeps routing embedded while split criteria stay missing', () => {
  const pack = buildConsumerBoundaryDecisionPack({
    boundaryPath: '/api/controller',
    hostingMode: 'controller_embedded',
    reviewOwner: 'controller',
    sharedContractParity: true,
    prefixedBoundaryPublished: true,
    legacyAliasCompatibility: true,
    standaloneDeploymentBoundary: false,
    dedicatedEdgePolicyLayer: false,
    splitOwnershipDefined: false,
    externalConsumerPressure: false
  })

  assert.equal(pack.decisionState, 'hold')
  assert.equal(pack.splitReviewRequired, false)
  assert.equal(pack.boundaryPath, '/api/controller')
  assert.equal(pack.hostingMode, 'controller_embedded')
  assert.equal(pack.reviewOwner, 'controller')
  assert.match(pack.summary, /remain inside controller/i)
  assert.equal(pack.satisfiedCriteria[0]?.id, 'shared_contract_parity')
  assert.equal(pack.blockingCriteria[0]?.id, 'standalone_deployment_boundary')
  assert.equal(pack.nextActions.length >= 2, true)
})

test('consumer boundary decision pack requires split review when standalone criteria and pressure align', () => {
  const pack = buildConsumerBoundaryDecisionPack({
    boundaryPath: '/api/controller',
    hostingMode: 'controller_embedded',
    reviewOwner: 'controller',
    sharedContractParity: true,
    prefixedBoundaryPublished: true,
    legacyAliasCompatibility: true,
    standaloneDeploymentBoundary: true,
    dedicatedEdgePolicyLayer: true,
    splitOwnershipDefined: true,
    externalConsumerPressure: true
  })

  assert.equal(pack.decisionState, 'review_required')
  assert.equal(pack.splitReviewRequired, true)
  assert.match(pack.summary, /split review required/i)
  assert.equal(pack.blockingCriteria.length, 0)
  assert.equal(pack.satisfiedCriteria.some((criterion) => criterion.id === 'external_consumer_pressure'), true)
})

test('controller server exposes consumer boundary decision pack as explicit controller contract', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus })
    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/consumer-boundary-decision-pack`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        boundaryPath: string
        hostingMode: string
        reviewOwner: string
        decisionState: string
        splitReviewRequired: boolean
        summary: string
        nextActions: string[]
        satisfiedCriteria: Array<{ id: string; label: string }>
        blockingCriteria: Array<{ id: string; label: string }>
      }

      assert.equal(payload.boundaryPath, '/api/controller')
      assert.equal(payload.hostingMode, 'controller_embedded')
      assert.equal(payload.reviewOwner, 'controller')
      assert.equal(payload.decisionState, 'hold')
      assert.equal(payload.splitReviewRequired, false)
      assert.match(payload.summary, /inside controller/i)
      assert.equal(payload.nextActions.length >= 2, true)
      assert.equal(payload.satisfiedCriteria.some((criterion) => criterion.id === 'prefixed_boundary'), true)
      assert.equal(
        payload.blockingCriteria.some((criterion) => criterion.id === 'standalone_deployment_boundary'),
        true
      )
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildDeploymentBoundaryDecisionPack,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-deployment-boundary-decision-pack-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('deployment boundary decision pack keeps standalone deployment review on hold while boundary evidence is missing', () => {
  const pack = buildDeploymentBoundaryDecisionPack({
    boundaryTarget: '/api/controller',
    deploymentMode: 'controller_embedded',
    reviewOwner: 'controller',
    sharedConsumerContract: true,
    auditReviewOwnerDefined: true,
    rollbackEvidenceBaseline: true,
    independentDeployableArtifact: false,
    edgeRuntimeControls: false,
    standaloneReplayParity: false,
    observabilityBoundaryDefined: false,
    externalScalePressure: false
  })

  assert.equal(pack.decisionState, 'hold')
  assert.equal(pack.standaloneReviewRequired, false)
  assert.equal(pack.boundaryTarget, '/api/controller')
  assert.equal(pack.deploymentMode, 'controller_embedded')
  assert.equal(pack.reviewOwner, 'controller')
  assert.match(pack.summary, /remain controller-embedded/i)
  assert.equal(pack.satisfiedCriteria[0]?.id, 'shared_consumer_contract')
  assert.equal(pack.blockingCriteria[0]?.id, 'independent_deployable_artifact')
  assert.equal(pack.nextActions.length >= 2, true)
})

test('deployment boundary decision pack requires standalone review when deployability evidence and pressure align', () => {
  const pack = buildDeploymentBoundaryDecisionPack({
    boundaryTarget: '/api/controller',
    deploymentMode: 'controller_embedded',
    reviewOwner: 'controller',
    sharedConsumerContract: true,
    auditReviewOwnerDefined: true,
    rollbackEvidenceBaseline: true,
    independentDeployableArtifact: true,
    edgeRuntimeControls: true,
    standaloneReplayParity: true,
    observabilityBoundaryDefined: true,
    externalScalePressure: true
  })

  assert.equal(pack.decisionState, 'review_required')
  assert.equal(pack.standaloneReviewRequired, true)
  assert.match(pack.summary, /standalone deployment review required/i)
  assert.equal(pack.blockingCriteria.length, 0)
  assert.equal(pack.satisfiedCriteria.some((criterion) => criterion.id === 'external_scale_pressure'), true)
})

test('controller server exposes deployment boundary decision pack as explicit controller contract', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus })
    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/deployment-boundary-decision-pack`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        boundaryTarget: string
        deploymentMode: string
        reviewOwner: string
        decisionState: string
        standaloneReviewRequired: boolean
        summary: string
        nextActions: string[]
        satisfiedCriteria: Array<{ id: string; label: string }>
        blockingCriteria: Array<{ id: string; label: string }>
      }

      assert.equal(payload.boundaryTarget, '/api/controller')
      assert.equal(payload.deploymentMode, 'controller_embedded')
      assert.equal(payload.reviewOwner, 'controller')
      assert.equal(payload.decisionState, 'hold')
      assert.equal(payload.standaloneReviewRequired, false)
      assert.match(payload.summary, /controller-embedded/i)
      assert.equal(payload.nextActions.length >= 2, true)
      assert.equal(payload.satisfiedCriteria.some((criterion) => criterion.id === 'audit_review_owner'), true)
      assert.equal(
        payload.blockingCriteria.some((criterion) => criterion.id === 'independent_deployable_artifact'),
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

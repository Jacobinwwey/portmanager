import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildSecondTargetPolicyPack,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-second-target-policy-pack-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

test('second target policy pack keeps expansion review on hold while only locked Ubuntu target is supported', () => {
  const pack = buildSecondTargetPolicyPack({
    lockedTargetProfileId: 'ubuntu-24.04-systemd-tailscale',
    reviewOwner: 'controller',
    supportedTargetProfiles: [
      {
        id: 'ubuntu-24.04-systemd-tailscale',
        label: 'Ubuntu 24.04 + systemd + Tailscale',
        status: 'supported'
      }
    ],
    candidateTargetProfiles: [
      {
        id: 'debian-12-systemd-tailscale',
        label: 'Debian 12 + systemd + Tailscale',
        status: 'candidate'
      }
    ],
    candidateTargetProfileIds: ['debian-12-systemd-tailscale'],
    targetRegistryPublished: true,
    bootstrapTransportParity: false,
    steadyStateTransportParity: false,
    backupRestoreParity: false,
    diagnosticsParity: false,
    rollbackParity: false,
    docsContractReady: false,
    acceptanceRecipeReady: false,
    operatorOwnershipDefined: false
  })

  assert.equal(pack.decisionState, 'hold')
  assert.equal(pack.expansionReviewRequired, false)
  assert.equal(pack.lockedTargetProfileId, 'ubuntu-24.04-systemd-tailscale')
  assert.equal(pack.reviewOwner, 'controller')
  assert.equal(pack.supportedTargetProfiles.length, 1)
  assert.equal(pack.candidateTargetProfiles.length, 1)
  assert.deepEqual(pack.candidateTargetProfileIds, ['debian-12-systemd-tailscale'])
  assert.match(pack.summary, /stay on hold/i)
  assert.equal(pack.satisfiedCriteria[0]?.id, 'locked_target_registry')
  assert.equal(pack.satisfiedCriteria.some((criterion) => criterion.id === 'candidate_target_declared'), true)
  assert.equal(pack.blockingCriteria[0]?.id, 'bootstrap_transport_parity')
  assert.equal(pack.nextActions.length >= 2, true)
})

test('second target policy pack requires expansion review when candidate, parity, and governance evidence align', () => {
  const pack = buildSecondTargetPolicyPack({
    lockedTargetProfileId: 'ubuntu-24.04-systemd-tailscale',
    reviewOwner: 'controller',
    supportedTargetProfiles: [
      {
        id: 'ubuntu-24.04-systemd-tailscale',
        label: 'Ubuntu 24.04 + systemd + Tailscale',
        status: 'supported'
      }
    ],
    candidateTargetProfiles: [
      {
        id: 'debian-12-systemd-tailscale',
        label: 'Debian 12 + systemd + Tailscale',
        status: 'candidate'
      }
    ],
    candidateTargetProfileIds: ['debian-12-systemd-tailscale'],
    targetRegistryPublished: true,
    bootstrapTransportParity: true,
    steadyStateTransportParity: true,
    backupRestoreParity: true,
    diagnosticsParity: true,
    rollbackParity: true,
    docsContractReady: true,
    acceptanceRecipeReady: true,
    operatorOwnershipDefined: true
  })

  assert.equal(pack.decisionState, 'review_required')
  assert.equal(pack.expansionReviewRequired, true)
  assert.match(pack.summary, /review required/i)
  assert.equal(pack.blockingCriteria.length, 0)
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'operator_ownership_defined'),
    true
  )
})

test('controller server exposes second target policy pack as explicit controller contract', async () => {
  const { directory, databasePath } = tempDbPath()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus })
    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/second-target-policy-pack`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        lockedTargetProfileId: string
        reviewOwner: string
        supportedTargetProfiles: Array<{ id: string; status: string }>
        candidateTargetProfiles: Array<{ id: string; label: string; status: string }>
        candidateTargetProfileIds: string[]
        decisionState: string
        expansionReviewRequired: boolean
        summary: string
        nextActions: string[]
        satisfiedCriteria: Array<{ id: string; label: string }>
        blockingCriteria: Array<{ id: string; label: string }>
      }

      assert.equal(payload.lockedTargetProfileId, 'ubuntu-24.04-systemd-tailscale')
      assert.equal(payload.reviewOwner, 'controller')
      assert.equal(payload.supportedTargetProfiles.length, 1)
      assert.equal(payload.supportedTargetProfiles[0]?.id, 'ubuntu-24.04-systemd-tailscale')
      assert.equal(payload.supportedTargetProfiles[0]?.status, 'supported')
      assert.equal(payload.candidateTargetProfiles.length, 1)
      assert.equal(payload.candidateTargetProfiles[0]?.id, 'debian-12-systemd-tailscale')
      assert.equal(payload.candidateTargetProfiles[0]?.status, 'candidate')
      assert.deepEqual(payload.candidateTargetProfileIds, ['debian-12-systemd-tailscale'])
      assert.equal(payload.decisionState, 'hold')
      assert.equal(payload.expansionReviewRequired, false)
      assert.match(payload.summary, /stay on hold/i)
      assert.equal(payload.nextActions.length >= 2, true)
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'locked_target_registry'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'candidate_target_declared'),
        true
      )
      assert.equal(
        payload.blockingCriteria.some((criterion) => criterion.id === 'bootstrap_transport_parity'),
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

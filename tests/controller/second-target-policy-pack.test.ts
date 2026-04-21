import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildSecondTargetPolicyPack,
  createControllerEventBus,
  createDefaultSecondTargetPolicySnapshot,
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

test('default second target policy pack lands governance artifacts while transport parity stays pending', () => {
  const pack = buildSecondTargetPolicyPack(createDefaultSecondTargetPolicySnapshot())

  assert.equal(pack.decisionState, 'hold')
  assert.equal(pack.expansionReviewRequired, false)
  assert.equal(pack.reviewPacketTemplate.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.reviewPacketTemplate.templatePath,
    /docs\/operations\/portmanager-debian-12-review-packet-template\.md/u
  )
  assert.equal(pack.reviewPacketTemplate.requiredEvidence.length >= 5, true)
  assert.equal(pack.bootstrapProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.bootstrapProofCapture.guidePath,
    /docs\/operations\/portmanager-debian-12-bootstrap-proof-capture\.md/u
  )
  assert.equal(pack.bootstrapProofCapture.requiredArtifacts.length >= 4, true)
  assert.equal(
    pack.bootstrapProofCapture.requiredArtifacts.some(
      (item) =>
        item.id === 'bootstrap_operation_id' &&
        item.summary.includes('bootstrap operation id')
    ),
    true
  )
  assert.equal(
    pack.bootstrapProofCapture.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-debian-12-bootstrap-proof-capture.md')
    ),
    true
  )
  assert.equal(pack.steadyStateProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.steadyStateProofCapture.guidePath,
    /docs\/operations\/portmanager-debian-12-steady-state-proof-capture\.md/u
  )
  assert.equal(pack.steadyStateProofCapture.requiredArtifacts.length >= 4, true)
  assert.equal(
    pack.steadyStateProofCapture.requiredArtifacts.some(
      (item) =>
        item.id === 'health_capture' && item.summary.includes('/health')
    ),
    true
  )
  assert.equal(
    pack.steadyStateProofCapture.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-debian-12-steady-state-proof-capture.md')
    ),
    true
  )
  assert.equal(pack.backupRestoreProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.backupRestoreProofCapture.guidePath,
    /docs\/operations\/portmanager-debian-12-backup-restore-proof-capture\.md/u
  )
  assert.equal(pack.backupRestoreProofCapture.requiredArtifacts.length >= 4, true)
  assert.equal(
    pack.backupRestoreProofCapture.requiredArtifacts.some(
      (item) =>
        item.id === 'backup_manifest_path' && item.summary.includes('manifest')
    ),
    true
  )
  assert.equal(
    pack.backupRestoreProofCapture.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-debian-12-backup-restore-proof-capture.md')
    ),
    true
  )
  assert.equal(pack.diagnosticsProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.diagnosticsProofCapture.guidePath,
    /docs\/operations\/portmanager-debian-12-diagnostics-proof-capture\.md/u
  )
  assert.equal(pack.diagnosticsProofCapture.requiredArtifacts.length >= 4, true)
  assert.equal(
    pack.diagnosticsProofCapture.requiredArtifacts.some(
      (item) =>
        item.id === 'diagnostics_artifact_paths' && item.summary.includes('artifact')
    ),
    true
  )
  assert.equal(
    pack.diagnosticsProofCapture.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-debian-12-diagnostics-proof-capture.md')
    ),
    true
  )
  assert.equal(pack.rollbackProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.rollbackProofCapture.guidePath,
    /docs\/operations\/portmanager-debian-12-rollback-proof-capture\.md/u
  )
  assert.equal(pack.rollbackProofCapture.requiredArtifacts.length >= 4, true)
  assert.equal(
    pack.rollbackProofCapture.requiredArtifacts.some(
      (item) =>
        item.id === 'rollback_operation_id' && item.summary.includes('rollback operation')
    ),
    true
  )
  assert.equal(
    pack.rollbackProofCapture.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-debian-12-rollback-proof-capture.md')
    ),
    true
  )
  assert.equal(
    pack.reviewPacketTemplate.requiredEvidence.some(
      (item) =>
        item.criterionId === 'bootstrap_transport_parity' &&
        item.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-review-packet-template.md')
        )
    ),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'docs_contract_ready'),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'acceptance_recipe_ready'),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'operator_ownership_defined'),
    true
  )
  assert.equal(
    pack.blockingCriteria.some((criterion) => criterion.id === 'bootstrap_transport_parity'),
    true
  )
  assert.equal(
    pack.evidenceItems.some(
      (item) =>
        item.criterionId === 'acceptance_recipe_ready' &&
        item.state === 'landed' &&
        item.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-acceptance-recipe.md')
        )
    ),
    true
  )
  assert.equal(
    pack.evidenceItems.some(
      (item) =>
        item.criterionId === 'bootstrap_transport_parity' &&
        item.state === 'review_prep' &&
        item.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-review-packet-template.md')
        )
    ),
    true
  )
  assert.match(pack.summary, /bootstrap transport parity/i)
  assert.doesNotMatch(pack.summary, /docs contract ready/i)
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
        reviewPacketTemplate: {
          candidateTargetProfileId: string
          templatePath: string
          summary: string
          requiredEvidence: Array<{
            criterionId: string
            label: string
            summary: string
            sources: string[]
          }>
        }
        bootstrapProofCapture: {
          candidateTargetProfileId: string
          guidePath: string
          summary: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
        steadyStateProofCapture: {
          candidateTargetProfileId: string
          guidePath: string
          summary: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
        backupRestoreProofCapture: {
          candidateTargetProfileId: string
          guidePath: string
          summary: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
        diagnosticsProofCapture: {
          candidateTargetProfileId: string
          guidePath: string
          summary: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
        rollbackProofCapture: {
          candidateTargetProfileId: string
          guidePath: string
          summary: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
        satisfiedCriteria: Array<{ id: string; label: string }>
        blockingCriteria: Array<{ id: string; label: string }>
        evidenceItems: Array<{
          criterionId: string
          label: string
          state: string
          summary: string
          sources: string[]
        }>
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
      assert.equal(payload.reviewPacketTemplate.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.reviewPacketTemplate.templatePath,
        /docs\/operations\/portmanager-debian-12-review-packet-template\.md/u
      )
      assert.equal(payload.reviewPacketTemplate.requiredEvidence.length >= 5, true)
      assert.equal(payload.bootstrapProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.bootstrapProofCapture.guidePath,
        /docs\/operations\/portmanager-debian-12-bootstrap-proof-capture\.md/u
      )
      assert.equal(payload.bootstrapProofCapture.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.bootstrapProofCapture.requiredArtifacts.some(
          (item) => item.id === 'bootstrap_operation_id'
        ),
        true
      )
      assert.equal(
        payload.bootstrapProofCapture.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-bootstrap-proof-capture.md')
        ),
        true
      )
      assert.equal(payload.steadyStateProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.steadyStateProofCapture.guidePath,
        /docs\/operations\/portmanager-debian-12-steady-state-proof-capture\.md/u
      )
      assert.equal(payload.steadyStateProofCapture.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.steadyStateProofCapture.requiredArtifacts.some(
          (item) => item.id === 'health_capture'
        ),
        true
      )
      assert.equal(
        payload.steadyStateProofCapture.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-steady-state-proof-capture.md')
        ),
        true
      )
      assert.equal(payload.backupRestoreProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.backupRestoreProofCapture.guidePath,
        /docs\/operations\/portmanager-debian-12-backup-restore-proof-capture\.md/u
      )
      assert.equal(payload.backupRestoreProofCapture.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.backupRestoreProofCapture.requiredArtifacts.some(
          (item) => item.id === 'backup_manifest_path'
        ),
        true
      )
      assert.equal(
        payload.backupRestoreProofCapture.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-backup-restore-proof-capture.md')
        ),
        true
      )
      assert.equal(payload.diagnosticsProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.diagnosticsProofCapture.guidePath,
        /docs\/operations\/portmanager-debian-12-diagnostics-proof-capture\.md/u
      )
      assert.equal(payload.diagnosticsProofCapture.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.diagnosticsProofCapture.requiredArtifacts.some(
          (item) => item.id === 'diagnostics_artifact_paths'
        ),
        true
      )
      assert.equal(
        payload.diagnosticsProofCapture.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-diagnostics-proof-capture.md')
        ),
        true
      )
      assert.equal(payload.rollbackProofCapture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
      assert.match(
        payload.rollbackProofCapture.guidePath,
        /docs\/operations\/portmanager-debian-12-rollback-proof-capture\.md/u
      )
      assert.equal(payload.rollbackProofCapture.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.rollbackProofCapture.requiredArtifacts.some(
          (item) => item.id === 'rollback_operation_id'
        ),
        true
      )
      assert.equal(
        payload.rollbackProofCapture.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-rollback-proof-capture.md')
        ),
        true
      )
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
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'docs_contract_ready'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'acceptance_recipe_ready'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'operator_ownership_defined'),
        true
      )
      assert.equal(
        payload.blockingCriteria.some((criterion) => criterion.id === 'bootstrap_transport_parity'),
        true
      )
      assert.equal(payload.evidenceItems.length >= 8, true)
      assert.equal(
        payload.evidenceItems.some(
          (item) =>
            item.criterionId === 'operator_ownership_defined' &&
            item.state === 'landed' &&
            item.sources.some((source) =>
              source.endsWith('docs/operations/portmanager-debian-12-operator-ownership.md')
            )
        ),
        true
      )
      assert.equal(
        payload.reviewPacketTemplate.requiredEvidence.some(
          (item) =>
            item.criterionId === 'bootstrap_transport_parity' &&
            item.sources.some((source) =>
              source.endsWith('docs/operations/portmanager-debian-12-review-packet-template.md')
            )
        ),
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

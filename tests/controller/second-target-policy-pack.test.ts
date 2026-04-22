import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  buildSecondTargetPolicyPack,
  createControllerEventBus,
  createDefaultSecondTargetPolicySnapshot,
  createControllerServer,
  createOperationStore,
  liveTransportFollowUpArtifactFiles,
  liveTransportFollowUpScaffoldMarkerField
} from '../../apps/controller/src/index.ts'

function tempDbPath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-second-target-policy-pack-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

function tempRepoRoot() {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-discovery-'))
  mkdirSync(path.join(repoRoot, 'docs', 'operations', 'artifacts'), { recursive: true })
  return repoRoot
}

function writeLiveTransportFollowUpPacket(
  repoRoot: string,
  packetDirectoryName: string,
  options: {
    capturedAt?: string
    capturedAddress: string
    requiredArtifactIds?: string[]
    artifactFileIds?: string[]
    candidateTargetProfileId?: string
  }
) {
  const packetRoot = path.join(repoRoot, 'docs', 'operations', 'artifacts', packetDirectoryName)
  mkdirSync(packetRoot, { recursive: true })

  const artifactIds = options.artifactFileIds ?? [
    'candidate_host_with_tailscale_ip',
    'bootstrap_operation_with_tailscale_transport',
    'steady_state_health_with_tailscale_transport',
    'steady_state_runtime_state_with_tailscale_transport',
    'linked_controller_audit_reference'
  ]
  const artifactFiles = Object.fromEntries(
    artifactIds.map((artifactId) => {
      const filename = `${artifactId}.json`
      writeFileSync(
        path.join(packetRoot, filename),
        JSON.stringify({ artifactId, packetDirectoryName }, null, 2)
      )
      return [artifactId, filename]
    })
  )

  writeFileSync(
    path.join(packetRoot, 'live-transport-follow-up-summary.json'),
    JSON.stringify(
      {
        candidateTargetProfileId: options.candidateTargetProfileId ?? 'debian-12-systemd-tailscale',
        capturedAt: options.capturedAt ?? '2026-04-21T18:00:00.000Z',
        capturedAddress: options.capturedAddress,
        requiredArtifactIds: options.requiredArtifactIds ?? artifactIds,
        artifactFiles
      },
      null,
      2
    )
  )

  return path.posix.join('docs', 'operations', 'artifacts', packetDirectoryName)
}

function writeScaffoldLiveTransportFollowUpPacket(
  repoRoot: string,
  packetDirectoryName: string,
  options: {
    capturedAt?: string
    capturedAddress?: string
    requiredArtifactIds?: string[]
  } = {}
) {
  const packetRoot = path.join(repoRoot, 'docs', 'operations', 'artifacts', packetDirectoryName)
  mkdirSync(packetRoot, { recursive: true })

  const artifactFiles = Object.fromEntries(
    Object.entries(liveTransportFollowUpArtifactFiles).map(([artifactId, filename]) => {
      writeFileSync(
        path.join(packetRoot, filename),
        JSON.stringify(
          {
            [liveTransportFollowUpScaffoldMarkerField]: true,
            artifactId,
            packetDirectoryName,
            status: 'replace_with_real_capture'
          },
          null,
          2
        )
      )
      return [artifactId, filename]
    })
  )

  writeFileSync(
    path.join(packetRoot, 'live-transport-follow-up-summary.json'),
    JSON.stringify(
      {
        [liveTransportFollowUpScaffoldMarkerField]: true,
        candidateTargetProfileId: 'debian-12-systemd-tailscale',
        capturedAt: options.capturedAt ?? '2026-04-24T08:00:00.000Z',
        capturedAddress: options.capturedAddress ?? '100.91.22.18',
        requiredArtifactIds:
          options.requiredArtifactIds ?? Object.keys(liveTransportFollowUpArtifactFiles),
        artifactFiles
      },
      null,
      2
    )
  )

  return path.posix.join('docs', 'operations', 'artifacts', packetDirectoryName)
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
  assert.match(pack.summary, /bounded second-target review is open now/i)
  assert.equal(pack.blockingCriteria.length, 0)
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'operator_ownership_defined'),
    true
  )
})

test('default second target policy pack preserves a complete review packet and opens bounded second-target review', () => {
  const pack = buildSecondTargetPolicyPack(createDefaultSecondTargetPolicySnapshot())

  assert.equal(pack.decisionState, 'review_required')
  assert.equal(pack.expansionReviewRequired, true)
  assert.equal(pack.reviewPacketReadiness.state, 'packet_ready')
  assert.equal(pack.reviewPacketReadiness.guideCoverage.available, 6)
  assert.equal(pack.reviewPacketReadiness.guideCoverage.expected, 6)
  assert.deepEqual(pack.reviewPacketReadiness.guideCoverage.missingPaths, [])
  assert.equal(pack.reviewPacketReadiness.artifactCoverage.available, 20)
  assert.equal(pack.reviewPacketReadiness.artifactCoverage.expected, 20)
  assert.deepEqual(pack.reviewPacketReadiness.artifactCoverage.missingArtifactIds, [])
  assert.match(
    pack.reviewPacketReadiness.summary,
    /artifact coverage is complete/i
  )
  assert.match(
    pack.reviewPacketReadiness.requiredNextAction,
    /Adjudicate bounded second-target review/i
  )
  assert.equal(pack.reviewPacketReadiness.nextExecutionUnits.length, 0)
  assert.equal(pack.reviewAdjudication.state, 'review_open')
  assert.equal(pack.reviewAdjudication.reviewOwner, 'controller')
  assert.equal(pack.reviewAdjudication.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.match(
    pack.reviewAdjudication.contractPath,
    /docs\/operations\/portmanager-second-target-review-contract\.md/u
  )
  assert.match(
    pack.reviewAdjudication.packetRoot,
    /docs\/operations\/artifacts\/debian-12-bootstrap-packet-2026-04-21/u
  )
  assert.match(pack.reviewAdjudication.summary, /bounded second-target review is open/i)
  assert.equal(pack.reviewAdjudication.pendingVerdicts.length, 5)
  assert.equal(pack.reviewAdjudication.blockingDeltas.length, 1)
  assert.equal(
    pack.reviewAdjudication.blockingDeltas[0]?.id,
    'container_bridge_transport_substitution'
  )
  assert.equal(
    pack.reviewAdjudication.blockingDeltas[0]?.state,
    'blocking'
  )
  assert.match(
    pack.reviewAdjudication.blockingDeltas[0]?.summary ?? '',
    /172\.17\.0\.2/
  )
  assert.match(
    pack.reviewAdjudication.blockingDeltas[0]?.requiredFollowUp ?? '',
    /live Tailscale-backed bounded packet/i
  )
  assert.equal(
    pack.reviewAdjudication.pendingVerdicts.some(
      (item) =>
        item.id === 'operator_signoff' &&
        item.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-operator-ownership.md')
        )
    ),
    true
  )
  assert.equal(
    pack.reviewAdjudication.blockingDeltas.some(
      (item) =>
        item.id === 'container_bridge_transport_substitution' &&
        item.sources.some((source) =>
          source.endsWith(
            'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/bootstrap-capture-summary.json'
          )
        )
    ),
    true
  )
  assert.equal(
    pack.reviewAdjudication.sources.some((source) =>
      source.endsWith('docs/operations/portmanager-second-target-review-contract.md')
    ),
    true
  )
  assert.equal(pack.liveTransportFollowUp.capturedPacketRoot, undefined)
  assert.equal(pack.liveTransportFollowUp.capturedAddress, undefined)
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
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'bootstrap_transport_parity'),
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
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'steady_state_transport_parity'),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'backup_restore_parity'),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'diagnostics_parity'),
    true
  )
  assert.equal(
    pack.satisfiedCriteria.some((criterion) => criterion.id === 'rollback_parity'),
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
        item.criterionId === 'steady_state_transport_parity' &&
        item.state === 'landed' &&
        item.sources.some((source) =>
          source.endsWith(
            'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-capture-summary.json'
          )
        )
    ),
    true
  )
  assert.equal(
    pack.evidenceItems.some(
      (item) =>
        item.criterionId === 'diagnostics_parity' &&
        item.state === 'landed' &&
        item.sources.some((source) =>
          source.endsWith(
            'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json'
          )
        )
    ),
    true
  )
  assert.equal(
    pack.evidenceItems.some(
      (item) =>
        item.criterionId === 'rollback_parity' &&
        item.state === 'landed' &&
        item.sources.some((source) =>
          source.endsWith(
            'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-capture-summary.json'
          )
        )
    ),
    true
  )
  assert.match(pack.summary, /bounded second-target review is open now/i)
  assert.match(pack.nextActions[0] ?? '', /Work through bounded second-target review/i)
})

test('second target policy pack clears transport blocking delta when live tailscale follow-up packet is complete', () => {
  const pack = buildSecondTargetPolicyPack({
    ...createDefaultSecondTargetPolicySnapshot(),
    liveTransportCaptureArtifactRoot:
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-22',
    liveTransportCapturedAddress: '100.91.22.14',
    liveTransportCapturedArtifactIds: [
      'candidate_host_with_tailscale_ip',
      'bootstrap_operation_with_tailscale_transport',
      'steady_state_health_with_tailscale_transport',
      'steady_state_runtime_state_with_tailscale_transport',
      'linked_controller_audit_reference'
    ]
  })

  assert.equal(pack.reviewAdjudication.state, 'review_open')
  assert.equal(pack.reviewAdjudication.blockingDeltas.length, 0)
  assert.match(pack.reviewAdjudication.summary, /live Tailscale follow-up is now preserved/i)
  assert.equal(
    pack.reviewAdjudication.sources.includes(
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-22'
    ),
    true
  )
  assert.equal(pack.liveTransportFollowUp.state, 'capture_complete')
  assert.equal(
    pack.liveTransportFollowUp.capturedPacketRoot,
    'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-22'
  )
  assert.equal(pack.liveTransportFollowUp.capturedAddress, '100.91.22.14')
  assert.match(pack.liveTransportFollowUp.summary, /100\.91\.22\.14/)
  assert.match(pack.liveTransportFollowUp.requiredNextAction, /captured packet/u)
  assert.equal(
    pack.liveTransportFollowUp.sources.includes(
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-22'
    ),
    true
  )
})

test('default second target policy snapshot discovers newest valid live tailscale packet from repo artifacts', () => {
  const repoRoot = tempRepoRoot()

  try {
    writeLiveTransportFollowUpPacket(repoRoot, 'debian-12-live-tailscale-packet-2026-04-22', {
      capturedAt: '2026-04-22T08:00:00.000Z',
      capturedAddress: '100.91.22.14'
    })
    const newestPacketRoot = writeLiveTransportFollowUpPacket(
      repoRoot,
      'debian-12-live-tailscale-packet-2026-04-23',
      {
        capturedAt: '2026-04-23T08:00:00.000Z',
        capturedAddress: '100.91.22.15'
      }
    )

    const pack = buildSecondTargetPolicyPack(
      createDefaultSecondTargetPolicySnapshot({ repoRoot })
    )

    assert.equal(pack.liveTransportFollowUp.state, 'capture_complete')
    assert.equal(pack.liveTransportFollowUp.capturedPacketRoot, newestPacketRoot)
    assert.equal(pack.liveTransportFollowUp.capturedAddress, '100.91.22.15')
    assert.equal(pack.reviewAdjudication.blockingDeltas.length, 0)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('default second target policy snapshot falls back to newest valid live tailscale packet when latest root is incomplete', () => {
  const repoRoot = tempRepoRoot()

  try {
    const validPacketRoot = writeLiveTransportFollowUpPacket(
      repoRoot,
      'debian-12-live-tailscale-packet-2026-04-22',
      {
        capturedAt: '2026-04-22T08:00:00.000Z',
        capturedAddress: '100.91.22.14'
      }
    )
    writeLiveTransportFollowUpPacket(repoRoot, 'debian-12-live-tailscale-packet-2026-04-24', {
      capturedAt: '2026-04-24T08:00:00.000Z',
      capturedAddress: '100.91.22.16',
      requiredArtifactIds: [
        'candidate_host_with_tailscale_ip',
        'bootstrap_operation_with_tailscale_transport',
        'steady_state_health_with_tailscale_transport',
        'steady_state_runtime_state_with_tailscale_transport'
      ]
    })

    const pack = buildSecondTargetPolicyPack(
      createDefaultSecondTargetPolicySnapshot({ repoRoot })
    )

    assert.equal(pack.liveTransportFollowUp.state, 'capture_complete')
    assert.equal(pack.liveTransportFollowUp.capturedPacketRoot, validPacketRoot)
    assert.equal(pack.liveTransportFollowUp.capturedAddress, '100.91.22.14')
    assert.equal(pack.reviewAdjudication.blockingDeltas.length, 0)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('default second target policy snapshot keeps capture required when discovered live packet still resolves to Docker bridge transport', () => {
  const repoRoot = tempRepoRoot()

  try {
    writeLiveTransportFollowUpPacket(repoRoot, 'debian-12-live-tailscale-packet-2026-04-24', {
      capturedAt: '2026-04-24T08:00:00.000Z',
      capturedAddress: '172.17.0.2'
    })

    const pack = buildSecondTargetPolicyPack(
      createDefaultSecondTargetPolicySnapshot({ repoRoot })
    )

    assert.equal(pack.liveTransportFollowUp.state, 'capture_required')
    assert.equal(pack.liveTransportFollowUp.capturedPacketRoot, undefined)
    assert.equal(pack.reviewAdjudication.blockingDeltas.length, 1)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('default second target policy snapshot ignores scaffold-marked live packet roots', () => {
  const repoRoot = tempRepoRoot()

  try {
    const validPacketRoot = writeLiveTransportFollowUpPacket(
      repoRoot,
      'debian-12-live-tailscale-packet-2026-04-23',
      {
        capturedAt: '2026-04-23T08:00:00.000Z',
        capturedAddress: '100.91.22.17'
      }
    )
    writeScaffoldLiveTransportFollowUpPacket(
      repoRoot,
      'debian-12-live-tailscale-packet-2026-04-24'
    )

    const pack = buildSecondTargetPolicyPack(
      createDefaultSecondTargetPolicySnapshot({ repoRoot })
    )

    assert.equal(pack.liveTransportFollowUp.state, 'capture_complete')
    assert.equal(pack.liveTransportFollowUp.capturedPacketRoot, validPacketRoot)
    assert.equal(pack.liveTransportFollowUp.capturedAddress, '100.91.22.17')
    assert.equal(pack.reviewAdjudication.blockingDeltas.length, 0)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('second target review packet readiness stays in progress until diagnostics and rollback packet sections land', () => {
  const pack = buildSecondTargetPolicyPack({
    ...createDefaultSecondTargetPolicySnapshot(),
    diagnosticsParity: false,
    rollbackParity: false,
    capturedReviewArtifactIds: [
      'bootstrap_operation_id',
      'bootstrap_result_summary',
      'audit_reference',
      'target_profile_confirmation',
      'post_mutation_operation_id',
      'health_capture',
      'runtime_state_capture',
      'controller_audit_reference',
      'backup_bearing_mutation_id',
      'backup_manifest_path',
      'remote_backup_result',
      'restore_readiness_reference'
    ]
  })

  assert.equal(pack.reviewPacketReadiness.state, 'capture_in_progress')
  assert.equal(pack.reviewPacketReadiness.artifactCoverage.available, 12)
  assert.equal(pack.reviewPacketReadiness.artifactCoverage.expected, 20)
  assert.equal(
    pack.reviewPacketReadiness.artifactCoverage.missingArtifactIds.includes('diagnostics_operation_id'),
    true
  )
  assert.equal(
    pack.reviewPacketReadiness.artifactCoverage.missingArtifactIds.includes('rollback_operation_id'),
    true
  )
  assert.match(
    pack.reviewPacketReadiness.summary,
    /diagnostics and rollback artifacts are still missing/i
  )
  assert.match(pack.reviewPacketReadiness.requiredNextAction, /Execute Units 67 through 69/i)
  assert.equal(pack.reviewAdjudication.state, 'not_open')
  assert.deepEqual(pack.reviewAdjudication.pendingVerdicts, [])
  assert.deepEqual(pack.reviewAdjudication.blockingDeltas, [])
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
        reviewPacketReadiness: {
          state: string
          summary: string
          requiredNextAction: string
          guideCoverage: {
            available: number
            expected: number
            missingPaths: string[]
          }
          artifactCoverage: {
            available: number
            expected: number
            missingArtifactIds: string[]
          }
          nextExecutionUnits: Array<{
            id: string
            title: string
            summary: string
          }>
        }
        reviewAdjudication: {
          state: string
          reviewOwner: string
          candidateTargetProfileId: string
          contractPath: string
          packetRoot: string
          summary: string
          pendingVerdicts: Array<{
            id: string
            label: string
            summary: string
            sources: string[]
          }>
          blockingDeltas: Array<{
            id: string
            label: string
            state: string
            summary: string
            requiredFollowUp: string
            sources: string[]
          }>
          sources: string[]
        }
        liveTransportFollowUp: {
          state: string
          candidateTargetProfileId: string
          guidePath: string
          artifactRootPattern: string
          currentRecordedAddress: string
          capturedPacketRoot?: string
          capturedAddress?: string
          summary: string
          requiredNextAction: string
          requiredArtifacts: Array<{
            id: string
            label: string
            summary: string
          }>
          sources: string[]
        }
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
      assert.equal(payload.decisionState, 'review_required')
      assert.equal(payload.expansionReviewRequired, true)
      assert.equal(payload.reviewPacketReadiness.state, 'packet_ready')
      assert.equal(payload.reviewPacketReadiness.guideCoverage.available, 6)
      assert.equal(payload.reviewPacketReadiness.guideCoverage.expected, 6)
      assert.equal(payload.reviewPacketReadiness.artifactCoverage.available, 20)
      assert.equal(payload.reviewPacketReadiness.artifactCoverage.expected, 20)
      assert.deepEqual(payload.reviewPacketReadiness.artifactCoverage.missingArtifactIds, [])
      assert.equal(payload.reviewPacketReadiness.nextExecutionUnits.length, 0)
      assert.equal(payload.reviewAdjudication.state, 'review_open')
      assert.equal(payload.reviewAdjudication.reviewOwner, 'controller')
      assert.equal(payload.reviewAdjudication.pendingVerdicts.length, 5)
      assert.equal(payload.reviewAdjudication.blockingDeltas.length, 1)
      assert.equal(
        payload.reviewAdjudication.blockingDeltas[0]?.id,
        'container_bridge_transport_substitution'
      )
      assert.equal(
        payload.reviewAdjudication.blockingDeltas[0]?.state,
        'blocking'
      )
      assert.match(
        payload.reviewAdjudication.blockingDeltas[0]?.requiredFollowUp ?? '',
        /live Tailscale-backed bounded packet/i
      )
      assert.match(
        payload.reviewAdjudication.contractPath,
        /docs\/operations\/portmanager-second-target-review-contract\.md/u
      )
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
      assert.match(payload.summary, /bounded second-target review is open now/i)
      assert.equal(payload.nextActions.length >= 2, true)
      assert.match(payload.nextActions[0] ?? '', /Work through bounded second-target review/i)
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
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'bootstrap_transport_parity'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'steady_state_transport_parity'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'backup_restore_parity'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'diagnostics_parity'),
        true
      )
      assert.equal(
        payload.satisfiedCriteria.some((criterion) => criterion.id === 'rollback_parity'),
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
      assert.equal(
        payload.steadyStateProofCapture.sources.some((source) =>
          source.endsWith(
            'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/steady-state-capture-summary.json'
          )
        ),
        true
      )
      assert.equal(
        payload.evidenceItems.some(
          (item) =>
            item.criterionId === 'diagnostics_parity' &&
            item.state === 'landed' &&
            item.sources.some((source) =>
              source.endsWith(
                'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/diagnostics-capture-summary.json'
              )
            )
        ),
        true
      )
      assert.equal(
        payload.evidenceItems.some(
          (item) =>
            item.criterionId === 'rollback_parity' &&
            item.state === 'landed' &&
            item.sources.some((source) =>
              source.endsWith(
                'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21/rollback-capture-summary.json'
              )
            )
        ),
        true
      )
      assert.equal(payload.liveTransportFollowUp.state, 'capture_required')
      assert.equal(
        payload.liveTransportFollowUp.guidePath,
        'docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md'
      )
      assert.equal(payload.liveTransportFollowUp.currentRecordedAddress, '172.17.0.2')
      assert.equal(payload.liveTransportFollowUp.capturedPacketRoot, undefined)
      assert.equal(payload.liveTransportFollowUp.capturedAddress, undefined)
      assert.match(payload.liveTransportFollowUp.summary, /live tailscale-backed bounded packet/i)
      assert.equal(payload.liveTransportFollowUp.requiredArtifacts.length >= 4, true)
      assert.equal(
        payload.liveTransportFollowUp.requiredArtifacts.some(
          (item) => item.id === 'candidate_host_with_tailscale_ip'
        ),
        true
      )
      assert.equal(
        payload.liveTransportFollowUp.sources.some((source) =>
          source.endsWith('docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md')
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

test('controller server discovers filesystem-backed live tailscale packet when repo root is overridden', async () => {
  const { directory, databasePath } = tempDbPath()
  const repoRoot = tempRepoRoot()

  try {
    const discoveredPacketRoot = writeLiveTransportFollowUpPacket(
      repoRoot,
      'debian-12-live-tailscale-packet-2026-04-25',
      {
        capturedAt: '2026-04-25T08:00:00.000Z',
        capturedAddress: '100.91.22.25'
      }
    )
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, repoRoot })
    const listening = await server.listen(0)

    try {
      const response = await fetch(`${listening.baseUrl}/second-target-policy-pack`)
      assert.equal(response.status, 200)

      const payload = (await response.json()) as {
        liveTransportFollowUp: {
          state: string
          capturedPacketRoot?: string
          capturedAddress?: string
        }
        reviewAdjudication: {
          blockingDeltas: unknown[]
        }
      }

      assert.equal(payload.liveTransportFollowUp.state, 'capture_complete')
      assert.equal(payload.liveTransportFollowUp.capturedPacketRoot, discoveredPacketRoot)
      assert.equal(payload.liveTransportFollowUp.capturedAddress, '100.91.22.25')
      assert.equal(payload.reviewAdjudication.blockingDeltas.length, 0)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
    rmSync(directory, { recursive: true, force: true })
  }
})

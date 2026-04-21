export type DeploymentBoundaryDecisionState = 'hold' | 'prepare_review' | 'review_required'

export type DeploymentBoundaryCriterionId =
  | 'shared_consumer_contract'
  | 'audit_review_owner'
  | 'rollback_evidence_baseline'
  | 'independent_deployable_artifact'
  | 'edge_runtime_controls'
  | 'standalone_replay_parity'
  | 'observability_boundary'
  | 'external_scale_pressure'

export interface DeploymentBoundaryCriterion {
  id: DeploymentBoundaryCriterionId
  label: string
  reason: string
}

export interface DeploymentBoundaryDecisionSnapshot {
  boundaryTarget: string
  deploymentMode: 'controller_embedded'
  reviewOwner: 'controller'
  sharedConsumerContract: boolean
  auditReviewOwnerDefined: boolean
  rollbackEvidenceBaseline: boolean
  independentDeployableArtifact: boolean
  edgeRuntimeControls: boolean
  standaloneReplayParity: boolean
  observabilityBoundaryDefined: boolean
  externalScalePressure: boolean
}

export interface DeploymentBoundaryDecisionPack {
  boundaryTarget: string
  deploymentMode: DeploymentBoundaryDecisionSnapshot['deploymentMode']
  reviewOwner: DeploymentBoundaryDecisionSnapshot['reviewOwner']
  decisionState: DeploymentBoundaryDecisionState
  standaloneReviewRequired: boolean
  summary: string
  nextActions: string[]
  satisfiedCriteria: DeploymentBoundaryCriterion[]
  blockingCriteria: DeploymentBoundaryCriterion[]
}

const criterionMetadata: Record<
  DeploymentBoundaryCriterionId,
  { label: string; satisfiedReason: string; missingReason: string }
> = {
  shared_consumer_contract: {
    label: 'Shared consumer contract',
    satisfiedReason: 'CLI, Web, and automation already share one consumer contract.',
    missingReason: 'Consumer contract parity is still drifting across surfaces.'
  },
  audit_review_owner: {
    label: 'Audit review owner',
    satisfiedReason: 'Replay plus indexed review already sit behind one audit-review owner.',
    missingReason: 'Replay and indexed review still lack one explicit deployment-boundary owner.'
  },
  rollback_evidence_baseline: {
    label: 'Rollback evidence baseline',
    satisfiedReason: 'Rollback, backup, and replay evidence already exist on the embedded controller slice.',
    missingReason: 'Rollback and replay evidence are not stable enough to judge a standalone boundary.'
  },
  independent_deployable_artifact: {
    label: 'Independent deployable artifact',
    satisfiedReason: 'A separately deployable controller-adjacent artifact now exists for review.',
    missingReason: 'No separately deployable controller-adjacent artifact exists yet.'
  },
  edge_runtime_controls: {
    label: 'Edge runtime controls',
    satisfiedReason: 'Auth, health, and rate-limit controls now exist outside the controller process.',
    missingReason: 'Auth, health, and rate-limit controls outside the controller process are still missing.'
  },
  standalone_replay_parity: {
    label: 'Standalone replay parity',
    satisfiedReason: 'Standalone replay, rollback, and audit evidence now match controller-embedded behavior.',
    missingReason: 'Standalone replay, rollback, and audit parity are still unproven.'
  },
  observability_boundary: {
    label: 'Observability boundary',
    satisfiedReason: 'Observability, rollout, and rollback ownership are now explicit for a standalone boundary.',
    missingReason: 'Observability, rollout, and rollback ownership for a standalone boundary are still undefined.'
  },
  external_scale_pressure: {
    label: 'External scale pressure',
    satisfiedReason: 'External consumers or scale pressure now justify standalone deployment review.',
    missingReason: 'No external consumer or scale pressure justifies standalone deployment review yet.'
  }
}

const baselineCriteria: Array<[DeploymentBoundaryCriterionId, keyof DeploymentBoundaryDecisionSnapshot]> = [
  ['shared_consumer_contract', 'sharedConsumerContract'],
  ['audit_review_owner', 'auditReviewOwnerDefined'],
  ['rollback_evidence_baseline', 'rollbackEvidenceBaseline']
]

const standaloneCriteria: Array<
  [DeploymentBoundaryCriterionId, keyof DeploymentBoundaryDecisionSnapshot]
> = [
  ['independent_deployable_artifact', 'independentDeployableArtifact'],
  ['edge_runtime_controls', 'edgeRuntimeControls'],
  ['standalone_replay_parity', 'standaloneReplayParity'],
  ['observability_boundary', 'observabilityBoundaryDefined'],
  ['external_scale_pressure', 'externalScalePressure']
]

function criterionFrom(
  id: DeploymentBoundaryCriterionId,
  satisfied: boolean
): DeploymentBoundaryCriterion {
  const metadata = criterionMetadata[id]

  return {
    id,
    label: metadata.label,
    reason: satisfied ? metadata.satisfiedReason : metadata.missingReason
  }
}

function joinCriterionLabels(criteria: DeploymentBoundaryCriterion[]) {
  return criteria.map((criterion) => criterion.label.toLowerCase()).join(', ')
}

function decisionStateFrom(
  snapshot: DeploymentBoundaryDecisionSnapshot
): DeploymentBoundaryDecisionState {
  const deploymentReady =
    snapshot.independentDeployableArtifact &&
    snapshot.edgeRuntimeControls &&
    snapshot.standaloneReplayParity &&
    snapshot.observabilityBoundaryDefined

  if (!deploymentReady) {
    return 'hold'
  }

  return snapshot.externalScalePressure ? 'review_required' : 'prepare_review'
}

function buildSummary(
  snapshot: DeploymentBoundaryDecisionSnapshot,
  decisionState: DeploymentBoundaryDecisionState,
  blockingCriteria: DeploymentBoundaryCriterion[]
) {
  if (decisionState === 'review_required') {
    return `Standalone deployment review required now for ${snapshot.boundaryTarget} because deployable artifact, edge controls, replay parity, observability ownership, and external pressure are all present.`
  }

  if (decisionState === 'prepare_review') {
    return `Standalone deployment review prep can begin for ${snapshot.boundaryTarget} because deployable artifact, edge controls, replay parity, and observability ownership are ready, but external pressure is not declared yet.`
  }

  return `${snapshot.boundaryTarget} should remain controller-embedded because ${joinCriterionLabels(blockingCriteria)} are still missing.`
}

function buildNextActions(
  snapshot: DeploymentBoundaryDecisionSnapshot,
  decisionState: DeploymentBoundaryDecisionState
) {
  if (decisionState === 'review_required') {
    return [
      `Open standalone deployment review for ${snapshot.boundaryTarget} before widening external consumers or deployment breadth.`,
      'Keep consumer-contract parity, replay parity, and rollback evidence intact during deployment review.',
      'Pair deployment review approval with second-target policy, rollout ownership, and rollback rehearsal evidence.'
    ]
  }

  if (decisionState === 'prepare_review') {
    return [
      `Keep ${snapshot.boundaryTarget} controller-embedded while validating rollout, rollback, and observability evidence.`,
      'Document edge runtime controls and deployable ownership before forcing a standalone boundary.',
      'Wait for explicit external consumer or scale pressure before requiring standalone deployment review.'
    ]
  }

  return [
    `Keep ${snapshot.boundaryTarget} controller-embedded while independent deployable artifact evidence is absent.`,
    'Prove edge runtime controls, standalone replay parity, and observability before reopening deployment review.',
    'Pair any later standalone proposal with second-target policy and rollback rehearsal evidence.'
  ]
}

export function createDefaultDeploymentBoundaryDecisionSnapshot(): DeploymentBoundaryDecisionSnapshot {
  return {
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
  }
}

export function buildDeploymentBoundaryDecisionPack(
  snapshot: DeploymentBoundaryDecisionSnapshot
): DeploymentBoundaryDecisionPack {
  const criteria = [...baselineCriteria, ...standaloneCriteria]
  const satisfiedCriteria = criteria
    .filter(([, key]) => snapshot[key] === true)
    .map(([id]) => criterionFrom(id, true))
  const blockingCriteria = criteria
    .filter(([, key]) => snapshot[key] === false)
    .map(([id]) => criterionFrom(id, false))
  const decisionState = decisionStateFrom(snapshot)

  return {
    boundaryTarget: snapshot.boundaryTarget,
    deploymentMode: snapshot.deploymentMode,
    reviewOwner: snapshot.reviewOwner,
    decisionState,
    standaloneReviewRequired: decisionState === 'review_required',
    summary: buildSummary(snapshot, decisionState, blockingCriteria),
    nextActions: buildNextActions(snapshot, decisionState),
    satisfiedCriteria,
    blockingCriteria
  }
}

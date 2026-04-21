export type ConsumerBoundaryDecisionState = 'hold' | 'prepare_review' | 'review_required'

export type ConsumerBoundaryCriterionId =
  | 'shared_contract_parity'
  | 'prefixed_boundary'
  | 'legacy_alias_compatibility'
  | 'standalone_deployment_boundary'
  | 'dedicated_edge_policy_layer'
  | 'split_ownership'
  | 'external_consumer_pressure'

export interface ConsumerBoundaryCriterion {
  id: ConsumerBoundaryCriterionId
  label: string
  reason: string
}

export interface ConsumerBoundaryDecisionSnapshot {
  boundaryPath: string
  hostingMode: 'controller_embedded'
  reviewOwner: 'controller'
  sharedContractParity: boolean
  prefixedBoundaryPublished: boolean
  legacyAliasCompatibility: boolean
  standaloneDeploymentBoundary: boolean
  dedicatedEdgePolicyLayer: boolean
  splitOwnershipDefined: boolean
  externalConsumerPressure: boolean
}

export interface ConsumerBoundaryDecisionPack {
  boundaryPath: string
  hostingMode: ConsumerBoundaryDecisionSnapshot['hostingMode']
  reviewOwner: ConsumerBoundaryDecisionSnapshot['reviewOwner']
  decisionState: ConsumerBoundaryDecisionState
  splitReviewRequired: boolean
  summary: string
  nextActions: string[]
  satisfiedCriteria: ConsumerBoundaryCriterion[]
  blockingCriteria: ConsumerBoundaryCriterion[]
}

const criterionMetadata: Record<
  ConsumerBoundaryCriterionId,
  { label: string; satisfiedReason: string; missingReason: string }
> = {
  shared_contract_parity: {
    label: 'Shared contract parity',
    satisfiedReason: 'CLI, Web, and automation already share one generated consumer contract.',
    missingReason: 'Consumer contract parity is still drifting across surfaces.'
  },
  prefixed_boundary: {
    label: 'Prefixed boundary',
    satisfiedReason: '`/api/controller` already exposes one compatibility-safe consumer entrypoint.',
    missingReason: 'No stable prefixed consumer boundary is published yet.'
  },
  legacy_alias_compatibility: {
    label: 'Legacy alias compatibility',
    satisfiedReason: 'Legacy controller routes still mirror the consumer-prefixed boundary.',
    missingReason: 'Legacy alias compatibility is still undefined.'
  },
  standalone_deployment_boundary: {
    label: 'Standalone deployment boundary',
    satisfiedReason: 'Consumer transport now has an explicit independent deployment boundary.',
    missingReason: 'Consumer transport still ships inside controller with no independent deployment boundary.'
  },
  dedicated_edge_policy_layer: {
    label: 'Dedicated edge policy layer',
    satisfiedReason: 'Auth, rate-limit, and edge policy concerns now exist outside controller transport.',
    missingReason: 'Dedicated auth, rate-limit, and edge policy handling outside controller transport is still missing.'
  },
  split_ownership: {
    label: 'Split ownership',
    satisfiedReason: 'Gateway-facing ownership is now separated from controller domain ownership.',
    missingReason: 'Consumer-boundary ownership is still controller-only.'
  },
  external_consumer_pressure: {
    label: 'External consumer pressure',
    satisfiedReason: 'External consumer and deployment pressure now justify a standalone split review.',
    missingReason: 'No external consumer or deployment pressure justifies a standalone split review yet.'
  }
}

const baselineCriteria: Array<[ConsumerBoundaryCriterionId, keyof ConsumerBoundaryDecisionSnapshot]> = [
  ['shared_contract_parity', 'sharedContractParity'],
  ['prefixed_boundary', 'prefixedBoundaryPublished'],
  ['legacy_alias_compatibility', 'legacyAliasCompatibility']
]

const splitCriteria: Array<[ConsumerBoundaryCriterionId, keyof ConsumerBoundaryDecisionSnapshot]> = [
  ['standalone_deployment_boundary', 'standaloneDeploymentBoundary'],
  ['dedicated_edge_policy_layer', 'dedicatedEdgePolicyLayer'],
  ['split_ownership', 'splitOwnershipDefined'],
  ['external_consumer_pressure', 'externalConsumerPressure']
]

function criterionFrom(id: ConsumerBoundaryCriterionId, satisfied: boolean): ConsumerBoundaryCriterion {
  const metadata = criterionMetadata[id]

  return {
    id,
    label: metadata.label,
    reason: satisfied ? metadata.satisfiedReason : metadata.missingReason
  }
}

function joinCriterionLabels(criteria: ConsumerBoundaryCriterion[]) {
  return criteria.map((criterion) => criterion.label.toLowerCase()).join(', ')
}

function decisionStateFrom(snapshot: ConsumerBoundaryDecisionSnapshot): ConsumerBoundaryDecisionState {
  const deploymentReady =
    snapshot.standaloneDeploymentBoundary &&
    snapshot.dedicatedEdgePolicyLayer &&
    snapshot.splitOwnershipDefined

  if (!deploymentReady) {
    return 'hold'
  }

  return snapshot.externalConsumerPressure ? 'review_required' : 'prepare_review'
}

function buildSummary(
  snapshot: ConsumerBoundaryDecisionSnapshot,
  decisionState: ConsumerBoundaryDecisionState,
  blockingCriteria: ConsumerBoundaryCriterion[]
) {
  if (decisionState === 'review_required') {
    return `Standalone ${snapshot.boundaryPath} split review required now because deployment boundary, edge policy, ownership, and external consumer pressure are all present.`
  }

  if (decisionState === 'prepare_review') {
    return `Standalone ${snapshot.boundaryPath} split review prep can begin because deployment boundary, edge policy, and ownership criteria are now ready, but external consumer pressure is not declared yet.`
  }

  const blockingLabels = joinCriterionLabels(blockingCriteria)
  return `${snapshot.boundaryPath} should remain inside controller because ${blockingLabels} are still missing.`
}

function buildNextActions(
  snapshot: ConsumerBoundaryDecisionSnapshot,
  decisionState: ConsumerBoundaryDecisionState
) {
  if (decisionState === 'review_required') {
    return [
      `Open standalone ${snapshot.boundaryPath} split review before widening external consumers or deployment breadth.`,
      `Keep ${snapshot.boundaryPath} compatibility aliases and generated contract parity intact during review.`,
      'Tie any split approval to deployment ownership, edge policy, rollback parity, and second-target policy evidence.'
    ]
  }

  if (decisionState === 'prepare_review') {
    return [
      `Keep ${snapshot.boundaryPath} embedded while validating gateway review scope and rollback parity.`,
      'Document deployment ownership, edge policy expectations, and compatibility constraints before forcing a split.',
      'Wait for explicit external consumer pressure before requiring standalone gateway review.'
    ]
  }

  return [
    `Keep ${snapshot.boundaryPath} embedded while standalone deployment ownership is absent.`,
    'Define dedicated edge policy and ownership split before reopening gateway review.',
    'Pair any later split proposal with second-target policy and deployment-boundary evidence.'
  ]
}

export function createDefaultConsumerBoundaryDecisionSnapshot(): ConsumerBoundaryDecisionSnapshot {
  return {
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
  }
}

export function buildConsumerBoundaryDecisionPack(
  snapshot: ConsumerBoundaryDecisionSnapshot
): ConsumerBoundaryDecisionPack {
  const satisfiedCriteria = [...baselineCriteria, ...splitCriteria]
    .filter(([, key]) => snapshot[key] === true)
    .map(([id]) => criterionFrom(id, true))

  const blockingCriteria = [...baselineCriteria, ...splitCriteria]
    .filter(([, key]) => snapshot[key] === false)
    .map(([id]) => criterionFrom(id, false))

  const decisionState = decisionStateFrom(snapshot)

  return {
    boundaryPath: snapshot.boundaryPath,
    hostingMode: snapshot.hostingMode,
    reviewOwner: snapshot.reviewOwner,
    decisionState,
    splitReviewRequired: decisionState === 'review_required',
    summary: buildSummary(snapshot, decisionState, blockingCriteria),
    nextActions: buildNextActions(snapshot, decisionState),
    satisfiedCriteria,
    blockingCriteria
  }
}

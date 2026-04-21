import type { TargetProfileSummary } from './target-profile-registry.ts'
import {
  defaultTargetProfileId,
  listTargetProfiles,
  summarizeTargetProfile
} from './target-profile-registry.ts'

export type SecondTargetPolicyDecisionState = 'hold' | 'prepare_review' | 'review_required'

export type SecondTargetPolicyCriterionId =
  | 'locked_target_registry'
  | 'supported_target_baseline'
  | 'candidate_target_declared'
  | 'bootstrap_transport_parity'
  | 'steady_state_transport_parity'
  | 'backup_restore_parity'
  | 'diagnostics_parity'
  | 'rollback_parity'
  | 'docs_contract_ready'
  | 'acceptance_recipe_ready'
  | 'operator_ownership_defined'

export interface SecondTargetPolicyCriterion {
  id: SecondTargetPolicyCriterionId
  label: string
  reason: string
}

export interface SecondTargetPolicySnapshot {
  lockedTargetProfileId: string
  reviewOwner: 'controller'
  supportedTargetProfiles: TargetProfileSummary[]
  candidateTargetProfileIds: string[]
  targetRegistryPublished: boolean
  bootstrapTransportParity: boolean
  steadyStateTransportParity: boolean
  backupRestoreParity: boolean
  diagnosticsParity: boolean
  rollbackParity: boolean
  docsContractReady: boolean
  acceptanceRecipeReady: boolean
  operatorOwnershipDefined: boolean
}

export interface SecondTargetPolicyPack {
  lockedTargetProfileId: string
  reviewOwner: SecondTargetPolicySnapshot['reviewOwner']
  supportedTargetProfiles: TargetProfileSummary[]
  candidateTargetProfileIds: string[]
  decisionState: SecondTargetPolicyDecisionState
  expansionReviewRequired: boolean
  summary: string
  nextActions: string[]
  satisfiedCriteria: SecondTargetPolicyCriterion[]
  blockingCriteria: SecondTargetPolicyCriterion[]
}

const criterionMetadata: Record<
  SecondTargetPolicyCriterionId,
  { label: string; satisfiedReason: string; missingReason: string }
> = {
  locked_target_registry: {
    label: 'Locked target registry',
    satisfiedReason:
      'One explicit locked target profile is already published across controller, CLI, and Web.',
    missingReason: 'No explicit locked target registry is published yet.'
  },
  supported_target_baseline: {
    label: 'Supported target baseline',
    satisfiedReason:
      'Supported-target claims are still locked to one explicit Ubuntu 24.04 + systemd + Tailscale baseline.',
    missingReason: 'Supported-target claims are drifting beyond the locked single-target baseline.'
  },
  candidate_target_declared: {
    label: 'Candidate target declared',
    satisfiedReason: 'One explicit second-target candidate is declared for review.',
    missingReason: 'No second target candidate is declared yet.'
  },
  bootstrap_transport_parity: {
    label: 'Bootstrap transport parity',
    satisfiedReason: 'Bootstrap transport behavior is proven for the candidate target.',
    missingReason: 'Bootstrap transport parity is still missing for the candidate target.'
  },
  steady_state_transport_parity: {
    label: 'Steady-state transport parity',
    satisfiedReason: 'Steady-state transport behavior is proven for the candidate target.',
    missingReason: 'Steady-state transport parity is still missing for the candidate target.'
  },
  backup_restore_parity: {
    label: 'Backup and restore parity',
    satisfiedReason: 'Backup and restore behavior is proven for the candidate target.',
    missingReason: 'Backup and restore parity is still missing for the candidate target.'
  },
  diagnostics_parity: {
    label: 'Diagnostics parity',
    satisfiedReason: 'Diagnostics behavior is proven for the candidate target.',
    missingReason: 'Diagnostics parity is still missing for the candidate target.'
  },
  rollback_parity: {
    label: 'Rollback parity',
    satisfiedReason: 'Rollback behavior is proven for the candidate target.',
    missingReason: 'Rollback parity is still missing for the candidate target.'
  },
  docs_contract_ready: {
    label: 'Docs contract ready',
    satisfiedReason: 'Docs and public contract wording now describe the candidate target honestly.',
    missingReason: 'Docs and public contract wording are not ready for a candidate target claim yet.'
  },
  acceptance_recipe_ready: {
    label: 'Acceptance recipe ready',
    satisfiedReason: 'Acceptance proof steps now exist for the candidate target.',
    missingReason: 'No acceptance proof recipe exists for the candidate target yet.'
  },
  operator_ownership_defined: {
    label: 'Operator ownership defined',
    satisfiedReason: 'Operator ownership and support responsibility are defined for the candidate target.',
    missingReason: 'Operator ownership is still undefined for the candidate target.'
  }
}

function hasLockedSupportedTarget(snapshot: SecondTargetPolicySnapshot) {
  return snapshot.supportedTargetProfiles.some(
    (profile) =>
      profile.id === snapshot.lockedTargetProfileId && profile.status === 'supported'
  )
}

function supportedTargetBaselineStable(snapshot: SecondTargetPolicySnapshot) {
  return snapshot.supportedTargetProfiles.length === 1 && hasLockedSupportedTarget(snapshot)
}

function candidateTargetDeclared(snapshot: SecondTargetPolicySnapshot) {
  return snapshot.candidateTargetProfileIds.length > 0
}

const criteria: Array<
  [SecondTargetPolicyCriterionId, (snapshot: SecondTargetPolicySnapshot) => boolean]
> = [
  ['locked_target_registry', (snapshot) => snapshot.targetRegistryPublished],
  ['supported_target_baseline', supportedTargetBaselineStable],
  ['candidate_target_declared', candidateTargetDeclared],
  ['bootstrap_transport_parity', (snapshot) => snapshot.bootstrapTransportParity],
  ['steady_state_transport_parity', (snapshot) => snapshot.steadyStateTransportParity],
  ['backup_restore_parity', (snapshot) => snapshot.backupRestoreParity],
  ['diagnostics_parity', (snapshot) => snapshot.diagnosticsParity],
  ['rollback_parity', (snapshot) => snapshot.rollbackParity],
  ['docs_contract_ready', (snapshot) => snapshot.docsContractReady],
  ['acceptance_recipe_ready', (snapshot) => snapshot.acceptanceRecipeReady],
  ['operator_ownership_defined', (snapshot) => snapshot.operatorOwnershipDefined]
]

function criterionFrom(
  id: SecondTargetPolicyCriterionId,
  satisfied: boolean
): SecondTargetPolicyCriterion {
  const metadata = criterionMetadata[id]

  return {
    id,
    label: metadata.label,
    reason: satisfied ? metadata.satisfiedReason : metadata.missingReason
  }
}

function joinCriterionLabels(criteriaList: SecondTargetPolicyCriterion[]) {
  return criteriaList.map((criterion) => criterion.label.toLowerCase()).join(', ')
}

function technicalParityReady(snapshot: SecondTargetPolicySnapshot) {
  return (
    candidateTargetDeclared(snapshot) &&
    snapshot.bootstrapTransportParity &&
    snapshot.steadyStateTransportParity &&
    snapshot.backupRestoreParity &&
    snapshot.diagnosticsParity &&
    snapshot.rollbackParity
  )
}

function governanceReady(snapshot: SecondTargetPolicySnapshot) {
  return (
    snapshot.docsContractReady &&
    snapshot.acceptanceRecipeReady &&
    snapshot.operatorOwnershipDefined
  )
}

function decisionStateFrom(snapshot: SecondTargetPolicySnapshot): SecondTargetPolicyDecisionState {
  if (!snapshot.targetRegistryPublished || !supportedTargetBaselineStable(snapshot)) {
    return 'hold'
  }

  if (!technicalParityReady(snapshot)) {
    return 'hold'
  }

  return governanceReady(snapshot) ? 'review_required' : 'prepare_review'
}

function buildSummary(
  decisionState: SecondTargetPolicyDecisionState,
  blockingCriteria: SecondTargetPolicyCriterion[]
) {
  if (decisionState === 'review_required') {
    return 'Second-target review required now because candidate target, transport parity, backup parity, diagnostics parity, rollback parity, docs contract, acceptance recipe, and operator ownership are all present.'
  }

  if (decisionState === 'prepare_review') {
    return `Second-target review prep can begin because transport and recovery parity are ready, but ${joinCriterionLabels(blockingCriteria)} are still missing.`
  }

  return `Second-target support must stay on hold because ${joinCriterionLabels(blockingCriteria)} are still missing.`
}

function buildNextActions(
  snapshot: SecondTargetPolicySnapshot,
  decisionState: SecondTargetPolicyDecisionState
) {
  const lockedTarget = snapshot.lockedTargetProfileId
  const candidateTargets = snapshot.candidateTargetProfileIds.join(', ') || 'one explicit candidate'

  if (decisionState === 'review_required') {
    return [
      `Open second-target review for ${candidateTargets} before widening supported-target claims beyond ${lockedTarget}.`,
      'Keep controller, CLI, Web, and docs contract wording aligned while review validates parity evidence.',
      'Gate any support claim on acceptance proof, operator ownership, and rollback rehearsal evidence.'
    ]
  }

  if (decisionState === 'prepare_review') {
    return [
      `Keep supported targets locked to ${lockedTarget} while docs, acceptance recipe, and operator ownership are completed for ${candidateTargets}.`,
      'Bundle transport, backup, diagnostics, and rollback parity evidence into one review packet before widening support claims.',
      'Do not publish broader target support until the formal second-target review is opened.'
    ]
  }

  return [
    `Keep supported targets locked to ${lockedTarget}.`,
    'Declare one explicit second-target candidate before discussing broader platform support.',
    'Prove transport, backup, diagnostics, and rollback parity before any second-target support claim.'
  ]
}

export function createDefaultSecondTargetPolicySnapshot(): SecondTargetPolicySnapshot {
  return {
    lockedTargetProfileId: defaultTargetProfileId,
    reviewOwner: 'controller',
    supportedTargetProfiles: listTargetProfiles().map((profile) => summarizeTargetProfile(profile.id)),
    candidateTargetProfileIds: [],
    targetRegistryPublished: true,
    bootstrapTransportParity: false,
    steadyStateTransportParity: false,
    backupRestoreParity: false,
    diagnosticsParity: false,
    rollbackParity: false,
    docsContractReady: false,
    acceptanceRecipeReady: false,
    operatorOwnershipDefined: false
  }
}

export function buildSecondTargetPolicyPack(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetPolicyPack {
  const satisfiedCriteria = criteria
    .filter(([, isSatisfied]) => isSatisfied(snapshot))
    .map(([id]) => criterionFrom(id, true))
  const blockingCriteria = criteria
    .filter(([, isSatisfied]) => !isSatisfied(snapshot))
    .map(([id]) => criterionFrom(id, false))
  const decisionState = decisionStateFrom(snapshot)

  return {
    lockedTargetProfileId: snapshot.lockedTargetProfileId,
    reviewOwner: snapshot.reviewOwner,
    supportedTargetProfiles: [...snapshot.supportedTargetProfiles],
    candidateTargetProfileIds: [...snapshot.candidateTargetProfileIds],
    decisionState,
    expansionReviewRequired: decisionState === 'review_required',
    summary: buildSummary(decisionState, blockingCriteria),
    nextActions: buildNextActions(snapshot, decisionState),
    satisfiedCriteria,
    blockingCriteria
  }
}

import type { TargetProfileSummary } from './target-profile-registry.ts'
import {
  candidateTargetProfileId,
  defaultTargetProfileId,
  listCandidateTargetProfiles,
  listSupportedTargetProfiles,
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

export type SecondTargetPolicyEvidenceState = 'landed' | 'review_prep' | 'planned'

export interface SecondTargetPolicyEvidenceItem {
  criterionId: SecondTargetPolicyCriterionId
  label: string
  state: SecondTargetPolicyEvidenceState
  summary: string
  sources: string[]
}

export interface SecondTargetReviewPacketRequirement {
  criterionId: SecondTargetPolicyCriterionId
  label: string
  summary: string
  sources: string[]
}

export interface SecondTargetReviewPacketTemplate {
  candidateTargetProfileId: string
  templatePath: string
  summary: string
  requiredEvidence: SecondTargetReviewPacketRequirement[]
}

export type SecondTargetBootstrapProofArtifactId =
  | 'bootstrap_operation_id'
  | 'bootstrap_result_summary'
  | 'audit_reference'
  | 'target_profile_confirmation'

export interface SecondTargetBootstrapProofArtifact {
  id: SecondTargetBootstrapProofArtifactId
  label: string
  summary: string
}

export interface SecondTargetBootstrapProofCapture {
  candidateTargetProfileId: string
  guidePath: string
  summary: string
  requiredArtifacts: SecondTargetBootstrapProofArtifact[]
  sources: string[]
}

export type SecondTargetSteadyStateProofArtifactId =
  | 'post_mutation_operation_id'
  | 'health_capture'
  | 'runtime_state_capture'
  | 'controller_audit_reference'

export interface SecondTargetSteadyStateProofArtifact {
  id: SecondTargetSteadyStateProofArtifactId
  label: string
  summary: string
}

export interface SecondTargetSteadyStateProofCapture {
  candidateTargetProfileId: string
  guidePath: string
  summary: string
  requiredArtifacts: SecondTargetSteadyStateProofArtifact[]
  sources: string[]
}

export type SecondTargetBackupRestoreProofArtifactId =
  | 'backup_bearing_mutation_id'
  | 'backup_manifest_path'
  | 'remote_backup_result'
  | 'restore_readiness_reference'

export interface SecondTargetBackupRestoreProofArtifact {
  id: SecondTargetBackupRestoreProofArtifactId
  label: string
  summary: string
}

export interface SecondTargetBackupRestoreProofCapture {
  candidateTargetProfileId: string
  guidePath: string
  summary: string
  requiredArtifacts: SecondTargetBackupRestoreProofArtifact[]
  sources: string[]
}

export type SecondTargetDiagnosticsProofArtifactId =
  | 'diagnostics_operation_id'
  | 'diagnostics_artifact_paths'
  | 'controller_event_reference'
  | 'drift_operator_note'

export interface SecondTargetDiagnosticsProofArtifact {
  id: SecondTargetDiagnosticsProofArtifactId
  label: string
  summary: string
}

export interface SecondTargetDiagnosticsProofCapture {
  candidateTargetProfileId: string
  guidePath: string
  summary: string
  requiredArtifacts: SecondTargetDiagnosticsProofArtifact[]
  sources: string[]
}

export interface SecondTargetPolicySnapshot {
  lockedTargetProfileId: string
  reviewOwner: 'controller'
  supportedTargetProfiles: TargetProfileSummary[]
  candidateTargetProfiles: TargetProfileSummary[]
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
  evidenceItems?: SecondTargetPolicyEvidenceItem[]
}

export interface SecondTargetPolicyPack {
  lockedTargetProfileId: string
  reviewOwner: SecondTargetPolicySnapshot['reviewOwner']
  supportedTargetProfiles: TargetProfileSummary[]
  candidateTargetProfiles: TargetProfileSummary[]
  candidateTargetProfileIds: string[]
  decisionState: SecondTargetPolicyDecisionState
  expansionReviewRequired: boolean
  summary: string
  nextActions: string[]
  reviewPacketTemplate: SecondTargetReviewPacketTemplate
  bootstrapProofCapture: SecondTargetBootstrapProofCapture
  steadyStateProofCapture: SecondTargetSteadyStateProofCapture
  backupRestoreProofCapture: SecondTargetBackupRestoreProofCapture
  diagnosticsProofCapture: SecondTargetDiagnosticsProofCapture
  satisfiedCriteria: SecondTargetPolicyCriterion[]
  blockingCriteria: SecondTargetPolicyCriterion[]
  evidenceItems: SecondTargetPolicyEvidenceItem[]
}

const reviewPacketTemplatePath = 'docs/operations/portmanager-debian-12-review-packet-template.md'
const bootstrapProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-bootstrap-proof-capture.md'
const steadyStateProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-steady-state-proof-capture.md'
const backupRestoreProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-backup-restore-proof-capture.md'
const diagnosticsProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-diagnostics-proof-capture.md'

const bootstrapProofArtifactMetadata: Record<
  SecondTargetBootstrapProofArtifactId,
  { label: string; summary: string }
> = {
  bootstrap_operation_id: {
    label: 'Bootstrap operation id',
    summary:
      'Capture the bootstrap operation id so every later proof reference points to one bounded controller record.'
  },
  bootstrap_result_summary: {
    label: 'Bootstrap result summary',
    summary:
      'Capture the terminal bootstrap result summary that states whether the candidate host reached ready or stayed degraded.'
  },
  audit_reference: {
    label: 'Audit or replay reference',
    summary:
      'Capture one linked event replay or audit-index reference that preserves the bootstrap evidence bundle.'
  },
  target_profile_confirmation: {
    label: 'Target profile confirmation',
    summary:
      'Capture confirmation that the candidate host stayed on debian-12-systemd-tailscale for the same bootstrap proof.'
  }
}

const steadyStateProofArtifactMetadata: Record<
  SecondTargetSteadyStateProofArtifactId,
  { label: string; summary: string }
> = {
  post_mutation_operation_id: {
    label: 'Post-mutation operation id',
    summary:
      'Capture one normal controller-driven mutation id after bootstrap so steady-state proof stays anchored to real controller traffic.'
  },
  health_capture: {
    label: 'Health capture',
    summary:
      'Capture the steady-state `/health` response after the post-bootstrap mutation completes.'
  },
  runtime_state_capture: {
    label: 'Runtime-state capture',
    summary:
      'Capture the steady-state `/runtime-state` response from the same candidate host after the mutation.'
  },
  controller_audit_reference: {
    label: 'Controller audit reference',
    summary:
      'Capture one linked controller event replay or audit-index reference that ties the mutation and steady-state captures together.'
  }
}

const backupRestoreProofArtifactMetadata: Record<
  SecondTargetBackupRestoreProofArtifactId,
  { label: string; summary: string }
> = {
  backup_bearing_mutation_id: {
    label: 'Backup-bearing mutation id',
    summary:
      'Capture one controller-driven mutation id that produced the backup bundle used for the Debian 12 review packet.'
  },
  backup_manifest_path: {
    label: 'Backup manifest path',
    summary:
      'Capture the backup manifest path linked to the same mutation so artifact lineage stays explicit.'
  },
  remote_backup_result: {
    label: 'Remote-backup result',
    summary:
      'Capture the remote-backup result from the same bundle, or the explicit not-configured state if remote backup is still absent.'
  },
  restore_readiness_reference: {
    label: 'Restore-readiness reference',
    summary:
      'Capture one rollback-point or restore-readiness reference tied to the same backup-bearing mutation without widening support claims.'
  }
}

const diagnosticsProofArtifactMetadata: Record<
  SecondTargetDiagnosticsProofArtifactId,
  { label: string; summary: string }
> = {
  diagnostics_operation_id: {
    label: 'Diagnostics operation id',
    summary:
      'Capture one bounded diagnostics operation id so the Debian 12 proof stays anchored to one controller verification run.'
  },
  diagnostics_artifact_paths: {
    label: 'Diagnostics artifact paths',
    summary:
      'Capture the diagnostics artifact paths from the same run so webpage snapshots and machine-readable evidence stay linked.'
  },
  controller_event_reference: {
    label: 'Controller event reference',
    summary:
      'Capture one linked controller event replay or audit-index reference that ties the diagnostics run back to controller truth.'
  },
  drift_operator_note: {
    label: 'Drift operator note',
    summary:
      'Capture one short operator note for any drift, degraded verification, or no-drift conclusion from the same diagnostics packet.'
  }
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

function evidenceItem(
  criterionId: SecondTargetPolicyCriterionId,
  state: SecondTargetPolicyEvidenceState,
  summary: string,
  sources: string[]
): SecondTargetPolicyEvidenceItem {
  return {
    criterionId,
    label: criterionMetadata[criterionId].label,
    state,
    summary,
    sources
  }
}

function reviewPacketRequirement(
  criterionId: SecondTargetPolicyCriterionId,
  summary: string,
  sources: string[]
): SecondTargetReviewPacketRequirement {
  return {
    criterionId,
    label: criterionMetadata[criterionId].label,
    summary,
    sources
  }
}

function bootstrapProofArtifact(
  id: SecondTargetBootstrapProofArtifactId
): SecondTargetBootstrapProofArtifact {
  const metadata = bootstrapProofArtifactMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary
  }
}

function steadyStateProofArtifact(
  id: SecondTargetSteadyStateProofArtifactId
): SecondTargetSteadyStateProofArtifact {
  const metadata = steadyStateProofArtifactMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary
  }
}

function backupRestoreProofArtifact(
  id: SecondTargetBackupRestoreProofArtifactId
): SecondTargetBackupRestoreProofArtifact {
  const metadata = backupRestoreProofArtifactMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary
  }
}

function diagnosticsProofArtifact(
  id: SecondTargetDiagnosticsProofArtifactId
): SecondTargetDiagnosticsProofArtifact {
  const metadata = diagnosticsProofArtifactMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary
  }
}

function createDefaultSecondTargetEvidenceItems(): SecondTargetPolicyEvidenceItem[] {
  return [
    evidenceItem(
      'locked_target_registry',
      'landed',
      'Locked target-profile registry now publishes the Ubuntu baseline across controller, CLI, and Web.',
      [
        'apps/controller/src/target-profile-registry.ts',
        'tests/controller/target-profile-registry.test.ts',
        'apps/web/src/main.ts',
        'crates/portmanager-cli/src/main.rs'
      ]
    ),
    evidenceItem(
      'supported_target_baseline',
      'landed',
      'Supported-target wording remains locked to ubuntu-24.04-systemd-tailscale.',
      [
        'README.md',
        'docs/specs/portmanager-milestones.md',
        'docs/specs/portmanager-toward-c-strategy.md',
        'docs-site/data/roadmap.ts'
      ]
    ),
    evidenceItem(
      'candidate_target_declared',
      'review_prep',
      'debian-12-systemd-tailscale is declared as the only review-prep candidate, not a supported target.',
      [
        'apps/controller/src/second-target-policy-pack.ts',
        'tests/controller/second-target-policy-pack.test.ts',
        'docs/specs/portmanager-milestones.md',
        'docs-site/data/roadmap.ts'
      ]
    ),
    evidenceItem(
      'docs_contract_ready',
      'landed',
      'Docs contract now freezes candidate-only wording plus review-prep guardrails for Debian 12.',
      [
        'docs/operations/portmanager-second-target-review-contract.md',
        'README.md',
        'docs/specs/portmanager-v1-product-spec.md',
        'docs-site/data/roadmap.ts'
      ]
    ),
    evidenceItem(
      'acceptance_recipe_ready',
      'landed',
      'Acceptance recipe now defines the bounded Debian 12 review-prep proof sequence and artifact list.',
      [
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        'README.md',
        'TODO.md'
      ]
    ),
    evidenceItem(
      'operator_ownership_defined',
      'landed',
      'Operator ownership document now names who stages hosts, records evidence, and decides whether review stays on hold.',
      [
        'docs/operations/portmanager-debian-12-operator-ownership.md',
        'README.md',
        'docs/architecture/portmanager-v1-architecture.md'
      ]
    ),
    evidenceItem(
      'bootstrap_transport_parity',
      'review_prep',
      'Candidate host enrollment, probe, and bootstrap now run through the bounded review-prep lane, but parity proof stays false until one Debian 12 review packet preserves the bootstrap evidence bundle.',
      [
        'apps/controller/src/controller-server.ts',
        'apps/controller/src/controller-domain-service.ts',
        'tests/controller/target-profile-registry.test.ts',
        'tests/controller/host-rule-policy.test.ts',
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md'
      ]
    ),
    evidenceItem(
      'steady_state_transport_parity',
      'planned',
      'Steady-state transport parity is still pending for Debian 12 until one post-bootstrap health and runtime bundle is captured.',
      [
        steadyStateProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md'
      ]
    ),
    evidenceItem(
      'backup_restore_parity',
      'planned',
      'Backup and restore parity is still pending for Debian 12 until one backup-bearing mutation bundle and restore-readiness reference are captured.',
      [
        backupRestoreProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/operations/portmanager-backup-rollback-policy.md'
      ]
    ),
    evidenceItem(
      'diagnostics_parity',
      'planned',
      'Diagnostics parity is still pending for Debian 12 until one diagnostics artifact bundle and controller event reference are captured.',
      [
        diagnosticsProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/plans/2026-04-21-portmanager-m3-toward-c-enablement-plan.md'
      ]
    ),
    evidenceItem(
      'rollback_parity',
      'planned',
      'Rollback parity evidence is still pending for Debian 12.',
      [
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/operations/portmanager-backup-rollback-policy.md'
      ]
    )
  ]
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

function resolvedCandidateTargetProfileIds(snapshot: SecondTargetPolicySnapshot) {
  if (snapshot.candidateTargetProfileIds.length > 0) {
    return snapshot.candidateTargetProfileIds
  }

  return snapshot.candidateTargetProfiles.map((profile) => profile.id)
}

function candidateTargetDeclared(snapshot: SecondTargetPolicySnapshot) {
  return resolvedCandidateTargetProfileIds(snapshot).length > 0
}

function primaryCandidateTargetProfileId(snapshot: SecondTargetPolicySnapshot) {
  return resolvedCandidateTargetProfileIds(snapshot)[0] ?? candidateTargetProfileId
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
  const candidateTargets =
    resolvedCandidateTargetProfileIds(snapshot).join(', ') || 'one explicit candidate'

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
      'Bundle bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity evidence into one review packet before widening support claims.',
      'Do not publish broader target support until the formal second-target review is opened.'
    ]
  }

  if (candidateTargetDeclared(snapshot)) {
    if (governanceReady(snapshot)) {
      return [
        `Keep supported targets locked to ${lockedTarget}.`,
        `Keep ${candidateTargets} in review-prep until bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity are all real.`,
        'Keep docs contract, acceptance recipe, and operator ownership artifacts aligned with parity evidence while the candidate stays on hold.'
      ]
    }

    return [
      `Keep supported targets locked to ${lockedTarget}.`,
      `Keep ${candidateTargets} in review-prep until transport, recovery, docs, acceptance, and ownership evidence are all real.`,
      'Prove bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity before any second-target support claim.'
    ]
  }

  return [
    `Keep supported targets locked to ${lockedTarget}.`,
    'Declare one explicit second-target candidate before discussing broader platform support.',
    'Prove bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity before any second-target support claim.'
  ]
}

function buildReviewPacketTemplate(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewPacketTemplate {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)

  return {
    candidateTargetProfileId,
    templatePath: reviewPacketTemplatePath,
    summary:
      `Review-packet capture stays explicit for ${candidateTargetProfileId}: preserve one bounded evidence bundle before widening support claims.`,
    requiredEvidence: [
      reviewPacketRequirement(
        'bootstrap_transport_parity',
        'Capture one bootstrap operation id, result summary, and linked audit/event reference for the Debian 12 candidate host.',
        [
          reviewPacketTemplatePath,
          'docs/operations/portmanager-debian-12-acceptance-recipe.md',
          'apps/controller/src/controller-server.ts',
          'apps/controller/src/controller-domain-service.ts'
        ]
      ),
      reviewPacketRequirement(
        'steady_state_transport_parity',
        'Capture steady-state `/health` and `/runtime-state` evidence after one normal controller-driven mutation.',
        [
          steadyStateProofCaptureGuidePath,
          reviewPacketTemplatePath,
          'docs/operations/portmanager-debian-12-acceptance-recipe.md',
          'apps/controller/src/controller-server.ts'
        ]
      ),
      reviewPacketRequirement(
        'backup_restore_parity',
        'Capture backup manifest linkage, remote-backup result if configured, and restore outcome notes from the same review packet.',
        [
          backupRestoreProofCaptureGuidePath,
          reviewPacketTemplatePath,
          'docs/operations/portmanager-debian-12-acceptance-recipe.md',
          'docs/operations/portmanager-backup-rollback-policy.md'
        ]
      ),
      reviewPacketRequirement(
        'diagnostics_parity',
        'Capture diagnostics artifact paths plus linked controller event references for the candidate host after transport rehearsal.',
        [
          diagnosticsProofCaptureGuidePath,
          reviewPacketTemplatePath,
          'docs/operations/portmanager-debian-12-acceptance-recipe.md',
          'docs/operations/portmanager-backup-rollback-policy.md'
        ]
      ),
      reviewPacketRequirement(
        'rollback_parity',
        'Capture rollback-point linkage, rollback result summary, and post-rollback diagnostics in the same packet.',
        [
          reviewPacketTemplatePath,
          'docs/operations/portmanager-debian-12-acceptance-recipe.md',
          'docs/operations/portmanager-backup-rollback-policy.md'
        ]
      )
    ]
  }
}

function buildBootstrapProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetBootstrapProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)

  return {
    candidateTargetProfileId,
    guidePath: bootstrapProofCaptureGuidePath,
    summary:
      `Bootstrap-proof capture stays explicit for ${candidateTargetProfileId}: use one bounded guide before bootstrap parity can move beyond review-prep.`,
    requiredArtifacts: [
      bootstrapProofArtifact('bootstrap_operation_id'),
      bootstrapProofArtifact('bootstrap_result_summary'),
      bootstrapProofArtifact('audit_reference'),
      bootstrapProofArtifact('target_profile_confirmation')
    ],
    sources: [
      bootstrapProofCaptureGuidePath,
      reviewPacketTemplatePath,
      'docs/operations/portmanager-debian-12-acceptance-recipe.md',
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

function buildSteadyStateProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetSteadyStateProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)

  return {
    candidateTargetProfileId,
    guidePath: steadyStateProofCaptureGuidePath,
    summary:
      `Steady-state proof capture stays explicit for ${candidateTargetProfileId}: preserve one post-bootstrap health and runtime bundle before steady-state parity can move.`,
    requiredArtifacts: [
      steadyStateProofArtifact('post_mutation_operation_id'),
      steadyStateProofArtifact('health_capture'),
      steadyStateProofArtifact('runtime_state_capture'),
      steadyStateProofArtifact('controller_audit_reference')
    ],
    sources: [
      steadyStateProofCaptureGuidePath,
      reviewPacketTemplatePath,
      'docs/operations/portmanager-debian-12-acceptance-recipe.md',
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

function buildBackupRestoreProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetBackupRestoreProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)

  return {
    candidateTargetProfileId,
    guidePath: backupRestoreProofCaptureGuidePath,
    summary:
      `Backup-and-restore proof capture stays explicit for ${candidateTargetProfileId}: preserve one backup-bearing mutation bundle before backup parity can move.`,
    requiredArtifacts: [
      backupRestoreProofArtifact('backup_bearing_mutation_id'),
      backupRestoreProofArtifact('backup_manifest_path'),
      backupRestoreProofArtifact('remote_backup_result'),
      backupRestoreProofArtifact('restore_readiness_reference')
    ],
    sources: [
      backupRestoreProofCaptureGuidePath,
      reviewPacketTemplatePath,
      'docs/operations/portmanager-debian-12-acceptance-recipe.md',
      'docs/operations/portmanager-backup-rollback-policy.md'
    ]
  }
}

function buildDiagnosticsProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetDiagnosticsProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)

  return {
    candidateTargetProfileId,
    guidePath: diagnosticsProofCaptureGuidePath,
    summary:
      `Diagnostics proof capture stays explicit for ${candidateTargetProfileId}: preserve one diagnostics artifact bundle before diagnostics parity can move.`,
    requiredArtifacts: [
      diagnosticsProofArtifact('diagnostics_operation_id'),
      diagnosticsProofArtifact('diagnostics_artifact_paths'),
      diagnosticsProofArtifact('controller_event_reference'),
      diagnosticsProofArtifact('drift_operator_note')
    ],
    sources: [
      diagnosticsProofCaptureGuidePath,
      reviewPacketTemplatePath,
      'docs/operations/portmanager-debian-12-acceptance-recipe.md',
      'docs/operations/portmanager-backup-rollback-policy.md',
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

export function createDefaultSecondTargetPolicySnapshot(): SecondTargetPolicySnapshot {
  const candidateTargetProfiles = listCandidateTargetProfiles().map((profile) =>
    summarizeTargetProfile(profile.id)
  )
  const evidenceItems = createDefaultSecondTargetEvidenceItems()

  return {
    lockedTargetProfileId: defaultTargetProfileId,
    reviewOwner: 'controller',
    supportedTargetProfiles: listSupportedTargetProfiles().map((profile) =>
      summarizeTargetProfile(profile.id)
    ),
    candidateTargetProfiles,
    candidateTargetProfileIds: candidateTargetProfiles.map((profile) => profile.id),
    targetRegistryPublished: true,
    bootstrapTransportParity: false,
    steadyStateTransportParity: false,
    backupRestoreParity: false,
    diagnosticsParity: false,
    rollbackParity: false,
    docsContractReady: true,
    acceptanceRecipeReady: true,
    operatorOwnershipDefined: true,
    evidenceItems
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
    candidateTargetProfiles: [...snapshot.candidateTargetProfiles],
    candidateTargetProfileIds: [...resolvedCandidateTargetProfileIds(snapshot)],
    decisionState,
    expansionReviewRequired: decisionState === 'review_required',
    summary: buildSummary(decisionState, blockingCriteria),
    nextActions: buildNextActions(snapshot, decisionState),
    reviewPacketTemplate: buildReviewPacketTemplate(snapshot),
    bootstrapProofCapture: buildBootstrapProofCapture(snapshot),
    steadyStateProofCapture: buildSteadyStateProofCapture(snapshot),
    backupRestoreProofCapture: buildBackupRestoreProofCapture(snapshot),
    diagnosticsProofCapture: buildDiagnosticsProofCapture(snapshot),
    satisfiedCriteria,
    blockingCriteria,
    evidenceItems: (snapshot.evidenceItems ?? []).map((item) => ({
      criterionId: item.criterionId,
      label: item.label,
      state: item.state,
      summary: item.summary,
      sources: [...item.sources]
    }))
  }
}

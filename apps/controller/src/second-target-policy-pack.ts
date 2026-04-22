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

export type SecondTargetRollbackProofArtifactId =
  | 'rollback_point_id'
  | 'rollback_operation_id'
  | 'rollback_result_summary'
  | 'post_rollback_diagnostics_linkage'

export interface SecondTargetRollbackProofArtifact {
  id: SecondTargetRollbackProofArtifactId
  label: string
  summary: string
}

export interface SecondTargetRollbackProofCapture {
  candidateTargetProfileId: string
  guidePath: string
  summary: string
  requiredArtifacts: SecondTargetRollbackProofArtifact[]
  sources: string[]
}

export type SecondTargetReviewArtifactId =
  | SecondTargetBootstrapProofArtifactId
  | SecondTargetSteadyStateProofArtifactId
  | SecondTargetBackupRestoreProofArtifactId
  | SecondTargetDiagnosticsProofArtifactId
  | SecondTargetRollbackProofArtifactId

export type SecondTargetReviewPacketReadinessState =
  | 'guide_set_incomplete'
  | 'capture_required'
  | 'capture_in_progress'
  | 'packet_ready'

export interface SecondTargetReviewPacketCoverage {
  available: number
  expected: number
}

export interface SecondTargetReviewPacketGuideCoverage extends SecondTargetReviewPacketCoverage {
  missingPaths: string[]
}

export interface SecondTargetReviewPacketArtifactCoverage extends SecondTargetReviewPacketCoverage {
  missingArtifactIds: SecondTargetReviewArtifactId[]
}

export interface SecondTargetNextExecutionUnit {
  id: string
  title: string
  summary: string
}

export interface SecondTargetReviewPacketReadiness {
  candidateTargetProfileId: string
  state: SecondTargetReviewPacketReadinessState
  summary: string
  requiredNextAction: string
  guideCoverage: SecondTargetReviewPacketGuideCoverage
  artifactCoverage: SecondTargetReviewPacketArtifactCoverage
  nextExecutionUnits: SecondTargetNextExecutionUnit[]
}

export type SecondTargetReviewAdjudicationState = 'not_open' | 'review_open'

export type SecondTargetReviewVerdictId =
  | 'packet_integrity'
  | 'drift_acknowledged'
  | 'support_lock_confirmed'
  | 'operator_signoff'
  | 'follow_up_scope_bounded'

export interface SecondTargetReviewVerdict {
  id: SecondTargetReviewVerdictId
  label: string
  summary: string
  sources: string[]
}

export type SecondTargetReviewDeltaState = 'blocking'

export type SecondTargetReviewDeltaId = 'container_bridge_transport_substitution'

export interface SecondTargetReviewDelta {
  id: SecondTargetReviewDeltaId
  label: string
  state: SecondTargetReviewDeltaState
  summary: string
  requiredFollowUp: string
  sources: string[]
}

export interface SecondTargetReviewAdjudication {
  state: SecondTargetReviewAdjudicationState
  reviewOwner: SecondTargetPolicySnapshot['reviewOwner']
  candidateTargetProfileId: string
  contractPath: string
  packetRoot: string
  summary: string
  pendingVerdicts: SecondTargetReviewVerdict[]
  blockingDeltas: SecondTargetReviewDelta[]
  sources: string[]
}

export type SecondTargetLiveTransportFollowUpState =
  | 'deferred'
  | 'capture_required'
  | 'capture_complete'

export type SecondTargetLiveTransportFollowUpArtifactId =
  | 'candidate_host_with_tailscale_ip'
  | 'bootstrap_operation_with_tailscale_transport'
  | 'steady_state_health_with_tailscale_transport'
  | 'steady_state_runtime_state_with_tailscale_transport'
  | 'linked_controller_audit_reference'

export interface SecondTargetLiveTransportFollowUpArtifact {
  id: SecondTargetLiveTransportFollowUpArtifactId
  label: string
  summary: string
}

export interface SecondTargetLiveTransportFollowUp {
  state: SecondTargetLiveTransportFollowUpState
  candidateTargetProfileId: string
  guidePath: string
  artifactRootPattern: string
  currentRecordedAddress: string
  capturedPacketRoot?: string
  capturedAddress?: string
  summary: string
  requiredNextAction: string
  requiredArtifacts: SecondTargetLiveTransportFollowUpArtifact[]
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
  reviewPacketGuidePaths?: string[]
  capturedReviewArtifactIds?: SecondTargetReviewArtifactId[]
  liveTransportCaptureArtifactRoot?: string
  liveTransportCapturedAddress?: string
  liveTransportCapturedArtifactIds?: SecondTargetLiveTransportFollowUpArtifactId[]
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
  reviewPacketReadiness: SecondTargetReviewPacketReadiness
  reviewAdjudication: SecondTargetReviewAdjudication
  liveTransportFollowUp: SecondTargetLiveTransportFollowUp
  reviewPacketTemplate: SecondTargetReviewPacketTemplate
  bootstrapProofCapture: SecondTargetBootstrapProofCapture
  steadyStateProofCapture: SecondTargetSteadyStateProofCapture
  backupRestoreProofCapture: SecondTargetBackupRestoreProofCapture
  diagnosticsProofCapture: SecondTargetDiagnosticsProofCapture
  rollbackProofCapture: SecondTargetRollbackProofCapture
  satisfiedCriteria: SecondTargetPolicyCriterion[]
  blockingCriteria: SecondTargetPolicyCriterion[]
  evidenceItems: SecondTargetPolicyEvidenceItem[]
}

const secondTargetReviewContractPath = 'docs/operations/portmanager-second-target-review-contract.md'
const secondTargetOperatorOwnershipPath =
  'docs/operations/portmanager-debian-12-operator-ownership.md'
const reviewPacketTemplatePath = 'docs/operations/portmanager-debian-12-review-packet-template.md'
const bootstrapProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-bootstrap-proof-capture.md'
const steadyStateProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-steady-state-proof-capture.md'
const backupRestoreProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-backup-restore-proof-capture.md'
const diagnosticsProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-diagnostics-proof-capture.md'
const rollbackProofCaptureGuidePath =
  'docs/operations/portmanager-debian-12-rollback-proof-capture.md'
const liveTailscaleFollowUpGuidePath =
  'docs/operations/portmanager-debian-12-live-tailscale-follow-up-capture.md'
const bootstrapCaptureArtifactRoot =
  'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21'
const liveTailscaleFollowUpArtifactRootPrefix =
  'docs/operations/artifacts/debian-12-live-tailscale-packet-'
const liveTailscaleFollowUpArtifactRootPattern =
  'docs/operations/artifacts/debian-12-live-tailscale-packet-<date>/'
const preservedDockerBridgeAddress = '172.17.0.2'
const bootstrapCaptureSummaryPath = `${bootstrapCaptureArtifactRoot}/bootstrap-capture-summary.json`
const bootstrapCaptureOperationPath = `${bootstrapCaptureArtifactRoot}/bootstrap-operation.json`
const bootstrapCaptureAuditIndexPath = `${bootstrapCaptureArtifactRoot}/bootstrap-audit-index.json`
const bootstrapCaptureHostDetailPath = `${bootstrapCaptureArtifactRoot}/bootstrap-host-detail.json`
const steadyStateCaptureSummaryPath = `${bootstrapCaptureArtifactRoot}/steady-state-capture-summary.json`
const steadyStateCaptureOperationPath = `${bootstrapCaptureArtifactRoot}/steady-state-operation.json`
const steadyStateCaptureHealthPath = `${bootstrapCaptureArtifactRoot}/steady-state-health.json`
const steadyStateCaptureRuntimeStatePath =
  `${bootstrapCaptureArtifactRoot}/steady-state-runtime-state.json`
const steadyStateCaptureAuditIndexPath = `${bootstrapCaptureArtifactRoot}/steady-state-audit-index.json`
const steadyStateCaptureHostDetailPath = `${bootstrapCaptureArtifactRoot}/steady-state-host-detail.json`
const backupCaptureSummaryPath = `${bootstrapCaptureArtifactRoot}/backup-capture-summary.json`
const backupCaptureOperationPath = `${bootstrapCaptureArtifactRoot}/backup-operation.json`
const backupCaptureSummaryDetailPath = `${bootstrapCaptureArtifactRoot}/backup-summary.json`
const backupCaptureRollbackPointsPath = `${bootstrapCaptureArtifactRoot}/backup-rollback-points.json`
const backupCaptureHostDetailPath = `${bootstrapCaptureArtifactRoot}/backup-host-detail.json`
const backupCaptureGitHubUploadPath = `${bootstrapCaptureArtifactRoot}/backup-github-upload.json`
const backupCaptureManifestPath =
  `${bootstrapCaptureArtifactRoot}/backups/backup_op_backup_1776807481139_825/manifest.json`
const diagnosticsCaptureSummaryPath = `${bootstrapCaptureArtifactRoot}/diagnostics-capture-summary.json`
const diagnosticsCaptureOperationPath = `${bootstrapCaptureArtifactRoot}/diagnostics-operation.json`
const diagnosticsCaptureArtifactsPath = `${bootstrapCaptureArtifactRoot}/diagnostics-artifacts.json`
const diagnosticsCaptureAuditIndexPath = `${bootstrapCaptureArtifactRoot}/diagnostics-audit-index.json`
const diagnosticsCaptureHostDetailPath = `${bootstrapCaptureArtifactRoot}/diagnostics-host-detail.json`
const rollbackCaptureSummaryPath = `${bootstrapCaptureArtifactRoot}/rollback-capture-summary.json`
const rollbackCaptureOperationPath = `${bootstrapCaptureArtifactRoot}/rollback-operation.json`
const rollbackCaptureResultSummaryPath = `${bootstrapCaptureArtifactRoot}/rollback-result.json`
const rollbackCaptureResultPath =
  `${bootstrapCaptureArtifactRoot}/rollback/rp_op_backup_1776807481139_825-result.json`
const rollbackCapturePostDiagnosticsPath =
  `${bootstrapCaptureArtifactRoot}/rollback-post-diagnostics.json`
const rollbackCapturePostDiagnosticsAuditIndexPath =
  `${bootstrapCaptureArtifactRoot}/rollback-post-diagnostics-audit-index.json`
const rollbackCaptureHostDetailPath = `${bootstrapCaptureArtifactRoot}/rollback-host-detail.json`
const packetReadyPolicyPackPath = `${bootstrapCaptureArtifactRoot}/packet-ready-policy-pack.json`
const packetReadmePath = `${bootstrapCaptureArtifactRoot}/README.md`
const bootstrapCapturedArtifactIds: SecondTargetReviewArtifactId[] = [
  'bootstrap_operation_id',
  'bootstrap_result_summary',
  'audit_reference',
  'target_profile_confirmation'
]
const steadyStateCapturedArtifactIds: SecondTargetReviewArtifactId[] = [
  'post_mutation_operation_id',
  'health_capture',
  'runtime_state_capture',
  'controller_audit_reference'
]
const backupCapturedArtifactIds: SecondTargetReviewArtifactId[] = [
  'backup_bearing_mutation_id',
  'backup_manifest_path',
  'remote_backup_result',
  'restore_readiness_reference'
]
const diagnosticsCapturedArtifactIds: SecondTargetReviewArtifactId[] = [
  'diagnostics_operation_id',
  'diagnostics_artifact_paths',
  'controller_event_reference',
  'drift_operator_note'
]
const rollbackCapturedArtifactIds: SecondTargetReviewArtifactId[] = [
  'rollback_point_id',
  'rollback_operation_id',
  'rollback_result_summary',
  'post_rollback_diagnostics_linkage'
]
const reviewPacketGuidePaths = [
  reviewPacketTemplatePath,
  bootstrapProofCaptureGuidePath,
  steadyStateProofCaptureGuidePath,
  backupRestoreProofCaptureGuidePath,
  diagnosticsProofCaptureGuidePath,
  rollbackProofCaptureGuidePath
] as const satisfies readonly string[]
const allReviewPacketArtifactIds: SecondTargetReviewArtifactId[] = [
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
  'restore_readiness_reference',
  'diagnostics_operation_id',
  'diagnostics_artifact_paths',
  'controller_event_reference',
  'drift_operator_note',
  'rollback_point_id',
  'rollback_operation_id',
  'rollback_result_summary',
  'post_rollback_diagnostics_linkage'
]
const executionUnits: SecondTargetNextExecutionUnit[] = [
  {
    id: 'unit_63',
    title: 'Review-packet readiness pack',
    summary:
      'Publish guide coverage, artifact coverage, required next action, and next-unit truth across controller, CLI, web, and roadmap surfaces.'
  },
  {
    id: 'unit_64',
    title: 'Bootstrap packet execution',
    summary:
      'Capture bootstrap operation id, result summary, audit linkage, and target-profile confirmation in one Debian 12 review packet.'
  },
  {
    id: 'unit_65',
    title: 'Steady-state packet execution',
    summary:
      'Capture one post-bootstrap mutation plus linked /health, /runtime-state, and controller audit evidence.'
  },
  {
    id: 'unit_66',
    title: 'Backup-and-restore packet execution',
    summary:
      'Capture one bounded backup operation, backup manifest lineage, remote-backup result, and restore-readiness linkage.'
  },
  {
    id: 'unit_67',
    title: 'Diagnostics packet execution',
    summary:
      'Capture one diagnostics operation id, artifact bundle, controller event linkage, and operator drift note.'
  },
  {
    id: 'unit_68',
    title: 'Rollback packet execution',
    summary:
      'Capture rollback-point linkage, rollback result summary, and post-rollback diagnostics evidence in the same bounded packet.'
  },
  {
    id: 'unit_69',
    title: 'Second-target review closeout',
    summary:
      'Re-read /second-target-policy-pack, confirm parity truth, and adjudicate bounded review only after the complete Debian 12 packet is preserved.'
  }
]

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
    label: 'Backup-bearing operation id',
    summary:
      'Capture one bounded backup operation id that produced the preserved backup bundle used for the Debian 12 review packet.'
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

const rollbackProofArtifactMetadata: Record<
  SecondTargetRollbackProofArtifactId,
  { label: string; summary: string }
> = {
  rollback_point_id: {
    label: 'Rollback-point id',
    summary:
      'Capture one rollback-point id selected for the Debian 12 rehearsal so the packet records exactly which recovery anchor was exercised.'
  },
  rollback_operation_id: {
    label: 'Rollback operation id',
    summary:
      'Capture one bounded rollback operation id so the Debian 12 rollback rehearsal stays anchored to explicit controller truth.'
  },
  rollback_result_summary: {
    label: 'Rollback result summary',
    summary:
      'Capture the terminal rollback result summary that states whether the rehearsal applied cleanly or stayed degraded.'
  },
  post_rollback_diagnostics_linkage: {
    label: 'Post-rollback diagnostics linkage',
    summary:
      'Capture one linked post-rollback diagnostics artifact path or audit reference from the same rollback rehearsal packet.'
  }
}

const reviewVerdictMetadata: Record<
  SecondTargetReviewVerdictId,
  { label: string; summary: string; sources: string[] }
> = {
  packet_integrity: {
    label: 'Packet integrity',
    summary:
      'Confirm the preserved Debian 12 packet still links bootstrap, steady-state, backup, diagnostics, and rollback evidence to one bounded review bundle.',
    sources: [packetReadmePath, packetReadyPolicyPackPath, reviewPacketTemplatePath]
  },
  drift_acknowledged: {
    label: 'Drift acknowledged',
    summary:
      'Acknowledge the preserved drift note for the current packet and confirm the same note stays visible before any broader support claim moves.',
    sources: [packetReadmePath, reviewPacketTemplatePath, secondTargetReviewContractPath]
  },
  support_lock_confirmed: {
    label: 'Support lock confirmed',
    summary:
      'Confirm broader support claims still stay locked to ubuntu-24.04-systemd-tailscale while bounded second-target review remains open.',
    sources: [secondTargetReviewContractPath, secondTargetOperatorOwnershipPath, 'docs-site/data/roadmap.ts']
  },
  operator_signoff: {
    label: 'Operator sign-off',
    summary:
      'Capture controller-owner sign-off that the preserved packet is still reviewable, evidence retention still holds, and no hidden parity gap is being waived.',
    sources: [secondTargetOperatorOwnershipPath, packetReadmePath]
  },
  follow_up_scope_bounded: {
    label: 'Follow-up scope bounded',
    summary:
      'Bound any review-found delta to explicit follow-up work instead of widening target support or platform claims by implication.',
    sources: [secondTargetReviewContractPath, packetReadyPolicyPackPath, 'docs/architecture/portmanager-v1-architecture.md']
  }
}

const reviewDeltaMetadata: Record<
  SecondTargetReviewDeltaId,
  {
    label: string
    state: SecondTargetReviewDeltaState
    summary: string
    requiredFollowUp: string
    sources: string[]
  }
> = {
  container_bridge_transport_substitution: {
    label: 'Container bridge transport substitution',
    state: 'blocking',
    summary:
      `Preserved Debian 12 packet still uses Docker bridge address ${preservedDockerBridgeAddress} instead of live Tailscale transport, so bounded review stays open and broader support claims remain locked.`,
    requiredFollowUp:
      'Capture one live Tailscale-backed bounded packet for debian-12-systemd-tailscale before review close, or keep the candidate blocked and support locked to Ubuntu.',
    sources: [
      packetReadmePath,
      bootstrapCaptureSummaryPath,
      steadyStateCaptureSummaryPath,
      diagnosticsCaptureSummaryPath,
      rollbackCaptureSummaryPath,
      steadyStateCaptureHostDetailPath,
      diagnosticsCaptureHostDetailPath,
      rollbackCaptureHostDetailPath
    ]
  }
}

const liveTransportFollowUpArtifactMetadata: Record<
  SecondTargetLiveTransportFollowUpArtifactId,
  { label: string; summary: string }
> = {
  candidate_host_with_tailscale_ip: {
    label: 'Candidate host with Tailscale IP',
    summary:
      'Record one host detail snapshot that shows the Debian 12 candidate on a live Tailscale-backed address instead of the preserved Docker bridge address.'
  },
  bootstrap_operation_with_tailscale_transport: {
    label: 'Bootstrap operation with Tailscale transport',
    summary:
      'Capture one bootstrap operation result whose transport summary resolves to a live Tailscale-backed address for the same bounded packet.'
  },
  steady_state_health_with_tailscale_transport: {
    label: 'Steady-state health on Tailscale transport',
    summary:
      'Capture `/health` from the same bounded packet after the candidate host is reachable over live Tailscale transport.'
  },
  steady_state_runtime_state_with_tailscale_transport: {
    label: 'Steady-state runtime state on Tailscale transport',
    summary:
      'Capture `/runtime-state` from the same bounded packet after the candidate host is reachable over live Tailscale transport.'
  },
  linked_controller_audit_reference: {
    label: 'Linked controller audit reference',
    summary:
      'Capture one controller audit-index or replay reference that links the live-Tailscale bootstrap and steady-state captures into one bounded packet.'
  }
}

const requiredLiveTransportFollowUpArtifactIds: SecondTargetLiveTransportFollowUpArtifactId[] = [
  'candidate_host_with_tailscale_ip',
  'bootstrap_operation_with_tailscale_transport',
  'steady_state_health_with_tailscale_transport',
  'steady_state_runtime_state_with_tailscale_transport',
  'linked_controller_audit_reference'
]

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

function rollbackProofArtifact(
  id: SecondTargetRollbackProofArtifactId
): SecondTargetRollbackProofArtifact {
  const metadata = rollbackProofArtifactMetadata[id]

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
      'debian-12-systemd-tailscale is declared as the only bounded-review candidate, not a supported target.',
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
      'Docs contract now freezes candidate-only wording plus review-open guardrails for the preserved Debian 12 packet.',
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
      'Operator ownership document now names who stages hosts, records evidence, signs off the bounded review, and keeps broader support locked.',
      [
        'docs/operations/portmanager-debian-12-operator-ownership.md',
        'README.md',
        'docs/architecture/portmanager-v1-architecture.md'
      ]
    ),
    evidenceItem(
      'bootstrap_transport_parity',
      'landed',
      'One bounded Debian 12 bootstrap review packet is now preserved with operation, audit, and target-profile evidence while broader support claims stay locked.',
      [
        'apps/controller/src/controller-server.ts',
        'apps/controller/src/controller-domain-service.ts',
        'tests/controller/target-profile-registry.test.ts',
        'tests/controller/host-rule-policy.test.ts',
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        bootstrapCaptureSummaryPath,
        bootstrapCaptureOperationPath,
        bootstrapCaptureAuditIndexPath,
        bootstrapCaptureHostDetailPath,
        'docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md'
      ]
    ),
    evidenceItem(
      'steady_state_transport_parity',
      'landed',
      'One bounded Debian 12 steady-state bundle is now preserved with post-bootstrap mutation, /health, /runtime-state, and controller audit evidence while broader support claims stay locked.',
      [
        steadyStateProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        steadyStateCaptureSummaryPath,
        steadyStateCaptureOperationPath,
        steadyStateCaptureHealthPath,
        steadyStateCaptureRuntimeStatePath,
        steadyStateCaptureAuditIndexPath,
        steadyStateCaptureHostDetailPath,
        'docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md'
      ]
    ),
    evidenceItem(
      'backup_restore_parity',
      'landed',
      'One bounded Debian 12 backup bundle is now preserved with backup operation, manifest lineage, GitHub remote result, and ready rollback-point evidence while broader support claims stay locked.',
      [
        backupRestoreProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/operations/portmanager-backup-rollback-policy.md',
        backupCaptureSummaryPath,
        backupCaptureOperationPath,
        backupCaptureSummaryDetailPath,
        backupCaptureRollbackPointsPath,
        backupCaptureHostDetailPath,
        backupCaptureGitHubUploadPath,
        backupCaptureManifestPath,
        'docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md'
      ]
    ),
    evidenceItem(
      'diagnostics_parity',
      'landed',
      'One bounded Debian 12 diagnostics bundle is now preserved with operation detail, artifact paths, controller event linkage, and an operator drift note while broader support claims stay locked until review.',
      [
        diagnosticsProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        diagnosticsCaptureSummaryPath,
        diagnosticsCaptureOperationPath,
        diagnosticsCaptureArtifactsPath,
        diagnosticsCaptureAuditIndexPath,
        diagnosticsCaptureHostDetailPath,
        'docs/plans/2026-04-21-portmanager-m3-review-packet-readiness-plan.md'
      ]
    ),
    evidenceItem(
      'rollback_parity',
      'landed',
      'One bounded Debian 12 rollback rehearsal is now preserved with rollback-point linkage, rollback result summary, and post-rollback diagnostics evidence while broader support claims stay locked until review.',
      [
        rollbackProofCaptureGuidePath,
        'docs/operations/portmanager-debian-12-acceptance-recipe.md',
        reviewPacketTemplatePath,
        'docs/operations/portmanager-backup-rollback-policy.md',
        rollbackCaptureSummaryPath,
        rollbackCaptureOperationPath,
        rollbackCaptureResultSummaryPath,
        rollbackCaptureResultPath,
        rollbackCapturePostDiagnosticsPath,
        rollbackCapturePostDiagnosticsAuditIndexPath,
        rollbackCaptureHostDetailPath
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

function uniqueItems<T>(items: readonly T[]) {
  return [...new Set(items)]
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
    return 'Bounded second-target review is open now because candidate target, transport parity, backup parity, diagnostics parity, rollback parity, docs contract, acceptance recipe, and operator ownership are all present while broader support still stays locked to Ubuntu.'
  }

  if (decisionState === 'prepare_review') {
    return `Second-target review prep can begin because transport and recovery parity are ready, but ${joinCriterionLabels(blockingCriteria)} are still missing.`
  }

  return `Second-target support must stay on hold because ${joinCriterionLabels(blockingCriteria)} are still missing.`
}

function remainingParityCriterionIds(snapshot: SecondTargetPolicySnapshot) {
  const remaining: SecondTargetPolicyCriterionId[] = []

  if (!snapshot.bootstrapTransportParity) {
    remaining.push('bootstrap_transport_parity')
  }
  if (!snapshot.steadyStateTransportParity) {
    remaining.push('steady_state_transport_parity')
  }
  if (!snapshot.backupRestoreParity) {
    remaining.push('backup_restore_parity')
  }
  if (!snapshot.diagnosticsParity) {
    remaining.push('diagnostics_parity')
  }
  if (!snapshot.rollbackParity) {
    remaining.push('rollback_parity')
  }

  return remaining
}

function remainingParityLabelText(snapshot: SecondTargetPolicySnapshot) {
  return joinCriterionLabels(remainingParityCriterionIds(snapshot).map((id) => criterionFrom(id, false)))
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
      `Work through bounded second-target review for ${candidateTargets} before widening supported-target claims beyond ${lockedTarget}.`,
      'Keep controller, CLI, Web, and docs contract wording aligned while review adjudication validates the preserved parity packet and keeps the Docker-bridge transport delta explicit.',
      'Record packet verdicts, operator sign-off, and the live-Tailscale follow-up delta before any broader support claim moves.'
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
      const remainingParityLabels = remainingParityLabelText(snapshot)

      return [
        `Keep supported targets locked to ${lockedTarget}.`,
        `Keep ${candidateTargets} in review-prep until ${remainingParityLabels} are all real.`,
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

function resolvedReviewPacketGuidePaths(snapshot: SecondTargetPolicySnapshot) {
  if ((snapshot.reviewPacketGuidePaths?.length ?? 0) > 0) {
    return uniqueItems(snapshot.reviewPacketGuidePaths ?? [])
  }

  return [...reviewPacketGuidePaths]
}

function resolvedCapturedReviewArtifactIds(snapshot: SecondTargetPolicySnapshot) {
  return uniqueItems(snapshot.capturedReviewArtifactIds ?? [])
}

function resolvedLiveTransportCapturedArtifactIds(snapshot: SecondTargetPolicySnapshot) {
  return uniqueItems(snapshot.liveTransportCapturedArtifactIds ?? [])
}

function resolvedLiveTransportCaptureArtifactRoot(snapshot: SecondTargetPolicySnapshot) {
  const root = snapshot.liveTransportCaptureArtifactRoot?.trim()

  if (!root) {
    return undefined
  }

  return root.replace(/\/+$/u, '')
}

function resolvedLiveTransportCapturedAddress(snapshot: SecondTargetPolicySnapshot) {
  const address = snapshot.liveTransportCapturedAddress?.trim()

  return address ? address : undefined
}

function hasCompleteLiveTransportFollowUp(snapshot: SecondTargetPolicySnapshot) {
  const capturedPacketRoot = resolvedLiveTransportCaptureArtifactRoot(snapshot)
  const capturedAddress = resolvedLiveTransportCapturedAddress(snapshot)
  const capturedArtifactIds = resolvedLiveTransportCapturedArtifactIds(snapshot)

  return (
    capturedPacketRoot !== undefined &&
    capturedPacketRoot.startsWith(liveTailscaleFollowUpArtifactRootPrefix) &&
    !capturedPacketRoot.includes('<date>') &&
    capturedAddress !== undefined &&
    capturedAddress !== preservedDockerBridgeAddress &&
    requiredLiveTransportFollowUpArtifactIds.every((artifactId) =>
      capturedArtifactIds.includes(artifactId)
    )
  )
}

function buildReviewPacketGuideCoverage(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewPacketGuideCoverage {
  const availablePaths = resolvedReviewPacketGuidePaths(snapshot)

  return {
    available: availablePaths.length,
    expected: reviewPacketGuidePaths.length,
    missingPaths: reviewPacketGuidePaths.filter((path) => !availablePaths.includes(path))
  }
}

function buildReviewPacketArtifactCoverage(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewPacketArtifactCoverage {
  const capturedArtifactIds = resolvedCapturedReviewArtifactIds(snapshot)

  return {
    available: capturedArtifactIds.length,
    expected: allReviewPacketArtifactIds.length,
    missingArtifactIds: allReviewPacketArtifactIds.filter(
      (artifactId) => !capturedArtifactIds.includes(artifactId)
    )
  }
}

function nextExecutionUnitsFrom(snapshot: SecondTargetPolicySnapshot) {
  const skipIds = new Set<SecondTargetNextExecutionUnit['id']>(['unit_63'])
  if (snapshot.bootstrapTransportParity) {
    skipIds.add('unit_64')
  }
  if (snapshot.steadyStateTransportParity) {
    skipIds.add('unit_65')
  }
  if (snapshot.backupRestoreParity) {
    skipIds.add('unit_66')
  }
  if (snapshot.diagnosticsParity) {
    skipIds.add('unit_67')
  }
  if (snapshot.rollbackParity) {
    skipIds.add('unit_68')
  }
  if (decisionStateFrom(snapshot) === 'review_required') {
    skipIds.add('unit_69')
  }

  return executionUnits
    .filter((unit) => !skipIds.has(unit.id))
    .map((unit) => ({ ...unit }))
}

function reviewPacketReadinessStateFrom(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewPacketReadinessState {
  const guideCoverage = buildReviewPacketGuideCoverage(snapshot)
  const artifactCoverage = buildReviewPacketArtifactCoverage(snapshot)

  if (guideCoverage.missingPaths.length > 0) {
    return 'guide_set_incomplete'
  }

  if (artifactCoverage.available === 0) {
    return 'capture_required'
  }

  if (artifactCoverage.available < artifactCoverage.expected) {
    return 'capture_in_progress'
  }

  return 'packet_ready'
}

function buildReviewPacketReadiness(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewPacketReadiness {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const guideCoverage = buildReviewPacketGuideCoverage(snapshot)
  const artifactCoverage = buildReviewPacketArtifactCoverage(snapshot)
  const state = reviewPacketReadinessStateFrom(snapshot)
  const nextExecutionUnits = nextExecutionUnitsFrom(snapshot)

  if (state === 'guide_set_incomplete') {
    return {
      candidateTargetProfileId,
      state,
      summary:
        `Review-packet guide set is incomplete for ${candidateTargetProfileId}; keep the candidate on hold until every capture guide and the template path exist together.`,
      requiredNextAction:
        'Finish the missing review-packet guide paths before starting any Debian 12 parity execution.',
      guideCoverage,
      artifactCoverage,
      nextExecutionUnits
    }
  }

  if (state === 'packet_ready') {
    return {
      candidateTargetProfileId,
      state,
      summary:
        `Review-packet artifact coverage is complete for ${candidateTargetProfileId}; bounded second-target review is open, so adjudicate the preserved packet instead of inventing new guide work.`,
      requiredNextAction:
        'Adjudicate bounded second-target review and record packet verdicts against the preserved Debian 12 packet.',
      guideCoverage,
      artifactCoverage,
      nextExecutionUnits
    }
  }

  if (state === 'capture_in_progress') {
    if (
      snapshot.bootstrapTransportParity &&
      snapshot.steadyStateTransportParity &&
      snapshot.backupRestoreParity
    ) {
      return {
        candidateTargetProfileId,
        state,
        summary:
          `Bootstrap, steady-state, and backup packet capture are preserved for ${candidateTargetProfileId}; diagnostics and rollback artifacts are still missing from the bounded Debian 12 packet.`,
        requiredNextAction:
          'Execute Units 67 through 69 so the remaining Debian 12 packet sections are preserved before any broader review or support claim moves.',
        guideCoverage,
        artifactCoverage,
        nextExecutionUnits
      }
    }

    if (snapshot.bootstrapTransportParity && snapshot.steadyStateTransportParity) {
      return {
        candidateTargetProfileId,
        state,
        summary:
          `Bootstrap and steady-state packet capture are preserved for ${candidateTargetProfileId}; backup-and-restore, diagnostics, and rollback artifacts are still missing from the bounded Debian 12 packet.`,
        requiredNextAction:
          'Execute Units 66 through 69 so the remaining Debian 12 packet sections are preserved before any broader review or support claim moves.',
        guideCoverage,
        artifactCoverage,
        nextExecutionUnits
      }
    }

    if (snapshot.bootstrapTransportParity) {
      return {
        candidateTargetProfileId,
        state,
        summary:
          `Bootstrap packet capture is preserved for ${candidateTargetProfileId}; steady-state, backup-and-restore, diagnostics, and rollback artifacts are still missing from the bounded Debian 12 packet.`,
        requiredNextAction:
          'Execute Units 65 through 69 so the remaining Debian 12 packet sections are preserved before any broader review or support claim moves.',
        guideCoverage,
        artifactCoverage,
        nextExecutionUnits
      }
    }

    return {
      candidateTargetProfileId,
      state,
      summary:
        `Review-packet capture is in progress for ${candidateTargetProfileId}; guide coverage is complete, but some Debian 12 execution artifacts are still missing from the bounded packet.`,
      requiredNextAction:
        'Finish the remaining Debian 12 packet artifacts before moving any parity criterion or support claim.',
      guideCoverage,
      artifactCoverage,
      nextExecutionUnits
    }
  }

  return {
    candidateTargetProfileId,
    state,
    summary:
      `Review-packet guide set is complete for ${candidateTargetProfileId}, but no Debian 12 execution artifacts are captured yet. Current truth is template-ready, not packet-ready.`,
    requiredNextAction:
      'Execute one bounded Debian 12 review packet before changing any bootstrap, steady-state, backup, diagnostics, or rollback parity claim.',
    guideCoverage,
    artifactCoverage,
    nextExecutionUnits
  }
}

function reviewVerdict(id: SecondTargetReviewVerdictId): SecondTargetReviewVerdict {
  const metadata = reviewVerdictMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary,
    sources: [...metadata.sources]
  }
}

function reviewDelta(id: SecondTargetReviewDeltaId): SecondTargetReviewDelta {
  const metadata = reviewDeltaMetadata[id]

  return {
    id,
    label: metadata.label,
    state: metadata.state,
    summary: metadata.summary,
    requiredFollowUp: metadata.requiredFollowUp,
    sources: [...metadata.sources]
  }
}

function liveTransportFollowUpArtifact(
  id: SecondTargetLiveTransportFollowUpArtifactId
): SecondTargetLiveTransportFollowUpArtifact {
  const metadata = liveTransportFollowUpArtifactMetadata[id]

  return {
    id,
    label: metadata.label,
    summary: metadata.summary
  }
}

function buildReviewAdjudication(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetReviewAdjudication {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const decisionState = decisionStateFrom(snapshot)
  const readinessState = reviewPacketReadinessStateFrom(snapshot)
  const liveTransportFollowUpComplete = hasCompleteLiveTransportFollowUp(snapshot)
  const capturedPacketRoot = resolvedLiveTransportCaptureArtifactRoot(snapshot)
  const capturedAddress = resolvedLiveTransportCapturedAddress(snapshot)
  const state: SecondTargetReviewAdjudicationState =
    decisionState === 'review_required' && readinessState === 'packet_ready'
      ? 'review_open'
      : 'not_open'
  const sources = [
    secondTargetReviewContractPath,
    secondTargetOperatorOwnershipPath,
    packetReadmePath,
    packetReadyPolicyPackPath,
    reviewPacketTemplatePath
  ]

  if (state === 'review_open') {
    return {
      state,
      reviewOwner: snapshot.reviewOwner,
      candidateTargetProfileId,
      contractPath: secondTargetReviewContractPath,
      packetRoot: bootstrapCaptureArtifactRoot,
      summary:
        liveTransportFollowUpComplete && capturedPacketRoot && capturedAddress
          ? `Bounded second-target review is open for ${candidateTargetProfileId}; live Tailscale follow-up is now preserved at ${capturedPacketRoot} on address ${capturedAddress}, so adjudicate packet integrity, drift acknowledgement, support lock, operator sign-off, and bounded follow-up closure against both packets.`
          : `Bounded second-target review is open for ${candidateTargetProfileId}; adjudicate packet integrity, drift acknowledgement, support lock, operator sign-off, and follow-up scope while the Docker-bridge-only packet delta stays explicit.`,
      pendingVerdicts: [
        reviewVerdict('packet_integrity'),
        reviewVerdict('drift_acknowledged'),
        reviewVerdict('support_lock_confirmed'),
        reviewVerdict('operator_signoff'),
        reviewVerdict('follow_up_scope_bounded')
      ],
      blockingDeltas: liveTransportFollowUpComplete
        ? []
        : [reviewDelta('container_bridge_transport_substitution')],
      sources:
        liveTransportFollowUpComplete && capturedPacketRoot
          ? [...sources, capturedPacketRoot]
          : sources
    }
  }

  return {
    state,
    reviewOwner: snapshot.reviewOwner,
    candidateTargetProfileId,
    contractPath: secondTargetReviewContractPath,
    packetRoot: bootstrapCaptureArtifactRoot,
    summary:
      `Bounded second-target review is not open for ${candidateTargetProfileId}; keep packet capture and public wording aligned until decision state is review_required and readiness is packet_ready.`,
    pendingVerdicts: [],
    blockingDeltas: [],
    sources
  }
}

function buildLiveTransportFollowUp(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetLiveTransportFollowUp {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const reviewAdjudication = buildReviewAdjudication(snapshot)
  const capturedPacketRoot = resolvedLiveTransportCaptureArtifactRoot(snapshot)
  const capturedAddress = resolvedLiveTransportCapturedAddress(snapshot)
  const liveTransportFollowUpComplete = hasCompleteLiveTransportFollowUp(snapshot)
  const state: SecondTargetLiveTransportFollowUpState =
    reviewAdjudication.state !== 'review_open'
      ? 'deferred'
      : liveTransportFollowUpComplete
        ? 'capture_complete'
        : 'capture_required'
  const requiredArtifacts = requiredLiveTransportFollowUpArtifactIds.map((id) =>
    liveTransportFollowUpArtifact(id)
  )
  const sources = [
    liveTailscaleFollowUpGuidePath,
    packetReadmePath,
    bootstrapCaptureSummaryPath,
    steadyStateCaptureSummaryPath,
    secondTargetReviewContractPath,
    secondTargetOperatorOwnershipPath
  ]

  if (state === 'deferred') {
    return {
      state,
      candidateTargetProfileId,
      guidePath: liveTailscaleFollowUpGuidePath,
      artifactRootPattern: liveTailscaleFollowUpArtifactRootPattern,
      currentRecordedAddress: preservedDockerBridgeAddress,
      summary:
        `Live Tailscale follow-up stays deferred for ${candidateTargetProfileId} until bounded review is open with one complete preserved packet.`,
      requiredNextAction:
        'Keep the preserved Debian 12 packet intact, then reopen live-Tailscale capture only after bounded review is ready for blocking-delta follow-up.',
      requiredArtifacts,
      sources
    }
  }

  if (state === 'capture_complete') {
    return {
      state,
      candidateTargetProfileId,
      guidePath: liveTailscaleFollowUpGuidePath,
      artifactRootPattern: liveTailscaleFollowUpArtifactRootPattern,
      currentRecordedAddress: preservedDockerBridgeAddress,
      capturedPacketRoot,
      capturedAddress,
      summary:
        `Live Tailscale follow-up is already captured for ${candidateTargetProfileId}; newer packet ${capturedPacketRoot} records live Tailscale address ${capturedAddress} while the preserved Docker-bridge packet remains historical evidence.`,
      requiredNextAction:
        `Keep \`/second-target-policy-pack\`, docs, CLI, and Web aligned with captured packet ${capturedPacketRoot} before narrowing any support-lock wording.`,
      requiredArtifacts,
      sources: capturedPacketRoot ? [...sources, capturedPacketRoot] : sources
    }
  }

  return {
    state,
    candidateTargetProfileId,
    guidePath: liveTailscaleFollowUpGuidePath,
    artifactRootPattern: liveTailscaleFollowUpArtifactRootPattern,
    currentRecordedAddress: preservedDockerBridgeAddress,
    summary:
      `Capture one live Tailscale-backed bounded packet for ${candidateTargetProfileId} because the preserved packet still resolves to Docker bridge address ${preservedDockerBridgeAddress}.`,
    requiredNextAction:
      'Capture one new Debian 12 packet on a real tailnet-backed address and keep the preserved Docker-bridge packet as historical evidence instead of mutating it in place.',
    requiredArtifacts,
    sources
  }
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
          rollbackProofCaptureGuidePath,
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
  const summary = snapshot.bootstrapTransportParity
    ? `Bootstrap-proof capture is already preserved for ${candidateTargetProfileId}: keep the captured Debian 12 bundle linked while the remaining packet sections are completed.`
    : `Bootstrap-proof capture stays explicit for ${candidateTargetProfileId}: use one bounded guide before bootstrap parity can move beyond review-prep.`

  return {
    candidateTargetProfileId,
    guidePath: bootstrapProofCaptureGuidePath,
    summary,
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
      bootstrapCaptureSummaryPath,
      bootstrapCaptureOperationPath,
      bootstrapCaptureAuditIndexPath,
      bootstrapCaptureHostDetailPath,
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

function buildSteadyStateProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetSteadyStateProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const summary = snapshot.steadyStateTransportParity
    ? `Steady-state proof capture is already preserved for ${candidateTargetProfileId}: keep the captured Debian 12 post-bootstrap mutation, /health, /runtime-state, and audit bundle linked while the remaining packet sections are completed.`
    : `Steady-state proof capture stays explicit for ${candidateTargetProfileId}: preserve one post-bootstrap health and runtime bundle before steady-state parity can move.`

  return {
    candidateTargetProfileId,
    guidePath: steadyStateProofCaptureGuidePath,
    summary,
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
      steadyStateCaptureSummaryPath,
      steadyStateCaptureOperationPath,
      steadyStateCaptureHealthPath,
      steadyStateCaptureRuntimeStatePath,
      steadyStateCaptureAuditIndexPath,
      steadyStateCaptureHostDetailPath,
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

function buildBackupRestoreProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetBackupRestoreProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const summary = snapshot.backupRestoreParity
    ? `Backup-and-restore proof capture is already preserved for ${candidateTargetProfileId}: keep the bounded backup operation, manifest lineage, remote-backup result, and restore-readiness bundle linked while diagnostics and rollback sections are completed.`
    : `Backup-and-restore proof capture stays explicit for ${candidateTargetProfileId}: preserve one bounded backup operation bundle before backup parity can move.`

  return {
    candidateTargetProfileId,
    guidePath: backupRestoreProofCaptureGuidePath,
    summary,
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
      'docs/operations/portmanager-backup-rollback-policy.md',
      backupCaptureSummaryPath,
      backupCaptureOperationPath,
      backupCaptureSummaryDetailPath,
      backupCaptureRollbackPointsPath,
      backupCaptureHostDetailPath,
      backupCaptureGitHubUploadPath,
      backupCaptureManifestPath,
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/local-backup-primitive.ts'
    ]
  }
}

function buildDiagnosticsProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetDiagnosticsProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const summary = snapshot.diagnosticsParity
    ? `Diagnostics proof capture is already preserved for ${candidateTargetProfileId}: keep the bounded diagnostics artifact bundle, controller event linkage, and operator drift note linked while second-target review validates the full Debian 12 packet.`
    : `Diagnostics proof capture stays explicit for ${candidateTargetProfileId}: preserve one diagnostics artifact bundle before diagnostics parity can move.`

  return {
    candidateTargetProfileId,
    guidePath: diagnosticsProofCaptureGuidePath,
    summary,
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
      diagnosticsCaptureSummaryPath,
      diagnosticsCaptureOperationPath,
      diagnosticsCaptureArtifactsPath,
      diagnosticsCaptureAuditIndexPath,
      diagnosticsCaptureHostDetailPath,
      'apps/controller/src/controller-server.ts',
      'apps/controller/src/controller-domain-service.ts'
    ]
  }
}

function buildRollbackProofCapture(
  snapshot: SecondTargetPolicySnapshot
): SecondTargetRollbackProofCapture {
  const candidateTargetProfileId = primaryCandidateTargetProfileId(snapshot)
  const summary = snapshot.rollbackParity
    ? `Rollback proof capture is already preserved for ${candidateTargetProfileId}: keep the bounded rollback rehearsal, rollback result, and post-rollback diagnostics linkage tied to the same Debian 12 packet while second-target review stays bounded.`
    : `Rollback proof capture stays explicit for ${candidateTargetProfileId}: preserve one bounded rollback rehearsal bundle before rollback parity can move.`

  return {
    candidateTargetProfileId,
    guidePath: rollbackProofCaptureGuidePath,
    summary,
    requiredArtifacts: [
      rollbackProofArtifact('rollback_point_id'),
      rollbackProofArtifact('rollback_operation_id'),
      rollbackProofArtifact('rollback_result_summary'),
      rollbackProofArtifact('post_rollback_diagnostics_linkage')
    ],
    sources: [
      rollbackProofCaptureGuidePath,
      reviewPacketTemplatePath,
      'docs/operations/portmanager-debian-12-acceptance-recipe.md',
      'docs/operations/portmanager-backup-rollback-policy.md',
      rollbackCaptureSummaryPath,
      rollbackCaptureOperationPath,
      rollbackCaptureResultSummaryPath,
      rollbackCaptureResultPath,
      rollbackCapturePostDiagnosticsPath,
      rollbackCapturePostDiagnosticsAuditIndexPath,
      rollbackCaptureHostDetailPath,
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
    bootstrapTransportParity: true,
    steadyStateTransportParity: true,
    backupRestoreParity: true,
    diagnosticsParity: true,
    rollbackParity: true,
    docsContractReady: true,
    acceptanceRecipeReady: true,
    operatorOwnershipDefined: true,
    reviewPacketGuidePaths: [...reviewPacketGuidePaths],
    capturedReviewArtifactIds: [
      ...bootstrapCapturedArtifactIds,
      ...steadyStateCapturedArtifactIds,
      ...backupCapturedArtifactIds,
      ...diagnosticsCapturedArtifactIds,
      ...rollbackCapturedArtifactIds
    ],
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
  const reviewAdjudication = buildReviewAdjudication(snapshot)
  const liveTransportFollowUp = buildLiveTransportFollowUp(snapshot)

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
    reviewPacketReadiness: buildReviewPacketReadiness(snapshot),
    reviewAdjudication,
    liveTransportFollowUp,
    reviewPacketTemplate: buildReviewPacketTemplate(snapshot),
    bootstrapProofCapture: buildBootstrapProofCapture(snapshot),
    steadyStateProofCapture: buildSteadyStateProofCapture(snapshot),
    backupRestoreProofCapture: buildBackupRestoreProofCapture(snapshot),
    diagnosticsProofCapture: buildDiagnosticsProofCapture(snapshot),
    rollbackProofCapture: buildRollbackProofCapture(snapshot),
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

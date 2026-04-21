import type { components, paths } from '@portmanager/typescript-contracts'

export type ControllerContracts = {
  paths: paths
  hostSummary: components['schemas']['HostSummary']
  operationDetail: components['schemas']['OperationDetail']
}

export { createControllerEventBus } from './controller-events.ts'
export { AgentClientError, createAgentClient } from './agent-client.ts'
export { createAuditReviewService } from './audit-review-service.ts'
export {
  buildConsumerBoundaryDecisionPack,
  createDefaultConsumerBoundaryDecisionSnapshot
} from './consumer-boundary-decision-pack.ts'
export { createControllerDomainService } from './controller-domain-service.ts'
export { createControllerReadModel } from './controller-read-model.ts'
export { createEventAuditIndex } from './event-audit-index.ts'
export { createOperationRunner } from './operation-runner.ts'
export { createPersistenceAdapter } from './persistence-adapter.ts'
export { buildPersistenceDecisionPack } from './persistence-decision-pack.ts'
export { createControllerServer } from './controller-server.ts'
export { closeHttpServer } from './http-server-lifecycle.ts'
export { createLocalBackupPrimitive } from './local-backup-primitive.ts'
export { createLocalDiagnosticsPrimitive } from './local-diagnostics-primitive.ts'
export { createOperationStore } from './operation-store.ts'
export {
  defaultTargetProfileId,
  describeTargetProfile,
  getTargetProfile,
  listTargetProfiles,
  summarizeTargetProfile
} from './target-profile-registry.ts'

export function controllerBootstrapMessage() {
  return 'PortManager controller skeleton'
}

import type { components, paths } from '@portmanager/typescript-contracts'

export type ControllerContracts = {
  paths: paths
  hostSummary: components['schemas']['HostSummary']
  operationDetail: components['schemas']['OperationDetail']
}

export { createControllerEventBus } from './controller-events.ts'
export { createOperationRunner } from './operation-runner.ts'
export { createControllerServer } from './controller-server.ts'
export { createLocalBackupPrimitive } from './local-backup-primitive.ts'
export { createLocalDiagnosticsPrimitive } from './local-diagnostics-primitive.ts'
export { createOperationStore } from './operation-store.ts'

export function controllerBootstrapMessage() {
  return 'PortManager controller skeleton'
}

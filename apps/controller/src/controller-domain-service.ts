import type { ApplyDesiredStateSchema, RuntimeStateSchema } from '@portmanager/typescript-contracts'

import type { ControllerAgentClient } from './agent-client.ts'
import type { LocalBackupPrimitive } from './local-backup-primitive.ts'
import type { OperationExecutionResult, OperationRunner } from './operation-runner.ts'
import type {
  BridgeRule,
  CreateBridgeRuleInput,
  ExposurePolicy,
  OperationDetail,
  OperationStore
} from './operation-store.ts'
import { defaultTargetProfileId, getTargetProfile } from './target-profile-registry.ts'

export interface ControllerDomainService {
  applyExposurePolicyBatch(input: {
    operationId: string
    hostIds: string[]
    allowedSources: string[]
    excludedPorts: number[]
    samePortMirror: boolean
    conflictPolicy: ExposurePolicy['conflictPolicy']
    backupPolicy: ExposurePolicy['backupPolicy']
    initiator: NonNullable<OperationDetail['initiator']>
  }): Promise<OperationExecutionResult>
  applyExposurePolicy(input: {
    operationId: string
    hostId: string
    allowedSources: string[]
    excludedPorts: number[]
    samePortMirror: boolean
    conflictPolicy: ExposurePolicy['conflictPolicy']
    backupPolicy: ExposurePolicy['backupPolicy']
  }): Promise<OperationExecutionResult>
  bootstrapHost(input: {
    hostId: string
    operationId: string
    desiredAgentPort: number
    backupPolicy?: ExposurePolicy['backupPolicy']
  }): Promise<OperationExecutionResult>
  createBridgeRule(input: CreateBridgeRuleInput & { operationId: string }): Promise<OperationExecutionResult>
  createHost(input: {
    hostId: string
    name: string
    labels: string[]
    targetProfileId?: string
    sshHost: string
    sshPort: number
  }): OperationExecutionResult
  probeHost(input: {
    hostId: string
    operationId: string
    mode?: 'read_only'
  }): OperationExecutionResult
  removeBridgeRule(input: { ruleId: string; operationId: string }): Promise<OperationExecutionResult>
  updateBridgeRule(input: {
    ruleId: string
    operationId: string
    name?: string
    listenPort?: number
    targetHost?: string
    targetPort?: number
  }): Promise<OperationExecutionResult>
}

function combineOperationState(
  ...states: Array<'degraded' | 'succeeded' | undefined>
): 'degraded' | 'succeeded' {
  return states.some((state) => state === 'degraded') ? 'degraded' : 'succeeded'
}

function ruleLifecycleAfterSync(
  runtimeState: RuntimeStateSchema,
  ruleId: string
): BridgeRule['lifecycleState'] | undefined {
  const appliedRule = runtimeState.appliedRules.find((entry) => entry.id === ruleId)
  return appliedRule?.status
}

function hostLifecycleFromAgentState(agentState: RuntimeStateSchema['agentState']) {
  return agentState === 'ready' ? 'ready' : 'degraded'
}

export function createControllerDomainService(options: {
  store: Pick<
    OperationStore,
    | 'enqueueOperation'
    | 'createBridgeRule'
    | 'createHealthCheck'
    | 'createHost'
    | 'getBridgeRule'
    | 'getExposurePolicy'
    | 'getHost'
    | 'getOperation'
    | 'listBridgeRules'
    | 'listOperations'
    | 'replaceExposurePolicy'
    | 'updateBridgeRule'
    | 'updateHostRuntime'
  >
  agentClient: Pick<ControllerAgentClient, 'applyDesiredState' | 'collectRuntimeState'>
  agentEndpoints: Map<string, string>
  backupPrimitive: Pick<LocalBackupPrimitive, 'applyRollback' | 'runBackup'>
  operationRunner: Pick<OperationRunner, 'run'>
}): ControllerDomainService {
  const { store, agentClient, agentEndpoints, backupPrimitive, operationRunner } = options

  function ensureSupportedTargetProfileId(targetProfileId?: string) {
    const resolvedId = targetProfileId ?? defaultTargetProfileId
    if (!getTargetProfile(resolvedId)) {
      throw new Error(`Unsupported target profile: ${resolvedId}`)
    }
    return resolvedId
  }

  function ensureSupportedHostProfile(hostId: string) {
    const host = store.getHost(hostId)
    if (!host) {
      throw new Error(`Host not found: ${hostId}`)
    }

    if (!getTargetProfile(host.targetProfileId)) {
      throw new Error(`Unsupported target profile for host ${hostId}: ${host.targetProfileId}`)
    }

    return host
  }

  function buildDesiredState(hostId: string): ApplyDesiredStateSchema {
    ensureSupportedHostProfile(hostId)
    const policy = store.getExposurePolicy(hostId)
    if (!policy) {
      throw new Error(`Exposure policy missing for host ${hostId}`)
    }

    return {
      schemaVersion: '0.1.0',
      hostId,
      policy: {
        allowedSources: [...policy.allowedSources],
        excludedPorts: [...policy.excludedPorts],
        samePortMirror: policy.samePortMirror,
        conflictPolicy: policy.conflictPolicy,
        backupPolicy: policy.backupPolicy
      },
      bridgeRules: store
        .listBridgeRules({ hostId })
        .filter((rule) => rule.lifecycleState !== 'removed')
        .map((rule) => ({
          id: rule.id,
          ...(rule.name ? { name: rule.name } : {}),
          protocol: rule.protocol,
          listenPort: rule.listenPort,
          targetHost: rule.targetHost,
          targetPort: rule.targetPort
        }))
    }
  }

  function recordAgentHealthCheck(input: {
    hostId: string
    category: 'host_probe' | 'bridge_verify'
    status: 'healthy' | 'degraded' | 'failed'
    summary: string
    ruleId?: string
    backupPolicy?: 'best_effort' | 'required'
  }) {
    store.createHealthCheck({
      id: `hc_${input.hostId}_${input.category}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      hostId: input.hostId,
      ruleId: input.ruleId,
      category: input.category,
      status: input.status,
      summary: input.summary,
      backupPolicy: input.backupPolicy
    })
  }

  function markAgentSyncFailure(input: {
    hostId: string
    summary: string
    category: 'host_probe' | 'bridge_verify'
    ruleId?: string
    backupPolicy?: 'best_effort' | 'required'
    dropEndpoint?: boolean
  }): OperationExecutionResult {
    if (input.dropEndpoint) {
      agentEndpoints.delete(input.hostId)
    }

    store.updateHostRuntime(input.hostId, {
      lifecycleState: 'degraded',
      agentState: 'unreachable'
    })

    if (input.ruleId) {
      store.updateBridgeRule(input.ruleId, {
        lifecycleState: 'degraded'
      })
    }

    recordAgentHealthCheck({
      hostId: input.hostId,
      ruleId: input.ruleId,
      category: input.category,
      status: 'failed',
      summary: input.summary,
      backupPolicy: input.backupPolicy
    })

    return {
      state: 'degraded',
      resultSummary: input.summary
    }
  }

  async function collectAgentRuntime(input: {
    hostId: string
    category: 'host_probe' | 'bridge_verify'
    ruleId?: string
    backupPolicy?: 'best_effort' | 'required'
    dropEndpointOnFailure?: boolean
  }): Promise<OperationExecutionResult & { runtimeState?: RuntimeStateSchema }> {
    const baseUrl = agentEndpoints.get(input.hostId)
    if (!baseUrl) {
      return {
        state: 'succeeded',
        resultSummary: `desired state stored locally for ${input.hostId} until bootstrap completes`
      }
    }

    try {
      const runtimeState = await agentClient.collectRuntimeState(baseUrl)
      const heartbeatAt = new Date().toISOString()
      store.updateHostRuntime(input.hostId, {
        lifecycleState: hostLifecycleFromAgentState(runtimeState.agentState),
        agentState: runtimeState.agentState,
        agentVersion: runtimeState.agentVersion,
        agentHeartbeatAt: heartbeatAt
      })

      for (const rule of store.listBridgeRules({ hostId: input.hostId })) {
        if (rule.lifecycleState === 'removed') {
          continue
        }

        const lifecycleState = ruleLifecycleAfterSync(runtimeState, rule.id)
        if (lifecycleState) {
          store.updateBridgeRule(rule.id, {
            lifecycleState
          })
        } else if (rule.lifecycleState === 'applying') {
          store.updateBridgeRule(rule.id, {
            lifecycleState: 'desired'
          })
        }
      }

      recordAgentHealthCheck({
        hostId: input.hostId,
        ruleId: input.ruleId,
        category: input.category,
        status:
          runtimeState.agentState === 'ready'
            ? 'healthy'
            : runtimeState.agentState === 'degraded'
              ? 'degraded'
              : 'failed',
        summary: runtimeState.health?.summary ?? `agent state ${runtimeState.agentState}`,
        backupPolicy: input.backupPolicy
      })

      return {
        state: runtimeState.agentState === 'ready' ? 'succeeded' : 'degraded',
        resultSummary:
          runtimeState.health?.summary ??
          `agent runtime collected for ${input.hostId} with state ${runtimeState.agentState}`,
        runtimeState
      }
    } catch (error) {
      return markAgentSyncFailure({
        hostId: input.hostId,
        ruleId: input.ruleId,
        category: input.category,
        backupPolicy: input.backupPolicy,
        dropEndpoint: input.dropEndpointOnFailure,
        summary: `agent sync failed for ${input.hostId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      })
    }
  }

  async function pushDesiredStateToAgent(input: {
    hostId: string
    operationId: string
    category: 'host_probe' | 'bridge_verify'
    ruleId?: string
    backupPolicy?: 'best_effort' | 'required'
    dropEndpointOnFailure?: boolean
  }): Promise<OperationExecutionResult & { runtimeState?: RuntimeStateSchema }> {
    const baseUrl = agentEndpoints.get(input.hostId)
    if (!baseUrl) {
      return {
        state: 'succeeded',
        resultSummary: `desired state stored locally for ${input.hostId} until bootstrap completes`
      }
    }

    try {
      await agentClient.applyDesiredState(baseUrl, {
        operationId: input.operationId,
        desiredState: buildDesiredState(input.hostId)
      })
    } catch (error) {
      return markAgentSyncFailure({
        hostId: input.hostId,
        ruleId: input.ruleId,
        category: input.category,
        backupPolicy: input.backupPolicy,
        dropEndpoint: input.dropEndpointOnFailure,
        summary: `agent apply failed for ${input.hostId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      })
    }

    return collectAgentRuntime(input)
  }

  function createChildOperationId(hostId: string) {
    return `op_apply_policy_${hostId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }

  async function applyExposurePolicyInternal(input: {
    operationId: string
    hostId: string
    allowedSources: string[]
    excludedPorts: number[]
    samePortMirror: boolean
    conflictPolicy: ExposurePolicy['conflictPolicy']
    backupPolicy: ExposurePolicy['backupPolicy']
  }) {
    ensureSupportedHostProfile(input.hostId)

    store.replaceExposurePolicy({
      hostId: input.hostId,
      allowedSources: input.allowedSources,
      excludedPorts: input.excludedPorts,
      samePortMirror: input.samePortMirror,
      conflictPolicy: input.conflictPolicy,
      backupPolicy: input.backupPolicy
    })

    const sync = await pushDesiredStateToAgent({
      hostId: input.hostId,
      operationId: input.operationId,
      category: 'bridge_verify',
      backupPolicy: input.backupPolicy
    })

    return {
      state: sync.state,
      resultSummary: `policy applied for ${input.hostId}; ${sync.resultSummary}`
    } satisfies OperationExecutionResult
  }

  return {
    async applyExposurePolicyBatch(input) {
      const childOperations: OperationDetail[] = []

      for (const hostId of input.hostIds) {
        const childOperationId = createChildOperationId(hostId)
        store.enqueueOperation({
          id: childOperationId,
          type: 'apply_policy',
          initiator: input.initiator,
          hostId,
          parentOperationId: input.operationId
        })

        try {
          const childOperation = await operationRunner.run(childOperationId, async () =>
            applyExposurePolicyInternal({
              operationId: childOperationId,
              hostId,
              allowedSources: input.allowedSources,
              excludedPorts: input.excludedPorts,
              samePortMirror: input.samePortMirror,
              conflictPolicy: input.conflictPolicy,
              backupPolicy: input.backupPolicy
            })
          )
          childOperations.push(childOperation)
        } catch {
          const failedChild = store.getOperation(childOperationId)
          if (failedChild) {
            childOperations.push(failedChild)
          }
        }
      }

      const succeededTargets = childOperations.filter(
        (operation) => operation.state === 'succeeded'
      ).length
      const degradedTargets = childOperations.filter(
        (operation) => operation.state === 'degraded'
      ).length
      const failedTargets = childOperations.filter((operation) => operation.state === 'failed').length
      const state = degradedTargets > 0 || failedTargets > 0 ? 'degraded' : 'succeeded'

      return {
        state,
        resultSummary:
          `batch policy applied for ${input.hostIds.length} hosts; ` +
          `${succeededTargets} succeeded, ${degradedTargets} degraded, ${failedTargets} failed`
      }
    },
    async applyExposurePolicy(input) {
      return applyExposurePolicyInternal(input)
    },
    async bootstrapHost(input) {
      const host = ensureSupportedHostProfile(input.hostId)

      if (input.backupPolicy) {
        const currentPolicy = store.getExposurePolicy(input.hostId)
        if (currentPolicy) {
          store.replaceExposurePolicy({
            ...currentPolicy,
            backupPolicy: input.backupPolicy
          })
        }
      }

      store.updateHostRuntime(input.hostId, {
        lifecycleState: 'bootstrapping',
        agentState: 'unknown'
      })

      const agentBaseUrl = `http://${host.tailscaleAddress}:${input.desiredAgentPort}`
      agentEndpoints.set(input.hostId, agentBaseUrl)
      const sync = await pushDesiredStateToAgent({
        hostId: input.hostId,
        operationId: input.operationId,
        category: 'host_probe',
        backupPolicy: input.backupPolicy,
        dropEndpointOnFailure: true
      })

      return {
        state: sync.state,
        resultSummary: `host ${input.hostId} bootstrapped via ${agentBaseUrl}; ${sync.resultSummary}`
      }
    },
    async createBridgeRule(input) {
      ensureSupportedHostProfile(input.hostId)

      store.createBridgeRule({
        id: input.id,
        hostId: input.hostId,
        name: input.name,
        protocol: input.protocol,
        listenPort: input.listenPort,
        targetHost: input.targetHost,
        targetPort: input.targetPort,
        lifecycleState: input.lifecycleState
      })

      const sync = await pushDesiredStateToAgent({
        hostId: input.hostId,
        operationId: input.operationId,
        ruleId: input.id,
        category: 'bridge_verify'
      })

      return {
        state: sync.state,
        resultSummary: `rule ${input.id} created for host ${input.hostId}; ${sync.resultSummary}`
      }
    },
    createHost(input) {
      const targetProfileId = ensureSupportedTargetProfileId(input.targetProfileId)
      store.createHost({
        id: input.hostId,
        name: input.name,
        labels: input.labels,
        targetProfileId,
        sshHost: input.sshHost,
        sshPort: input.sshPort
      })

      return {
        resultSummary: `host ${input.hostId} created as draft`
      }
    },
    probeHost(input) {
      ensureSupportedHostProfile(input.hostId)

      store.createHealthCheck({
        id: `hc_${input.hostId}_${input.operationId}`,
        hostId: input.hostId,
        category: 'host_probe',
        status: 'healthy',
        summary: `host probe succeeded${input.mode ? ` (${input.mode})` : ''}`
      })

      return {
        resultSummary: `host ${input.hostId} probe completed`
      }
    },
    async removeBridgeRule(input) {
      const rule = store.getBridgeRule(input.ruleId)
      if (!rule) {
        throw new Error(`Bridge rule not found: ${input.ruleId}`)
      }
      ensureSupportedHostProfile(rule.hostId)

      const policy = store.getExposurePolicy(rule.hostId)
      const backup = await backupPrimitive.runBackup({
        operationId: input.operationId,
        hostId: rule.hostId,
        mode: policy?.backupPolicy ?? 'best_effort'
      })

      store.updateBridgeRule(input.ruleId, {
        lifecycleState: 'removed',
        lastRollbackPointId: backup.rollbackPoint.id
      })

      const sync = await pushDesiredStateToAgent({
        hostId: rule.hostId,
        operationId: input.operationId,
        category: 'bridge_verify',
        backupPolicy: policy?.backupPolicy ?? 'best_effort'
      })

      return {
        state: combineOperationState(backup.operationState, sync.state),
        resultSummary: `rule ${input.ruleId} removed; ${backup.resultSummary}; ${sync.resultSummary}`,
        backupId: backup.backup.id,
        rollbackPointId: backup.rollbackPoint.id
      }
    },
    async updateBridgeRule(input) {
      const rule = store.getBridgeRule(input.ruleId)
      if (!rule) {
        throw new Error(`Bridge rule not found: ${input.ruleId}`)
      }
      ensureSupportedHostProfile(rule.hostId)

      const policy = store.getExposurePolicy(rule.hostId)
      const hasAgentEndpoint = agentEndpoints.has(rule.hostId)
      const backup = await backupPrimitive.runBackup({
        operationId: input.operationId,
        hostId: rule.hostId,
        mode: policy?.backupPolicy ?? 'best_effort'
      })

      store.updateBridgeRule(input.ruleId, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.listenPort !== undefined ? { listenPort: input.listenPort } : {}),
        ...(input.targetHost !== undefined ? { targetHost: input.targetHost } : {}),
        ...(input.targetPort !== undefined ? { targetPort: input.targetPort } : {}),
        lifecycleState: 'applying',
        lastRollbackPointId: backup.rollbackPoint.id
      })

      const sync = await pushDesiredStateToAgent({
        hostId: rule.hostId,
        operationId: input.operationId,
        ruleId: input.ruleId,
        category: 'bridge_verify',
        backupPolicy: policy?.backupPolicy ?? 'best_effort'
      })
      const finalState = combineOperationState(backup.operationState, sync.state)

      if (!hasAgentEndpoint && backup.operationState !== 'degraded') {
        store.updateBridgeRule(input.ruleId, {
          lifecycleState: 'desired',
          lastRollbackPointId: backup.rollbackPoint.id
        })
      } else if (backup.operationState === 'degraded') {
        store.updateBridgeRule(input.ruleId, {
          lifecycleState: 'degraded',
          lastRollbackPointId: backup.rollbackPoint.id
        })
      }

      return {
        state: finalState,
        resultSummary: `rule ${input.ruleId} updated; ${backup.resultSummary}; ${sync.resultSummary}`,
        backupId: backup.backup.id,
        rollbackPointId: backup.rollbackPoint.id
      }
    }
  }
}

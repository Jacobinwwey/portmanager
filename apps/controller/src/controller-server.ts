import { mkdirSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'

import type { ApplyDesiredStateSchema, RuntimeStateSchema } from '@portmanager/typescript-contracts'

import { createAgentClient } from './agent-client.ts'
import type { ControllerEventBus } from './controller-events.ts'
import { closeHttpServer } from './http-server-lifecycle.ts'
import { createLocalBackupPrimitive } from './local-backup-primitive.ts'
import { createLocalDiagnosticsPrimitive } from './local-diagnostics-primitive.ts'
import type { BridgeRule, HostSummary, OperationStore } from './operation-store.ts'
import { createOperationRunner } from './operation-runner.ts'

export interface ControllerServer {
  close(): Promise<void>
  listen(port?: number): Promise<{ port: number; baseUrl: string }>
}

interface EventFilters {
  operationId?: string
  hostId?: string
  ruleId?: string
}

function createOperationId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function createResourceId(prefix: string, label: string) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return `${prefix}_${slug || 'item'}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function parseBackupPolicy(value: unknown) {
  if (value === 'required') {
    return 'required' as const
  }

  if (value === 'best_effort') {
    return 'best_effort' as const
  }

  return undefined
}

function parseConflictPolicy(value: unknown) {
  if (value === 'reject' || value === 'replace_existing') {
    return value
  }

  return undefined
}

function parseInteger(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  return undefined
}

function parseNumberArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined
  }

  const parsed = value
    .map((entry) => parseInteger(entry))
    .filter((entry): entry is number => entry !== undefined)

  return parsed.length === value.length ? parsed : undefined
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined
  }

  const parsed = value
    .map((entry) => (typeof entry === 'string' ? entry : undefined))
    .filter((entry): entry is string => entry !== undefined)

  return parsed.length === value.length ? parsed : undefined
}

function sendJson(response: http.ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(payload))
}

function matchesEventFilters(
  event: { operationId?: string; hostId?: string; ruleId?: string },
  filters: EventFilters
) {
  if (filters.operationId && event.operationId !== filters.operationId) {
    return false
  }

  if (filters.hostId && event.hostId !== filters.hostId) {
    return false
  }

  if (filters.ruleId && event.ruleId !== filters.ruleId) {
    return false
  }

  return true
}

async function readJsonBody(request: http.IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

export function createControllerServer(options: {
  store: OperationStore
  eventBus: ControllerEventBus
  artifactRoot?: string
}): ControllerServer {
  const { store, eventBus } = options
  const artifactRoot =
    options.artifactRoot ?? path.join(process.cwd(), '.portmanager', 'controller-artifacts')

  mkdirSync(artifactRoot, { recursive: true })

  const runner = createOperationRunner({ store, eventBus })
  const agentClient = createAgentClient()
  const agentEndpoints = new Map<string, string>()
  const backupPrimitive = createLocalBackupPrimitive({ artifactRoot, store })
  const diagnosticsPrimitive = createLocalDiagnosticsPrimitive({ artifactRoot })
  const subscriptions = new Set<() => void>()

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

  function buildDesiredState(hostId: string): ApplyDesiredStateSchema {
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
  }) {
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
      state: 'degraded' as const,
      resultSummary: input.summary
    }
  }

  async function collectAgentRuntime(input: {
    hostId: string
    category: 'host_probe' | 'bridge_verify'
    ruleId?: string
    backupPolicy?: 'best_effort' | 'required'
    dropEndpointOnFailure?: boolean
  }) {
    const baseUrl = agentEndpoints.get(input.hostId)
    if (!baseUrl) {
      return {
        state: 'succeeded' as const,
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
        state: runtimeState.agentState === 'ready' ? ('succeeded' as const) : ('degraded' as const),
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
  }) {
    const baseUrl = agentEndpoints.get(input.hostId)
    if (!baseUrl) {
      return {
        state: 'succeeded' as const,
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

  const server = http.createServer((request, response) => {
    void handleRequest(request, response).catch((error) => {
      sendJson(response, 500, {
        error: 'internal_error',
        message: error instanceof Error ? error.message : String(error)
      })
    })
  })

  async function handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    const eventFilters: EventFilters = {
      operationId: requestUrl.searchParams.get('operationId') ?? undefined,
      hostId: requestUrl.searchParams.get('hostId') ?? undefined,
      ruleId: requestUrl.searchParams.get('ruleId') ?? undefined
    }

    if (request.method === 'GET' && requestUrl.pathname === '/hosts') {
      sendJson(response, 200, {
        items: store.listHosts()
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/hosts') {
      const payload = await readJsonBody(request)
      const name = typeof payload.name === 'string' ? payload.name.trim() : ''
      const labels = payload.labels === undefined ? [] : parseStringArray(payload.labels)
      const ssh = payload.ssh && typeof payload.ssh === 'object'
        ? (payload.ssh as Record<string, unknown>)
        : undefined
      const sshHost = typeof ssh?.host === 'string' ? ssh.host.trim() : ''
      const sshPort = parseInteger(ssh?.port)

      if (!name || !labels || !sshHost || !sshPort || sshPort < 1 || sshPort > 65_535) {
        sendJson(response, 400, { error: 'invalid_host_request' })
        return
      }

      const hostId = createResourceId('host', name)
      const operationId = createOperationId('op_create_host')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'create_host',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          store.createHost({
            id: hostId,
            name,
            labels,
            sshHost,
            sshPort
          })

          return {
            resultSummary: `host ${hostId} created as draft`
          }
        })
      })
      return
    }

    const hostDetailMatch =
      request.method === 'GET' ? requestUrl.pathname.match(/^\/hosts\/([^/]+)$/) : null

    if (hostDetailMatch) {
      const hostId = decodeURIComponent(hostDetailMatch[1] ?? '')
      const detail = store.getHostDetail(hostId)
      if (!detail) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      sendJson(response, 200, detail)
      return
    }

    const hostProbeMatch =
      request.method === 'POST' ? requestUrl.pathname.match(/^\/hosts\/([^/]+)\/probe$/) : null

    if (hostProbeMatch) {
      const hostId = decodeURIComponent(hostProbeMatch[1] ?? '')
      const host = store.getHost(hostId)
      if (!host) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      const payload = await readJsonBody(request)
      const mode = payload.mode === 'read_only' ? 'read_only' : undefined
      if (payload.mode !== undefined && !mode) {
        sendJson(response, 400, { error: 'invalid_probe_request' })
        return
      }

      const operationId = createOperationId('op_probe_host')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'probe_host',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          store.createHealthCheck({
            id: `hc_${hostId}_${operationId}`,
            hostId,
            category: 'host_probe',
            status: 'healthy',
            summary: `host probe succeeded${mode ? ` (${mode})` : ''}`
          })

          return {
            resultSummary: `host ${hostId} probe completed`
          }
        })
      })
      return
    }

    const hostBootstrapMatch =
      request.method === 'POST' ? requestUrl.pathname.match(/^\/hosts\/([^/]+)\/bootstrap$/) : null

    if (hostBootstrapMatch) {
      const hostId = decodeURIComponent(hostBootstrapMatch[1] ?? '')
      const host = store.getHost(hostId)
      if (!host) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      const payload = await readJsonBody(request)
      const sshUser = typeof payload.sshUser === 'string' ? payload.sshUser.trim() : ''
      const desiredAgentPort = parseInteger(payload.desiredAgentPort)
      const backupPolicy = parseBackupPolicy(payload.backupPolicy)

      if (!sshUser || !desiredAgentPort || desiredAgentPort < 1 || desiredAgentPort > 65_535) {
        sendJson(response, 400, { error: 'invalid_bootstrap_request' })
        return
      }

      const operationId = createOperationId('op_bootstrap_host')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'bootstrap_host',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          if (backupPolicy) {
            const currentPolicy = store.getExposurePolicy(hostId)
            if (currentPolicy) {
              store.replaceExposurePolicy({
                ...currentPolicy,
                backupPolicy
              })
            }
          }

          store.updateHostRuntime(hostId, {
            lifecycleState: 'bootstrapping',
            agentState: 'unknown'
          })

          const agentBaseUrl = `http://${host.tailscaleAddress}:${desiredAgentPort}`
          agentEndpoints.set(hostId, agentBaseUrl)
          const sync = await pushDesiredStateToAgent({
            hostId,
            operationId,
            category: 'host_probe',
            backupPolicy,
            dropEndpointOnFailure: true
          })

          return {
            state: sync.state,
            resultSummary: `host ${hostId} bootstrapped via ${agentBaseUrl}; ${sync.resultSummary}`
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/bridge-rules') {
      sendJson(response, 200, {
        items: store.listBridgeRules()
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/bridge-rules') {
      const payload = await readJsonBody(request)
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const host = hostId ? store.getHost(hostId) : null
      const name = typeof payload.name === 'string' ? payload.name.trim() : undefined
      const protocol = payload.protocol === 'tcp' ? 'tcp' : undefined
      const listenPort = parseInteger(payload.listenPort)
      const targetHost = typeof payload.targetHost === 'string' ? payload.targetHost.trim() : ''
      const targetPort = parseInteger(payload.targetPort)

      if (!hostId || !host) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      if (!protocol || !listenPort || listenPort < 1 || listenPort > 65_535 || !targetHost || !targetPort || targetPort < 1 || targetPort > 65_535) {
        sendJson(response, 400, { error: 'invalid_bridge_rule_request' })
        return
      }

      const ruleId = createResourceId('rule', name ?? `${hostId}_${listenPort}`)
      const operationId = createOperationId('op_create_rule')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'create_rule',
        initiator: 'web',
        hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          store.createBridgeRule({
            id: ruleId,
            hostId,
            name,
            protocol,
            listenPort,
            targetHost,
            targetPort,
            lifecycleState: 'desired'
          })

          const sync = await pushDesiredStateToAgent({
            hostId,
            operationId,
            ruleId,
            category: 'bridge_verify'
          })

          return {
            state: sync.state,
            resultSummary: `rule ${ruleId} created for host ${hostId}; ${sync.resultSummary}`
          }
        })
      })
      return
    }

    const bridgeRuleDetailMatch =
      ['GET', 'PATCH', 'DELETE'].includes(request.method ?? '')
        ? requestUrl.pathname.match(/^\/bridge-rules\/([^/]+)$/)
        : null

    if (bridgeRuleDetailMatch && request.method === 'GET') {
      const ruleId = decodeURIComponent(bridgeRuleDetailMatch[1] ?? '')
      const rule = store.getBridgeRule(ruleId)
      if (!rule) {
        sendJson(response, 404, { error: 'bridge_rule_not_found' })
        return
      }

      sendJson(response, 200, rule)
      return
    }

    if (bridgeRuleDetailMatch && request.method === 'PATCH') {
      const ruleId = decodeURIComponent(bridgeRuleDetailMatch[1] ?? '')
      const rule = store.getBridgeRule(ruleId)
      if (!rule) {
        sendJson(response, 404, { error: 'bridge_rule_not_found' })
        return
      }

      const payload = await readJsonBody(request)
      const name =
        payload.name === undefined ? undefined : typeof payload.name === 'string' ? payload.name.trim() : null
      const listenPort =
        payload.listenPort === undefined ? undefined : parseInteger(payload.listenPort)
      const targetHost =
        payload.targetHost === undefined
          ? undefined
          : typeof payload.targetHost === 'string'
            ? payload.targetHost.trim()
            : null
      const targetPort =
        payload.targetPort === undefined ? undefined : parseInteger(payload.targetPort)

      if (name === null || targetHost === null || (payload.listenPort !== undefined && (!listenPort || listenPort < 1 || listenPort > 65_535)) || (payload.targetPort !== undefined && (!targetPort || targetPort < 1 || targetPort > 65_535))) {
        sendJson(response, 400, { error: 'invalid_bridge_rule_update' })
        return
      }

      const operationId = createOperationId('op_update_rule')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'update_rule',
        initiator: 'web',
        hostId: rule.hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const policy = store.getExposurePolicy(rule.hostId)
          const hasAgentEndpoint = agentEndpoints.has(rule.hostId)
          const backup = backupPrimitive.runBackup({
            operationId,
            hostId: rule.hostId,
            mode: policy?.backupPolicy ?? 'best_effort'
          })

          store.updateBridgeRule(ruleId, {
            ...(name !== undefined ? { name } : {}),
            ...(listenPort !== undefined ? { listenPort } : {}),
            ...(targetHost !== undefined ? { targetHost } : {}),
            ...(targetPort !== undefined ? { targetPort } : {}),
            lifecycleState: 'applying',
            lastRollbackPointId: backup.rollbackPoint.id
          })

          const sync = await pushDesiredStateToAgent({
            hostId: rule.hostId,
            operationId,
            ruleId,
            category: 'bridge_verify',
            backupPolicy: policy?.backupPolicy ?? 'best_effort'
          })
          const finalState = combineOperationState(backup.operationState, sync.state)

          if (!hasAgentEndpoint && backup.operationState !== 'degraded') {
            store.updateBridgeRule(ruleId, {
              lifecycleState: 'desired',
              lastRollbackPointId: backup.rollbackPoint.id
            })
          } else if (backup.operationState === 'degraded') {
            store.updateBridgeRule(ruleId, {
              lifecycleState: 'degraded',
              lastRollbackPointId: backup.rollbackPoint.id
            })
          }

          return {
            state: finalState,
            resultSummary: `rule ${ruleId} updated; ${backup.resultSummary}; ${sync.resultSummary}`,
            backupId: backup.backup.id,
            rollbackPointId: backup.rollbackPoint.id
          }
        })
      })
      return
    }

    if (bridgeRuleDetailMatch && request.method === 'DELETE') {
      const ruleId = decodeURIComponent(bridgeRuleDetailMatch[1] ?? '')
      const rule = store.getBridgeRule(ruleId)
      if (!rule) {
        sendJson(response, 404, { error: 'bridge_rule_not_found' })
        return
      }

      const operationId = createOperationId('op_remove_rule')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'remove_rule',
        initiator: 'web',
        hostId: rule.hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const policy = store.getExposurePolicy(rule.hostId)
          const backup = backupPrimitive.runBackup({
            operationId,
            hostId: rule.hostId,
            mode: policy?.backupPolicy ?? 'best_effort'
          })

          store.updateBridgeRule(ruleId, {
            lifecycleState: 'removed',
            lastRollbackPointId: backup.rollbackPoint.id
          })

          const sync = await pushDesiredStateToAgent({
            hostId: rule.hostId,
            operationId,
            category: 'bridge_verify',
            backupPolicy: policy?.backupPolicy ?? 'best_effort'
          })

          return {
            state: combineOperationState(backup.operationState, sync.state),
            resultSummary: `rule ${ruleId} removed; ${backup.resultSummary}; ${sync.resultSummary}`,
            backupId: backup.backup.id,
            rollbackPointId: backup.rollbackPoint.id
          }
        })
      })
      return
    }

    const exposurePolicyMatch =
      ['GET', 'PUT'].includes(request.method ?? '')
        ? requestUrl.pathname.match(/^\/exposure-policies\/([^/]+)$/)
        : null

    if (exposurePolicyMatch && request.method === 'GET') {
      const hostId = decodeURIComponent(exposurePolicyMatch[1] ?? '')
      const host = store.getHost(hostId)
      if (!host) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      const policy = store.getExposurePolicy(hostId)
      if (!policy) {
        sendJson(response, 404, { error: 'exposure_policy_not_found' })
        return
      }

      sendJson(response, 200, policy)
      return
    }

    if (exposurePolicyMatch && request.method === 'PUT') {
      const hostId = decodeURIComponent(exposurePolicyMatch[1] ?? '')
      const host = store.getHost(hostId)
      if (!host) {
        sendJson(response, 404, { error: 'host_not_found' })
        return
      }

      const payload = await readJsonBody(request)
      const bodyHostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const allowedSources = parseStringArray(payload.allowedSources)
      const excludedPorts = parseNumberArray(payload.excludedPorts)
      const samePortMirror =
        typeof payload.samePortMirror === 'boolean' ? payload.samePortMirror : undefined
      const conflictPolicy = parseConflictPolicy(payload.conflictPolicy)
      const backupPolicy = parseBackupPolicy(payload.backupPolicy)

      if (
        bodyHostId !== hostId ||
        !allowedSources ||
        !excludedPorts ||
        samePortMirror === undefined ||
        !conflictPolicy ||
        !backupPolicy
      ) {
        sendJson(response, 400, { error: 'invalid_exposure_policy_request' })
        return
      }

      const operationId = createOperationId('op_apply_policy')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'apply_policy',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          store.replaceExposurePolicy({
            hostId,
            allowedSources,
            excludedPorts,
            samePortMirror,
            conflictPolicy,
            backupPolicy
          })

          const sync = await pushDesiredStateToAgent({
            hostId,
            operationId,
            category: 'bridge_verify',
            backupPolicy
          })

          return {
            state: sync.state,
            resultSummary: `policy applied for ${hostId}; ${sync.resultSummary}`
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/operations') {
      sendJson(response, 200, {
        items: store.listOperations({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          ruleId: requestUrl.searchParams.get('ruleId') ?? undefined,
          state: requestUrl.searchParams.get('state') ?? undefined,
          type: requestUrl.searchParams.get('type') ?? undefined
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/events') {
      const rawLimit = Number(requestUrl.searchParams.get('limit') ?? '20')
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 20
      const items = eventBus
        .listRecent(200)
        .filter((event) => matchesEventFilters(event, eventFilters))
        .slice(0, limit)

      sendJson(response, 200, { items })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/backups') {
      sendJson(response, 200, {
        items: store.listBackups({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          operationId: requestUrl.searchParams.get('operationId') ?? undefined
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/health-checks') {
      sendJson(response, 200, {
        items: store.listHealthChecks({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          ruleId: requestUrl.searchParams.get('ruleId') ?? undefined
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/diagnostics') {
      sendJson(response, 200, {
        items: store.listDiagnostics({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          ruleId: requestUrl.searchParams.get('ruleId') ?? undefined
        })
      })
      return
    }

    const driftMatch =
      request.method === 'POST'
        ? requestUrl.pathname.match(/^\/bridge-rules\/([^/]+)\/drift-check$/)
        : null

    if (driftMatch) {
      const payload = await readJsonBody(request)
      const ruleId = decodeURIComponent(driftMatch[1] ?? '')
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const expectedStateHash =
        typeof payload.expectedStateHash === 'string' ? payload.expectedStateHash : undefined
      const observedStateHash =
        typeof payload.observedStateHash === 'string' ? payload.observedStateHash : undefined
      const backupPolicy = parseBackupPolicy(payload.backupPolicy)

      if (!hostId || !expectedStateHash || !observedStateHash || !backupPolicy) {
        sendJson(response, 400, { error: 'invalid_drift_check_request' })
        return
      }

      const operationId = createOperationId('op_verify')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'verify_rule',
        initiator: 'web',
        hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const driftDetected = expectedStateHash !== observedStateHash
          const summary = driftDetected
            ? backupPolicy === 'required'
              ? `drift detected: expected ${expectedStateHash}, observed ${observedStateHash}, rollback inspection required`
              : `drift detected: expected ${expectedStateHash}, observed ${observedStateHash}, best_effort remediation allowed`
            : `bridge verification matched expected state hash ${expectedStateHash}`

          store.createHealthCheck({
            id: `hc_${ruleId}_${operationId}`,
            hostId,
            ruleId,
            category: 'bridge_verify',
            status: driftDetected ? 'degraded' : 'healthy',
            summary,
            backupPolicy
          })

          return {
            state: driftDetected ? 'degraded' : 'succeeded',
            resultSummary: summary
          }
        })
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/backups/run') {
      const payload = await readJsonBody(request)
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : 'host_alpha'
      const mode = payload.mode === 'required' ? 'required' : 'best_effort'
      const operationId = createOperationId('op_backup')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'backup',
        initiator: 'web',
        hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const { backup, operationState, rollbackPoint, resultSummary } = backupPrimitive.runBackup({
            operationId,
            hostId,
            mode
          })

          return {
            state: operationState,
            resultSummary,
            backupId: backup.id,
            rollbackPointId: rollbackPoint.id
          }
        })
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/snapshots/diagnostics') {
      const payload = await readJsonBody(request)
      const hostId = typeof payload.hostId === 'string' ? payload.hostId : undefined
      const port =
        typeof payload.port === 'number' && Number.isInteger(payload.port) ? payload.port : undefined

      if (!hostId || !port || port < 1 || port > 65_535) {
        sendJson(response, 400, { error: 'invalid_diagnostics_request' })
        return
      }

      const operationId = createOperationId('op_diag')
      const ruleId = typeof payload.ruleId === 'string' ? payload.ruleId : undefined
      const scheme = payload.scheme === 'https' ? 'https' : 'http'
      const captureSnapshot = payload.captureSnapshot !== false
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'diagnostics',
        initiator: 'web',
        hostId,
        ruleId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const result = await diagnosticsPrimitive.runDiagnostics({
            operationId,
            hostId,
            ruleId,
            port,
            scheme,
            captureSnapshot
          })

          const existingRule = ruleId ? store.getBridgeRule(ruleId) : null
          if (existingRule) {
            store.updateBridgeRule(existingRule.id, {
              lifecycleState: result.state === 'succeeded' ? 'active' : 'degraded',
              ...(result.state === 'succeeded'
                ? { lastVerifiedAt: result.diagnosticResult.capturedAt }
                : {})
            })
          }

          return {
            state: result.state,
            resultSummary: result.resultSummary,
            diagnosticResult: result.diagnosticResult,
            snapshotResult: result.snapshotResult
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/rollback-points') {
      const state = requestUrl.searchParams.get('state')
      sendJson(response, 200, {
        items: store.listRollbackPoints({
          hostId: requestUrl.searchParams.get('hostId') ?? undefined,
          state:
            state === 'ready' || state === 'applied' || state === 'invalid' ? state : undefined
        })
      })
      return
    }

    if (
      request.method === 'POST' &&
      requestUrl.pathname.startsWith('/rollback-points/') &&
      requestUrl.pathname.endsWith('/apply')
    ) {
      const rollbackPointId = requestUrl.pathname
        .slice('/rollback-points/'.length, -'/apply'.length)
        .replace(/\/$/, '')

      const rollbackPoint = store.getRollbackPoint(rollbackPointId)
      if (!rollbackPoint) {
        sendJson(response, 404, { error: 'rollback_point_not_found' })
        return
      }

      const operationId = createOperationId('op_rollback')
      const accepted = store.enqueueOperation({
        id: operationId,
        type: 'rollback',
        initiator: 'web',
        hostId: rollbackPoint.hostId
      })

      sendJson(response, 202, accepted)

      queueMicrotask(() => {
        void runner.run(operationId, async () => {
          const result = backupPrimitive.applyRollback({
            operationId,
            rollbackPointId
          })

          return {
            resultSummary: `rollback ${result.rollbackPoint.id} applied from ${path.basename(result.rollbackResultPath)}`,
            rollbackPointId: result.rollbackPoint.id
          }
        })
      })
      return
    }

    if (request.method === 'GET' && requestUrl.pathname.startsWith('/operations/')) {
      const operationId = requestUrl.pathname.slice('/operations/'.length)

      if (operationId === 'events') {
        const replay = eventBus
          .listRecent(200)
          .filter((event) => matchesEventFilters(event, eventFilters))
          .slice(0, 50)

        response.writeHead(200, {
          'cache-control': 'no-cache',
          connection: 'keep-alive',
          'content-type': 'text/event-stream'
        })
        response.write(': connected\n\n')
        for (const event of [...replay].reverse()) {
          response.write(`id: ${event.id}\n`)
          response.write(`event: ${event.kind}\n`)
          response.write(`data: ${JSON.stringify(event)}\n\n`)
        }

        const unsubscribe = eventBus.subscribe((event) => {
          if (!matchesEventFilters(event, eventFilters)) {
            return
          }
          response.write(`id: ${event.id}\n`)
          response.write(`event: ${event.kind}\n`)
          response.write(`data: ${JSON.stringify(event)}\n\n`)
        })

        subscriptions.add(unsubscribe)
        request.on('close', () => {
          unsubscribe()
          subscriptions.delete(unsubscribe)
        })
        return
      }

      const detail = store.getOperation(operationId)
      if (!detail) {
        sendJson(response, 404, { error: 'operation_not_found' })
        return
      }

      sendJson(response, 200, detail)
      return
    }

    sendJson(response, 404, { error: 'not_found' })
  }

  return {
    async listen(port = 0) {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, '127.0.0.1', () => {
          server.off('error', reject)
          resolve()
        })
      })

      const address = server.address()
      if (!address || typeof address === 'string') {
        throw new Error('Controller server failed to bind')
      }

      return {
        port: address.port,
        baseUrl: `http://127.0.0.1:${address.port}`
      }
    },
    async close() {
      for (const unsubscribe of subscriptions) {
        unsubscribe()
      }
      subscriptions.clear()

      await closeHttpServer(server)
    }
  }
}

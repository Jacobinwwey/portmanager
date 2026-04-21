import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { createControllerDomainService } from '../../apps/controller/src/controller-domain-service.ts'
import { createControllerReadModel } from '../../apps/controller/src/controller-read-model.ts'
import { createOperationStore } from '../../apps/controller/src/operation-store.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-controller-domain-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite')
  }
}

function runtimeState(input: { hostId: string; ruleId?: string; agentState?: 'ready' | 'degraded' | 'unreachable' }) {
  return {
    schemaVersion: '0.1.0',
    hostId: input.hostId,
    agentState: input.agentState ?? 'ready',
    agentVersion: '0.1.0',
    effectiveStateHash: 'state_hash_001',
    health: {
      summary: '1 rule(s) staged with backup policy required',
      signals: [
        {
          code: 'allowed_sources',
          status: 'healthy',
          message: 'tailscale'
        }
      ]
    },
    appliedRules: input.ruleId
      ? [
          {
            id: input.ruleId,
            listenPort: 443,
            targetHost: '127.0.0.1',
            targetPort: 3000,
            status: 'applied_unverified'
          }
        ]
      : [],
    updatedAt: new Date().toISOString()
  }
}

test('controller read model composes host detail from store-backed resources', () => {
  const { directory, databasePath } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })

    try {
      const host = store.createHost({
        id: 'host_alpha',
        name: 'Alpha Relay',
        labels: ['edge', 'prod'],
        sshHost: '100.64.0.10',
        sshPort: 22
      })

      store.replaceExposurePolicy({
        hostId: host.id,
        allowedSources: ['tailscale', 'admin'],
        excludedPorts: [22, 8443],
        samePortMirror: true,
        conflictPolicy: 'replace_existing',
        backupPolicy: 'required'
      })

      store.createBridgeRule({
        id: 'rule_https',
        hostId: host.id,
        name: 'HTTPS Relay',
        protocol: 'tcp',
        listenPort: 443,
        targetHost: '127.0.0.1',
        targetPort: 3000,
        lifecycleState: 'desired'
      })

      store.enqueueOperation({
        id: 'op_create_host',
        type: 'create_host',
        initiator: 'web',
        hostId: host.id
      })
      store.markRunning('op_create_host')
      store.markFinished('op_create_host', {
        state: 'succeeded',
        resultSummary: `host ${host.id} created as draft`
      })

      store.enqueueOperation({
        id: 'op_apply_policy',
        type: 'apply_policy',
        initiator: 'web',
        hostId: host.id
      })
      store.markRunning('op_apply_policy')
      store.markFinished('op_apply_policy', {
        state: 'succeeded',
        resultSummary: `policy applied for ${host.id}`
      })

      store.enqueueOperation({
        id: 'op_create_rule',
        type: 'create_rule',
        initiator: 'web',
        hostId: host.id,
        ruleId: 'rule_https'
      })
      store.markRunning('op_create_rule')
      store.markFinished('op_create_rule', {
        state: 'succeeded',
        resultSummary: 'rule rule_https created'
      })

      const readModel = createControllerReadModel({ store })
      const detail = readModel.getHostDetail(host.id)

      assert.ok(detail)
      assert.deepEqual(detail.labels, ['edge', 'prod'])
      assert.equal(detail.effectivePolicy.backupPolicy, 'required')
      assert.deepEqual(detail.effectivePolicy.allowedSources, ['tailscale', 'admin'])
      assert.equal(detail.recentRules.length, 1)
      assert.equal(detail.recentRules[0]?.id, 'rule_https')
      assert.equal(detail.recentOperations.length, 3)
      assert.equal(detail.recentOperations[0]?.type, 'create_rule')
      assert.equal(detail.recentOperations.some((entry) => entry.type === 'apply_policy'), true)
      assert.equal(detail.recentOperations.some((entry) => entry.type === 'create_host'), true)
    } finally {
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller domain service bootstraps host through agent sync without transport logic', async () => {
  const { directory, databasePath } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })

    try {
      const host = store.createHost({
        id: 'host_alpha',
        name: 'Alpha Relay',
        sshHost: '100.64.0.10',
        sshPort: 22
      })

      store.createBridgeRule({
        id: 'rule_https',
        hostId: host.id,
        name: 'HTTPS Relay',
        protocol: 'tcp',
        listenPort: 443,
        targetHost: '127.0.0.1',
        targetPort: 3000,
        lifecycleState: 'desired'
      })

      const agentEndpoints = new Map<string, string>()
      const applied: Array<Record<string, unknown>> = []
      const domainService = createControllerDomainService({
        store,
        agentClient: {
          async applyDesiredState(baseUrl, payload) {
            applied.push({
              baseUrl,
              operationId: payload.operationId,
              desiredState: payload.desiredState
            })
          },
          async collectRuntimeState() {
            return runtimeState({
              hostId: host.id,
              ruleId: 'rule_https'
            })
          }
        },
        agentEndpoints,
        backupPrimitive: {
          async runBackup() {
            throw new Error('backup should not run during bootstrap')
          },
          applyRollback() {
            throw new Error('rollback should not run during bootstrap')
          }
        }
      })

      const result = await domainService.bootstrapHost({
        hostId: host.id,
        operationId: 'op_bootstrap_host_001',
        desiredAgentPort: 8711,
        backupPolicy: 'required'
      })

      assert.equal(result.state, 'succeeded')
      assert.match(String(result.resultSummary), /bootstrapped via http:\/\/100\.64\.0\.10:8711/)
      assert.equal(agentEndpoints.get(host.id), 'http://100.64.0.10:8711')
      assert.equal(applied.length, 1)
      assert.equal(store.getExposurePolicy(host.id)?.backupPolicy, 'required')
      assert.equal(store.getHost(host.id)?.lifecycleState, 'ready')
      assert.equal(store.getHost(host.id)?.agentState, 'ready')
      assert.equal(store.getBridgeRule('rule_https')?.lifecycleState, 'applied_unverified')
    } finally {
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller domain service keeps unreachable-agent degradation explicit during bootstrap', async () => {
  const { directory, databasePath } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })

    try {
      const host = store.createHost({
        id: 'host_beta',
        name: 'Beta Relay',
        sshHost: '100.64.0.11',
        sshPort: 22
      })

      const agentEndpoints = new Map<string, string>()
      const domainService = createControllerDomainService({
        store,
        agentClient: {
          async applyDesiredState() {
            return undefined
          },
          async collectRuntimeState() {
            throw new Error('connection refused')
          }
        },
        agentEndpoints,
        backupPrimitive: {
          async runBackup() {
            throw new Error('backup should not run during bootstrap')
          },
          applyRollback() {
            throw new Error('rollback should not run during bootstrap')
          }
        }
      })

      const result = await domainService.bootstrapHost({
        hostId: host.id,
        operationId: 'op_bootstrap_host_002',
        desiredAgentPort: 8712,
        backupPolicy: 'best_effort'
      })

      assert.equal(result.state, 'degraded')
      assert.match(String(result.resultSummary), /agent sync failed/i)
      assert.equal(agentEndpoints.has(host.id), false)
      assert.equal(store.getHost(host.id)?.lifecycleState, 'degraded')
      assert.equal(store.getHost(host.id)?.agentState, 'unreachable')
      assert.equal(store.listHealthChecks({ hostId: host.id })[0]?.status, 'failed')
    } finally {
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

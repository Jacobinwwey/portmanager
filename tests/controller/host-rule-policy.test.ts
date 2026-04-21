import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  candidateTargetProfileId,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-parity-'))
  return {
    directory,
    databasePath: path.join(directory, 'controller.sqlite'),
    artifactRoot: path.join(directory, 'artifacts')
  }
}

async function waitForTerminalOperation(baseUrl: string, operationId: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${baseUrl}/operations/${operationId}`)
    assert.equal(response.status, 200)

    const payload = (await response.json()) as Record<string, unknown>
    if (
      payload.state === 'succeeded' ||
      payload.state === 'failed' ||
      payload.state === 'degraded'
    ) {
      return payload
    }

    await delay(20)
  }

  throw new Error(`operation did not settle: ${operationId}`)
}

test('controller server exposes host, rule, and policy resources through real detail views', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Alpha Relay',
          labels: ['edge', 'prod'],
          ssh: {
            host: '100.64.0.10',
            port: 22
          }
        })
      })

      assert.equal(createHostResponse.status, 202)
      const createHostAccepted = (await createHostResponse.json()) as {
        operationId: string
        state: string
      }
      assert.equal(createHostAccepted.state, 'queued')

      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      assert.equal(hostsResponse.status, 200)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(hostsPayload.items.length, 1)
      assert.equal(hostsPayload.items[0]?.name, 'Alpha Relay')
      assert.equal(hostsPayload.items[0]?.lifecycleState, 'draft')
      assert.equal(hostsPayload.items[0]?.tailscaleAddress, '100.64.0.10')
      assert.equal(hostsPayload.items[0]?.agentState, 'unknown')
      assert.equal(hostsPayload.items[0]?.agentHeartbeatState, 'unknown')

      const hostId = String(hostsPayload.items[0]?.id)

      const policyResponse = await fetch(`${listening.baseUrl}/exposure-policies/${hostId}`)
      assert.equal(policyResponse.status, 200)
      const policyPayload = (await policyResponse.json()) as Record<string, unknown>
      assert.deepEqual(policyPayload.allowedSources, ['tailscale'])
      assert.deepEqual(policyPayload.excludedPorts, [22])
      assert.equal(policyPayload.samePortMirror, false)
      assert.equal(policyPayload.conflictPolicy, 'reject')
      assert.equal(policyPayload.backupPolicy, 'best_effort')

      const updatePolicyResponse = await fetch(`${listening.baseUrl}/exposure-policies/${hostId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          allowedSources: ['tailscale', 'admin'],
          excludedPorts: [22, 8443],
          samePortMirror: true,
          conflictPolicy: 'replace_existing',
          backupPolicy: 'required'
        })
      })

      assert.equal(updatePolicyResponse.status, 202)
      const updatePolicyAccepted = (await updatePolicyResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, updatePolicyAccepted.operationId)

      const createRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          name: 'HTTPS Relay',
          protocol: 'tcp',
          listenPort: 443,
          targetHost: '127.0.0.1',
          targetPort: 3000
        })
      })

      assert.equal(createRuleResponse.status, 202)
      const createRuleAccepted = (await createRuleResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createRuleAccepted.operationId)

      const hostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      assert.equal(hostDetailResponse.status, 200)
      const hostDetail = (await hostDetailResponse.json()) as {
        labels: string[]
        effectivePolicy: Record<string, unknown>
        recentRules: Array<Record<string, unknown>>
        recentOperations: Array<Record<string, unknown>>
      }

      assert.deepEqual(hostDetail.labels, ['edge', 'prod'])
      assert.equal(hostDetail.agentHeartbeatState, 'unknown')
      assert.equal(hostDetail.effectivePolicy.backupPolicy, 'required')
      assert.deepEqual(hostDetail.effectivePolicy.allowedSources, ['tailscale', 'admin'])
      assert.equal(hostDetail.recentRules.length, 1)
      assert.equal(hostDetail.recentRules[0]?.name, 'HTTPS Relay')
      assert.equal(hostDetail.recentRules[0]?.lifecycleState, 'desired')
      assert.equal(hostDetail.recentOperations[0]?.type, 'create_rule')
      assert.equal(hostDetail.recentOperations.some((entry) => entry.type === 'apply_policy'), true)
      assert.equal(hostDetail.recentOperations.some((entry) => entry.type === 'create_host'), true)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server probes hosts and marks bootstrap degraded when no live agent service is reachable', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Bootstrap Alpha',
          ssh: {
            host: '100.64.0.11',
            port: 22
          }
        })
      })

      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const hostId = String(hostsPayload.items[0]?.id)

      const probeResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/probe`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'read_only'
        })
      })

      assert.equal(probeResponse.status, 202)
      const probeAccepted = (await probeResponse.json()) as { operationId: string }
      const probeOperation = await waitForTerminalOperation(listening.baseUrl, probeAccepted.operationId)
      assert.equal(probeOperation.type, 'probe_host')
      assert.equal(probeOperation.state, 'succeeded')

      const healthResponse = await fetch(`${listening.baseUrl}/health-checks?hostId=${hostId}`)
      assert.equal(healthResponse.status, 200)
      const healthPayload = (await healthResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      assert.equal(healthPayload.items[0]?.category, 'host_probe')
      assert.equal(healthPayload.items[0]?.status, 'healthy')

      const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'ubuntu',
          desiredAgentPort: 8711,
          backupPolicy: 'best_effort'
        })
      })

      assert.equal(bootstrapResponse.status, 202)
      const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
      const bootstrapOperation = await waitForTerminalOperation(
        listening.baseUrl,
        bootstrapAccepted.operationId
      )
      assert.equal(bootstrapOperation.type, 'bootstrap_host')
      assert.equal(bootstrapOperation.state, 'degraded')
      assert.match(String(bootstrapOperation.resultSummary), /agent/i)

      const hostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      assert.equal(hostDetailResponse.status, 200)
      const hostDetail = (await hostDetailResponse.json()) as Record<string, unknown>
      assert.equal(hostDetail.lifecycleState, 'degraded')
      assert.equal(hostDetail.agentState, 'unreachable')
      assert.equal(
        Array.isArray(hostDetail.recentOperations) &&
          (hostDetail.recentOperations as Array<Record<string, unknown>>).some(
            (entry) => entry.type === 'bootstrap_host'
          ),
        true
      )
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server keeps degraded candidate host rule mutation blocked during review-prep', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Candidate Bootstrap Alpha',
          targetProfileId: candidateTargetProfileId,
          ssh: {
            host: '100.64.0.13',
            port: 22
          }
        })
      })

      assert.equal(createHostResponse.status, 202)
      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      assert.equal(hostsResponse.status, 200)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const host = hostsPayload.items.find(
        (entry) => entry.name === 'Candidate Bootstrap Alpha'
      )
      assert.ok(host)
      const hostId = String(host.id)
      assert.equal(host.targetProfileId, candidateTargetProfileId)
      assert.equal(host.targetProfileStatus, 'candidate')

      const probeResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/probe`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'read_only'
        })
      })

      assert.equal(probeResponse.status, 202)
      const probeAccepted = (await probeResponse.json()) as { operationId: string }
      const probeOperation = await waitForTerminalOperation(listening.baseUrl, probeAccepted.operationId)
      assert.equal(probeOperation.type, 'probe_host')
      assert.equal(probeOperation.state, 'succeeded')

      const bootstrapResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}/bootstrap`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sshUser: 'debian',
          desiredAgentPort: 8711,
          backupPolicy: 'best_effort'
        })
      })

      assert.equal(bootstrapResponse.status, 202)
      const bootstrapAccepted = (await bootstrapResponse.json()) as { operationId: string }
      const bootstrapOperation = await waitForTerminalOperation(
        listening.baseUrl,
        bootstrapAccepted.operationId
      )
      assert.equal(bootstrapOperation.type, 'bootstrap_host')
      assert.equal(bootstrapOperation.state, 'degraded')
      assert.match(String(bootstrapOperation.resultSummary), /bootstrapped via/i)

      const createRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          name: 'Candidate HTTPS Relay',
          protocol: 'tcp',
          listenPort: 443,
          targetHost: '127.0.0.1',
          targetPort: 3000
        })
      })

      assert.equal(createRuleResponse.status, 202)
      const createRuleAccepted = (await createRuleResponse.json()) as { operationId: string }
      const createRuleOperation = await waitForTerminalOperation(
        listening.baseUrl,
        createRuleAccepted.operationId
      )
      assert.equal(createRuleOperation.type, 'create_rule')
      assert.equal(createRuleOperation.state, 'failed')
      assert.match(String(createRuleOperation.resultSummary), /review-prep only/i)

      const candidateHostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      assert.equal(candidateHostDetailResponse.status, 200)
      const candidateHostDetail = (await candidateHostDetailResponse.json()) as {
        targetProfileStatus: string
        recentRules: Array<Record<string, unknown>>
        recentOperations: Array<Record<string, unknown>>
      }
      assert.equal(candidateHostDetail.targetProfileStatus, 'candidate')
      assert.equal(candidateHostDetail.recentRules.length, 0)
      assert.equal(
        candidateHostDetail.recentOperations.some(
          (entry) => entry.type === 'create_rule' && entry.state === 'failed'
        ),
        true
      )
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server derives stale heartbeat when last live contact ages out', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Stale Relay',
          ssh: {
            host: '100.64.0.12',
            port: 22
          }
        })
      })

      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const hostId = String(hostsPayload.items[0]?.id)

      store.updateHostRuntime(hostId, {
        lifecycleState: 'ready',
        agentState: 'ready',
        agentHeartbeatAt: '2026-04-01T00:00:00.000Z',
        agentVersion: '0.1.0'
      })

      const staleResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      assert.equal(staleResponse.status, 200)
      const staleHost = (await staleResponse.json()) as Record<string, unknown>

      assert.equal(staleHost.agentHeartbeatState, 'stale')
      assert.equal(staleHost.agentVersion, '0.1.0')
      assert.equal(staleHost.agentHeartbeatAt, '2026-04-01T00:00:00.000Z')
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('controller server updates and removes bridge rules with backup evidence and 404 guards', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const createHostResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Rule Alpha',
          ssh: {
            host: '100.64.0.12',
            port: 22
          }
        })
      })

      const createHostAccepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createHostAccepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      const hostId = String(hostsPayload.items[0]?.id)

      const updatePolicyResponse = await fetch(`${listening.baseUrl}/exposure-policies/${hostId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          allowedSources: ['tailscale'],
          excludedPorts: [22],
          samePortMirror: false,
          conflictPolicy: 'reject',
          backupPolicy: 'required'
        })
      })

      const updatePolicyAccepted = (await updatePolicyResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, updatePolicyAccepted.operationId)

      const createRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hostId,
          protocol: 'tcp',
          listenPort: 443,
          targetHost: '127.0.0.1',
          targetPort: 3000
        })
      })

      const createRuleAccepted = (await createRuleResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, createRuleAccepted.operationId)

      const rulesResponse = await fetch(`${listening.baseUrl}/bridge-rules`)
      assert.equal(rulesResponse.status, 200)
      const rulesPayload = (await rulesResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      assert.equal(rulesPayload.items.length, 1)
      const ruleId = String(rulesPayload.items[0]?.id)

      const patchRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          targetPort: 4000,
          name: 'Updated Relay'
        })
      })

      assert.equal(patchRuleResponse.status, 202)
      const patchAccepted = (await patchRuleResponse.json()) as { operationId: string }
      const patchOperation = await waitForTerminalOperation(listening.baseUrl, patchAccepted.operationId)
      assert.equal(patchOperation.type, 'update_rule')
      assert.equal(patchOperation.state, 'degraded')
      assert.match(String(patchOperation.backupId), /^backup_/)
      assert.match(String(patchOperation.rollbackPointId), /^rp_/)

      const patchedRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules/${ruleId}`)
      assert.equal(patchedRuleResponse.status, 200)
      const patchedRule = (await patchedRuleResponse.json()) as Record<string, unknown>
      assert.equal(patchedRule.targetPort, 4000)
      assert.equal(patchedRule.name, 'Updated Relay')
      assert.equal(patchedRule.lifecycleState, 'degraded')
      assert.equal(typeof patchedRule.lastRollbackPointId, 'string')

      const backupsResponse = await fetch(
        `${listening.baseUrl}/backups?operationId=${patchAccepted.operationId}`
      )
      assert.equal(backupsResponse.status, 200)
      const backupsPayload = (await backupsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }
      assert.equal(backupsPayload.items.length, 1)
      assert.equal(backupsPayload.items[0]?.backupMode, 'required')

      const deleteRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules/${ruleId}`, {
        method: 'DELETE'
      })

      assert.equal(deleteRuleResponse.status, 202)
      const deleteAccepted = (await deleteRuleResponse.json()) as { operationId: string }
      const deleteOperation = await waitForTerminalOperation(
        listening.baseUrl,
        deleteAccepted.operationId
      )
      assert.equal(deleteOperation.type, 'remove_rule')
      assert.equal(deleteOperation.state, 'degraded')

      const deletedRuleResponse = await fetch(`${listening.baseUrl}/bridge-rules/${ruleId}`)
      assert.equal(deletedRuleResponse.status, 200)
      const deletedRule = (await deletedRuleResponse.json()) as Record<string, unknown>
      assert.equal(deletedRule.lifecycleState, 'removed')

      const missingHostResponse = await fetch(`${listening.baseUrl}/hosts/host_missing`)
      assert.equal(missingHostResponse.status, 404)

      const missingRulePatchResponse = await fetch(`${listening.baseUrl}/bridge-rules/rule_missing`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          targetPort: 5000
        })
      })
      assert.equal(missingRulePatchResponse.status, 404)
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

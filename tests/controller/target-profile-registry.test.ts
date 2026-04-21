import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  defaultTargetProfileId,
  getTargetProfile,
  summarizeTargetProfile,
  createControllerEventBus,
  createControllerServer,
  createOperationStore
} from '../../apps/controller/src/index.ts'

function tempPaths() {
  const directory = mkdtempSync(path.join(tmpdir(), 'portmanager-target-profile-'))
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

test('target profile registry exposes locked Ubuntu profile and marks unknown ids unsupported', () => {
  const lockedProfile = getTargetProfile(defaultTargetProfileId)
  assert.ok(lockedProfile)
  assert.equal(lockedProfile.id, 'ubuntu-24.04-systemd-tailscale')
  assert.equal(lockedProfile.status, 'supported')
  assert.equal(lockedProfile.platform, 'Ubuntu 24.04')
  assert.equal(lockedProfile.serviceManager, 'systemd')
  assert.equal(lockedProfile.steadyStateTransport, 'http-over-tailscale')
  assert.equal(lockedProfile.bootstrapTransport, 'ssh')
  assert.deepEqual(lockedProfile.capabilities, [
    'probe-host',
    'bootstrap-host',
    'apply-desired-state',
    'collect-diagnostics',
    'rollback'
  ])

  const unsupportedSummary = summarizeTargetProfile('future-lab')
  assert.equal(unsupportedSummary.id, 'future-lab')
  assert.equal(unsupportedSummary.label, 'Unsupported target profile')
  assert.equal(unsupportedSummary.status, 'unsupported')
})

test('controller server defaults locked target profile and rejects unknown profile ids', async () => {
  const { directory, databasePath, artifactRoot } = tempPaths()

  try {
    const store = createOperationStore({ databasePath })
    const eventBus = createControllerEventBus()
    const server = createControllerServer({ store, eventBus, artifactRoot })
    const listening = await server.listen(0)

    try {
      const invalidProfileResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Unsupported Relay',
          targetProfileId: 'future-lab',
          ssh: {
            host: '100.64.0.19',
            port: 22
          }
        })
      })

      assert.equal(invalidProfileResponse.status, 400)
      assert.deepEqual(await invalidProfileResponse.json(), {
        error: 'invalid_target_profile'
      })

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
      const accepted = (await createHostResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, accepted.operationId)

      const hostsResponse = await fetch(`${listening.baseUrl}/hosts`)
      assert.equal(hostsResponse.status, 200)
      const hostsPayload = (await hostsResponse.json()) as {
        items: Array<Record<string, unknown>>
      }

      assert.equal(hostsPayload.items[0]?.targetProfileId, defaultTargetProfileId)
      assert.equal(
        hostsPayload.items[0]?.targetProfileLabel,
        'Ubuntu 24.04 + systemd + Tailscale'
      )
      assert.equal(hostsPayload.items[0]?.targetProfileStatus, 'supported')

      const hostId = String(hostsPayload.items[0]?.id)
      const hostDetailResponse = await fetch(`${listening.baseUrl}/hosts/${hostId}`)
      assert.equal(hostDetailResponse.status, 200)
      const hostDetail = (await hostDetailResponse.json()) as {
        targetProfile: Record<string, unknown>
      }

      assert.equal(hostDetail.targetProfile.id, defaultTargetProfileId)
      assert.equal(hostDetail.targetProfile.platform, 'Ubuntu 24.04')
      assert.equal(hostDetail.targetProfile.serviceManager, 'systemd')
      assert.equal(hostDetail.targetProfile.steadyStateTransport, 'http-over-tailscale')
      assert.equal(hostDetail.targetProfile.bootstrapTransport, 'ssh')
      assert.deepEqual(hostDetail.targetProfile.capabilities, [
        'probe-host',
        'bootstrap-host',
        'apply-desired-state',
        'collect-diagnostics',
        'rollback'
      ])
    } finally {
      await server.close()
      store.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

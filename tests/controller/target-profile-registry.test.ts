import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as delay } from 'node:timers/promises'

import {
  candidateTargetProfileId,
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

  const candidateProfile = getTargetProfile(candidateTargetProfileId)
  assert.ok(candidateProfile)
  assert.equal(candidateProfile.id, 'debian-12-systemd-tailscale')
  assert.equal(candidateProfile.status, 'candidate')
  assert.equal(candidateProfile.platform, 'Debian 12')
  assert.equal(candidateProfile.serviceManager, 'systemd')
  assert.equal(candidateProfile.steadyStateTransport, 'http-over-tailscale')
  assert.equal(candidateProfile.bootstrapTransport, 'ssh')

  const candidateSummary = summarizeTargetProfile(candidateTargetProfileId)
  assert.equal(candidateSummary.id, 'debian-12-systemd-tailscale')
  assert.equal(candidateSummary.label, 'Debian 12 + systemd + Tailscale')
  assert.equal(candidateSummary.status, 'candidate')

  const unsupportedSummary = summarizeTargetProfile('future-lab')
  assert.equal(unsupportedSummary.id, 'future-lab')
  assert.equal(unsupportedSummary.label, 'Unsupported target profile')
  assert.equal(unsupportedSummary.status, 'unsupported')
})

test('controller server defaults locked target profile, allows declared candidate profile, and rejects unknown ids', async () => {
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

      const candidateProfileResponse = await fetch(`${listening.baseUrl}/hosts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Candidate Relay',
          targetProfileId: 'debian-12-systemd-tailscale',
          ssh: {
            host: '100.64.0.18',
            port: 22
          }
        })
      })

      assert.equal(candidateProfileResponse.status, 202)
      const candidateAccepted = (await candidateProfileResponse.json()) as { operationId: string }
      await waitForTerminalOperation(listening.baseUrl, candidateAccepted.operationId)

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

      const candidateHost = hostsPayload.items.find((entry) => entry.name === 'Candidate Relay')
      assert.ok(candidateHost)
      assert.equal(candidateHost.targetProfileId, candidateTargetProfileId)
      assert.equal(candidateHost.targetProfileLabel, 'Debian 12 + systemd + Tailscale')
      assert.equal(candidateHost.targetProfileStatus, 'candidate')

      const defaultHost = hostsPayload.items.find((entry) => entry.name === 'Alpha Relay')
      assert.ok(defaultHost)
      assert.equal(defaultHost.targetProfileId, defaultTargetProfileId)
      assert.equal(
        defaultHost.targetProfileLabel,
        'Ubuntu 24.04 + systemd + Tailscale'
      )
      assert.equal(defaultHost.targetProfileStatus, 'supported')

      const hostId = String(defaultHost.id)
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

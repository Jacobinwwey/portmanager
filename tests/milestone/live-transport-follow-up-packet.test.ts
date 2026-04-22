import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  candidateTargetProfileId,
  liveTransportFollowUpArtifactFiles,
  liveTransportFollowUpSummaryFileName,
  requiredLiveTransportFollowUpArtifactIds
} from '../../apps/controller/src/index.ts'
import {
  assembleLiveTransportFollowUpPacket,
  parseArgs,
  resolveLatestLiveTransportFollowUpPacketRoot,
  scaffoldLiveTransportFollowUpPacket,
  validateLiveTransportFollowUpPacketCommand
} from '../../scripts/milestone/live-transport-follow-up-packet.ts'

test('parseArgs accepts scaffold, assemble, and validate modes', () => {
  const scaffold = parseArgs(['--', 'scaffold', '--packet-date', '2026-04-26', '--json'])
  const assemble = parseArgs([
    'assemble',
    '--packet-date',
    '2026-04-26',
    '--candidate-host-detail',
    '/tmp/candidate-host-detail.json',
    '--bootstrap-operation',
    '/tmp/bootstrap-operation.json',
    '--steady-state-health',
    '/tmp/steady-state-health.json',
    '--steady-state-runtime-state',
    '/tmp/steady-state-runtime-state.json',
    '--controller-audit-index',
    '/tmp/controller-audit-index.json'
  ])
  const validate = parseArgs(['validate', '--packet-root', 'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-26'])

  assert.equal(scaffold.action, 'scaffold')
  assert.equal(scaffold.packetDate, '2026-04-26')
  assert.equal(scaffold.json, true)
  assert.equal(assemble.action, 'assemble')
  assert.equal(assemble.packetDate, '2026-04-26')
  assert.equal(
    assemble.artifactSourcePaths?.candidate_host_with_tailscale_ip,
    '/tmp/candidate-host-detail.json'
  )
  assert.equal(
    assemble.artifactSourcePaths?.bootstrap_operation_with_tailscale_transport,
    '/tmp/bootstrap-operation.json'
  )
  assert.equal(validate.action, 'validate')
  assert.equal(
    validate.packetRoot,
    'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-26'
  )
})

function writeSourceJson(sourceRoot: string, fileName: string, payload: unknown) {
  mkdirSync(sourceRoot, { recursive: true })
  const filePath = path.join(sourceRoot, fileName)
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return filePath
}

test('scaffoldLiveTransportFollowUpPacket creates invalid-by-design packet scaffold', () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))

  try {
    const result = scaffoldLiveTransportFollowUpPacket({
      repoRoot,
      packetDate: '2026-04-26',
      capturedAt: '2026-04-26T12:00:00.000Z'
    })

    assert.equal(
      result.packetRoot,
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-26'
    )
    assert.ok(existsSync(path.join(repoRoot, result.summaryPath)))
    assert.ok(existsSync(path.join(repoRoot, result.readmePath)))
    assert.equal(result.validation.ok, false)
    assert.match(result.validation.errors.join('\n'), /scaffold marker/i)
    assert.match(result.validation.errors.join('\n'), /capturedAddress/i)
    assert.match(result.validation.errors.join('\n'), /requiredArtifactIds/i)

    const latestRoot = resolveLatestLiveTransportFollowUpPacketRoot(repoRoot)
    assert.equal(latestRoot, result.packetRoot)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('validateLiveTransportFollowUpPacketCommand accepts real packet files after scaffold replacement', () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))

  try {
    const result = scaffoldLiveTransportFollowUpPacket({
      repoRoot,
      packetDate: '2026-04-27',
      capturedAt: '2026-04-27T12:00:00.000Z'
    })
    const absolutePacketRoot = path.join(repoRoot, result.packetRoot)

    for (const [artifactId, filename] of Object.entries(liveTransportFollowUpArtifactFiles)) {
      writeFileSync(
        path.join(absolutePacketRoot, filename),
        `${JSON.stringify({ artifactId, status: 'captured' }, null, 2)}\n`,
        'utf8'
      )
    }

    writeFileSync(
      path.join(absolutePacketRoot, liveTransportFollowUpSummaryFileName),
      `${JSON.stringify(
        {
          candidateTargetProfileId,
          capturedAt: '2026-04-27T12:00:00.000Z',
          capturedAddress: '100.91.22.27',
          requiredArtifactIds: requiredLiveTransportFollowUpArtifactIds,
          artifactFiles: liveTransportFollowUpArtifactFiles
        },
        null,
        2
      )}\n`,
      'utf8'
    )

    const validation = validateLiveTransportFollowUpPacketCommand({
      repoRoot,
      latest: true
    })

    assert.equal(validation.ok, true)
    assert.equal(validation.packetRoot, result.packetRoot)
    assert.equal(validation.candidateTargetProfileId, candidateTargetProfileId)
    assert.equal(validation.capturedAddress, '100.91.22.27')
    assert.deepEqual(validation.errors, [])

    const summary = JSON.parse(
      readFileSync(path.join(absolutePacketRoot, liveTransportFollowUpSummaryFileName), 'utf8')
    )
    assert.deepEqual(summary.requiredArtifactIds, requiredLiveTransportFollowUpArtifactIds)
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('assembleLiveTransportFollowUpPacket writes canonical packet files from real source artifacts', () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))
  const sourceRoot = path.join(repoRoot, 'source-artifacts')

  try {
    const assembled = assembleLiveTransportFollowUpPacket({
      repoRoot,
      packetDate: '2026-04-28',
      artifactSourcePaths: {
        candidate_host_with_tailscale_ip: writeSourceJson(sourceRoot, 'candidate-host-detail.json', {
          id: 'host_debian_review_001',
          targetProfileId: candidateTargetProfileId,
          tailscaleAddress: '100.91.22.28',
          updatedAt: '2026-04-28T12:01:00.000Z'
        }),
        bootstrap_operation_with_tailscale_transport: writeSourceJson(
          sourceRoot,
          'bootstrap-operation.json',
          {
            id: 'op_bootstrap_001',
            finishedAt: '2026-04-28T12:02:00.000Z',
            resultSummary: 'host host_debian_review_001 bootstrapped via http://100.91.22.28:8711'
          }
        ),
        steady_state_health_with_tailscale_transport: writeSourceJson(
          sourceRoot,
          'steady-state-health.json',
          {
            schemaVersion: '0.1.0',
            status: 'ok'
          }
        ),
        steady_state_runtime_state_with_tailscale_transport: writeSourceJson(
          sourceRoot,
          'steady-state-runtime-state.json',
          {
            schemaVersion: '0.1.0',
            updatedAt: '2026-04-28T12:03:00.000Z',
            agentState: 'ready'
          }
        ),
        linked_controller_audit_reference: writeSourceJson(sourceRoot, 'controller-audit-index.json', {
          items: [
            {
              lastEventAt: '2026-04-28T12:04:00.000Z'
            }
          ]
        })
      }
    })

    assert.equal(
      assembled.packetRoot,
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-28'
    )
    assert.equal(assembled.validation.ok, true)
    assert.equal(assembled.validation.capturedAddress, '100.91.22.28')
    assert.deepEqual(assembled.validation.errors, [])

    const packetRoot = path.join(repoRoot, assembled.packetRoot)
    const summary = JSON.parse(
      readFileSync(path.join(packetRoot, liveTransportFollowUpSummaryFileName), 'utf8')
    )
    assert.equal(summary.candidateTargetProfileId, candidateTargetProfileId)
    assert.equal(summary.capturedAddress, '100.91.22.28')
    assert.equal(summary.capturedAt, '2026-04-28T12:04:00.000Z')
    assert.deepEqual(summary.requiredArtifactIds, requiredLiveTransportFollowUpArtifactIds)

    for (const filename of Object.values(liveTransportFollowUpArtifactFiles)) {
      assert.ok(existsSync(path.join(packetRoot, filename)))
    }
  } finally {
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

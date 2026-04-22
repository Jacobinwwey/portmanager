import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import {
  candidateTargetProfileId,
  liveTransportFollowUpArtifactFiles,
  liveTransportFollowUpSummaryFileName,
  requiredLiveTransportFollowUpArtifactIds
} from '../../apps/controller/src/index.ts'
import {
  parseArgs,
  resolveLatestLiveTransportFollowUpPacketRoot,
  scaffoldLiveTransportFollowUpPacket,
  validateLiveTransportFollowUpPacketCommand
} from '../../scripts/milestone/live-transport-follow-up-packet.ts'

test('parseArgs accepts scaffold and validate modes', () => {
  const scaffold = parseArgs(['--', 'scaffold', '--packet-date', '2026-04-26', '--json'])
  const validate = parseArgs(['validate', '--packet-root', 'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-26'])

  assert.equal(scaffold.action, 'scaffold')
  assert.equal(scaffold.packetDate, '2026-04-26')
  assert.equal(scaffold.json, true)
  assert.equal(validate.action, 'validate')
  assert.equal(
    validate.packetRoot,
    'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-26'
  )
})

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

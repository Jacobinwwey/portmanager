import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
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
  captureLiveTransportFollowUpPacket,
  parseArgs,
  previewLiveTransportFollowUpCapture,
  resolveLatestLiveTransportFollowUpPacketRoot,
  scaffoldLiveTransportFollowUpPacket,
  validateLiveTransportFollowUpPacketCommand
} from '../../scripts/milestone/live-transport-follow-up-packet.ts'

test('parseArgs accepts scaffold, assemble, preview, capture, and validate modes', () => {
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
  const capture = parseArgs([
    'capture',
    '--packet-date',
    '2026-04-26',
    '--controller-base-url',
    'http://127.0.0.1:8100/api/controller',
    '--candidate-target-profile-id',
    'debian-12-systemd-tailscale',
    '--host-id',
    'host_debian_review_001',
    '--bootstrap-operation-id',
    'op_bootstrap_001',
    '--audit-limit',
    '7'
  ])
  const captureAuto = parseArgs([
    'capture',
    '--packet-date',
    '2026-04-26',
    '--controller-base-url',
    'http://127.0.0.1:8100/api/controller'
  ])
  const preview = parseArgs([
    'preview',
    '--packet-date',
    '2026-04-26',
    '--controller-base-url',
    'http://127.0.0.1:8100/api/controller',
    '--candidate-target-profile-id',
    'debian-12-systemd-tailscale',
    '--audit-limit',
    '6'
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
  assert.equal(capture.action, 'capture')
  assert.equal(capture.controllerBaseUrl, 'http://127.0.0.1:8100/api/controller')
  assert.equal(capture.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.equal(capture.hostId, 'host_debian_review_001')
  assert.equal(capture.bootstrapOperationId, 'op_bootstrap_001')
  assert.equal(capture.auditLimit, 7)
  assert.equal(captureAuto.action, 'capture')
  assert.equal(captureAuto.controllerBaseUrl, 'http://127.0.0.1:8100/api/controller')
  assert.equal(captureAuto.hostId, undefined)
  assert.equal(captureAuto.bootstrapOperationId, undefined)
  assert.equal(captureAuto.auditLimit, 20)
  assert.equal(preview.action, 'preview')
  assert.equal(preview.controllerBaseUrl, 'http://127.0.0.1:8100/api/controller')
  assert.equal(preview.candidateTargetProfileId, 'debian-12-systemd-tailscale')
  assert.equal(preview.auditLimit, 6)
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

async function startJsonServer(
  handler: (request: { method: string; pathname: string; searchParams: URLSearchParams }) => {
    status?: number
    body: unknown
  }
) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const result = handler({
      method: request.method ?? 'GET',
      pathname: url.pathname,
      searchParams: url.searchParams
    })

    response.writeHead(result.status ?? 200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(result.body))
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('failed to read server address')
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    }
  }
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

test('captureLiveTransportFollowUpPacket fetches controller plus agent evidence and upgrades scaffold root', async () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))
  const packetDate = '2026-04-29'

  const agentServer = await startJsonServer(({ pathname }) => {
    if (pathname === '/health') {
      return {
        body: {
          schemaVersion: '0.1.0',
          status: 'ok'
        }
      }
    }

    if (pathname === '/runtime-state') {
      return {
        body: {
          schemaVersion: '0.1.0',
          updatedAt: '2026-04-29T12:03:00.000Z',
          agentState: 'ready'
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  const controllerServer = await startJsonServer(({ pathname, searchParams }) => {
    if (pathname === '/api/controller/hosts/host_debian_review_001') {
      return {
        body: {
          id: 'host_debian_review_001',
          targetProfileId: candidateTargetProfileId,
          tailscaleAddress: '127.0.0.1',
          updatedAt: '2026-04-29T12:01:00.000Z'
        }
      }
    }

    if (pathname === '/api/controller/operations/op_bootstrap_001') {
      return {
        body: {
          id: 'op_bootstrap_001',
          type: 'bootstrap_host',
          state: 'succeeded',
          hostId: 'host_debian_review_001',
          finishedAt: '2026-04-29T12:02:00.000Z',
          resultSummary: `host host_debian_review_001 bootstrapped via ${agentServer.baseUrl}`
        }
      }
    }

    if (pathname === '/api/controller/event-audit-index') {
      assert.equal(searchParams.get('hostId'), 'host_debian_review_001')
      assert.equal(searchParams.get('limit'), '9')

      return {
        body: {
          items: [
            {
              lastEventAt: '2026-04-29T12:04:00.000Z',
              operation: {
                id: 'op_create_rule_001',
                finishedAt: '2026-04-29T12:04:00.000Z'
              }
            },
            {
              lastEventAt: '2026-04-29T12:02:00.000Z',
              operation: {
                id: 'op_bootstrap_001',
                finishedAt: '2026-04-29T12:02:00.000Z'
              }
            }
          ]
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  try {
    scaffoldLiveTransportFollowUpPacket({
      repoRoot,
      packetDate,
      capturedAt: '2026-04-29T12:00:00.000Z'
    })

    const captured = await captureLiveTransportFollowUpPacket({
      repoRoot,
      packetDate,
      controllerBaseUrl: `${controllerServer.baseUrl}/api/controller`,
      hostId: 'host_debian_review_001',
      bootstrapOperationId: 'op_bootstrap_001',
      auditLimit: 9
    })

    assert.equal(
      captured.packetRoot,
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-04-29'
    )
    assert.equal(captured.agentBaseUrl, agentServer.baseUrl)
    assert.equal(captured.auditLimit, 9)
    assert.equal(captured.validation.ok, true)
    assert.equal(captured.validation.capturedAddress, '127.0.0.1')

    const packetRoot = path.join(repoRoot, captured.packetRoot)
    const summary = JSON.parse(
      readFileSync(path.join(packetRoot, liveTransportFollowUpSummaryFileName), 'utf8')
    )
    assert.equal(summary.candidateTargetProfileId, candidateTargetProfileId)
    assert.equal(summary.capturedAt, '2026-04-29T12:04:00.000Z')
    assert.equal(summary.capturedAddress, '127.0.0.1')

    const auditIndex = JSON.parse(
      readFileSync(path.join(packetRoot, liveTransportFollowUpArtifactFiles.linked_controller_audit_reference), 'utf8')
    )
    assert.deepEqual(
      auditIndex.items.map((entry: { operation: { id: string } }) => entry.operation.id),
      ['op_create_rule_001', 'op_bootstrap_001']
    )
  } finally {
    await controllerServer.close()
    await agentServer.close()
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('previewLiveTransportFollowUpCapture resolves current controller-side capture plan without writing packet files', async () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))

  const controllerServer = await startJsonServer(({ pathname, searchParams }) => {
    if (pathname === '/api/controller/hosts') {
      return {
        body: {
          items: [
            {
              id: 'host_debian_review_009',
              targetProfileId: candidateTargetProfileId,
              tailscaleAddress: '100.91.22.99',
              updatedAt: '2026-05-01T12:02:00.000Z'
            }
          ]
        }
      }
    }

    if (pathname === '/api/controller/hosts/host_debian_review_009') {
      return {
        body: {
          id: 'host_debian_review_009',
          targetProfileId: candidateTargetProfileId,
          tailscaleAddress: '100.91.22.99',
          updatedAt: '2026-05-01T12:02:00.000Z'
        }
      }
    }

    if (pathname === '/api/controller/operations') {
      if (searchParams.get('type') === 'bootstrap_host') {
        return {
          body: {
            items: [
              {
                id: 'op_bootstrap_009',
                type: 'bootstrap_host',
                state: 'succeeded',
                hostId: 'host_debian_review_009',
                finishedAt: '2026-05-01T12:03:00.000Z'
              }
            ]
          }
        }
      }

      return {
        body: {
          items: []
        }
      }
    }

    if (pathname === '/api/controller/operations/op_bootstrap_009') {
      return {
        body: {
          id: 'op_bootstrap_009',
          type: 'bootstrap_host',
          state: 'succeeded',
          hostId: 'host_debian_review_009',
          finishedAt: '2026-05-01T12:03:00.000Z',
          resultSummary: 'host host_debian_review_009 bootstrapped via http://100.91.22.99:8711'
        }
      }
    }

    if (pathname === '/api/controller/event-audit-index') {
      assert.equal(searchParams.get('hostId'), 'host_debian_review_009')
      assert.equal(searchParams.get('limit'), '6')

      return {
        body: {
          items: [
            {
              lastEventAt: '2026-05-01T12:05:00.000Z',
              operation: {
                id: 'op_create_rule_009',
                finishedAt: '2026-05-01T12:05:00.000Z'
              }
            },
            {
              lastEventAt: '2026-05-01T12:03:00.000Z',
              operation: {
                id: 'op_bootstrap_009',
                finishedAt: '2026-05-01T12:03:00.000Z'
              }
            }
          ]
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  try {
    const preview = await previewLiveTransportFollowUpCapture({
      repoRoot,
      packetDate: '2026-05-01',
      controllerBaseUrl: `${controllerServer.baseUrl}/api/controller`,
      auditLimit: 6
    })

    assert.equal(
      preview.packetRoot,
      'docs/operations/artifacts/debian-12-live-tailscale-packet-2026-05-01'
    )
    assert.equal(preview.candidateTargetProfileId, candidateTargetProfileId)
    assert.equal(preview.hostId, 'host_debian_review_009')
    assert.equal(preview.bootstrapOperationId, 'op_bootstrap_009')
    assert.equal(preview.agentBaseUrl, 'http://100.91.22.99:8711')
    assert.equal(preview.bootstrapOperationPresentInAuditWindow, true)
    assert.equal(preview.captureReady, true)
    assert.deepEqual(preview.warnings, [])
    assert.equal(existsSync(path.join(repoRoot, preview.packetRoot)), false)
  } finally {
    await controllerServer.close()
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('previewLiveTransportFollowUpCapture reports unresolved capture blockers without writing packet files', async () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))

  const controllerServer = await startJsonServer(({ pathname, searchParams }) => {
    if (pathname === '/api/controller/hosts/host_debian_review_010') {
      return {
        body: {
          id: 'host_debian_review_010',
          targetProfileId: candidateTargetProfileId,
          tailscaleAddress: '100.91.22.100',
          updatedAt: '2026-05-02T12:02:00.000Z'
        }
      }
    }

    if (pathname === '/api/controller/operations/op_bootstrap_010') {
      return {
        body: {
          id: 'op_bootstrap_010',
          type: 'bootstrap_host',
          state: 'succeeded',
          hostId: 'host_debian_review_010',
          finishedAt: '2026-05-02T12:03:00.000Z',
          resultSummary: 'host host_debian_review_010 bootstrapped'
        }
      }
    }

    if (pathname === '/api/controller/event-audit-index') {
      assert.equal(searchParams.get('hostId'), 'host_debian_review_010')
      assert.equal(searchParams.get('limit'), '3')

      return {
        body: {
          items: [
            {
              lastEventAt: '2026-05-02T12:05:00.000Z',
              operation: {
                id: 'op_create_rule_010',
                finishedAt: '2026-05-02T12:05:00.000Z'
              }
            }
          ]
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  try {
    const preview = await previewLiveTransportFollowUpCapture({
      repoRoot,
      packetDate: '2026-05-02',
      controllerBaseUrl: `${controllerServer.baseUrl}/api/controller`,
      hostId: 'host_debian_review_010',
      bootstrapOperationId: 'op_bootstrap_010',
      auditLimit: 3
    })

    assert.equal(preview.captureReady, false)
    assert.equal(preview.agentBaseUrl, undefined)
    assert.equal(preview.bootstrapOperationPresentInAuditWindow, false)
    assert.match(preview.warnings.join('\n'), /agent base URL/i)
    assert.match(preview.warnings.join('\n'), /audit index does not include bootstrap operation/i)
    assert.equal(existsSync(path.join(repoRoot, preview.packetRoot)), false)
  } finally {
    await controllerServer.close()
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('captureLiveTransportFollowUpPacket auto-resolves latest candidate bootstrap ids when omitted', async () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))
  const packetDate = '2026-04-30'

  const agentServer = await startJsonServer(({ pathname }) => {
    if (pathname === '/health') {
      return {
        body: {
          schemaVersion: '0.1.0',
          status: 'ok'
        }
      }
    }

    if (pathname === '/runtime-state') {
      return {
        body: {
          schemaVersion: '0.1.0',
          updatedAt: '2026-04-30T12:05:00.000Z',
          agentState: 'ready'
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  const controllerServer = await startJsonServer(({ pathname, searchParams }) => {
    if (pathname === '/api/controller/hosts') {
      return {
        body: {
          items: [
            {
              id: 'host_supported_001',
              targetProfileId: 'ubuntu-24.04-systemd-tailscale',
              updatedAt: '2026-04-30T11:59:00.000Z'
            },
            {
              id: 'host_debian_review_002',
              targetProfileId: candidateTargetProfileId,
              updatedAt: '2026-04-30T12:00:00.000Z'
            }
          ]
        }
      }
    }

    if (pathname === '/api/controller/operations') {
      assert.equal(searchParams.get('type'), 'bootstrap_host')
      assert.equal(searchParams.get('state'), 'succeeded')

      return {
        body: {
          items: [
            {
              id: 'op_bootstrap_supported_001',
              type: 'bootstrap_host',
              state: 'succeeded',
              hostId: 'host_supported_001',
              finishedAt: '2026-04-30T12:03:00.000Z'
            },
            {
              id: 'op_bootstrap_candidate_002',
              type: 'bootstrap_host',
              state: 'succeeded',
              hostId: 'host_debian_review_002',
              finishedAt: '2026-04-30T12:04:00.000Z'
            }
          ]
        }
      }
    }

    if (pathname === '/api/controller/hosts/host_debian_review_002') {
      return {
        body: {
          id: 'host_debian_review_002',
          targetProfileId: candidateTargetProfileId,
          tailscaleAddress: '127.0.0.1',
          updatedAt: '2026-04-30T12:01:00.000Z'
        }
      }
    }

    if (pathname === '/api/controller/operations/op_bootstrap_candidate_002') {
      return {
        body: {
          id: 'op_bootstrap_candidate_002',
          type: 'bootstrap_host',
          state: 'succeeded',
          hostId: 'host_debian_review_002',
          finishedAt: '2026-04-30T12:04:00.000Z',
          resultSummary: `host host_debian_review_002 bootstrapped via ${agentServer.baseUrl}`
        }
      }
    }

    if (pathname === '/api/controller/event-audit-index') {
      assert.equal(searchParams.get('hostId'), 'host_debian_review_002')

      return {
        body: {
          items: [
            {
              lastEventAt: '2026-04-30T12:05:00.000Z',
              operation: {
                id: 'op_create_rule_002',
                finishedAt: '2026-04-30T12:05:00.000Z'
              }
            },
            {
              lastEventAt: '2026-04-30T12:04:00.000Z',
              operation: {
                id: 'op_bootstrap_candidate_002',
                finishedAt: '2026-04-30T12:04:00.000Z'
              }
            }
          ]
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  try {
    const captured = await captureLiveTransportFollowUpPacket({
      repoRoot,
      packetDate,
      controllerBaseUrl: `${controllerServer.baseUrl}/api/controller`
    })

    assert.equal(captured.candidateTargetProfileId, candidateTargetProfileId)
    assert.equal(captured.hostId, 'host_debian_review_002')
    assert.equal(captured.bootstrapOperationId, 'op_bootstrap_candidate_002')
    assert.equal(captured.agentBaseUrl, agentServer.baseUrl)
    assert.equal(captured.validation.ok, true)
  } finally {
    await controllerServer.close()
    await agentServer.close()
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

test('captureLiveTransportFollowUpPacket fails when explicit host and bootstrap ids drift', async () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-live-packet-helper-'))

  const controllerServer = await startJsonServer(({ pathname }) => {
    if (pathname === '/api/controller/operations/op_bootstrap_mismatch_001') {
      return {
        body: {
          id: 'op_bootstrap_mismatch_001',
          type: 'bootstrap_host',
          state: 'succeeded',
          hostId: 'host_other_001',
          finishedAt: '2026-04-30T13:00:00.000Z',
          resultSummary: 'host host_other_001 bootstrapped via http://127.0.0.1:8711'
        }
      }
    }

    return {
      status: 404,
      body: { error: 'not_found' }
    }
  })

  try {
    await assert.rejects(
      () =>
        captureLiveTransportFollowUpPacket({
          repoRoot,
          packetDate: '2026-04-30',
          controllerBaseUrl: `${controllerServer.baseUrl}/api/controller`,
          hostId: 'host_expected_001',
          bootstrapOperationId: 'op_bootstrap_mismatch_001'
        }),
      /belongs to host host_other_001, not host_expected_001/u
    )
  } finally {
    await controllerServer.close()
    rmSync(repoRoot, { recursive: true, force: true })
  }
})

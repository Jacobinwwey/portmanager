import test from 'node:test'
import assert from 'node:assert/strict'

import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  BackupsPage,
  BridgeRulesPage,
  ConsolePage,
  createMockBackupsState,
  createMockBridgeRulesState,
  createMockConsoleState,
  createMockHostDetailState,
  createMockHostsState,
  createMockOverviewState,
  HostDetailPage,
  HostsPage,
  loadConsoleState,
  OperationsPage,
  OverviewPage,
  createMockOperationsState,
  loadOverviewState,
  renderWebPreviewDocument,
  webBootstrapMessage
} from '../../apps/web/src/main.ts'

test('overview shell renders locked control-plane zones and managed hosts table', () => {
  const html = renderToStaticMarkup(h(OverviewPage, { state: createMockOverviewState() }))

  assert.match(html, /Control Plane/)
  assert.match(html, /Managed Hosts/)
  assert.match(html, /Selected Host/)
  assert.match(html, /Effective Policy/)
  assert.match(html, /Persistence readiness/i)
  assert.match(html, /Consumer boundary split criteria/i)
  assert.match(html, /Evidence ledger/i)
  assert.match(html, /Review packet readiness/i)
  assert.match(html, /Guide coverage/i)
  assert.match(html, /Artifact coverage/i)
  assert.match(html, /unit_63/i)
  assert.match(html, /Review adjudication/i)
  assert.match(html, /No review verdicts pending until packet-ready review opens/i)
  assert.match(html, /Review packet template/i)
  assert.match(html, /portmanager-debian-12-review-packet-template\.md/i)
  assert.match(html, /Bootstrap proof capture/i)
  assert.match(html, /portmanager-debian-12-bootstrap-proof-capture\.md/i)
  assert.match(html, /Steady-state proof capture/i)
  assert.match(html, /portmanager-debian-12-steady-state-proof-capture\.md/i)
  assert.match(html, /Backup and restore proof capture/i)
  assert.match(html, /portmanager-debian-12-backup-restore-proof-capture\.md/i)
  assert.match(html, /Diagnostics proof capture/i)
  assert.match(html, /portmanager-debian-12-diagnostics-proof-capture\.md/i)
  assert.match(html, /Rollback proof capture/i)
  assert.match(html, /portmanager-debian-12-rollback-proof-capture\.md/i)
  assert.match(html, /portmanager-debian-12-acceptance-recipe\.md/i)
  assert.match(html, /review prep/i)
  assert.match(html, /controller_embedded/i)
  assert.match(html, /Event Stream/)
  assert.match(html, /Overview/)
  assert.match(html, /Bridge Rules/)
  assert.match(html, /host_alpha/)
  assert.match(html, /ready/)
})

test('host detail shell renders required milestone sections', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /identity and readiness summary/i)
  assert.match(html, /target profile and capability contract/i)
  assert.match(html, /effective exposure policy/i)
  assert.match(html, /bridge rules/i)
  assert.match(html, /recent health checks/i)
  assert.match(html, /recent operations/i)
  assert.match(html, /backup and rollback history/i)
  assert.match(html, /latest diagnostics and snapshots/i)
  assert.match(html, /local artifact references/i)
  assert.match(html, /rule_alpha_https/)
})

test('host detail shell surfaces degraded bridge verification and required backup policy', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /degraded/i)
  assert.match(html, /rollback inspection required/i)
  assert.match(html, /required/i)
})

test('host detail shell surfaces rollback candidates and diagnostics evidence references', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /rollback candidates and execution/i)
  assert.match(html, /rp_alpha_001/i)
  assert.match(html, /applied/i)
  assert.match(html, /alpha relay healthy/i)
  assert.match(html, /snapshot-op_diag_001\.html/i)
})

test('host detail shell surfaces backup policy modes and remote backup status', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /best_effort/i)
  assert.match(html, /required/i)
  assert.match(html, /not_configured/i)
  assert.match(html, /configure github backup/i)
})

test('host detail shell surfaces agent heartbeat and version semantics', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /agent heartbeat/i)
  assert.match(html, /live/i)
  assert.match(html, /0\.1\.0/i)
})

test('host detail shell surfaces locked target profile contract and capabilities', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /ubuntu-24\.04-systemd-tailscale/i)
  assert.match(html, /ubuntu 24\.04 \+ systemd \+ tailscale/i)
  assert.match(html, /http-over-tailscale/i)
  assert.match(html, /bootstrap-host/i)
  assert.match(html, /collect-diagnostics/i)
})

test('host detail shell surfaces operation summaries and linked recovery evidence', () => {
  const html = renderToStaticMarkup(h(HostDetailPage, { state: createMockHostDetailState() }))

  assert.match(html, /required github backup is not configured/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /rp_alpha_002/i)
})

test('host detail shell groups degraded diagnostics history and recovery-ready evidence', () => {
  const state = createMockHostDetailState()
  state.diagnostics = [
    {
      id: 'op_diag_degraded_000',
      type: 'diagnostics',
      state: 'degraded',
      hostId: 'host_alpha',
      ruleId: 'rule_alpha_https',
      startedAt: '2026-04-16T17:44:00.000Z',
      finishedAt: '2026-04-16T17:45:00.000Z',
      resultSummary: 'diagnostics detected drift and rollback inspection remains required',
      diagnosticResult: {
        hostId: 'host_alpha',
        ruleId: 'rule_alpha_https',
        capturedAt: '2026-04-16T17:45:00.000Z',
        port: 443,
        tcpReachable: true,
        httpStatus: 502,
        pageTitle: 'Alpha Relay Degraded',
        finalUrl: 'http://127.0.0.1/degraded'
      }
    },
    ...state.diagnostics
  ]

  const html = renderToStaticMarkup(h(HostDetailPage, { state }))

  assert.match(html, /degraded diagnostics history/i)
  assert.match(html, /recovery-ready diagnostics/i)
  assert.match(html, /rollback inspection remains required/i)
  assert.match(html, /alpha relay healthy/i)
})

test('operations shell renders required operations page sections', () => {
  const html = renderToStaticMarkup(h(OperationsPage, { state: createMockOperationsState() }))

  assert.match(html, /active and recent operations list/i)
  assert.match(html, /operation state timeline/i)
  assert.match(html, /initiator and request source/i)
  assert.match(html, /linked host, rule, backup, rollback, and diagnostic artifacts/i)
  assert.match(html, /selected operation event stream/i)
})

test('operations shell surfaces selected operation timeline and linked artifacts', () => {
  const html = renderToStaticMarkup(h(OperationsPage, { state: createMockOperationsState() }))

  assert.match(html, /op_backup_required_001/i)
  assert.match(html, /required github backup is not configured/i)
  assert.match(html, /web/i)
  assert.match(html, /policy-runbook\/backup-required/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /rp_alpha_002/i)
  assert.match(html, /snapshot-op_diag_001\.html/i)
})

test('hosts shell renders live-parity inventory and selected host rollout evidence', () => {
  const html = renderToStaticMarkup(h(HostsPage, { state: createMockHostsState() }))

  assert.match(html, /managed host inventory/i)
  assert.match(html, /selected host rollout/i)
  assert.match(html, /recent host health checks/i)
  assert.match(html, /alpha-gateway/i)
  assert.match(html, /ubuntu-24\.04-systemd-tailscale/i)
  assert.match(html, /host_probe/i)
})

test('bridge rules shell renders rule topology, verification, and linked operations evidence', () => {
  const html = renderToStaticMarkup(h(BridgeRulesPage, { state: createMockBridgeRulesState() }))

  assert.match(html, /bridge rule inventory/i)
  assert.match(html, /selected rule topology/i)
  assert.match(html, /verification and diagnostics/i)
  assert.match(html, /linked operations and recovery/i)
  assert.match(html, /rule_alpha_https/i)
  assert.match(html, /rollback inspection required/i)
})

test('backups shell renders backup manifests and rollback readiness detail', () => {
  const html = renderToStaticMarkup(h(BackupsPage, { state: createMockBackupsState() }))

  assert.match(html, /backup inventory and manifests/i)
  assert.match(html, /selected backup detail/i)
  assert.match(html, /rollback readiness/i)
  assert.match(html, /backup_alpha_002/i)
  assert.match(html, /op_snapshot_002-manifest\.json/i)
  assert.match(html, /required-mode degradation/i)
  assert.match(html, /configure github backup/i)
})

test('console shell renders controller replay and selected diagnostic detail', () => {
  const html = renderToStaticMarkup(h(ConsolePage, { state: createMockConsoleState() }))

  assert.match(html, /controller console and replay/i)
  assert.match(html, /recent controller events/i)
  assert.match(html, /selected diagnostic detail/i)
  assert.match(html, /persistence readiness/i)
  assert.match(html, /consumer boundary split criteria/i)
  assert.match(html, /Alpha Relay Healthy/i)
  assert.match(html, /required GitHub backup is not configured/i)
})

test('preview document embeds styles and web skeleton copy', () => {
  const html = renderWebPreviewDocument('overview')

  assert.match(html, /PortManager web skeleton/)
  assert.match(html, /--pm-accent/)
  assert.match(html, /Managed Hosts/)
  assert.equal(webBootstrapMessage(), 'PortManager web skeleton')
})

test('preview document renders operations shell when requested', () => {
  const html = renderWebPreviewDocument('operations')

  assert.match(html, /Selected operation event stream/i)
  assert.match(html, /Operation state timeline/i)
})

test('preview document renders hosts shell when requested', () => {
  const html = renderWebPreviewDocument('hosts')

  assert.match(html, /Managed host inventory/i)
  assert.match(html, /Selected host rollout/i)
})

test('overview loader keeps consumer boundary base path when building controller urls', async () => {
  const requestedPaths: string[] = []
  const fetchImpl: typeof fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    requestedPaths.push(url.pathname)

    if (url.pathname === '/api/controller/hosts') {
      return new Response(
        JSON.stringify({
          items: [
            {
              id: 'host_alpha',
              name: 'Alpha Relay',
              readiness: 'ready',
              labels: ['edge'],
              sshHost: '100.64.0.11',
              sshPort: 22,
              exposurePolicySummary: 'https preferred',
              bridgeRuleIds: ['rule_alpha_https'],
              degradedReasons: []
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/operations') {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/events') {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/hosts/host_alpha') {
      return new Response(
        JSON.stringify({
          id: 'host_alpha',
          name: 'Alpha Relay',
          readiness: 'ready',
          labels: ['edge'],
          sshHost: '100.64.0.11',
          sshPort: 22,
          agentVersion: '0.1.0',
          agentHeartbeatState: 'live',
          bridgeRules: [],
          recentOperations: [],
          effectiveExposurePolicy: {
            hostId: 'host_alpha',
            allowedSources: ['0.0.0.0/0'],
            excludedPorts: [],
            samePortMirror: true,
            conflictPolicy: 'replace_existing',
            backupPolicy: 'best_effort'
          }
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (
      url.pathname === '/api/controller/health-checks' ||
      url.pathname === '/api/controller/backups' ||
      url.pathname === '/api/controller/rollback-points' ||
      url.pathname === '/api/controller/diagnostics'
    ) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/persistence-decision-pack') {
      return new Response(
        JSON.stringify({
          backend: 'sqlite',
          migrationTarget: 'postgresql',
          decisionState: 'hold',
          reviewRequired: false,
          summary: 'consumer boundary keeps SQLite active and no PostgreSQL review is required yet',
          nextActions: ['keep SQLite active', 'continue tracking counters'],
          triggerMetrics: [],
          readiness: {
            backend: 'sqlite',
            databasePath: '/var/lib/portmanager/controller.sqlite',
            status: 'healthy',
            migrationTarget: 'postgresql',
            summary: 'consumer boundary readiness is healthy',
            recommendedAction: 'keep current store',
            metrics: {
              operationRows: {
                current: 2,
                monitor: 500,
                migrationReady: 2000,
                status: 'healthy'
              },
              diagnosticRows: {
                current: 1,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              backupRows: {
                current: 1,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              rollbackPointRows: {
                current: 1,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              hostRows: {
                current: 1,
                monitor: 25,
                migrationReady: 100,
                status: 'healthy'
              }
            }
          }
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/deployment-boundary-decision-pack') {
      return new Response(
        JSON.stringify({
          boundaryTarget: '/api/controller',
          deploymentMode: 'controller_embedded',
          reviewOwner: 'controller',
          decisionState: 'hold',
          standaloneReviewRequired: false,
          summary: 'deployment boundary pack is alive',
          nextActions: ['keep /api/controller controller-embedded'],
          satisfiedCriteria: [
            {
              id: 'audit_review_owner',
              label: 'Audit review owner',
              reason: 'Replay plus indexed review already sit behind one audit-review owner.'
            }
          ],
          blockingCriteria: [
            {
              id: 'independent_deployable_artifact',
              label: 'Independent deployable artifact',
              reason: 'still missing'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/second-target-policy-pack') {
      return new Response(
        JSON.stringify({
          lockedTargetProfileId: 'ubuntu-24.04-systemd-tailscale',
          reviewOwner: 'controller',
          supportedTargetProfiles: [
            {
              id: 'ubuntu-24.04-systemd-tailscale',
              label: 'Ubuntu 24.04 + systemd + Tailscale',
              status: 'supported'
            }
          ],
          candidateTargetProfiles: [
            {
              id: 'debian-12-systemd-tailscale',
              label: 'Debian 12 + systemd + Tailscale',
              status: 'candidate'
            }
          ],
          candidateTargetProfileIds: ['debian-12-systemd-tailscale'],
          decisionState: 'hold',
          expansionReviewRequired: false,
          summary:
            'Second-target support must stay on hold because bootstrap transport parity, steady-state transport parity, backup and restore parity, diagnostics parity, rollback parity, docs contract ready, acceptance recipe ready, and operator ownership defined are still missing.',
          nextActions: [
            'Keep supported targets locked to ubuntu-24.04-systemd-tailscale.',
            'Keep debian-12-systemd-tailscale in review-prep until transport, recovery, docs, acceptance, and ownership evidence are all real.',
            'Prove bootstrap transport, steady-state transport, backup and restore, diagnostics, and rollback parity before any second-target support claim.'
          ],
          reviewPacketReadiness: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            state: 'capture_required',
            summary:
              'Review-packet guide set is complete for debian-12-systemd-tailscale, but no Debian 12 execution artifacts are captured yet. Current truth is template-ready, not packet-ready.',
            requiredNextAction:
              'Execute one bounded Debian 12 review packet before changing any bootstrap, steady-state, backup, diagnostics, or rollback parity claim.',
            guideCoverage: {
              available: 6,
              expected: 6,
              missingPaths: []
            },
            artifactCoverage: {
              available: 0,
              expected: 20,
              missingArtifactIds: [
                'bootstrap_operation_id',
                'bootstrap_result_summary',
                'audit_reference',
                'target_profile_confirmation'
              ]
            },
            nextExecutionUnits: [
              {
                id: 'unit_63',
                title: 'Review-packet readiness pack',
                summary: 'Publish capture state, artifact coverage, and next-unit truth.'
              }
            ]
          },
          reviewAdjudication: {
            state: 'not_open',
            reviewOwner: 'controller',
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            contractPath: 'docs/operations/portmanager-second-target-review-contract.md',
            packetRoot: 'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21',
            summary:
              'Bounded second-target review is not open for debian-12-systemd-tailscale; keep packet capture and public wording aligned until decision state is review_required and readiness is packet_ready.',
            pendingVerdicts: [],
            sources: [
              'docs/operations/portmanager-second-target-review-contract.md',
              'docs/operations/portmanager-debian-12-operator-ownership.md'
            ]
          },
          reviewPacketTemplate: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            templatePath: 'docs/operations/portmanager-debian-12-review-packet-template.md',
            summary: 'review packet template exists',
            requiredEvidence: [
              {
                criterionId: 'bootstrap_transport_parity',
                label: 'Bootstrap transport parity',
                summary: 'capture bootstrap packet evidence',
                sources: ['docs/operations/portmanager-debian-12-review-packet-template.md']
              }
            ]
          },
          bootstrapProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-bootstrap-proof-capture.md',
            summary: 'bootstrap proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'bootstrap_operation_id',
                label: 'Bootstrap operation id',
                summary: 'capture bootstrap operation id'
              }
            ],
            sources: [
              'docs/operations/portmanager-debian-12-bootstrap-proof-capture.md',
              'docs/operations/portmanager-debian-12-acceptance-recipe.md'
            ]
          },
          steadyStateProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-steady-state-proof-capture.md',
            summary: 'steady-state proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'health_capture',
                label: 'Health capture',
                summary: 'capture steady-state /health output'
              }
            ],
            sources: [
              'docs/operations/portmanager-debian-12-steady-state-proof-capture.md',
              'docs/operations/portmanager-debian-12-acceptance-recipe.md'
            ]
          },
          backupRestoreProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-backup-restore-proof-capture.md',
            summary: 'backup and restore proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'backup_manifest_path',
                label: 'Backup manifest path',
                summary: 'capture manifest path for one backup-bearing mutation'
              }
            ],
            sources: [
              'docs/operations/portmanager-debian-12-backup-restore-proof-capture.md',
              'docs/operations/portmanager-debian-12-acceptance-recipe.md'
            ]
          },
          evidenceItems: [
            {
              criterionId: 'docs_contract_ready',
              label: 'Docs contract ready',
              state: 'landed',
              summary: 'docs contract exists',
              sources: ['docs/operations/portmanager-second-target-review-contract.md']
            },
            {
              criterionId: 'acceptance_recipe_ready',
              label: 'Acceptance recipe ready',
              state: 'landed',
              summary: 'acceptance recipe exists',
              sources: ['docs/operations/portmanager-debian-12-acceptance-recipe.md']
            },
            {
              criterionId: 'operator_ownership_defined',
              label: 'Operator ownership defined',
              state: 'landed',
              summary: 'ownership definition exists',
              sources: ['docs/operations/portmanager-debian-12-operator-ownership.md']
            },
            {
              criterionId: 'bootstrap_transport_parity',
              label: 'Bootstrap transport parity',
              state: 'review_prep',
              summary: 'candidate bootstrap review-prep lane landed, but parity proof is not captured yet',
              sources: [
                'apps/controller/src/controller-server.ts',
                'tests/controller/host-rule-policy.test.ts',
                'docs/operations/portmanager-debian-12-acceptance-recipe.md'
              ]
            }
          ],
          satisfiedCriteria: [
            {
              id: 'locked_target_registry',
              label: 'Locked target registry',
              reason:
                'One explicit locked target profile is already published across controller, CLI, and Web.'
            }
          ],
          blockingCriteria: [
            {
              id: 'candidate_target_declared',
              label: 'Candidate target declared',
              reason: 'One explicit second-target candidate is declared for review.'
            }
          ],
          blockingCriteria: [
            {
              id: 'bootstrap_transport_parity',
              label: 'Bootstrap transport parity',
              reason: 'Bootstrap transport parity is still missing for the candidate target.'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/consumer-boundary-decision-pack') {
      return new Response(
        JSON.stringify({
          boundaryPath: '/api/controller',
          hostingMode: 'controller_embedded',
          reviewOwner: 'controller',
          decisionState: 'hold',
          splitReviewRequired: false,
          summary: '/api/controller should remain inside controller because standalone split criteria are still missing.',
          nextActions: [
            'Keep /api/controller embedded while standalone deployment ownership is absent.',
            'Define dedicated edge policy and ownership split before reopening gateway review.'
          ],
          satisfiedCriteria: [
            {
              id: 'shared_contract_parity',
              label: 'Shared contract parity',
              reason: 'CLI, Web, and automation already share one generated consumer contract.'
            }
          ],
          blockingCriteria: [
            {
              id: 'standalone_deployment_boundary',
              label: 'Standalone deployment boundary',
              reason: 'Consumer transport still ships inside controller with no independent deployment boundary.'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  const state = await loadOverviewState({
    baseUrl: 'http://127.0.0.1:8710/api/controller',
    fetchImpl
  })

  assert.equal(state.persistenceDecisionPack.backend, 'sqlite')
  assert.equal(state.persistenceDecisionPack.decisionState, 'hold')
  assert.equal(state.deploymentBoundaryDecisionPack.decisionState, 'hold')
  assert.equal(state.secondTargetPolicyPack.decisionState, 'hold')
  assert.equal(requestedPaths.every((pathname) => pathname.startsWith('/api/controller/')), true)
  assert.equal(requestedPaths.includes('/api/controller/consumer-boundary-decision-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/deployment-boundary-decision-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/persistence-decision-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/second-target-policy-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/hosts/host_alpha'), true)
})

test('console loader keeps consumer boundary decision pack on prefixed controller urls', async () => {
  const requestedPaths: string[] = []
  const fetchImpl: typeof fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    requestedPaths.push(url.pathname)

    if (
      url.pathname === '/api/controller/operations' ||
      url.pathname === '/api/controller/diagnostics' ||
      url.pathname === '/api/controller/events' ||
      url.pathname === '/api/controller/event-audit-index'
    ) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    if (url.pathname === '/api/controller/consumer-boundary-decision-pack') {
      return new Response(
        JSON.stringify({
          boundaryPath: '/api/controller',
          hostingMode: 'controller_embedded',
          reviewOwner: 'controller',
          decisionState: 'hold',
          splitReviewRequired: false,
          summary: 'consumer boundary pack is alive',
          nextActions: ['keep /api/controller embedded'],
          satisfiedCriteria: [],
          blockingCriteria: [
            {
              id: 'standalone_deployment_boundary',
              label: 'Standalone deployment boundary',
              reason: 'still missing'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/deployment-boundary-decision-pack') {
      return new Response(
        JSON.stringify({
          boundaryTarget: '/api/controller',
          deploymentMode: 'controller_embedded',
          reviewOwner: 'controller',
          decisionState: 'hold',
          standaloneReviewRequired: false,
          summary: 'deployment boundary pack is alive',
          nextActions: ['keep /api/controller controller-embedded'],
          satisfiedCriteria: [],
          blockingCriteria: [
            {
              id: 'independent_deployable_artifact',
              label: 'Independent deployable artifact',
              reason: 'still missing'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/second-target-policy-pack') {
      return new Response(
        JSON.stringify({
          lockedTargetProfileId: 'ubuntu-24.04-systemd-tailscale',
          reviewOwner: 'controller',
          supportedTargetProfiles: [
            {
              id: 'ubuntu-24.04-systemd-tailscale',
              label: 'Ubuntu 24.04 + systemd + Tailscale',
              status: 'supported'
            }
          ],
          candidateTargetProfiles: [
            {
              id: 'debian-12-systemd-tailscale',
              label: 'Debian 12 + systemd + Tailscale',
              status: 'candidate'
            }
          ],
          candidateTargetProfileIds: ['debian-12-systemd-tailscale'],
          decisionState: 'hold',
          expansionReviewRequired: false,
          summary: 'second target policy pack is alive',
          nextActions: ['keep supported targets locked'],
          reviewPacketReadiness: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            state: 'capture_required',
            summary:
              'Review-packet guide set is complete for debian-12-systemd-tailscale, but no Debian 12 execution artifacts are captured yet. Current truth is template-ready, not packet-ready.',
            requiredNextAction:
              'execute one bounded Debian 12 review packet before changing any bootstrap, steady-state, backup, diagnostics, or rollback parity claim.',
            guideCoverage: {
              available: 6,
              expected: 6,
              missingPaths: []
            },
            artifactCoverage: {
              available: 0,
              expected: 20,
              missingArtifactIds: ['bootstrap_operation_id']
            },
            nextExecutionUnits: [
              {
                id: 'unit_63',
                title: 'Review-packet readiness pack',
                summary: 'publish coverage truth'
              }
            ]
          },
          reviewAdjudication: {
            state: 'not_open',
            reviewOwner: 'controller',
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            contractPath: 'docs/operations/portmanager-second-target-review-contract.md',
            packetRoot: 'docs/operations/artifacts/debian-12-bootstrap-packet-2026-04-21',
            summary:
              'Bounded second-target review is not open for debian-12-systemd-tailscale; keep packet capture and public wording aligned until decision state is review_required and readiness is packet_ready.',
            pendingVerdicts: [],
            sources: ['docs/operations/portmanager-second-target-review-contract.md']
          },
          reviewPacketTemplate: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            templatePath: 'docs/operations/portmanager-debian-12-review-packet-template.md',
            summary: 'review packet template exists',
            requiredEvidence: [
              {
                criterionId: 'bootstrap_transport_parity',
                label: 'Bootstrap transport parity',
                summary: 'capture bootstrap packet evidence',
                sources: ['docs/operations/portmanager-debian-12-review-packet-template.md']
              }
            ]
          },
          bootstrapProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-bootstrap-proof-capture.md',
            summary: 'bootstrap proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'bootstrap_operation_id',
                label: 'Bootstrap operation id',
                summary: 'capture bootstrap operation id'
              }
            ],
            sources: ['docs/operations/portmanager-debian-12-bootstrap-proof-capture.md']
          },
          steadyStateProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-steady-state-proof-capture.md',
            summary: 'steady-state proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'health_capture',
                label: 'Health capture',
                summary: 'capture steady-state /health output'
              }
            ],
            sources: ['docs/operations/portmanager-debian-12-steady-state-proof-capture.md']
          },
          backupRestoreProofCapture: {
            candidateTargetProfileId: 'debian-12-systemd-tailscale',
            guidePath: 'docs/operations/portmanager-debian-12-backup-restore-proof-capture.md',
            summary: 'backup and restore proof capture guide exists',
            requiredArtifacts: [
              {
                id: 'backup_manifest_path',
                label: 'Backup manifest path',
                summary: 'capture manifest path for one backup-bearing mutation'
              }
            ],
            sources: ['docs/operations/portmanager-debian-12-backup-restore-proof-capture.md']
          },
          evidenceItems: [
            {
              criterionId: 'docs_contract_ready',
              label: 'Docs contract ready',
              state: 'landed',
              summary: 'docs contract exists',
              sources: ['docs/operations/portmanager-second-target-review-contract.md']
            },
            {
              criterionId: 'bootstrap_transport_parity',
              label: 'Bootstrap transport parity',
              state: 'review_prep',
              summary: 'candidate bootstrap review-prep lane landed, but parity proof is not captured yet',
              sources: [
                'apps/controller/src/controller-server.ts',
                'tests/controller/host-rule-policy.test.ts',
                'docs/operations/portmanager-debian-12-acceptance-recipe.md'
              ]
            }
          ],
          satisfiedCriteria: [],
          blockingCriteria: [
            {
              id: 'bootstrap_transport_parity',
              label: 'Bootstrap transport parity',
              reason: 'still missing'
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    if (url.pathname === '/api/controller/persistence-decision-pack') {
      return new Response(
        JSON.stringify({
          backend: 'sqlite',
          migrationTarget: 'postgresql',
          decisionState: 'hold',
          reviewRequired: false,
          summary: 'no persistence review required',
          nextActions: ['keep SQLite active'],
          triggerMetrics: [],
          readiness: {
            backend: 'sqlite',
            databasePath: '/var/lib/portmanager/controller.sqlite',
            status: 'healthy',
            migrationTarget: 'postgresql',
            summary: 'healthy',
            recommendedAction: 'keep current store',
            metrics: {
              operationRows: {
                current: 0,
                monitor: 500,
                migrationReady: 2000,
                status: 'healthy'
              },
              diagnosticRows: {
                current: 0,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              backupRows: {
                current: 0,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              rollbackPointRows: {
                current: 0,
                monitor: 200,
                migrationReady: 750,
                status: 'healthy'
              },
              hostRows: {
                current: 0,
                monitor: 25,
                migrationReady: 100,
                status: 'healthy'
              }
            }
          }
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    }

    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  const state = await loadConsoleState({
    baseUrl: 'http://127.0.0.1:8710/api/controller',
    fetchImpl
  })

  assert.equal(state.consumerBoundaryDecisionPack.decisionState, 'hold')
  assert.equal(state.deploymentBoundaryDecisionPack.decisionState, 'hold')
  assert.equal(state.secondTargetPolicyPack.decisionState, 'hold')
  assert.equal(requestedPaths.includes('/api/controller/consumer-boundary-decision-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/deployment-boundary-decision-pack'), true)
  assert.equal(requestedPaths.includes('/api/controller/second-target-policy-pack'), true)
})

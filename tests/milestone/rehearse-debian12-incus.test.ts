import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildIncusRehearsalPlan,
  DEFAULT_IMAGE,
  DEFAULT_INSTANCE_NAME,
  formatCommand,
  parseArgs,
  renderIncusRehearsalSummary
} from '../../scripts/acceptance/rehearse-debian12-incus.mjs'

test('parseArgs keeps defaults and accepts overrides', () => {
  assert.deepEqual(parseArgs([]), {
    instanceName: DEFAULT_INSTANCE_NAME,
    image: DEFAULT_IMAGE,
    controllerBaseUrl: '<url>',
    dryRun: false
  })

  assert.deepEqual(
    parseArgs([
      '--name',
      'pm-review',
      '--image',
      'images:ubuntu/24.04',
      '--controller-base-url',
      'http://127.0.0.1:8080',
      '--dry-run'
    ]),
    {
      instanceName: 'pm-review',
      image: 'images:ubuntu/24.04',
      controllerBaseUrl: 'http://127.0.0.1:8080',
      dryRun: true
    }
  )
})

test('buildIncusRehearsalPlan keeps launch, review, and cleanup commands aligned', () => {
  const plan = buildIncusRehearsalPlan({
    instanceName: 'pm-review',
    controllerBaseUrl: 'http://127.0.0.1:8080',
    repoRootPath: '/repo'
  })

  assert.equal(formatCommand(plan.launchCommands[0] ?? []), 'incus launch images:debian/12 pm-review')
  assert.equal(
    formatCommand(plan.launchCommands[1] ?? []),
    'incus config device add pm-review repo disk source=/repo path=/workspaces/portmanager'
  )
  assert.match(plan.repoCommands[0] ?? '', /pnpm acceptance:verify/)
  assert.match(plan.repoCommands[1] ?? '', /pnpm milestone:fetch:review-pack/)
  assert.match(plan.repoCommands[2] ?? '', /pnpm milestone:review:promotion-ready -- --limit 20/)
  assert.match(
    plan.repoCommands[3] ?? '',
    /pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url http:\/\/127\.0\.0\.1:8080/
  )
  assert.equal(formatCommand(plan.cleanupCommand), 'incus delete -f pm-review')
})

test('renderIncusRehearsalSummary advertises bounded guardrail commands', () => {
  const summary = renderIncusRehearsalSummary(
    buildIncusRehearsalPlan({
      instanceName: 'pm-review',
      controllerBaseUrl: 'http://127.0.0.1:8080',
      repoRootPath: '/repo'
    })
  )

  assert.match(summary, /PortManager Debian 12 incus rehearsal/)
  assert.match(summary, /incus launch images:debian\/12 pm-review/)
  assert.match(summary, /incus config device add pm-review repo disk source=\/repo path=\/workspaces\/portmanager/)
  assert.match(summary, /pnpm acceptance:verify/)
  assert.match(summary, /pnpm milestone:review:promotion-ready -- --limit 20/)
  assert.match(summary, /pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url http:\/\/127\.0\.0\.1:8080/)
  assert.match(summary, /staging only; incus rehearsal does not widen second-target support claims/i)
})

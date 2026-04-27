import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

export const DEFAULT_INSTANCE_NAME = 'portmanager-debian12-review'
export const DEFAULT_IMAGE = 'images:debian/12'

export function parseArgs(argv) {
  const options = {
    instanceName: DEFAULT_INSTANCE_NAME,
    image: DEFAULT_IMAGE,
    controllerBaseUrl: '<url>',
    dryRun: false
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--') {
      continue
    }

    if (current === '--name') {
      options.instanceName = argv[index + 1] ?? DEFAULT_INSTANCE_NAME
      index += 1
      continue
    }

    if (current === '--image') {
      options.image = argv[index + 1] ?? DEFAULT_IMAGE
      index += 1
      continue
    }

    if (current === '--controller-base-url') {
      options.controllerBaseUrl = argv[index + 1] ?? '<url>'
      index += 1
      continue
    }

    if (current === '--dry-run') {
      options.dryRun = true
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return options
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=+,\-<>]+$/u.test(value)) {
    return value
  }

  return `'${value.replace(/'/gu, `'\\''`)}'`
}

export function formatCommand(parts) {
  return parts.map((part) => shellQuote(part)).join(' ')
}

export function buildIncusRehearsalPlan({
  instanceName = DEFAULT_INSTANCE_NAME,
  image = DEFAULT_IMAGE,
  controllerBaseUrl = '<url>',
  repoRootPath = repoRoot
} = {}) {
  const mountPath = '/workspaces/portmanager'
  const packageInstallCommand =
    'apt-get update && apt-get install -y ca-certificates curl openssh-client'

  return {
    instanceName,
    image,
    repoRootPath,
    mountPath,
    launchCommands: [
      ['incus', 'launch', image, instanceName],
      [
        'incus',
        'config',
        'device',
        'add',
        instanceName,
        'repo',
        'disk',
        `source=${repoRootPath}`,
        `path=${mountPath}`
      ],
      ['incus', 'exec', instanceName, '--', 'bash', '-lc', packageInstallCommand]
    ],
    followUpCommands: [
      ['incus', 'list', instanceName, '--format', 'json'],
      ['incus', 'exec', instanceName, '--', 'bash', '-lc', 'cat /etc/os-release'],
      ['incus', 'exec', instanceName, '--', 'bash', '-lc', `ls ${mountPath}`]
    ],
    repoCommands: [
      'pnpm acceptance:verify',
      'pnpm milestone:fetch:review-pack',
      'pnpm milestone:review:promotion-ready -- --limit 20',
      `pnpm milestone:preview:live-packet -- --packet-date <date> --controller-base-url ${controllerBaseUrl}`
    ],
    cleanupCommand: ['incus', 'delete', '-f', instanceName]
  }
}

export function renderIncusRehearsalSummary(plan) {
  return [
    'PortManager Debian 12 incus rehearsal',
    `Instance: ${plan.instanceName}`,
    `Image: ${plan.image}`,
    `Repo mount: ${plan.mountPath}`,
    '',
    'Launch:',
    ...plan.launchCommands.map((command) => `- ${formatCommand(command)}`),
    '',
    'Follow-up:',
    ...plan.followUpCommands.map((command) => `- ${formatCommand(command)}`),
    '',
    'Repo guardrail commands:',
    ...plan.repoCommands.map((command) => `- ${command}`),
    '',
    `Cleanup: ${formatCommand(plan.cleanupCommand)}`,
    '',
    'Guardrail: staging only; incus rehearsal does not widen second-target support claims by itself.'
  ].join('\n')
}

export function ensureIncusAvailable({ spawnSyncImpl = spawnSync } = {}) {
  const result = spawnSyncImpl('incus', ['version'], {
    encoding: 'utf8'
  })

  return !result.error && (result.status ?? 1) === 0
}

export function runIncusRehearsalPlan(plan, { spawnSyncImpl = spawnSync } = {}) {
  for (const command of plan.launchCommands) {
    const [binary, ...args] = command
    const result = spawnSyncImpl(binary, args, {
      encoding: 'utf8',
      stdio: 'inherit'
    })

    if (result.error) {
      throw result.error
    }

    if ((result.status ?? 1) !== 0) {
      throw new Error(`Command failed: ${formatCommand(command)}`)
    }
  }
}

function isDirectRun() {
  return process.argv[1] ? path.resolve(process.argv[1]) === __filename : false
}

if (isDirectRun()) {
  const options = parseArgs(process.argv.slice(2))
  const plan = buildIncusRehearsalPlan(options)

  if (!options.dryRun) {
    if (!ensureIncusAvailable()) {
      throw new Error('incus not found on PATH. Install incus or rerun with --dry-run.')
    }

    runIncusRehearsalPlan(plan)
  }

  process.stdout.write(`${renderIncusRehearsalSummary(plan)}\n`)
}

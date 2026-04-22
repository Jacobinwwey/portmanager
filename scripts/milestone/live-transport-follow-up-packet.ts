import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  candidateTargetProfileId,
  liveTransportFollowUpArtifactFiles,
  liveTransportFollowUpArtifactRootPattern,
  liveTransportFollowUpScaffoldMarkerField,
  liveTransportFollowUpSummaryFileName,
  validateLiveTransportFollowUpPacket
} from '../../apps/controller/src/index.ts'

const defaultRepoRoot = fileURLToPath(new URL('../..', import.meta.url))
const livePacketRootPrefix = 'docs/operations/artifacts/debian-12-live-tailscale-packet-'
const packetDatePattern = /^\d{4}-\d{2}-\d{2}$/

export interface LiveTransportFollowUpPacketCliOptions {
  action: 'scaffold' | 'validate'
  repoRoot: string
  packetDate?: string
  packetRoot?: string
  capturedAt?: string
  latest: boolean
  force: boolean
  json: boolean
}

export interface ScaffoldLiveTransportFollowUpPacketResult {
  packetRoot: string
  summaryPath: string
  readmePath: string
  validation: ReturnType<typeof validateLiveTransportFollowUpPacket>
}

function usage() {
  return [
    'Usage:',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts scaffold --packet-date YYYY-MM-DD [--captured-at ISO] [--force] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts validate [--packet-root <repo-relative-root> | --latest] [--json]'
  ].join('\n')
}

export function parseArgs(argv: string[]): LiveTransportFollowUpPacketCliOptions {
  const tokens = [...argv]
  if (tokens[0] === '--') {
    tokens.shift()
  }

  const actionToken = tokens.shift()
  if (actionToken !== 'scaffold' && actionToken !== 'validate') {
    throw new Error(usage())
  }

  const options: LiveTransportFollowUpPacketCliOptions = {
    action: actionToken,
    repoRoot: defaultRepoRoot,
    latest: false,
    force: false,
    json: false
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index]

    if (current === '--repo-root') {
      options.repoRoot = path.resolve(tokens[++index] ?? '')
      continue
    }

    if (current === '--packet-date') {
      options.packetDate = tokens[++index]
      continue
    }

    if (current === '--packet-root') {
      options.packetRoot = tokens[++index]
      continue
    }

    if (current === '--captured-at') {
      options.capturedAt = tokens[++index]
      continue
    }

    if (current === '--latest') {
      options.latest = true
      continue
    }

    if (current === '--force') {
      options.force = true
      continue
    }

    if (current === '--json') {
      options.json = true
      continue
    }

    throw new Error(`unknown argument: ${current}\n${usage()}`)
  }

  if (options.action === 'scaffold' && !options.packetDate) {
    throw new Error(`--packet-date is required for scaffold\n${usage()}`)
  }

  if (options.action === 'validate' && options.packetRoot && options.latest) {
    throw new Error(`choose --packet-root or --latest, not both\n${usage()}`)
  }

  return options
}

function packetRootFromDate(packetDate: string) {
  if (!packetDatePattern.test(packetDate)) {
    throw new Error(`packet date must match YYYY-MM-DD: ${packetDate}`)
  }

  return `${livePacketRootPrefix}${packetDate}`
}

function toAbsolutePacketRoot(repoRoot: string, packetRoot: string) {
  return path.resolve(repoRoot, packetRoot)
}

export function resolveLatestLiveTransportFollowUpPacketRoot(repoRoot: string) {
  const artifactsRoot = path.join(repoRoot, 'docs', 'operations', 'artifacts')
  if (!existsSync(artifactsRoot) || !statSync(artifactsRoot).isDirectory()) {
    return undefined
  }

  const packetRoots = readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('debian-12-live-tailscale-packet-'))
    .map((entry) => path.posix.join('docs', 'operations', 'artifacts', entry.name))
    .sort((left, right) => right.localeCompare(left))

  return packetRoots[0]
}

function createScaffoldJson(artifactId: string, packetRoot: string) {
  return {
    [liveTransportFollowUpScaffoldMarkerField]: true,
    artifactId,
    packetRoot,
    status: 'replace_with_real_capture',
    requiredNextAction:
      'Replace this scaffold file with one real capture before running milestone:validate:live-packet.'
  }
}

function createSummaryScaffold(packetRoot: string, capturedAt: string) {
  return {
    [liveTransportFollowUpScaffoldMarkerField]: true,
    candidateTargetProfileId,
    capturedAt,
    capturedAddress: '',
    requiredArtifactIds: [],
    artifactFiles: Object.fromEntries(
      Object.entries(liveTransportFollowUpArtifactFiles).map(([artifactId, filename]) => [
        artifactId,
        filename
      ])
    ),
    requiredNextAction:
      'Replace scaffold marker, fill capturedAddress, restore all requiredArtifactIds, and swap every mapped file with real evidence before commit.',
    packetRoot
  }
}

function createReadme(packetRoot: string) {
  return [
    '# PortManager Live Tailscale Packet Scaffold',
    '',
    'This packet scaffold is invalid by design.',
    'Replace every scaffold-marked JSON file with real bounded capture evidence before commit.',
    '',
    `Packet root: ${packetRoot}`,
    `Summary file: ${liveTransportFollowUpSummaryFileName}`,
    `Root pattern: ${liveTransportFollowUpArtifactRootPattern}`,
    '',
    'Required artifact files:',
    ...Object.entries(liveTransportFollowUpArtifactFiles).map(
      ([artifactId, filename]) => `- ${artifactId}: ${filename}`
    ),
    '',
    'Validation command:',
    `- pnpm milestone:validate:live-packet -- --packet-root ${packetRoot}`
  ].join('\n')
}

export function scaffoldLiveTransportFollowUpPacket(options: {
  repoRoot?: string
  packetDate: string
  capturedAt?: string
  force?: boolean
}): ScaffoldLiveTransportFollowUpPacketResult {
  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const packetRoot = packetRootFromDate(options.packetDate)
  const absolutePacketRoot = toAbsolutePacketRoot(repoRoot, packetRoot)
  const capturedAt = options.capturedAt ?? new Date().toISOString()

  if (existsSync(absolutePacketRoot) && readdirSync(absolutePacketRoot).length > 0 && !options.force) {
    throw new Error(`packet root already exists: ${packetRoot}`)
  }

  mkdirSync(absolutePacketRoot, { recursive: true })

  for (const [artifactId, filename] of Object.entries(liveTransportFollowUpArtifactFiles)) {
    writeFileSync(
      path.join(absolutePacketRoot, filename),
      `${JSON.stringify(createScaffoldJson(artifactId, packetRoot), null, 2)}\n`,
      'utf8'
    )
  }

  const summaryPath = path.join(absolutePacketRoot, liveTransportFollowUpSummaryFileName)
  writeFileSync(
    summaryPath,
    `${JSON.stringify(createSummaryScaffold(packetRoot, capturedAt), null, 2)}\n`,
    'utf8'
  )

  const readmePath = path.join(absolutePacketRoot, 'README.md')
  writeFileSync(readmePath, `${createReadme(packetRoot)}\n`, 'utf8')

  return {
    packetRoot,
    summaryPath: path.posix.join(packetRoot, liveTransportFollowUpSummaryFileName),
    readmePath: path.posix.join(packetRoot, 'README.md'),
    validation: validateLiveTransportFollowUpPacket({ repoRoot, packetRoot })
  }
}

export function validateLiveTransportFollowUpPacketCommand(options: {
  repoRoot?: string
  packetRoot?: string
  latest?: boolean
}) {
  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const packetRoot =
    options.packetRoot ?? (options.latest ? resolveLatestLiveTransportFollowUpPacketRoot(repoRoot) : undefined)

  if (!packetRoot) {
    throw new Error('no live packet root found')
  }

  return validateLiveTransportFollowUpPacket({ repoRoot, packetRoot })
}

function printScaffoldResult(result: ScaffoldLiveTransportFollowUpPacketResult) {
  return [
    `Packet root: ${result.packetRoot}`,
    `Summary path: ${result.summaryPath}`,
    `README path: ${result.readmePath}`,
    `Validation status: ${result.validation.ok ? 'ready' : 'invalid-by-design'}`,
    ...result.validation.errors.map((error) => `- ${error}`)
  ].join('\n')
}

function printValidationResult(validation: ReturnType<typeof validateLiveTransportFollowUpPacket>) {
  return [
    `Packet root: ${validation.packetRoot}`,
    `Summary path: ${validation.summaryPath}`,
    `Status: ${validation.ok ? 'valid' : 'invalid'}`,
    validation.candidateTargetProfileId
      ? `Candidate target: ${validation.candidateTargetProfileId}`
      : 'Candidate target: missing',
    validation.capturedAddress ? `Captured address: ${validation.capturedAddress}` : 'Captured address: missing',
    ...(validation.ok ? [] : validation.errors.map((error) => `- ${error}`))
  ].join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.action === 'scaffold') {
    const result = scaffoldLiveTransportFollowUpPacket({
      repoRoot: options.repoRoot,
      packetDate: options.packetDate ?? '',
      capturedAt: options.capturedAt,
      force: options.force
    })

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(printScaffoldResult(result))
    }

    process.exit(result.validation.ok ? 0 : 1)
  }

  const validation = validateLiveTransportFollowUpPacketCommand({
    repoRoot: options.repoRoot,
    packetRoot: options.packetRoot,
    latest: options.latest || !options.packetRoot
  })

  if (options.json) {
    console.log(JSON.stringify(validation, null, 2))
  } else {
    console.log(printValidationResult(validation))
  }

  process.exit(validation.ok ? 0 : 1)
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}

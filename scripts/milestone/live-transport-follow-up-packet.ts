import {
  existsSync,
  mkdirSync,
  readFileSync,
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
  requiredLiveTransportFollowUpArtifactIds,
  validateLiveTransportFollowUpPacket
} from '../../apps/controller/src/index.ts'

const defaultRepoRoot = fileURLToPath(new URL('../..', import.meta.url))
const livePacketRootPrefix = 'docs/operations/artifacts/debian-12-live-tailscale-packet-'
const packetDatePattern = /^\d{4}-\d{2}-\d{2}$/
type LiveTransportFollowUpArtifactId = keyof typeof liveTransportFollowUpArtifactFiles

const artifactSourceOptionNames: Record<LiveTransportFollowUpArtifactId, string> = {
  candidate_host_with_tailscale_ip: '--candidate-host-detail',
  bootstrap_operation_with_tailscale_transport: '--bootstrap-operation',
  steady_state_health_with_tailscale_transport: '--steady-state-health',
  steady_state_runtime_state_with_tailscale_transport: '--steady-state-runtime-state',
  linked_controller_audit_reference: '--controller-audit-index'
}

const artifactSourceOptionToId = Object.fromEntries(
  Object.entries(artifactSourceOptionNames).map(([artifactId, optionName]) => [optionName, artifactId])
) as Record<string, LiveTransportFollowUpArtifactId>

export interface LiveTransportFollowUpPacketCliOptions {
  action: 'scaffold' | 'assemble' | 'validate'
  repoRoot: string
  packetDate?: string
  packetRoot?: string
  capturedAt?: string
  artifactSourcePaths?: Partial<Record<LiveTransportFollowUpArtifactId, string>>
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

export interface AssembleLiveTransportFollowUpPacketResult {
  packetRoot: string
  summaryPath: string
  readmePath: string
  capturedAt: string
  capturedAddress?: string
  validation: ReturnType<typeof validateLiveTransportFollowUpPacket>
}

function usage() {
  return [
    'Usage:',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts scaffold --packet-date YYYY-MM-DD [--captured-at ISO] [--force] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts assemble --packet-date YYYY-MM-DD --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path> [--captured-at ISO] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts validate [--packet-root <repo-relative-root> | --latest] [--json]'
  ].join('\n')
}

export function parseArgs(argv: string[]): LiveTransportFollowUpPacketCliOptions {
  const tokens = [...argv]
  if (tokens[0] === '--') {
    tokens.shift()
  }

  const actionToken = tokens.shift()
  if (actionToken !== 'scaffold' && actionToken !== 'assemble' && actionToken !== 'validate') {
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

    const artifactId = artifactSourceOptionToId[current]
    if (artifactId) {
      options.artifactSourcePaths ??= {}
      options.artifactSourcePaths[artifactId] = path.resolve(tokens[++index] ?? '')
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

  if (options.action === 'assemble' && !options.packetDate) {
    throw new Error(`--packet-date is required for assemble\n${usage()}`)
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
    'Assembly command:',
    `- pnpm milestone:assemble:live-packet -- --packet-date ${packetRoot.slice(livePacketRootPrefix.length)} --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path>`,
    '',
    'Validation command:',
    `- pnpm milestone:validate:live-packet -- --packet-root ${packetRoot}`
  ].join('\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readJsonFile(filePath: string) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`source artifact file does not exist: ${filePath}`)
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as unknown
}

function extractBootstrapCapturedAddress(bootstrapOperation: unknown) {
  if (!isRecord(bootstrapOperation) || typeof bootstrapOperation.resultSummary !== 'string') {
    return undefined
  }

  const match = bootstrapOperation.resultSummary.match(/via https?:\/\/([^:/\s]+)/u)
  return match?.[1]?.trim() || undefined
}

function extractCandidateTargetProfileId(candidateHostDetail: unknown) {
  if (!isRecord(candidateHostDetail)) {
    return undefined
  }

  if (typeof candidateHostDetail.targetProfileId === 'string' && candidateHostDetail.targetProfileId.trim()) {
    return candidateHostDetail.targetProfileId.trim()
  }

  if (
    isRecord(candidateHostDetail.targetProfile) &&
    typeof candidateHostDetail.targetProfile.id === 'string' &&
    candidateHostDetail.targetProfile.id.trim()
  ) {
    return candidateHostDetail.targetProfile.id.trim()
  }

  return undefined
}

function extractCapturedAddress(candidateHostDetail: unknown, bootstrapOperation: unknown) {
  const hostDetailAddress =
    isRecord(candidateHostDetail) &&
    typeof candidateHostDetail.tailscaleAddress === 'string' &&
    candidateHostDetail.tailscaleAddress.trim()
      ? candidateHostDetail.tailscaleAddress.trim()
      : undefined
  const bootstrapAddress = extractBootstrapCapturedAddress(bootstrapOperation)

  if (hostDetailAddress && bootstrapAddress && hostDetailAddress !== bootstrapAddress) {
    throw new Error(
      `captured address mismatch between candidate host detail (${hostDetailAddress}) and bootstrap operation (${bootstrapAddress})`
    )
  }

  return hostDetailAddress ?? bootstrapAddress
}

function extractTimestamp(value: unknown) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : undefined
}

function deriveCapturedAt(options: {
  candidateHostDetail: unknown
  bootstrapOperation: unknown
  runtimeState: unknown
  auditIndex: unknown
}) {
  const timestamps: string[] = []

  if (isRecord(options.candidateHostDetail)) {
    const updatedAt = extractTimestamp(options.candidateHostDetail.updatedAt)
    const heartbeatAt = extractTimestamp(options.candidateHostDetail.agentHeartbeatAt)
    if (updatedAt) {
      timestamps.push(updatedAt)
    }
    if (heartbeatAt) {
      timestamps.push(heartbeatAt)
    }
  }

  if (isRecord(options.bootstrapOperation)) {
    const finishedAt = extractTimestamp(options.bootstrapOperation.finishedAt)
    const startedAt = extractTimestamp(options.bootstrapOperation.startedAt)
    if (finishedAt) {
      timestamps.push(finishedAt)
    }
    if (startedAt) {
      timestamps.push(startedAt)
    }
  }

  if (isRecord(options.runtimeState)) {
    const updatedAt = extractTimestamp(options.runtimeState.updatedAt)
    if (updatedAt) {
      timestamps.push(updatedAt)
    }
  }

  if (isRecord(options.auditIndex) && Array.isArray(options.auditIndex.items)) {
    for (const item of options.auditIndex.items) {
      if (!isRecord(item)) {
        continue
      }

      const lastEventAt = extractTimestamp(item.lastEventAt)
      if (lastEventAt) {
        timestamps.push(lastEventAt)
      }

      if (isRecord(item.operation)) {
        const finishedAt = extractTimestamp(item.operation.finishedAt)
        if (finishedAt) {
          timestamps.push(finishedAt)
        }
      }
    }
  }

  const latestTimestamp = timestamps
    .map((timestamp) => ({ timestamp, ms: Date.parse(timestamp) }))
    .sort((left, right) => right.ms - left.ms)[0]

  return latestTimestamp?.timestamp
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

export function assembleLiveTransportFollowUpPacket(options: {
  repoRoot?: string
  packetDate: string
  capturedAt?: string
  artifactSourcePaths?: Partial<Record<LiveTransportFollowUpArtifactId, string>>
}): AssembleLiveTransportFollowUpPacketResult {
  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const packetRoot = packetRootFromDate(options.packetDate)
  const absolutePacketRoot = toAbsolutePacketRoot(repoRoot, packetRoot)
  const artifactSourcePaths = options.artifactSourcePaths ?? {}

  mkdirSync(absolutePacketRoot, { recursive: true })

  const sourceArtifacts = Object.fromEntries(
    requiredLiveTransportFollowUpArtifactIds.map((artifactId) => {
      const sourcePath = artifactSourcePaths[artifactId]
      if (!sourcePath) {
        throw new Error(`missing source artifact path for ${artifactId}`)
      }

      return [artifactId, readJsonFile(sourcePath)]
    })
  ) as Record<LiveTransportFollowUpArtifactId, unknown>

  const candidateHostDetail = sourceArtifacts.candidate_host_with_tailscale_ip
  const bootstrapOperation = sourceArtifacts.bootstrap_operation_with_tailscale_transport
  const runtimeState = sourceArtifacts.steady_state_runtime_state_with_tailscale_transport
  const auditIndex = sourceArtifacts.linked_controller_audit_reference

  const capturedAddress = extractCapturedAddress(candidateHostDetail, bootstrapOperation)
  const capturedAt =
    options.capturedAt ??
    deriveCapturedAt({
      candidateHostDetail,
      bootstrapOperation,
      runtimeState,
      auditIndex
    }) ??
    new Date().toISOString()

  for (const artifactId of requiredLiveTransportFollowUpArtifactIds) {
    const filename = liveTransportFollowUpArtifactFiles[artifactId]
    writeFileSync(
      path.join(absolutePacketRoot, filename),
      `${JSON.stringify(sourceArtifacts[artifactId], null, 2)}\n`,
      'utf8'
    )
  }

  const summaryPath = path.join(absolutePacketRoot, liveTransportFollowUpSummaryFileName)
  writeFileSync(
    summaryPath,
    `${JSON.stringify(
      {
        candidateTargetProfileId: extractCandidateTargetProfileId(candidateHostDetail),
        capturedAt,
        capturedAddress,
        requiredArtifactIds: requiredLiveTransportFollowUpArtifactIds,
        artifactFiles: liveTransportFollowUpArtifactFiles
      },
      null,
      2
    )}\n`,
    'utf8'
  )

  const readmePath = path.join(absolutePacketRoot, 'README.md')
  writeFileSync(readmePath, `${createReadme(packetRoot)}\n`, 'utf8')

  return {
    packetRoot,
    summaryPath: path.posix.join(packetRoot, liveTransportFollowUpSummaryFileName),
    readmePath: path.posix.join(packetRoot, 'README.md'),
    capturedAt,
    capturedAddress,
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

function printAssembleResult(result: AssembleLiveTransportFollowUpPacketResult) {
  return [
    `Packet root: ${result.packetRoot}`,
    `Summary path: ${result.summaryPath}`,
    `README path: ${result.readmePath}`,
    `Captured at: ${result.capturedAt}`,
    result.capturedAddress ? `Captured address: ${result.capturedAddress}` : 'Captured address: missing',
    `Validation status: ${result.validation.ok ? 'valid' : 'invalid'}`,
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

  if (options.action === 'assemble') {
    const result = assembleLiveTransportFollowUpPacket({
      repoRoot: options.repoRoot,
      packetDate: options.packetDate ?? '',
      capturedAt: options.capturedAt,
      artifactSourcePaths: options.artifactSourcePaths
    })

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(printAssembleResult(result))
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

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
  action: 'scaffold' | 'assemble' | 'capture' | 'validate'
  repoRoot: string
  packetDate?: string
  packetRoot?: string
  capturedAt?: string
  artifactSourcePaths?: Partial<Record<LiveTransportFollowUpArtifactId, string>>
  controllerBaseUrl?: string
  hostId?: string
  bootstrapOperationId?: string
  agentBaseUrl?: string
  auditLimit: number
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

export interface CaptureLiveTransportFollowUpPacketResult
  extends AssembleLiveTransportFollowUpPacketResult {
  controllerBaseUrl: string
  hostId: string
  bootstrapOperationId: string
  agentBaseUrl: string
  auditLimit: number
}

function usage() {
  return [
    'Usage:',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts scaffold --packet-date YYYY-MM-DD [--captured-at ISO] [--force] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts assemble --packet-date YYYY-MM-DD --candidate-host-detail <path> --bootstrap-operation <path> --steady-state-health <path> --steady-state-runtime-state <path> --controller-audit-index <path> [--captured-at ISO] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts capture --packet-date YYYY-MM-DD --controller-base-url <url> --host-id <host-id> --bootstrap-operation-id <operation-id> [--agent-base-url <url>] [--audit-limit <count>] [--captured-at ISO] [--force] [--json]',
    '  node --experimental-strip-types scripts/milestone/live-transport-follow-up-packet.ts validate [--packet-root <repo-relative-root> | --latest] [--json]'
  ].join('\n')
}

export function parseArgs(argv: string[]): LiveTransportFollowUpPacketCliOptions {
  const tokens = [...argv]
  if (tokens[0] === '--') {
    tokens.shift()
  }

  const actionToken = tokens.shift()
  if (
    actionToken !== 'scaffold' &&
    actionToken !== 'assemble' &&
    actionToken !== 'capture' &&
    actionToken !== 'validate'
  ) {
    throw new Error(usage())
  }

  const options: LiveTransportFollowUpPacketCliOptions = {
    action: actionToken,
    repoRoot: defaultRepoRoot,
    auditLimit: 20,
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

    if (current === '--controller-base-url') {
      options.controllerBaseUrl = tokens[++index]
      continue
    }

    if (current === '--host-id') {
      options.hostId = tokens[++index]
      continue
    }

    if (current === '--bootstrap-operation-id') {
      options.bootstrapOperationId = tokens[++index]
      continue
    }

    if (current === '--agent-base-url') {
      options.agentBaseUrl = tokens[++index]
      continue
    }

    if (current === '--audit-limit') {
      options.auditLimit = Number.parseInt(tokens[++index] ?? '', 10)
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

  if (['scaffold', 'assemble', 'capture'].includes(options.action) && !options.packetDate) {
    throw new Error(`--packet-date is required for ${options.action}\n${usage()}`)
  }

  if (options.action === 'validate' && options.packetRoot && options.latest) {
    throw new Error(`choose --packet-root or --latest, not both\n${usage()}`)
  }

  if (options.action === 'capture') {
    if (!options.controllerBaseUrl) {
      throw new Error(`--controller-base-url is required for capture\n${usage()}`)
    }

    if (!options.hostId) {
      throw new Error(`--host-id is required for capture\n${usage()}`)
    }

    if (!options.bootstrapOperationId) {
      throw new Error(`--bootstrap-operation-id is required for capture\n${usage()}`)
    }

    if (!Number.isInteger(options.auditLimit) || options.auditLimit < 1) {
      throw new Error(`--audit-limit must be a positive integer\n${usage()}`)
    }
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
    'Capture command:',
    `- pnpm milestone:capture:live-packet -- --packet-date ${packetRoot.slice(livePacketRootPrefix.length)} --controller-base-url <url> --host-id <host-id> --bootstrap-operation-id <operation-id>`,
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

function parseJsonIfExists(filePath: string) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return undefined
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as unknown
  } catch {
    return undefined
  }
}

function isScaffoldMarkedJson(value: unknown) {
  return isRecord(value) && value[liveTransportFollowUpScaffoldMarkerField] === true
}

function packetRootContainsOnlyScaffoldContent(absolutePacketRoot: string) {
  const summary = parseJsonIfExists(path.join(absolutePacketRoot, liveTransportFollowUpSummaryFileName))
  if (!isScaffoldMarkedJson(summary)) {
    return false
  }

  return Object.values(liveTransportFollowUpArtifactFiles).every((filename) =>
    isScaffoldMarkedJson(parseJsonIfExists(path.join(absolutePacketRoot, filename)))
  )
}

function ensurePacketRootWritable(options: {
  absolutePacketRoot: string
  packetRoot: string
  force?: boolean
  allowExistingScaffold?: boolean
}) {
  const { absolutePacketRoot, packetRoot, force, allowExistingScaffold } = options
  if (!existsSync(absolutePacketRoot)) {
    return
  }

  if (!statSync(absolutePacketRoot).isDirectory()) {
    throw new Error(`packet root is not a directory: ${packetRoot}`)
  }

  if (readdirSync(absolutePacketRoot).length === 0) {
    return
  }

  if (force) {
    return
  }

  if (allowExistingScaffold && packetRootContainsOnlyScaffoldContent(absolutePacketRoot)) {
    return
  }

  throw new Error(`packet root already exists with non-scaffold content: ${packetRoot}`)
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

function normalizeBaseUrl(baseUrl: string, label: string) {
  try {
    const normalized = new URL(baseUrl)
    return normalized.toString().replace(/\/$/u, '')
  } catch {
    throw new Error(`${label} must be a valid absolute URL: ${baseUrl}`)
  }
}

function buildRequestUrl(
  baseUrl: string,
  pathname: string,
  searchParams?: Record<string, string | number | undefined>
) {
  const url = new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) {
        continue
      }

      url.searchParams.set(key, String(value))
    }
  }

  return url
}

async function requestJson(options: {
  baseUrl: string
  pathname: string
  label: string
  searchParams?: Record<string, string | number | undefined>
}) {
  const url = buildRequestUrl(options.baseUrl, options.pathname, options.searchParams)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${options.label} request failed (${response.status} ${response.statusText}): ${url}`)
  }

  return (await response.json()) as unknown
}

function extractBootstrapAgentBaseUrl(bootstrapOperation: unknown) {
  if (!isRecord(bootstrapOperation) || typeof bootstrapOperation.resultSummary !== 'string') {
    return undefined
  }

  const match = bootstrapOperation.resultSummary.match(/via (https?:\/\/[^\s;]+)/u)
  if (!match?.[1]) {
    return undefined
  }

  return match[1].replace(/[),.]+$/u, '')
}

function extractAuditOperationIds(auditIndex: unknown) {
  if (!isRecord(auditIndex) || !Array.isArray(auditIndex.items)) {
    return []
  }

  return auditIndex.items
    .map((item) =>
      isRecord(item) && isRecord(item.operation) && typeof item.operation.id === 'string'
        ? item.operation.id
        : undefined
    )
    .filter((id): id is string => Boolean(id))
}

function ensureAuditIndexLinksBootstrap(auditIndex: unknown, bootstrapOperationId: string, auditLimit: number) {
  const operationIds = extractAuditOperationIds(auditIndex)
  if (operationIds.includes(bootstrapOperationId)) {
    return
  }

  throw new Error(
    `controller audit index does not include bootstrap operation ${bootstrapOperationId}; increase --audit-limit above ${auditLimit} or capture closer to the bounded run`
  )
}

function writePacketFromSourceArtifacts(options: {
  repoRoot: string
  packetDate: string
  capturedAt?: string
  force?: boolean
  sourceArtifacts: Record<LiveTransportFollowUpArtifactId, unknown>
}) {
  const packetRoot = packetRootFromDate(options.packetDate)
  const absolutePacketRoot = toAbsolutePacketRoot(options.repoRoot, packetRoot)

  ensurePacketRootWritable({
    absolutePacketRoot,
    packetRoot,
    force: options.force,
    allowExistingScaffold: true
  })
  mkdirSync(absolutePacketRoot, { recursive: true })

  const candidateHostDetail = options.sourceArtifacts.candidate_host_with_tailscale_ip
  const bootstrapOperation = options.sourceArtifacts.bootstrap_operation_with_tailscale_transport
  const runtimeState = options.sourceArtifacts.steady_state_runtime_state_with_tailscale_transport
  const auditIndex = options.sourceArtifacts.linked_controller_audit_reference

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
      `${JSON.stringify(options.sourceArtifacts[artifactId], null, 2)}\n`,
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
    validation: validateLiveTransportFollowUpPacket({ repoRoot: options.repoRoot, packetRoot })
  }
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

  ensurePacketRootWritable({ absolutePacketRoot, packetRoot, force: options.force })

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
  force?: boolean
}): AssembleLiveTransportFollowUpPacketResult {
  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const artifactSourcePaths = options.artifactSourcePaths ?? {}

  const sourceArtifacts = Object.fromEntries(
    requiredLiveTransportFollowUpArtifactIds.map((artifactId) => {
      const sourcePath = artifactSourcePaths[artifactId]
      if (!sourcePath) {
        throw new Error(`missing source artifact path for ${artifactId}`)
      }

      return [artifactId, readJsonFile(sourcePath)]
    })
  ) as Record<LiveTransportFollowUpArtifactId, unknown>

  return writePacketFromSourceArtifacts({
    repoRoot,
    packetDate: options.packetDate,
    capturedAt: options.capturedAt,
    force: options.force,
    sourceArtifacts
  })
}

export async function captureLiveTransportFollowUpPacket(options: {
  repoRoot?: string
  packetDate: string
  controllerBaseUrl: string
  hostId: string
  bootstrapOperationId: string
  agentBaseUrl?: string
  auditLimit?: number
  capturedAt?: string
  force?: boolean
}): Promise<CaptureLiveTransportFollowUpPacketResult> {
  const repoRoot = options.repoRoot ?? defaultRepoRoot
  const controllerBaseUrl = normalizeBaseUrl(options.controllerBaseUrl, 'controller base URL')

  const candidateHostDetail = await requestJson({
    baseUrl: controllerBaseUrl,
    pathname: `hosts/${encodeURIComponent(options.hostId)}`,
    label: 'candidate host detail'
  })
  const bootstrapOperation = await requestJson({
    baseUrl: controllerBaseUrl,
    pathname: `operations/${encodeURIComponent(options.bootstrapOperationId)}`,
    label: 'bootstrap operation'
  })

  const agentBaseUrl = normalizeBaseUrl(
    options.agentBaseUrl ?? extractBootstrapAgentBaseUrl(bootstrapOperation) ?? '',
    'agent base URL'
  )
  const steadyStateHealth = await requestJson({
    baseUrl: agentBaseUrl,
    pathname: 'health',
    label: 'steady-state health'
  })
  const steadyStateRuntimeState = await requestJson({
    baseUrl: agentBaseUrl,
    pathname: 'runtime-state',
    label: 'steady-state runtime-state'
  })

  const auditLimit = options.auditLimit ?? 20
  const linkedControllerAuditReference = await requestJson({
    baseUrl: controllerBaseUrl,
    pathname: 'event-audit-index',
    label: 'controller audit index',
    searchParams: {
      hostId: options.hostId,
      limit: auditLimit
    }
  })
  ensureAuditIndexLinksBootstrap(
    linkedControllerAuditReference,
    options.bootstrapOperationId,
    auditLimit
  )

  const assembled = writePacketFromSourceArtifacts({
    repoRoot,
    packetDate: options.packetDate,
    capturedAt: options.capturedAt,
    force: options.force,
    sourceArtifacts: {
      candidate_host_with_tailscale_ip: candidateHostDetail,
      bootstrap_operation_with_tailscale_transport: bootstrapOperation,
      steady_state_health_with_tailscale_transport: steadyStateHealth,
      steady_state_runtime_state_with_tailscale_transport: steadyStateRuntimeState,
      linked_controller_audit_reference: linkedControllerAuditReference
    }
  })

  return {
    ...assembled,
    controllerBaseUrl,
    hostId: options.hostId,
    bootstrapOperationId: options.bootstrapOperationId,
    agentBaseUrl,
    auditLimit
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

function printCaptureResult(result: CaptureLiveTransportFollowUpPacketResult) {
  return [
    printAssembleResult(result),
    `Controller base URL: ${result.controllerBaseUrl}`,
    `Host ID: ${result.hostId}`,
    `Bootstrap operation ID: ${result.bootstrapOperationId}`,
    `Agent base URL: ${result.agentBaseUrl}`,
    `Audit limit: ${result.auditLimit}`
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
      artifactSourcePaths: options.artifactSourcePaths,
      force: options.force
    })

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(printAssembleResult(result))
    }

    process.exit(result.validation.ok ? 0 : 1)
  }

  if (options.action === 'capture') {
    const result = await captureLiveTransportFollowUpPacket({
      repoRoot: options.repoRoot,
      packetDate: options.packetDate ?? '',
      controllerBaseUrl: options.controllerBaseUrl ?? '',
      hostId: options.hostId ?? '',
      bootstrapOperationId: options.bootstrapOperationId ?? '',
      agentBaseUrl: options.agentBaseUrl,
      auditLimit: options.auditLimit,
      capturedAt: options.capturedAt,
      force: options.force
    })

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(printCaptureResult(result))
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

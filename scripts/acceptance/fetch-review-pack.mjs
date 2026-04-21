import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { READINESS_QUALIFIED_EVENTS } from './confidence.mjs'
import { inferRepositoryFromGitRemote } from './sync-confidence-history.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

const DEFAULT_WORKFLOW_REF = 'mainline-acceptance.yml'
const DEFAULT_BRANCH = 'main'
const DEFAULT_LIMIT = 20
const DEFAULT_ARTIFACT_PATTERN = 'milestone-confidence-bundle-*'
const DEFAULT_OUTPUT_DIR = path.join(
  repoRoot,
  '.portmanager',
  'reports',
  'current-ci-review-pack'
)
const MANIFEST_FILE_NAME = 'review-pack-manifest.json'
const REQUIRED_FILE_NAMES = [
  'milestone-confidence-review.md',
  'milestone-wording-review.md'
]
const OPTIONAL_FILE_NAMES = [
  'milestone-confidence-report.json',
  'milestone-confidence-history.json',
  'milestone-confidence-summary.md'
]

export function parseArgs(argv) {
  const options = {
    repo: null,
    workflowRef: DEFAULT_WORKFLOW_REF,
    branch: DEFAULT_BRANCH,
    limit: DEFAULT_LIMIT,
    artifactPattern: DEFAULT_ARTIFACT_PATTERN,
    outputDir: DEFAULT_OUTPUT_DIR,
    runId: null,
    events: [...READINESS_QUALIFIED_EVENTS]
  }
  let customEvents = false

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--') {
      continue
    }

    if (current === '--repo') {
      options.repo = argv[index + 1] ?? null
      index += 1
      continue
    }

    if (current === '--workflow' || current === '--workflow-ref') {
      options.workflowRef = argv[index + 1] ?? DEFAULT_WORKFLOW_REF
      index += 1
      continue
    }

    if (current === '--branch') {
      options.branch = argv[index + 1] ?? DEFAULT_BRANCH
      index += 1
      continue
    }

    if (current === '--limit') {
      options.limit = Number.parseInt(argv[index + 1] ?? String(DEFAULT_LIMIT), 10)
      index += 1
      continue
    }

    if (current === '--pattern') {
      options.artifactPattern = argv[index + 1] ?? DEFAULT_ARTIFACT_PATTERN
      index += 1
      continue
    }

    if (current === '--run-id') {
      options.runId = Number.parseInt(argv[index + 1] ?? '', 10)
      index += 1
      continue
    }

    if (current === '--output-dir') {
      options.outputDir = path.resolve(repoRoot, argv[index + 1] ?? DEFAULT_OUTPUT_DIR)
      index += 1
      continue
    }

    if (current === '--event') {
      const nextEvent = argv[index + 1]
      if (!nextEvent) {
        throw new Error('--event requires a value')
      }

      if (!customEvents) {
        options.events = []
        customEvents = true
      }

      options.events.push(nextEvent)
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  if (options.runId !== null && Number.isNaN(options.runId)) {
    throw new Error('--run-id must be an integer')
  }

  return options
}

function runCommand({
  spawnSyncImpl = spawnSync,
  command,
  args,
  cwd = repoRoot,
  allowFailure = false
}) {
  const result = spawnSyncImpl(command, args, {
    cwd,
    encoding: 'utf8'
  })

  if (result.error) {
    throw result.error
  }

  if ((result.status ?? 1) !== 0 && !allowFailure) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, result.stderr?.trim()].filter(Boolean).join('\n')
    )
  }

  return result
}

function walkFiles(rootDirectory, fileName, collectedPaths = []) {
  if (!existsSync(rootDirectory) || !statSync(rootDirectory).isDirectory()) {
    return collectedPaths
  }

  for (const entry of readdirSync(rootDirectory, { withFileTypes: true })) {
    const absolutePath = path.join(rootDirectory, entry.name)

    if (entry.isDirectory()) {
      walkFiles(absolutePath, fileName, collectedPaths)
      continue
    }

    if (entry.isFile() && entry.name === fileName) {
      collectedPaths.push(absolutePath)
    }
  }

  return collectedPaths
}

function listWorkflowRuns({
  repo,
  workflowRef,
  branch,
  limit,
  events,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
}) {
  const query = `repos/${repo}/actions/workflows/${workflowRef}/runs?branch=${encodeURIComponent(branch)}&status=completed&per_page=${limit}`
  const result = runCommand({
    spawnSyncImpl,
    command: 'gh',
    args: ['api', query],
    cwd
  })
  const payload = JSON.parse(result.stdout)

  return Array.isArray(payload.workflow_runs)
    ? payload.workflow_runs.filter(
        (run) => run.status === 'completed' && events.includes(run.event)
      )
    : []
}

function getWorkflowRun({
  repo,
  runId,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
}) {
  const result = runCommand({
    spawnSyncImpl,
    command: 'gh',
    args: ['api', `repos/${repo}/actions/runs/${runId}`],
    cwd
  })

  return JSON.parse(result.stdout)
}

function downloadArtifact({
  repo,
  run,
  artifactPattern,
  downloadRoot,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
}) {
  const runDirectory = path.join(downloadRoot, String(run.id))
  mkdirSync(runDirectory, { recursive: true })

  const result = runCommand({
    spawnSyncImpl,
    command: 'gh',
    args: ['run', 'download', String(run.id), '-R', repo, '-p', artifactPattern, '-D', runDirectory],
    cwd,
    allowFailure: true
  })

  if ((result.status ?? 1) !== 0) {
    throw new Error(
      [
        `Unable to download artifact ${artifactPattern} for run ${run.id}.`,
        result.stderr?.trim(),
        result.stdout?.trim()
      ]
        .filter(Boolean)
        .join('\n')
    )
  }

  return runDirectory
}

function selectRun({
  runId,
  repo,
  workflowRef,
  branch,
  limit,
  events,
  listWorkflowRunsImpl,
  getWorkflowRunImpl,
  spawnSyncImpl,
  cwd
}) {
  if (runId !== null) {
    const run = getWorkflowRunImpl({
      repo,
      runId,
      spawnSyncImpl,
      cwd
    })

    if (!run || run.status !== 'completed') {
      throw new Error(`Workflow run ${runId} is not completed and cannot be fetched yet.`)
    }

    return run
  }

  const runs = listWorkflowRunsImpl({
    repo,
    workflowRef,
    branch,
    limit,
    events,
    spawnSyncImpl,
    cwd
  })

  if (!runs.length) {
    throw new Error(
      `No completed ${workflowRef} runs matched ${events.join(', ')} on ${branch}.`
    )
  }

  return runs[0]
}

function copyArtifactFile({
  artifactRoot,
  outputDir,
  fileName,
  required,
  runId
}) {
  const matches = walkFiles(artifactRoot, fileName).sort((left, right) => left.localeCompare(right))

  if (!matches.length) {
    if (!required) {
      return null
    }

    throw new Error(
      `Selected run ${runId} predates the current-run review-pack slice or the artifact is incomplete. Missing required file: ${fileName}`
    )
  }

  const sourcePath = matches[0]
  const localPath = path.join(outputDir, fileName)
  copyFileSync(sourcePath, localPath)

  return {
    sourcePath,
    localPath
  }
}

function buildManifest({
  repo,
  workflowRef,
  branch,
  artifactPattern,
  outputDir,
  run,
  files
}) {
  return {
    manifestVersion: '0.1.0',
    fetchedAt: new Date().toISOString(),
    repo,
    workflowRef,
    branch,
    artifactPattern,
    outputDir,
    sourceRun: {
      id: run.id,
      attempt: run.run_attempt ?? run.runAttempt ?? null,
      event: run.event ?? null,
      conclusion: run.conclusion ?? null,
      status: run.status ?? null,
      htmlUrl: run.html_url ?? null,
      workflowUrl: run.workflow_url ?? null,
      headSha: run.head_sha ?? null,
      createdAt: run.created_at ?? null,
      updatedAt: run.updated_at ?? null
    },
    files
  }
}

export function fetchReviewPack({
  repo = null,
  workflowRef = DEFAULT_WORKFLOW_REF,
  branch = DEFAULT_BRANCH,
  limit = DEFAULT_LIMIT,
  artifactPattern = DEFAULT_ARTIFACT_PATTERN,
  outputDir = DEFAULT_OUTPUT_DIR,
  runId = null,
  events = READINESS_QUALIFIED_EVENTS,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot,
  inferRepositoryImpl = inferRepositoryFromGitRemote,
  listWorkflowRunsImpl = listWorkflowRuns,
  getWorkflowRunImpl = getWorkflowRun,
  downloadArtifactImpl = downloadArtifact
} = {}) {
  const resolvedRepository =
    repo ?? inferRepositoryImpl({ spawnSyncImpl, cwd })
  const resolvedOutputDir = path.resolve(outputDir)
  const run = selectRun({
    runId,
    repo: resolvedRepository,
    workflowRef,
    branch,
    limit,
    events,
    listWorkflowRunsImpl,
    getWorkflowRunImpl,
    spawnSyncImpl,
    cwd
  })
  const downloadRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-review-pack-fetch-'))

  try {
    const artifactRoot = downloadArtifactImpl({
      repo: resolvedRepository,
      run,
      artifactPattern,
      downloadRoot,
      spawnSyncImpl,
      cwd
    })

    rmSync(resolvedOutputDir, { recursive: true, force: true })
    mkdirSync(resolvedOutputDir, { recursive: true })

    const files = {
      required: Object.fromEntries(
        REQUIRED_FILE_NAMES.map((fileName) => [
          fileName,
          copyArtifactFile({
            artifactRoot,
            outputDir: resolvedOutputDir,
            fileName,
            required: true,
            runId: run.id
          })
        ])
      ),
      optional: Object.fromEntries(
        OPTIONAL_FILE_NAMES.map((fileName) => {
          const copied = copyArtifactFile({
            artifactRoot,
            outputDir: resolvedOutputDir,
            fileName,
            required: false,
            runId: run.id
          })

          return [fileName, copied]
        }).filter(([, copied]) => copied !== null)
      )
    }

    const manifest = buildManifest({
      repo: resolvedRepository,
      workflowRef,
      branch,
      artifactPattern,
      outputDir: resolvedOutputDir,
      run,
      files
    })
    const manifestPath = path.join(resolvedOutputDir, MANIFEST_FILE_NAME)
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

    return {
      repo: resolvedRepository,
      workflowRef,
      branch,
      artifactPattern,
      outputDir: resolvedOutputDir,
      manifestPath,
      run,
      files
    }
  } finally {
    rmSync(downloadRoot, { recursive: true, force: true })
  }
}

function renderFetchSummary(result) {
  return [
    `Fetched milestone review pack from ${result.repo}`,
    `Run: ${result.run.id}/${result.run.run_attempt ?? result.run.runAttempt ?? '1'}`,
    `Event: ${result.run.event ?? 'unknown'}`,
    `Output: ${result.outputDir}`,
    `Review digest: ${result.files.required['milestone-confidence-review.md'].localPath}`,
    `Wording review: ${result.files.required['milestone-wording-review.md'].localPath}`,
    `Manifest: ${result.manifestPath}`
  ].join('\n')
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const result = fetchReviewPack(options)
    process.stdout.write(`${renderFetchSummary(result)}\n`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main()
}

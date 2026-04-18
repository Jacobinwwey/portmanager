import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  READINESS_QUALIFIED_EVENTS,
  buildHistoryEntry,
  buildHistorySnapshotFromEntries,
  readHistoryEntries,
  resolveHistoryLimit,
  writeHistorySnapshot
} from './confidence.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const reportsDirectory = path.resolve(repoRoot, '.portmanager', 'reports')
const defaultHistoryPath = path.join(reportsDirectory, 'milestone-confidence-history.json')
const defaultSummaryPath = path.join(reportsDirectory, 'milestone-confidence-summary.md')
const DEFAULT_WORKFLOW_REF = 'mainline-acceptance.yml'
const DEFAULT_BRANCH = 'main'
const DEFAULT_LIMIT = 30
const DEFAULT_ARTIFACT_PATTERN = 'milestone-confidence-bundle-*'
const DEFAULT_LABEL = 'Milestone confidence verification'

export function parseArgs(argv) {
  const options = {
    repo: null,
    workflowRef: DEFAULT_WORKFLOW_REF,
    branch: DEFAULT_BRANCH,
    limit: DEFAULT_LIMIT,
    artifactPattern: DEFAULT_ARTIFACT_PATTERN,
    historyPath: defaultHistoryPath,
    summaryPath: defaultSummaryPath,
    replace: false,
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

    if (current === '--history-path') {
      options.historyPath = path.resolve(repoRoot, argv[index + 1] ?? defaultHistoryPath)
      index += 1
      continue
    }

    if (current === '--summary-path') {
      options.summaryPath = path.resolve(repoRoot, argv[index + 1] ?? defaultSummaryPath)
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

    if (current === '--replace') {
      options.replace = true
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return options
}

export function parseRepositorySpec(remoteUrl) {
  const normalizedUrl = String(remoteUrl ?? '').trim()

  if (!normalizedUrl) {
    return null
  }

  const httpsMatch = normalizedUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/u)

  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`
  }

  const sshMatch = normalizedUrl.match(/^git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/u)

  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`
  }

  return null
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

export function inferRepositoryFromGitRemote({
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
} = {}) {
  const result = runCommand({
    spawnSyncImpl,
    command: 'git',
    args: ['config', '--get', 'remote.origin.url'],
    cwd
  })
  const repository = parseRepositorySpec(result.stdout)

  if (!repository) {
    throw new Error('Unable to infer GitHub repository from remote.origin.url')
  }

  return repository
}

function walkFiles(rootDirectory, fileName, collectedPaths = []) {
  if (!statSync(rootDirectory).isDirectory()) {
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
    ? payload.workflow_runs.filter((run) => events.includes(run.event))
    : []
}

function downloadRunReports({
  repo,
  run,
  artifactPattern,
  downloadRoot,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot
}) {
  const runDirectory = path.join(downloadRoot, String(run.id))
  mkdirSync(runDirectory, { recursive: true })

  const downloadResult = runCommand({
    spawnSyncImpl,
    command: 'gh',
    args: ['run', 'download', String(run.id), '-R', repo, '-p', artifactPattern, '-D', runDirectory],
    cwd,
    allowFailure: true
  })

  if ((downloadResult.status ?? 1) !== 0) {
    return []
  }

  return walkFiles(runDirectory, 'milestone-confidence-report.json').map((reportPath) =>
    JSON.parse(readFileSync(reportPath, 'utf8'))
  )
}

export function syncConfidenceHistory({
  repo = null,
  workflowRef = DEFAULT_WORKFLOW_REF,
  branch = DEFAULT_BRANCH,
  limit = DEFAULT_LIMIT,
  artifactPattern = DEFAULT_ARTIFACT_PATTERN,
  historyPath = defaultHistoryPath,
  summaryPath = defaultSummaryPath,
  replace = false,
  events = READINESS_QUALIFIED_EVENTS,
  historyLimit = process.env.PORTMANAGER_CONFIDENCE_HISTORY_LIMIT,
  spawnSyncImpl = spawnSync,
  cwd = repoRoot,
  listWorkflowRunsImpl = listWorkflowRuns,
  downloadRunReportsImpl = downloadRunReports
}) {
  const resolvedRepository =
    repo ?? inferRepositoryFromGitRemote({ spawnSyncImpl, cwd })
  const resolvedHistoryLimit = resolveHistoryLimit(historyLimit)
  const runs = listWorkflowRunsImpl({
    repo: resolvedRepository,
    workflowRef,
    branch,
    limit,
    events,
    spawnSyncImpl,
    cwd
  })

  const existingEntries = replace ? [] : readHistoryEntries(historyPath)
  const importedEntries = []
  const importedRuns = []
  const skippedRuns = []
  const downloadRoot = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-sync-'))

  try {
    for (const run of runs) {
      const reports = downloadRunReportsImpl({
        repo: resolvedRepository,
        run,
        artifactPattern,
        downloadRoot,
        spawnSyncImpl,
        cwd
      })

      if (reports.length === 0) {
        skippedRuns.push({
          id: run.id,
          event: run.event,
          conclusion: run.conclusion,
          reason: 'artifact-missing'
        })
        continue
      }

      importedRuns.push({
        id: run.id,
        event: run.event,
        conclusion: run.conclusion,
        runAttempt: run.run_attempt ?? null
      })

      for (const report of reports) {
        importedEntries.push(buildHistoryEntry(report))
      }
    }
  } finally {
    rmSync(downloadRoot, { recursive: true, force: true })
  }

  const snapshot = buildHistorySnapshotFromEntries({
    label: DEFAULT_LABEL,
    entries: [...existingEntries, ...importedEntries],
    historyLimit: resolvedHistoryLimit
  })

  writeHistorySnapshot({
    historyPath,
    summaryPath,
    snapshot
  })

  return {
    repo: resolvedRepository,
    workflowRef,
    branch,
    historyPath,
    summaryPath,
    importedRunCount: importedRuns.length,
    importedEntryCount: importedEntries.length,
    skippedRuns,
    snapshot
  }
}

function renderSyncSummary(result) {
  return [
    `Synced milestone confidence history from ${result.repo}`,
    `Imported runs: ${result.importedRunCount}`,
    `Imported entries: ${result.importedEntryCount}`,
    `Skipped runs: ${result.skippedRuns.length}`,
    `Readiness status: ${result.snapshot.readiness.status}`,
    `Qualified runs: ${result.snapshot.readiness.qualifiedRuns}/${result.snapshot.readiness.minimumQualifiedRuns}`,
    `Qualified consecutive passes: ${result.snapshot.readiness.qualifiedConsecutivePasses}/${result.snapshot.readiness.minimumConsecutivePasses}`,
    `Summary path: ${result.summaryPath}`
  ].join('\n')
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = syncConfidenceHistory(options)
  process.stdout.write(`${renderSyncSummary(result)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main()
}

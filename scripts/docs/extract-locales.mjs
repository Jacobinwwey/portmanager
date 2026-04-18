import { promises as fs } from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentMap, publishableRoots } from '../../docs-site/content-map.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const docsSiteRoot = path.join(repoRoot, 'docs-site')
const confidenceHistoryPath = path.join(repoRoot, '.portmanager', 'reports', 'milestone-confidence-history.json')
const generatedConfidenceProgressPath = path.join(docsSiteRoot, 'data', 'milestone-confidence-progress.ts')
const confidenceRefreshFlag = '--refresh-confidence-progress'
const confidenceRefreshCommand = 'pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence'

const localeConfig = {
  en: {
    marker: '## English',
    nextMarker: '## 中文',
    label: 'English',
    metaLabel: 'Source of truth'
  },
  zh: {
    marker: '## 中文',
    nextMarker: null,
    label: '中文',
    metaLabel: '真源文档'
  }
}

function normalize(filePath) {
  return filePath.split(path.sep).join('/')
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function platformLineEndings(source) {
  return source.replace(/\r\n/gu, '\n').replace(/\n/gu, EOL)
}

async function listMarkdownFiles(root) {
  const absoluteRoot = path.join(repoRoot, root)
  const stats = await fs.stat(absoluteRoot)

  if (stats.isFile()) {
    return [normalize(root)]
  }

  const results = []
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(absolute)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(normalize(path.relative(repoRoot, absolute)))
      }
    }
  }

  await walk(absoluteRoot)
  return results
}

function parsePreamble(documentText) {
  const updatedMatch = documentText.match(/^Updated:\s*(.+)$/m)
  const versionMatch = documentText.match(/^Version:\s*(.+)$/m)
  return {
    updated: updatedMatch?.[1]?.trim() ?? 'unknown',
    version: versionMatch?.[1]?.trim() ?? 'unknown'
  }
}

function extractSection(documentText, locale) {
  const { marker, nextMarker } = localeConfig[locale]
  const markerIndex = documentText.indexOf(marker)
  if (markerIndex === -1) {
    throw new Error(`Missing ${marker} section`)
  }

  const sectionStart = markerIndex + marker.length
  const sectionEnd = nextMarker ? documentText.indexOf(nextMarker, sectionStart) : documentText.length
  if (sectionEnd === -1) {
    throw new Error(`Missing closing marker ${nextMarker}`)
  }

  return documentText.slice(sectionStart, sectionEnd).trim()
}

function frontmatterFor(entry, locale) {
  const title = entry.titles[locale]
  const personaYaml = entry.persona.map((item) => `  - ${item}`).join('\n')
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `audience: ${entry.audience}`,
    'persona:',
    personaYaml,
    `section: ${entry.section}`,
    `sourcePath: ${JSON.stringify(entry.sourcePath)}`,
    `status: ${entry.status}`,
    '---',
    ''
  ].join('\n')
}

function metaBlock(entry, locale, preamble) {
  if (locale === 'en') {
    return [
      `> ${localeConfig.en.metaLabel}: \`${entry.sourcePath}\``,
      `> Audience: \`${entry.audience}\` | Section: \`${entry.section}\` | Status: \`${entry.status}\``,
      `> Updated: ${preamble.updated} | Version: ${preamble.version}`,
      ''
    ].join('\n')
  }

  return [
    `> ${localeConfig.zh.metaLabel}：\`${entry.sourcePath}\``,
    `> Audience：\`${entry.audience}\` | Section：\`${entry.section}\` | Status：\`${entry.status}\``,
    `> Updated：${preamble.updated} | Version：${preamble.version}`,
    ''
  ].join('\n')
}

function reduceConfidenceRun(run) {
  if (!run) {
    return null
  }

  return {
    id: run.id,
    outcome: run.ok ? 'passed' : 'failed',
    qualifiedForReadiness: run.qualifiedForReadiness ?? false,
    completedAt: run.completedAt ?? null,
    durationSeconds: run.totalDurationSeconds ?? null,
    failedStepName: run.failedStepName ?? null,
    context: {
      eventName: run.context?.eventName ?? 'local',
      ref: run.context?.ref ?? null,
      sha: run.context?.sha ?? null,
      runId: run.context?.runId ?? null,
      runAttempt: run.context?.runAttempt ?? null,
      workflow: run.context?.workflow ?? 'local'
    }
  }
}

function confidenceProgressSource(history) {
  return {
    updatedAt: history.updatedAt,
    trackedRuns: history.totalRuns,
    passedRuns: history.passedRuns,
    failedRuns: history.failedRuns,
    consecutivePasses: history.consecutivePasses,
    readiness: history.readiness,
    visibility: history.visibility,
    latestRun: reduceConfidenceRun(history.latestRun),
    latestQualifiedRun: reduceConfidenceRun(history.latestQualifiedRun),
    recentRuns: [...(history.entries ?? [])].toReversed().slice(0, 6).map(reduceConfidenceRun),
    sourceFiles: {
      historyPath: '.portmanager/reports/milestone-confidence-history.json',
      summaryPath: '.portmanager/reports/milestone-confidence-summary.md',
      reportPath: '.portmanager/reports/milestone-confidence-report.json'
    },
    publication: {
      trackedDataPath: 'docs-site/data/milestone-confidence-progress.ts',
      defaultMode: 'reuse-committed-artifact',
      explicitRefreshFlag: confidenceRefreshFlag,
      refreshCommand: confidenceRefreshCommand
    }
  }
}

export function shouldRefreshConfidenceProgress({
  argv = process.argv.slice(2),
  env = process.env
} = {}) {
  return argv.includes(confidenceRefreshFlag) || env.PORTMANAGER_DOCS_REFRESH_CONFIDENCE === '1'
}

export async function generateMilestoneConfidenceProgressData({
  refreshConfidenceProgress = shouldRefreshConfidenceProgress(),
  confidenceHistorySourcePath = confidenceHistoryPath,
  generatedDataPath = generatedConfidenceProgressPath
} = {}) {
  const generatedDataExists = await pathExists(generatedDataPath)

  if (!refreshConfidenceProgress && generatedDataExists) {
    return 'reused'
  }

  try {
    const historyText = await fs.readFile(confidenceHistorySourcePath, 'utf8')
    const history = JSON.parse(historyText)
    const output = platformLineEndings([
      '/* This file is generated by scripts/docs/extract-locales.mjs. */',
      '',
      `export const milestoneConfidenceProgress = ${JSON.stringify(confidenceProgressSource(history), null, 2)} as const`,
      ''
    ].join('\n'))
    await fs.mkdir(path.dirname(generatedDataPath), { recursive: true })
    await fs.writeFile(generatedDataPath, output, 'utf8')
    return refreshConfidenceProgress ? 'refreshed' : 'generated'
  } catch (error) {
    if (error?.code === 'ENOENT') {
      if (refreshConfidenceProgress) {
        throw new Error(
          'Explicit confidence progress refresh requested but .portmanager milestone confidence history is unavailable'
        )
      }

      if (generatedDataExists) {
        return 'reused'
      }

      throw new Error(
        'Missing committed docs-site/data/milestone-confidence-progress.ts and .portmanager milestone confidence history'
      )
    }

    throw error
  }
}

async function ensurePublishableDocsCovered() {
  const discovered = new Set()
  for (const root of publishableRoots) {
    for (const file of await listMarkdownFiles(root)) {
      discovered.add(file)
    }
  }

  const mapped = new Set(contentMap.map((entry) => normalize(entry.sourcePath)))
  const missing = [...discovered].filter((file) => !mapped.has(file)).sort()
  if (missing.length > 0) {
    throw new Error(`Missing content-map entries for: ${missing.join(', ')}`)
  }
}

export async function generate({
  refreshConfidenceProgress = shouldRefreshConfidenceProgress(),
  stdout = process.stdout
} = {}) {
  await ensurePublishableDocsCovered()
  const confidenceProgressStatus = await generateMilestoneConfidenceProgressData({
    refreshConfidenceProgress
  })

  for (const entry of contentMap) {
    const absoluteSource = path.join(repoRoot, entry.sourcePath)
    const documentText = await fs.readFile(absoluteSource, 'utf8')
    const preamble = parsePreamble(documentText)

    for (const locale of ['en', 'zh']) {
      const body = extractSection(documentText, locale)
      const destination = path.join(docsSiteRoot, locale, `${entry.route}.md`)
      await fs.mkdir(path.dirname(destination), { recursive: true })
      const output = platformLineEndings(
        `${frontmatterFor(entry, locale)}${metaBlock(entry, locale, preamble)}${body}\n`
      )
      await fs.writeFile(destination, output, 'utf8')
    }
  }

  if (confidenceProgressStatus === 'reused') {
    stdout.write(
      'Reused committed milestone confidence progress data; default docs generation no longer rewrites it from local .portmanager history\n'
    )
  }

  if (confidenceProgressStatus === 'generated') {
    stdout.write(
      'Generated milestone confidence progress data because the committed tracked artifact was missing\n'
    )
  }

  if (confidenceProgressStatus === 'refreshed') {
    stdout.write(
      `Refreshed committed milestone confidence progress data from local .portmanager history via ${confidenceRefreshFlag}\n`
    )
  }

  stdout.write(`Generated ${contentMap.length * 2} locale pages into docs-site locale routes\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generate().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}

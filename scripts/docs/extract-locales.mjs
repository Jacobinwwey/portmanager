import { promises as fs } from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentMap, publishableRoots } from '../../docs-site/content-map.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const docsSiteRoot = path.join(repoRoot, 'docs-site')

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

async function generate() {
  await ensurePublishableDocsCovered()

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

  process.stdout.write(`Generated ${contentMap.length * 2} locale pages into docs-site locale routes\n`)
}

generate().catch((error) => {
  console.error(error.message)
  process.exit(1)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { contentMap, publishableRoots } from '../../docs-site/content-map.js'
import { docLink } from '../../docs-site/data/docs.ts'
import { roadmapMilestones, schemeCProfile } from '../../docs-site/data/roadmap.ts'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const docsSiteRoot = path.join(repoRoot, 'docs-site')
const docsConfigPath = path.join(docsSiteRoot, '.vitepress', 'config.ts')

const allowedAudiences = new Set(['human', 'agent', 'shared'])
const allowedSections = new Set(['overview', 'reference', 'architecture', 'operations', 'roadmap'])
const allowedStatuses = new Set(['active', 'planned', 'archived'])

function normalize(filePath) {
  return filePath.split(path.sep).join('/')
}

function listMarkdownFiles(root) {
  const absoluteRoot = path.join(repoRoot, root)
  const stats = statSync(absoluteRoot)

  if (stats.isFile()) {
    return [normalize(root)]
  }

  const results = []

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(absolute)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(normalize(path.relative(repoRoot, absolute)))
      }
    }
  }

  walk(absoluteRoot)
  return results.sort()
}

function generatedDocPath(locale, route) {
  return path.join(docsSiteRoot, locale, `${route}.md`)
}

function resolveSiteLink(link) {
  const pathOnly = link.split('#')[0]?.split('?')[0] ?? link
  const trimmed = pathOnly.replace(/^\/+|\/+$/g, '')
  const candidates = trimmed.length === 0
    ? [path.join(docsSiteRoot, 'index.md')]
    : [
        path.join(docsSiteRoot, `${trimmed}.md`),
        path.join(docsSiteRoot, trimmed, 'index.md')
      ]

  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

function allRoadmapDocIds() {
  return new Set([
    ...schemeCProfile.docs,
    ...roadmapMilestones.flatMap((milestone) => milestone.docs)
  ])
}

function markdownInternalLinks(filePath) {
  const documentText = readFileSync(filePath, 'utf8')
  return [...documentText.matchAll(/\[[^\]]+\]\((\/(?:en|zh)\/[^)#?]+(?:[?#][^)]+)?)\)/g)].map(
    (match) => match[1]
  )
}

test('publishable sources are fully covered by content map with bilingual metadata', () => {
  const discovered = new Set(publishableRoots.flatMap((root) => listMarkdownFiles(root)))
  const mapped = new Set(contentMap.map((entry) => normalize(entry.sourcePath)))
  const missing = [...discovered].filter((sourcePath) => !mapped.has(sourcePath)).sort()

  assert.deepEqual(missing, [])
  assert.equal(new Set(contentMap.map((entry) => entry.id)).size, contentMap.length)
  assert.equal(new Set(contentMap.map((entry) => entry.route)).size, contentMap.length)
  assert.equal(new Set(contentMap.map((entry) => normalize(entry.sourcePath))).size, contentMap.length)

  for (const entry of contentMap) {
    assert.ok(allowedAudiences.has(entry.audience), `unsupported audience for ${entry.id}`)
    assert.ok(allowedSections.has(entry.section), `unsupported section for ${entry.id}`)
    assert.ok(allowedStatuses.has(entry.status), `unsupported status for ${entry.id}`)
    assert.ok(entry.persona.length > 0, `missing persona for ${entry.id}`)

    const sourcePath = path.join(repoRoot, entry.sourcePath)
    assert.ok(existsSync(sourcePath), `missing source file for ${entry.id}`)

    const sourceText = readFileSync(sourcePath, 'utf8')
    assert.match(sourceText, /^## English$/m, `missing English section in ${entry.sourcePath}`)
    assert.match(sourceText, /^## 中文$/m, `missing Chinese section in ${entry.sourcePath}`)
  }
})

test('generated locale docs exist with stable metadata and resolvable markdown links', () => {
  for (const entry of contentMap) {
    for (const locale of ['en', 'zh']) {
      const generatedPath = generatedDocPath(locale, entry.route)
      assert.ok(existsSync(generatedPath), `missing generated page ${locale}/${entry.route}`)

      const generatedText = readFileSync(generatedPath, 'utf8')
      assert.match(generatedText, new RegExp(`^title: ${escapeForRegex(JSON.stringify(entry.titles[locale]))}$`, 'm'))
      assert.match(generatedText, new RegExp(`^audience: ${entry.audience}$`, 'm'))
      assert.match(generatedText, new RegExp(`^section: ${entry.section}$`, 'm'))
      assert.match(
        generatedText,
        new RegExp(`^sourcePath: ${escapeForRegex(JSON.stringify(entry.sourcePath))}$`, 'm')
      )
      assert.match(generatedText, new RegExp(`^status: ${entry.status}$`, 'm'))

      for (const link of markdownInternalLinks(generatedPath)) {
        assert.ok(resolveSiteLink(link), `broken internal link ${link} in ${generatedPath}`)
      }
    }
  }
})

test('roadmap linked docs and VitePress internal routes resolve to generated pages', () => {
  for (const locale of ['en', 'zh']) {
    for (const docId of allRoadmapDocIds()) {
      const resolved = resolveSiteLink(docLink(locale, docId))
      assert.ok(resolved, `roadmap doc link missing for ${locale}/${docId}`)
    }
  }

  const configText = readFileSync(docsConfigPath, 'utf8')
  const configLinks = new Set()

  for (const match of configText.matchAll(/link:\s*'((?:\/en|\/zh)\/[^']*)'/g)) {
    configLinks.add(match[1])
  }

  for (const match of configText.matchAll(/link:\s*`\/\$\{locale\}\/([^`]*)`/g)) {
    const suffix = match[1]
    configLinks.add(`/en/${suffix}`)
    configLinks.add(`/zh/${suffix}`)
  }

  for (const match of configText.matchAll(/doc\(locale,\s*'([^']+)'\)/g)) {
    const docId = match[1]
    configLinks.add(docLink('en', docId))
    configLinks.add(docLink('zh', docId))
  }

  for (const link of configLinks) {
    assert.ok(resolveSiteLink(link), `broken VitePress route ${link}`)
  }
})

function escapeForRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

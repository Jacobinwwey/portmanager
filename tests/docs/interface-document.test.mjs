import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const interfaceDocumentPath = path.join(repoRoot, 'Interface Document.md')

test('interface document stays aligned with helper-first promotion review flow', () => {
  const interfaceDocument = readFileSync(interfaceDocumentPath, 'utf8')

  assert.match(interfaceDocument, /pnpm milestone:review:confidence/)
  assert.match(interfaceDocument, /pnpm milestone:review:promotion-ready -- --limit 20/)
  assert.match(interfaceDocument, /pnpm milestone:review:promotion-ready -- --skip-sync/)
  assert.match(interfaceDocument, /--refresh-published-artifact/)
  assert.match(interfaceDocument, /\.portmanager\/reports\/milestone-wording-review\.md/)
  assert.match(interfaceDocument, /\.portmanager\/reports\/milestone-confidence-review\.md/)
  assert.match(interfaceDocument, /promotion-ready-refresh-required/)
  assert.match(
    interfaceDocument,
    /pnpm --dir docs-site --ignore-workspace run docs:generate:refresh-confidence/
  )

  const englishNextLane = interfaceDocument.match(/- `Next lane`:([^\n]+)/)
  assert.ok(englishNextLane, 'missing English next-lane line')
  assert.match(englishNextLane[1], /pnpm milestone:review:promotion-ready -- --limit 20/)
  assert.doesNotMatch(englishNextLane[1], /pnpm milestone:review:confidence/)
  assert.match(interfaceDocument, /milestone-confidence-bundle-\*/)

  const chineseNextLane = interfaceDocument.match(/- `下一主线`：([^\n]+)/)
  assert.ok(chineseNextLane, 'missing Chinese next-lane line')
  assert.match(chineseNextLane[1], /pnpm milestone:review:promotion-ready -- --limit 20/)
  assert.doesNotMatch(chineseNextLane[1], /pnpm milestone:review:confidence/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

const counterOwnershipSurfaces = [
  'README.md',
  'TODO.md',
  'Interface Document.md',
  'docs/specs/portmanager-milestones.md',
  'docs-site/data/roadmap.ts'
]

test('root docs keep exact confidence counters on tracked public surfaces only', () => {
  for (const relativePath of counterOwnershipSurfaces) {
    const documentText = readFileSync(path.join(repoRoot, relativePath), 'utf8')

    assert.match(
      documentText,
      /development-progress (page|页面)|开发进度页/
    )
    assert.match(
      documentText,
      /tracked confidence artifact|被跟踪 confidence artifact/
    )
    assert.doesNotMatch(
      documentText,
      /latest qualified run `\d{10,}\/\d+`/
    )
    assert.doesNotMatch(
      documentText,
      /`\d+\/7` qualified runs/
    )
  }
})

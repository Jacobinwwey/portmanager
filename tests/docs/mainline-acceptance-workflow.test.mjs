import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'mainline-acceptance.yml')

test('mainline acceptance workflow publishes the current-run promotion review pack', () => {
  const workflow = readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /pnpm milestone:review:promotion-ready -- --skip-sync/)
  assert.match(workflow, /milestone-confidence-review\.md/)
  assert.match(workflow, /milestone-wording-review\.md/)
  assert.match(workflow, /Publish milestone confidence review digest/)
  assert.match(workflow, /Publish milestone wording review checklist/)
})

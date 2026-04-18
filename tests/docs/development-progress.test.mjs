import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const docsSiteRoot = path.join(repoRoot, 'docs-site')
const docsConfigPath = path.join(docsSiteRoot, '.vitepress', 'config.ts')
const confidenceHistoryPath = path.join(repoRoot, '.portmanager', 'reports', 'milestone-confidence-history.json')
const generatedProgressDataPath = path.join(docsSiteRoot, 'data', 'milestone-confidence-progress.ts')

test('roadmap publishes a development-progress page backed by live milestone confidence data', async () => {
  const enPagePath = path.join(docsSiteRoot, 'en', 'roadmap', 'development-progress.md')
  const zhPagePath = path.join(docsSiteRoot, 'zh', 'roadmap', 'development-progress.md')

  assert.ok(existsSync(enPagePath), 'missing English development-progress roadmap page')
  assert.ok(existsSync(zhPagePath), 'missing Chinese development-progress roadmap page')
  assert.ok(existsSync(generatedProgressDataPath), 'missing generated milestone confidence progress data file')

  const enPage = readFileSync(enPagePath, 'utf8')
  const zhPage = readFileSync(zhPagePath, 'utf8')
  const docsConfig = readFileSync(docsConfigPath, 'utf8')
  const confidenceHistory = JSON.parse(readFileSync(confidenceHistoryPath, 'utf8'))

  assert.match(enPage, /<MilestoneConfidencePage locale="en" \/>/)
  assert.match(zhPage, /<MilestoneConfidencePage locale="zh" \/>/)
  assert.match(docsConfig, /roadmap\/development-progress/)

  const { milestoneConfidenceProgress } = await import(pathToFileURL(generatedProgressDataPath).href)

  assert.equal(milestoneConfidenceProgress.updatedAt, confidenceHistory.updatedAt)
  assert.equal(milestoneConfidenceProgress.readiness.status, confidenceHistory.readiness.status)
  assert.equal(milestoneConfidenceProgress.readiness.qualifiedRuns, confidenceHistory.readiness.qualifiedRuns)
  assert.equal(
    milestoneConfidenceProgress.latestQualifiedRun?.context?.runId ?? null,
    confidenceHistory.latestQualifiedRun?.context?.runId ?? null
  )
  assert.equal(
    milestoneConfidenceProgress.visibility.localVisibilityOnlyRuns,
    confidenceHistory.visibility.localVisibilityOnlyRuns
  )
})

export const reviewPackRequiredFiles = [
  'milestone-confidence-review.md',
  'milestone-wording-review.md'
] as const

export const reviewPackOptionalFiles = [
  'milestone-confidence-history.json',
  'milestone-confidence-report.json',
  'milestone-confidence-summary.md'
] as const

export function summarizeReviewPackFiles(
  files: Record<string, string> | null | undefined,
  expectedFiles: readonly string[]
) {
  const missing = expectedFiles.filter((fileName) => !files?.[fileName])

  return {
    expected: expectedFiles.length,
    available: expectedFiles.length - missing.length,
    complete: missing.length === 0,
    missing
  }
}

export function buildReviewPackWorkflowPageUrl(
  repo: string | null | undefined,
  workflowRef: string | null | undefined
) {
  if (!repo || !workflowRef) {
    return null
  }

  return `https://github.com/${repo}/actions/workflows/${workflowRef}`
}

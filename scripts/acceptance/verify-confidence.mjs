import path from 'node:path'

import { getConfidenceVerificationSteps, runVerificationSteps } from './confidence.mjs'

const reportsDirectory = path.resolve('.portmanager', 'reports')
const defaultReportPath = path.join(reportsDirectory, 'milestone-confidence-report.json')
const defaultHistoryPath = path.join(reportsDirectory, 'milestone-confidence-history.json')
const defaultSummaryPath = path.join(reportsDirectory, 'milestone-confidence-summary.md')

const result = runVerificationSteps({
  steps: getConfidenceVerificationSteps(),
  successLabel: 'Milestone confidence verification',
  reportPath: defaultReportPath,
  historyPath: defaultHistoryPath,
  summaryPath: defaultSummaryPath
})

if (result.status !== 0) {
  process.exit(result.status)
}

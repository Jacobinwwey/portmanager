import path from 'node:path'

import { getConfidenceVerificationSteps, runVerificationSteps } from './confidence.mjs'

const defaultReportPath = path.resolve('.portmanager', 'reports', 'milestone-confidence-report.json')

const result = runVerificationSteps({
  steps: getConfidenceVerificationSteps(),
  successLabel: 'Milestone confidence verification',
  reportPath: defaultReportPath
})

if (result.status !== 0) {
  process.exit(result.status)
}

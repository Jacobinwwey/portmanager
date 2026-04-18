import { getConfidenceVerificationSteps, runVerificationSteps } from './confidence.mjs'

const result = runVerificationSteps({
  steps: getConfidenceVerificationSteps(),
  successLabel: 'Milestone confidence verification'
})

if (result.status !== 0) {
  process.exit(result.status)
}

import { getAcceptanceVerificationSteps, runVerificationSteps } from './confidence.mjs'

const result = runVerificationSteps({
  steps: getAcceptanceVerificationSteps(),
  successLabel: 'Acceptance verification'
})

if (result.status !== 0) {
  process.exit(result.status)
}

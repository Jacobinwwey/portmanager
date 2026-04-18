import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getAcceptanceVerificationSteps,
  getConfidenceVerificationSteps,
  runVerificationSteps
} from '../../scripts/acceptance/confidence.mjs'

test('confidence routine appends replay proof after standing acceptance steps', () => {
  const acceptanceSteps = getAcceptanceVerificationSteps()
  const confidenceSteps = getConfidenceVerificationSteps()

  assert.equal(confidenceSteps.length, acceptanceSteps.length + 1)
  assert.deepEqual(confidenceSteps.slice(0, acceptanceSteps.length), acceptanceSteps)
  assert.equal(
    confidenceSteps.at(-1)?.name,
    'Run reliability remote-backup replay proof'
  )
  assert.deepEqual(confidenceSteps.at(-1)?.args, [
    'milestone:verify:reliability-remote-backup-replay'
  ])
})

test('standing acceptance routine stays unchanged without replay proof', () => {
  const acceptanceSteps = getAcceptanceVerificationSteps()

  assert.equal(acceptanceSteps.length, 6)
  assert.equal(
    acceptanceSteps.some(
      (step) => step.args[0] === 'milestone:verify:reliability-remote-backup-replay'
    ),
    false
  )
  assert.deepEqual(acceptanceSteps.at(-1)?.args, ['milestone:verify'])
})

test('confidence routine stops before replay when acceptance step fails', () => {
  const calls: Array<{ command: string; args: string[] }> = []

  const result = runVerificationSteps({
    steps: getConfidenceVerificationSteps(),
    spawnSyncImpl(command, args) {
      calls.push({ command, args: [...args] })

      if (args.includes('typecheck')) {
        return { status: 2, signal: null }
      }

      return { status: 0, signal: null }
    },
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer()
  })

  assert.equal(result.ok, false)
  assert.equal(result.failedStep?.args.at(-1), 'typecheck')
  assert.equal(
    calls.some((call) => call.args.includes('milestone:verify:reliability-remote-backup-replay')),
    false
  )
})

test('confidence routine fails on replay after acceptance succeeds', () => {
  const calls: Array<{ command: string; args: string[] }> = []

  const result = runVerificationSteps({
    steps: getConfidenceVerificationSteps(),
    spawnSyncImpl(command, args) {
      calls.push({ command, args: [...args] })

      if (args.includes('milestone:verify:reliability-remote-backup-replay')) {
        return { status: 7, signal: null }
      }

      return { status: 0, signal: null }
    },
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer()
  })

  assert.equal(result.ok, false)
  assert.equal(
    result.failedStep?.args.at(-1),
    'milestone:verify:reliability-remote-backup-replay'
  )
  assert.equal(
    calls.at(-1)?.args.includes('milestone:verify:reliability-remote-backup-replay'),
    true
  )
  assert.equal(calls.length, getConfidenceVerificationSteps().length)
})

function createWritableBuffer() {
  return {
    chunks: [] as string[],
    write(chunk: string) {
      this.chunks.push(String(chunk))
    }
  }
}

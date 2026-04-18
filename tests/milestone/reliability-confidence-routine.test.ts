import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

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

test('confidence routine writes success report with executed steps', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')

  try {
    const result = runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      ok: boolean
      failedStepName: string | null
      steps: Array<{ status: string; name: string }>
    }

    assert.equal(result.ok, true)
    assert.equal(report.ok, true)
    assert.equal(report.failedStepName, null)
    assert.equal(report.steps.length, getConfidenceVerificationSteps().length)
    assert.equal(report.steps.at(-1)?.status, 'passed')
    assert.equal(report.steps.at(-1)?.name, 'Run reliability remote-backup replay proof')
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('confidence routine writes failure report with skipped trailing steps', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')

  try {
    const result = runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      spawnSyncImpl(_command, args) {
        if (args.includes('typecheck')) {
          return { status: 2, signal: null }
        }

        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      ok: boolean
      failedStepName: string | null
      steps: Array<{ status: string; name: string }>
    }

    assert.equal(result.ok, false)
    assert.equal(report.ok, false)
    assert.equal(report.failedStepName, 'Run workspace type checks')
    assert.equal(report.steps[1]?.status, 'failed')
    assert.equal(report.steps.at(-1)?.status, 'skipped')
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

test('confidence routine writes CI context metadata into report', () => {
  const reportDirectory = mkdtempSync(path.join(tmpdir(), 'portmanager-confidence-report-'))
  const reportPath = path.join(reportDirectory, 'milestone-confidence-report.json')

  try {
    runVerificationSteps({
      steps: getConfidenceVerificationSteps(),
      reportPath,
      env: {
        GITHUB_EVENT_NAME: 'schedule',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_SHA: 'abc123def456',
        GITHUB_RUN_ID: '55',
        GITHUB_RUN_ATTEMPT: '3',
        GITHUB_WORKFLOW: 'mainline-acceptance'
      },
      spawnSyncImpl() {
        return { status: 0, signal: null }
      },
      stdout: createWritableBuffer(),
      stderr: createWritableBuffer()
    })

    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as {
      reportVersion: string
      context: {
        eventName: string | null
        ref: string | null
        sha: string | null
        runId: string | null
        runAttempt: string | null
        workflow: string | null
      }
    }

    assert.equal(report.reportVersion, '0.2.0')
    assert.equal(report.context.eventName, 'schedule')
    assert.equal(report.context.ref, 'refs/heads/main')
    assert.equal(report.context.sha, 'abc123def456')
    assert.equal(report.context.runId, '55')
    assert.equal(report.context.runAttempt, '3')
    assert.equal(report.context.workflow, 'mainline-acceptance')
  } finally {
    rmSync(reportDirectory, { recursive: true, force: true })
  }
})

function createWritableBuffer() {
  return {
    chunks: [] as string[],
    write(chunk: string) {
      this.chunks.push(String(chunk))
    }
  }
}

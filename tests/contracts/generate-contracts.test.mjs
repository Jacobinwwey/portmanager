import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { tmpdir } from 'node:os'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const nodeExecutable = process.execPath

function runGenerator(args) {
  return execFileSync(nodeExecutable, ['scripts/contracts/generate-contracts.mjs', ...args], {
    cwd: repoRoot,
    encoding: 'utf8'
  })
}

function walkFiles(rootDir) {
  const files = []

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(absolutePath)
      } else if (entry.isFile()) {
        files.push(absolutePath)
      }
    }
  }

  if (statSync(rootDir).isDirectory()) {
    walk(rootDir)
  }

  return files
}

test('contracts generator emits openapi and json schema types into target tree', () => {
  const outDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-'))

  try {
    runGenerator(['--out-dir', outDir])

    const openapiSource = readFileSync(
      path.join(repoRoot, 'packages', 'contracts', 'openapi', 'openapi.yaml'),
      'utf8'
    )
    const openapiOutput = readFileSync(path.join(outDir, 'generated', 'openapi.ts'), 'utf8')
    const runtimeStateOutput = readFileSync(
      path.join(outDir, 'generated', 'jsonschema', 'runtime-state.ts'),
      'utf8'
    )
    const indexOutput = readFileSync(path.join(outDir, 'index.ts'), 'utf8')

    assert.match(openapiOutput, /export interface paths/u)
    assert.match(openapiOutput, /"\/hosts"/u)
    assert.match(openapiOutput, /"\/consumer-boundary-decision-pack"/u)
    assert.match(openapiOutput, /"\/deployment-boundary-decision-pack"/u)
    assert.match(openapiOutput, /"\/event-audit-index"/u)
    assert.match(openapiOutput, /"\/persistence-decision-pack"/u)
    assert.match(openapiOutput, /"\/persistence-readiness"/u)
    assert.match(openapiOutput, /"\/second-target-policy-pack"/u)
    assert.match(openapiSource, /url: http:\/\/localhost:8710\/api\/controller/u)
    assert.match(openapiOutput, /ConsumerBoundaryDecisionPack/u)
    assert.match(openapiOutput, /DeploymentBoundaryDecisionPack/u)
    assert.match(openapiOutput, /EventAuditIndexEntry/u)
    assert.match(openapiOutput, /PersistenceDecisionPack/u)
    assert.match(openapiOutput, /PersistenceReadiness/u)
    assert.match(openapiOutput, /SecondTargetPolicyPack/u)
    assert.match(openapiOutput, /SecondTargetReviewAdjudication/u)
    assert.match(openapiOutput, /SecondTargetReviewAdjudicationState/u)
    assert.match(openapiOutput, /SecondTargetReviewDelta/u)
    assert.match(openapiOutput, /SecondTargetReviewDeltaId/u)
    assert.match(openapiOutput, /SecondTargetReviewDeltaState/u)
    assert.match(openapiOutput, /SecondTargetLiveTransportFollowUp/u)
    assert.match(openapiOutput, /SecondTargetLiveTransportFollowUpArtifact/u)
    assert.match(openapiOutput, /SecondTargetLiveTransportFollowUpArtifactId/u)
    assert.match(openapiOutput, /SecondTargetLiveTransportFollowUpState/u)
    assert.match(openapiOutput, /SecondTargetReviewVerdict/u)
    assert.match(openapiOutput, /SecondTargetReviewVerdictId/u)
    assert.match(openapiOutput, /SecondTargetBootstrapProofCapture/u)
    assert.match(openapiOutput, /SecondTargetBootstrapProofArtifact/u)
    assert.match(openapiOutput, /SecondTargetSteadyStateProofCapture/u)
    assert.match(openapiOutput, /SecondTargetSteadyStateProofArtifact/u)
    assert.match(openapiOutput, /SecondTargetBackupRestoreProofCapture/u)
    assert.match(openapiOutput, /SecondTargetBackupRestoreProofArtifact/u)
    assert.match(openapiOutput, /SecondTargetDiagnosticsProofCapture/u)
    assert.match(openapiOutput, /SecondTargetDiagnosticsProofArtifact/u)
    assert.match(openapiOutput, /SecondTargetReviewPacketReadiness/u)
    assert.match(openapiOutput, /SecondTargetReviewPacketCoverage/u)
    assert.match(openapiOutput, /SecondTargetNextExecutionUnit/u)
    assert.match(openapiOutput, /SecondTargetReviewPacketTemplate/u)
    assert.match(openapiOutput, /candidateTargetProfiles/u)
    assert.match(openapiOutput, /reviewPacketReadiness/u)
    assert.match(openapiOutput, /reviewAdjudication/u)
    assert.match(openapiOutput, /liveTransportFollowUp/u)
    assert.match(openapiOutput, /capturedPacketRoot/u)
    assert.match(openapiOutput, /capturedAddress/u)
    assert.match(openapiOutput, /blockingDeltas/u)
    assert.match(openapiOutput, /bootstrapProofCapture/u)
    assert.match(openapiOutput, /steadyStateProofCapture/u)
    assert.match(openapiOutput, /backupRestoreProofCapture/u)
    assert.match(openapiOutput, /diagnosticsProofCapture/u)
    assert.match(openapiOutput, /reviewPacketTemplate/u)
    assert.match(openapiOutput, /"supported" \| "candidate" \| "unsupported"/u)
    assert.match(runtimeStateOutput, /export interface RuntimeState/u)
    assert.match(runtimeStateOutput, /agentState/u)
    assert.match(indexOutput, /export \* from '\.\/generated\/openapi\.js'/u)
    assert.match(indexOutput, /runtime-state\.js/u)
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
})

test('contracts generator check mode fails when committed outputs drift', () => {
  const outDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-check-'))

  try {
    runGenerator(['--out-dir', outDir])
    writeFileSync(path.join(outDir, 'index.ts'), '// drift\n', 'utf8')

    assert.throws(
      () => {
        runGenerator(['--check', '--target-dir', outDir])
      },
      /Contract generation drift detected/u
    )
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
})

test('contracts generator check mode tolerates CRLF-only output differences', () => {
  const outDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-eol-'))

  try {
    runGenerator(['--out-dir', outDir])

    for (const filePath of walkFiles(outDir)) {
      const contents = readFileSync(filePath, 'utf8')
      writeFileSync(filePath, contents.replace(/\r?\n/gu, '\r\n'), 'utf8')
    }

    assert.doesNotThrow(() => {
      runGenerator(['--check', '--target-dir', outDir])
    })
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
})

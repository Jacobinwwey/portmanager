import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

test('contracts generator emits openapi and json schema types into target tree', () => {
  const outDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-'))

  try {
    runGenerator(['--out-dir', outDir])

    const openapiOutput = readFileSync(path.join(outDir, 'generated', 'openapi.ts'), 'utf8')
    const runtimeStateOutput = readFileSync(
      path.join(outDir, 'generated', 'jsonschema', 'runtime-state.ts'),
      'utf8'
    )
    const indexOutput = readFileSync(path.join(outDir, 'index.ts'), 'utf8')

    assert.match(openapiOutput, /export interface paths/u)
    assert.match(openapiOutput, /"\/hosts"/u)
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

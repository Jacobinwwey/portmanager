import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const contractsRoot = path.join(repoRoot, 'packages', 'contracts')
const defaultTargetDir = path.join(repoRoot, 'packages', 'typescript-contracts', 'src')

function parseArgs(argv) {
  const options = {
    check: false,
    targetDir: defaultTargetDir
  }

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--check') {
      options.check = true
      continue
    }

    if (current === '--out-dir' || current === '--target-dir') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error(`${current} requires a path`)
      }
      options.targetDir = path.resolve(repoRoot, value)
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return options
}

function runTool(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Command failed: ${command} ${args.join(' ')}`)
  }

  return result.stdout
}

function schemaSourceFiles() {
  return readdirSync(path.join(contractsRoot, 'jsonschema'))
    .filter((entry) => entry.endsWith('.schema.json'))
    .sort((left, right) => left.localeCompare(right))
}

function schemaDefinitions() {
  return schemaSourceFiles().map((fileName) => {
    const absolutePath = path.join(contractsRoot, 'jsonschema', fileName)
    const schema = JSON.parse(readFileSync(absolutePath, 'utf8'))

    if (typeof schema.title !== 'string' || schema.title.length === 0) {
      throw new Error(`Schema title missing for ${fileName}`)
    }

    return {
      fileName,
      exportName: schema.title,
      outputName: schemaOutputName(fileName)
    }
  })
}

function schemaOutputName(fileName) {
  return fileName.replace(/\.schema\.json$/u, '')
}

function generateInto(targetDir) {
  mkdirSync(path.join(targetDir, 'generated', 'jsonschema'), { recursive: true })
  const schemas = schemaDefinitions()

  runTool('pnpm', [
    'exec',
    'openapi-typescript',
    path.join(contractsRoot, 'openapi', 'openapi.yaml'),
    '--alphabetize',
    '--root-types',
    '--root-types-no-schema-prefix',
    '--output',
    path.join(targetDir, 'generated', 'openapi.ts')
  ])

  for (const schema of schemas) {
    const source = path.join(contractsRoot, 'jsonschema', schema.fileName)
    const output = path.join(targetDir, 'generated', 'jsonschema', `${schema.outputName}.ts`)
    const generated = runTool('pnpm', ['exec', 'json2ts', '--input', source])
    writeFileSync(output, generated, 'utf8')
  }

  const indexLines = [
    "export * from './generated/openapi.js'",
    ...schemas.map(
      (schema) =>
        `export type { ${schema.exportName} as ${schema.exportName}Schema } from './generated/jsonschema/${schema.outputName}.js'`
    ),
    ''
  ]
  writeFileSync(path.join(targetDir, 'index.ts'), indexLines.join('\n'), 'utf8')
}

function fileMap(rootDir) {
  const results = new Map()

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absolutePath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(absolutePath)
        continue
      }

      const relativePath = path.relative(rootDir, absolutePath)
      results.set(relativePath, readFileSync(absolutePath, 'utf8'))
    }
  }

  walk(rootDir)
  return results
}

function compareOutputs(expectedDir, actualDir) {
  const expectedFiles = fileMap(expectedDir)
  const actualFiles = fileMap(actualDir)
  const allPaths = [...new Set([...expectedFiles.keys(), ...actualFiles.keys()])].sort((left, right) =>
    left.localeCompare(right)
  )

  const mismatches = []

  for (const relativePath of allPaths) {
    if (!expectedFiles.has(relativePath)) {
      mismatches.push(`Missing generated file: ${relativePath}`)
      continue
    }

    if (!actualFiles.has(relativePath)) {
      mismatches.push(`Extra generated file missing from target: ${relativePath}`)
      continue
    }

    if (expectedFiles.get(relativePath) !== actualFiles.get(relativePath)) {
      mismatches.push(`Changed generated file: ${relativePath}`)
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Contract generation drift detected\n${mismatches.join('\n')}`)
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const tempDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-'))

  try {
    generateInto(tempDir)

    if (options.check) {
      compareOutputs(tempDir, options.targetDir)
      process.stdout.write(`Checked contract outputs in ${options.targetDir}\n`)
      return
    }

    rmSync(options.targetDir, { recursive: true, force: true })
    mkdirSync(options.targetDir, { recursive: true })

    for (const [relativePath, contents] of fileMap(tempDir)) {
      const destination = path.join(options.targetDir, relativePath)
      mkdirSync(path.dirname(destination), { recursive: true })
      writeFileSync(destination, contents, 'utf8')
    }

    process.stdout.write(`Generated contract outputs into ${options.targetDir}\n`)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

main()

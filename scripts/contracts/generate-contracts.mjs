import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { compileFromFile } from 'json-schema-to-typescript'
import path from 'node:path'
import { EOL, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const contractsRoot = path.join(repoRoot, 'packages', 'contracts')
const defaultTargetDir = path.join(repoRoot, 'packages', 'typescript-contracts', 'src')
const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']
const parameterLocations = ['query', 'header', 'path', 'cookie']

function indent(level) {
  return '    '.repeat(level)
}

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

function readOpenapiDocument() {
  return YAML.parse(readFileSync(path.join(contractsRoot, 'openapi', 'openapi.yaml'), 'utf8'))
}

function refToType(ref) {
  const match = ref.match(/^#\/components\/(schemas|parameters)\/([^/]+)$/u)
  if (!match) {
    throw new Error(`Unsupported OpenAPI reference: ${ref}`)
  }

  return `components["${match[1]}"]["${match[2]}"]`
}

function refToName(ref, expectedSection) {
  const match = ref.match(/^#\/components\/([^/]+)\/([^/]+)$/u)
  if (!match || match[1] !== expectedSection) {
    throw new Error(`Expected ${expectedSection} reference but received ${ref}`)
  }

  return match[2]
}

function linesToBlock(lines) {
  return lines.join('\n')
}

function normalizeLineEndings(source) {
  return source.replace(/\r\n/gu, '\n')
}

function platformLineEndings(source) {
  return normalizeLineEndings(source).replace(/\n/gu, EOL)
}

function writeGeneratedText(targetPath, contents) {
  writeFileSync(targetPath, platformLineEndings(contents), 'utf8')
}

function prefixedLines(prefix, source) {
  const sourceLines = source.split('\n')
  return [
    `${prefix}${sourceLines[0]}`,
    ...sourceLines.slice(1).map((line) => `${indent(1)}${line}`)
  ]
}

function pushTypeAssignment(lines, level, name, renderedType, suffix = ';') {
  const renderedLines = renderedType.split('\n')
  lines.push(`${indent(level)}${name}: ${renderedLines[0]}`)
  for (const line of renderedLines.slice(1)) {
    lines.push(`${indent(level)}${line}`)
  }
  lines[lines.length - 1] = `${lines[lines.length - 1]}${suffix}`
}

function renderDocComment(commentLines, level = 0) {
  if (commentLines.length === 0) {
    return []
  }

  if (commentLines.length === 1) {
    return [`${indent(level)}/** ${commentLines[0]} */`]
  }

  return [
    `${indent(level)}/**`,
    ...commentLines.map((line) => `${indent(level)} * ${line}`),
    `${indent(level)} */`
  ]
}

function renderAnnotationLines(schema, options = {}) {
  const commentLines = []

  if (options.summary) {
    commentLines.push(options.summary)
  }

  if (schema?.description) {
    commentLines.push(`@description ${schema.description}`)
  }

  if (schema?.default !== undefined) {
    commentLines.push(`@default ${JSON.stringify(schema.default)}`)
  }

  if (schema?.format) {
    commentLines.push(`Format: ${schema.format}`)
  }

  if (Array.isArray(schema?.enum) && schema.enum.every((value) => typeof value === 'string')) {
    commentLines.unshift('@enum {string}')
  }

  return commentLines
}

function sortEntries(object) {
  return Object.entries(object ?? {}).sort(([left], [right]) => left.localeCompare(right))
}

function renderEnum(values) {
  return values.map((value) => JSON.stringify(value)).join(' | ')
}

function wrapArrayItemType(renderedType) {
  if (renderedType.includes('\n') || renderedType.includes(' | ') || renderedType.includes(' & ')) {
    return `(${renderedType.replace(/\s+/gu, ' ').trim()})`
  }

  return renderedType
}

function renderObjectType(schema, context) {
  const entries = sortEntries(schema.properties)
  if (entries.length === 0) {
    return 'Record<string, never>'
  }

  const required = new Set(Array.isArray(schema.required) ? schema.required : [])
  const lines = ['{']

  for (const [propertyName, propertySchema] of entries) {
    lines.push(...renderDocComment(renderAnnotationLines(propertySchema), 1))
    const propertyKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(propertyName)
      ? propertyName
      : JSON.stringify(propertyName)
    pushTypeAssignment(
      lines,
      1,
      `${propertyKey}${required.has(propertyName) ? '' : '?'}`,
      renderType(propertySchema, context)
    )
  }

  lines.push('}')
  return linesToBlock(lines)
}

function renderType(schema, context) {
  if (schema === false) {
    return 'never'
  }

  if (schema === true || schema === undefined || schema === null) {
    return 'unknown'
  }

  if (schema.$ref) {
    return refToType(schema.$ref)
  }

  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    return schema.allOf.map((entry) => renderType(entry, context)).join(' & ')
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return schema.oneOf.map((entry) => renderType(entry, context)).join(' | ')
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return schema.anyOf.map((entry) => renderType(entry, context)).join(' | ')
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return renderEnum(schema.enum)
  }

  if (schema.type === 'array') {
    return `${wrapArrayItemType(renderType(schema.items, context))}[]`
  }

  if (schema.type === 'object' || schema.properties) {
    return renderObjectType(schema, context)
  }

  if (schema.type === 'string') {
    return 'string'
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    return 'number'
  }

  if (schema.type === 'boolean') {
    return 'boolean'
  }

  return 'unknown'
}

function resolveParameter(parameter, document) {
  if (!parameter?.$ref) {
    return {
      componentName: undefined,
      definition: parameter
    }
  }

  const componentName = refToName(parameter.$ref, 'parameters')
  const definition = document.components?.parameters?.[componentName]
  if (!definition) {
    throw new Error(`Parameter reference not found: ${parameter.$ref}`)
  }

  return {
    componentName,
    definition
  }
}

function mergeParameters(pathParameters, operationParameters, document) {
  const merged = new Map()

  for (const parameter of [...(pathParameters ?? []), ...(operationParameters ?? [])]) {
    const resolved = resolveParameter(parameter, document)
    const name = resolved.definition?.name
    const location = resolved.definition?.in

    if (!name || !location) {
      throw new Error('OpenAPI parameter is missing name or location')
    }

    merged.set(`${location}:${name}`, resolved)
  }

  return [...merged.values()].sort((left, right) => {
    const leftKey = `${left.definition.in}:${left.definition.name}`
    const rightKey = `${right.definition.in}:${right.definition.name}`
    return leftKey.localeCompare(rightKey)
  })
}

function renderParameterLocation(location, parameters, context) {
  if (parameters.length === 0) {
    return `${location}?: never`
  }

  const locationIsRequired = location === 'path' || parameters.some((parameter) => parameter.definition.required)
  const lines = ['{']

  for (const parameter of parameters) {
    const propertyType =
      location === 'path' && parameter.componentName
        ? `components["parameters"]["${parameter.componentName}"]`
        : renderType(parameter.definition.schema, context)

    pushTypeAssignment(
      lines,
      1,
      `${parameter.definition.name}${location === 'path' || parameter.definition.required ? '' : '?'}`,
      propertyType
    )
  }

  lines.push('}')
  return `${location}${locationIsRequired ? '' : '?'}: ${linesToBlock(lines)}`
}

function renderOperationParameters(pathParameters, operationParameters, context) {
  const mergedParameters = mergeParameters(pathParameters, operationParameters, context.document)
  const grouped = Object.fromEntries(parameterLocations.map((location) => [location, []]))

  for (const parameter of mergedParameters) {
    grouped[parameter.definition.in].push(parameter)
  }

  const lines = ['{']
  for (const location of parameterLocations) {
    const rendered = renderParameterLocation(location, grouped[location], context)
    lines.push(...prefixedLines(indent(1), rendered).map((line, index, all) => index === all.length - 1 ? `${line};` : line))
  }
  lines.push('}')
  return linesToBlock(lines)
}

function renderRequestBody(requestBody, context) {
  if (!requestBody) {
    return {
      key: 'requestBody?',
      renderedType: 'never'
    }
  }

  const lines = ['{', `${indent(1)}content: {`]
  for (const [contentType, content] of sortEntries(requestBody.content)) {
    pushTypeAssignment(lines, 2, JSON.stringify(contentType), renderType(content.schema, context))
  }
  lines.push(`${indent(1)}}`, '}')

  return {
    key: requestBody.required ? 'requestBody' : 'requestBody?',
    renderedType: linesToBlock(lines)
  }
}

function renderResponses(responses, context) {
  const lines = ['{']
  for (const [statusCode, response] of sortEntries(responses)) {
    lines.push(...renderDocComment(renderAnnotationLines(response), 1))
    const responseLines = ['{', `${indent(1)}headers: {`, `${indent(2)}[name: string]: unknown;`, `${indent(1)}};`]

    if (response.content) {
      responseLines.push(`${indent(1)}content: {`)
      for (const [contentType, content] of sortEntries(response.content)) {
        pushTypeAssignment(responseLines, 2, JSON.stringify(contentType), renderType(content.schema, context))
      }
      responseLines.push(`${indent(1)}};`)
    }

    responseLines.push('}')
    pushTypeAssignment(lines, 1, statusCode, linesToBlock(responseLines))
  }
  lines.push('}')
  return linesToBlock(lines)
}

function renderOperation(operation, pathParameters, context) {
  const lines = ['{']
  pushTypeAssignment(lines, 1, 'parameters', renderOperationParameters(pathParameters, operation.parameters, context))

  const requestBody = renderRequestBody(operation.requestBody, context)
  pushTypeAssignment(lines, 1, requestBody.key, requestBody.renderedType)
  pushTypeAssignment(lines, 1, 'responses', renderResponses(operation.responses, context))
  lines.push('}')
  return linesToBlock(lines)
}

function renderPathItem(pathItem, context) {
  const lines = ['{']
  pushTypeAssignment(lines, 1, 'parameters', renderOperationParameters([], [], context))

  for (const method of httpMethods) {
    const operation = pathItem[method]
    if (!operation) {
      lines.push(`${indent(1)}${method}?: never;`)
      continue
    }

    lines.push(...renderDocComment(renderAnnotationLines(undefined, { summary: operation.summary }), 1))
    pushTypeAssignment(lines, 1, method, renderOperation(operation, pathItem.parameters, context))
  }

  lines.push('}')
  return linesToBlock(lines)
}

function renderComponents(document, context) {
  const lines = ['export interface components {', `${indent(1)}schemas: {`]

  for (const [schemaName, schema] of sortEntries(document.components?.schemas)) {
    lines.push(...renderDocComment(renderAnnotationLines(schema), 2))
    pushTypeAssignment(lines, 2, schemaName, renderType(schema, context))
  }

  lines.push(`${indent(1)}};`)
  lines.push(`${indent(1)}responses: never;`)
  lines.push(`${indent(1)}parameters: {`)

  for (const [parameterName, parameter] of sortEntries(document.components?.parameters)) {
    pushTypeAssignment(lines, 2, parameterName, renderType(parameter.schema, context))
  }

  lines.push(`${indent(1)}};`)
  lines.push(`${indent(1)}requestBodies: never;`)
  lines.push(`${indent(1)}headers: never;`)
  lines.push(`${indent(1)}pathItems: never;`)
  lines.push('}')
  return linesToBlock(lines)
}

function renderAliases(document) {
  const lines = []

  for (const [schemaName] of sortEntries(document.components?.schemas)) {
    lines.push(`export type ${schemaName} = components['schemas']['${schemaName}'];`)
  }

  for (const [parameterName] of sortEntries(document.components?.parameters)) {
    lines.push(`export type Parameter${parameterName} = components['parameters']['${parameterName}'];`)
  }

  lines.push('export type $defs = Record<string, never>;')
  lines.push('export type operations = Record<string, never>;')
  return linesToBlock(lines)
}

function generateOpenapiTypes() {
  const document = readOpenapiDocument()
  const context = { document }
  const lines = [
    '/**',
    ' * This file was auto-generated by the PortManager contracts generator.',
    ' * Do not make direct changes to the file.',
    ' */',
    '',
    'export interface paths {'
  ]

  for (const [pathName, pathItem] of sortEntries(document.paths)) {
    pushTypeAssignment(lines, 1, JSON.stringify(pathName), renderPathItem(pathItem, context))
  }

  lines.push('}')
  lines.push('export type webhooks = Record<string, never>;')
  lines.push(renderComponents(document, context))
  lines.push(renderAliases(document))
  lines.push('')
  return lines.join('\n')
}

async function generateInto(targetDir) {
  mkdirSync(path.join(targetDir, 'generated', 'jsonschema'), { recursive: true })
  const schemas = schemaDefinitions()

  writeGeneratedText(path.join(targetDir, 'generated', 'openapi.ts'), generateOpenapiTypes())

  for (const schema of schemas) {
    const source = path.join(contractsRoot, 'jsonschema', schema.fileName)
    const output = path.join(targetDir, 'generated', 'jsonschema', `${schema.outputName}.ts`)
    const generated = await compileFromFile(source)
    writeGeneratedText(output, generated)
  }

  const indexLines = [
    "export * from './generated/openapi.js'",
    ...schemas.map(
      (schema) =>
        `export type { ${schema.exportName} as ${schema.exportName}Schema } from './generated/jsonschema/${schema.outputName}.js'`
    ),
    ''
  ]
  writeGeneratedText(path.join(targetDir, 'index.ts'), indexLines.join('\n'))
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

    if (normalizeLineEndings(expectedFiles.get(relativePath)) !== normalizeLineEndings(actualFiles.get(relativePath))) {
      mismatches.push(`Changed generated file: ${relativePath}`)
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Contract generation drift detected\n${mismatches.join('\n')}`)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const tempDir = mkdtempSync(path.join(tmpdir(), 'portmanager-contracts-'))

  try {
    await generateInto(tempDir)

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
      writeGeneratedText(destination, contents)
    }

    process.stdout.write(`Generated contract outputs into ${options.targetDir}\n`)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

await main()

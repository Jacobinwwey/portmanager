import { mkdirSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import path from 'node:path'
import type { TLSSocket } from 'node:tls'

import type {
  PortDiagnosticResultSchema,
  WebSnapshotResultSchema
} from '@portmanager/typescript-contracts'

const SCHEMA_VERSION = '0.1.0'
const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 720
}

export interface RunDiagnosticsInput {
  operationId: string
  hostId: string
  ruleId?: string
  port: number
  scheme: 'http' | 'https'
  captureSnapshot: boolean
}

export interface DiagnosticsPrimitiveResult {
  state: 'succeeded' | 'degraded'
  resultSummary: string
  diagnosticResult: PortDiagnosticResultSchema
  snapshotResult?: WebSnapshotResultSchema
}

interface RequestedPage {
  statusCode: number
  body: string
  finalUrl: string
  tls: PortDiagnosticResultSchema['tls']
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeTitle(source: string) {
  const match = source.match(/<title[^>]*>(.*?)<\/title>/is)
  if (!match?.[1]) {
    return undefined
  }

  return match[1].replace(/\s+/g, ' ').trim() || undefined
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizeDistinguishedName(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return undefined
}

function summarizeCertificate(socket: TLSSocket): PortDiagnosticResultSchema['tls'] {
  const certificate = socket.getPeerCertificate()

  if (!certificate || Object.keys(certificate).length === 0) {
    return {
      enabled: true,
      validitySummary: 'certificate unavailable'
    }
  }

  const expiresAt = certificate.valid_to
    ? new Date(certificate.valid_to).toISOString()
    : undefined

  return {
    enabled: true,
    subject:
      typeof certificate.subject === 'object'
        ? normalizeDistinguishedName(certificate.subject.CN) ?? JSON.stringify(certificate.subject)
        : undefined,
    issuer:
      typeof certificate.issuer === 'object'
        ? normalizeDistinguishedName(certificate.issuer.CN) ?? JSON.stringify(certificate.issuer)
        : undefined,
    expiresAt,
    validitySummary:
      expiresAt && new Date(expiresAt).getTime() > Date.now()
        ? 'certificate valid'
        : expiresAt
          ? 'certificate expired'
          : 'certificate expiry unavailable'
  }
}

async function probeTcp(host: string, port: number, timeoutMs = 1000) {
  return await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port })

    const finish = (result: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function requestPage(url: string, redirectsRemaining = 4): Promise<RequestedPage> {
  return await new Promise<RequestedPage>((resolve, reject) => {
    const parsed = new URL(url)
    const requestFactory = parsed.protocol === 'https:' ? https.request : http.request
    const request = requestFactory(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : undefined,
        path: `${parsed.pathname}${parsed.search}`,
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
          accept: 'text/html,application/xhtml+xml'
        }
      },
      (response) => {
        const statusCode = response.statusCode ?? 0
        const location = response.headers.location

        if (statusCode >= 300 && statusCode < 400 && location && redirectsRemaining > 0) {
          response.resume()
          resolve(requestPage(new URL(location, parsed).toString(), redirectsRemaining - 1))
          return
        }

        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          if (body.length < 262_144) {
            body += chunk
          }
        })
        response.on('end', () => {
          const tls =
            parsed.protocol === 'https:'
              ? summarizeCertificate(response.socket as TLSSocket)
              : { enabled: false }

          resolve({
            statusCode,
            body,
            finalUrl: parsed.toString(),
            tls
          })
        })
      }
    )

    request.setTimeout(1500, () => {
      request.destroy(new Error('http diagnostics timeout'))
    })
    request.once('error', reject)
    request.end()
  })
}

function renderSnapshotSvg(input: {
  hostId: string
  ruleId?: string
  pageTitle?: string
  finalUrl: string
  capturedAt: string
  httpStatus?: number
}) {
  const title = escapeXml(input.pageTitle ?? 'PortManager diagnostic snapshot')
  const finalUrl = escapeXml(input.finalUrl)
  const host = escapeXml(input.hostId)
  const rule = escapeXml(input.ruleId ?? 'unbound')
  const capturedAt = escapeXml(input.capturedAt)
  const httpStatus = escapeXml(String(input.httpStatus ?? 'n/a'))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${DEFAULT_VIEWPORT.width}" height="${DEFAULT_VIEWPORT.height}" viewBox="0 0 ${DEFAULT_VIEWPORT.width} ${DEFAULT_VIEWPORT.height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#172126" />
      <stop offset="100%" stop-color="#3d4a52" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect x="40" y="40" width="1200" height="640" rx="28" fill="#f7f2e8" opacity="0.96" />
  <text x="84" y="118" fill="#7b4a24" font-family="IBM Plex Mono, monospace" font-size="22">PORTMANAGER SNAPSHOT</text>
  <text x="84" y="188" fill="#172126" font-family="Iowan Old Style, serif" font-size="44">${title}</text>
  <text x="84" y="256" fill="#4e5d65" font-family="IBM Plex Sans, sans-serif" font-size="24">host ${host} · rule ${rule}</text>
  <text x="84" y="308" fill="#4e5d65" font-family="IBM Plex Sans, sans-serif" font-size="24">status ${httpStatus}</text>
  <text x="84" y="380" fill="#172126" font-family="IBM Plex Mono, monospace" font-size="20">${finalUrl}</text>
  <text x="84" y="620" fill="#4e5d65" font-family="IBM Plex Mono, monospace" font-size="18">captured ${capturedAt}</text>
</svg>`
}

export function createLocalDiagnosticsPrimitive(options: { artifactRoot: string }) {
  const diagnosticsRoot = path.join(options.artifactRoot, 'diagnostics')

  mkdirSync(diagnosticsRoot, { recursive: true })

  return {
    async runDiagnostics(input: RunDiagnosticsInput): Promise<DiagnosticsPrimitiveResult> {
      const capturedAt = nowIso()
      const targetHost = '127.0.0.1'
      const baseUrl = `${input.scheme}://${targetHost}:${input.port}/`
      const tcpReachable = await probeTcp(targetHost, input.port)

      const operationDirectory = path.join(diagnosticsRoot, input.operationId)
      mkdirSync(operationDirectory, { recursive: true })

      if (!tcpReachable) {
        const diagnosticResult: PortDiagnosticResultSchema = {
          schemaVersion: SCHEMA_VERSION,
          hostId: input.hostId,
          ruleId: input.ruleId,
          port: input.port,
          tcpReachable,
          tls: {
            enabled: input.scheme === 'https'
          },
          capturedAt
        }

        writeFileSync(
          path.join(operationDirectory, 'diagnostic-result.json'),
          JSON.stringify(diagnosticResult, null, 2)
        )

        return {
          state: 'degraded',
          resultSummary: `tcp unreachable for ${input.hostId}:${input.port}`,
          diagnosticResult
        }
      }

      try {
        const page = await requestPage(baseUrl)
        const pageTitle = normalizeTitle(page.body)
        const diagnosticResult: PortDiagnosticResultSchema = {
          schemaVersion: SCHEMA_VERSION,
          hostId: input.hostId,
          ruleId: input.ruleId,
          port: input.port,
          tcpReachable,
          httpStatus: page.statusCode,
          pageTitle,
          finalUrl: page.finalUrl,
          tls: page.tls,
          capturedAt
        }

        writeFileSync(
          path.join(operationDirectory, 'diagnostic-result.json'),
          JSON.stringify(diagnosticResult, null, 2)
        )

        let snapshotResult: WebSnapshotResultSchema | undefined
        if (input.captureSnapshot) {
          const artifactPath = path.join(operationDirectory, 'page-snapshot.svg')
          snapshotResult = {
            schemaVersion: SCHEMA_VERSION,
            hostId: input.hostId,
            ruleId: input.ruleId,
            port: input.port,
            artifactPath,
            pageTitle,
            httpStatus: page.statusCode,
            viewport: DEFAULT_VIEWPORT,
            capturedAt
          }

          writeFileSync(
            artifactPath,
            renderSnapshotSvg({
              hostId: input.hostId,
              ruleId: input.ruleId,
              pageTitle,
              finalUrl: page.finalUrl,
              capturedAt,
              httpStatus: page.statusCode
            })
          )
          writeFileSync(
            path.join(operationDirectory, 'snapshot-result.json'),
            JSON.stringify(snapshotResult, null, 2)
          )
        }

        return {
          state: 'succeeded',
          resultSummary: `diagnostics captured for ${input.hostId}:${input.port}`,
          diagnosticResult,
          snapshotResult
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const diagnosticResult: PortDiagnosticResultSchema = {
          schemaVersion: SCHEMA_VERSION,
          hostId: input.hostId,
          ruleId: input.ruleId,
          port: input.port,
          tcpReachable,
          tls: {
            enabled: input.scheme === 'https',
            validitySummary: message
          },
          capturedAt
        }

        writeFileSync(
          path.join(operationDirectory, 'diagnostic-result.json'),
          JSON.stringify(diagnosticResult, null, 2)
        )

        return {
          state: 'degraded',
          resultSummary: `diagnostics failed after tcp connect for ${input.hostId}:${input.port}: ${message}`,
          diagnosticResult
        }
      }
    }
  }
}

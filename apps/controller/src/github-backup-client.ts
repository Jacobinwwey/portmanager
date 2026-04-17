import { Buffer } from 'node:buffer'

export interface GitHubBackupUploadInput {
  backupId: string
  hostId: string
  backupMode: 'best_effort' | 'required'
  createdAt: string
  bundle: string
}

export interface GitHubBackupUploadResult {
  githubStatus: 'not_configured' | 'succeeded' | 'failed'
  repo?: string
  remotePath?: string
  errorMessage?: string
}

export interface GitHubBackupClient {
  uploadBackupBundle(input: GitHubBackupUploadInput): Promise<GitHubBackupUploadResult>
}

function githubBackupEnabled(env: NodeJS.ProcessEnv) {
  const raw = env.PORTMANAGER_GITHUB_BACKUP_ENABLED?.trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on'
}

function validRepo(repo?: string) {
  const trimmed = repo?.trim()
  if (!trimmed) {
    return undefined
  }

  const segments = trimmed.split('/').filter(Boolean)
  return segments.length === 2 ? segments.join('/') : undefined
}

function encodeGitHubPath(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function createGitHubBackupClient(options: {
  apiBaseUrl?: string
  env?: NodeJS.ProcessEnv
  fetchImpl?: typeof fetch
} = {}): GitHubBackupClient {
  const apiBaseUrl = options.apiBaseUrl ?? 'https://api.github.com'
  const env = options.env ?? process.env
  const fetchImpl = options.fetchImpl ?? fetch

  return {
    async uploadBackupBundle(input) {
      const repo = validRepo(env.PORTMANAGER_GITHUB_BACKUP_REPO)
      const token = env.PORTMANAGER_GITHUB_BACKUP_TOKEN?.trim()

      if (!githubBackupEnabled(env) || !repo || !token) {
        return {
          githubStatus: 'not_configured'
        }
      }

      const remotePath = `portmanager-backups/${input.hostId}/${input.backupId}.bundle.json`
      const target = new URL(
        `/repos/${encodeGitHubPath(repo)}/contents/${encodeGitHubPath(remotePath)}`,
        apiBaseUrl
      )

      try {
        const response = await fetchImpl(target, {
          method: 'PUT',
          headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            'user-agent': 'PortManager Controller'
          },
          body: JSON.stringify({
            message: `PortManager backup ${input.backupId} (${input.backupMode})`,
            content: Buffer.from(input.bundle, 'utf8').toString('base64')
          })
        })

        if (!response.ok) {
          const body = await response.text()
          return {
            githubStatus: 'failed',
            repo,
            remotePath,
            errorMessage: `${response.status} ${body}`.trim()
          }
        }

        return {
          githubStatus: 'succeeded',
          repo,
          remotePath
        }
      } catch (error) {
        return {
          githubStatus: 'failed',
          repo,
          remotePath,
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}

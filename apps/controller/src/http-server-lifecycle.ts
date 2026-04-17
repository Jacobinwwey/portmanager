import type { Server } from 'node:http'

function isServerNotRunningError(error: unknown) {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ERR_SERVER_NOT_RUNNING'
  )
}

export async function closeHttpServer(server: Pick<Server, 'close' | 'listening'>) {
  if (!server.listening) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (!error || isServerNotRunningError(error)) {
        resolve()
        return
      }

      reject(error)
    })
  })
}

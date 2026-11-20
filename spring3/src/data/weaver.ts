export const WEAVER_BASE = '/weaver'

export class WeaverError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function weaverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'text/plain')
  }
  const response = await fetch(`${WEAVER_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = null
    }
  }
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `Weaver request failed (${response.status})`
    throw new WeaverError(message, response.status)
  }
  return data as T
}

export async function weaverPost<T>(path: string, body: unknown): Promise<T> {
  return weaverFetch<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })
}

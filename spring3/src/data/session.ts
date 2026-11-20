import { useSyncExternalStore } from 'react'
import { weaverFetch, weaverPost } from './weaver'

const STORE_KEY = 'SSOFI_Logged_User'

export type AuthInfo = {
  userId?: string
  userName?: string
  verified?: boolean
  providers?: string[]
  ss?: string
  challenge?: string
  token?: string
  msg?: string
}

export type SessionUser = {
  name: string
  key: string
  uid: string
  preferred: string
  timeZone: string
  description: string
  lastLogin: number
}

export type SessionWorkspace = {
  name: string
  pageKey: string
  siteKey: string
  comboKey: string
  parentKey: string
}

export type SessionStatus = 'loading' | 'signed-out' | 'signed-in' | 'error'

export type SessionSnapshot = {
  status: SessionStatus
  user: SessionUser | null
  workspaces: SessionWorkspace[]
  providerUrl: string
  error: string
}

type SessionResponse = {
  loggedIn?: boolean
  user?: Partial<SessionUser>
  workspaces?: Partial<SessionWorkspace>[]
}

const listeners = new Set<() => void>()

let snapshot: SessionSnapshot = {
  status: 'loading',
  user: null,
  workspaces: [],
  providerUrl: '',
  error: '',
}

let loginInfo: AuthInfo = {}
let startup: Promise<void> | null = null

function emit() {
  listeners.forEach((listener) => listener())
}

function publish(next: SessionSnapshot) {
  snapshot = next
  emit()
}

function readStored(): AuthInfo {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as AuthInfo
  } catch {
    return {}
  }
}

function storeAuth(next: AuthInfo) {
  if (!next.ss && loginInfo.ss) {
    next.ss = loginInfo.ss
  }
  loginInfo = next
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(next))
  } catch {
    // The handshake still works for this page load.
  }
}

function mergeAuth(current: AuthInfo, incoming: AuthInfo): AuthInfo {
  return { ...current, ...incoming, ss: incoming.ss || current.ss }
}

function withSession(url: string) {
  if (!loginInfo.ss) {
    return url
  }
  const join = url.includes('?') ? '&' : '?'
  return `${url}${join}ss=${encodeURIComponent(loginInfo.ss)}`
}

async function readJson(url: string, init?: RequestInit): Promise<AuthInfo> {
  const response = await fetch(url, { ...init, credentials: 'include' })
  const data = (await response.json()) as AuthInfo
  return data
}

function asUser(raw: Partial<SessionUser> | undefined): SessionUser | null {
  if (!raw?.key || !raw.name) {
    return null
  }
  return {
    name: raw.name,
    key: raw.key,
    uid: raw.uid ?? '',
    preferred: raw.preferred ?? '',
    timeZone: raw.timeZone ?? '',
    description: raw.description ?? '',
    lastLogin: raw.lastLogin ?? 0,
  }
}

function asWorkspaces(rows: Partial<SessionWorkspace>[] | undefined): SessionWorkspace[] {
  return (rows ?? []).flatMap((row) => {
    if (!row.siteKey || !row.pageKey) {
      return []
    }
    return [
      {
        name: row.name || 'Untitled workspace',
        pageKey: row.pageKey,
        siteKey: row.siteKey,
        comboKey: row.comboKey || `${row.siteKey}/${row.pageKey}`,
        parentKey: row.parentKey || '',
      },
    ]
  })
}

async function loadWorkspaceSession() {
  const data = await weaverFetch<SessionResponse>('/v/session.json')
  const user = data.loggedIn ? asUser(data.user) : null
  if (!user) {
    publish({ ...snapshot, status: 'signed-out', user: null, workspaces: [], error: '' })
    return
  }
  publish({
    status: 'signed-in',
    user,
    workspaces: asWorkspaces(data.workspaces),
    providerUrl: snapshot.providerUrl,
    error: '',
  })
}

async function finishLogin(info: AuthInfo) {
  const challenge = await weaverPost<AuthInfo>('/auth/getChallenge', info)
  info = mergeAuth(info, challenge)
  storeAuth(info)
  const token = await readJson(withSession(`${snapshot.providerUrl}?openid.mode=apiGenerate`), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
    body: JSON.stringify(info),
  })
  info = mergeAuth(info, token)
  storeAuth(info)
  const verified = await weaverPost<AuthInfo>('/auth/verifyToken', info)
  info = mergeAuth(info, verified)
  storeAuth(info)
  if (info.userId || info.verified) {
    await loadWorkspaceSession()
    return
  }
  publish({ ...snapshot, status: 'signed-out', user: null, workspaces: [], error: '' })
}

async function runSession() {
  publish({ ...snapshot, status: 'loading', error: '' })
  loginInfo = readStored()
  try {
    const server = await weaverFetch<AuthInfo>('/auth/query')
    loginInfo = mergeAuth(loginInfo, server)
    storeAuth(loginInfo)
    const providerUrl = server.providers?.[0] || snapshot.providerUrl
    publish({ ...snapshot, providerUrl, status: 'loading' })
    if (server.userId) {
      await loadWorkspaceSession()
      return
    }
    if (providerUrl) {
      const who = await readJson(withSession(`${providerUrl}?openid.mode=apiWho`))
      loginInfo = mergeAuth(loginInfo, who)
      storeAuth(loginInfo)
      if (who.userId) {
        await finishLogin(loginInfo)
        return
      }
    }
    publish({ ...snapshot, status: 'signed-out', user: null, workspaces: [], providerUrl, error: '' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reach Weaver.'
    publish({ ...snapshot, status: 'error', error: message })
  }
}

export function startSession() {
  if (!startup) {
    startup = runSession()
  }
  return startup
}

export function loginRedirect() {
  const provider = snapshot.providerUrl
  if (!provider) {
    return
  }
  const target = withSession(
    `${provider}?openid.mode=quick&go=${encodeURIComponent(window.location.href)}`,
  )
  window.location.assign(target)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return ''
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

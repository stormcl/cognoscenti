import { useSyncExternalStore } from 'react'

/** Role id. `color` is reserved so a color can be added later. Nothing reads it for paint. */
export type RoleId = 'steward' | 'member'

export type RoleDefinition = {
  id: RoleId
  label: string
  color: string
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  steward: { id: 'steward', label: 'Steward', color: '' },
  member: { id: 'member', label: 'Member', color: '' },
}

export type ProfileMembership = {
  workspaceId: string
  workspaceKey: string
  workspaceName: string
  path: string
  role: RoleId
}

export type ProfileTheme = 'default'

export type Profile = {
  slug: string
  initials: string
  name: string
  you?: boolean
  /** Preferred email. Legacy field `preferred`. */
  email: string
  timeZone: string
  /** Legacy field `description`. */
  description: string
  /** Legacy field `key`. Stable user key from Weaver. */
  key: string
  /** Legacy field `lastLogin`, milliseconds. */
  lastLogin: number
  theme: ProfileTheme
  memberships: ProfileMembership[]
}

export type ProfileDraft = {
  name: string
  email: string
  timeZone: string
  description: string
  theme: ProfileTheme
}

export const PROFILE_TIMEZONES = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York']

export const PROFILE_THEMES: { id: ProfileTheme; label: string }[] = [{ id: 'default', label: 'Default' }]

export function profileSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function profilePath(name: string, workspaceId?: string) {
  return profileHref(profileSlug(name), workspaceId)
}

export function profileHref(slug: string, workspaceId?: string) {
  const path = `/profile/${slug}`
  return workspaceId ? `${path}?workspace=${encodeURIComponent(workspaceId)}` : path
}

export function directoryPath(workspaceId?: string | null) {
  if (!workspaceId) {
    return '/profile'
  }
  return `/profile?workspace=${encodeURIComponent(workspaceId)}`
}

let profiles: Profile[] = []
let snapshot: Profile[] = []
const listeners = new Set<() => void>()

function publish() {
  snapshot = profiles
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getProfiles() {
  return snapshot
}

export function replaceProfiles(rows: Profile[]) {
  profiles = rows
  publish()
}

export function useProfiles() {
  return useSyncExternalStore(subscribe, getProfiles, getProfiles)
}

export function useProfile(slug: string | undefined) {
  const rows = useProfiles()
  if (!slug) {
    return undefined
  }
  return rows.find((profile) => profile.slug === slug)
}

export function profileBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined
  }
  return snapshot.find((profile) => profile.slug === slug)
}

export function saveOwnProfile(draft: ProfileDraft) {
  return draft
}

export function ownDraft(profile: Profile): ProfileDraft {
  return {
    name: profile.name,
    email: profile.email,
    timeZone: profile.timeZone,
    description: profile.description,
    theme: profile.theme,
  }
}

export function formatLastLogin(ms: number) {
  if (!ms) {
    return ''
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(ms)
}

export function themeLabel(theme: ProfileTheme) {
  return PROFILE_THEMES.find((row) => row.id === theme)?.label ?? 'Default'
}

export function hasRole(profile: Profile, role: RoleId) {
  return profile.memberships.some((row) => row.role === role)
}

import { useSyncExternalStore } from 'react'
import { TEST_USERS, WORKSPACE_MEMBERS, type CircleId } from './testdata'
import { workspaces } from './workspaces'

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
  workspaceId: CircleId
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
  /** Legacy field `key`. Stable demo key, not a secret. */
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

const CIRCLE_ORDER: CircleId[] = ['organization', 'ux', 'dev', 'branding', 'marketing', 'logistics']

export const PROFILE_TIMEZONES = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York']

export const PROFILE_THEMES: { id: ProfileTheme; label: string }[] = [{ id: 'default', label: 'Default' }]

const PLACEHOLDER_BIO = 'This is where a user can type their bio'

/** A few people hold a different role in one workspace, so the badges can show both. */
const ROLE_OVERRIDE: Record<string, Partial<Record<CircleId, RoleId>>> = {
  'Jane Doe': { dev: 'member' },
  'Wren Maple': { organization: 'member' },
}

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

function membershipsFor(name: string, fallback: RoleId): ProfileMembership[] {
  const overrides = ROLE_OVERRIDE[name]
  return CIRCLE_ORDER.filter((id) => WORKSPACE_MEMBERS[id].includes(name)).map((id) => ({
    workspaceId: id,
    workspaceKey: id,
    workspaceName: workspaces[id].name,
    path: workspaces[id].path,
    role: overrides?.[id] ?? fallback,
  }))
}

const BASE_PROFILES: Profile[] = TEST_USERS.map((user, index) => ({
  slug: profileSlug(user.name),
  initials: user.initials,
  name: user.name,
  you: user.you,
  email: `${profileSlug(user.name).replace(/-/g, '.')}@class.example`,
  timeZone: user.you ? 'America/Los_Angeles' : PROFILE_TIMEZONES[index % PROFILE_TIMEZONES.length],
  description: user.you ? '(Add Bio)' : PLACEHOLDER_BIO,
  key: `demo-${profileSlug(user.name)}`,
  lastLogin: Date.UTC(2026, 9, 28 - (index % 18), 15 + (index % 6), (index * 11) % 60),
  theme: 'default',
  memberships: membershipsFor(user.name, user.role),
}))

let overlay: ProfileDraft | null = null
let snapshot: Profile[] = BASE_PROFILES
const listeners = new Set<() => void>()

function applyOverlay(profile: Profile): Profile {
  if (!profile.you || !overlay) {
    return profile
  }
  return { ...profile, ...overlay }
}

function publish() {
  snapshot = BASE_PROFILES.map(applyOverlay)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getProfiles() {
  return snapshot
}

export function useProfiles() {
  return useSyncExternalStore(subscribe, getProfiles, getProfiles)
}

export function useProfile(slug: string | undefined) {
  const profiles = useProfiles()
  if (!slug) {
    return undefined
  }
  return profiles.find((profile) => profile.slug === slug)
}

export function profileBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined
  }
  return snapshot.find((profile) => profile.slug === slug)
}

export function saveOwnProfile(draft: ProfileDraft) {
  overlay = { ...draft }
  publish()
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
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  }).format(ms)
}

export function themeLabel(theme: ProfileTheme) {
  return PROFILE_THEMES.find((row) => row.id === theme)?.label ?? 'Default'
}

export function hasRole(profile: Profile, role: RoleId) {
  return profile.memberships.some((row) => row.role === role)
}

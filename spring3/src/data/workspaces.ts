import { useSyncExternalStore } from 'react'

export type WorkspaceId = string

export type MeetingRow = {
  id: string
  title: string
  meta: string
  tag?: string
  group: 'this' | 'related'
}

export type ActivityRow = {
  id: string
  title: string
  meta: string
  group: 'this' | 'related'
  tag?: string
}

export type UpdateKind = 'meeting' | 'discussion' | 'slides' | 'image' | 'doc'

export type RecentUpdate = {
  id: string
  title: string
  detail: string
  kind: UpdateKind
  date: string
  to: string
  icon: string
}

export type Person = {
  initials: string
  name: string
  role: 'steward' | 'member'
  you?: boolean
}

export type AssignedAction = {
  id: string
  title: string
  meta: string
  to: string
}

export type HierarchyRow = {
  name: string
  detail: string
  level: number
  path: string
}

export type ChildWorkspace = {
  path: string
  code: string
  name: string
  members: number
}

export type WorkspaceDemo = {
  id: WorkspaceId
  path: string
  code: string
  name: string
  members: number
  documentCount: number
  openActions: number
  stewards: number
  description: string
  activityLabel: string
  siteKey: string
  pageKey: string
  nextMeeting: {
    title: string
    when: string
    month: string
    day: string
    to: string
    zoomLabel: string
    zoomCopy: string
  }
  documents: { title: string; meta: string; type: string; date: string; icon: string }[]
  meetings: MeetingRow[]
  actionItems: ActivityRow[]
  discussions: ActivityRow[]
  updates: RecentUpdate[]
  people: Person[]
  myActionItems: AssignedAction[]
  breadcrumbs: { label: string; path?: string }[]
  hierarchy: HierarchyRow[]
  children: ChildWorkspace[]
}

const listeners = new Set<() => void>()
let records: WorkspaceDemo[] = []

export function emptyWorkspace(partial?: Partial<WorkspaceDemo>): WorkspaceDemo {
  return {
    id: '',
    path: '/',
    code: 'CW',
    name: 'Your workspaces',
    members: 0,
    documentCount: 0,
    openActions: 0,
    stewards: 0,
    description: '',
    activityLabel: '',
    siteKey: '',
    pageKey: '',
    nextMeeting: {
      title: 'No meeting scheduled',
      when: '',
      month: '',
      day: '',
      to: '/meetings',
      zoomLabel: '',
      zoomCopy: '',
    },
    documents: [],
    meetings: [],
    actionItems: [],
    discussions: [],
    updates: [],
    people: [],
    myActionItems: [],
    breadcrumbs: [{ label: 'Your workspaces' }],
    hierarchy: [],
    children: [],
    ...partial,
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

export function listWorkspaceDemos() {
  return records
}

export function replaceWorkspaces(next: WorkspaceDemo[]) {
  records = next
  emit()
}

export function upsertWorkspace(next: WorkspaceDemo) {
  const index = records.findIndex((row) => row.id === next.id)
  records = index === -1 ? [...records, next] : records.map((row) => (row.id === next.id ? next : row))
  emit()
}

export function workspaceById(id: string | null | undefined) {
  if (!id) {
    return undefined
  }
  return records.find((row) => row.id === id)
}

export function workspacePath(siteKey: string, pageKey: string) {
  return `/w/${encodeURIComponent(siteKey)}/${encodeURIComponent(pageKey)}`
}

export function workspaceIdFor(siteKey: string, pageKey: string) {
  return `${siteKey}/${pageKey}`
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return records
}

export function useWorkspaces() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function workspaceFromPath(pathname: string): WorkspaceDemo {
  const match = pathname.match(/^\/w\/([^/]+)\/([^/]+)/)
  if (match) {
    const id = workspaceIdFor(decodeURIComponent(match[1]), decodeURIComponent(match[2]))
    return workspaceById(id) ?? emptyWorkspace({ id, siteKey: decodeURIComponent(match[1]), pageKey: decodeURIComponent(match[2]), path: pathname })
  }
  return records[0] ?? emptyWorkspace()
}

export function workspaceFromLocation(pathname: string, search: string): WorkspaceDemo {
  const requested = new URLSearchParams(search).get('workspace')
  if (requested) {
    return workspaceById(requested) ?? workspaceFromPath(pathname)
  }
  return workspaceFromPath(pathname)
}

export function normalizeWorkspaceId(id: string | null | undefined): WorkspaceId {
  return id ?? ''
}

export type SwitcherEntry = ChildWorkspace & {
  kind: 'parent' | 'child'
  current: boolean
}

export function switcherTree(workspace: WorkspaceDemo): { parent: SwitcherEntry; teams: SwitcherEntry[] } {
  return {
    parent: {
      path: '/',
      code: 'CW',
      name: 'Your workspaces',
      members: records.length,
      kind: 'parent',
      current: workspace.path === '/',
    },
    teams: records.map((row) => ({
      path: row.path,
      code: row.code,
      name: row.name,
      members: row.members,
      kind: 'child' as const,
      current: row.id !== '' && row.id === workspace.id,
    })),
  }
}

import { replaceDiscussions, type Discussion } from './discussions'
import { replaceDocuments, setDocumentOwner, type DocKind, type WorkspaceDocument } from './documents'
import { replaceMeetings, type Meeting, type MeetingStatus } from './meetings'
import { replaceProfiles, type Profile } from './profiles'
import { initialsFor, type SessionUser, type SessionWorkspace } from './session'
import { weaverFetch } from './weaver'
import {
  emptyWorkspace,
  replaceWorkspaces,
  upsertWorkspace,
  workspaceById,
  workspaceIdFor,
  workspacePath,
  type Person,
  type RecentUpdate,
  type WorkspaceDemo,
} from './workspaces'

type WeaverMeeting = {
  id?: string
  name?: string
  state?: number
  startTime?: number
  description?: string
  conferenceUrl?: string
  rollCall?: { uid?: string; key?: string; attend?: string; situation?: string }[]
}

type WeaverDoc = {
  id?: string
  name?: string
  description?: string
  attType?: string
  size?: number
  modifiedtime?: number
  deleted?: boolean
  modifier?: { name?: string }
  url?: string
}

type WeaverTopic = {
  id?: string
  subject?: string
  draft?: boolean
  modTime?: number
  modUser?: { name?: string }
}

type WeaverPerson = {
  name?: string
  uid?: string
  key?: string
}

function meetingStatus(state: number | undefined): MeetingStatus {
  if (state === 0) {
    return 'draft'
  }
  if (state === 2) {
    return 'running'
  }
  if (state === 3) {
    return 'completed'
  }
  return 'planning'
}

function clock(ms: number | undefined) {
  if (!ms) {
    return { date: '', time: '' }
  }
  const value = new Date(ms)
  const date = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  const time = `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

function shortDate(ms: number | undefined) {
  if (!ms) {
    return ''
  }
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function docKind(doc: WeaverDoc): { kind: DocKind; extension: string } {
  const name = doc.name ?? ''
  const extension = name.includes('.') ? (name.split('.').pop() ?? '').toLowerCase() : ''
  if (doc.attType === 'URL' || doc.url) {
    return { kind: 'link', extension: extension || 'link' }
  }
  if (extension === 'ppt' || extension === 'pptx') {
    return { kind: 'slides', extension }
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
    return { kind: 'image', extension }
  }
  if (extension === 'pdf') {
    return { kind: 'pdf', extension }
  }
  return { kind: 'doc', extension }
}

function sizeLabel(bytes: number | undefined) {
  if (!bytes) {
    return ''
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function shellFromSession(row: SessionWorkspace): WorkspaceDemo {
  const path = workspacePath(row.siteKey, row.pageKey)
  return emptyWorkspace({
    id: workspaceIdFor(row.siteKey, row.pageKey),
    path,
    code: initialsFor(row.name) || 'WS',
    name: row.name,
    siteKey: row.siteKey,
    pageKey: row.pageKey,
    activityLabel: row.name,
    breadcrumbs: [{ label: row.name }],
    hierarchy: [{ name: row.name, detail: '', level: 0, path }],
  })
}

export function showSessionWorkspaces(rows: SessionWorkspace[], you: SessionUser | null) {
  if (you) {
    setDocumentOwner(you.name, initialsFor(you.name))
  }
  replaceWorkspaces(rows.map(shellFromSession))
}

export function clearLiveData() {
  replaceWorkspaces([])
  replaceMeetings([])
  replaceDocuments([])
  replaceDiscussions([])
  replaceProfiles([])
  setDocumentOwner('', '')
}

export async function openWorkspace(siteKey: string, pageKey: string, you: SessionUser | null) {
  const id = workspaceIdFor(siteKey, pageKey)
  const encodedSite = encodeURIComponent(siteKey)
  const encodedPage = encodeURIComponent(pageKey)
  const [meetingBody, docBody, topics, peopleBody] = await Promise.all([
    weaverFetch<{ meetings?: WeaverMeeting[] }>(`/v/${encodedSite}/${encodedPage}/meetingList.json`),
    weaverFetch<{ docs?: WeaverDoc[] }>(`/v/${encodedSite}/${encodedPage}/docsList.json`),
    weaverFetch<WeaverTopic[]>(`/v/${encodedSite}/${encodedPage}/getTopics.json`),
    weaverFetch<{ people?: WeaverPerson[] }>(`/v/${encodedSite}/$/SitePeople.json`),
  ])

  const meetings = (meetingBody.meetings ?? [])
    .filter((row) => row.id)
    .map((row) => mapMeeting(row, id))
  const documents = (docBody.docs ?? [])
    .filter((row) => row.id && !row.deleted)
    .map((row) => mapDocument(row, id))
  const discussions = (Array.isArray(topics) ? topics : [])
    .filter((row) => row.id)
    .map((row) => mapTopic(row, id))
  const profiles = (peopleBody.people ?? [])
    .filter((row) => row.name || row.key)
    .map((row) => mapPerson(row, id, you))

  replaceMeetings(meetings)
  replaceDocuments(documents)
  replaceDiscussions(discussions)
  replaceProfiles(profiles)
  upsertWorkspace(fillWorkspace(siteKey, pageKey, meetings, documents, discussions, profiles))
}

function mapMeeting(row: WeaverMeeting, workspaceId: string): Meeting {
  const when = clock(row.startTime)
  return {
    id: row.id ?? '',
    name: row.name || 'Untitled meeting',
    date: when.date,
    startTime: when.time,
    timezone: '',
    description: row.description ?? '',
    zoomLink: row.conferenceUrl ?? '',
    reminderDate: '',
    reminderTime: '',
    reminderTimezone: '',
    exportMode: '',
    agenda: [],
    participants: (row.rollCall ?? []).map((person, index) => ({
      id: person.key || person.uid || `roll-${index}`,
      name: person.uid || person.key || 'Participant',
      role: '',
      attended: person.attend === 'yes' || person.attend === 'no' ? person.attend : 'none',
      expected: 'none' as const,
      note: person.situation ?? '',
      timeProposal: '',
    })),
    facilitator: '',
    notetaker: '',
    timekeeper: '',
    files: [],
    minutes: '',
    agendaDocument: '',
    status: meetingStatus(row.state),
    workspaceId,
  }
}

function mapDocument(row: WeaverDoc, workspaceId: string): WorkspaceDocument {
  const kind = docKind(row)
  const when = clock(row.modifiedtime)
  const owner = row.modifier?.name || ''
  return {
    id: row.id ?? '',
    workspaceId,
    name: row.name || 'Untitled document',
    description: row.description ?? '',
    kind: kind.kind,
    extension: kind.extension,
    sizeLabel: sizeLabel(row.size),
    ownerName: owner,
    ownerInitials: initialsFor(owner),
    createdAt: when.date ? `${when.date}T${when.time || '00:00'}` : '',
    updatedAt: when.date ? `${when.date}T${when.time || '00:00'}` : '',
    href: row.url ?? '',
    notify: false,
  }
}

function mapTopic(row: WeaverTopic, workspaceId: string): Discussion {
  const author = row.modUser?.name || ''
  return {
    id: row.id ?? '',
    title: row.subject || 'Untitled discussion',
    summary: '',
    body: '',
    status: row.draft ? 'draft' : 'open',
    authorName: author,
    authorInitials: initialsFor(author),
    replies: null,
    lastActivity: shortDate(row.modTime),
    workspaceId,
  }
}

function mapPerson(row: WeaverPerson, workspaceId: string, you: SessionUser | null): Profile {
  const name = row.name || row.uid || 'Unnamed'
  const key = row.key || row.uid || name
  const email = row.uid && row.uid.includes('@') ? row.uid : ''
  return {
    slug: key,
    initials: initialsFor(name),
    name,
    you: Boolean(you && key === you.key),
    email,
    timeZone: you && key === you.key ? you.timeZone : '',
    description: you && key === you.key ? you.description : '',
    key,
    lastLogin: you && key === you.key ? you.lastLogin : 0,
    theme: 'default',
    memberships: [
      {
        workspaceId,
        workspaceKey: workspaceId,
        workspaceName: '',
        path: '',
        role: 'member',
      },
    ],
  }
}

function fillWorkspace(
  siteKey: string,
  pageKey: string,
  meetings: Meeting[],
  documents: WorkspaceDocument[],
  discussions: Discussion[],
  profiles: Profile[],
): WorkspaceDemo {
  const path = workspacePath(siteKey, pageKey)
  const id = workspaceIdFor(siteKey, pageKey)
  const known = workspaceById(id)
  const name = known?.name || pageKey
  const people: Person[] = profiles.map((profile) => ({
    initials: profile.initials,
    name: profile.name,
    role: 'member',
    you: profile.you,
  }))
  const upcoming = meetings
    .filter((row) => row.date && row.status !== 'completed' && row.status !== 'draft')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
  const next = upcoming[0]
  const nextParts = next?.date ? new Date(`${next.date}T${next.startTime || '00:00'}`) : null
  const updates: RecentUpdate[] = [
    ...meetings.slice(0, 4).map((row) => ({
      id: `meeting-${row.id}`,
      title: row.name,
      detail: row.description,
      kind: 'meeting' as const,
      date: row.date,
      to: `/meetings/${row.id}`,
      icon: '/calendar0.svg',
    })),
    ...discussions.slice(0, 4).map((row) => ({
      id: `topic-${row.id}`,
      title: row.title,
      detail: row.authorName,
      kind: 'discussion' as const,
      date: row.lastActivity,
      to: `/discussions?workspace=${encodeURIComponent(id)}`,
      icon: '/msg0.svg',
    })),
    ...documents.slice(0, 4).map((row) => ({
      id: `doc-${row.id}`,
      title: row.name,
      detail: row.ownerName,
      kind: row.kind === 'slides' || row.kind === 'image' ? row.kind : ('doc' as const),
      date: row.updatedAt.slice(0, 10),
      to: `/documents?workspace=${encodeURIComponent(id)}`,
      icon: row.kind === 'image' ? '/image0.svg' : row.kind === 'slides' ? '/slides0.svg' : '/file2.svg',
    })),
  ]
  return emptyWorkspace({
    id,
    path,
    siteKey,
    pageKey,
    code: known?.code || initialsFor(name) || 'WS',
    name,
    members: people.length,
    documentCount: documents.length,
    openActions: 0,
    stewards: 0,
    description: '',
    activityLabel: name,
    people,
    documents: documents.slice(0, 6).map((row) => ({
      title: row.name,
      meta: row.ownerName,
      type: row.kind,
      date: row.updatedAt.slice(0, 10),
      icon: row.kind === 'image' ? '/image0.svg' : '/file2.svg',
    })),
    meetings: meetings.slice(0, 8).map((row) => ({
      id: row.id,
      title: row.name,
      meta: row.date ? `${row.date} ${row.startTime}` : 'Date not set',
      group: 'this' as const,
    })),
    discussions: discussions.slice(0, 8).map((row) => ({
      id: row.id,
      title: row.title,
      meta: row.authorName,
      group: 'this' as const,
    })),
    updates,
    nextMeeting: next
      ? {
          title: next.name,
          when: `${next.date} ${next.startTime}`,
          month: nextParts ? nextParts.toLocaleDateString('en-US', { month: 'short' }) : '',
          day: nextParts ? String(nextParts.getDate()) : '',
          to: `/meetings/${next.id}`,
          zoomLabel: next.zoomLink.replace(/^https?:\/\//, ''),
          zoomCopy: next.zoomLink,
        }
      : emptyWorkspace().nextMeeting,
    breadcrumbs: [{ label: name }],
    hierarchy: [{ name, detail: '', level: 0, path }],
  })
}

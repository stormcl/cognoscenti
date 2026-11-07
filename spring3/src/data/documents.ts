import { useSyncExternalStore } from 'react'
import type { WorkspaceId } from './workspaces'

export type DocKind = 'pdf' | 'slides' | 'doc' | 'image' | 'link'

export type WorkspaceDocument = {
  id: string
  workspaceId: WorkspaceId
  name: string
  description: string
  kind: DocKind
  extension: string
  sizeLabel: string
  ownerName: string
  ownerInitials: string
  createdAt: string
  updatedAt: string
  href: string
  notify: boolean
}

export const YOU = {
  name: 'Users Name',
  initials: 'UN',
}

export const KIND_LABEL: Record<DocKind, string> = {
  pdf: 'PDF',
  slides: 'Slides',
  doc: 'Doc',
  image: 'Image',
  link: 'Link',
}

export const KIND_ICON: Record<DocKind, string> = {
  pdf: '/file2.svg',
  slides: '/slides0.svg',
  doc: '/file2.svg',
  image: '/image0.svg',
  link: '/globe0.svg',
}

const MAX_BYTES = 50 * 1024 * 1024
const ALLOWED = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'webp'])
const STORE_KEY = 'weaver-documents-v1'

type LinkInfo = {
  host: string
  title: string
  detail: string
  suggestedName: string
}

function row(
  partial: Omit<WorkspaceDocument, 'description' | 'href' | 'notify'> &
    Partial<Pick<WorkspaceDocument, 'description' | 'href' | 'notify'>>,
): WorkspaceDocument {
  return {
    description: '',
    href: '',
    notify: false,
    ...partial,
  }
}

const SEED: WorkspaceDocument[] = [
  row({
    id: 'ux-findings',
    workspaceId: 'ux',
    name: 'Front page findings',
    description: 'Heuristic analysis of the workspace front page.',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '4.2 MB',
    ownerName: 'Pia North',
    ownerInitials: 'PN',
    createdAt: '2026-10-12T16:00:00',
    updatedAt: '2026-10-12T16:00:00',
  }),
  row({
    id: 'ux-findings-2',
    workspaceId: 'ux',
    name: 'Front page findings 2',
    description: 'Second pass on the front page heuristics.',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '3.8 MB',
    ownerName: 'Pia North',
    ownerInitials: 'PN',
    createdAt: '2026-10-12T11:00:00',
    updatedAt: '2026-10-12T11:00:00',
  }),
  row({
    id: 'ux-journey-board',
    workspaceId: 'ux',
    name: 'Journey mapping board',
    description: 'Current and future state board.',
    kind: 'link',
    extension: 'miro.com',
    sizeLabel: 'external link',
    ownerName: 'Robin Quill',
    ownerInitials: 'RQ',
    createdAt: '2026-10-23T14:30:00',
    updatedAt: '2026-10-23T14:30:00',
    href: 'https://miro.com/app/board/ux/journey-mapping',
  }),
  row({
    id: 'ux-journeys',
    workspaceId: 'ux',
    name: 'User journey maps',
    description: 'Current and future state maps.',
    kind: 'pdf',
    extension: 'pdf',
    sizeLabel: '2.1 MB',
    ownerName: 'Robin Quill',
    ownerInitials: 'RQ',
    createdAt: '2026-10-11T09:00:00',
    updatedAt: '2026-10-11T09:00:00',
  }),
  row({
    id: 'ux-meeting-findings',
    workspaceId: 'ux',
    name: 'Meeting module findings',
    description: 'Heuristic notes on the meeting module.',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '5.0 MB',
    ownerName: 'Mira Finch',
    ownerInitials: 'MF',
    createdAt: '2026-10-10T15:00:00',
    updatedAt: '2026-10-10T15:00:00',
  }),
  row({
    id: 'ux-wireframes',
    workspaceId: 'ux',
    name: 'Wireframe notes',
    description: 'Low-fidelity pass on the workspace home.',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '180 KB',
    ownerName: 'Sage Hollow',
    ownerInitials: 'SH',
    createdAt: '2026-10-22T10:15:00',
    updatedAt: '2026-10-22T10:15:00',
  }),
  row({
    id: 'ux-persona',
    workspaceId: 'ux',
    name: 'Placeholder persona',
    description: 'Persona draft for review.',
    kind: 'image',
    extension: 'png',
    sizeLabel: '2.4 MB',
    ownerName: 'Mira Finch',
    ownerInitials: 'MF',
    createdAt: '2026-10-10T12:00:00',
    updatedAt: '2026-10-10T12:00:00',
  }),
  row({
    id: 'ux-checklist',
    workspaceId: 'ux',
    name: 'Heuristic checklist',
    kind: 'pdf',
    extension: 'pdf',
    sizeLabel: '640 KB',
    ownerName: 'Jane Doe',
    ownerInitials: 'JD',
    createdAt: '2026-10-08T09:30:00',
    updatedAt: '2026-10-08T09:30:00',
  }),
  row({
    id: 'ux-interviews',
    workspaceId: 'ux',
    name: 'Interview notes',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '88 KB',
    ownerName: 'Avery Loch',
    ownerInitials: 'AL',
    createdAt: '2026-10-06T13:00:00',
    updatedAt: '2026-10-06T13:00:00',
  }),
  row({
    id: 'ux-photos',
    workspaceId: 'ux',
    name: 'Workshop photos',
    kind: 'image',
    extension: 'png',
    sizeLabel: '6.1 MB',
    ownerName: 'Gray Wren',
    ownerInitials: 'GW',
    createdAt: '2026-10-04T17:00:00',
    updatedAt: '2026-10-04T17:00:00',
  }),
  row({
    id: 'ux-onboarding',
    workspaceId: 'ux',
    name: 'Onboarding research',
    kind: 'pdf',
    extension: 'pdf',
    sizeLabel: '1.1 MB',
    ownerName: 'Pia North',
    ownerInitials: 'PN',
    createdAt: '2026-10-02T11:00:00',
    updatedAt: '2026-10-02T11:00:00',
  }),
  row({
    id: 'ux-figjam',
    workspaceId: 'ux',
    name: 'Research FigJam',
    kind: 'link',
    extension: 'figma.com',
    sizeLabel: 'external link',
    ownerName: 'Users Name',
    ownerInitials: 'UN',
    createdAt: '2026-10-20T16:45:00',
    updatedAt: '2026-10-20T16:45:00',
    href: 'https://www.figma.com/board/ux/research',
  }),
  row({
    id: 'org-handbook',
    workspaceId: 'organization',
    name: 'Organization handbook',
    description: 'Shared policies for the class workspace.',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '1.6 MB',
    ownerName: 'Jane Doe',
    ownerInitials: 'JD',
    createdAt: '2026-10-08T10:00:00',
    updatedAt: '2026-10-08T10:00:00',
  }),
  row({
    id: 'org-plan',
    workspaceId: 'organization',
    name: 'Quarterly plan',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '8.4 MB',
    ownerName: 'Mira Finch',
    ownerInitials: 'MF',
    createdAt: '2026-10-06T10:00:00',
    updatedAt: '2026-10-06T10:00:00',
  }),
  row({
    id: 'org-chart',
    workspaceId: 'organization',
    name: 'Org chart',
    kind: 'image',
    extension: 'png',
    sizeLabel: '900 KB',
    ownerName: 'Jules Reed',
    ownerInitials: 'JR',
    createdAt: '2026-10-02T10:00:00',
    updatedAt: '2026-10-02T10:00:00',
  }),
  row({
    id: 'org-budget',
    workspaceId: 'organization',
    name: 'Budget overview',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '220 KB',
    ownerName: 'Casey Drift',
    ownerInitials: 'CD',
    createdAt: '2026-09-28T10:00:00',
    updatedAt: '2026-09-28T10:00:00',
  }),
  row({
    id: 'dev-api',
    workspaceId: 'dev',
    name: 'API checklist',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '96 KB',
    ownerName: 'Wren Maple',
    ownerInitials: 'WM',
    createdAt: '2026-10-14T10:00:00',
    updatedAt: '2026-10-14T10:00:00',
  }),
  row({
    id: 'dev-architecture',
    workspaceId: 'dev',
    name: 'Architecture sketch',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '3.3 MB',
    ownerName: 'Remy Oak',
    ownerInitials: 'RO',
    createdAt: '2026-10-09T10:00:00',
    updatedAt: '2026-10-09T10:00:00',
  }),
  row({
    id: 'brand-logo',
    workspaceId: 'branding',
    name: 'Logo kit',
    kind: 'image',
    extension: 'png',
    sizeLabel: '4.8 MB',
    ownerName: 'Jules Reed',
    ownerInitials: 'JR',
    createdAt: '2026-10-07T10:00:00',
    updatedAt: '2026-10-07T10:00:00',
  }),
  row({
    id: 'brand-tokens',
    workspaceId: 'branding',
    name: 'Color tokens',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '48 KB',
    ownerName: 'Ivy Wisp',
    ownerInitials: 'IW',
    createdAt: '2026-10-05T10:00:00',
    updatedAt: '2026-10-05T10:00:00',
  }),
  row({
    id: 'mkt-brief',
    workspaceId: 'marketing',
    name: 'Launch brief',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '310 KB',
    ownerName: 'Casey Drift',
    ownerInitials: 'CD',
    createdAt: '2026-10-13T10:00:00',
    updatedAt: '2026-10-13T10:00:00',
  }),
  row({
    id: 'mkt-copy',
    workspaceId: 'marketing',
    name: 'Site copy deck',
    kind: 'slides',
    extension: 'pptx',
    sizeLabel: '6.2 MB',
    ownerName: 'Dana Frost',
    ownerInitials: 'DF',
    createdAt: '2026-10-04T10:00:00',
    updatedAt: '2026-10-04T10:00:00',
  }),
  row({
    id: 'log-venue',
    workspaceId: 'logistics',
    name: 'Venue checklist',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '120 KB',
    ownerName: 'Morgan Moss',
    ownerInitials: 'MM',
    createdAt: '2026-10-15T10:00:00',
    updatedAt: '2026-10-15T10:00:00',
  }),
  row({
    id: 'log-supply',
    workspaceId: 'logistics',
    name: 'Supply inventory',
    kind: 'doc',
    extension: 'docx',
    sizeLabel: '74 KB',
    ownerName: 'Niko Vale',
    ownerInitials: 'NV',
    createdAt: '2026-10-03T10:00:00',
    updatedAt: '2026-10-03T10:00:00',
  }),
]

let documents = load()
const listeners = new Set<() => void>()

function load(): WorkspaceDocument[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) {
      return SEED
    }
    const parsed = JSON.parse(raw) as WorkspaceDocument[]
    return Array.isArray(parsed) ? parsed : SEED
  } catch {
    return SEED
  }
}

function emit() {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(documents))
  } catch {
    // The library still updates in memory if storage is unavailable.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getDocuments() {
  return documents
}

export function listDocuments(): WorkspaceDocument[] {
  return documents
}

export function useWorkspaceDocuments(workspaceId: WorkspaceId) {
  const all = useSyncExternalStore(subscribe, getDocuments, getDocuments)
  return all.filter((item) => item.workspaceId === workspaceId)
}

export function useDocumentCount(workspaceId: WorkspaceId) {
  return useWorkspaceDocuments(workspaceId).length
}

export function documentsPath(workspaceId: WorkspaceId, add?: 'file' | 'link') {
  const params = new URLSearchParams({ workspace: workspaceId })
  if (add) {
    params.set('add', add)
  }
  return `/documents?${params.toString()}`
}

export function addDocument(input: Omit<WorkspaceDocument, 'id'>): WorkspaceDocument {
  const item: WorkspaceDocument = { ...input, id: `doc-${Date.now()}` }
  documents = [item, ...documents]
  emit()
  return item
}

export function removeDocument(id: string) {
  documents = documents.filter((item) => item.id !== id)
  emit()
}

export function shortName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) {
    return name
  }
  return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}.`
}

export function extensionOf(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ext === name.toLowerCase() ? '' : ext
}

export function kindFromExtension(extension: string): DocKind {
  if (extension === 'pdf') {
    return 'pdf'
  }
  if (extension === 'ppt' || extension === 'pptx') {
    return 'slides'
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
    return 'image'
  }
  return 'doc'
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileError(file: File) {
  const extension = extensionOf(file.name)
  if (!ALLOWED.has(extension)) {
    return 'Use a PDF, DOCX, PPTX, PNG, or JPG up to 50 MB.'
  }
  if (file.size > MAX_BYTES) {
    return 'That file is over 50 MB.'
  }
  return ''
}

export function nameFromFile(fileName: string) {
  const extension = extensionOf(fileName)
  const base = extension ? fileName.slice(0, -(extension.length + 1)) : fileName
  return titleCase(base.replace(/[_-]+/g, ' ').trim()) || fileName
}

function titleCase(value: string) {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
}

export function parseStamp(iso: string) {
  const [date, time = '12:00:00'] = iso.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0)
}

export function nowStamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatDocDate(iso: string, now = new Date()) {
  const then = parseStamp(iso)
  if (now.getTime() - then.getTime() >= 0 && now.getTime() - then.getTime() < 60_000) {
    return 'Just now'
  }
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export type CreatedRange = 'any' | 'today' | 'last7' | 'lastWeek' | 'last30'

export function matchesCreated(iso: string, range: CreatedRange, now = new Date()) {
  if (range === 'any') {
    return true
  }
  const created = parseStamp(iso)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === 'today') {
    return created >= start
  }
  if (range === 'last7') {
    const from = new Date(start)
    from.setDate(start.getDate() - 6)
    return created >= from
  }
  if (range === 'last30') {
    const from = new Date(start)
    from.setDate(start.getDate() - 29)
    return created >= from
  }
  const mondayOffset = start.getDay() === 0 ? 6 : start.getDay() - 1
  const thisMonday = new Date(start)
  thisMonday.setDate(start.getDate() - mondayOffset)
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  return created >= lastMonday && created < thisMonday
}

export function describeLink(raw: string): LinkInfo | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null
  }
  const host = url.hostname.replace(/^www\./, '')
  const parts = url.pathname.split('/').filter(Boolean)
  const last = decodeURIComponent(parts[parts.length - 1] ?? '').replace(/[-_]+/g, ' ').trim()
  const suggestedName = titleCase(last || host)
  if (host.endsWith('miro.com')) {
    return { host, title: 'Miro board detected', detail: 'miro.com · opens in a new tab', suggestedName }
  }
  if (host.endsWith('figma.com')) {
    return { host, title: 'Figma file detected', detail: 'figma.com · opens in a new tab', suggestedName }
  }
  if (host.endsWith('google.com')) {
    return { host, title: 'Google file detected', detail: `${host} · opens in a new tab`, suggestedName }
  }
  if (host.endsWith('notion.so') || host.endsWith('notion.site')) {
    return { host, title: 'Notion page detected', detail: 'notion.so · opens in a new tab', suggestedName }
  }
  return { host, title: 'Link detected', detail: `${host} · opens in a new tab`, suggestedName }
}

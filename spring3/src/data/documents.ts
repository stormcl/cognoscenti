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
  name: '',
  initials: '',
}

export function setDocumentOwner(name: string, initials: string) {
  YOU.name = name
  YOU.initials = initials
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

type LinkInfo = {
  host: string
  title: string
  detail: string
  suggestedName: string
}

let documents: WorkspaceDocument[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function replaceDocuments(rows: WorkspaceDocument[]) {
  documents = rows
  emit()
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
  return { ...input, id: `unsaved-${Date.now()}` }
}

export function removeDocument(id: string) {
  documents.some((item) => item.id === id)
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

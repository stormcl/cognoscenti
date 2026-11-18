import { useSyncExternalStore } from 'react'

export type DiscussionStatus = 'open' | 'draft'

export type Discussion = {
  id: string
  title: string
  summary: string
  body: string
  status: DiscussionStatus
  authorName: string
  authorInitials: string
  replies: number | null
  lastActivity: string
  workspaceId: string
}

export const DEMO_COMPOSER = {
  subject: '',
  body: '',
}

export const SUBJECT_LIMIT = 80

const listeners = new Set<() => void>()
let discussions: Discussion[] = []

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getDiscussions() {
  return discussions
}

export function listDiscussions() {
  return discussions
}

export function replaceDiscussions(rows: Discussion[]) {
  discussions = rows
  emit()
}

export function useDiscussions() {
  return useSyncExternalStore(subscribe, getDiscussions, getDiscussions)
}

export const DEMO_DISCUSSIONS: Discussion[] = discussions

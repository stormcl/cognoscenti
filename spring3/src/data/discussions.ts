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
let discussions: Discussion[] = import.meta.env.DEV
  ? [
      {
        id: 'test-1',
        title: 'Improving mobile navigation',
        summary: 'Discussing improvements to navigation on smaller screens.',
        body: 'How can we make workspace navigation easier on mobile devices?',
        status: 'open',
        authorName: 'Jeanne',
        authorInitials: 'JT',
        replies: 4,
        lastActivity: '2026-11-17',
        workspaceId: '',
      },
      {
        id: 'test-2',
        title: 'Accessibility review',
        summary: 'Reviewing keyboard navigation and screen reader support.',
        body: 'We should test focus indicators and keyboard interactions.',
        status: 'draft',
        authorName: 'Jeanne',
        authorInitials: 'JT',
        replies: 0,
        lastActivity: '2026-11-16',
        workspaceId: '',
      },
      {
        id: 'test-3',
        title: 'Planning the next development sprint',
        summary: 'Identifying development priorities for the next release.',
        body: 'Which features should the development team prioritize?',
        status: 'open',
        authorName: 'Team Member',
        authorInitials: 'TM',
        replies: 7,
        lastActivity: '2026-11-15',
        workspaceId: '',
      },
    ]
  : []

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

// export function replaceDiscussions(rows: Discussion[]) {
//   discussions = rows
//   emit()
// }

export function replaceDiscussions(rows: Discussion[]) {
  // Preserve temporary test discussions during local development
  if (import.meta.env.DEV && rows.length === 0) {
    return
  }

  discussions = rows
  emit()
}

export function useDiscussions() {
  return useSyncExternalStore(subscribe, getDiscussions, getDiscussions)
}

export const DEMO_DISCUSSIONS: Discussion[] = discussions

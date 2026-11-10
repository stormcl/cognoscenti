import { useMemo } from 'react'
import { listDiscussions, useDiscussions } from './discussions'
import { listDocuments } from './documents'
import { listMeetings } from './meetings'
import { useProfiles, type Profile } from './profiles'

export type SearchHit = {
  id: string
  kind: 'profile' | 'meeting' | 'document' | 'discussion'
  title: string
  detail: string
  href: string
}

function includes(query: string, value: string) {
  return value.toLowerCase().includes(query)
}

export function searchProfiles(profiles: Profile[], query: string): SearchHit[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return []
  }
  return profiles
    .filter((profile) =>
      [profile.name, profile.email, profile.key].some((value) => includes(needle, value)),
    )
    .map((profile) => ({
      id: `profile-${profile.slug}`,
      kind: 'profile',
      title: profile.name,
      detail: `${profile.email} · ${profile.key}`,
      href: `/profile/${profile.slug}`,
    }))
}

export function searchWorkspace(query: string): SearchHit[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return []
  }

  const meetings: SearchHit[] = listMeetings()
    .filter((meeting) => includes(needle, meeting.name))
    .map((meeting) => ({
      id: `meeting-${meeting.id}`,
      kind: 'meeting',
      title: meeting.name,
      detail: meeting.date ? `${meeting.date} ${meeting.startTime}` : 'Draft',
      href: `/meetings/${meeting.id}`,
    }))

  const documents: SearchHit[] = listDocuments()
    .filter((doc) => includes(needle, `${doc.name} ${doc.ownerName}`))
    .map((doc) => ({
      id: `document-${doc.id}`,
      kind: 'document',
      title: doc.name,
      detail: doc.ownerName,
      href: `/documents?workspace=${doc.workspaceId}`,
    }))

  const discussions: SearchHit[] = listDiscussions().filter((topic) =>
    includes(needle, `${topic.title} ${topic.summary} ${topic.authorName}`),
  ).map((topic) => ({
    id: `discussion-${topic.id}`,
    kind: 'discussion',
    title: topic.title,
    detail: topic.authorName,
    href: '/discussions',
  }))

  return [...meetings, ...documents, ...discussions]
}

export function useSearch(query: string) {
  const profiles = useProfiles()
  const discussions = useDiscussions()
  return useMemo(
    () => ({
      people: searchProfiles(profiles, query),
      workspace: searchWorkspace(query),
    }),
    [profiles, discussions, query],
  )
}

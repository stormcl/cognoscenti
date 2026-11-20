import { useMemo } from 'react'
import { listDiscussions, useDiscussions } from './discussions'
import { listDocuments } from './documents'
import { listMeetings } from './meetings'
import { useProfiles, type Profile } from './profiles'
import { useWatchedSlugs } from './watch'
import { listWorkspaceDemos, workspaceById, useWorkspaces } from './workspaces'

/**
 * A notice shaped so it can later map onto a legacy user-cache item:
 * meetings, action items, proposals, or the watch list.
 */
export type NoticeKind = 'meeting' | 'actionItem' | 'proposal' | 'discussion' | 'document' | 'watch'

export type UserNotice = {
  id: string
  kind: NoticeKind
  title: string
  workspaceKey: string
  workspaceName: string
  actorName: string
  actorKey: string
  timestamp: string
  href: string
  source: 'workspace' | 'person'
}

const KIND_LABEL: Record<NoticeKind, string> = {
  meeting: 'Meeting',
  actionItem: 'Action item',
  proposal: 'Proposal',
  discussion: 'Discussion',
  document: 'Document',
  watch: 'Watch',
}

export function noticeKindLabel(kind: NoticeKind) {
  return KIND_LABEL[kind]
}

function workspaceName(id: string) {
  return workspaceById(id)?.name ?? id
}

function keyFor(profiles: Profile[], name: string) {
  return profiles.find((profile) => profile.name === name)?.key ?? ''
}

function stamp(isoDate: string, time = '12:00') {
  if (!isoDate) {
    return ''
  }
  return `${isoDate} ${time}`
}

function buildNotices(profiles: Profile[]): { workspace: UserNotice[]; person: UserNotice[] } {
  const workspace: UserNotice[] = []
  const person: UserNotice[] = []

  function add(notice: Omit<UserNotice, 'source'>, alsoPerson: boolean) {
    workspace.push({ ...notice, source: 'workspace' })
    if (alsoPerson && notice.actorKey) {
      person.push({ ...notice, id: `${notice.id}-person`, source: 'person' })
    }
  }

  for (const meeting of listMeetings()) {
    if (!meeting.date || meeting.status === 'completed' || meeting.status === 'draft') {
      continue
    }
    add(
      {
        id: `meeting-${meeting.id}`,
        kind: 'meeting',
        title: meeting.name,
        workspaceKey: meeting.workspaceId,
        workspaceName: workspaceName(meeting.workspaceId),
        actorName: meeting.facilitator,
        actorKey: keyFor(profiles, meeting.facilitator),
        timestamp: stamp(meeting.date, meeting.startTime),
        href: `/meetings/${meeting.id}`,
      },
      true,
    )
  }

  for (const topic of listDiscussions()) {
    add(
      {
        id: `discussion-${topic.id}`,
        kind: 'discussion',
        title: topic.title,
        workspaceKey: topic.workspaceId,
        workspaceName: workspaceName(topic.workspaceId),
        actorName: topic.authorName,
        actorKey: keyFor(profiles, topic.authorName),
        timestamp: topic.lastActivity,
        href: '/discussions',
      },
      true,
    )
  }

  for (const doc of listDocuments()) {
    add(
      {
        id: `document-${doc.id}`,
        kind: 'document',
        title: doc.name,
        workspaceKey: doc.workspaceId,
        workspaceName: workspaceName(doc.workspaceId),
        actorName: doc.ownerName,
        actorKey: keyFor(profiles, doc.ownerName),
        timestamp: doc.updatedAt.replace('T', ' ').slice(0, 16),
        href: `/documents?workspace=${doc.workspaceId}`,
      },
      true,
    )
  }

  for (const workspaceRow of listWorkspaceDemos()) {
    const id = workspaceRow.id
    for (const item of workspaceRow.actionItems) {
      if (item.group !== 'this') {
        continue
      }
      add(
        {
          id: `action-${id}-${item.id}`,
          kind: 'actionItem',
          title: item.title,
          workspaceKey: id,
          workspaceName: workspaceRow.name,
          actorName: '',
          actorKey: '',
          timestamp: item.meta,
          href: '/action-items',
        },
        false,
      )
    }
  }

  return { workspace, person }
}

export function useNotices() {
  const profiles = useProfiles()
  const watched = useWatchedSlugs()
  const discussions = useDiscussions()
  const spaces = useWorkspaces()

  return useMemo(() => {
    const built = buildNotices(profiles)
    const watchedKeys = new Set(
      profiles.filter((profile) => watched.includes(profile.slug)).map((profile) => profile.key),
    )
    return {
      fromPeople: built.person.filter((notice) => watchedKeys.has(notice.actorKey)),
      workspace: built.workspace,
    }
  }, [profiles, watched, discussions, spaces])
}

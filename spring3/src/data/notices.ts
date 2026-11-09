import { useMemo } from 'react'
import { DEMO_DISCUSSIONS } from './discussions'
import { listDocuments } from './documents'
import { listMeetings } from './meetings'
import { useProfiles, type Profile } from './profiles'
import { TEST_MEETING_PARTICIPANTS } from './testdata'
import { useWatchedSlugs } from './watch'
import { workspaces, type WorkspaceId } from './workspaces'

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

const WORKSPACE_IDS: WorkspaceId[] = ['organization', 'ux', 'dev', 'branding', 'marketing', 'logistics']

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
  if (id in workspaces) {
    return workspaces[id as WorkspaceId].name
  }
  return id
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

  for (const topic of DEMO_DISCUSSIONS) {
    add(
      {
        id: `discussion-${topic.id}`,
        kind: 'discussion',
        title: topic.title,
        workspaceKey: 'ux',
        workspaceName: workspaceName('ux'),
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

  for (const id of WORKSPACE_IDS) {
    const workspaceRow = workspaces[id]
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

  const proposal = TEST_MEETING_PARTICIPANTS.find((row) => row.timeProposal)
  if (proposal) {
    add(
      {
        id: 'proposal-time',
        kind: 'proposal',
        title: proposal.timeProposal,
        workspaceKey: 'ux',
        workspaceName: workspaceName('ux'),
        actorName: proposal.name,
        actorKey: keyFor(profiles, proposal.name),
        timestamp: proposal.timeProposal,
        href: '/meetings/dept-20',
      },
      true,
    )
  }

  return { workspace, person }
}

export function useNotices() {
  const profiles = useProfiles()
  const watched = useWatchedSlugs()

  return useMemo(() => {
    const built = buildNotices(profiles)
    const watchedKeys = new Set(
      profiles.filter((profile) => watched.includes(profile.slug)).map((profile) => profile.key),
    )
    return {
      fromPeople: built.person.filter((notice) => watchedKeys.has(notice.actorKey)),
      workspace: built.workspace,
    }
  }, [profiles, watched])
}

import { replaceDiscussions, type Discussion } from './discussions'
import { replaceDocuments, setDocumentOwner, type WorkspaceDocument } from './documents'
import { replaceMeetings, type Meeting } from './meetings'
import { replaceProfiles, type Profile } from './profiles'
import { peopleFor, TEST_MEETING_PARTICIPANTS, type CircleId } from './testdata'
import {
  emptyWorkspace,
  replaceWorkspaces,
  upsertWorkspace,
  workspaceIdFor,
  workspacePath,
  type WorkspaceDemo,
} from './workspaces'
import type { SessionUser, SessionWorkspace } from './session'

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return ''
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const SITE = 'ida'

type Team = {
  pageKey: string
  circle: CircleId
  code: string
  name: string
  description: string
  parent?: boolean
}

const TEAMS: Team[] = [
  {
    pageKey: 'organization',
    circle: 'organization',
    code: 'IDA',
    name: 'IDA Class Workspace',
    description:
      'Aim: Parent workspace for the Integrated Digital Agency class. Coordinate all teams, shared planning, and class-wide resources.',
    parent: true,
  },
  {
    pageKey: 'ux',
    circle: 'ux',
    code: 'UX',
    name: 'UX Team',
    description:
      'Aim: Redesign the Weaver workspace experience through heuristic evaluation, journey mapping and iterative wireframes.',
  },
  {
    pageKey: 'dev',
    circle: 'dev',
    code: 'DT',
    name: 'Dev Team',
    description: 'Aim: Build and maintain Weaver application features, APIs, and release quality.',
  },
  {
    pageKey: 'branding',
    circle: 'branding',
    code: 'BT',
    name: 'Branding Team',
    description: 'Aim: Keep Weaver visual identity consistent across product, decks, and marketing.',
  },
  {
    pageKey: 'marketing',
    circle: 'marketing',
    code: 'MT',
    name: 'Marketing Team',
    description: 'Aim: Tell the Weaver story across campaigns, launch notes, and public pages.',
  },
  {
    pageKey: 'logistics',
    circle: 'logistics',
    code: 'LT',
    name: 'Logistics Team',
    description: 'Aim: Coordinate events, supplies, rooms, and meeting operations for the organization.',
  },
]

type SeedBundle = {
  team: Team
  meeting: { id: string; name: string; date: string; startTime: string; description: string }
  documents: { id: string; name: string; kind: WorkspaceDocument['kind']; owner: string; updatedAt: string }[]
  discussions: { id: string; title: string; author: string; lastActivity: string }[]
  actionTitle: string
  actionMeta: string
}

const SEEDS: SeedBundle[] = [
  {
    team: TEAMS[0],
    meeting: {
      id: 'org-planning',
      name: 'Organization Planning Meeting',
      date: '2026-10-27',
      startTime: '10:00',
      description: 'Agenda: 4 items',
    },
    documents: [
      { id: 'org-handbook', name: 'Organization handbook', kind: 'doc', owner: 'Jane Doe', updatedAt: '2026-10-08T12:00' },
      { id: 'org-plan', name: 'Quarterly plan', kind: 'slides', owner: 'Mira Finch', updatedAt: '2026-10-06T12:00' },
      { id: 'org-chart', name: 'Org chart', kind: 'image', owner: 'Jules Reed', updatedAt: '2026-10-02T12:00' },
    ],
    discussions: [
      { id: 'org-calendar', title: 'Shared organization calendar', author: 'Wren Maple', lastActivity: 'Oct 20' },
    ],
    actionTitle: 'Publish organization goals for fall',
    actionMeta: 'Due Oct 30',
  },
  {
    team: TEAMS[1],
    meeting: {
      id: '5th-child-group',
      name: '5th UX Team Meeting',
      date: '2026-10-22',
      startTime: '16:30',
      description: 'Agenda: 5 items',
    },
    documents: [
      { id: 'ux-findings', name: 'Front page findings', kind: 'slides', owner: 'Pia North', updatedAt: '2026-10-12T12:00' },
      { id: 'ux-journeys', name: 'User journey maps', kind: 'slides', owner: 'Robin Quill', updatedAt: '2026-10-11T12:00' },
      { id: 'ux-persona', name: 'Placeholder persona', kind: 'image', owner: 'Mira Finch', updatedAt: '2026-10-10T12:00' },
      { id: 'ux-wireframes', name: 'Wireframe notes', kind: 'doc', owner: 'Sage Hollow', updatedAt: '2026-10-09T12:00' },
    ],
    discussions: [
      { id: 'async-api', title: 'Proposal: switch to async API pattern', author: 'Pia North', lastActivity: 'Today' },
      { id: 'agenda-template', title: 'Shared agenda template', author: 'Robin Quill', lastActivity: 'Oct 21' },
    ],
    actionTitle: 'Draft journey map for onboarding',
    actionMeta: 'Due Oct 24',
  },
  {
    team: TEAMS[2],
    meeting: {
      id: 'dev-sprint',
      name: 'Sprint planning',
      date: '2026-10-28',
      startTime: '11:00',
      description: 'Agenda: 6 items',
    },
    documents: [
      { id: 'dev-api', name: 'API checklist', kind: 'doc', owner: 'Wren Maple', updatedAt: '2026-10-14T12:00' },
      { id: 'dev-arch', name: 'Architecture sketch', kind: 'slides', owner: 'Remy Oak', updatedAt: '2026-10-09T12:00' },
    ],
    discussions: [
      { id: 'async-api-dev', title: 'Proposal: switch to async API pattern', author: 'Remy Oak', lastActivity: 'Oct 21' },
    ],
    actionTitle: 'Stabilize live transcript stream',
    actionMeta: 'Due Oct 29',
  },
  {
    team: TEAMS[3],
    meeting: {
      id: 'brand-review',
      name: 'Brand review',
      date: '2026-10-29',
      startTime: '14:00',
      description: 'Agenda: 3 items',
    },
    documents: [
      { id: 'brand-logo', name: 'Logo kit', kind: 'image', owner: 'Jules Reed', updatedAt: '2026-10-07T12:00' },
      { id: 'brand-tokens', name: 'Color tokens', kind: 'doc', owner: 'Ivy Wisp', updatedAt: '2026-10-05T12:00' },
    ],
    discussions: [{ id: 'wordmark', title: 'Weaver Scribe wordmark', author: 'Ivy Wisp', lastActivity: 'Today' }],
    actionTitle: 'Align sidebar icons with the kit',
    actionMeta: 'Due Nov 4',
  },
  {
    team: TEAMS[4],
    meeting: {
      id: 'campaign-standup',
      name: 'Campaign standup',
      date: '2026-10-31',
      startTime: '09:30',
      description: 'Agenda: 4 items',
    },
    documents: [
      { id: 'mkt-brief', name: 'Launch brief', kind: 'doc', owner: 'Casey Drift', updatedAt: '2026-10-13T12:00' },
      { id: 'mkt-copy', name: 'Site copy deck', kind: 'slides', owner: 'Dana Frost', updatedAt: '2026-10-04T12:00' },
    ],
    discussions: [
      { id: 'tone-guide', title: 'Tone of voice for Ask Weaver', author: 'Dana Frost', lastActivity: 'Oct 18' },
    ],
    actionTitle: 'Publish the fall launch brief',
    actionMeta: 'Due Nov 1',
  },
  {
    team: TEAMS[5],
    meeting: {
      id: 'ops-huddle',
      name: 'Ops huddle',
      date: '2026-10-30',
      startTime: '08:45',
      description: 'Agenda: 5 items',
    },
    documents: [
      { id: 'ops-venue', name: 'Venue checklist', kind: 'doc', owner: 'Morgan Moss', updatedAt: '2026-10-15T12:00' },
      { id: 'ops-supply', name: 'Supply inventory', kind: 'doc', owner: 'Niko Vale', updatedAt: '2026-10-03T12:00' },
    ],
    discussions: [{ id: 'hybrid-setup', title: 'Hybrid meeting kit', author: 'Morgan Moss', lastActivity: 'Oct 16' }],
    actionTitle: 'Book the Nov all-hands room',
    actionMeta: 'Due Oct 31',
  },
]

export const SANDBOX_USER: SessionUser = {
  name: 'Users Name',
  key: 'users-name',
  uid: 'users-name',
  preferred: 'users.name@example.com',
  timeZone: 'America/New_York',
  description: 'Steward for the class sandbox',
  lastLogin: Date.now(),
}

export function sandboxSessionWorkspaces(): SessionWorkspace[] {
  return TEAMS.map((team) => ({
    name: team.name,
    siteKey: SITE,
    pageKey: team.pageKey,
    comboKey: `${SITE}/${team.pageKey}`,
    parentKey: team.parent ? '' : `${SITE}/organization`,
  }))
}

function participants(): Meeting['participants'] {
  return TEST_MEETING_PARTICIPANTS.map((row, index) => ({
    id: `part-${index}`,
    name: row.name,
    role: row.role,
    attended: row.attended,
    expected: row.expected,
    note: row.note,
    timeProposal: row.timeProposal,
  }))
}

function asMeeting(seed: SeedBundle, workspaceId: string): Meeting {
  return {
    id: seed.meeting.id,
    name: seed.meeting.name,
    date: seed.meeting.date,
    startTime: seed.meeting.startTime,
    timezone: 'EST (US & Canada)',
    description: seed.meeting.description,
    zoomLink: 'https://zoom.us/j/meeting-id',
    reminderDate: '',
    reminderTime: '',
    reminderTimezone: '',
    exportMode: '',
    agenda: [
      { id: 'a1', title: 'Welcome', minutes: 5, actualMinutes: null, timerRunning: false, timerStartedAt: null, presenter: 'Jane Doe', notes: '' },
      { id: 'a2', title: 'Updates', minutes: 15, actualMinutes: null, timerRunning: false, timerStartedAt: null, presenter: 'Wren Maple', notes: '' },
      { id: 'a3', title: 'Decisions', minutes: 20, actualMinutes: null, timerRunning: false, timerStartedAt: null, presenter: 'Pia North', notes: '' },
    ],
    participants: participants(),
    facilitator: 'Jane Doe',
    notetaker: 'Wren Maple',
    timekeeper: 'Robin Quill',
    files: [],
    minutes: '',
    agendaDocument: '',
    status: 'planned',
    workspaceId,
  }
}

function asDocuments(seed: SeedBundle, workspaceId: string): WorkspaceDocument[] {
  return seed.documents.map((row) => ({
    id: row.id,
    workspaceId,
    name: row.name,
    description: '',
    kind: row.kind,
    extension: row.kind === 'slides' ? 'pptx' : row.kind === 'image' ? 'png' : 'docx',
    sizeLabel: '24 KB',
    ownerName: row.owner,
    ownerInitials: initialsFor(row.owner),
    createdAt: row.updatedAt,
    updatedAt: row.updatedAt,
    href: '',
    notify: false,
  }))
}

function asDiscussions(seed: SeedBundle, workspaceId: string): Discussion[] {
  return seed.discussions.map((row) => ({
    id: row.id,
    title: row.title,
    summary: '',
    body: '',
    status: 'open' as const,
    authorName: row.author,
    authorInitials: initialsFor(row.author),
    replies: 2,
    lastActivity: row.lastActivity,
    workspaceId,
  }))
}

function asProfiles(circle: CircleId, workspaceId: string, workspaceName: string, path: string): Profile[] {
  return peopleFor(circle).map((person) => ({
    slug: person.name.toLowerCase().replace(/\s+/g, '-'),
    initials: person.initials,
    name: person.name,
    you: person.you,
    email: person.you ? SANDBOX_USER.preferred : `${person.initials.toLowerCase()}@example.com`,
    timeZone: person.you ? SANDBOX_USER.timeZone : 'America/New_York',
    description: person.you ? SANDBOX_USER.description : '',
    key: person.you ? SANDBOX_USER.key : person.name.toLowerCase().replace(/\s+/g, '-'),
    lastLogin: person.you ? SANDBOX_USER.lastLogin : 0,
    theme: 'default' as const,
    memberships: [
      {
        workspaceId,
        workspaceKey: workspaceId,
        workspaceName,
        path,
        role: person.role,
      },
    ],
  }))
}

function hierarchy() {
  return TEAMS.map((team, index) => ({
    name: team.name,
    detail: team.description,
    level: team.parent ? 0 : 1,
    path: workspacePath(SITE, team.pageKey),
    // keep stable order with organization first
    order: index,
  })).map(({ order: _order, ...row }) => row)
}

function childrenOfParent(): WorkspaceDemo['children'] {
  return TEAMS.filter((team) => !team.parent).map((team) => ({
    path: workspacePath(SITE, team.pageKey),
    code: team.code,
    name: team.name,
    members: peopleFor(team.circle).length,
  }))
}

function buildDemo(seed: SeedBundle): WorkspaceDemo {
  const { team } = seed
  const path = workspacePath(SITE, team.pageKey)
  const id = workspaceIdFor(SITE, team.pageKey)
  const people = peopleFor(team.circle)
  const meetingDate = new Date(`${seed.meeting.date}T${seed.meeting.startTime}`)
  const documents = asDocuments(seed, id)
  const discussions = asDiscussions(seed, id)

  return emptyWorkspace({
    id,
    path,
    siteKey: SITE,
    pageKey: team.pageKey,
    code: team.code,
    name: team.name,
    description: team.description,
    members: people.length,
    stewards: people.filter((person) => person.role === 'steward').length,
    documentCount: documents.length,
    openActions: 1,
    activityLabel: `This circle · ${team.name}`,
    people,
    documents: documents.map((row) => ({
      title: row.name,
      meta: `Uploaded by ${row.ownerName}`,
      type: row.kind,
      date: row.updatedAt.slice(0, 10),
      icon: row.kind === 'image' ? '/image0.svg' : row.kind === 'slides' ? '/slides0.svg' : '/file2.svg',
    })),
    meetings: [
      {
        id: seed.meeting.id,
        title: seed.meeting.name,
        meta: `${seed.meeting.date} | ${seed.meeting.startTime}`,
        group: 'this',
      },
    ],
    actionItems: [{ id: `${team.pageKey}-action`, title: seed.actionTitle, meta: seed.actionMeta, group: 'this' }],
    discussions: discussions.map((row) => ({
      id: row.id,
      title: row.title,
      meta: row.lastActivity,
      group: 'this',
    })),
    updates: [
      {
        id: `meeting-${seed.meeting.id}`,
        title: seed.meeting.name,
        detail: seed.meeting.description,
        kind: 'meeting',
        date: seed.meeting.date,
        to: `/meetings/${seed.meeting.id}`,
        icon: '/calendar0.svg',
      },
      ...discussions.slice(0, 2).map((row) => ({
        id: `topic-${row.id}`,
        title: row.title,
        detail: row.authorName,
        kind: 'discussion' as const,
        date: row.lastActivity,
        to: `/discussions?workspace=${encodeURIComponent(id)}`,
        icon: '/msg0.svg',
      })),
      ...documents.slice(0, 2).map((row) => ({
        id: `doc-${row.id}`,
        title: row.name,
        detail: row.ownerName,
        kind: (row.kind === 'slides' || row.kind === 'image' ? row.kind : 'doc') as 'slides' | 'image' | 'doc',
        date: row.updatedAt.slice(0, 10),
        to: `/documents?workspace=${encodeURIComponent(id)}`,
        icon: row.kind === 'image' ? '/image0.svg' : row.kind === 'slides' ? '/slides0.svg' : '/file2.svg',
      })),
    ],
    myActionItems: [{ id: `${team.pageKey}-action`, title: seed.actionTitle, meta: seed.actionMeta, to: '/action-items' }],
    nextMeeting: {
      title: seed.meeting.name,
      when: `${meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${seed.meeting.startTime} · ${seed.meeting.description}`,
      month: meetingDate.toLocaleDateString('en-US', { month: 'short' }),
      day: String(meetingDate.getDate()),
      to: `/meetings/${seed.meeting.id}`,
      zoomLabel: 'zoom.us/j/meeting-id',
      zoomCopy: 'https://zoom.us/j/meeting-id',
    },
    breadcrumbs: team.parent
      ? [{ label: team.name }]
      : [
          { label: 'IDA Class', path: workspacePath(SITE, 'organization') },
          { label: team.name },
        ],
    hierarchy: hierarchy(),
    children: team.parent ? childrenOfParent() : [],
  })
}

export function seedSandboxStores() {
  setDocumentOwner(SANDBOX_USER.name, initialsFor(SANDBOX_USER.name))

  // UX first so pages without ?workspace= (discussions, documents) open the demo home circle.
  const ordered = [
    ...SEEDS.filter((seed) => seed.team.pageKey === 'ux'),
    ...SEEDS.filter((seed) => seed.team.pageKey !== 'ux'),
  ]
  const demos = ordered.map((seed) => buildDemo(seed))
  const meetings = ordered.map((seed) => asMeeting(seed, workspaceIdFor(SITE, seed.team.pageKey)))
  const documents = ordered.flatMap((seed) => asDocuments(seed, workspaceIdFor(SITE, seed.team.pageKey)))
  const discussions = ordered.flatMap((seed) => asDiscussions(seed, workspaceIdFor(SITE, seed.team.pageKey)))
  const profiles = ordered.flatMap((seed) => {
    const id = workspaceIdFor(SITE, seed.team.pageKey)
    const path = workspacePath(SITE, seed.team.pageKey)
    return asProfiles(seed.team.circle, id, seed.team.name, path)
  })

  replaceWorkspaces(demos)
  replaceMeetings(meetings)
  replaceDocuments(documents)
  replaceDiscussions(discussions)
  replaceProfiles(profiles)
}

export function openSandboxWorkspace(siteKey: string, pageKey: string, _you: SessionUser | null) {
  const seed = SEEDS.find((row) => row.team.pageKey === pageKey && siteKey === SITE)
  if (!seed) {
    return
  }
  upsertWorkspace(buildDemo(seed))
}

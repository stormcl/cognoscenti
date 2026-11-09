import { peopleFor, type CircleId } from './testdata'

export type WorkspaceId = CircleId | 'department'

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

const TEAM_LINKS: { id: CircleId; path: string; code: string; name: string; detail: string }[] = [
  { id: 'dev', path: '/dev', code: 'DT', name: 'Dev Team', detail: 'Build and maintain Weaver features' },
  { id: 'ux', path: '/', code: 'UX', name: 'UX Team', detail: 'Research, journeys, and iterative wireframes' },
  { id: 'branding', path: '/branding', code: 'BT', name: 'Branding Team', detail: 'Visual identity and design system' },
  { id: 'marketing', path: '/marketing', code: 'MT', name: 'Marketing Team', detail: 'Campaigns and product stories' },
  { id: 'logistics', path: '/logistics', code: 'LT', name: 'Logistics Team', detail: 'Events, supplies, and meeting ops' },
]

function orgChildren(): ChildWorkspace[] {
  return TEAM_LINKS.map((team) => ({
    path: team.path,
    code: team.code,
    name: team.name,
    members: peopleFor(team.id).length,
  }))
}

function orgHierarchy(): HierarchyRow[] {
  return [
    { name: 'Integrated Digital Agency Class Workspace', detail: 'Parent workspace for all class teams', level: 0, path: '/organization' },
    ...TEAM_LINKS.map((team) => ({
      name: team.name,
      detail: team.detail,
      level: 1,
      path: team.path,
    })),
  ]
}

function fillWorkspace(
  partial: Omit<WorkspaceDemo, 'members' | 'stewards' | 'documentCount' | 'openActions' | 'people' | 'activityLabel' | 'hierarchy' | 'breadcrumbs'> & {
    peopleId: CircleId
    parent?: boolean
  },
): WorkspaceDemo {
  const { peopleId, parent, ...rest } = partial
  const people = peopleFor(peopleId)
  return {
    ...rest,
    members: people.length,
    stewards: people.filter((person) => person.role === 'steward').length,
    documentCount: partial.documents.length,
    openActions: partial.actionItems.filter((row) => row.group === 'this').length,
    activityLabel: `This circle · ${partial.name}`,
    people,
    breadcrumbs: parent
      ? [{ label: partial.name }]
      : [
          { label: 'Integrated Digital Agency Class Workspace', path: '/organization' },
          { label: partial.name },
        ],
    hierarchy: orgHierarchy(),
  }
}

const organization = fillWorkspace({
  id: 'organization',
  path: '/organization',
  code: 'IDA',
  name: 'Integrated Digital Agency Class Workspace',
  peopleId: 'organization',
  parent: true,
  description: 'Aim: Parent workspace for the Integrated Digital Agency class. Coordinate all teams, shared planning, and class-wide resources.',
  nextMeeting: {
    title: 'Organization Planning Meeting',
    when: 'Mon, Oct 27 · 10:00 AM · Agenda: 4 items',
    month: 'Oct',
    day: '27',
    to: '/meetings/org-planning',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'Organization handbook', meta: 'Shared policies · Uploaded by Jane Doe', type: 'Doc', date: 'Oct 8', icon: '/file2.svg' },
    { title: 'Quarterly plan', meta: 'Planning deck · Uploaded by Mira Finch', type: 'Slides', date: 'Oct 6', icon: '/slides0.svg' },
    { title: 'Org chart', meta: 'Structure map · Uploaded by Jules Reed', type: 'Image', date: 'Oct 2', icon: '/image0.svg' },
    { title: 'Budget overview', meta: 'Finance · Uploaded by Casey Drift', type: 'Doc', date: 'Sep 28', icon: '/file2.svg' },
  ],
  meetings: [
    { id: 'org-planning', title: 'Organization Planning Meeting', meta: '27.10.26 | 10:00', group: 'this' },
    { id: 'org-quarterly', title: 'Quarterly Organization Review', meta: '14.10.26 | 15:00', group: 'this' },
    { id: 'ux-all-hands', title: 'UX Team checkpoint', meta: '22.10.26 | 16:30', tag: 'UX Team', group: 'related' },
  ],
  actionItems: [
    { id: 'org-goals', title: 'Publish organization goals for fall', meta: 'Due Oct 30', group: 'this' },
    { id: 'ux-onboarding', title: 'Review UX onboarding notes', meta: 'Assigned', group: 'related', tag: 'UX Team' },
  ],
  discussions: [
    { id: 'org-calendar', title: 'Shared organization calendar', meta: 'Updated Oct 20', group: 'this' },
    { id: 'ux-template', title: 'UX meeting template', meta: '3 comments', group: 'related', tag: 'UX Team' },
  ],
  updates: [
    { id: 'org-planning-update', title: 'Organization Planning Meeting', detail: 'Agenda, notes and decisions · Jane Doe', kind: 'meeting', date: 'Oct 20', to: '/meetings/org-planning', icon: '/calendar0.svg' },
    { id: 'org-calendar-update', title: 'Shared organization calendar', detail: 'Planning thread for fall dates · Wren Maple', kind: 'discussion', date: 'Today', to: '/discussions', icon: '/msg0.svg' },
    { id: 'ux-template-update', title: 'UX meeting template', detail: 'Shared notes for team leads · Pia North', kind: 'discussion', date: 'Yesterday', to: '/discussions', icon: '/msg0.svg' },
    { id: 'org-handbook', title: 'Organization handbook', detail: 'Shared policies · Jane Doe', kind: 'doc', date: 'Oct 8', to: '/documents?workspace=organization', icon: '/file2.svg' },
    { id: 'quarterly-plan', title: 'Quarterly plan', detail: 'Planning deck · Mira Finch', kind: 'slides', date: 'Oct 6', to: '/documents?workspace=organization', icon: '/slides0.svg' },
    { id: 'org-chart', title: 'Org chart', detail: 'Structure map · Jules Reed', kind: 'image', date: 'Oct 2', to: '/documents?workspace=organization', icon: '/image0.svg' },
  ],
  myActionItems: [
    { id: 'org-goals', title: 'Publish organization goals for fall', meta: 'Due Oct 30', to: '/action-items' },
    { id: 'review-budget', title: 'Review quarterly budget notes', meta: 'Due Nov 3', to: '/action-items' },
  ],
  children: orgChildren(),
})

const ux = fillWorkspace({
  id: 'ux',
  path: '/',
  code: 'UX',
  name: 'UX Team',
  peopleId: 'ux',
  description:
    'Aim: Redesign the Weaver workspace experience through heuristic evaluation, journey mapping and iterative wireframes.',
  nextMeeting: {
    title: '5th UX Team Meeting',
    when: 'Thu, Oct 22 · 4:30 PM · Agenda: 5 items',
    month: 'Oct',
    day: '22',
    to: '/meetings/5th-child-group',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'Front page findings', meta: 'Heuristic analysis · Uploaded by Pia North', type: 'Slides', date: 'Oct 12', icon: '/slides0.svg' },
    { title: 'User journey maps', meta: 'Current and future state · Uploaded by Robin Quill', type: 'Slides', date: 'Oct 11', icon: '/slides0.svg' },
    { title: 'Placeholder persona', meta: 'Persona draft · Uploaded by Mira Finch', type: 'Image', date: 'Oct 10', icon: '/image0.svg' },
    { title: 'Wireframe notes', meta: 'Low-fidelity pass · Uploaded by Sage Hollow', type: 'Doc', date: 'Oct 9', icon: '/file2.svg' },
  ],
  meetings: [
    { id: 'fourth-child-group', title: 'Fourth UX Team Meeting', meta: '22.10.26 | 19:30', group: 'this' },
    { id: '4th-child-group', title: '4th UX Team Meeting', meta: '9.10.26 | 18:00', tag: 'UX Team', group: 'related' },
    { id: '2nd-child-group', title: '2nd UX Team Meeting', meta: 'Time TBD', tag: 'UX Team', group: 'related' },
  ],
  actionItems: [
    { id: 'write-journey-map', title: 'Draft journey map for onboarding', meta: 'Due Oct 24', group: 'this' },
    { id: 'heuristic-pass', title: 'Heuristic pass on meeting notes', meta: 'Unassigned', group: 'related', tag: 'UX Team' },
  ],
  discussions: [
    { id: 'async-api', title: 'Proposal: switch to async API pattern', meta: 'Updated Oct 21', group: 'this' },
    { id: 'agenda-template', title: 'Shared agenda template', meta: '2 comments', group: 'related', tag: 'UX Team' },
  ],
  updates: [
    { id: 'fourth-dept', title: '4th UX Team Meeting', detail: 'Agenda, notes and decisions · Jane Doe', kind: 'meeting', date: 'Oct 8', to: '/meetings/fourth-child-group', icon: '/calendar0.svg' },
    { id: 'wireframes', title: 'Low-fidelity wireframes', detail: 'Feedback thread on front page wireframes · Pia North', kind: 'discussion', date: 'Today', to: '/discussions', icon: '/msg0.svg' },
    { id: 'checkpoint', title: 'Combined team checkpoint', detail: 'Status of all sub-teams · Wren Maple', kind: 'discussion', date: 'Yesterday', to: '/discussions', icon: '/msg0.svg' },
    { id: 'findings', title: 'Front page findings', detail: 'Heuristic analysis of the workspace front page · Pia North', kind: 'slides', date: 'Oct 12', to: '/documents?workspace=ux', icon: '/slides0.svg' },
    { id: 'journeys', title: 'User journey maps', detail: 'Journey maps for current and future state · Robin Quill', kind: 'slides', date: 'Oct 11', to: '/documents?workspace=ux', icon: '/slides0.svg' },
    { id: 'persona', title: 'Placeholder persona', detail: 'Persona draft for review · Mira Finch', kind: 'image', date: 'Oct 10', to: '/documents?workspace=ux', icon: '/image0.svg' },
  ],
  myActionItems: [{ id: 'write-journey-map', title: 'Draft journey map for onboarding', meta: 'Due Oct 24', to: '/action-items' }],
  children: [],
})

const dev = fillWorkspace({
  id: 'dev',
  path: '/dev',
  code: 'DT',
  name: 'Dev Team',
  peopleId: 'dev',
  description: 'Aim: Build and maintain Weaver application features, APIs, and release quality.',
  nextMeeting: {
    title: 'Sprint planning',
    when: 'Tue, Oct 28 · 11:00 AM · Agenda: 6 items',
    month: 'Oct',
    day: '28',
    to: '/meetings/dev-sprint',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'API checklist', meta: 'Release notes · Uploaded by Wren Maple', type: 'Doc', date: 'Oct 14', icon: '/file2.svg' },
    { title: 'Architecture sketch', meta: 'Service map · Uploaded by Remy Oak', type: 'Slides', date: 'Oct 9', icon: '/slides0.svg' },
  ],
  meetings: [
    { id: 'dev-sprint', title: 'Sprint planning', meta: '28.10.26 | 11:00', group: 'this' },
    { id: 'dev-review', title: 'API review', meta: '21.10.26 | 15:00', group: 'this' },
  ],
  actionItems: [
    { id: 'fix-scribe-stream', title: 'Stabilize live transcript stream', meta: 'Due Oct 29', group: 'this' },
    { id: 'ux-handoff', title: 'Handoff notes to UX Team', meta: 'Assigned', group: 'related', tag: 'UX Team' },
  ],
  discussions: [{ id: 'async-api-dev', title: 'Proposal: switch to async API pattern', meta: 'Updated Oct 21', group: 'this' }],
  updates: [
    { id: 'dev-sprint-update', title: 'Sprint planning', detail: 'Agenda and owners · Jane Doe', kind: 'meeting', date: 'Oct 21', to: '/meetings/dev-sprint', icon: '/calendar0.svg' },
    { id: 'api-checklist', title: 'API checklist', detail: 'Release notes · Wren Maple', kind: 'doc', date: 'Oct 14', to: '/documents?workspace=dev', icon: '/file2.svg' },
  ],
  myActionItems: [{ id: 'fix-scribe-stream', title: 'Stabilize live transcript stream', meta: 'Due Oct 29', to: '/action-items' }],
  children: [],
})

const branding = fillWorkspace({
  id: 'branding',
  path: '/branding',
  code: 'BT',
  name: 'Branding Team',
  peopleId: 'branding',
  description: 'Aim: Keep Weaver visual identity consistent across product, decks, and marketing.',
  nextMeeting: {
    title: 'Brand review',
    when: 'Wed, Oct 29 · 2:00 PM · Agenda: 3 items',
    month: 'Oct',
    day: '29',
    to: '/meetings/brand-review',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'Logo kit', meta: 'Marks and clear space · Uploaded by Jules Reed', type: 'Image', date: 'Oct 7', icon: '/image0.svg' },
    { title: 'Color tokens', meta: 'Product palette · Uploaded by Ivy Wisp', type: 'Doc', date: 'Oct 5', icon: '/file2.svg' },
  ],
  meetings: [{ id: 'brand-review', title: 'Brand review', meta: '29.10.26 | 14:00', group: 'this' }],
  actionItems: [{ id: 'icon-pass', title: 'Align sidebar icons with the kit', meta: 'Due Nov 4', group: 'this' }],
  discussions: [{ id: 'wordmark', title: 'Weaver Scribe wordmark', meta: '4 comments', group: 'this' }],
  updates: [
    { id: 'logo-kit', title: 'Logo kit', detail: 'Marks and clear space · Jules Reed', kind: 'image', date: 'Oct 7', to: '/documents?workspace=branding', icon: '/image0.svg' },
    { id: 'wordmark-update', title: 'Weaver Scribe wordmark', detail: 'Feedback on the pill mark · Ivy Wisp', kind: 'discussion', date: 'Today', to: '/discussions', icon: '/msg0.svg' },
  ],
  myActionItems: [{ id: 'icon-pass', title: 'Align sidebar icons with the kit', meta: 'Due Nov 4', to: '/action-items' }],
  children: [],
})

const marketing = fillWorkspace({
  id: 'marketing',
  path: '/marketing',
  code: 'MT',
  name: 'Marketing Team',
  peopleId: 'marketing',
  description: 'Aim: Tell the Weaver story across campaigns, launch notes, and public pages.',
  nextMeeting: {
    title: 'Campaign standup',
    when: 'Fri, Oct 31 · 9:30 AM · Agenda: 4 items',
    month: 'Oct',
    day: '31',
    to: '/meetings/campaign-standup',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'Launch brief', meta: 'Fall campaign · Uploaded by Casey Drift', type: 'Doc', date: 'Oct 13', icon: '/file2.svg' },
    { title: 'Site copy deck', meta: 'Public pages · Uploaded by Dana Frost', type: 'Slides', date: 'Oct 4', icon: '/slides0.svg' },
  ],
  meetings: [{ id: 'campaign-standup', title: 'Campaign standup', meta: '31.10.26 | 09:30', group: 'this' }],
  actionItems: [{ id: 'publish-brief', title: 'Publish the fall launch brief', meta: 'Due Nov 1', group: 'this' }],
  discussions: [{ id: 'tone-guide', title: 'Tone of voice for Ask Weaver', meta: 'Updated Oct 18', group: 'this' }],
  updates: [
    { id: 'launch-brief', title: 'Launch brief', detail: 'Fall campaign · Casey Drift', kind: 'doc', date: 'Oct 13', to: '/documents?workspace=marketing', icon: '/file2.svg' },
    { id: 'tone-guide-update', title: 'Tone of voice for Ask Weaver', detail: 'Copy thread · Dana Frost', kind: 'discussion', date: 'Oct 18', to: '/discussions', icon: '/msg0.svg' },
  ],
  myActionItems: [{ id: 'publish-brief', title: 'Publish the fall launch brief', meta: 'Due Nov 1', to: '/action-items' }],
  children: [],
})

const logistics = fillWorkspace({
  id: 'logistics',
  path: '/logistics',
  code: 'LT',
  name: 'Logistics Team',
  peopleId: 'logistics',
  description: 'Aim: Coordinate events, supplies, rooms, and meeting operations for the organization.',
  nextMeeting: {
    title: 'Ops huddle',
    when: 'Thu, Oct 30 · 8:45 AM · Agenda: 5 items',
    month: 'Oct',
    day: '30',
    to: '/meetings/ops-huddle',
    zoomLabel: 'zoom.us/[meeting-id]',
    zoomCopy: 'https://zoom.us/j/meeting-id',
  },
  documents: [
    { title: 'Venue checklist', meta: 'Fall meetup · Uploaded by Morgan Moss', type: 'Doc', date: 'Oct 15', icon: '/file2.svg' },
    { title: 'Supply inventory', meta: 'Kits and badges · Uploaded by Niko Vale', type: 'Doc', date: 'Oct 3', icon: '/file2.svg' },
  ],
  meetings: [{ id: 'ops-huddle', title: 'Ops huddle', meta: '30.10.26 | 08:45', group: 'this' }],
  actionItems: [{ id: 'book-room', title: 'Book the Nov all-hands room', meta: 'Due Oct 31', group: 'this' }],
  discussions: [{ id: 'hybrid-setup', title: 'Hybrid meeting kit', meta: '2 comments', group: 'this' }],
  updates: [
    { id: 'ops-huddle-update', title: 'Ops huddle', detail: 'Agenda, rooms and owners · Morgan Moss', kind: 'meeting', date: 'Oct 16', to: '/meetings/ops-huddle', icon: '/calendar0.svg' },
    { id: 'venue-checklist', title: 'Venue checklist', detail: 'Fall meetup · Morgan Moss', kind: 'doc', date: 'Oct 15', to: '/documents?workspace=logistics', icon: '/file2.svg' },
  ],
  myActionItems: [{ id: 'book-room', title: 'Book the Nov all-hands room', meta: 'Due Oct 31', to: '/action-items' }],
  children: [],
})

export const workspaces: Record<WorkspaceId, WorkspaceDemo> = {
  organization,
  ux,
  department: ux,
  dev,
  branding,
  marketing,
  logistics,
}

export function workspaceFromPath(pathname: string): WorkspaceDemo {
  if (pathname === '/organization' || pathname.startsWith('/organization/')) {
    return workspaces.organization
  }
  if (pathname === '/dev' || pathname.startsWith('/dev/')) {
    return workspaces.dev
  }
  if (pathname === '/ux' || pathname.startsWith('/ux/')) {
    return workspaces.ux
  }
  if (pathname === '/branding' || pathname.startsWith('/branding/')) {
    return workspaces.branding
  }
  if (pathname === '/marketing' || pathname.startsWith('/marketing/')) {
    return workspaces.marketing
  }
  if (pathname === '/logistics' || pathname.startsWith('/logistics/')) {
    return workspaces.logistics
  }
  return workspaces.ux
}

export function workspaceFromLocation(pathname: string, search: string): WorkspaceDemo {
  const requested = new URLSearchParams(search).get('workspace')
  if (requested) {
    return workspaces[normalizeWorkspaceId(requested)]
  }
  return workspaceFromPath(pathname)
}

export function normalizeWorkspaceId(id: string | null | undefined): WorkspaceId {
  if (id === 'department') {
    return 'ux'
  }
  if (id && id in workspaces) {
    return id as WorkspaceId
  }
  return 'ux'
}

export type SwitcherEntry = ChildWorkspace & {
  kind: 'parent' | 'child'
  current: boolean
}

export function switcherTree(workspace: WorkspaceDemo): { parent: SwitcherEntry; teams: SwitcherEntry[] } {
  const org = workspaces.organization
  const onParent = workspace.id === 'organization'
  return {
    parent: {
      path: org.path,
      code: org.code,
      name: org.name,
      members: org.members,
      kind: 'parent',
      current: onParent,
    },
    teams: org.children.map((child) => ({
      ...child,
      kind: 'child',
      current: !onParent && (child.path === workspace.path || child.name === workspace.name),
    })),
  }
}

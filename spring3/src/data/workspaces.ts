export type WorkspaceId = 'organization' | 'department'

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

export const workspaces: Record<WorkspaceId, WorkspaceDemo> = {
  organization: {
    id: 'organization',
    path: '/organization',
    code: 'OW',
    name: 'Organization Workspace',
    members: 42,
    documentCount: 28,
    openActions: 5,
    stewards: 8,
    description:
      'Aim: Coordinate departments, shared planning, and organization-wide resources.',
    activityLabel: 'This circle · Organization Workspace',
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
      { title: 'Organization handbook', meta: 'Shared policies · Uploaded by Name', type: 'Doc', date: 'Oct 8', icon: '/file2.svg' },
      { title: 'Quarterly plan', meta: 'Planning deck · Uploaded by Name', type: 'Slides', date: 'Oct 6', icon: '/slides0.svg' },
      { title: 'Org chart', meta: 'Structure map · Uploaded by Name', type: 'Image', date: 'Oct 2', icon: '/image0.svg' },
      { title: 'Budget overview', meta: 'Finance · Uploaded by Name', type: 'Doc', date: 'Sep 28', icon: '/file2.svg' },
    ],
    meetings: [
      {
        id: 'org-planning',
        title: 'Organization Planning Meeting',
        meta: '27.10.26 | 10:00',
        group: 'this',
      },
      {
        id: 'org-quarterly',
        title: 'Quarterly Organization Review',
        meta: '14.10.26 | 15:00',
        group: 'this',
      },
      {
        id: 'dept-all-hands',
        title: 'Department All-hands',
        meta: '22.10.26 | 16:30',
        tag: 'Department Workspace',
        group: 'related',
      },
    ],
    actionItems: [
      { id: 'org-goals', title: 'Publish organization goals for fall', meta: 'Due Oct 30', group: 'this' },
      { id: 'dept-onboarding', title: 'Review department onboarding notes', meta: 'Assigned', group: 'related', tag: 'Department Workspace' },
    ],
    discussions: [
      { id: 'org-calendar', title: 'Shared organization calendar', meta: 'Updated Oct 20', group: 'this' },
      { id: 'dept-template', title: 'Department meeting template', meta: '3 comments', group: 'related', tag: 'Department Workspace' },
    ],
    updates: [
      {
        id: 'org-planning-update',
        title: 'Organization Planning Meeting',
        detail: 'Agenda, notes and decisions · Name',
        kind: 'meeting',
        date: 'Oct 20',
        to: '/meetings/org-planning',
        icon: '/calendar0.svg',
      },
      {
        id: 'org-calendar-update',
        title: 'Shared organization calendar',
        detail: 'Planning thread for fall dates · Name',
        kind: 'discussion',
        date: 'Today',
        to: '/discussions',
        icon: '/msg0.svg',
      },
      {
        id: 'dept-template-update',
        title: 'Department meeting template',
        detail: 'Shared notes for department leads · Name',
        kind: 'discussion',
        date: 'Yesterday',
        to: '/discussions',
        icon: '/msg0.svg',
      },
      {
        id: 'org-handbook',
        title: 'Organization handbook',
        detail: 'Shared policies · Name',
        kind: 'doc',
        date: 'Oct 8',
        to: '/documents',
        icon: '/file2.svg',
      },
      {
        id: 'quarterly-plan',
        title: 'Quarterly plan',
        detail: 'Planning deck · Name',
        kind: 'slides',
        date: 'Oct 6',
        to: '/documents',
        icon: '/slides0.svg',
      },
      {
        id: 'org-chart',
        title: 'Org chart',
        detail: 'Structure map · Name',
        kind: 'image',
        date: 'Oct 2',
        to: '/documents',
        icon: '/image0.svg',
      },
    ],
    people: [
      { initials: 'UN', name: 'Users Name', role: 'steward', you: true },
      { initials: 'TB', name: 'Taylor Brooks', role: 'steward' },
      { initials: 'JT', name: 'Jordan Trent', role: 'steward' },
      { initials: 'CD', name: 'Casey Dunn', role: 'steward' },
      { initials: 'BJ', name: 'Blair James', role: 'steward' },
      { initials: 'MM', name: 'Morgan Miles', role: 'steward' },
      { initials: 'SH', name: 'Sam Harper', role: 'steward' },
      { initials: 'IW', name: 'Ivy West', role: 'steward' },
      { initials: 'RK', name: 'Riley Kane', role: 'member' },
      { initials: 'AL', name: 'Avery Lane', role: 'member' },
      { initials: 'NP', name: 'Noel Park', role: 'member' },
      { initials: 'FS', name: 'Finley Shaw', role: 'member' },
      { initials: 'GW', name: 'Gray Wells', role: 'member' },
      { initials: 'QH', name: 'Quinn Hale', role: 'member' },
    ],
    myActionItems: [
      { id: 'org-goals', title: 'Publish organization goals for fall', meta: 'Due Oct 30', to: '/action-items' },
      { id: 'review-budget', title: 'Review quarterly budget notes', meta: 'Due Nov 3', to: '/action-items' },
    ],
    breadcrumbs: [{ label: 'Organization Workspace' }],
    hierarchy: [
      { name: 'Organization Workspace', detail: 'Main organization workspace', level: 0, path: '/organization' },
      { name: 'Department Workspace', detail: 'Team collaboration and resources', level: 1, path: '/' },
      { name: 'Meeting Module', detail: 'Meetings, agendas and notes', level: 2, path: '/workspaces' },
      { name: 'Admin Pages', detail: 'Focuses on the admin pages', level: 2, path: '/workspaces' },
    ],
    children: [
      { path: '/', code: 'DW', name: 'Department Workspace', members: 14 },
    ],
  },
  department: {
    id: 'department',
    path: '/',
    code: 'DW',
    name: 'Department Workspace',
    members: 14,
    documentCount: 11,
    openActions: 0,
    stewards: 5,
    description:
      'Aim: Redesign the Weaver workspace experience through heuristic evaluation, journey mapping and iterative wireframes.',
    activityLabel: 'This circle · Department Workspace',
    nextMeeting: {
      title: '5th Department Meeting',
      when: 'Thu, Oct 22 · 4:30 PM · Agenda: 5 items',
      month: 'Oct',
      day: '22',
      to: '/meetings/5th-child-group',
      zoomLabel: 'zoom.us/[meeting-id]',
      zoomCopy: 'https://zoom.us/j/meeting-id',
    },
    documents: [
      { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Slides', date: 'Oct 12', icon: '/slides0.svg' },
      { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Slides', date: 'Oct 11', icon: '/slides2.svg' },
      { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Image', date: 'Oct 10', icon: '/image0.svg' },
      { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Doc', date: 'Oct 9', icon: '/file2.svg' },
    ],
    meetings: [
      {
        id: 'fourth-child-group',
        title: 'Fourth Department Meeting',
        meta: '22.10.26 | 19:30',
        group: 'this',
      },
      {
        id: '4th-child-group',
        title: '4th Department Meeting',
        meta: '9.10.26 | 18:00',
        tag: 'Department Workspace',
        group: 'related',
      },
      {
        id: '2nd-child-group',
        title: '2nd Department Meeting',
        meta: 'Time TBD',
        tag: 'Department Workspace',
        group: 'related',
      },
    ],
    actionItems: [
      { id: 'write-journey-map', title: 'Draft journey map for onboarding', meta: 'Due Oct 24', group: 'this' },
      { id: 'heuristic-pass', title: 'Heuristic pass on meeting notes', meta: 'Unassigned', group: 'related', tag: 'Department Workspace' },
    ],
    discussions: [
      { id: 'async-api', title: 'Proposal: switch to async API pattern', meta: 'Updated Oct 21', group: 'this' },
      { id: 'agenda-template', title: 'Shared agenda template', meta: '2 comments', group: 'related', tag: 'Department Workspace' },
    ],
    updates: [
      {
        id: 'fourth-dept',
        title: '4th Department Meeting',
        detail: 'Agenda, notes and decisions · Name',
        kind: 'meeting',
        date: 'Oct 8',
        to: '/meetings/fourth-child-group',
        icon: '/calendar0.svg',
      },
      {
        id: 'wireframes',
        title: 'Low-fidelity wireframes',
        detail: 'Feedback thread on front page wireframes · Name',
        kind: 'discussion',
        date: 'Today',
        to: '/discussions',
        icon: '/msg0.svg',
      },
      {
        id: 'checkpoint',
        title: 'Combined team checkpoint',
        detail: 'Status of all sub-teams · Name',
        kind: 'discussion',
        date: 'Yesterday',
        to: '/discussions',
        icon: '/msg0.svg',
      },
      {
        id: 'findings',
        title: 'Front page findings',
        detail: 'Heuristic analysis of the workspace front page · Name',
        kind: 'slides',
        date: 'Oct 12',
        to: '/documents',
        icon: '/slides0.svg',
      },
      {
        id: 'journeys',
        title: 'User journey maps',
        detail: 'Journey maps for current and future state · Name',
        kind: 'slides',
        date: 'Oct 11',
        to: '/documents',
        icon: '/slides0.svg',
      },
      {
        id: 'persona',
        title: 'Placeholder persona',
        detail: 'Persona draft for review · Name',
        kind: 'image',
        date: 'Oct 10',
        to: '/documents',
        icon: '/image0.svg',
      },
    ],
    people: [
      { initials: 'UN', name: 'Users Name', role: 'steward', you: true },
      { initials: 'TB', name: 'Taylor Brooks', role: 'steward' },
      { initials: 'JT', name: 'Jordan Trent', role: 'steward' },
      { initials: 'CD', name: 'Casey Dunn', role: 'steward' },
      { initials: 'BJ', name: 'Blair James', role: 'steward' },
      { initials: 'MM', name: 'Morgan Miles', role: 'member' },
      { initials: 'SH', name: 'Sam Harper', role: 'member' },
      { initials: 'IW', name: 'Ivy West', role: 'member' },
      { initials: 'RK', name: 'Riley Kane', role: 'member' },
      { initials: 'AL', name: 'Avery Lane', role: 'member' },
      { initials: 'NP', name: 'Noel Park', role: 'member' },
      { initials: 'FS', name: 'Finley Shaw', role: 'member' },
      { initials: 'GW', name: 'Gray Wells', role: 'member' },
      { initials: 'QH', name: 'Quinn Hale', role: 'member' },
    ],
    myActionItems: [],
    breadcrumbs: [
      { label: 'Organization Workspace', path: '/organization' },
      { label: 'Department Workspace' },
    ],
    hierarchy: [
      { name: 'Organization Workspace', detail: 'Main organization workspace', level: 0, path: '/organization' },
      { name: 'Department Workspace', detail: 'Team collaboration and resources', level: 1, path: '/' },
      { name: 'Meeting Module', detail: 'Meetings, agendas and notes', level: 2, path: '/workspaces' },
      { name: 'Admin Pages', detail: 'Focuses on the admin pages', level: 2, path: '/workspaces' },
    ],
    children: [
      { path: '/workspaces', code: 'MM', name: 'Meeting Module', members: 9 },
      { path: '/workspaces', code: 'AP', name: 'Admin Pages', members: 0 },
    ],
  },
}

export function workspaceFromPath(pathname: string): WorkspaceDemo {
  if (pathname === '/organization' || pathname.startsWith('/organization/')) {
    return workspaces.organization
  }
  return workspaces.department
}

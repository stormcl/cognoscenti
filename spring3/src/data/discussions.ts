import { TEST_USERS } from './testdata'

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
}

function author(name: string) {
  const person = TEST_USERS.find((row) => row.name === name)
  if (!person) {
    throw new Error(`Missing test user ${name}`)
  }
  return { authorName: person.name, authorInitials: person.initials }
}

/** Topic copy from the discussions mock. Authors are UX Team people from testdata.ts. */
export const DEMO_DISCUSSIONS: Discussion[] = [
  {
    id: 'team-member-input',
    title: 'Team member input',
    summary: "Collecting each member's availability and preferred tasks",
    body: "Collecting each member's availability and preferred tasks so we can staff the next round of screens.",
    status: 'open',
    ...author('Pia North'),
    replies: 8,
    lastActivity: '2h ago',
  },
  {
    id: 'simple-rules',
    title: 'Simple Rules & Workflow',
    summary: 'Agreeing on how we name files and hand off work',
    body: 'Agreeing on how we name files and hand off work between design and development.',
    status: 'open',
    ...author('Jane Doe'),
    replies: 5,
    lastActivity: 'Yesterday',
  },
  {
    id: 'heuristic-evaluation',
    title: 'Division of Heuristic Evaluation',
    summary: 'Who evaluates which pages of Weaver',
    body: 'Who evaluates which pages of Weaver, and how we split the notes afterward.',
    status: 'open',
    ...author('Mira Finch'),
    replies: 12,
    lastActivity: '3 days ago',
  },
  {
    id: 'stakeholder-questions',
    title: 'Stakeholder Questions',
    summary: 'Questions to bring to the next stakeholder meeting',
    body: 'Questions to bring to the next stakeholder meeting. Still a draft.',
    status: 'draft',
    ...author('Avery Loch'),
    replies: null,
    lastActivity: 'Sep 15',
  },
  {
    id: 'tuesday-notes',
    title: 'Tuesday Stakeholder Meeting Discussion Notes',
    summary: "Notes and follow-ups from Tuesday's meeting",
    body: "Notes and follow-ups from Tuesday's meeting, including the items we still owe the stakeholders.",
    status: 'open',
    ...author('Sage Hollow'),
    replies: 4,
    lastActivity: 'Sep 11',
  },
  {
    id: 'dividing-ux',
    title: 'Dividing the UX Group',
    summary: 'Splitting into sub-teams for the semester',
    body: 'Splitting into sub-teams for the semester and deciding who covers which surface.',
    status: 'open',
    ...author('Robin Quill'),
    replies: 9,
    lastActivity: 'Aug 28',
  },
]

export const DEMO_COMPOSER = {
  subject: 'Feedback on mid-fi wireframes',
  body: 'Collecting peer comments on the Home, Front Page and Discussions screens before we finalize',
}

export const SUBJECT_LIMIT = 80

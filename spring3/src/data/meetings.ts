import { useSyncExternalStore } from 'react'
import { TEST_ATTENDANCE_PEOPLE, TEST_MEETING_PARTICIPANTS } from './testdata'
import { normalizeWorkspaceId, workspaces, type WorkspaceId } from './workspaces'

export type MeetingStatus =
  | 'draft'
  | 'planning'
  | 'scheduled'
  | 'running'
  | 'planned'
  | 'completed'

export type AttendanceMark = 'yes' | 'no' | 'none'

export type AgendaItem = {
  id: string
  title: string
  minutes: number
  actualMinutes: number | null
  timerRunning: boolean
  timerStartedAt: number | null
  presenter: string
  notes: string
}

export type Participant = {
  id: string
  name: string
  role: string
  attended: AttendanceMark
  expected: AttendanceMark
  note: string
  timeProposal: string
}

export type MeetingFile = {
  title: string
  to: string
}

export type Meeting = {
  id: string
  name: string
  date: string
  startTime: string
  timezone: string
  description: string
  zoomLink: string
  reminderDate: string
  reminderTime: string
  reminderTimezone: string
  exportMode: string
  agenda: AgendaItem[]
  participants: Participant[]
  facilitator: string
  notetaker: string
  timekeeper: string
  files: MeetingFile[]
  minutes: string
  agendaDocument: string
  status: MeetingStatus
  workspaceId: WorkspaceId
}

export type AttendanceStatus = 'present' | 'absent' | 'not-invited' | 'no-response'

export type AttendanceColumn = {
  id: string
  name: string
  date: string
}

export type AttendancePerson = {
  name: string
  marks: Record<string, AttendanceStatus>
}

export const STORE_KEY = 'weaver-meetings-v4'

const DEMO_NAME_SWAPS: Record<string, string> = {
  'Evelyn Harper': 'Wren Maple',
  'Liam Montgomery': 'Remy Oak',
  'Sophia Caldwell': 'Pia North',
  'Noah Whitman': 'Kit Linden',
  'Isabella Grant': 'Robin Quill',
  "Liam O'Connor": 'Niko Vale',
  'Liam O\u2019Connor': 'Niko Vale',
  'Taylor Brooks': 'Mira Finch',
  'Jordan Trent': 'Jules Reed',
}

function swapDemoName(name: string) {
  return DEMO_NAME_SWAPS[name] ?? name
}

function withDemoNames(row: Meeting): Meeting {
  return {
    ...row,
    facilitator: swapDemoName(row.facilitator),
    notetaker: swapDemoName(row.notetaker),
    timekeeper: swapDemoName(row.timekeeper),
    participants: row.participants.map((person) => ({
      ...person,
      name: swapDemoName(person.name),
    })),
    agenda: row.agenda.map((item) => ({
      ...item,
      presenter: swapDemoName(item.presenter),
    })),
    workspaceId: normalizeWorkspaceId(row.workspaceId),
  }
}
export const DEFAULT_DATE = '2026-10-09'
export const DEFAULT_TIME = '19:00'
export const DEFAULT_ZONE = 'EST (US & Canada)'
export const DEMO_TODAY = '2026-10-08'
export const ZOOM_DEMO = 'https://zoom.us/j/meeting-id'

const TIMEZONES = ['EST (US & Canada)', 'EDT (US & Canada)', 'CST (US & Canada)', 'PST (US & Canada)']
const EXPORT_MODES = ['Standard', 'Compact', 'Do not export']

const listeners = new Set<() => void>()
let cache: Meeting[] | null = null

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

export function defaultAgenda(): AgendaItem[] {
  return ['Check in', 'Admin', 'Report', 'Discussion', 'Decision', 'Closing'].map((title) => ({
    id: uid('ag'),
    title,
    minutes: 10,
    actualMinutes: null,
    timerRunning: false,
    timerStartedAt: null,
    presenter: '',
    notes: '',
  }))
}

function weeklyAgenda(opts: {
  presenters?: boolean
  actuals?: [number | null, number | null, number | null, number | null]
  runningIndex?: number
}): AgendaItem[] {
  const titles = [
    { title: 'Admin', minutes: 5, presenter: 'Robin Quill', notes: 'Accept agenda/group attendance\nRecap of last meeting decisions\nNext meeting time' },
    { title: 'Discussion', minutes: 20, presenter: 'Jane Doe', notes: 'Ahead of the meeting, include any exploration(s) to be discussed during the meeting.\nRoadmap for project\nFinalize group split assignments' },
    { title: 'Decision', minutes: 10, presenter: 'Remy Oak', notes: 'Ahead of the meeting, include any decision(s) to be made during the meeting.\nWill the 2 groups meet separately?\nFinalize draft of project roadmap' },
    { title: 'Closing', minutes: 10, presenter: 'Jane Doe', notes: 'Evaluation of meeting and possible goals for next meeting.' },
  ]
  return titles.map((row, index) => {
    const actual = opts.actuals ? opts.actuals[index] : null
    const running = opts.runningIndex === index
    return {
      id: uid('ag'),
      title: row.title,
      minutes: row.minutes,
      actualMinutes: actual,
      timerRunning: running,
      timerStartedAt: running ? Date.now() : null,
      presenter: opts.presenters ? row.presenter : '',
      notes: row.notes,
    }
  })
}

function defaultParticipants(): Participant[] {
  return TEST_MEETING_PARTICIPANTS.map((person) => ({
    id: uid('p'),
    ...person,
  }))
}

function meeting(partial: Partial<Meeting> & Pick<Meeting, 'id' | 'name' | 'status'>): Meeting {
  const agenda = partial.agenda ?? defaultAgenda()
  return {
    date: '',
    startTime: DEFAULT_TIME,
    timezone: DEFAULT_ZONE,
    description: 'This is a meeting description example for this meeting. This description could be long.',
    zoomLink: ZOOM_DEMO,
    reminderDate: '',
    reminderTime: '',
    reminderTimezone: DEFAULT_ZONE,
    exportMode: EXPORT_MODES[0],
    agenda,
    participants: partial.participants ?? defaultParticipants(),
    facilitator: 'Jane Doe',
    notetaker: 'Wren Maple',
    timekeeper: 'Robin Quill',
    files: [],
    minutes: '',
    agendaDocument: '',
    workspaceId: 'ux',
    ...partial,
  }
}

const KICKOFF_MINUTES = `Admin
Accept agenda and attendance
Recap of last meeting decisions
Next meeting time

Discussion
Roadmap for the project
Group assignments

Decision
Coordination over chat vs separate meetings
Identify lead and coordination members

Closing
Evaluation of meeting and goals for next meeting.`

function seedMeetings(): Meeting[] {
  return [
    meeting({
      id: '5th-child-group',
      name: '5th UX Team Meeting',
      date: '2026-10-22',
      startTime: '16:30',
      status: 'planning',
      description: 'Weekly UX working session. Status will update to Running when a timer is started on the first agenda item.',
      agenda: weeklyAgenda({}),
    }),
    meeting({
      id: 'fourth-dept',
      name: 'Fourth UX Team Meeting',
      date: '2026-10-22',
      startTime: '16:30',
      status: 'planned',
      agenda: weeklyAgenda({ presenters: true }),
    }),
    meeting({
      id: 'fifth-dept',
      name: 'Fifth UX Team Meeting',
      date: '2026-11-12',
      startTime: '16:30',
      status: 'planned',
      agenda: weeklyAgenda({}),
    }),
    meeting({
      id: 'final-dept',
      name: 'Final UX Team Meeting',
      date: '2026-12-03',
      startTime: '16:30',
      status: 'planned',
      agenda: weeklyAgenda({}),
    }),
    meeting({
      id: 'org-planning',
      name: 'Organization Planning Meeting',
      date: '2026-10-27',
      startTime: '10:00',
      status: 'planning',
      workspaceId: 'organization',
      description: 'Coordinate the Integrated Digital Agency class, shared planning, and organization-wide resources.',
      agenda: weeklyAgenda({}),
    }),
    meeting({
      id: 'draft-agenda',
      name: 'Agenda workshop',
      status: 'draft',
      zoomLink: '',
      description: 'Needs a date before it can be scheduled.',
    }),
    meeting({
      id: 'draft-sync',
      name: 'UX Team sync',
      status: 'draft',
      zoomLink: '',
      description: 'Placeholder draft for a date that is not set yet.',
    }),
    meeting({
      id: 'dept-20',
      name: 'UX Team meeting #20',
      date: '2026-10-09',
      startTime: '16:00',
      status: 'running',
      agenda: weeklyAgenda({
        presenters: true,
        actuals: [7, 31, null, null],
        runningIndex: 1,
      }),
      minutes: '',
    }),
    meeting({
      id: 'dept-19',
      name: 'UX Team meeting #19',
      date: '2026-10-02',
      startTime: '16:00',
      status: 'completed',
      agenda: weeklyAgenda({ presenters: true, actuals: [7, 31, 18, 6] }),
      minutes: KICKOFF_MINUTES,
    }),
    meeting({
      id: 'dept-18',
      name: 'UX Team meeting #18',
      date: '2026-09-25',
      startTime: '16:00',
      status: 'completed',
      agenda: weeklyAgenda({ presenters: true, actuals: [8, 22, 11, 9] }),
      minutes: KICKOFF_MINUTES,
    }),
    meeting({
      id: 'dept-17',
      name: 'UX Team meeting #17',
      date: '2026-09-18',
      startTime: '16:00',
      status: 'completed',
      agenda: weeklyAgenda({ presenters: true, actuals: [6, 19, 12, 8] }),
      minutes: KICKOFF_MINUTES,
    }),
    meeting({
      id: 'dept-16',
      name: 'UX Team meeting #16',
      date: '2026-09-11',
      startTime: '16:00',
      status: 'completed',
      agenda: weeklyAgenda({ presenters: true, actuals: [5, 18, 10, 10] }),
      minutes: KICKOFF_MINUTES,
    }),
    meeting({
      id: 'dept-15',
      name: 'UX Team meeting #15',
      date: '2026-09-04',
      startTime: '16:00',
      status: 'planned',
      agenda: weeklyAgenda({}),
    }),
    meeting({
      id: 'dept-14',
      name: 'UX Team meeting #14',
      date: '2026-08-28',
      startTime: '16:00',
      status: 'completed',
      agenda: weeklyAgenda({ presenters: true, actuals: [5, 20, 10, 9] }),
      minutes: KICKOFF_MINUTES,
    }),
  ].map((row) => ({
    ...row,
    agendaDocument: row.agendaDocument || buildAgendaDocument(row),
  }))
}

export const ATTENDANCE_COLUMNS: AttendanceColumn[] = [
  { id: 'kickoff', name: 'Meeting Kickoff', date: '2026-09-03' },
  { id: 'dept-1', name: 'UX Team meeting #1', date: '2026-09-10' },
  { id: 'dept-2', name: 'UX Team meeting #2', date: '2026-09-17' },
]

export const ATTENDANCE_PEOPLE: AttendancePerson[] = TEST_ATTENDANCE_PEOPLE.map((person) => ({
  name: person.name,
  marks: { ...person.marks },
}))

export const TIMEZONE_OPTIONS = TIMEZONES
export const EXPORT_OPTIONS = EXPORT_MODES

function emit() {
  listeners.forEach((listener) => listener())
}

function rebaseRunningTimers(rows: Meeting[]): Meeting[] {
  const now = Date.now()
  return rows.map((row) => ({
    ...row,
    agenda: row.agenda.map((item) => {
      if (!item.timerRunning || !item.timerStartedAt) {
        return item
      }
      return {
        ...item,
        actualMinutes: liveActual(item, now),
        timerStartedAt: now,
      }
    }),
  }))
}

function readStore(): Meeting[] {
  if (cache) {
    return cache
  }
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (raw) {
      cache = rebaseRunningTimers((JSON.parse(raw) as Meeting[]).map(withDemoNames))
      sessionStorage.setItem(STORE_KEY, JSON.stringify(cache))
      return cache
    }
  } catch {
    /* use seed */
  }
  cache = seedMeetings()
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(cache))
  } catch {
    /* private mode */
  }
  return cache
}

function writeStore(next: Meeting[]) {
  cache = next
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
  emit()
}

export function listMeetings(): Meeting[] {
  return readStore()
}

export function getMeeting(id: string): Meeting | undefined {
  return readStore().find((row) => row.id === id)
}

export function saveMeeting(next: Meeting): Meeting {
  const rows = readStore()
  const index = rows.findIndex((row) => row.id === next.id)
  const prepared = {
    ...next,
    agendaDocument: next.agendaDocument || buildAgendaDocument(next),
  }
  if (index === -1) {
    writeStore([prepared, ...rows])
  } else {
    const copy = rows.slice()
    copy[index] = prepared
    writeStore(copy)
  }
  return prepared
}

export function deleteMeeting(id: string) {
  writeStore(readStore().filter((row) => row.id !== id))
}

export function cloneMeeting(id: string): Meeting | undefined {
  const source = getMeeting(id)
  if (!source) {
    return undefined
  }
  const copy = {
    ...source,
    id: uid('m'),
    name: `Copy of ${source.name}`,
    status: 'planning' as MeetingStatus,
    minutes: source.minutes,
    agenda: source.agenda.map((item) => ({
      ...item,
      id: uid('ag'),
      actualMinutes: null,
      timerRunning: false,
      timerStartedAt: null,
    })),
    participants: source.participants.map((person) => ({ ...person, id: uid('p') })),
  }
  return saveMeeting(copy)
}

export function createBlankMeeting(workspaceId: WorkspaceId): Meeting {
  return meeting({
    id: uid('m'),
    name: '',
    date: DEFAULT_DATE,
    startTime: DEFAULT_TIME,
    status: 'planning',
    workspaceId,
    description: '',
    agenda: defaultAgenda(),
    minutes: '',
    agendaDocument: '',
  })
}

export function plannedMinutes(meetingRow: Meeting): number {
  return meetingRow.agenda.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0)
}

export function liveActual(item: AgendaItem, now = Date.now()): number {
  const base = item.actualMinutes ?? 0
  if (item.timerRunning && item.timerStartedAt) {
    return base + (now - item.timerStartedAt) / 60000
  }
  return base
}

export function actualMinutesTotal(meetingRow: Meeting, now = Date.now()): number {
  return meetingRow.agenda.reduce((sum, item) => {
    if (item.actualMinutes == null && !item.timerRunning) {
      return sum
    }
    return sum + liveActual(item, now)
  }, 0)
}

export function displayActual(item: AgendaItem, now = Date.now()): string {
  if (item.actualMinutes == null && !item.timerRunning) {
    return '–'
  }
  return `${Math.max(0, Math.round(liveActual(item, now)))} minutes`
}

export function displayActualShort(item: AgendaItem, now = Date.now()): string {
  if (item.actualMinutes == null && !item.timerRunning) {
    return '–'
  }
  return `${Math.max(0, Math.round(liveActual(item, now)))} min`
}

export function startAgendaItem(meetingId: string, itemId: string) {
  const row = getMeeting(meetingId)
  if (!row || row.status === 'completed') {
    return
  }
  const now = Date.now()
  const agenda = row.agenda.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        timerRunning: true,
        timerStartedAt: now,
        actualMinutes: item.actualMinutes ?? 0,
      }
    }
    if (item.timerRunning) {
      return {
        ...item,
        timerRunning: false,
        actualMinutes: liveActual(item, now),
        timerStartedAt: null,
      }
    }
    return item
  })
  const nextStatus =
    row.status === 'planning' || row.status === 'draft' || row.status === 'planned' || row.status === 'scheduled'
      ? 'running'
      : row.status
  saveMeeting({ ...row, agenda, status: nextStatus })
}

export function stopAgendaItem(meetingId: string, itemId?: string) {
  const row = getMeeting(meetingId)
  if (!row) {
    return
  }
  const now = Date.now()
  saveMeeting({
    ...row,
    agenda: row.agenda.map((item) => {
      if (!item.timerRunning) {
        return item
      }
      if (itemId && item.id !== itemId) {
        return item
      }
      return {
        ...item,
        timerRunning: false,
        actualMinutes: liveActual(item, now),
        timerStartedAt: null,
      }
    }),
  })
}

export function setMeetingStatus(meetingId: string, status: MeetingStatus) {
  const row = getMeeting(meetingId)
  if (!row) {
    return
  }
  const now = Date.now()
  const agenda =
    status === 'completed'
      ? row.agenda.map((item) =>
          item.timerRunning
            ? { ...item, timerRunning: false, actualMinutes: liveActual(item, now), timerStartedAt: null }
            : item,
        )
      : row.agenda
  saveMeeting({ ...row, status, agenda })
}

export function buildAgendaDocument(row: Pick<Meeting, 'name' | 'description' | 'agenda'>): string {
  const blocks = row.agenda.map((item) => {
    const body = item.notes.trim() || `Discuss ${item.title.toLowerCase()} for this meeting.`
    return `${item.title}\n${body}`
  })
  return [row.description.trim(), '', ...blocks].filter((part, index, all) => part || all[index - 1]).join('\n\n')
}

export function weaverTranscribe(row: Meeting): string {
  const when = row.date ? `${row.date} ${row.startTime}` : 'Date not set'
  const roles = [
    row.facilitator && `Facilitator: ${row.facilitator}`,
    row.notetaker && `Notetaker: ${row.notetaker}`,
    row.timekeeper && `Timekeeper: ${row.timekeeper}`,
  ]
    .filter(Boolean)
    .join('\n')
  const items = row.agenda
    .map((item, index) => {
      const who = item.presenter ? ` — ${item.presenter}` : ''
      const body = item.notes.trim() || `Discussed ${item.title.toLowerCase()}.`
      return `${index + 1}. ${item.title}${who}\n${body}`
    })
    .join('\n\n')
  return `${row.name}\n${when}\n\n${roles}\n\nTranscript\n\n${row.description.trim() || 'No description recorded.'}\n\n${items}`
}

export function weaverSummarize(row: Meeting): string {
  const points = row.agenda.map((item) => {
    const who = item.presenter ? ` (${item.presenter})` : ''
    return `• ${item.title}${who}: ${item.notes.split('\n')[0] || `Covered ${item.title.toLowerCase()}.`}`
  })
  return `${row.name} — summary\n\n${points.join('\n')}\n\nNext steps: follow up on open decisions and share these minutes with the group.`
}

export function askWeaverAgenda(row: Meeting): string {
  const intro = `${row.name}\n\n${row.description.trim() || 'No description yet.'}\n`
  const outline = row.agenda
    .map((item, index) => {
      const bullets = item.notes
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const extra = bullets.length
        ? bullets.map((line) => `• ${line}`).join('\n')
        : `• Cover ${item.title.toLowerCase()} (${item.minutes} min)`
      return `${index + 1}. ${item.title}\n${extra}`
    })
    .join('\n\n')
  return `${intro}\nSuggested agenda\n\n${outline}`
}

export function formatTime(hhmm: string): string {
  if (!hhmm) {
    return ''
  }
  const [hours, minutes] = hhmm.split(':').map(Number)
  if (Number.isNaN(hours)) {
    return hhmm
  }
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes || 0).padStart(2, '0')} ${suffix}`
}

export function formatDateLong(iso: string): string {
  if (!iso) {
    return ''
  }
  const date = parseIsoDate(iso)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatWeekdayTime(row: Meeting): string {
  if (!row.date) {
    return 'Date not set'
  }
  const date = parseIsoDate(row.date)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  return `${weekday}, ${formatTime(row.startTime)}`
}

export function dateParts(iso: string): { month: string; day: string } {
  if (!iso) {
    return { month: '—', day: '' }
  }
  const date = parseIsoDate(iso)
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: String(date.getDate()),
  }
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function endTime(row: Meeting): string {
  if (!row.startTime) {
    return ''
  }
  const [hours, minutes] = row.startTime.split(':').map(Number)
  const total = hours * 60 + (minutes || 0) + plannedMinutes(row)
  const endHours = Math.floor(total / 60) % 24
  const endMinutes = total % 60
  return formatTime(`${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`)
}

export function statusLabel(status: MeetingStatus): string {
  if (status === 'draft') {
    return 'Draft'
  }
  if (status === 'running') {
    return 'Running'
  }
  if (status === 'completed') {
    return 'Completed'
  }
  return 'Planning'
}

export function workspaceLabel(id: WorkspaceId): string {
  return workspaces[normalizeWorkspaceId(id)].name
}

export function zoomLabel(link: string): string {
  if (!link) {
    return '{Demo dead link}'
  }
  return link.replace(/^https?:\/\//, '')
}

export function cycleMark(current: AttendanceMark): AttendanceMark {
  if (current === 'yes') {
    return 'no'
  }
  if (current === 'no') {
    return 'none'
  }
  return 'yes'
}

export function markIcon(mark: AttendanceMark): string {
  if (mark === 'yes') {
    return '●'
  }
  if (mark === 'no') {
    return '○'
  }
  return '◌'
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMeetings(): Meeting[] {
  return useSyncExternalStore(subscribe, readStore, readStore)
}

export function useMeeting(id: string | undefined): Meeting | undefined {
  const rows = useMeetings()
  return rows.find((row) => row.id === id)
}

export function upcomingMeetings(rows: Meeting[]): Meeting[] {
  return rows.filter((row) => row.date && row.status !== 'completed' && row.status !== 'draft')
}

export function draftMeetings(rows: Meeting[]): Meeting[] {
  return rows.filter((row) => !row.date || row.status === 'draft')
}

export function pastMeetings(rows: Meeting[]): Meeting[] {
  return rows.filter((row) => row.status === 'completed')
}

export function recordMeetings(rows: Meeting[]): Meeting[] {
  return rows.filter((row) => row.status !== 'draft')
}

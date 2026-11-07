import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  EXPORT_OPTIONS,
  TIMEZONE_OPTIONS,
  actualMinutesTotal,
  askWeaverAgenda,
  buildAgendaDocument,
  cloneMeeting,
  cycleMark,
  displayActual,
  displayActualShort,
  endTime,
  formatDateLong,
  formatTime,
  liveActual,
  markIcon,
  plannedMinutes,
  saveMeeting,
  setMeetingStatus,
  startAgendaItem,
  statusLabel,
  stopAgendaItem,
  useMeeting,
  type AgendaItem,
  type AttendanceMark,
  type Meeting,
  type MeetingStatus,
  type Participant,
} from '../data/meetings'
import { normalizeWorkspaceId, workspaces } from '../data/workspaces'

type Tool = 'setup' | 'participants' | 'overview'
type ReportsTab = 'agenda' | 'minutes'

const TRANSCRIPT_SAMPLE =
  'This is a demo of an AI integration feature we are planning in development. This is where all things said in the meeting while this is recording will be captured. It will look something like this as the speakers are talking: a rough transcription will be developed using Whisper, or a similar speech-to-text API integration. It will likely appear slowly, in short phrases rather than all at once, so we can avoid bugs by buffering a few seconds of audio, waiting until the API returns a finalized segment, and then appending that text instead of rewriting the whole log. Partial guesses stay on a scratch line until the model confirms them, so earlier lines do not jump around or duplicate. A live caption from Whisper usually lags a beat behind the room, then a cluster of words lands together. We would send small audio chunks in order, keep speaker turns stable, and only commit a line once the segment is locked. The minutes can still be summarized later from this same capture, without needing a perfectly clean transcript in real time.'

function nextTranscriptEnd(full: string, from: number) {
  const rest = full.slice(from)
  if (!rest) {
    return from
  }
  const phrase = rest.match(/^(?:\s*\S+){2,8}?\s*[.:,](?:\s+|$)/)
  if (phrase) {
    return from + phrase[0].length
  }
  const words = rest.match(/^(?:\s*\S+){4,7}\s*/)
  return from + (words ? words[0].length : rest.length)
}

function scribeDraftSummary(row: Meeting) {
  const covered = row.agenda
    .map((item) => {
      const who = item.presenter ? ` (${item.presenter})` : ''
      const note = item.notes.split('\n')[0] || `Covered ${item.title.toLowerCase()}.`
      return `• ${item.title}${who}: ${note}`
    })
    .join('\n')
  return `${row.name} — draft summary\n\nFrom this recording:\nA rough live transcript was captured with Whisper, or a similar speech-to-text API. Phrases were appended as each segment finalized, so earlier lines would not jump.\n\nDiscussion\n${covered || '• No agenda items were listed.'}\n\nNext steps: review this draft, add it to the minutes, then edit names and decisions as needed.`
}

function pauseBeforeChunk(full: string, from: number) {
  const end = nextTranscriptEnd(full, from)
  const words = full.slice(from, end).trim().split(/\s+/).filter(Boolean).length
  const spoken = Math.round((words / 5.2) * 1000)
  const prev = full.slice(0, from).trimEnd().slice(-1)
  let breath = 50
  if (from === 0) {
    breath = 90
  } else if (prev === '.') {
    breath = 140
  } else if (prev === ',' || prev === ':') {
    breath = 70
  }
  return Math.max(140, spoken + breath)
}

function recordClock(started: number | null, now: number) {
  if (!started) {
    return '00:00'
  }
  const seconds = Math.max(0, Math.floor((now - started) / 1000))
  const minutesPart = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secondsPart = String(seconds % 60).padStart(2, '0')
  return `${minutesPart}:${secondsPart}`
}

type ScribeSession = {
  recording: boolean
  recordStarted: number | null
  recordNow: number
  showTranscript: boolean
  typedTranscript: string
  showSummary: boolean
  summaryAdded: boolean
  scribeOpen: boolean
  tab: ReportsTab
}

function MeetingRoomPage() {
  const { id } = useParams()
  const meeting = useMeeting(id)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tool, setTool] = useState<Tool>('setup')
  const [reportsOpen, setReportsOpen] = useState(params.get('reports') === '1')
  const [selectedAgenda, setSelectedAgenda] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [notice, setNotice] = useState('')
  const [scribe, setScribe] = useState<ScribeSession>({
    recording: false,
    recordStarted: null,
    recordNow: Date.now(),
    showTranscript: false,
    typedTranscript: '',
    showSummary: false,
    summaryAdded: false,
    scribeOpen: false,
    tab: 'agenda',
  })

  useEffect(() => {
    setReportsOpen(params.get('reports') === '1')
  }, [params])

  useEffect(() => {
    const running = meeting?.agenda.some((item) => item.timerRunning)
    if (!running) {
      return
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [meeting])

  useEffect(() => {
    if (!scribe.recording) {
      return
    }
    const timer = window.setInterval(() => {
      setScribe((session) => ({ ...session, recordNow: Date.now() }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [scribe.recording])

  useEffect(() => {
    if (!scribe.recording || scribe.typedTranscript.length >= TRANSCRIPT_SAMPLE.length) {
      return
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setScribe((session) => ({ ...session, typedTranscript: TRANSCRIPT_SAMPLE }))
      return
    }
    const timer = window.setTimeout(() => {
      setScribe((session) => {
        const end = nextTranscriptEnd(TRANSCRIPT_SAMPLE, session.typedTranscript.length)
        return { ...session, typedTranscript: TRANSCRIPT_SAMPLE.slice(0, end) }
      })
    }, pauseBeforeChunk(TRANSCRIPT_SAMPLE, scribe.typedTranscript.length))
    return () => window.clearTimeout(timer)
  }, [scribe.recording, scribe.typedTranscript])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeReports()
      }
    }
    if (reportsOpen) {
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
  }, [reportsOpen])

  function closeReports() {
    setReportsOpen(false)
    if (params.get('reports')) {
      params.delete('reports')
      setParams(params, { replace: true })
    }
  }

  function openReports(tab?: ReportsTab) {
    if (tab) {
      setScribe((session) => ({ ...session, tab, scribeOpen: session.recording || session.scribeOpen }))
    }
    setReportsOpen(true)
    params.set('reports', '1')
    setParams(params, { replace: true })
  }

  function toggleRecord() {
    setScribe((session) => {
      if (session.recording) {
        return { ...session, recording: false, recordStarted: null }
      }
      return {
        ...session,
        recording: true,
        recordStarted: Date.now(),
        recordNow: Date.now(),
        showTranscript: true,
        typedTranscript: '',
        showSummary: false,
        summaryAdded: false,
        scribeOpen: true,
        tab: 'minutes',
      }
    })
  }

  function flash(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 1600)
  }

  if (!meeting) {
    return (
      <section className="meeting-page">
        <h1>Meeting not found</h1>
        <p>That meeting is not in this demo store.</p>
        <Link className="text-link" to="/meetings">
          Back to My Meetings
        </Link>
      </section>
    )
  }

  const current = meeting
  const workspace = workspaces[normalizeWorkspaceId(current.workspaceId)]
  const timersOff = current.status === 'completed'
  const selected =
    current.agenda.find((item) => item.id === selectedAgenda) ??
    current.agenda.find((item) => item.timerRunning) ??
    current.agenda[0]

  async function headerAction() {
    if (current.status === 'running' && current.zoomLink) {
      window.open(current.zoomLink, '_blank', 'noreferrer')
      return
    }
    if (current.status === 'completed') {
      const copy = cloneMeeting(current.id)
      if (copy) {
        navigate(`/meetings/${copy.id}`)
      }
      return
    }
    flash('Queued')
  }

  function headerLabel() {
    if (current.status === 'running') {
      return 'Join Call'
    }
    if (current.status === 'completed') {
      return 'Clone Meeting'
    }
    return 'Send Emails'
  }

  return (
    <section className={`meeting-room${reportsOpen ? ' reports-open' : ''}`}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item">
          <img src="/house0.svg" alt="" width={12} height={12} />
          <Link to={workspace.path}>{workspace.name}</Link>
        </span>
        <span className="breadcrumb-item">
          <img src="/chevron-right0.svg" alt="" width={12} height={12} />
          <Link to="/meetings/all">Meetings</Link>
        </span>
        <span className="breadcrumb-item">
          <img src="/chevron-right0.svg" alt="" width={12} height={12} />
          <span aria-current="page">{current.name}</span>
        </span>
      </nav>

      <header className="room-head">
        <div>
          <div className="title-row">
            <h1>{current.name}</h1>
            <span className={`status-pill status-${current.status}`}>{statusLabel(current.status)}</span>
          </div>
          <p className="room-when">
            {current.date ? `${formatTime(current.startTime)}${endTime(current) ? ` – ${endTime(current)}` : ''}` : 'Date not set'}
            {current.zoomLink ? (
              <>
                {' '}
                <a href={current.zoomLink} target="_blank" rel="noreferrer">
                  Zoom (Online)
                </a>
              </>
            ) : null}
          </p>
        </div>
        <button className={current.status === 'completed' ? 'chip' : 'button-light'} type="button" onClick={headerAction}>
          {headerLabel()}
        </button>
      </header>
      {notice ? <p className="toast">{notice}</p> : null}

      <div className="room-layout">
        <aside className="room-rail">
          <section className="rail-card" aria-labelledby="tools-title">
            <h2 id="tools-title">Meeting tools</h2>
            {(['setup', 'participants', 'overview'] as Tool[]).map((item) => (
              <button
                key={item}
                className={`rail-btn${tool === item ? ' current' : ''}`}
                type="button"
                onClick={() => setTool(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button className={`rail-btn${reportsOpen ? ' current' : ''}`} type="button" onClick={() => openReports()}>
              Reports
            </button>
          </section>

          <section className="rail-card" aria-labelledby="agenda-rail-title">
            <h2 id="agenda-rail-title">Agenda</h2>
            <ul className="agenda-rail">
              {current.agenda.map((item, index) => (
                <li key={item.id}>
                  <button
                    className={`agenda-card${selected?.id === item.id ? ' selected' : ''}${item.timerRunning ? ' running' : ''}${item.timerRunning && liveActual(item, now) > item.minutes ? ' overtime' : ''}`}
                    type="button"
                    onClick={() => setSelectedAgenda(item.id)}
                  >
                    <strong>
                      {index + 1}. {item.title}
                    </strong>
                    <span>
                      {item.minutes} min · Actual: {displayActualShort(item, now)}
                    </span>
                  </button>
                  {selected?.id === item.id && !timersOff ? (
                    <div className="agenda-timer-actions">
                      {item.timerRunning ? (
                        <button className="chip" type="button" onClick={() => stopAgendaItem(current.id, item.id)}>
                          Stop
                        </button>
                      ) : (
                        <button className="chip" type="button" onClick={() => startAgendaItem(current.id, item.id)}>
                          Start
                        </button>
                      )}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <button
              className="chip"
              type="button"
              onClick={() =>
                saveMeeting({
                  ...current,
                  agenda: [
                    ...current.agenda,
                    {
                      id: `ag-${Date.now()}`,
                      title: 'New item',
                      minutes: 10,
                      actualMinutes: null,
                      timerRunning: false,
                      timerStartedAt: null,
                      presenter: '',
                      notes: '',
                    },
                  ],
                })
              }
            >
              + Add New Item
            </button>
          </section>
        </aside>

        <div className="room-main panel">
          {tool === 'setup' ? <SetupPanel meeting={current} flash={flash} /> : null}
          {tool === 'participants' ? <ParticipantsPanel meeting={current} flash={flash} /> : null}
          {tool === 'overview' ? <OverviewPanel meeting={current} now={now} /> : null}
        </div>
      </div>

      {reportsOpen ? (
        <ReportsOverlay meeting={current} scribe={scribe} setScribe={setScribe} onToggleRecord={toggleRecord} onClose={closeReports} />
      ) : null}

      {!reportsOpen && (scribe.recording || scribe.showTranscript) ? (
        <div className={`scribe-dock${scribe.recording ? ' is-live' : ''}`}>
          <div className="scribe-bubble" role="status">
            <p>
              {scribe.recording
                ? 'Recording is still going. Open Reports to review the transcript and generate a draft.'
                : 'Recording stopped. Open Reports to review the transcript and generate a draft.'}
            </p>
            <button className="chip" type="button" onClick={() => openReports('minutes')}>
              Review in Reports
            </button>
          </div>
          {scribe.recording ? (
            <button
              className="scribe-dock-stop"
              type="button"
              onClick={toggleRecord}
              aria-label={`Stop recording ${recordClock(scribe.recordStarted, scribe.recordNow)}`}
            >
              <span className="record-dot" aria-hidden="true" />
              Stop
              <span className="scribe-dock-time">{recordClock(scribe.recordStarted, scribe.recordNow)}</span>
            </button>
          ) : (
            <button
              className="scribe-dock-tab"
              type="button"
              onClick={() => openReports('minutes')}
              aria-label="Open reports"
            >
              Reports
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}

function SetupPanel({ meeting, flash }: { meeting: Meeting; flash: (message: string) => void }) {
  const [draft, setDraft] = useState(meeting)

  useEffect(() => {
    setDraft(meeting)
  }, [meeting])

  function patch<K extends keyof Meeting>(key: K, value: Meeting[K]) {
    setDraft((row) => ({ ...row, [key]: value }))
  }

  return (
    <form
      className="setup-form"
      onSubmit={(event) => {
        event.preventDefault()
        saveMeeting(draft)
        flash('Saved')
      }}
    >
      <h2>Setup</h2>
      <label className="field">
        <span>Meeting name</span>
        <input value={draft.name} onChange={(event) => patch('name', event.target.value)} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Date</span>
          <input type="date" value={draft.date} onChange={(event) => patch('date', event.target.value)} />
        </label>
        <label className="field">
          <span>Start time</span>
          <input type="time" value={draft.startTime} onChange={(event) => patch('startTime', event.target.value)} />
        </label>
        <label className="field">
          <span>Timezone</span>
          <select value={draft.timezone} onChange={(event) => patch('timezone', event.target.value)}>
            {TIMEZONE_OPTIONS.map((zone) => (
              <option key={zone}>{zone}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Description</span>
        <textarea rows={4} value={draft.description} onChange={(event) => patch('description', event.target.value)} />
      </label>
      <label className="field">
        <span>Meeting link</span>
        <input value={draft.zoomLink} onChange={(event) => patch('zoomLink', event.target.value)} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Reminder date</span>
          <input type="date" value={draft.reminderDate} onChange={(event) => patch('reminderDate', event.target.value)} />
        </label>
        <label className="field">
          <span>Reminder time</span>
          <input type="time" value={draft.reminderTime} onChange={(event) => patch('reminderTime', event.target.value)} />
        </label>
        <label className="field">
          <span>Reminder timezone</span>
          <select value={draft.reminderTimezone} onChange={(event) => patch('reminderTimezone', event.target.value)}>
            {TIMEZONE_OPTIONS.map((zone) => (
              <option key={zone}>{zone}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Export mode</span>
        <select value={draft.exportMode} onChange={(event) => patch('exportMode', event.target.value)}>
          {EXPORT_OPTIONS.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button className="chip" type="button" onClick={() => flash('Queued')}>
          Send reminder now
        </button>
        <button className="button-light" type="submit">
          Save settings
        </button>
      </div>
    </form>
  )
}

function ParticipantsPanel({ meeting, flash }: { meeting: Meeting; flash: (message: string) => void }) {
  const [editing, setEditing] = useState(false)
  const expectedCount = meeting.participants.filter((person) => person.expected === 'yes').length
  const pending = meeting.participants.filter((person) => person.timeProposal).length

  function patchPerson(id: string, patch: Partial<Participant>) {
    saveMeeting({
      ...meeting,
      participants: meeting.participants.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    })
  }

  function cycleRole(key: 'facilitator' | 'notetaker' | 'timekeeper') {
    const names = meeting.participants.map((person) => person.name)
    const current = meeting[key]
    const index = Math.max(0, names.indexOf(current))
    const next = names[(index + 1) % names.length] || current
    const roleLabel = key === 'facilitator' ? 'Facilitator' : key === 'notetaker' ? 'Notetaker' : 'Timekeeper'
    saveMeeting({
      ...meeting,
      [key]: next,
      participants: meeting.participants.map((person) => {
        if (person.name === next) {
          return { ...person, role: roleLabel }
        }
        if (person.name === current && person.role === roleLabel) {
          return { ...person, role: 'Member' }
        }
        return person
      }),
    })
  }

  function addPerson() {
    saveMeeting({
      ...meeting,
      participants: [
        ...meeting.participants,
        {
          id: `p-${Date.now()}`,
          name: 'New participant',
          role: 'Member',
          attended: 'none',
          expected: 'none',
          note: '',
          timeProposal: '',
        },
      ],
    })
  }

  function removePerson(id: string) {
    saveMeeting({
      ...meeting,
      participants: meeting.participants.filter((person) => person.id !== id),
    })
  }

  return (
    <div className="participants-panel">
      <div className="card-heading">
        <h2>Participants</h2>
        <div className="form-actions">
          <button className="chip" type="button" onClick={() => flash('Queued')}>
            Send reminder now
          </button>
          <button className="chip" type="button" onClick={() => setEditing((open) => !open)}>
            {editing ? 'Done' : 'Edit participants'}
          </button>
        </div>
      </div>

      <div className="role-cards">
        <RoleCard title="Facilitator" value={meeting.facilitator} onEdit={() => cycleRole('facilitator')} />
        <RoleCard title="Notetaker" value={meeting.notetaker} onEdit={() => cycleRole('notetaker')} />
        <RoleCard title="Timekeeper" value={meeting.timekeeper} onEdit={() => cycleRole('timekeeper')} />
      </div>

      <p className="legend-row">
        <span>Yes ●</span>
        <span>No ○</span>
        <span>No response ◌</span>
      </p>

      <div className="table-scroll">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Attended</th>
              <th>Expected</th>
              <th>Note</th>
              <th>Time proposal</th>
              {editing ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {meeting.participants.map((person) => (
              <tr key={person.id}>
                <td>
                  {editing ? (
                    <input value={person.name} onChange={(event) => patchPerson(person.id, { name: event.target.value })} />
                  ) : (
                    person.name
                  )}
                </td>
                <td>
                  <MarkButton mark={person.attended} onClick={() => patchPerson(person.id, { attended: cycleMark(person.attended) })} />
                </td>
                <td>
                  <MarkButton mark={person.expected} onClick={() => patchPerson(person.id, { expected: cycleMark(person.expected) })} />
                </td>
                <td>
                  <NoteCell
                    value={person.note}
                    placeholder="+ Add Note"
                    onSave={(note) => patchPerson(person.id, { note })}
                  />
                </td>
                <td>
                  <NoteCell
                    value={person.timeProposal}
                    placeholder="+ Add Time Proposal"
                    onSave={(timeProposal) => patchPerson(person.id, { timeProposal })}
                  />
                </td>
                {editing ? (
                  <td>
                    <button className="icon-text" type="button" onClick={() => removePerson(person.id)}>
                      Remove
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing ? (
        <button className="chip" type="button" onClick={addPerson}>
          + Add participant
        </button>
      ) : null}
      <p className="participants-foot">
        {meeting.participants.length} participants, {expectedCount} expected — {pending} pending proposal
      </p>
    </div>
  )
}

function RoleCard({ title, value, onEdit }: { title: string; value: string; onEdit: () => void }) {
  return (
    <article className="role-card">
      <p>{title}</p>
      <strong>{value || 'Unassigned'}</strong>
      <button className="icon-text" type="button" onClick={onEdit}>
        Edit
      </button>
    </article>
  )
}

function MarkButton({ mark, onClick }: { mark: AttendanceMark; onClick: () => void }) {
  return (
    <button className={`mark-btn mark-${mark}`} type="button" onClick={onClick} aria-label={mark}>
      {markIcon(mark)}
    </button>
  )
}

function NoteCell({
  value,
  placeholder,
  onSave,
}: {
  value: string
  placeholder: string
  onSave: (value: string) => void
}) {
  const [open, setOpen] = useState(Boolean(value))
  const [text, setText] = useState(value)

  useEffect(() => {
    setText(value)
    setOpen(Boolean(value))
  }, [value])

  if (!open) {
    return (
      <button className="icon-text" type="button" onClick={() => setOpen(true)}>
        {placeholder}
      </button>
    )
  }

  return (
    <input
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => onSave(text)}
    />
  )
}

function OverviewPanel({ meeting, now }: { meeting: Meeting; now: number }) {
  const planned = plannedMinutes(meeting)
  const actual = Math.round(actualMinutesTotal(meeting, now))
  const stage: MeetingStatus =
    meeting.status === 'completed' ? 'completed' : meeting.status === 'running' ? 'running' : 'planning'

  function overviewCopy() {
    if (stage === 'running') {
      return 'Meeting is running. Agenda timers update actual duration as items are started and stopped.'
    }
    if (stage === 'completed') {
      return 'Meeting is completed. Timers are stopped.'
    }
    return 'Meeting has been planned. Status will update to Running when a timer is started on the first agenda item.'
  }

  function setPresenter(item: AgendaItem, presenter: string) {
    saveMeeting({
      ...meeting,
      agenda: meeting.agenda.map((row) => (row.id === item.id ? { ...row, presenter } : row)),
    })
  }

  return (
    <div className="overview-panel">
      <h2>Overview</h2>
      <p>{overviewCopy()}</p>
      <ol className="status-stepper">
        {(['planning', 'running', 'completed'] as const).map((step) => {
          const done =
            (step === 'planning' && stage !== 'planning') ||
            (step === 'running' && stage === 'completed')
          const current = step === stage
          return (
            <li key={step} className={`${current ? 'current' : ''} ${done ? 'done' : ''}`}>
              <button type="button" onClick={() => setMeetingStatus(meeting.id, step)}>
                {done ? '✓ ' : ''}
                {step[0].toUpperCase() + step.slice(1)}
              </button>
            </li>
          )
        })}
      </ol>

      <h3>Meeting Description</h3>
      <p>{meeting.description}</p>

      <h3>Roles</h3>
      <table className="roles-table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>Role</th>
            <th>Expected</th>
          </tr>
        </thead>
        <tbody>
          {meeting.participants.map((person) => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td>{person.role}</td>
              <td>{markIcon(person.expected)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Agenda</h3>
      <div className="table-scroll">
        <table className="overview-agenda">
          <thead>
            <tr>
              <th>Item</th>
              <th>Presenter</th>
              <th>Planned duration (minutes)</th>
              <th>Actual duration (minutes)</th>
            </tr>
          </thead>
          <tbody>
            {meeting.agenda.map((item, index) => (
              <tr key={item.id}>
                <td>
                  {index + 1}. {item.title}
                </td>
                <td>
                  {stage === 'planning' && !item.presenter ? (
                    <label className="presenter-field">
                      <span className="visually-hidden">Presenter</span>
                      <select value={item.presenter} onChange={(event) => setPresenter(item, event.target.value)}>
                        <option value="">+ add presenter</option>
                        {meeting.participants.map((person) => (
                          <option key={person.id}>{person.name}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <select value={item.presenter} onChange={(event) => setPresenter(item, event.target.value)}>
                      <option value="">—</option>
                      {meeting.participants.map((person) => (
                        <option key={person.id}>{person.name}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td>{item.minutes} minutes</td>
                <td>{displayActual(item, now)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="overview-total">
        Total Duration: {planned} minutes
        {stage === 'completed' || actual > 0 ? ` (Actual Duration: ${actual} minutes)` : ''}
      </p>
      <h3>Files</h3>
      <p>Files can be attached and reviewed here</p>
    </div>
  )
}

function ReportsOverlay({
  meeting,
  scribe,
  setScribe,
  onToggleRecord,
  onClose,
}: {
  meeting: Meeting
  scribe: ScribeSession
  setScribe: Dispatch<SetStateAction<ScribeSession>>
  onToggleRecord: () => void
  onClose: () => void
}) {
  const [askOpen, setAskOpen] = useState(false)
  const [prompt, setPrompt] = useState('Rewrite this agenda from the meeting description.')
  const [minutes, setMinutes] = useState(meeting.minutes)
  const documentText = meeting.agendaDocument || buildAgendaDocument(meeting)
  const transcriptDone = scribe.typedTranscript.length >= TRANSCRIPT_SAMPLE.length && scribe.typedTranscript.length > 0
  const draftSummary = scribeDraftSummary(meeting)
  const { recording, showTranscript, showSummary, summaryAdded, scribeOpen, tab } = scribe

  useEffect(() => {
    setMinutes(meeting.minutes)
  }, [meeting.minutes])

  const when = meeting.date
    ? `${formatDateLong(meeting.date)} at ${formatTime(meeting.startTime)}`
    : 'Date not set'

  function runAskWeaver() {
    const next = askWeaverAgenda(meeting)
    saveMeeting({ ...meeting, agendaDocument: next })
    setAskOpen(false)
  }

  function addDraftToMinutes() {
    const next = minutes.trim() ? `${minutes.trim()}\n\n${draftSummary}` : draftSummary
    setMinutes(next)
    saveMeeting({ ...meeting, minutes: next })
    setScribe((session) => ({ ...session, summaryAdded: true }))
  }

  function recordLabel() {
    if (!recording || !scribe.recordStarted) {
      return 'Record'
    }
    return `Stop ${recordClock(scribe.recordStarted, scribe.recordNow)}`
  }

  return (
    <div className="reports-layer">
      <button className="reports-backdrop" type="button" aria-label="Close reports" onClick={onClose} />
      <aside
        className={`reports-drawer${showSummary ? ' has-scribe-summary' : ''}`}
        role="dialog"
        aria-labelledby="reports-title"
      >
        <header className="reports-head">
          <h2 id="reports-title">Reports</h2>
          <button className="icon-button reports-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="reports-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'agenda'}
            onClick={() => setScribe((session) => ({ ...session, tab: 'agenda' }))}
          >
            Meeting agenda
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'minutes'}
            onClick={() => setScribe((session) => ({ ...session, tab: 'minutes' }))}
          >
            Meeting minutes
          </button>
        </div>
        {tab === 'agenda' ? (
          <div className="reports-body" role="tabpanel">
            <h3>{meeting.name}</h3>
            <p className="reports-when">{when}</p>
            <pre className="agenda-doc">{documentText}</pre>
            {askOpen ? (
              <form
                className="ask-box"
                onSubmit={(event) => {
                  event.preventDefault()
                  runAskWeaver()
                }}
              >
                <label className="field">
                  <span>Ask Weaver</span>
                  <textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                </label>
                <button className="button-light" type="submit">
                  Submit Prompt
                </button>
              </form>
            ) : null}
            <div className="reports-ask">
              <button
                className="ask-weaver reports-ask-btn"
                type="button"
                onClick={() => setAskOpen((open) => !open)}
                aria-label="Ask Weaver"
              >
                <img className="ask-weaver-label" src="/ask-weaver.svg" alt="Ask Weaver" width={135} height={40} />
                <img className="ask-weaver-mark" src="/weaver-mark-scribe.svg" alt="" width={40} height={40} />
              </button>
            </div>
          </div>
        ) : (
          <div className="reports-body" role="tabpanel">
            <div className="minutes-editor">
              <label className="field">
                <span>Meeting minutes</span>
                <textarea
                  rows={10}
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                  onBlur={() => saveMeeting({ ...meeting, minutes })}
                />
              </label>
              <button className="button-light" type="button" onClick={() => saveMeeting({ ...meeting, minutes })}>
                Save minutes
              </button>
            </div>
            {showTranscript || showSummary ? (
              <div className={`scribe-capture${showSummary ? ' has-summary' : ''}`}>
                {showTranscript ? (
                  <section className={`transcript-panel${recording ? ' is-live' : ''}`} aria-live="polite">
                    <div className="transcript-head">
                      <h3>Meeting transcript</h3>
                      <span>{recording ? 'Listening' : transcriptDone ? 'Ready' : 'Recorded'}</span>
                    </div>
                    <div className="transcript-log">
                      <p>
                        {scribe.typedTranscript}
                        {recording && !transcriptDone ? <span className="transcript-caret" aria-hidden="true" /> : null}
                      </p>
                    </div>
                  </section>
                ) : null}
                {showSummary ? (
                  <section className="summary-draft" aria-live="polite">
                    <div className="transcript-head">
                      <h3>Draft summary</h3>
                      <button
                        className="icon-button summary-close"
                        type="button"
                        aria-label="Close draft summary"
                        onClick={() => setScribe((session) => ({ ...session, showSummary: false }))}
                      >
                        ×
                      </button>
                    </div>
                    <p className="summary-kicker">Suggested minutes from this recording. Review, then add them if they look useful.</p>
                    <pre className="summary-body">{draftSummary}</pre>
                    <div className="summary-actions">
                      <button className="button-light" type="button" onClick={addDraftToMinutes} disabled={summaryAdded}>
                        {summaryAdded ? 'Added to minutes' : 'Add to minutes'}
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
            <div className="reports-ask weaver-scribe-bar">
              <button
                className={`weaver-scribe-btn${scribeOpen ? ' is-open' : ''}`}
                type="button"
                aria-expanded={scribeOpen}
                aria-label="Weaver Scribe"
                onClick={() =>
                  setScribe((session) => ({
                    ...session,
                    scribeOpen: session.recording ? true : !session.scribeOpen,
                  }))
                }
              >
                <img src="/weaver-scribe.svg" alt="Weaver Scribe" width={168} height={40} />
              </button>
              {scribeOpen ? (
                <>
                  <button
                    className={`scribe-record${recording ? ' is-recording' : ''}`}
                    type="button"
                    onClick={onToggleRecord}
                  >
                    <span className="record-dot" aria-hidden="true" />
                    {recordLabel()}
                  </button>
                  <button
                    className="chip"
                    type="button"
                    onClick={() => setScribe((session) => ({ ...session, showSummary: true, summaryAdded: false }))}
                  >
                    Summarize
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

export default MeetingRoomPage

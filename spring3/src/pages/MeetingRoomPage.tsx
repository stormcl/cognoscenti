import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  EXPORT_OPTIONS,
  TIMEZONE_OPTIONS,
  actualMinutesTotal,
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
import { emptyWorkspace, normalizeWorkspaceId, useWorkspaces, workspaceById } from '../data/workspaces'

type Tool = 'setup' | 'participants' | 'overview'
type ReportsTab = 'agenda' | 'minutes'

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
  useWorkspaces()
  const meeting = useMeeting(id)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tool, setTool] = useState<Tool>('setup')
  const [editingAgenda, setEditingAgenda] = useState(false)
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

  function flash(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 1600)
  }

  if (!meeting) {
    return (
      <section className="meeting-page">
        <h1>Meeting not found</h1>
        <p>That meeting is not in the loaded workspace.</p>
        <Link className="text-link" to="/meetings">
          Back to My Meetings
        </Link>
      </section>
    )
  }

  const current = meeting
  const workspace = workspaceById(normalizeWorkspaceId(current.workspaceId)) ?? emptyWorkspace()
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
            <button className="rail-btn" type="button" disabled>
              Record · Coming soon
            </button>
          </section>

          <section className="rail-card" aria-labelledby="agenda-rail-title">
            <h2 id="agenda-rail-title">Agenda</h2>

            <button
              className="chip"
              type="button"
              aria-pressed={editingAgenda}
              onClick={() => setEditingAgenda((editing) => !editing)}
            >
              {editingAgenda ? 'Done Editing' : 'Edit Agenda'}
            </button>
            <ul className="agenda-rail">
              {current.agenda.map((item, index) => (
                <li key={item.id}>
                  {editingAgenda ? (
                      <div className="agenda-card">
                        <input
                          type="text"
                          aria-label={`Edit agenda item ${index + 1}`}
                          value={item.title}
                          onChange={(event) => {
                            saveMeeting({
                              ...current,
                              agenda: current.agenda.map((agendaItem) =>
                                agendaItem.id === item.id
                                  ? { ...agendaItem, title: event.target.value }
                                  : agendaItem
                              ),
                            })
                          }}
                        />
                        <label>
                        <span>Duration (minutes)</span>
                        <input
                          type="number"
                          min="1"
                          aria-label={`Duration for ${item.title}`}
                          value={item.minutes}
                          onChange={(event) => {
                            const minutes = Number(event.target.value)

                            if (!Number.isInteger(minutes) || minutes < 1) return

                            saveMeeting({
                              ...current,
                              agenda: current.agenda.map((agendaItem) =>
                                agendaItem.id === item.id
                                  ? { ...agendaItem, minutes }
                                  : agendaItem
                              ),
                            })
                          }}
                        />
                      </label>
                      </div>
                    ) : (
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
                )}
                  {selected?.id === item.id && !timersOff && !editingAgenda ? (
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
                  {editingAgenda && (
                    <button
                      className="chip"
                      type="button"
                      aria-label={`Remove ${item.title} from agenda`}
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Remove "${item.title}" from this agenda?`
                        )

                        if (!confirmed) return

                        saveMeeting({
                          ...current,
                          agenda: current.agenda.filter(
                            (agendaItem) => agendaItem.id !== item.id
                          ),
                        })

                        if (selectedAgenda === item.id) {
                          setSelectedAgenda(null)
                        }
                      }}
                  >
                    Remove
                  </button>
                  )}
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
        <ReportsOverlay meeting={current} scribe={scribe} setScribe={setScribe} onClose={closeReports} />
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
  onClose,
}: {
  meeting: Meeting
  scribe: ScribeSession
  setScribe: Dispatch<SetStateAction<ScribeSession>>
  onClose: () => void
}) {
  const [minutes, setMinutes] = useState(meeting.minutes)
  const documentText = meeting.agendaDocument || buildAgendaDocument(meeting)
  const { showSummary, tab } = scribe

  useEffect(() => {
    setMinutes(meeting.minutes)
  }, [meeting.minutes])

  const when = meeting.date
    ? `${formatDateLong(meeting.date)} at ${formatTime(meeting.startTime)}`
    : 'Date not set'

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
            <p className="placeholder-note">Weaver Scribe is coming soon.</p>
          </div>
        )}
        <p className="placeholder-note">Ask Weaver and recording are coming soon.</p>
      </aside>
    </div>
  )
}

export default MeetingRoomPage

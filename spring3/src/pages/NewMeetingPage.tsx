import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  DEFAULT_DATE,
  DEFAULT_TIME,
  DEFAULT_ZONE,
  TIMEZONE_OPTIONS,
  createBlankMeeting,
  defaultAgenda,
  getMeeting,
  saveMeeting,
  type AgendaItem,
} from '../data/meetings'
import { normalizeWorkspaceId, workspaces } from '../data/workspaces'

function NewMeetingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromAll = params.get('from') === 'all'
  const workspaceId = normalizeWorkspaceId(params.get('workspace'))
  const existing = params.get('id') ? getMeeting(params.get('id') as string) : undefined
  const workspace = workspaces[existing ? normalizeWorkspaceId(existing.workspaceId) : workspaceId]

  const [name, setName] = useState(existing?.name ?? '')
  const [date, setDate] = useState(existing?.date || DEFAULT_DATE)
  const [startTime, setStartTime] = useState(existing?.startTime || DEFAULT_TIME)
  const [timezone, setTimezone] = useState(existing?.timezone || DEFAULT_ZONE)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [agenda, setAgenda] = useState<AgendaItem[]>(existing?.agenda ?? defaultAgenda())
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const row = params.get('id') ? getMeeting(params.get('id') as string) : undefined
    if (!row) {
      return
    }
    setName(row.name)
    setDate(row.date || DEFAULT_DATE)
    setStartTime(row.startTime || DEFAULT_TIME)
    setTimezone(row.timezone || DEFAULT_ZONE)
    setDescription(row.description)
    setAgenda(row.agenda)
  }, [params])

  const total = useMemo(() => agenda.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0), [agenda])
  const cancelTo = fromAll ? '/meetings/all' : workspace.path

  function importDetails() {
    setName('UX working session')
    setDescription(
      'This is a meeting description example for this meeting. This description could be long.',
    )
  }

  function updateItem(id: string, patch: Partial<AgendaItem>) {
    setAgenda((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function removeItem(id: string) {
    setAgenda((rows) => rows.filter((row) => row.id !== id))
  }

  function addItem() {
    setAgenda((rows) => [
      ...rows,
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
    ])
  }

  function onDragStart(index: number) {
    setDragIndex(index)
  }

  function onDrop(index: number) {
    if (dragIndex == null || dragIndex === index) {
      setDragIndex(null)
      return
    }
    setAgenda((rows) => {
      const next = rows.slice()
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()
  }

  function collect(status: 'draft' | 'planning') {
    const nextWorkspaceId = existing ? normalizeWorkspaceId(existing.workspaceId) : workspaceId
    const base = existing ?? createBlankMeeting(nextWorkspaceId)
    return {
      ...base,
      name: name.trim(),
      date: status === 'draft' ? date : date,
      startTime,
      timezone,
      description: description.trim(),
      agenda,
      status,
      workspaceId: nextWorkspaceId,
    }
  }

  function onDraft() {
    const row = collect('draft')
    if (!row.name) {
      row.name = 'Untitled meeting'
    }
    saveMeeting(row)
    navigate(`/meetings/${row.id}`)
  }

  function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !date || !startTime || !description.trim()) {
      setError('Name, date, start time, and description are required.')
      return
    }
    setError('')
    const row = collect('planning')
    saveMeeting(row)
    navigate(`/meetings/${row.id}`)
  }

  return (
    <section className="meeting-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item">
          <img src="/house0.svg" alt="" width={12} height={12} />
          <Link to={workspace.path}>{workspace.name}</Link>
        </span>
        <span className="breadcrumb-item">
          <img src="/chevron-right0.svg" alt="" width={12} height={12} />
          <span aria-current="page">Create New Meeting</span>
        </span>
      </nav>

      <header className="meeting-page-head">
        <h1>Create New Meeting</h1>
        <button className="chip" type="button" onClick={importDetails}>
          Import Meeting Details
        </button>
      </header>

      <form className="meeting-form" onSubmit={onCreate}>
        <label className="field">
          <span>Meeting name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <label className="field">
            <span>Start time</span>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
          </label>
          <label className="field">
            <span>Timezone</span>
            <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
              {TIMEZONE_OPTIONS.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <section className="agenda-editor" aria-labelledby="agenda-title">
          <div className="card-heading">
            <h2 id="agenda-title">Agenda</h2>
            <p>Total duration: {total} minutes</p>
          </div>
          <ul className="agenda-edit-list">
            {agenda.map((item, index) => (
              <li
                key={item.id}
                className={`agenda-edit-row${dragIndex === index ? ' dragging' : ''}`}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(index)}
              >
                <span className="drag-handle" aria-hidden="true">
                  ⋮⋮
                </span>
                <input
                  aria-label="Agenda item"
                  value={item.title}
                  onChange={(event) => updateItem(item.id, { title: event.target.value })}
                />
                <label className="minutes-field">
                  <input
                    type="number"
                    min={1}
                    value={item.minutes}
                    onChange={(event) => updateItem(item.id, { minutes: Number(event.target.value) || 0 })}
                  />
                  min
                </label>
                <button className="icon-text" type="button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button className="chip" type="button" onClick={addItem}>
            + Add item
          </button>
        </section>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <Link className="chip" to={cancelTo}>
            Cancel
          </Link>
          <button className="chip" type="button" onClick={onDraft}>
            Save as draft
          </button>
          <button className="button-light" type="submit">
            Create meeting
          </button>
        </div>
      </form>
    </section>
  )
}

export default NewMeetingPage

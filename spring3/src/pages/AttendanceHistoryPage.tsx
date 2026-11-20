import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ATTENDANCE_COLUMNS,
  ATTENDANCE_PEOPLE,
  DEMO_TODAY,
  formatDateLong,
  parseIsoDate,
  type AttendanceStatus,
} from '../data/meetings'
import { workspaceFromPath } from '../data/workspaces'

const DEFAULT_FROM = '2026-09-01'
const DEFAULT_TO = '2026-09-20'

const LEGEND: { id: AttendanceStatus; label: string }[] = [
  { id: 'present', label: 'Present' },
  { id: 'absent', label: 'Absent' },
  { id: 'not-invited', label: 'Not invited' },
  { id: 'no-response', label: 'No response' },
]

function AttendanceHistoryPage() {
  const workspace = workspaceFromPath('/')
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [editingRange, setEditingRange] = useState(false)

  const columns = useMemo(
    () =>
      ATTENDANCE_COLUMNS.filter((column) => {
        const time = parseIsoDate(column.date).getTime()
        return time >= parseIsoDate(from).getTime() && time <= parseIsoDate(to).getTime()
      }),
    [from, to],
  )

  function goToToday() {
    setFrom(DEMO_TODAY)
    setTo(DEMO_TODAY)
    setEditingRange(false)
  }

  return (
    <section className="meeting-page attendance-page">
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
          <span aria-current="page">Attendance history</span>
        </span>
      </nav>

      <header className="meeting-page-head">
        <h1>Attendance History</h1>
        <Link className="chip" to="/meetings/all">
          Back to Meetings
        </Link>
      </header>

      <p className="attendance-zone">Timezone: Eastern Time (EST) America/New_York</p>

      <div className="attendance-toolbar">
        <button className="chip" type="button" onClick={() => setEditingRange((open) => !open)}>
          {formatDateLong(from)} – {formatDateLong(to)}
        </button>
        <button className="chip" type="button" onClick={goToToday}>
          Go to today
        </button>
        <ul className="attendance-legend">
          {LEGEND.map((item) => (
            <li key={item.id}>
              <span className={`att-mark att-${item.id}`} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {editingRange ? (
        <div className="field-row attendance-range">
          <label className="field">
            <span>From</span>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="field">
            <span>To</span>
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>
      ) : null}

      <div className="table-scroll">
        {columns.length === 0 ? (
          <p className="empty-copy">No meetings in this date range.</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Participant</th>
                {columns.map((column) => (
                  <th key={column.id}>
                    <span>{column.name}</span>
                    <small>{formatDateLong(column.date)}</small>
                  </th>
                ))}
                <th>Attendance rate</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_PEOPLE.map((person) => {
                const present = columns.filter((column) => person.marks[column.id] === 'present').length
                return (
                  <tr key={person.name}>
                    <th scope="row">{person.name}</th>
                    {columns.map((column) => {
                      const mark = person.marks[column.id] ?? 'no-response'
                      return (
                        <td key={column.id}>
                          <span className={`att-mark att-${mark}`} title={mark.replace('-', ' ')} />
                        </td>
                      )
                    })}
                    <td>
                      {present}/{columns.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default AttendanceHistoryPage

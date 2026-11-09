import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Menu from '../components/Menu'
import {
  cloneMeeting,
  dateParts,
  deleteMeeting,
  endTime,
  formatDateLong,
  formatTime,
  plannedMinutes,
  recordMeetings,
  statusLabel,
  upcomingMeetings,
  useMeetings,
  workspaceLabel,
} from '../data/meetings'
import type { Meeting, MeetingStatus } from '../data/meetings'
import { workspaceFromPath } from '../data/workspaces'

const FILTERS: { id: 'all' | MeetingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'planning', label: 'Planning' },
  { id: 'planned', label: 'Planned' },
  { id: 'running', label: 'Running' },
  { id: 'completed', label: 'Completed' },
]

function MeetingsIndexPage() {
  const meetings = useMeetings()
  const location = useLocation()
  const workspace = workspaceFromPath(location.pathname)
  const upcoming = upcomingMeetings(meetings).slice(0, 4)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)

  const records = useMemo(() => {
    const search = query.trim().toLowerCase()
    return recordMeetings(meetings).filter((row) => {
      if (filter !== 'all' && row.status !== filter) {
        return false
      }
      if (!search) {
        return true
      }
      return `${row.name} ${row.description}`.toLowerCase().includes(search)
    })
  }, [meetings, query, filter])

  const visibleUpcoming = showAllUpcoming ? upcomingMeetings(meetings) : upcoming

  return (
    <section className="meeting-page meetings-index">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item">
          <img src="/house0.svg" alt="" width={12} height={12} />
          <Link to={workspace.path}>{workspace.name}</Link>
        </span>
        <span className="breadcrumb-item">
          <img src="/chevron-right0.svg" alt="" width={12} height={12} />
          <span aria-current="page">Meetings</span>
        </span>
      </nav>

      <div className="meetings-index-grid">
        <section className="panel upcoming-panel" aria-labelledby="upcoming-meetings">
          <div className="card-heading">
            <h2 id="upcoming-meetings">Upcoming</h2>
            <Link className="chip" to="/meetings/new?from=all">
              + Create meeting
            </Link>
          </div>
          <div className="upcoming-cards">
            {visibleUpcoming.map((row) => (
              <UpcomingCard key={row.id} row={row} />
            ))}
          </div>
          {upcomingMeetings(meetings).length > 4 ? (
            <button className="text-link" type="button" onClick={() => setShowAllUpcoming((open) => !open)}>
              {showAllUpcoming ? 'View less' : 'View More'}
            </button>
          ) : null}
        </section>

        <section className="panel records-panel" aria-labelledby="records-title">
          <div className="card-heading">
            <h2 id="records-title">Meeting Records</h2>
          </div>
          <div className="records-toolbar">
            <label className="records-search">
              <span className="visually-hidden">Search meetings</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search meetings"
              />
            </label>
            <Menu className="chip" ariaLabel="Filter meetings" label="Filter">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  aria-checked={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </Menu>
            <Link className="chip" to="/meetings/attendance">
              Attendance History
            </Link>
          </div>
          <div className="table-scroll">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>
                    <span className="visually-hidden">Settings</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/meetings/${row.id}`}>
                        <strong>{row.name}</strong>
                        <span>{row.description}</span>
                      </Link>
                    </td>
                    <td>
                      {row.date ? `${formatDateLong(row.date)} ${formatTime(row.startTime)}` : 'Date not set'}
                    </td>
                    <td>{plannedMinutes(row)} min</td>
                    <td>
                      <span className={`status-pill status-${row.status}`}>{statusLabel(row.status)}</span>
                    </td>
                    <td>
                      <Menu className="gear-btn" ariaLabel={`${row.name} settings`} label="⚙">
                        <Link to={`/meetings/${row.id}?reports=1`} role="menuitem">
                          View Reports
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => cloneMeeting(row.id)}
                        >
                          Clone Meeting
                        </button>
                        <button type="button" role="menuitem" onClick={() => deleteMeeting(row.id)}>
                          Delete
                        </button>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}

function UpcomingCard({ row }: { row: Meeting }) {
  const parts = dateParts(row.date)
  return (
    <article className="upcoming-card">
      <div className="upcoming-card-top">
        <div className="date-tile">
          <span>{parts.month}</span>
          <strong>{parts.day}</strong>
        </div>
        <span className={`status-pill status-${row.status}`}>{statusLabel(row.status)}</span>
      </div>
      <h3>{row.name}</h3>
      <p>
        {formatTime(row.startTime)}
        {endTime(row) ? ` – ${endTime(row)}` : ''}
      </p>
      <p className="upcoming-meta">{workspaceLabel(row.workspaceId)}</p>
      <div className="upcoming-actions">
        {row.zoomLink ? (
          <a className="button-light" href={row.zoomLink} target="_blank" rel="noreferrer">
            Join Call
          </a>
        ) : (
          <span className="placeholder-note">{'{Demo dead link}'}</span>
        )}
        <Link className="chip" to={`/meetings/${row.id}`}>
          Open
        </Link>
      </div>
    </article>
  )
}

export default MeetingsIndexPage

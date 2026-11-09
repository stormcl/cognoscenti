import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dateParts,
  draftMeetings,
  formatWeekdayTime,
  pastMeetings,
  upcomingMeetings,
  useMeetings,
  workspaceLabel,
  zoomLabel,
} from '../data/meetings'
import type { Meeting } from '../data/meetings'

function MeetingRow({ row, action }: { row: Meeting; action?: { to: string; label: string } }) {
  const parts = dateParts(row.date)
  return (
    <article className="my-meeting-row">
      <Link className="my-meeting-main" to={`/meetings/${row.id}`}>
        <div className={`date-tile${row.date ? '' : ' date-tile-empty'}`}>
          <span>{row.date ? parts.month : 'Date'}</span>
          <strong>{row.date ? parts.day : '—'}</strong>
        </div>
        <div>
          <h3>{row.name}</h3>
          <p>{row.date ? formatWeekdayTime(row) : 'Needs a date'}</p>
          <p className="meeting-row-meta">
            {row.zoomLink ? zoomLabel(row.zoomLink) : '{Demo dead link}'}
            <span className="workspace-chip">{workspaceLabel(row.workspaceId)}</span>
          </p>
        </div>
      </Link>
      {action ? (
        <Link className="chip" to={action.to}>
          {action.label}
        </Link>
      ) : null}
    </article>
  )
}

function MyMeetingsPage() {
  const meetings = useMeetings()
  const upcoming = upcomingMeetings(meetings)
  const drafts = draftMeetings(meetings)
  const past = pastMeetings(meetings)
  const [showPast, setShowPast] = useState(false)

  return (
    <section className="meeting-page my-meetings">
      <header className="meeting-page-head">
        <h1>My Meetings</h1>
        <Link className="text-link" to="/meetings/all">
          All Meetings
        </Link>
      </header>

      <section className="meeting-list-block" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title">Upcoming</h2>
        {upcoming.length ? (
          upcoming.map((row) => <MeetingRow key={row.id} row={row} />)
        ) : (
          <p className="empty-copy">No upcoming meetings.</p>
        )}
      </section>

      <section className="meeting-list-block" aria-labelledby="draft-title">
        <h2 id="draft-title">Date not set</h2>
        {drafts.length ? (
          drafts.map((row) => (
            <MeetingRow
              key={row.id}
              row={row}
              action={{ to: `/meetings/new?id=${row.id}`, label: 'Set date' }}
            />
          ))
        ) : (
          <p className="empty-copy">No drafts waiting on a date.</p>
        )}
      </section>

      <section className="meeting-list-block" aria-labelledby="past-title">
        <button className="text-link past-toggle" type="button" onClick={() => setShowPast((open) => !open)}>
          {showPast ? 'Hide past meetings' : `Show ${past.length} past meetings`}
        </button>
        {showPast
          ? past.map((row) => <MeetingRow key={row.id} row={row} />)
          : null}
        <span id="past-title" className="visually-hidden">
          Past meetings
        </span>
      </section>
    </section>
  )
}

export default MyMeetingsPage

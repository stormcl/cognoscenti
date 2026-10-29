import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const documents = [
  { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Slides', date: 'Oct 12', icon: '/slides0.svg' },
  { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Slides', date: 'Oct 11', icon: '/slides2.svg' },
  { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Image', date: 'Oct 10', icon: '/image0.svg' },
  { title: 'Document title', meta: 'Short description · Uploaded by Name', type: 'Doc', date: 'Oct 9', icon: '/file2.svg' },
]

const hierarchy = [
  { name: 'Digital Agency', detail: 'Main organization workspace', level: 0, current: false },
  { name: 'UX Primary Group', detail: 'Team collaboration and resources', level: 1, current: true },
  { name: 'UX Meeting Module', detail: 'Meetings, agendas and notes', level: 2, current: false },
  { name: 'UX Admin Pages', detail: 'Focuses on the admin pages', level: 2, current: false },
]

type ActivityTab = 'action-items' | 'meetings' | 'discussions'

type MeetingRow = {
  id: string
  title: string
  meta: string
  tag?: string
  group: 'this' | 'related'
}

const initialMeetings: MeetingRow[] = [
  {
    id: 'fourth-full-class',
    title: 'Fourth Full Class Meeting',
    meta: '22.10.26 | 19:30',
    group: 'this',
  },
  {
    id: '4th-ux-group',
    title: '4th UX Group Meeting',
    meta: '9.10.26 | 18:00',
    tag: 'UX Primary',
    group: 'related',
  },
  {
    id: '2nd-test',
    title: '2nd test meeting',
    meta: 'Time TBD',
    tag: 'UX Primary',
    group: 'related',
  },
]

const actionItems = [
  { id: 'write-journey-map', title: 'Draft journey map for onboarding', meta: 'Due Oct 24', group: 'this' as const },
  { id: 'heuristic-pass', title: 'Heuristic pass on meeting notes', meta: 'Unassigned', group: 'related' as const, tag: 'UX Primary' },
]

const discussions = [
  { id: 'async-api', title: 'Proposal: switch to async API pattern', meta: 'Updated Oct 21', group: 'this' as const },
  { id: 'agenda-template', title: 'Shared agenda template', meta: '2 comments', group: 'related' as const, tag: 'UX Primary' },
]

function WorkspaceHome() {
  const [activityTab, setActivityTab] = useState<ActivityTab>('meetings')
  const [watching, setWatching] = useState(false)
  const [meetings, setMeetings] = useState(initialMeetings)

  // Clone is local-only so the control does something before the WAR is wired.
  function cloneMeeting(id: string) {
    setMeetings((rows) => {
      const source = rows.find((row) => row.id === id)
      if (!source) {
        return rows
      }
      return [
        ...rows,
        {
          ...source,
          id: `${source.id}-copy-${Date.now()}`,
          title: `${source.title} (copy)`,
        },
      ]
    })
  }

  const thisCircleMeetings = meetings.filter((row) => row.group === 'this')
  const relatedMeetings = meetings.filter((row) => row.group === 'related')

  return (
    <>
      <section className="workspace-introduction" aria-labelledby="page-title">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/workspaces">Fall 2026 Integrated Digital Agency</Link>
          <img src="/chevron-right0.svg" alt="" width={12} height={12} />
          <span aria-current="page">UX Primary Group</span>
        </nav>

        <div className="identity-and-membership">
          <div className="workspace-identity">
            <div className="title-row">
              <h1 id="page-title">UX Primary Group</h1>
              <p className="status-badge">
                <span className="status-dot" aria-hidden="true" />
                Active
              </p>
            </div>
            <p className="description">
              Aim: Redesign the Weaver workspace experience through
              heuristic evaluation, journey mapping and iterative
              wireframes.
            </p>
          </div>

          <div className="membership-access">
            <Link className="chip" to="/members">
              <img src="/users0.svg" alt="" width={15} height={15} />
              Members
            </Link>
            <button
              className="chip"
              type="button"
              aria-pressed={watching}
              onClick={() => setWatching((isWatching) => !isWatching)}
            >
              <img src="/eye0.svg" alt="" width={15} height={15} />
              {watching ? 'Watching' : 'Watch'}
            </button>
            <Link className="chip chip-primary" to="/members">
              <img src="/user-plus0.svg" alt="" width={15} height={15} />
              Invite
            </Link>
          </div>
        </div>
      </section>

      <section className="glance-row" aria-label="Workspace summary">
        <article className="next-meeting" id="meetings">
          <p className="eyebrow">
            <img src="/calendar1.svg" alt="" width={16} height={16} />
            Next meeting
          </p>
          <div className="meeting-summary">
            <div className="date-tile">
              <span>Oct</span>
              <strong>22</strong>
            </div>
            <div>
              <h2>5th UX Group Meeting</h2>
              <p>Thu, Oct 22 · 4:30 PM · Agenda: 5 items</p>
            </div>
          </div>
          <div className="meeting-actions">
            <Link className="button-light" to="/meetings/5th-ux-group">
              Open meeting
            </Link>
            <Link className="button-ghost" to="/meetings/5th-ux-group">
              View agenda
            </Link>
            <Link className="button-ghost" to="/meetings">
              All meetings
            </Link>
          </div>
        </article>

        <article className="panel at-a-glance">
          <p className="eyebrow muted">At a glance</p>
          <ul>
            <li>
              <Link className="glance-link" to="/action-items">
                <span className="icon-tile">
                  <img src="/check1.svg" alt="" width={20} height={20} />
                </span>
                <strong>0</strong>
                <span>Open action items</span>
              </Link>
            </li>
            <li>
              <Link className="glance-link" to="/documents">
                <span className="icon-tile">
                  <img src="/file1.svg" alt="" width={20} height={20} />
                </span>
                <strong>11</strong>
                <span>Documents</span>
              </Link>
            </li>
            <li>
              <Link className="glance-link" to="/members">
                <span className="icon-tile">
                  <img src="/users1.svg" alt="" width={20} height={20} />
                </span>
                <strong>14</strong>
                <span>Members</span>
              </Link>
            </li>
          </ul>
        </article>
      </section>

      <div className="main-columns">
        <div className="left-column">
          <section className="panel circle-activity" aria-labelledby="activity-title">
            <div className="section-heading">
              <h2 id="activity-title">Circle activity</h2>
              <div className="tabs" role="tablist" aria-label="Activity type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activityTab === 'action-items'}
                  className={activityTab === 'action-items' ? 'active' : undefined}
                  onClick={() => setActivityTab('action-items')}
                >
                  Action Items
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activityTab === 'meetings'}
                  className={activityTab === 'meetings' ? 'active' : undefined}
                  onClick={() => setActivityTab('meetings')}
                >
                  Meetings
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activityTab === 'discussions'}
                  className={activityTab === 'discussions' ? 'active' : undefined}
                  onClick={() => setActivityTab('discussions')}
                >
                  Discussions
                </button>
              </div>
            </div>

            {activityTab === 'meetings' ? (
              <>
                <ActivityGroup label="This circle · Digital Agency">
                  {thisCircleMeetings.map((row) => (
                    <MeetingActivityRow
                      key={row.id}
                      row={row}
                      onClone={() => cloneMeeting(row.id)}
                    />
                  ))}
                </ActivityGroup>
                <ActivityGroup label="Parent & child circles">
                  {relatedMeetings.map((row) => (
                    <MeetingActivityRow
                      key={row.id}
                      row={row}
                      onClone={() => cloneMeeting(row.id)}
                    />
                  ))}
                </ActivityGroup>
              </>
            ) : null}

            {activityTab === 'action-items' ? (
              <>
                <ActivityGroup label="This circle · Digital Agency">
                  {actionItems
                    .filter((row) => row.group === 'this')
                    .map((row) => (
                      <SimpleActivityRow
                        key={row.id}
                        to={`/action-items`}
                        title={row.title}
                        meta={row.meta}
                      />
                    ))}
                </ActivityGroup>
                <ActivityGroup label="Parent & child circles">
                  {actionItems
                    .filter((row) => row.group === 'related')
                    .map((row) => (
                      <SimpleActivityRow
                        key={row.id}
                        to="/action-items"
                        title={row.title}
                        meta={row.meta}
                        tag={row.tag}
                      />
                    ))}
                </ActivityGroup>
              </>
            ) : null}

            {activityTab === 'discussions' ? (
              <>
                <ActivityGroup label="This circle · Digital Agency">
                  {discussions
                    .filter((row) => row.group === 'this')
                    .map((row) => (
                      <SimpleActivityRow
                        key={row.id}
                        to="/discussions"
                        title={row.title}
                        meta={row.meta}
                      />
                    ))}
                </ActivityGroup>
                <ActivityGroup label="Parent & child circles">
                  {discussions
                    .filter((row) => row.group === 'related')
                    .map((row) => (
                      <SimpleActivityRow
                        key={row.id}
                        to="/discussions"
                        title={row.title}
                        meta={row.meta}
                        tag={row.tag}
                      />
                    ))}
                </ActivityGroup>
              </>
            ) : null}
          </section>

          <section className="panel documents" id="documents" aria-labelledby="documents-title">
            <div className="section-heading">
              <h2 id="documents-title">Documents</h2>
              <Link className="chip" to="/documents">
                <img src="/upload0.svg" alt="" width={15} height={15} />
                Upload document
              </Link>
            </div>
            <ul className="document-list">
              {documents.map((doc, index) => (
                <li key={`${doc.date}-${index}`}>
                  <Link className="document-row" to="/documents">
                    <span className="icon-tile">
                      <img src={doc.icon} alt="" width={18} height={18} />
                    </span>
                    <span className="document-text">
                      <strong>{doc.title}</strong>
                      <span>{doc.meta}</span>
                    </span>
                    <span className="tag">{doc.type}</span>
                    <time>{doc.date}</time>
                    <img src="/chev0.svg" alt="" width={16} height={16} />
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="text-link" to="/documents">
              View all 11 documents
            </Link>
          </section>
        </div>

        <aside className="right-column" aria-labelledby="hierarchy-title">
          <section className="panel hierarchy">
            <div className="section-heading">
              <h2 id="hierarchy-title">Workspace hierarchy</h2>
              <Link className="text-link" to="/workspaces">
                View map
              </Link>
            </div>
            {hierarchy.map((item) =>
              item.current ? (
                <div key={item.name} className={`hierarchy-row level-${item.level} current`}>
                  <span className="node filled" aria-hidden="true" />
                  <span>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </span>
                </div>
              ) : (
                <Link
                  key={item.name}
                  className={`hierarchy-row level-${item.level}`}
                  to="/workspaces"
                >
                  <span className="node" aria-hidden="true" />
                  <span>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </span>
                </Link>
              ),
            )}
          </section>
        </aside>
      </div>
    </>
  )
}

function ActivityGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="activity-group">
      <p className="group-label">{label}</p>
      {children}
    </div>
  )
}

function MeetingActivityRow({
  row,
  onClone,
}: {
  row: MeetingRow
  onClone: () => void
}) {
  return (
    <div className="activity-row">
      <Link to={`/meetings/${row.id}`}>{row.title}</Link>
      {row.tag ? <span className="tag">{row.tag}</span> : null}
      <button className="clone" type="button" onClick={onClone}>
        Clone
      </button>
      <p className="meta">{row.meta}</p>
    </div>
  )
}

function SimpleActivityRow({
  to,
  title,
  meta,
  tag,
}: {
  to: string
  title: string
  meta: string
  tag?: string
}) {
  return (
    <div className="activity-row">
      <Link to={to}>{title}</Link>
      {tag ? <span className="tag">{tag}</span> : null}
      <p className="meta">{meta}</p>
    </div>
  )
}

export default WorkspaceHome

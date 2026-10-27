import WorkspaceLayout from './components/WorkspaceLayout'
import './App.css'

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

function App() {
  return (
    <WorkspaceLayout>
      <section className="workspace-introduction" aria-labelledby="page-title">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <a href="#workspaces">Fall 2026 Integrated Digital Agency</a>
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
            <a className="chip" href="#members">
              <img src="/users0.svg" alt="" width={15} height={15} />
              Members
            </a>
            <a className="chip" href="#watching">
              <img src="/eye0.svg" alt="" width={15} height={15} />
              Watching
            </a>
            <a className="chip chip-primary" href="#invite">
              <img src="/user-plus0.svg" alt="" width={15} height={15} />
              Invite
            </a>
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
            <a className="button-light" href="#meetings">Open meeting</a>
            <a className="button-ghost" href="#meetings">View agenda</a>
            <a className="button-ghost" href="#meetings">All meetings</a>
          </div>
        </article>

        <article className="panel at-a-glance">
          <p className="eyebrow muted">At a glance</p>
          <ul>
            <li>
              <span className="icon-tile">
                <img src="/check1.svg" alt="" width={20} height={20} />
              </span>
              <strong>0</strong>
              <span>Open action items</span>
            </li>
            <li>
              <span className="icon-tile">
                <img src="/file1.svg" alt="" width={20} height={20} />
              </span>
              <strong>11</strong>
              <span>Documents</span>
            </li>
            <li>
              <span className="icon-tile">
                <img src="/users1.svg" alt="" width={20} height={20} />
              </span>
              <strong>14</strong>
              <span>Members</span>
            </li>
          </ul>
        </article>
      </section>

      <div className="main-columns">
        <div className="left-column">
          <section className="panel circle-activity" id="discussions" aria-labelledby="activity-title">
            <div className="section-heading">
              <h2 id="activity-title">Circle activity</h2>
              <div className="tabs" role="tablist" aria-label="Activity type">
                <button type="button">Action Items</button>
                <button type="button" className="active" aria-current="true">Meetings</button>
                <button type="button">Discussions</button>
              </div>
            </div>

            <div className="activity-group">
              <p className="group-label">This circle · Digital Agency</p>
              <div className="activity-row">
                <a href="#meetings">Forth Full Class Meeting</a>
                <button className="clone" type="button">Clone</button>
                <p className="meta">22.10.26 | 19:30</p>
              </div>
            </div>

            <div className="activity-group">
              <p className="group-label">Parent &amp; child circles</p>
              <div className="activity-row">
                <a href="#meetings">4th UX Group Meeting</a>
                <span className="tag">UX Primary</span>
                <button className="clone" type="button">Clone</button>
                <p className="meta">9.10.26 | 18:00</p>
              </div>
              <div className="activity-row">
                <a href="#meetings">2nd test meeting</a>
                <span className="tag">UX Primary</span>
                <button className="clone" type="button">Clone</button>
                <p className="meta">Time TBD</p>
              </div>
            </div>
          </section>

          <section className="panel documents" id="documents" aria-labelledby="documents-title">
            <div className="section-heading">
              <h2 id="documents-title">Documents</h2>
              <a className="chip" href="#documents">
                <img src="/upload0.svg" alt="" width={15} height={15} />
                Upload document
              </a>
            </div>
            <ul className="document-list">
              {documents.map((doc, index) => (
                <li key={`${doc.date}-${index}`}>
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
                </li>
              ))}
            </ul>
            <a className="text-link" href="#documents">View all 11 documents</a>
          </section>
        </div>

        <aside className="right-column" aria-labelledby="hierarchy-title">
          <section className="panel hierarchy">
            <div className="section-heading">
              <h2 id="hierarchy-title">Workspace hierarchy</h2>
              <a className="text-link" href="#workspaces">View map</a>
            </div>
            {hierarchy.map((item) => (
              <div
                key={item.name}
                className={`hierarchy-row level-${item.level}${item.current ? ' current' : ''}`}
              >
                <span className={`node${item.current ? ' filled' : ''}`} aria-hidden="true" />
                <span>
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                </span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </WorkspaceLayout>
  )
}

export default App

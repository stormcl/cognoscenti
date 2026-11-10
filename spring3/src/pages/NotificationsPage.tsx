import { Link } from 'react-router-dom'
import { noticeKindLabel, useNotices, type UserNotice } from '../data/notices'

function NotificationsPage() {
  const { fromPeople, workspace } = useNotices()

  return (
    <section className="profile-screen">
      <header className="doc-library-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">
            <img src="/house0.svg" alt="" width={12} height={12} />
            <Link to="/">Home</Link>
          </span>
          <span className="breadcrumb-item">
            <img src="/chevron-right0.svg" alt="" width={12} height={12} />
            <span aria-current="page">Notifications</span>
          </span>
        </nav>
        <div className="title-row">
          <h1>Notifications</h1>
          <span className="count-pill">{fromPeople.length + workspace.length}</span>
        </div>
        <p className="description">
          Updates from people you watch, and from meetings, discussions, documents, and action items already in the demo.
        </p>
      </header>

      <NoticeGroup
        title="From people you watch"
        empty="Nothing here from people you watch. Watch someone on their profile to see their activity."
        notices={fromPeople}
      />
      <NoticeGroup title="Workspace activity" empty="No workspace activity in this demo." notices={workspace} />
    </section>
  )
}

function NoticeGroup({
  title,
  empty,
  notices,
}: {
  title: string
  empty: string
  notices: UserNotice[]
}) {
  return (
    <section className="panel profile-section" aria-labelledby={title}>
      <h2 id={title}>{title}</h2>
      {notices.length === 0 ? (
        <p className="profile-empty">{empty}</p>
      ) : (
        <ul className="notice-list">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link className="notice-row" to={notice.href}>
                <span className="tag">{noticeKindLabel(notice.kind)}</span>
                <span>
                  <strong>{notice.title}</strong>
                  <span>
                    {notice.actorName ? `${notice.actorName} · ` : ''}
                    {notice.workspaceName}
                    {notice.timestamp ? ` · ${notice.timestamp}` : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default NotificationsPage

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { HierarchyRow, Person, RecentUpdate, UpdateKind, WorkspaceId } from '../data/workspaces'
import { workspaces } from '../data/workspaces'

type UpdateTab = 'all' | 'meetings' | 'files' | 'discussions'

type WorkspaceHomeProps = {
  workspaceId: WorkspaceId
}

const UPDATE_LABEL: Record<UpdateKind, string> = {
  meeting: 'Meeting',
  discussion: 'Discussion',
  slides: 'Slides',
  image: 'Image',
  doc: 'Doc',
}

const FILE_KINDS: UpdateKind[] = ['slides', 'image', 'doc']
const STACK_LIMIT = 7
const AVATAR_TONES = ['#5a5a5a', '#6e6e6e', '#4a4a4a', '#7a7a7a', '#3d3d3d']

function WorkspaceHome({ workspaceId }: WorkspaceHomeProps) {
  const workspace = workspaces[workspaceId]
  const [updateTab, setUpdateTab] = useState<UpdateTab>('all')
  const [watching, setWatching] = useState(true)
  const [copied, setCopied] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')

  useEffect(() => {
    setUpdateTab('all')
    setMemberQuery('')
    setCopied(false)
  }, [workspaceId])

  const updates = useMemo(() => {
    if (updateTab === 'meetings') {
      return workspace.updates.filter((row) => row.kind === 'meeting')
    }
    if (updateTab === 'discussions') {
      return workspace.updates.filter((row) => row.kind === 'discussion')
    }
    if (updateTab === 'files') {
      return workspace.updates.filter((row) => FILE_KINDS.includes(row.kind))
    }
    return workspace.updates
  }, [updateTab, workspace.updates])

  const you = workspace.people.find((person) => person.you) ?? workspace.people[0]
  const others = workspace.people.filter((person) => !person.you)
  const query = memberQuery.trim().toLowerCase()
  const matchedPeople = query
    ? others.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          person.initials.toLowerCase().includes(query),
      )
    : others
  const stackedPeople = query ? matchedPeople : matchedPeople.slice(0, STACK_LIMIT)
  const overflowCount = query
    ? 0
    : Math.max(0, workspace.members - 1 - stackedPeople.length)

  async function copyZoom() {
    try {
      await navigator.clipboard.writeText(workspace.nextMeeting.zoomCopy)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <section className="workspace-introduction" aria-labelledby="page-title">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">
            <img src="/house0.svg" alt="" width={12} height={12} />
            <Link to="/">Home</Link>
          </span>
          {workspace.breadcrumbs.map((crumb, index) => {
            const isLast = index === workspace.breadcrumbs.length - 1
            return (
              <span key={crumb.label} className="breadcrumb-item">
                <img src="/chevron-right0.svg" alt="" width={12} height={12} />
                {crumb.path && !isLast ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </span>
            )
          })}
        </nav>

        <div className="identity-and-membership">
          <div className="workspace-identity">
            <div className="title-row">
              <h1 id="page-title">{workspace.name}</h1>
              <p className="status-badge">
                <span className="status-dot" aria-hidden="true" />
                Active
              </p>
            </div>
            <p className="description">{workspace.description}</p>
          </div>

          <div className="membership-access">
            <button
              className="chip"
              type="button"
              aria-pressed={watching}
              onClick={() => setWatching((isWatching) => !isWatching)}
            >
              <img src="/eye0.svg" alt="" width={15} height={15} />
              {watching ? 'Watching' : 'Watch'}
            </button>
            <Link className="chip" to="/settings">
              <SlidersIcon />
              Workspace settings
            </Link>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <div className="home-main">
          <article className="next-meeting" id="meetings">
            <p className="eyebrow">
              <img src="/calendar1.svg" alt="" width={16} height={16} />
              Next meeting
            </p>
            <div className="meeting-summary">
              <div className="date-tile">
                <span>{workspace.nextMeeting.month}</span>
                <strong>{workspace.nextMeeting.day}</strong>
              </div>
              <div>
                <h2>{workspace.nextMeeting.title}</h2>
                <p>{workspace.nextMeeting.when}</p>
              </div>
            </div>
            <div className="zoom-row">
              <span className="zoom-chip">{workspace.nextMeeting.zoomLabel}</span>
              <button className="copy-link" type="button" onClick={copyZoom}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <div className="meeting-actions">
              <Link className="button-light" to={workspace.nextMeeting.to}>
                <CameraIcon />
                Join Zoom
              </Link>
              <Link className="button-solid" to={workspace.nextMeeting.to}>
                Open meeting
              </Link>
              <Link className="button-ghost" to={workspace.nextMeeting.to}>
                View agenda
              </Link>
            </div>
          </article>

          <section className="panel recent-updates" aria-labelledby="updates-title">
            <div className="card-heading">
              <h2 id="updates-title">
                <img src="/bell0.svg" alt="" width={16} height={16} />
                Recent Updates
              </h2>
              <Link className="view-all" to="/notifications">
                View all
              </Link>
            </div>
            <div className="update-tabs" role="tablist" aria-label="Update type">
              <UpdateTabButton tab="all" current={updateTab} onSelect={setUpdateTab}>
                All
              </UpdateTabButton>
              <UpdateTabButton tab="meetings" current={updateTab} onSelect={setUpdateTab}>
                Meetings
              </UpdateTabButton>
              <UpdateTabButton tab="files" current={updateTab} onSelect={setUpdateTab}>
                Files
              </UpdateTabButton>
              <UpdateTabButton tab="discussions" current={updateTab} onSelect={setUpdateTab}>
                Discussions
              </UpdateTabButton>
            </div>
            <ul className="update-list">
              {updates.map((row) => (
                <li key={row.id}>
                  <UpdateRow row={row} />
                </li>
              ))}
            </ul>
          </section>

          <section className="panel my-actions" aria-labelledby="actions-title">
            <div className="card-heading">
              <h2 id="actions-title">
                <img src="/check0.svg" alt="" width={16} height={16} />
                My Action Items
              </h2>
              <Link className="view-all" to="/action-items">
                View all
              </Link>
            </div>

            {workspace.myActionItems.length === 0 ? (
              <div className="empty-actions">
                <span className="icon-tile">
                  <img src="/check1.svg" alt="" width={20} height={20} />
                </span>
                <div>
                  <strong>You&apos;re all caught up</strong>
                  <p>No action items are assigned to you right now.</p>
                </div>
                <Link className="chip" to="/action-items">
                  + Add action item
                </Link>
              </div>
            ) : (
              <ul className="update-list">
                {workspace.myActionItems.map((item) => (
                  <li key={item.id}>
                    <Link className="update-row" to={item.to}>
                      <span className="icon-tile">
                        <img src="/check0.svg" alt="" width={18} height={18} />
                      </span>
                      <span className="update-text">
                        <strong>{item.title}</strong>
                        <span>{item.meta}</span>
                      </span>
                      <img src="/chev0.svg" alt="" width={16} height={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="home-side">
          <article className="panel at-a-glance">
            <p className="eyebrow muted">At a glance</p>
            <ul>
              <li>
                <Link className="glance-link" to="/action-items">
                  <span className="icon-tile">
                    <img src="/check1.svg" alt="" width={18} height={18} />
                  </span>
                  <span className="glance-copy">
                    <strong>{workspace.openActions}</strong>
                    <span>Open action items</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link className="glance-link" to="/documents">
                  <span className="icon-tile">
                    <img src="/file1.svg" alt="" width={18} height={18} />
                  </span>
                  <span className="glance-copy">
                    <strong>{workspace.documentCount}</strong>
                    <span>Documents</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link className="glance-link" to="/members">
                  <span className="icon-tile">
                    <img src="/users1.svg" alt="" width={18} height={18} />
                  </span>
                  <span className="glance-copy">
                    <strong>{workspace.members}</strong>
                    <span>Members</span>
                  </span>
                </Link>
              </li>
            </ul>
          </article>

          <section className="panel people-card" aria-labelledby="people-title">
            <div className="card-heading">
              <h2 id="people-title">
                <img src="/users0.svg" alt="" width={16} height={16} />
                People
              </h2>
              <Link className="view-all" to="/members">
                View all
              </Link>
            </div>

            {you ? (
              <div className="people-you">
                <span className="person-avatar lg" aria-hidden="true">
                  {you.initials}
                </span>
                <div className="people-you-text">
                  <strong>You</strong>
                  <span>
                    {you.role === 'steward' ? 'Steward' : 'Member'}
                    {watching ? (
                      <>
                        <span className="watching-dot" aria-hidden="true" />
                        Watching
                      </>
                    ) : null}
                  </span>
                </div>
                <Link className="people-settings" to="/settings" aria-label="Account settings">
                  <SlidersIcon />
                </Link>
              </div>
            ) : null}

            <p className="people-count">
              {workspace.members} members
              <span aria-hidden="true"> · </span>
              {workspace.stewards} stewards
            </p>

            <div className="member-stack" aria-label="Workspace members">
              {stackedPeople.map((person, index) => (
                <MemberAvatar key={person.initials} person={person} index={index} />
              ))}
              {overflowCount > 0 ? (
                <span className="person-avatar overflow" aria-label={`${overflowCount} more members`}>
                  +{overflowCount}
                </span>
              ) : null}
              {query && stackedPeople.length === 0 ? (
                <span className="member-empty">No matching members</span>
              ) : null}
            </div>

            <form
              className="member-search"
              onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
            >
              <img src="/search1.png" alt="" width={14} height={14} />
              <label className="visually-hidden" htmlFor="find-member">
                Find a member
              </label>
              <input
                id="find-member"
                type="search"
                value={memberQuery}
                onChange={(event) => setMemberQuery(event.target.value)}
                placeholder="Find a member..."
              />
            </form>

            <Link className="invite-member" to="/members">
              <img src="/user-plus0.svg" alt="" width={15} height={15} />
              Invite member
            </Link>
          </section>

          <section className="panel hierarchy" aria-labelledby="hierarchy-title">
            <div className="card-heading">
              <h2 id="hierarchy-title">
                <img src="/layers0.svg" alt="" width={16} height={16} />
                Workspace Hierarchy
              </h2>
              <Link className="view-all" to="/workspaces">
                View map
              </Link>
            </div>
            <div className="hierarchy-tree">
              {workspace.hierarchy.map((item, index) => {
                const next = workspace.hierarchy[index + 1]
                const isLast = !next || next.level <= item.level
                const current = item.path === workspace.path
                return (
                  <HierarchyItem
                    key={item.name}
                    item={item}
                    current={current}
                    isLast={isLast}
                  />
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function HierarchyItem({
  item,
  current,
  isLast,
}: {
  item: HierarchyRow
  current: boolean
  isLast: boolean
}) {
  const className = `hierarchy-row level-${item.level}${current ? ' current' : ''}${isLast ? ' last' : ''}`
  const body = (
    <>
      <span className={`node${current ? ' filled' : ''}`} aria-hidden="true" />
      <span>
        <strong>{item.name}</strong>
        <span>{item.detail}</span>
      </span>
    </>
  )

  if (current) {
    return <div className={className}>{body}</div>
  }

  return (
    <Link className={className} to={item.path}>
      {body}
    </Link>
  )
}

function UpdateTabButton({
  tab,
  current,
  onSelect,
  children,
}: {
  tab: UpdateTab
  current: UpdateTab
  onSelect: (tab: UpdateTab) => void
  children: string
}) {
  const selected = tab === current
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={selected ? 'active' : undefined}
      onClick={() => onSelect(tab)}
    >
      {children}
    </button>
  )
}

function UpdateRow({ row }: { row: RecentUpdate }) {
  return (
    <Link className="update-row" to={row.to}>
      <span className="icon-tile">
        <img src={row.icon} alt="" width={18} height={18} />
      </span>
      <span className="update-text">
        <strong>{row.title}</strong>
        <span>{row.detail}</span>
      </span>
      <span className="tag">{UPDATE_LABEL[row.kind]}</span>
      <time>{row.date}</time>
      <img src="/chev0.svg" alt="" width={16} height={16} />
    </Link>
  )
}

function MemberAvatar({ person, index }: { person: Person; index: number }) {
  return (
    <span
      className="person-avatar"
      title={person.name}
      aria-label={person.name}
      style={{ background: AVATAR_TONES[index % AVATAR_TONES.length] }}
    >
      {person.initials}
    </span>
  )
}

function SlidersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h4.5M11 4.5h2M7.5 3v3M3 11.5h8M13 11.5h0M11 10v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7.5" cy="4.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="9" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 7.2L14.2 5v6.2L10.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default WorkspaceHome

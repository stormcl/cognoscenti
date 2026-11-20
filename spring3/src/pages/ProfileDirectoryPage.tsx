import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { hasRole, profileHref, useProfiles, type RoleId } from '../data/profiles'
import { workspaceFromLocation } from '../data/workspaces'

type RoleFilter = 'all' | RoleId

const FILTERS: { id: RoleFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'steward', label: 'Stewards' },
  { id: 'member', label: 'Members' },
]

function ProfileDirectoryPage() {
  const [params] = useSearchParams()
  const workspaceId = params.get('workspace')
  const workspace = workspaceFromLocation('/profile', workspaceId ? `?workspace=${workspaceId}` : '')
  const profiles = useProfiles()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()
    return profiles.filter((profile) => {
      if (workspaceId && !profile.memberships.some((row) => row.workspaceId === workspace.id)) {
        return false
      }
      if (role !== 'all' && !hasRole(profile, role)) {
        return false
      }
      if (!search) {
        return true
      }
      return `${profile.name} ${profile.email} ${profile.key}`.toLowerCase().includes(search)
    })
  }, [profiles, query, role, workspace.id, workspaceId])

  return (
    <section className="profile-screen">
      <header className="doc-library-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">
            <img src="/house0.svg" alt="" width={12} height={12} />
            <Link to={workspace.path}>Home</Link>
          </span>
          <span className="breadcrumb-item">
            <img src="/chevron-right0.svg" alt="" width={12} height={12} />
            <span aria-current="page">Profiles</span>
          </span>
        </nav>
        <div className="title-row">
          <h1>Profiles</h1>
          <span className="count-pill">{visible.length}</span>
        </div>
        <p className="description">
          {workspaceId
            ? `People in ${workspace.name}. Open a name to see that profile.`
            : 'Find a person by name, email, or user key.'}
        </p>
      </header>

      <div className="panel profile-directory">
        <form className="profile-search" onSubmit={(event) => event.preventDefault()}>
          <img src="/search1.png" alt="" width={14} height={14} />
          <label className="visually-hidden" htmlFor="profile-search">
            Find a profile
          </label>
          <input
            id="profile-search"
            type="search"
            value={query}
            placeholder="Name, email, or user key"
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <div className="doc-filters" role="group" aria-label="Filter profiles">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={role === filter.id ? 'is-selected' : undefined}
              aria-pressed={role === filter.id}
              onClick={() => setRole(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="profile-empty">No profiles match that search.</p>
        ) : (
          <ul className="profile-rows">
            {visible.map((profile) => (
              <li key={profile.slug}>
                <Link className="profile-row" to={profileHref(profile.slug, workspaceId ?? undefined)}>
                  <span className="person-avatar" aria-hidden="true">
                    {profile.initials}
                  </span>
                  <span>
                    <strong>
                      {profile.name}
                      {profile.you ? <span className="profile-you">You</span> : null}
                    </strong>
                    <span>{profile.email}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default ProfileDirectoryPage

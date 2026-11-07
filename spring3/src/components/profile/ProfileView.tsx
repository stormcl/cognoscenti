import { Link } from 'react-router-dom'
import {
  ROLES,
  formatLastLogin,
  themeLabel,
  type Profile,
} from '../../data/profiles'
import { toggleWatch, useWatchedSlugs } from '../../data/watch'

type ProfileViewProps = {
  profile: Profile
  onEdit?: () => void
}

function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const watched = useWatchedSlugs()
  const watching = !profile.you && watched.includes(profile.slug)

  return (
    <article className="profile-view">
      <header className="panel profile-identity">
        <span className="person-avatar profile-avatar" aria-hidden="true">
          {profile.initials}
        </span>
        <div className="profile-identity-copy">
          <h2>{profile.name}</h2>
          <p>{profile.you ? 'This is your profile' : 'Profile'}</p>
        </div>
        <div className="profile-identity-actions">
          {onEdit ? (
            <button className="button-solid" type="button" onClick={onEdit}>
              Edit profile
            </button>
          ) : null}
          {profile.you ? null : (
            <button
              className="chip"
              type="button"
              aria-pressed={watching}
              onClick={() => toggleWatch(profile.slug)}
            >
              <img src="/eye0.svg" alt="" width={15} height={15} />
              {watching ? 'Watching' : 'Watch'}
            </button>
          )}
        </div>
      </header>

      <section className="panel profile-section" aria-labelledby="profile-roles">
        <h2 id="profile-roles">Roles</h2>
        <ul className="role-list">
          {profile.memberships.map((membership) => (
            <li key={membership.workspaceId}>
              <span className="role-badge">
                <strong>{ROLES[membership.role].label}</strong>
                <span>{membership.workspaceName}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel profile-section" aria-labelledby="profile-workspaces">
        <h2 id="profile-workspaces">Workspaces</h2>
        <ul className="profile-links">
          {profile.memberships.map((membership) => (
            <li key={membership.workspaceId}>
              <Link className="chip" to={membership.path}>
                {membership.workspaceName}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel profile-facts">
        <div>
          <h3>Email</h3>
          <p>{profile.email}</p>
        </div>
        <div>
          <h3>Time zone</h3>
          <p>{profile.timeZone}</p>
        </div>
        <div>
          <h3>Last login</h3>
          <p>{formatLastLogin(profile.lastLogin)}</p>
        </div>
        <div>
          <h3>User key</h3>
          <p>
            <code>{profile.key}</code>
          </p>
        </div>
        <div>
          <h3>About</h3>
          <p>{profile.description}</p>
        </div>
        <div>
          <h3>Theme</h3>
          <p>{themeLabel(profile.theme)}</p>
        </div>
      </section>
    </article>
  )
}

export default ProfileView

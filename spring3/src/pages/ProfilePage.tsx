import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ProfileEdit from '../components/profile/ProfileEdit'
import ProfileView from '../components/profile/ProfileView'
import { directoryPath, useProfile } from '../data/profiles'
import { workspaceFromLocation } from '../data/workspaces'

function ProfilePage() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const workspaceId = params.get('workspace')
  const workspace = workspaceFromLocation('/profile', workspaceId ? `?workspace=${workspaceId}` : '')
  const profile = useProfile(slug)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setEditing(false)
  }, [slug])

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
            <Link to={directoryPath(workspaceId)}>Profiles</Link>
          </span>
          <span className="breadcrumb-item">
            <img src="/chevron-right0.svg" alt="" width={12} height={12} />
            <span aria-current="page">{profile?.name ?? 'Profile'}</span>
          </span>
        </nav>
      </header>

      {profile ? (
        editing && profile.you ? (
          <ProfileEdit profile={profile} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
        ) : (
          <ProfileView profile={profile} onEdit={profile.you ? () => setEditing(true) : undefined} />
        )
      ) : (
        <section className="panel profile-section">
          <h2>Profile not in this prototype</h2>
          <p>That person is not in the demo directory.</p>
          <Link className="text-link" to={directoryPath(workspaceId)}>
            Back to profiles
          </Link>
        </section>
      )}
    </section>
  )
}

export default ProfilePage

import { Link } from 'react-router-dom'
import { loginRedirect, useSession } from '../data/session'
import { useWorkspaces } from '../data/workspaces'

function WorkspaceListPage() {
  const session = useSession()
  const workspaces = useWorkspaces()

  return (
    <section className="doc-library sandbox-workspace-list">
      <header className="doc-library-head">
        <h1>Your workspaces</h1>
        <p className="description">
          {session.status === 'loading'
            ? 'Checking the Weaver session…'
            : session.status === 'error'
              ? session.error
              : session.status === 'signed-out'
                ? 'You are not signed in.'
                : 'Open a workspace to see its meetings, documents, discussions, and people.'}
        </p>
      </header>
      {session.status === 'signed-out' || session.status === 'error' ? (
        <div className="signed-out-panel">
          <p>Log in to open your workspaces and the meetings, documents, and discussions in them.</p>
          <button className="button-light" type="button" onClick={loginRedirect}>
            Log in
          </button>
        </div>
      ) : null}
      {session.status === 'signed-in' && workspaces.length === 0 ? (
        <p className="profile-empty">
          No workspaces are listed for this account. <Link to="/sites">Request a site</Link> or{' '}
          <Link to="/workspaces">create a workspace</Link>.
        </p>
      ) : null}
      <ul className="workspace-children sandbox-workspace-cards">
        {workspaces.map((row) => (
          <li key={row.id}>
            <Link className="workspace-child" to={row.path}>
              <span className="workspace-avatar" aria-hidden="true">
                {row.code}
              </span>
              <span className="workspace-name">
                <strong>{row.name}</strong>
                <span>
                  {row.members} members · {row.stewards} stewards
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WorkspaceListPage

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { openWorkspace } from '../data/live'
import { useSession } from '../data/session'
import { useWorkspaces, workspaceById, workspaceIdFor } from '../data/workspaces'
import WorkspaceHome from './WorkspaceHome'

function WorkspaceRoute() {
  const { siteKey = '', pageKey = '' } = useParams()
  const session = useSession()
  const id = workspaceIdFor(siteKey, pageKey)
  useWorkspaces()
  const workspace = workspaceById(id)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session.status !== 'signed-in' || !siteKey || !pageKey) {
      return
    }
    let cancel = false
    setError('')
    openWorkspace(siteKey, pageKey, session.user).catch((reason: unknown) => {
      if (!cancel) {
        setError(reason instanceof Error ? reason.message : 'Unable to load this workspace.')
      }
    })
    return () => {
      cancel = true
    }
  }, [session.status, session.user, siteKey, pageKey])

  if (session.status === 'loading') {
    return <p className="profile-empty">Checking the Weaver session…</p>
  }
  if (session.status !== 'signed-in') {
    return <p className="profile-empty">Log in to open this workspace.</p>
  }
  if (error) {
    return <p className="profile-empty">{error}</p>
  }
  if (!workspace) {
    return <p className="profile-empty">Loading workspace…</p>
  }
  return <WorkspaceHome workspaceId={id} />
}

export default WorkspaceRoute

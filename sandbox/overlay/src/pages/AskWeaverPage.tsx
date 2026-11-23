import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import WeaverShell, { type WeaverMode } from '../components/WeaverShell'
import { workspaceFromLocation, type WorkspaceDemo } from '../data/workspaces'

function askReply(workspace: WorkspaceDemo, prompt: string) {
  const update = workspace.updates[0]
  const recent = update ? `${update.title} — ${update.detail}` : 'No recent updates are listed.'
  return `In ${workspace.name}, ${workspace.description}\n\nNext meeting: ${workspace.nextMeeting.title}, ${workspace.nextMeeting.when}. ${workspace.openActions} open action items, ${workspace.members} members, ${workspace.documentCount} documents.\n\nMost recent: ${recent}\n\nYou asked, “${prompt}.” I can go further on decisions, people, or the files in this workspace.`
}

function scribeReply(workspace: WorkspaceDemo, prompt: string) {
  return `Weaver Scribe can draft from ${workspace.name}.\n\nA recording would land here as short phrases, then a minutes draft: what was discussed, what was decided, and who follows up. ${workspace.nextMeeting.title} is the next session on the calendar.\n\nFor “${prompt},” start with the decisions and the open action items, then leave names for a person to check.`
}

function AskWeaverPage() {
  const location = useLocation()
  const workspace = workspaceFromLocation(location.pathname, location.search)
  const [mode, setMode] = useState<WeaverMode>('ask')
  const prompts = useMemo(
    () =>
      mode === 'ask'
        ? [
            `Ask Weaver about ${workspace.name}`,
            'Ask Weaver what the team decided',
            'Ask Weaver who owns the open items',
            'Ask Weaver to summarize recent updates',
          ]
        : [
            'Ask Weaver Scribe to draft the minutes',
            'Ask Weaver Scribe for the decisions',
            'Ask Weaver Scribe to list next steps',
            'Ask Weaver Scribe to summarize the recording',
          ],
    [mode, workspace.name],
  )

  return (
    <WeaverShell
      key={mode}
      variant="page"
      mode={mode}
      onModeChange={setMode}
      title={mode === 'ask' ? 'Ask Weaver' : 'Weaver Scribe'}
      kicker={mode === 'ask' ? workspace.name : 'Minutes, transcripts, and drafts'}
      prompts={prompts}
      replyFor={(prompt) => (mode === 'ask' ? askReply(workspace, prompt) : scribeReply(workspace, prompt))}
    />
  )
}

export default AskWeaverPage

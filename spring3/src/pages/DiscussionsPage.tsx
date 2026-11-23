// React hooks, form typing, and routing utilities used on this page
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// Discussion records, workspace context, session information, and write operations
// Some imports provide demo values; keep these unchanges until the data integration is reviewed
import { YOU } from '../data/documents'
import {
  DEMO_COMPOSER,
  SUBJECT_LIMIT,
  useDiscussions,
  type Discussion,
  type DiscussionStatus,
} from '../data/discussions'
import { workspaceFromLocation } from '../data/workspaces'
import { useSession } from '../data/session'
import { postDiscussion } from '../data/writes'
import { openWorkspace } from '../data/live'

// Supported list filters. Archived is handled separately from the visible filter buttons
type FilterId = 'all' | DiscussionStatus | 'mine' | 'archived'

// Labels for the primary discussion filter tabs
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'draft', label: 'Drafts' },
  { id: 'mine', label: 'Started by me' },
]

// Wraps selected editor text with formatting markers and returns the new cursor position
function wrapSelection(value: string, start: number, end: number, before: string, after: string) {
  const selected = value.slice(start, end) || 'text'
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
  const cursor = start + before.length + selected.length + after.length
  return { next, cursor }
}

// Main page: resolves workspace content, manages the composer, and renders discussions
function DiscussionsPage() {
  // Resolve the signed-in user and current workspace from the URL
  const [params] = useSearchParams()
  const session = useSession()
  const you = session.status === 'signed-in' ? session.user : null
  const workspace = workspaceFromLocation('/discussions', params.toString() ? `?${params.toString()}` : '')
  const requestedWorkspace = params.get('workspace')

  // Limit the loaded discussions when a workspace filter is provided in the URL
  const discussions = useDiscussions().filter(
    (row) => !requestedWorkspace || row.workspaceId === requestedWorkspace,
  )

  // Ask the backend to open the workspace when session and workspace keys are available
  // A failed request does not clear discussions that were already loaded
  useEffect(() => {
    if (!you || !workspace.siteKey || !workspace.pageKey) {
      return
    }
    void openWorkspace(workspace.siteKey, workspace.pageKey, you).catch(() => {
      // The list still shows whatever was already loaded.
    })
  }, [you, workspace.siteKey, workspace.pageKey])

  // Local UI state: list controls, composer fields, and submission feedback
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [composerOpen, setComposerOpen] = useState(params.get('new') === '1')

  // References for mobile modal focus management
  const subjectRef = useRef<HTMLInputElement>(null)
  const newButtonRef = useRef<HTMLButtonElement>(null)
  const composerRef = useRef<HTMLFormElement>(null)
  const [subject, setSubject] = useState(DEMO_COMPOSER.subject)
  const [body, setBody] = useState(DEMO_COMPOSER.body)
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Support direct links that open the new discussion composer (?new=1)
  useEffect(() => {
    if (params.get('new') === '1') {
      setComposerOpen(true)
    }
  }, [params])

  // Calculate the badge counts shown beside the discussion filters
  const counts: Record<FilterId, number> = {
    all: discussions.length,
    open: discussions.filter((row) => row.status === 'open').length,
    draft: discussions.filter((row) => row.status === 'draft').length,
    mine: discussions.filter((row) => row.authorName === YOU.name).length,
    archived: 0,
  }

  // Apply the selected status/ownership filter abd case-insensitive text search
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()
    return discussions.filter((row) => {
      if (filter === 'archived') {
        return false
      }
      if (filter === 'mine' && row.authorName !== YOU.name) {
        return false
      }
      if ((filter === 'open' || filter === 'draft') && row.status !== filter) {
        return false
      }
      if (!search) {
        return true
      }
      return `${row.title} ${row.summary} ${row.body}`.toLowerCase().includes(search)
    })
  }, [discussions, filter, query])

  // Restore the composer defaults after closing or successfully submitting
  function resetComposer() {
    setSubject(DEMO_COMPOSER.subject)
    setBody(DEMO_COMPOSER.body)
    setNotify(true)
  }

  // Hide the composer and clear any previous validation error
  function closeComposer() {
    setComposerOpen(false)
    resetComposer()
    setFormError('')
  }

  // Allow users to close the composer with Escape
  useEffect(() => {
    if (!composerOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeComposer()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [composerOpen])

  // Prevent background scrolling while the mobile modal is open
  useEffect(() => {
    if (!composerOpen) return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    if (!mediaQuery.matches) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [composerOpen])

  // Move focus into the mobile modal and restore it when closed
  useEffect(() => {
    if (!composerOpen) return
    if (!window.matchMedia('(max-width: 767px)').matches) return

    const previousFocus = document.activeElement as HTMLElement | null

    subjectRef.current?.focus()

    return () => {
      if (previousFocus?.isConnected) {
        previousFocus.focus()
      } else {
        newButtonRef.current?.focus()
      }
    }
  }, [composerOpen])

  // Keep Tab navigation inside the mobile discussion modal
  useEffect(() => {
    if (!composerOpen) return
    if (!window.matchMedia('(max-width: 767px)').matches) return

    function handleTab(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const composer = composerRef.current
      if (!composer) return

      const focusable = Array.from(
        composer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]'
        )
      ).filter((element) => element.getClientRects().length > 0)

      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && (document.activeElement === first || !composer.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !composer.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleTab)
    }
  }, [composerOpen])

  // Insert lightweight markup around the textarea selection, then restore focus
  function applyMarkup(before: string, after: string) {
    const field = document.getElementById('discussion-body') as HTMLTextAreaElement | null
    const start = field?.selectionStart ?? body.length
    const end = field?.selectionEnd ?? body.length
    const { next, cursor } = wrapSelection(body, start, end, before, after)
    setBody(next)
    requestAnimationFrame(() => {
      field?.focus()
      field?.setSelectionRange(cursor, cursor)
    })
  }

  // Validate and submit a new discussion as either a draft or published topic
  // The clicked submit button determines which action is requested
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')
    if (!subject.trim()) {
      setFormError('A discussion needs a subject.')
      return
    }
    if (!workspace.siteKey || !workspace.pageKey) {
      setFormError('Open a workspace before posting a discussion.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await postDiscussion(
        workspace,
        {
          subject: subject.trim(),
          body: body.trim(),
          draft: intent === 'draft',
          notify,
        },
        you,
      )
      closeComposer()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not post the discussion.')
    } finally {
      setSaving(false)
    }
  }

  // Page layout: breadcrumbs, composer, list controls, and discussion results
  return (
    <section className="doc-library discussions">
      <header className="doc-library-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span className="breadcrumb-item">
            <img src="/house0.svg" alt="" width={12} height={12} />
            <Link to="/">Home</Link>
          </span>
          {workspace.breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="breadcrumb-item">
              <img src="/chevron-right0.svg" alt="" width={12} height={12} />
              {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </span>
          ))}
          <span className="breadcrumb-item">
            <img src="/chevron-right0.svg" alt="" width={12} height={12} />
            <span aria-current="page">Discussions</span>
          </span>
        </nav>
      <div className="title-row">
        <h1>Discussions</h1>
        <span className="count-pill">{discussions.length}</span>

        {/* Mobile: new discussion action beside the heading */}
        <button
        ref={newButtonRef}
          type="button"
          className="button-solid discussion-mobile-new"
          onClick={() => setComposerOpen(true)}
        >
        <span aria-hidden="true">+</span>
          New
        </button>
      </div>
        <p className="description">
          Start a topic for the group right here. Drafts are visible only to you until you publish them.
        </p>
      </header>

      {/* Show the editable composer or the compact new-discussion starter */}
      {composerOpen ? (
        <form 
          ref={composerRef}
          className="discussion-composer"
          role="dialog"
          aria-modal={true}
          aria-label="New discussion" 
          onSubmit={onSubmit}>
        <div className="discussion-composer-head">
          {/* Desktop modal header */}
          <div className="discussion-composer-author">
            <span className="discussion-header-icon" aria-hidden="true">♧</span>

            <div>
              <h2>New discussion topic</h2>
              <p>
                Give it a clear subject and a short summary.
                The conversation starts after you publish.
              </p>
            </div>
          </div>

          {/* Mobile bottom-sheet title */}
          <h2 className="discussion-mobile-title">New discussion</h2>

          {/* Desktop close button */}
          <button
            type="button"
            className="discussion-close"
            aria-label="Close new discussion"
            onClick={closeComposer}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Subject field and short-description editor */}
          <div className="discussion-composer-grid">
            <label className="discussion-field">
              <span>
                Subject <abbr title="required">*</abbr>
              </span>
              <input
                placeholder="e.g. ‘Division of heuristic evaluation’"
                ref={subjectRef}
                value={subject}
                maxLength={SUBJECT_LIMIT}
                onChange={(event) => setSubject(event.target.value)}
                required
              />
              <div className="discussion-subject-footer">
                <span className="discussion-subject-help">
                  A few words so others know what it's about
                </span>

                <span className="discussion-count">
                  {subject.length} / {SUBJECT_LIMIT}
                </span>
              </div>
            </label>

            <label className="discussion-field">
              <span>Short description</span>
              <div className="discussion-editor">
                <div className="discussion-toolbar" role="toolbar" aria-label="Description formatting">
                  <button type="button" aria-label="Bold" onClick={() => applyMarkup('**', '**')}>
                    B
                  </button>
                  <button type="button" aria-label="Italic" onClick={() => applyMarkup('*', '*')}>
                    I
                  </button>
                  <button type="button" aria-label="List" onClick={() => applyMarkup('\n- ', '')}>
                    <img src="/dash0.svg" alt="" width={14} height={14} />
                  </button>
                  <button type="button" aria-label="Link" onClick={() => applyMarkup('[', '](https://)')}>
                    <img src="/globe0.svg" alt="" width={14} height={14} />
                  </button>
                </div>
                <textarea
                  id="discussion-body"
                  value={body}
                  rows={4}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What should the group discuss, and why now?"
                />
              </div>

              <p className="discussion-description-help">
                Keep it brief. Replies go inside the discussion.
              </p> 
            </label>
          </div>

        {/* Notification preference and draft/publish actions */}
          <div className="discussion-composer-foot">
            
            <label className="discussion-notify">
              <input
                type="checkbox"
                role="switch"
                checked={notify}
                onChange={(event) => setNotify(event.target.checked)}
              />

              <span className="discussion-desktop-check" aria-hidden="true" />

              <span>Notify workspace members when published</span>

              <span className="discussion-switch" aria-hidden="true" />
            </label>
            <div className="discussion-composer-actions">
              <button className="button-light docs-secondary discussion-cancel" type="button" onClick={closeComposer} disabled={saving}>
                Cancel
              </button>
              <button className="button-light docs-secondary" type="submit" value="draft" disabled={saving}>
                Save as draft
              </button>
              <button className="button-solid docs-primary" type="submit" value="publish" disabled={saving}>
                {saving ? 'Saving…' : 'Publish discussion'}
              </button>
            </div>
          </div>
          {formError ? <p className="form-error">{formError}</p> : null}
        </form>
      ) : (
        <div className="discussion-starter">
          <span className="person-avatar lg" aria-hidden="true">
            {YOU.initials}
          </span>
          <button type="button" className="discussion-starter-input" onClick={() => setComposerOpen(true)}>
            Start a new discussion…
          </button>
          <button className="button-solid docs-primary" type="button" onClick={() => setComposerOpen(true)}>
            <img src="/plus0.svg" alt="" width={14} height={14} />
            New discussion
          </button>
        </div>
      )}

      {/* Status filters, text search, and the existing sort control */}
      <div className="doc-toolbar">
        <div className="doc-filters" role="tablist" aria-label="Discussion status">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={filter === item.id ? 'is-selected' : undefined}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span>{counts[item.id]}</span>
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'archived'}
            className={filter === 'archived' ? 'is-selected' : undefined}
            onClick={() => setFilter('archived')}
          >
            Archived
            <img src="/chevron-down0.svg" alt="" width={12} height={12} />
          </button>
        </div>
        <label className="doc-search">
          <img src="/search1.png" alt="" width={14} height={14} />
          <span className="visually-hidden">Search titles and descriptions</span>
          <input
            type="search"
            value={query}
            placeholder="Search titles & descriptions..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="docs-select">
          <img src="/chevrons-up-down0.svg" alt="" width={14} height={14} />
          <span className="visually-hidden">Sort</span>
          <select aria-label="Sort" defaultValue="activity">
            <option value="activity">Last activity</option>
          </select>
        </label>
      </div>

      {/* Desktop-oriented results table; mobile presentation will be reviewed separately */}
      <div className="panel docs-table-card">
        <table className="docs-table discussions-table">
          <caption className="visually-hidden">Discussions in {workspace.name}</caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Status</th>
              <th scope="col">Started by</th>
              <th scope="col">Replies</th>
              <th scope="col">Last activity</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => <DiscussionRow key={row.id} row={row} />)
            ) : (
              <tr>
                <td className="docs-empty" colSpan={6}>
                  No discussions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="docs-footnote">
          Showing {visible.length} of {discussions.length} discussions
        </p>
      </div>

      {/* Mobile discussion cards */}
      <div className="discussion-mobile-list">
        {visible.length ? (
          visible.map((row) => (
            <DiscussionCard key={row.id} row={row} />
          ))
        ) : (
          <p className="docs-empty">
            No discussions match these filters.
          </p>
        )}
      </div>
    </section>
  )
}

// Mobile discussion card based on the UX team's mid-fi design
function DiscussionCard ({ row }: { row: Discussion}) {
  return (
    <article className="discussion-card">
      {/* Stautus, last activity, and actions */}
      <div className="discussion-card-head">
        <span className={`discussion-status is-${row.status}`}>
          <span className="discussion-status-dot" aria-hidden="true" />
          {row.status === 'open' ? 'Open' : 'Draft'}
        </span>

        <span className="discussion-card-activity">
          {row.lastActivity}
        </span>

        <button
          type="button"
          className="docs-more"
          aria-label={`More actions for ${row.title}`}
          >
            ...
          </button>
      </div>

      {/* Discussion title and summary */}
      <div className="discussion-card-content">
        <h2>
        <Link to={`/discussions/${row.id}${window.location.search}`}>
          {row.title}
        </Link>
        </h2>
        <p>{row.summary}</p>
      </div>

      {/* Author and reply count */}
      <div className="discussion-card-foot">
        <span className="doc-owner">
          <span className="person-avatar" aria-hidden="true">
            {row.authorInitials}
          </span>
          {row.authorName}
        </span>

        <span className="discussion-replies">
          <img src="/msg0.svg" alt="" width={14} height={14} />
          {row.replies == null ? '-' : `${row.replies} replies`}
        </span>
      </div>
    </article>
  )
}

// Renders one discussion's topic, status, author, reply count, and activity
function DiscussionRow({ row }: { row: Discussion }) {
  return (
    <tr>
      <td data-label="Topic">
        <div className="discussion-topic">
          <span className="discussion-topic-icon" aria-hidden="true">
            <img src="/msg0.svg" alt="" width={16} height={16} />
          </span>
          <span>
            <Link to={`/discussions/${row.id}${window.location.search}`}>
              <strong>{row.title}</strong>
            </Link>
            <span>{row.summary}</span>
          </span>
        </div>
      </td>

      <td data-label="Status">
        <span className={`discussion-status is-${row.status}`}>
          <span className="discussion-status-dot" aria-hidden="true" />
          {row.status === 'open' ? 'Open' : 'Draft'}
        </span>
      </td>

      <td data-label="Started by">
        <span className="doc-owner">
          <span className="person-avatar">{row.authorInitials}</span>
          {row.authorName}
        </span>
      </td>

      <td data-label="Replies">
        <span className="discussion-replies">
          <img src="/msg0.svg" alt="" width={14} height={14} />
          {row.replies == null ? '—' : row.replies}
        </span>
      </td>

      <td data-label="Last activity">{row.lastActivity}</td>

      <td data-label="Actions">
        <button 
          className="docs-more" 
          type="button" 
          aria-label={`More actions for ${row.title}`}
        >
          ...
        </button>
      </td>
    </tr>
  )
}

export default DiscussionsPage

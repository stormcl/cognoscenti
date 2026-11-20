import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { YOU } from '../data/documents'
import {
  DEMO_COMPOSER,
  SUBJECT_LIMIT,
  useDiscussions,
  type Discussion,
  type DiscussionStatus,
} from '../data/discussions'
import { workspaceFromLocation } from '../data/workspaces'

type FilterId = 'all' | DiscussionStatus | 'mine' | 'archived'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'draft', label: 'Drafts' },
  { id: 'mine', label: 'Started by me' },
]

function wrapSelection(value: string, start: number, end: number, before: string, after: string) {
  const selected = value.slice(start, end) || 'text'
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
  const cursor = start + before.length + selected.length + after.length
  return { next, cursor }
}

function DiscussionsPage() {
  const [params] = useSearchParams()
  const workspace = workspaceFromLocation('/discussions', params.toString() ? `?${params.toString()}` : '')
  const requestedWorkspace = params.get('workspace')
  const discussions = useDiscussions().filter(
    (row) => !requestedWorkspace || row.workspaceId === requestedWorkspace,
  )
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [composerOpen, setComposerOpen] = useState(params.get('new') === '1')
  const [subject, setSubject] = useState(DEMO_COMPOSER.subject)
  const [body, setBody] = useState(DEMO_COMPOSER.body)
  const [notify, setNotify] = useState(true)

  useEffect(() => {
    if (params.get('new') === '1') {
      setComposerOpen(true)
    }
  }, [params])

  const counts: Record<FilterId, number> = {
    all: discussions.length,
    open: discussions.filter((row) => row.status === 'open').length,
    draft: discussions.filter((row) => row.status === 'draft').length,
    mine: discussions.filter((row) => row.authorName === YOU.name).length,
    archived: 0,
  }

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

  function resetComposer() {
    setSubject(DEMO_COMPOSER.subject)
    setBody(DEMO_COMPOSER.body)
    setNotify(true)
  }

  function closeComposer() {
    setComposerOpen(false)
    resetComposer()
  }

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

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
        </div>
        <p className="description">
          Start a topic for the group right here. Drafts are visible only to you until you publish them.
        </p>
      </header>

      {composerOpen ? (
        <form className="discussion-composer" onSubmit={onSubmit}>
          <div className="discussion-composer-head">
            <span className="person-avatar lg" aria-hidden="true">
              {YOU.initials}
            </span>
            <div>
              <h2>New discussion</h2>
              <p>Posting in {workspace.name} is not connected yet.</p>
            </div>
            <button className="doc-close" type="button" aria-label="Close" onClick={closeComposer}>
              ×
            </button>
          </div>

          <div className="discussion-composer-grid">
            <label className="discussion-field">
              <span>
                Subject <abbr title="required">*</abbr>
              </span>
              <input
                value={subject}
                maxLength={SUBJECT_LIMIT}
                onChange={(event) => setSubject(event.target.value)}
                required
              />
              <span className="discussion-count">
                {subject.length} / {SUBJECT_LIMIT}
              </span>
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
                />
              </div>
            </label>
          </div>

          <div className="discussion-composer-foot">
            <label className="discussion-notify">
              <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
              Notify workspace members when published
            </label>
            <div className="discussion-composer-actions">
              <button className="button-light docs-secondary" type="button" onClick={closeComposer}>
                Cancel
              </button>
              <button className="button-light docs-secondary" type="submit">
                Save as draft
              </button>
              <button className="button-solid docs-primary" type="submit">
                Publish discussion
              </button>
            </div>
          </div>
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
    </section>
  )
}

function DiscussionRow({ row }: { row: Discussion }) {
  return (
    <tr>
      <td>
        <div className="discussion-topic">
          <span className="discussion-topic-icon" aria-hidden="true">
            <img src="/msg0.svg" alt="" width={16} height={16} />
          </span>
          <span>
            <strong>{row.title}</strong>
            <span>{row.summary}</span>
          </span>
        </div>
      </td>
      <td>
        <span className={`discussion-status is-${row.status}`}>
          <span className="discussion-status-dot" aria-hidden="true" />
          {row.status === 'open' ? 'Open' : 'Draft'}
        </span>
      </td>
      <td>
        <span className="doc-owner">
          <span className="person-avatar">{row.authorInitials}</span>
          {row.authorName}
        </span>
      </td>
      <td>
        <span className="discussion-replies">
          <img src="/msg0.svg" alt="" width={14} height={14} />
          {row.replies == null ? '—' : row.replies}
        </span>
      </td>
      <td>{row.lastActivity}</td>
      <td>
        <button className="docs-more" type="button" aria-label={`More actions for ${row.title}`}>
          ···
        </button>
      </td>
    </tr>
  )
}

export default DiscussionsPage

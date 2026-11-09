import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Menu from '../components/Menu'
import {
  KIND_ICON,
  KIND_LABEL,
  YOU,
  addDocument,
  describeLink,
  extensionOf,
  fileError,
  formatBytes,
  formatDocDate,
  kindFromExtension,
  matchesCreated,
  nameFromFile,
  nowStamp,
  parseStamp,
  removeDocument,
  shortName,
  useWorkspaceDocuments,
  type CreatedRange,
  type DocKind,
  type WorkspaceDocument,
} from '../data/documents'
import { workspaceFromLocation } from '../data/workspaces'

type ComposerTab = 'file' | 'link'
type SortKey = 'updated' | 'created' | 'name'

const PAGE_SIZE = 5
const FILTERS: { id: 'all' | DocKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'slides', label: 'Slides' },
  { id: 'doc', label: 'Docs' },
  { id: 'image', label: 'Images' },
  { id: 'link', label: 'Links' },
]

const CREATED_OPTIONS: { id: CreatedRange; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'today', label: 'Today' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'lastWeek', label: 'Last week' },
  { id: 'last30', label: 'Last 30 days' },
]

function DocumentsPage() {
  const [params, setParams] = useSearchParams()
  const workspace = workspaceFromLocation('/documents', params.toString() ? `?${params.toString()}` : '')
  const documents = useWorkspaceDocuments(workspace.id)
  const [kind, setKind] = useState<'all' | DocKind>('all')
  const [query, setQuery] = useState('')
  const [created, setCreated] = useState<CreatedRange>('any')
  const [sort, setSort] = useState<SortKey>('updated')
  const [showAll, setShowAll] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerTab, setComposerTab] = useState<ComposerTab>('file')
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [docName, setDocName] = useState('')
  const [nameEdited, setNameEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [notify, setNotify] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState<WorkspaceDocument | null>(null)
  const [preview, setPreview] = useState<WorkspaceDocument | null>(null)
  const [highlightId, setHighlightId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const composerRef = useRef<HTMLDialogElement>(null)
  const previewRef = useRef<HTMLDialogElement>(null)
  const add = params.get('add')

  useEffect(() => {
    setKind('all')
    setQuery('')
    setCreated('any')
    setSort('updated')
    setShowAll(false)
    setToast(null)
    setPreview(null)
  }, [workspace.id])

  useEffect(() => {
    if (add !== 'file' && add !== 'link') {
      return
    }
    openComposer(add)
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('add')
        return next
      },
      { replace: true },
    )
  }, [add, setParams])

  useEffect(() => {
    const node = composerRef.current
    if (!node) {
      return
    }
    if (composerOpen && !node.open) {
      node.showModal()
    }
    if (!composerOpen && node.open) {
      node.close()
    }
  }, [composerOpen])

  useEffect(() => {
    const node = previewRef.current
    if (!node) {
      return
    }
    if (preview && !node.open) {
      node.showModal()
    }
    if (!preview && node.open) {
      node.close()
    }
  }, [preview])

  useEffect(() => {
    if (!file || uploadProgress >= 100) {
      return
    }
    const timer = window.setInterval(() => {
      setUploadProgress((value) => Math.min(100, value + 12))
    }, 180)
    return () => window.clearInterval(timer)
  }, [file, uploadProgress])

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return documents
      .filter((item) => (kind === 'all' ? true : item.kind === kind))
      .filter((item) => matchesCreated(item.createdAt, created))
      .filter((item) => {
        if (!needle) {
          return true
        }
        return (
          item.name.toLowerCase().includes(needle) ||
          item.ownerName.toLowerCase().includes(needle) ||
          shortName(item.ownerName).toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (sort === 'name') {
          return a.name.localeCompare(b.name)
        }
        const aTime = parseStamp(sort === 'created' ? a.createdAt : a.updatedAt).getTime()
        const bTime = parseStamp(sort === 'created' ? b.createdAt : b.updatedAt).getTime()
        return bTime - aTime
      })
  }, [created, documents, kind, query, sort])

  const counts = useMemo(() => {
    const tally: Record<'all' | DocKind, number> = {
      all: documents.length,
      pdf: 0,
      slides: 0,
      doc: 0,
      image: 0,
      link: 0,
    }
    documents.forEach((item) => {
      tally[item.kind] += 1
    })
    return tally
  }, [documents])

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE)
  const linkInfo = describeLink(linkUrl)

  function openComposer(tab: ComposerTab, nextFile?: File) {
    const error = nextFile ? fileError(nextFile) : ''
    setComposerTab(tab)
    setFile(error ? null : (nextFile ?? null))
    setUploadProgress(error || !nextFile ? 0 : 8)
    setDocName(!error && nextFile ? nameFromFile(nextFile.name) : '')
    setNameEdited(false)
    setDescription('')
    setNotify(false)
    setLinkUrl('')
    setFormError(error)
    setComposerOpen(true)
    setPreview(null)
  }

  function chooseFile(next: File | null) {
    if (!next) {
      setFile(null)
      setUploadProgress(0)
      return
    }
    const error = fileError(next)
    setFile(error ? null : next)
    setUploadProgress(error ? 0 : 8)
    setFormError(error)
    if (!error && !nameEdited) {
      setDocName(nameFromFile(next.name))
    }
  }

  function onDropZone(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    const next = event.dataTransfer.files[0]
    if (!next) {
      return
    }
    if (composerOpen && composerTab === 'file') {
      chooseFile(next)
      return
    }
    openComposer('file', next)
  }

  function submitDocument(event: FormEvent) {
    event.preventDefault()
    const name = docName.trim()
    if (composerTab === 'file') {
      if (!file) {
        setFormError('Choose a file to upload.')
        return
      }
      const error = fileError(file)
      if (error) {
        setFormError(error)
        return
      }
      if (!name) {
        setFormError('Add a document name.')
        return
      }
      const extension = extensionOf(file.name)
      const stamp = nowStamp()
      const added = addDocument({
        workspaceId: workspace.id,
        name,
        description: description.trim(),
        kind: kindFromExtension(extension),
        extension,
        sizeLabel: formatBytes(file.size),
        ownerName: YOU.name,
        ownerInitials: YOU.initials,
        createdAt: stamp,
        updatedAt: stamp,
        href: '',
        notify,
      })
      finishAdd(added)
      return
    }

    const info = describeLink(linkUrl)
    if (!info) {
      setFormError('Enter a link that starts with https://')
      return
    }
    if (!name) {
      setFormError('Add a link name.')
      return
    }
    const stamp = nowStamp()
    const added = addDocument({
      workspaceId: workspace.id,
      name,
      description: description.trim(),
      kind: 'link',
      extension: info.host,
      sizeLabel: 'external link',
      ownerName: YOU.name,
      ownerInitials: YOU.initials,
      createdAt: stamp,
      updatedAt: stamp,
      href: linkUrl.trim(),
      notify,
    })
    finishAdd(added)
  }

  function finishAdd(added: WorkspaceDocument) {
    setComposerOpen(false)
    setKind('all')
    setQuery('')
    setCreated('any')
    setSort('updated')
    setShowAll(false)
    setToast(added)
    setHighlightId(added.id)
    window.setTimeout(() => {
      document.getElementById(`document-${added.id}`)?.scrollIntoView({ block: 'nearest' })
    }, 50)
  }

  function reveal(item: WorkspaceDocument) {
    setToast(null)
    setHighlightId(item.id)
    setShowAll(true)
    window.setTimeout(() => {
      document.getElementById(`document-${item.id}`)?.scrollIntoView({ block: 'center' })
    }, 30)
  }

  return (
    <section
      className="doc-library"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return
        }
        setDragging(false)
      }}
      onDrop={onDropZone}
    >
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
            <span aria-current="page">Documents</span>
          </span>
        </nav>
        <div className="title-row">
          <h1>Documents</h1>
          <span className="count-pill">{documents.length}</span>
        </div>
        <p className="description">Find, open and add files shared with this workspace.</p>
      </header>

      <div className={`doc-drop${dragging ? ' is-dragging' : ''}`}>
        <p>
          <img src="/upload0.svg" alt="" width={18} height={18} />
          Drag & drop files here,{' '}
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            browse your computer
          </button>
          , or add a link (Miro, Figma, Google Drive...)
        </p>
        <div className="doc-drop-actions">
          <button className="button-light docs-secondary" type="button" onClick={() => openComposer('link')}>
            <img src="/globe0.svg" alt="" width={15} height={15} />
            Add link
          </button>
          <button className="button-solid docs-primary" type="button" onClick={() => openComposer('file')}>
            <img src="/plus0.svg" alt="" width={14} height={14} />
            Add document
          </button>
        </div>
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null
            event.target.value = ''
            if (next) {
              openComposer('file', next)
            }
          }}
        />
      </div>

      <div className="doc-toolbar">
        <div className="doc-filters" role="tablist" aria-label="Document type">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={kind === filter.id}
              className={kind === filter.id ? 'is-selected' : undefined}
              onClick={() => {
                setKind(filter.id)
                setShowAll(false)
              }}
            >
              {filter.label}
              <span>{counts[filter.id]}</span>
            </button>
          ))}
        </div>
        <label className="doc-search">
          <img src="/search1.png" alt="" width={14} height={14} />
          <span className="visually-hidden">Search by name or owner</span>
          <input
            type="search"
            value={query}
            placeholder="Search by name or owner..."
            onChange={(event) => {
              setQuery(event.target.value)
              setShowAll(false)
            }}
          />
        </label>
        <label className="docs-select">
          <span>Created:</span>
          <select
            value={created}
            aria-label="Created"
            onChange={(event) => {
              setCreated(event.target.value as CreatedRange)
              setShowAll(false)
            }}
          >
            {CREATED_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="docs-select">
          <span>Sort:</span>
          <select value={sort} aria-label="Sort" onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="updated">Last updated</option>
            <option value="created">Date added</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="panel docs-table-card">
        <table className="docs-table">
          <caption className="visually-hidden">Documents in {workspace.name}</caption>
          <thead>
            <tr>
              <th scope="col">Document</th>
              <th scope="col">Type</th>
              <th scope="col">Owner</th>
              <th scope="col">Last updated</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((item) => (
                <DocumentRow
                  key={item.id}
                  item={item}
                  highlighted={item.id === highlightId}
                  onOpen={() => setPreview(item)}
                  onRemove={() => {
                    removeDocument(item.id)
                    if (preview?.id === item.id) {
                      setPreview(null)
                    }
                    if (toast?.id === item.id) {
                      setToast(null)
                    }
                  }}
                />
              ))
            ) : (
              <tr>
                <td className="docs-empty" colSpan={5}>
                  No documents match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > PAGE_SIZE ? (
          <p className="docs-footnote">
            Showing {visible.length} of {filtered.length}
            <button type="button" onClick={() => setShowAll((open) => !open)}>
              {showAll ? 'Show less' : 'View all'}
            </button>
          </p>
        ) : null}
      </div>

      <dialog
        ref={composerRef}
        className="doc-modal"
        aria-labelledby="doc-composer-title"
        onClose={() => setComposerOpen(false)}
      >
        <form
          className="doc-modal-body"
          onSubmit={submitDocument}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (composerTab === 'file') {
              chooseFile(event.dataTransfer.files[0] ?? null)
            }
          }}
        >
          <div className="doc-modal-head">
            <div>
              <h2 id="doc-composer-title">{composerTab === 'file' ? 'Add document' : 'Add link'}</h2>
              <p>Adding to {workspace.name}</p>
            </div>
            <button className="doc-close" type="button" aria-label="Close" onClick={() => setComposerOpen(false)}>
              ×
            </button>
          </div>
          <div className="doc-tabs" role="tablist" aria-label="How to add">
            <button
              type="button"
              role="tab"
              aria-selected={composerTab === 'file'}
              onClick={() => {
                setComposerTab('file')
                setFormError('')
              }}
            >
              <img src="/upload0.svg" alt="" width={14} height={14} />
              Upload file
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={composerTab === 'link'}
              onClick={() => {
                setComposerTab('link')
                setFormError('')
              }}
            >
              <img src="/globe0.svg" alt="" width={14} height={14} />
              Add link
            </button>
          </div>
          <div className="doc-modal-grid">
            {composerTab === 'file' ? (
              <FileField file={file} progress={uploadProgress} onChoose={chooseFile} />
            ) : (
              <LinkField
                url={linkUrl}
                info={linkInfo}
                onChange={(value) => {
                  setLinkUrl(value)
                  setFormError('')
                  const detected = describeLink(value)
                  if (detected && !nameEdited) {
                    setDocName(detected.suggestedName)
                  }
                }}
              />
            )}
            <div className="doc-modal-fields">
              <label className="field">
                <span>
                  {composerTab === 'file' ? 'Document name' : 'Link name'} <span aria-hidden="true">*</span>
                </span>
                <input
                  value={docName}
                  required
                  onChange={(event) => {
                    setDocName(event.target.value)
                    setNameEdited(true)
                    setFormError('')
                  }}
                />
                <span className="field-hint">
                  {composerTab === 'file'
                    ? 'Name filled from the file. You can rename it.'
                    : 'Name filled from the link. You can rename it.'}
                </span>
              </label>
              <label className="field">
                Description (optional)
                <input
                  value={description}
                  placeholder="What is this file for?"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>
          </div>
          {formError ? <p className="form-error">{formError}</p> : null}
          <div className="doc-modal-foot">
            <label className="doc-notify">
              <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
              Notify workspace members
            </label>
            <div className="doc-modal-actions">
              <button className="button-light docs-secondary" type="button" onClick={() => setComposerOpen(false)}>
                Cancel
              </button>
              <button className="button-solid docs-primary" type="submit">
                {composerTab === 'file' ? 'Add to workspace' : 'Add link'}
              </button>
            </div>
          </div>
        </form>
      </dialog>

      <dialog ref={previewRef} className="doc-modal doc-preview" aria-labelledby="doc-preview-title" onClose={() => setPreview(null)}>
        {preview ? (
          <div className="doc-modal-body">
            <div className="doc-modal-head">
              <div>
                <p className="eyebrow muted">{KIND_LABEL[preview.kind]}</p>
                <h2 id="doc-preview-title">{preview.name}</h2>
              </div>
              <button className="doc-close" type="button" aria-label="Close" onClick={() => setPreview(null)}>
                ×
              </button>
            </div>
            <p className="doc-preview-meta">
              {preview.extension} · {preview.sizeLabel} · {shortName(preview.ownerName)} · Added {formatDocDate(preview.createdAt)}
            </p>
            <p>{preview.description || 'No description added.'}</p>
            {preview.href ? (
              <a className="button-solid docs-primary doc-open-link" href={preview.href} target="_blank" rel="noreferrer">
                Open link
              </a>
            ) : null}
          </div>
        ) : null}
      </dialog>

      {toast ? (
        <div className="doc-toast" role="status">
          <span className="doc-toast-mark" aria-hidden="true">
            ✓
          </span>
          <span>
            <strong>{toast.kind === 'link' ? 'Link added' : 'Document added'}</strong>
            <span>{toast.kind === 'link' ? toast.name : `${toast.name}.${toast.extension}`}</span>
          </span>
          <button type="button" onClick={() => reveal(toast)}>
            Open
          </button>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </section>
  )
}

function FileField({
  file,
  progress,
  onChoose,
}: {
  file: File | null
  progress: number
  onChoose: (file: File | null) => void
}) {
  const inputId = useId()
  return (
    <div className="field">
      <span>
        File <span aria-hidden="true">*</span>
      </span>
      {file ? (
        <div className="doc-file-chip">
          <img src={KIND_ICON[kindFromExtension(extensionOf(file.name))]} alt="" width={16} height={16} />
          <span>
            <strong>{file.name}</strong>
            <span>
              {formatBytes(file.size)} · {progress >= 100 ? 'Uploaded' : `Uploading ${progress}%`}
            </span>
            <span className="doc-progress" aria-hidden="true">
              <span style={{ width: `${Math.min(progress, 100)}%` }} />
            </span>
          </span>
          <button type="button" aria-label="Remove file" onClick={() => onChoose(null)}>
            ×
          </button>
        </div>
      ) : (
        <label className="doc-file-drop" htmlFor={inputId}>
          <img src="/upload0.svg" alt="" width={16} height={16} />
          Upload file
          <span>Or drop another file · PDF, DOCX, PPTX, PNG up to 50 MB</span>
        </label>
      )}
      <input
        id={inputId}
        className="visually-hidden"
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp"
        onChange={(event) => {
          onChoose(event.target.files?.[0] ?? null)
          event.target.value = ''
        }}
      />
    </div>
  )
}

function LinkField({
  url,
  info,
  onChange,
}: {
  url: string
  info: ReturnType<typeof describeLink>
  onChange: (value: string) => void
}) {
  return (
    <div className="field">
      <label htmlFor="doc-link-url">
        Link URL <span aria-hidden="true">*</span>
      </label>
      <input
        id="doc-link-url"
        type="url"
        inputMode="url"
        placeholder="https://"
        value={url}
        onChange={(event) => onChange(event.target.value)}
      />
      {info ? (
        <div className="doc-link-detected">
          <span aria-hidden="true">{info.title.slice(0, 1)}</span>
          <span>
            <strong>{info.title}</strong>
            <span>{info.detail}</span>
          </span>
        </div>
      ) : (
        <span className="field-hint">Works with Miro, Figma, Google Drive, Notion or any https:// link.</span>
      )}
    </div>
  )
}

function DocumentRow({
  item,
  highlighted,
  onOpen,
  onRemove,
}: {
  item: WorkspaceDocument
  highlighted: boolean
  onOpen: () => void
  onRemove: () => void
}) {
  return (
    <tr id={`document-${item.id}`} className={highlighted ? 'is-highlighted' : undefined}>
      <td>
        <button className="doc-name" type="button" onClick={onOpen}>
          <img src={KIND_ICON[item.kind]} alt="" width={18} height={18} />
          <span>
            <strong>{item.name}</strong>
            <span>
              {item.extension} · {item.sizeLabel}
            </span>
          </span>
        </button>
      </td>
      <td>
        <span className="tag">{KIND_LABEL[item.kind]}</span>
      </td>
      <td>
        <span className="doc-owner">
          <span className="person-avatar" aria-hidden="true">
            {item.ownerInitials}
          </span>
          {shortName(item.ownerName)}
        </span>
      </td>
      <td>{formatDocDate(item.updatedAt)}</td>
      <td>
        <div className="doc-row-actions">
          <button className="button-light docs-secondary docs-open" type="button" onClick={onOpen}>
            Open
          </button>
          <Menu
            className="docs-more"
            menuClassName="menu-right"
            ariaLabel={`More actions for ${item.name}`}
            label={<span aria-hidden="true">···</span>}
          >
            <button type="button" role="menuitem" onClick={onOpen}>
              Open
            </button>
            {item.href ? (
              <a role="menuitem" href={item.href} target="_blank" rel="noreferrer">
                Open link
              </a>
            ) : null}
            <button type="button" role="menuitem" onClick={onRemove}>
              Remove
            </button>
          </Menu>
        </div>
      </td>
    </tr>
  )
}

export default DocumentsPage

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearch, type SearchHit } from '../data/search'

const KIND_LABEL: Record<SearchHit['kind'], string> = {
  profile: 'Person',
  meeting: 'Meeting',
  document: 'Document',
  discussion: 'Discussion',
}

function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [draft, setDraft] = useState(query)
  const results = useSearch(query)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = draft.trim()
    setParams(next ? { q: next } : {})
  }

  const total = results.people.length + results.workspace.length

  return (
    <section className="profile-screen">
      <header className="doc-library-head">
        <div className="title-row">
          <h1>Search</h1>
          {query ? <span className="count-pill">{total}</span> : null}
        </div>
        <p className="description">Find people, meetings, documents, and discussions in this demo.</p>
      </header>

      <form className="profile-search profile-search-wide" onSubmit={onSubmit}>
        <img src="/search1.png" alt="" width={14} height={14} />
        <label className="visually-hidden" htmlFor="site-search-page">
          Search
        </label>
        <input
          id="site-search-page"
          type="search"
          value={draft}
          placeholder="Name, email, user key, meeting, or document"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="button-solid" type="submit">
          Search
        </button>
      </form>

      {!query ? <p className="profile-empty">Enter a name, email, or user key to find a person.</p> : null}

      {query ? (
        <>
          <ResultGroup title="People" hits={results.people} empty="No people match that search." />
          <ResultGroup title="Meetings, documents, and discussions" hits={results.workspace} empty="Nothing else matches." />
        </>
      ) : null}
    </section>
  )
}

function ResultGroup({ title, hits, empty }: { title: string; hits: SearchHit[]; empty: string }) {
  return (
    <section className="panel profile-section">
      <h2>{title}</h2>
      {hits.length === 0 ? (
        <p className="profile-empty">{empty}</p>
      ) : (
        <ul className="notice-list">
          {hits.map((hit) => (
            <li key={hit.id}>
              <Link className="notice-row" to={hit.href}>
                <span className="tag">{KIND_LABEL[hit.kind]}</span>
                <span>
                  <strong>{hit.title}</strong>
                  <span>{hit.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchPage

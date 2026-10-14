import { useState } from 'react'
import './App.css'

function App() {
  // Controls whether the workspace navigation is open on mobile.
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div id="top" className="app">
      {/* Allows keyboard users to bypass repeated navigation. */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Site branding and mobile navigation control. */}
      <header className="site-header">
        <a className="brand" href="#top">
          Circle Weaver
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="workspace-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </header>

      <div className="workspace-layout">
        {/* Responsive workspace navigation. */}
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <p className="sidebar-title">Workspace</p>

          <nav
            id="workspace-navigation"
            aria-label="Workspace navigation"
            onClick={() => setMenuOpen(false)}
          >
            <a href="#workspace-overview">Overview</a>
            <a href="#discussions">Discussions</a>
            <a href="#goals">Goals</a>
            <a href="#meetings">Meetings</a>
            <a href="#about">About</a>
          </nav>
        </aside>

        {/* Primary page content. */}
        <main id="main-content" className="main-content">
          <section className="hero" aria-labelledby="page-title">
            <p className="eyebrow">Collaborative workspaces</p>
            <h1 id="page-title">Keep your team’s work connected</h1>
            <p>
              Organize discussions, goals, meetings, and shared documents in
              one accessible workspace.
            </p>
            <a className="primary-action" href="#workspace-overview">
              Explore the workspace
            </a>
          </section>

          <section
            id="workspace-overview"
            className="workspace-overview"
            aria-labelledby="overview-title"
          >
            <h2 id="overview-title">Workspace overview</h2>

            <div className="feature-grid">
              <article id="discussions">
                <h3>Discussions</h3>
                <p>Develop ideas and preserve important team decisions.</p>
              </article>

              <article id="goals">
                <h3>Goals</h3>
                <p>Track responsibilities, progress, and upcoming work.</p>
              </article>

              <article id="meetings">
                <h3>Meetings</h3>
                <p>Plan agendas and keep meeting outcomes connected.</p>
              </article>
            </div>
          </section>

          <section id="about" className="about" aria-labelledby="about-title">
            <h2 id="about-title">About Circle Weaver</h2>
            <p>This application helps teams collaborate effectively.</p>
          </section>
        </main>
      </div>

      {/* Site-wide footer information. */}
      <footer>
        <p>&copy; {new Date().getFullYear()} Circle Weaver</p>
      </footer>
    </div>
  )
}

export default App
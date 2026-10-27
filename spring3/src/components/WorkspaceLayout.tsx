import { useState } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

type WorkspaceLayoutProps = {
  children: ReactNode
}

function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div id="top" className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar
        menuOpen={menuOpen}
        closeMenu={() => setMenuOpen(false)}
      />
      <div className="workspace">
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
        <main id="main-content" className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default WorkspaceLayout

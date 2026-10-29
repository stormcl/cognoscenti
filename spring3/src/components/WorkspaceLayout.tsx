import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

type WorkspaceLayoutProps = {
  children: ReactNode
}

const SIDEBAR_KEY = 'weaver-sidebar-collapsed'

function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <div id="top" className={`app${collapsed ? ' sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="app-body">
        <Sidebar
          menuOpen={menuOpen}
          collapsed={collapsed}
          closeMenu={() => setMenuOpen(false)}
          onToggleCollapsed={() => setCollapsed((isCollapsed) => !isCollapsed)}
        />
        <div className="workspace">
          <main id="main-content" className="main-content">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default WorkspaceLayout

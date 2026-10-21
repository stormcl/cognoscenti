import { useState } from 'react'
import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

// This tells TypeScript that WorkspaceLayout can recieve React content between opening and closing tags
type WorkspaceLayoutProps = {
    children: ReactNode
}

function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div id="top" className="app">
            {/* Assessibility: skip repeated navigation */}
            <a className="skip-link" href="#main-content">
                Skip to main content
            </a>
            {/* Shared site header */}
            <Header 
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />

            <div className="workspace-layout">
                 {/* Shared workspace navigation */}
                 <Sidebar
                 menuOpen={menuOpen}
                 closeMenu={() => setMenuOpen(false)}
                />

                {/* Content changes depending on the page */}
                <main 
                    id="main-content"
                    className="main-content">
                        {children}
                </main>
            </div>

            <Footer />
        </div>
    )
}

export default WorkspaceLayout
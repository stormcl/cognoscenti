type SidebarProps = {
    menuOpen: boolean
    closeMenu: () => void
}

function Sidebar({ menuOpen, closeMenu } : SidebarProps) {
    return (
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
            <p className="sidebar-title">Workspace</p>

            <nav
                id="workspace-navigation"
                aria-label="Workspace navigation"
                onClick={closeMenu}
                >
                    <a href="#workspace-overview">Overview</a>
                    <a href="#discussions">Discussions</a>
                    <a href="#goals">Goals</a>
                    <a href="#meetings">Meetings</a>
                    <a href="#about">About</a>

                    <a href="#account" className="mobile-account-link">
                        Account
                    </a>
            </nav>
        </aside>
    )
}

export default Sidebar;
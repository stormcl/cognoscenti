type SidebarProps = {
    menuOpen: boolean
    closeMenu: () => void
}

type NavItem = {
    href: string
    label: string
    icon?: string
    current?: boolean
    trailing?: string
}

const globalLinks: NavItem[] = [
    { href: '#top', label: 'Home', icon: '/house0.svg' },
    { href: '#workspaces', label: 'Workspaces', icon: '/layers0.svg', trailing: '/chevron-down0.svg' },
    { href: '#tasks', label: 'Tasks', icon: '/square-check0.svg' },
    { href: '#sites', label: 'Sites', icon: '/globe0.svg' },
]

const workspaceLinks: NavItem[] = [
    { href: '#front-page', label: 'Front page', icon: '/dash0.svg', current: true },
    { href: '#meetings', label: 'Meetings', icon: '/calendar0.svg' },
    { href: '#discussions', label: 'Discussions', icon: '/msg0.svg' },
    { href: '#documents', label: 'Documents', icon: '/file0.svg' },
    { href: '#action-items', label: 'Action items', icon: '/check0.svg' },
    { href: '#notes', label: 'Notes', icon: '/pen0.svg' },
]

function Sidebar({ menuOpen, closeMenu }: SidebarProps) {
    return (
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
            <div className="primary-navigation">
                <a className="brand" href="#top">
                    <img className="brand-logo" src="/image-30.png" alt="" width={32} height={32} />
                    <span>Circle Weaver</span>
                </a>

                <nav aria-label="Global navigation" onClick={closeMenu}>
                    {globalLinks.map((item) => (
                        <a key={item.label} href={item.href} className="nav-item">
                            {item.icon ? <img src={item.icon} alt="" width={18} height={18} /> : null}
                            <span>{item.label}</span>
                            {item.trailing ? <img className="nav-chevron" src={item.trailing} alt="" width={14} height={14} /> : null}
                        </a>
                    ))}
                </nav>

                <nav
                    id="workspace-navigation"
                    aria-label="Workspace navigation"
                    onClick={closeMenu}
                >
                    <p className="section-label">Workspace</p>

                    <button className="workspace-switcher" type="button">
                        <span className="workspace-avatar" aria-hidden="true">UX</span>
                        <span className="workspace-name">
                            <strong>UX Primary Group</strong>
                            <span>Fall 2026 Agency</span>
                        </span>
                        <img src="/ud0.svg" alt="" width={14} height={14} />
                    </button>

                    {workspaceLinks.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`nav-item${item.current ? ' current' : ''}`}
                            aria-current={item.current ? 'page' : undefined}
                        >
                            {item.icon ? <img src={item.icon} alt="" width={18} height={18} /> : null}
                            <span>{item.label}</span>
                            {item.current ? <span className="current-dot" aria-hidden="true" /> : null}
                        </a>
                    ))}
                </nav>

                <button className="create-button" type="button">
                    <img src="/plus0.svg" alt="" width={14} height={14} />
                    Create
                    <img src="/chevron-down0.svg" alt="" width={14} height={14} />
                </button>
            </div>

            <div className="account-and-support">
                <a className="nav-item" href="#help" onClick={closeMenu}>
                    <img src="/circle-help0.svg" alt="" width={18} height={18} />
                    <span>Help &amp; support</span>
                </a>
                <a className="nav-item" href="#account" onClick={closeMenu}>
                    <span>Settings</span>
                </a>
                <button className="account" type="button">
                    <span className="avatar" aria-hidden="true">U</span>
                    <span className="account-details">
                        <strong>Usename</strong>
                        <span>Personal account</span>
                    </span>
                    <img src="/chevrons-up-down0.svg" alt="" width={14} height={14} />
                </button>
            </div>
        </aside>
    )
}

export default Sidebar;

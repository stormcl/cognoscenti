import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

type SidebarProps = {
  menuOpen: boolean
  collapsed: boolean
  closeMenu: () => void
  onToggleCollapsed: () => void
}

type NavItem = {
  to: string
  label: string
  icon: string
  invert?: boolean
  end?: boolean
  count?: number
}

const dashboardLinks: NavItem[] = [
  { to: '/', label: 'Home', icon: '/house0.svg', end: true },
]

const circleLinks: NavItem[] = [
  { to: '/meetings', label: 'Meetings', icon: '/slides0.svg' },
  { to: '/tasks', label: 'To-do Tasks', icon: '/square-check0.svg', count: 1 },
  { to: '/discussions', label: 'Discussions', icon: '/msg0.svg', count: 35 },
]

const organizationLinks: NavItem[] = [
  { to: '/notifications', label: 'Notifications', icon: '/bell0.svg', invert: true, count: 35 },
  { to: '/emails', label: 'Emails', icon: '/mail0.svg', count: 2 },
  { to: '/documents', label: 'Documents', icon: '/file0.svg' },
]

const childWorkspaces = [
  { to: '/workspaces', code: 'UM', name: 'UX Meeting Module', members: 9 },
  { to: '/workspaces', code: 'UA', name: 'UX Admin Pages', members: 0 },
]

function navClassName(isActive: boolean) {
  return `nav-item${isActive ? ' current' : ''}`
}

function Sidebar({ menuOpen, collapsed, closeMenu, onToggleCollapsed }: SidebarProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false)

  function onSwitcherClick() {
    if (collapsed) {
      onToggleCollapsed()
      setSwitcherOpen(true)
      return
    }
    setSwitcherOpen((open) => !open)
  }

  return (
    <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-user">
          <strong>Shreya Chadha</strong>
          <span>Steward</span>
        </div>
        <button
          className="collapse-sidebar"
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="workspace-navigation"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelIcon collapsed={collapsed} />
        </button>
      </div>

      <div className="primary-navigation">
        <nav aria-label="Dashboard" onClick={closeMenu}>
          <p className="section-label">Dashboard</p>
          {dashboardLinks.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}

          <div className={`workspace-switcher-block${switcherOpen ? ' is-open' : ''}`}>
            <button
              className="workspace-switcher"
              type="button"
              aria-expanded={switcherOpen}
              aria-label="UX Primary Group"
              onClick={onSwitcherClick}
            >
              <span className="workspace-avatar" aria-hidden="true">
                UX
              </span>
              <span className="workspace-name">
                <strong>UX Primary Group</strong>
                <span>
                  <img src="/users0.svg" alt="" width={12} height={12} />
                  14 members
                </span>
              </span>
              <img className="switcher-chevron" src="/chevron-down0.svg" alt="" width={14} height={14} />
            </button>

            {switcherOpen && !collapsed ? (
              <div className="workspace-children">
                {childWorkspaces.map((child) => (
                  <Link
                    key={child.code}
                    className="workspace-child"
                    to={child.to}
                    onClick={closeMenu}
                  >
                    <span className="workspace-avatar sm" aria-hidden="true">
                      {child.code}
                    </span>
                    <span className="workspace-name">
                      <strong>{child.name}</strong>
                      {child.members > 0 ? (
                        <span>
                          <img src="/users0.svg" alt="" width={12} height={12} />
                          {child.members} members
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
                <Link className="manage-workspaces" to="/workspaces" onClick={closeMenu}>
                  Manage Workspaces
                </Link>
              </div>
            ) : null}
          </div>

          {circleLinks.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </nav>

        <nav
          id="workspace-navigation"
          aria-label="Organization"
          onClick={closeMenu}
        >
          <p className="section-label">Organization</p>
          {organizationLinks.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </nav>
      </div>

      <Link className="ask-weaver" to="/ask" onClick={closeMenu}>
        <img src="/sparkle0.svg" alt="" width={16} height={16} />
        <span>Ask Weaver</span>
      </Link>
    </aside>
  )
}

function NavRow({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => navClassName(isActive)}
      aria-label={item.label}
    >
      <img
        className={item.invert ? 'icon-on-dark' : undefined}
        src={item.icon}
        alt=""
        width={18}
        height={18}
      />
      <span>{item.label}</span>
      {item.count != null ? <span className="nav-count">{item.count}</span> : null}
    </NavLink>
  )
}

function PanelIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.25" y="3" width="13.5" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3v12" stroke="currentColor" strokeWidth="1.5" />
      {collapsed ? (
        <path d="M10 7.25L12.25 9L10 10.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12.25 7.25L10 9L12.25 10.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default Sidebar

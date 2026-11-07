import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { documentsPath } from '../data/documents'
import { directoryPath } from '../data/profiles'
import { switcherTree, workspaceFromLocation, type SwitcherEntry } from '../data/workspaces'
import Menu from './Menu'

const createItems = [
  {
    to: '/meetings/new',
    label: 'Meeting',
    detail: 'Schedule with agenda & Zoom link',
    icon: '/calendar0.svg',
  },
  {
    to: '/discussions?new=1',
    label: 'Discussion',
    detail: 'Start a topic for the group',
    icon: '/msg0.svg',
  },
  {
    to: '/documents',
    label: 'Document',
    detail: 'Upload or link a file',
    icon: '/file0.svg',
  },
  {
    to: '/action-items',
    label: 'Action item',
    detail: 'Assign a task with a due date',
    icon: '/check0.svg',
  },
  {
    to: '/notes',
    label: 'Note',
    detail: 'Private or shared notes',
    icon: '/pen0.svg',
  },
]

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

const circleLinks: NavItem[] = [
  { to: '/meetings', label: 'Meetings', icon: '/slides0.svg' },
  { to: '/tasks', label: 'To-do Tasks', icon: '/square-check0.svg', count: 1 },
  { to: '/discussions', label: 'Discussions', icon: '/msg0.svg', count: 35 },
]

const organizationLinks: NavItem[] = [
  { to: '/notifications', label: 'Notifications', icon: '/bell0.svg', count: 35 },
  { to: directoryPath(), label: 'Profiles', icon: '/users1.svg', end: true },
  { to: '/emails', label: 'Emails', icon: '/mail0.svg', count: 2 },
  { to: '/documents', label: 'Documents', icon: '/file0.svg' },
]

function navClassName(isActive: boolean) {
  return `nav-item${isActive ? ' current' : ''}`
}

function Sidebar({ menuOpen, collapsed, closeMenu, onToggleCollapsed }: SidebarProps) {
  const location = useLocation()
  const workspace = workspaceFromLocation(location.pathname, location.search)
  const tree = switcherTree(workspace)
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
        <Link className="sidebar-user" to="/profile">
          <strong>Users Name</strong>
          <span>Steward</span>
        </Link>
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
        <Menu
          className="create-button"
          menuClassName="create-menu"
          ariaLabel="Create"
          label={
            <>
              <img src="/plus0.svg" alt="" width={14} height={14} />
              <span>Create</span>
              <img className="create-chevron" src="/chevron-down0.svg" alt="" width={14} height={14} />
            </>
          }
        >
          <p className="create-menu-heading">Create in {workspace.name}</p>
          {createItems.map((item) => (
            <Link
              key={item.label}
              className="create-option"
              to={
                item.label === 'Meeting'
                  ? `/meetings/new?workspace=${workspace.id}`
                  : item.label === 'Document'
                    ? documentsPath(workspace.id, 'file')
                    : item.to
              }
              role="menuitem"
              onClick={closeMenu}
            >
              <span className="icon-tile">
                <img src={item.icon} alt="" width={18} height={18} />
              </span>
              <span className="create-option-text">
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </span>
            </Link>
          ))}
        </Menu>

        <nav aria-label="My Weaver" onClick={closeMenu}>
          <p className="section-label">My Weaver</p>
          <NavRow
            item={{ to: workspace.path, label: 'Home', icon: '/house0.svg', end: true }}
          />

          <div className={`workspace-switcher-block${switcherOpen ? ' is-open' : ''}`}>
            <button
              className="workspace-switcher"
              type="button"
              aria-expanded={switcherOpen}
              aria-label={workspace.name}
              onClick={onSwitcherClick}
            >
              <span className="workspace-avatar" aria-hidden="true">
                {workspace.code}
              </span>
              <span className="workspace-name">
                <strong>{workspace.name}</strong>
                <span>
                  <img src="/users0.svg" alt="" width={12} height={12} />
                  {workspace.members} members
                </span>
              </span>
              <img className="switcher-chevron" src="/chevron-down0.svg" alt="" width={14} height={14} />
            </button>

            {switcherOpen && !collapsed ? (
              <div className="workspace-children">
                <SwitcherRow entry={tree.parent} onClick={closeMenu} />
                {tree.teams.map((entry) => (
                  <SwitcherRow key={entry.code} entry={entry} onClick={closeMenu} />
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
            <NavRow
              key={item.label}
              item={item.label === 'Documents' ? { ...item, to: documentsPath(workspace.id) } : item}
            />
          ))}
        </nav>
      </div>

      <Link className="ask-weaver" to="/ask" onClick={closeMenu} aria-label="Ask Weaver">
        <img className="ask-weaver-label" src="/ask-weaver.svg" alt="Ask Weaver" width={135} height={40} />
        <img className="ask-weaver-mark" src="/weaver-mark-scribe.svg" alt="" width={40} height={40} />
      </Link>
    </aside>
  )
}

function SwitcherRow({
  entry,
  onClick,
}: {
  entry: SwitcherEntry
  onClick: () => void
}) {
  return (
    <Link
      className={`workspace-child is-${entry.kind}${entry.current ? ' is-current' : ''}`}
      to={entry.path}
      aria-current={entry.current ? 'page' : undefined}
      onClick={onClick}
    >
      <span className="workspace-avatar sm" aria-hidden="true">
        {entry.code}
      </span>
      <span className="workspace-name">
        <strong>{entry.name}</strong>
        {entry.members > 0 ? (
          <span>
            <img src="/users0.svg" alt="" width={12} height={12} />
            {entry.members} members
          </span>
        ) : null}
      </span>
    </Link>
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
      {item.count != null ? (
        <span className={`nav-count${item.to === '/notifications' ? ' is-notify' : ''}`}>{item.count}</span>
      ) : null}
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

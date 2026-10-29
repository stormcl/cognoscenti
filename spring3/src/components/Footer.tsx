import { useRef } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const homeLinks = [
  { to: '/workspaces', label: 'Workspaces' },
  { to: '/meetings', label: 'Meetings' },
  { to: '/tasks', label: 'To-do Tasks' },
  { to: '/discussions', label: 'Discussions' },
]

const organizationLinks = [
  { to: '/notifications', label: 'Notifications' },
  { to: '/emails', label: 'Emails' },
  { to: '/documents', label: 'Documents' },
]

const adminLinks = [
  { to: '/sites', label: 'My Sites' },
  { to: '/help', label: 'Help' },
  { to: '/settings', label: 'Settings' },
]

function Footer() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = inputRef.current?.value.trim() ?? ''
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <footer>
      <div className="footer-top">
        <Link className="footer-brand" to="/">
          <span className="footer-mark" aria-hidden="true" />
          Circle Weaver
        </Link>
        <form className="footer-search" onSubmit={onSearch}>
          <img src="/search1.png" alt="" width={14} height={14} />
          <label className="visually-hidden" htmlFor="footer-search">
            Search workspaces, documents
          </label>
          <input
            id="footer-search"
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Search workspaces, documents.."
          />
        </form>
      </div>

      <div className="footer-columns">
        <FooterColumn title="Home" links={homeLinks} />
        <FooterColumn title="Organization" links={organizationLinks} />
        <FooterColumn title="Administration" links={adminLinks} />
      </div>

      <p className="footer-legal">
        © {new Date().getFullYear()} Weaver. All rights reserved.{' '}
        <Link to="/settings">Privacy Settings</Link>
        {' | '}
        <Link to="/privacy">Privacy Notice</Link>
        {' | '}
        <Link to="/terms">Terms of Service</Link>
      </p>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <nav aria-label={title}>
      <p>{title}</p>
      {links.map((link) => (
        <Link key={link.label} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export default Footer

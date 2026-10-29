import { useEffect, useRef } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Menu from './Menu'

type HeaderProps = {
  menuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
}

function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = inputRef.current?.value.trim() ?? ''
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <img className="brand-logo" src="/image-30.png" alt="" width={22} height={22} />
        Weaver
      </Link>

      <form className="header-search" onSubmit={onSearch}>
        <img src="/search1.png" alt="" width={14} height={14} />
        <label className="visually-hidden" htmlFor="site-search">
          Search workspaces, documents, people
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Search workspaces, documents, people..."
        />
      </form>

      <div className="header-tools">
        <Link className="icon-button" to="/help" aria-label="Help">
          <img src="/circle-help0.svg" alt="" width={18} height={18} />
        </Link>
        <Link className="icon-button" to="/notifications" aria-label="Notifications">
          <img src="/bell0.svg" alt="" width={18} height={18} />
        </Link>
        <span className="header-divider" aria-hidden="true" />
        <Menu
          className="account-menu"
          menuClassName="menu-right"
          ariaLabel="Account"
          label={
            <>
              <span className="avatar" aria-hidden="true">SC</span>
              <span className="account-name">Shreya Chadha</span>
              <img src="/chevron-down1.svg" alt="" width={14} height={14} />
            </>
          }
        >
          <Link to="/settings" role="menuitem">
            Settings
          </Link>
          <Link to="/help" role="menuitem">
            Help
          </Link>
        </Menu>
      </div>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="workspace-navigation"
      >
        <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
      </button>
    </header>
  )
}

export default Header
